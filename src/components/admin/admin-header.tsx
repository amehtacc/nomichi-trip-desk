import type { User } from "@supabase/supabase-js"
import { DashboardHeader } from "@/components/admin/dashboard-header"
import { syncUserNotifications } from "@/lib/data"

export async function AdminHeader({
  user,
  viewport,
}: {
  user: User
  viewport: "mobile" | "desktop"
}) {
  const notifications = await syncUserNotifications(user.id, [])

  return (
    <DashboardHeader
      notifications={notifications}
      profile={profileFromUser(user)}
      userId={user.id}
      viewport={viewport}
    />
  )
}

export function profileFromUser(user: User | null) {
  const metadata = user?.user_metadata as
    | { name?: string; full_name?: string }
    | undefined
  const name =
    metadata?.name ??
    metadata?.full_name ??
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ??
    "team"
  const normalizedName = titleCase(name)

  return {
    name: normalizedName,
    email: user?.email ?? "Signed in locally",
    initials: initials(normalizedName),
  }
}

export function initials(value: string) {
  const parts = value
    .replace(/@.*/, "")
    .split(/\s+|[._-]/)
    .filter(Boolean)

  return (parts[0]?.[0] ?? "N")
    .concat(parts[1]?.[0] ?? parts[0]?.[1] ?? "T")
    .toUpperCase()
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
