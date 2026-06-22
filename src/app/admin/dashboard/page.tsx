import type { ComponentType } from "react"
import Image from "next/image"
import Link from "next/link"
import { DynamicGreeting } from "@/components/admin/dynamic-greeting"
import { EmptyState } from "@/components/admin/empty-state"
import {
  ArrowRight,
  Award,
  CalendarDays,
  Heart,
  Phone,
  Send,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { profileFromUser, initials } from "@/components/admin/admin-header"
import { leadStatuses, statusLabels } from "@/lib/constants"
import { getCurrentUser, getDashboardMetrics } from "@/lib/data"
import { formatDateTime } from "@/lib/format"
import type { LeadStatus } from "@/lib/types"

const tripImages: Record<string, string> = {
  Kashmir: "/images/trips/kashmir.png",
  Goa: "/images/trips/goa.png",
  "Arunachal Pradesh": "/images/trips/tawang.png",
  Rajasthan: "/images/trips/rajasthan.png",
}

const stageMeta: Record<
  LeadStatus,
  {
    icon: ComponentType<{ className?: string }>
    bg: string
    text: string
    bar: string
  }
> = {
  NEW: {
    icon: UserPlus,
    bg: "bg-[#f9ded3]",
    text: "text-primary",
    bar: "bg-[#f5b195]",
  },
  CONTACTED: {
    icon: Phone,
    bg: "bg-[#fde9c6]",
    text: "text-primary",
    bar: "bg-primary",
  },
  QUALIFIED: {
    icon: Award,
    bg: "bg-[#fff0bd]",
    text: "text-[#ec9f00]",
    bar: "bg-[#ffc83d]",
  },
  VIBE_CHECK: {
    icon: Heart,
    bg: "bg-[#e8edce]",
    text: "text-olive",
    bar: "bg-[#b7c47a]",
  },
  SENT: {
    icon: Send,
    bg: "bg-[#e8e9d8]",
    text: "text-olive",
    bar: "bg-[#a7ab72]",
  },
  CONFIRMED: {
    icon: UserCheck,
    bg: "bg-[#c9c78b]",
    text: "text-olive",
    bar: "bg-olive",
  },
  NOT_A_FIT: {
    icon: X,
    bg: "bg-[#dedbd6]",
    text: "text-ink",
    bar: "bg-[#9d9992]",
  },
}

export default async function DashboardPage() {
  const [metrics, user] = await Promise.all([
    getDashboardMetrics(),
    getCurrentUser(),
  ])
  const maxTripCount = Math.max(...metrics.byTrip.map((item) => item.count), 1)
  const newLeads = metrics.byStatus.NEW ?? 0
  const qualifiedLeads = metrics.byStatus.QUALIFIED ?? 0
  const confirmedLeads = metrics.byStatus.CONFIRMED ?? 0
  const profile = profileFromUser(user)
  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <DynamicGreeting name={profile.name} />
          <p className="mt-2 text-sm text-ink/64">
            Here is what is happening with your Trip Desk today.
          </p>
        </div>
        <div className="inline-flex h-11 items-center gap-3 rounded-md border border-sand/60 bg-card px-4 text-sm shadow-sm">
          <CalendarDays className="size-4" />
          {todayLabel}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Leads"
          value={metrics.totalLeads}
          caption="All enquiries in the desk"
          href="/admin/leads"
          bg="bg-[#f9ded3]"
          text="text-primary"
        />
        <StatCard
          icon={Sparkles}
          title="New Leads"
          value={newLeads}
          caption="Waiting for first contact"
          href="/admin/leads?status=NEW"
          bg="bg-[#fff0bd]"
          text="text-[#ec9f00]"
        />
        <StatCard
          icon={UserCheck}
          title="Qualified Leads"
          value={qualifiedLeads}
          caption="Ready for the next step"
          href="/admin/leads?status=QUALIFIED"
          bg="bg-[#e8e5d8]"
          text="text-olive"
        />
        <StatCard
          icon={Star}
          title="Confirmed Leads"
          value={confirmedLeads}
          caption="Seats confirmed"
          href="/admin/leads?status=CONFIRMED"
          bg="bg-[#fde9c6]"
          text="text-primary"
        />
      </section>

      <section>
        <Panel
          title="Leads by Stage"
          actionLabel="View all leads"
          actionHref="/admin/leads"
        >
          {metrics.totalLeads === 0 ? (
            <EmptyState
              title="No leads in the pipeline yet."
              description="When travellers enquire, this card will show how many are new, contacted, qualified, and confirmed."
            />
          ) : (
            <Pipeline total={metrics.totalLeads} byStatus={metrics.byStatus} />
          )}
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr]">
        <Panel title="Recent Leads" actionLabel="View all" actionHref="/admin/leads">
          {metrics.recentLeads.length === 0 ? (
            <EmptyState
              title="No recent leads yet."
              description="New traveller enquiries will appear here as soon as someone sends the public form."
            />
          ) : (
            <div className="divide-y divide-sand/40">
              {metrics.recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="grid grid-cols-[40px_1fr_auto] items-center gap-4 py-3 transition-colors duration-300 ease-out hover:bg-primary/5"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-[#f9ded3] text-xs font-semibold text-ink">
                    {lead.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="grid gap-1 md:grid-cols-[1fr_1.2fr_auto] md:items-center">
                    <p className="font-medium">{lead.name}</p>
                    <p className="truncate text-sm text-ink/60">
                      {lead.trips?.name ?? "Trip not selected"}
                    </p>
                    <StatusPill status={lead.status} />
                  </div>
                  <div className="hidden items-center gap-3 text-sm text-ink/56 sm:flex">
                    <span>{relativeTime(lead.created_at)}</span>
                    <span className="grid size-7 place-items-center rounded-full bg-[#e8edce] text-[10px] font-bold text-olive">
                      {initials(lead.profiles?.name ?? lead.profiles?.email ?? "NT")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Leads per Trip"
          actionLabel="View all trips"
          actionHref="/admin/trips"
        >
          {metrics.byTrip.length === 0 ? (
            <EmptyState
              title="No trips to compare yet."
              description="Create trips from the Trips page and this card will show where enquiries are coming in."
            />
          ) : (
            <div className="space-y-3">
              {metrics.byTrip.slice(0, 5).map(({ trip, count }) => (
                <div key={trip.id} className="flex items-center gap-4">
                  <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md bg-sand/30">
                    <Image
                      src={
                        trip.image_url ??
                        tripImages[trip.destination] ??
                        "/images/trips/kashmir.png"
                      }
                      alt={`${trip.name} image`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{trip.name}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.max((count / maxTripCount) * 100, count ? 8 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-display text-xl font-bold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  caption,
  href,
  bg,
  text,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  value: number
  caption: string
  href: string
  bg: string
  text: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-sand/55 bg-card p-6 shadow-sm transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
    >
      <div className="flex items-center gap-5">
        <span className={`grid size-18 place-items-center rounded-xl ${bg} ${text}`}>
          <Icon className="size-8" />
        </span>
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-2 font-display text-3xl font-bold">{value}</p>
          <p className="mt-1 text-sm text-ink/58">{caption}</p>
        </div>
      </div>
    </Link>
  )
}

function Panel({
  title,
  actionLabel,
  actionHref,
  children,
}: {
  title: string
  actionLabel: string
  actionHref: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-sand/55 bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
      {children}
    </section>
  )
}

function Pipeline({
  total,
  byStatus,
}: {
  total: number
  byStatus: Partial<Record<LeadStatus, number>>
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 xl:grid-cols-7">
        {leadStatuses.map((status, index) => {
          const meta = stageMeta[status]
          const Icon = meta.icon
          const count = byStatus[status] ?? 0
          const pct = total ? Math.round((count / total) * 100) : 0

          return (
            <div key={status} className="relative text-center">
              {index > 0 ? (
                <span className="absolute right-[58%] top-8 hidden w-[72%] border-t border-dashed border-sand md:block" />
              ) : null}
              <span
                className={`relative mx-auto grid size-16 place-items-center rounded-full ${meta.bg} ${meta.text}`}
              >
                <Icon className="size-7" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em]">
                {statusLabels[status]}
              </p>
              <p className="mt-3 font-display text-2xl font-bold">{count}</p>
              <p className="text-sm text-ink/58">{pct}%</p>
            </div>
          )
        })}
      </div>
      <div className="mt-9 flex h-2 overflow-hidden rounded-full bg-muted">
        {leadStatuses.map((status) => {
          const meta = stageMeta[status]
          const count = byStatus[status] ?? 0
          const pct = total ? (count / total) * 100 : 100 / leadStatuses.length
          return (
            <span
              key={status}
              className={`${meta.bar} border-r border-card last:border-r-0`}
              style={{ width: `${Math.max(pct, total && count ? 4 : 2)}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: LeadStatus }) {
  const meta = stageMeta[status]
  return (
    <span
      className={`w-fit rounded-md px-3 py-1 text-xs font-bold uppercase ${meta.bg} ${meta.text}`}
    >
      {statusLabels[status]}
    </span>
  )
}

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.max(Math.round(diff / 60000), 1)

  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return formatDateTime(date)
}
