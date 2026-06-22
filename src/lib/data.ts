import { unstable_noStore as noStore } from "next/cache"
import { redirect } from "next/navigation"
import {
  demoLeads,
  demoNotes,
  demoProfiles,
  demoTrips,
} from "@/lib/demo-data"
import { hasSupabaseConfig } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import type {
  LeadStatus,
  LeadWithTripOwner,
  NoteWithAuthor,
  NotificationItem,
  Profile,
  Trip,
} from "@/lib/types"

export async function getCurrentUser() {
  if (!hasSupabaseConfig()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!hasSupabaseConfig()) {
    redirect("/login?reason=setup")
  }

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function getOpenTrips(): Promise<Trip[]> {
  noStore()

  if (!hasSupabaseConfig()) {
    return demoTrips.filter((trip) => trip.status === "OPEN")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("status", "OPEN")
    .order("start_date", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTrips(): Promise<Trip[]> {
  noStore()

  if (!hasSupabaseConfig()) return demoTrips

  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTrip(id: string): Promise<Trip | null> {
  noStore()

  if (!hasSupabaseConfig()) {
    return demoTrips.find((trip) => trip.id === id) ?? null
  }

  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function getProfiles(): Promise<Profile[]> {
  noStore()

  if (!hasSupabaseConfig()) return demoProfiles

  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getLeads(filters?: {
  query?: string
  status?: string
  trip?: string
  owner?: string
}): Promise<LeadWithTripOwner[]> {
  noStore()

  if (!hasSupabaseConfig()) {
    return demoLeads.filter((lead) => {
      const query = filters?.query?.toLowerCase()
      const matchesQuery =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query)
      const matchesStatus = !filters?.status || lead.status === filters.status
      const matchesTrip = !filters?.trip || lead.trip_id === filters.trip
      const matchesOwner = !filters?.owner || lead.owner_id === filters.owner
      return matchesQuery && matchesStatus && matchesTrip && matchesOwner
    })
  }

  await requireUser()
  const supabase = await createClient()
  let query = supabase
    .from("leads")
    .select("*, trips(id,name,destination,image_url), profiles(id,name,email)")
    .order("created_at", { ascending: false })

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.trip) query = query.eq("trip_id", filters.trip)
  if (filters?.owner) query = query.eq("owner_id", filters.owner)
  if (filters?.query) {
    const safeQuery = filters.query.replace(/[%_,]/g, "")
    query = query.or(
      `name.ilike.%${safeQuery}%,phone.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as LeadWithTripOwner[]
}

export async function getLead(id: string): Promise<LeadWithTripOwner | null> {
  noStore()

  if (!hasSupabaseConfig()) {
    return demoLeads.find((lead) => lead.id === id) ?? null
  }

  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("leads")
    .select("*, trips(id,name,destination,image_url), profiles(id,name,email)")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as LeadWithTripOwner | null
}

export async function getNotes(leadId: string): Promise<NoteWithAuthor[]> {
  noStore()

  if (!hasSupabaseConfig()) {
    return demoNotes.filter((note) => note.lead_id === leadId)
  }

  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notes")
    .select("*, profiles(id,name,email)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as NoteWithAuthor[]
}

export async function syncUserNotifications(
  userId: string,
  notifications: NotificationItem[]
): Promise<NotificationItem[]> {
  noStore()

  if (!hasSupabaseConfig()) return notifications

  await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("notification_id,title,body,href,dismissed,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    if (isMissingNotificationsTable(error.message)) return notifications
    throw new Error(error.message)
  }

  const storedNotifications = data ?? []
  const existing = new Map(
    storedNotifications.map((item) => [item.notification_id, item.dismissed])
  )
  const missingNotifications = notifications.filter(
    (notification) => !existing.has(notification.id)
  )

  if (missingNotifications.length > 0) {
    const { error: insertError } = await supabase.from("notifications").upsert(
      missingNotifications.map((notification) => ({
        user_id: userId,
        notification_id: notification.id,
        title: notification.title,
        body: notification.body,
        href: notification.href ?? null,
        dismissed: false,
      })),
      { onConflict: "user_id,notification_id", ignoreDuplicates: true }
    )

    if (insertError) {
      if (isMissingNotificationsTable(insertError.message)) return notifications
      throw new Error(insertError.message)
    }

    missingNotifications.forEach((notification) => {
      existing.set(notification.id, false)
    })
  }

  const generatedNotifications = notifications.filter(
    (notification) => !existing.get(notification.id)
  )
  const generatedIds = new Set(notifications.map((notification) => notification.id))
  const storedVisibleNotifications = storedNotifications
    .filter((notification) => !notification.dismissed)
    .filter((notification) => !generatedIds.has(notification.notification_id))
    .map((notification) => ({
      id: notification.notification_id,
      title: notification.title,
      body: notification.body,
      href: notification.href ?? undefined,
    }))

  return [...storedVisibleNotifications, ...generatedNotifications]
}

function isMissingNotificationsTable(message: string) {
  return (
    message.includes("notifications") &&
    (message.includes("schema cache") || message.includes("does not exist"))
  )
}

export async function getDashboardMetrics() {
  const [leads, trips] = await Promise.all([getLeads(), getTrips()])

  const byStatus = leads.reduce<Record<LeadStatus, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1
    return acc
  }, {} as Record<LeadStatus, number>)

  const byTrip = trips
    .map((trip) => ({
      trip,
      count: leads.filter((lead) => lead.trip_id === trip.id).length,
    }))
    .sort((a, b) => b.count - a.count)
  const nextLeads = leads
    .filter((lead) => ["NEW", "CONTACTED", "QUALIFIED"].includes(lead.status))
    .slice(0, 5)
  const recentLeads = leads.slice(0, 5)

  return {
    totalLeads: leads.length,
    byStatus,
    byTrip,
    openTrips: trips.filter((trip) => trip.status === "OPEN").length,
    unassignedLeads: leads.filter((lead) => !lead.owner_id).length,
    nextLeads,
    recentLeads,
  }
}
