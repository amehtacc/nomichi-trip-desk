"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  LogOut,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import { dismissNotification } from "@/app/actions"
import { createClient } from "@/lib/supabase/client"
import type { NotificationItem } from "@/lib/types"

type ProfileSummary = {
  name: string
  email: string
  initials: string
}

type RawNotificationRow = {
  notification_id?: unknown
  title?: unknown
  body?: unknown
  href?: unknown
  dismissed?: unknown
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export function DashboardHeader({
  notifications,
  profile,
  userId,
  viewport,
}: {
  notifications: NotificationItem[]
  profile: ProfileSummary
  userId: string
  viewport: "mobile" | "desktop"
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [liveNotifications, setLiveNotifications] = useState<NotificationItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(() =>
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "default"
    )
  const [isActiveViewport, setIsActiveViewport] = useState(() => {
    if (typeof window === "undefined") return false
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches
    return viewport === "desktop" ? isDesktop : !isDesktop
  })
  const hasBrowserNotifications =
    typeof window !== "undefined" && "Notification" in window
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const knownNotificationIdsRef = useRef(new Set(notifications.map((item) => item.id)))
  const audioContextRef = useRef<AudioContext | null>(null)
  const itemMap = new Map(
    [...notifications, ...liveNotifications].map((item) => [item.id, item])
  )
  const items = Array.from(itemMap.values()).filter(
    (item) => !dismissedIds.includes(item.id)
  )

  useEffect(() => {
    if (!profileOpen) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [profileOpen])

  useEffect(() => {
    if (!drawerOpen && !profileOpen) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false)
        setProfileOpen(false)
      }
    }

    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [drawerOpen, profileOpen])

  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(() => setMessage(""), 5000)
    return () => window.clearTimeout(timer)
  }, [message])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const showBrowserNotification = useCallback((notification: NotificationItem) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return

    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      icon: "/images/nomichi-logo-rust.svg",
      tag: notification.id,
    })

    browserNotification.onclick = () => {
      window.focus()
      if (notification.href) router.push(notification.href)
      browserNotification.close()
    }
  }, [router])

  const unlockSound = useCallback(() => {
    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContextConstructor) return

    audioContextRef.current ??= new AudioContextConstructor()
    void audioContextRef.current.resume()
  }, [])

  const playNotificationSound = useCallback(() => {
    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContextConstructor) return

    const audioContext = audioContextRef.current ?? new AudioContextConstructor()
    audioContextRef.current = audioContext

    if (audioContext.state === "suspended") {
      void audioContext.resume()
    }

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const now = audioContext.currentTime

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(720, now)
    oscillator.frequency.setValueAtTime(920, now + 0.12)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.3)
  }, [])

  const receiveNotification = useCallback((notification: NotificationItem) => {
    if (knownNotificationIdsRef.current.has(notification.id)) return

    knownNotificationIdsRef.current.add(notification.id)
    setLiveNotifications((current) => [notification, ...current])
    playNotificationSound()
    showBrowserNotification(notification)
    router.refresh()
  }, [playNotificationSound, router, showBrowserNotification])

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)")
    function updateActiveViewport() {
      setIsActiveViewport(viewport === "desktop" ? query.matches : !query.matches)
    }

    query.addEventListener("change", updateActiveViewport)
    return () => query.removeEventListener("change", updateActiveViewport)
  }, [viewport])

  useEffect(() => {
    if (!isActiveViewport) return

    const supabase = createClient()

    const channel = supabase
      .channel(`admin-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = mapNotificationRow(payload.new)
          if (!notification) return
          receiveNotification(notification)
        }
      )
      .subscribe()

    const pollTimer = window.setInterval(async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("notification_id,title,body,href,dismissed,created_at")
        .eq("user_id", userId)
        .eq("dismissed", false)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) return

      ;(data ?? [])
        .map(mapNotificationRow)
        .filter((item): item is NotificationItem => Boolean(item))
        .reverse()
        .forEach(receiveNotification)
    }, 20000)

    return () => {
      window.clearInterval(pollTimer)
      void supabase.removeChannel(channel)
    }
  }, [isActiveViewport, receiveNotification, userId])

  async function prepareBrowserAlerts() {
    unlockSound()

    if (!("Notification" in window)) return
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      return
    }

    setNotificationPermission(Notification.permission)
  }

  function dismiss(id: string) {
    setMessage("")
    setDismissedIds((current) => (current.includes(id) ? current : [...current, id]))
    startTransition(async () => {
      const result = await dismissNotification(id)

      if (!result.ok) {
        setDismissedIds((current) => current.filter((item) => item !== id))
        setMessage(result.message)
      }
    })
  }

  return (
    <header className="flex items-center justify-end gap-4">
      <button
        type="button"
        onClick={() => {
          setDrawerOpen(true)
          void prepareBrowserAlerts()
        }}
        className="relative grid size-11 cursor-pointer place-items-center rounded-full border border-sand/55 bg-card text-ink shadow-sm transition-colors duration-300 ease-out hover:border-primary/40 hover:text-primary"
        aria-label="Open notifications"
      >
        <Bell className="size-5" />
        {items.length ? (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-cream">
            {items.length}
          </span>
        ) : null}
      </button>

      <div ref={profileMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-sand/55 bg-card p-0 shadow-sm transition-colors duration-300 ease-out hover:border-primary/40"
          aria-label="Open profile menu"
        >
          <span className="grid size-9 place-items-center rounded-full bg-[#f4eadb] text-sm font-bold text-primary">
            {profile.initials}
          </span>
        </button>

        {profileOpen ? (
          <div className="absolute right-0 top-14 z-40 w-72 overflow-hidden rounded-lg border border-sand/60 bg-card shadow-xl">
            <div className="border-b border-sand/45 p-4">
              <p className="font-semibold text-ink">{profile.name}</p>
              <p className="mt-1 truncate text-sm text-ink/58">{profile.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-ink transition-colors duration-300 ease-out hover:bg-primary/8 hover:text-primary"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        ) : null}
      </div>

      {drawerOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-ink/20 backdrop-blur-[2px]"
            aria-label="Close notifications"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-sand/60 bg-cream shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-sand/50 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Notifications
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                  What needs attention
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid size-9 cursor-pointer place-items-center rounded-full border border-sand/55 bg-card text-ink transition-colors duration-300 ease-out hover:border-primary/40 hover:text-primary"
                aria-label="Close notifications"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
              {message ? (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm leading-6 text-destructive">
                  {message}
                </p>
              ) : null}
              {hasBrowserNotifications && notificationPermission !== "granted" ? (
                <button
                  type="button"
                  onClick={prepareBrowserAlerts}
                  className="w-full cursor-pointer rounded-lg border border-primary/25 bg-primary/10 p-3 text-left text-sm font-medium leading-6 text-primary transition-colors duration-300 ease-out hover:bg-primary hover:text-cream"
                >
                  Turn on browser alerts for new enquiries.
                </button>
              ) : null}
              {items.length ? (
                items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-lg border border-sand/55 bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f9ded3] text-primary">
                        <Bell className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-ink/62">
                          {item.body}
                        </p>
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={() => {
                              dismiss(item.id)
                              setDrawerOpen(false)
                            }}
                            className="mt-3 inline-flex text-sm font-semibold text-primary transition-colors duration-300 ease-out hover:text-primary/75"
                          >
                            Open
                          </Link>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => dismiss(item.id)}
                        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md border border-sand/45 text-ink/58 transition-colors duration-300 ease-out hover:border-primary/35 hover:text-primary"
                        aria-label={`Dismiss ${item.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="grid h-full place-items-center rounded-lg border border-dashed border-sand/70 bg-card/60 p-8 text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#f4eadb] text-primary">
                      <UserRound className="size-5" />
                    </span>
                    <p className="mt-4 font-semibold">Nothing needs attention.</p>
                    <p className="mt-2 text-sm leading-6 text-ink/58">
                      New traveller enquiries will show here when they arrive.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      ) : null}
    </header>
  )
}

function mapNotificationRow(row: RawNotificationRow): NotificationItem | null {
  if (
    typeof row.notification_id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.body !== "string" ||
    row.dismissed === true
  ) {
    return null
  }

  return {
    id: row.notification_id,
    title: row.title,
    body: row.body,
    href: typeof row.href === "string" ? row.href : undefined,
  }
}
