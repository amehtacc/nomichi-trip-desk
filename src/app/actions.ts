"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import {
  enquirySchema,
  initialActionState,
  leadStatusSchema,
  noteSchema,
  ownerSchema,
  tripSchema,
  type ActionState,
} from "@/lib/schemas"
import { hasSupabaseConfig } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/data"

function formValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function formFile(formData: FormData, key: string) {
  const value = formData.get(key)
  return value instanceof File && value.size > 0 ? value : null
}

function errorState(error: unknown): ActionState {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      fieldErrors: error.flatten().fieldErrors,
    }
  }

  if (error instanceof Error) {
    return {
      ok: false,
      message:
        "We could not save this change right now. Please check the details and try again.",
    }
  }

  return { ok: false, message: "Something went wrong. Please try again." }
}

function requireSupabaseState(): ActionState | null {
  if (hasSupabaseConfig()) return null

  return {
    ok: false,
    message:
      "The project database is not connected yet. Add the local connection details, then try again.",
  }
}

export async function createEnquiry(
  prevState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void prevState

  const setupError = requireSupabaseState()
  if (setupError) return setupError

  try {
    const payload = enquirySchema.parse({
      name: formValue(formData, "name"),
      phone: formValue(formData, "phone"),
      email: formValue(formData, "email"),
      trip_id: formValue(formData, "trip_id"),
      group_type: formValue(formData, "group_type"),
      preferred_month: formValue(formData, "preferred_month"),
      expectation: formValue(formData, "expectation"),
    })

    const supabase = await createClient()
    const { error } = await supabase.from("leads").insert({
      ...payload,
      status: "NEW",
      owner_id: null,
    })

    if (error) throw new Error(error.message)

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/leads")
    revalidatePath("/admin/dashboard")

    return {
      ok: true,
      message:
        "Thanks. Your enquiry has reached the Nomichi team. They will read it with care.",
    }
  } catch (error) {
    return errorState(error)
  }
}

export async function saveTrip(formData: FormData) {
  const user = await requireUser()

  const payload = tripSchema.parse({
    id: formValue(formData, "id") || undefined,
    name: formValue(formData, "name"),
    destination: formValue(formData, "destination"),
    start_date: formValue(formData, "start_date"),
    end_date: formValue(formData, "end_date"),
    price: formValue(formData, "price"),
    total_seats: formValue(formData, "total_seats"),
    status: formValue(formData, "status"),
    description: formValue(formData, "description"),
    image_url: formValue(formData, "image_url"),
  })

  const supabase = await createClient()
  const tripImage = formFile(formData, "image")
  const uploadedImageUrl = tripImage
    ? await uploadTripImage(supabase, tripImage, user.id)
    : null
  const { id, image_url, ...trip } = payload
  const tripRecord = {
    ...trip,
    image_url: uploadedImageUrl ?? (image_url || null),
  }
  const query = id
    ? supabase.from("trips").update(tripRecord).eq("id", id)
    : supabase.from("trips").insert(tripRecord)

  const { error } = await query
  if (error) throw new Error(error.message)

  revalidatePath("/")
  revalidatePath("/admin/trips")
  redirect("/admin/trips")
}

async function uploadTripImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  userId: string
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Upload an image file for the trip.")
  }

  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Trip image must be smaller than 4 MB.")
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from("trip-images")
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from("trip-images").getPublicUrl(path)
  return data.publicUrl
}

export async function updateLeadStatus(payload: {
  lead_id: string
  status: string
}): Promise<ActionState> {
  await requireUser()

  try {
    const value = leadStatusSchema.parse(payload)
    const supabase = await createClient()
    const { error } = await supabase
      .from("leads")
      .update({ status: value.status })
      .eq("id", value.lead_id)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/leads")
    revalidatePath(`/admin/leads/${value.lead_id}`)
    revalidatePath("/admin/dashboard")

    return { ok: true, message: "Status updated." }
  } catch (error) {
    return errorState(error)
  }
}

export async function updateLeadOwner(payload: {
  lead_id: string
  owner_id: string | null
}): Promise<ActionState> {
  await requireUser()

  try {
    const value = ownerSchema.parse(payload)
    const supabase = await createClient()
    const { error } = await supabase
      .from("leads")
      .update({ owner_id: value.owner_id })
      .eq("id", value.lead_id)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/leads")
    revalidatePath(`/admin/leads/${value.lead_id}`)

    return { ok: true, message: "Owner updated." }
  } catch (error) {
    return errorState(error)
  }
}

export async function addNote(
  prevState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  void prevState

  const user = await requireUser()

  try {
    const payload = noteSchema.parse({
      lead_id: formValue(formData, "lead_id"),
      content: formValue(formData, "content"),
    })

    const supabase = await createClient()
    const { error } = await supabase.from("notes").insert({
      lead_id: payload.lead_id,
      content: payload.content,
      author_id: user.id,
    })

    if (error) throw new Error(error.message)

    revalidatePath(`/admin/leads/${payload.lead_id}`)
    return { ok: true, message: "Note saved." }
  } catch (error) {
    return errorState(error)
  }
}

export async function dismissNotification(
  notificationId: string
): Promise<ActionState> {
  const user = await requireUser()

  try {
    const value = z.string().min(1).max(160).parse(notificationId)
    const supabase = await createClient()
    const { error } = await supabase
      .from("notifications")
      .update({ dismissed: true })
      .eq("user_id", user.id)
      .eq("notification_id", value)

    if (error) throw new Error(error.message)

    revalidatePath("/admin")
    revalidatePath("/admin/dashboard")
    return { ok: true, message: "Notification dismissed." }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("notifications")
    ) {
      return {
        ok: false,
        message:
          "Notifications are not ready yet. Run the latest database setup, then try again.",
      }
    }

    return errorState(error)
  }
}

export async function logout() {
  if (hasSupabaseConfig()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  redirect("/login")
}
