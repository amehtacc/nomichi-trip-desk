import type { ComponentType } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Heart,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Send,
  Sparkles,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react"
import { AiDraftButton } from "@/components/admin/ai-draft-button"
import { EmptyState } from "@/components/admin/empty-state"
import { NoteForm } from "@/components/admin/note-form"
import { OwnerSelect } from "@/components/admin/owner-select"
import { StatusSelect } from "@/components/admin/status-select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { leadStatuses, statusLabels } from "@/lib/constants"
import { getLead, getNotes, getProfiles } from "@/lib/data"
import { formatDate, formatDateTime, formatMoney } from "@/lib/format"

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [lead, notes, profiles] = await Promise.all([
    getLead(id),
    getNotes(id),
    getProfiles(),
  ])

  if (!lead) notFound()
  const currentStageIndex = leadStatuses.indexOf(lead.status)
  const expectation = lead.expectation || "Not shared yet."

  return (
    <div className="space-y-5 sm:space-y-7">
      <div className="rounded-xl bg-ink p-4 text-cream shadow-xl sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
          Lead detail
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-words font-display text-3xl font-extrabold sm:text-4xl">
              {lead.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-cream/72">
              {expectation}
            </p>
          </div>
          <Badge className="rounded-full bg-yellow px-4 py-1 text-ink">
            {statusLabels[lead.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Traveller information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Info icon={Phone} label="Phone" value={lead.phone} />
              <Info icon={Mail} label="Email" value={lead.email} />
              <Info icon={Users} label="Group type" value={lead.group_type} />
              <Info
                icon={CalendarDays}
                label="Preferred month"
                value={lead.preferred_month}
              />
              <div className="sm:col-span-2">
                <Info
                  icon={Sparkles}
                  label="What are you hoping this trip feels like?"
                  value={expectation}
                />
              </div>
            </CardContent>
          </Card>

          <TripInfoCard lead={lead} className="xl:hidden" />

          <Card className="rounded-lg">
            <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Pipeline</CardTitle>
              <div className="grid gap-2 sm:flex sm:items-center sm:gap-3 md:justify-end">
                <span className="text-sm font-medium text-ink sm:whitespace-nowrap">
                  Current Status
                </span>
                <div className="w-full sm:w-40">
                  <StatusSelect leadId={lead.id} status={lead.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <PipelineTimeline
                currentStageIndex={currentStageIndex}
                status={lead.status}
                createdAt={lead.created_at}
                updatedAt={lead.updated_at}
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Call notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NoteForm leadId={lead.id} />
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <EmptyState
                    title="No call notes yet."
                    description="After the first call, add a short note so the next person knows exactly where the conversation stands."
                  />
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="relative rounded-lg border border-border bg-background p-4 pl-5"
                    >
                      <span className="absolute left-0 top-5 h-10 w-1 rounded-r-full bg-primary" />
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {note.content}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {note.profiles?.name || note.profiles?.email || "Nomichi"}{" "}
                        -{" "}
                        {formatDateTime(note.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <TripInfoCard lead={lead} className="hidden xl:block" />

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Owner assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <p className="mb-3 rounded-md border border-dashed border-sand/65 bg-cream/55 p-3 text-sm leading-6 text-ink/58">
                  No team profiles are available yet. Once a team member profile
                  exists, you can assign this lead to them.
                </p>
              ) : null}
              <OwnerSelect
                leadId={lead.id}
                ownerId={lead.owner_id}
                profiles={profiles}
              />
            </CardContent>
          </Card>

          <AiDraftButton leadId={lead.id} />
        </aside>
      </div>
    </div>
  )
}

const pipelineIcons: Record<
  (typeof leadStatuses)[number],
  ComponentType<{ className?: string }>
> = {
  NEW: UserPlus,
  CONTACTED: PhoneCall,
  QUALIFIED: BadgeCheck,
  VIBE_CHECK: Heart,
  SENT: Send,
  CONFIRMED: CheckCircle2,
  NOT_A_FIT: XCircle,
}

const tripImages: Record<string, string> = {
  Kashmir: "/images/trips/kashmir.png",
  Goa: "/images/trips/goa.png",
  "Arunachal Pradesh": "/images/trips/tawang.png",
  Rajasthan: "/images/trips/rajasthan.png",
}

function PipelineTimeline({
  currentStageIndex,
  status,
  createdAt,
  updatedAt,
}: {
  currentStageIndex: number
  status: (typeof leadStatuses)[number]
  createdAt: string
  updatedAt: string
}) {
  return (
    <>
      <div className="space-y-0 md:hidden">
        {leadStatuses.map((item, index) => {
          const Icon = pipelineIcons[item]
          const isCurrent = item === status
          const isPast = index < currentStageIndex
          const date =
            index === 0
              ? formatShortDate(createdAt)
              : isCurrent
                ? formatShortDate(updatedAt)
                : ""

          return (
            <div key={item} className="relative flex gap-3 pb-5 last:pb-0">
              {index < leadStatuses.length - 1 ? (
                <span className="absolute left-[21px] top-11 h-[calc(100%-44px)] border-l border-dashed border-sand/85" />
              ) : null}
              <span
                className={[
                  "relative z-10 grid size-11 place-items-center rounded-full border text-sm shadow-sm transition-colors duration-300",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : isPast
                      ? "border-olive/20 bg-olive/12 text-olive"
                      : "border-border bg-card text-muted-foreground",
                ].join(" ")}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                  {statusLabels[item]}
                </p>
                <p className="mt-1 min-h-4 text-xs text-muted-foreground">
                  {date || "Waiting"}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="hidden overflow-x-auto pb-1 md:block">
        <div className="grid min-w-[760px] grid-cols-7 items-start">
          {leadStatuses.map((item, index) => {
            const Icon = pipelineIcons[item]
            const isCurrent = item === status
            const isPast = index < currentStageIndex
            const date =
              index === 0
                ? formatShortDate(createdAt)
                : isCurrent
                  ? formatShortDate(updatedAt)
                  : ""

            return (
              <div key={item} className="relative flex flex-col items-center">
                {index > 0 ? (
                  <span className="absolute left-0 top-[22px] h-px w-1/2 border-t border-dashed border-sand/85" />
                ) : null}
                {index < leadStatuses.length - 1 ? (
                  <span className="absolute right-0 top-[22px] h-px w-1/2 border-t border-dashed border-sand/85" />
                ) : null}
                <span
                  className={[
                    "relative z-10 grid size-11 place-items-center rounded-full border text-sm shadow-sm transition-colors duration-300",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isPast
                        ? "border-olive/20 bg-olive/12 text-olive"
                        : "border-border bg-card text-muted-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-5" />
                </span>
                <span className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                  {statusLabels[item]}
                </span>
                <span className="mt-1 min-h-4 text-xs text-muted-foreground">
                  {date}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function TripInfoCard({
  lead,
  className,
}: {
  lead: NonNullable<Awaited<ReturnType<typeof getLead>>>
  className?: string
}) {
  const trip = lead.trips
  const confirmedSeats = lead.trip_confirmed_count ?? 0
  const openSeats = trip ? Math.max(trip.total_seats - confirmedSeats, 0) : 0
  const image = trip
    ? trip.image_url ?? tripImages[trip.destination] ?? "/images/trips/kashmir.png"
    : ""

  return (
    <Card className={`rounded-lg ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>Trip information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {trip ? (
          <>
            <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted sm:h-24 sm:w-28">
                <Image
                  src={image}
                  alt={trip.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 112px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <h3 className="break-words font-display text-lg font-bold leading-tight text-ink">
                  {trip.name}
                </h3>
                <TripMeta icon={MapPin} value={trip.destination} />
                <TripMeta
                  icon={CalendarDays}
                  value={`${formatDate(trip.start_date)} - ${formatDate(
                    trip.end_date
                  )}`}
                />
                <TripMeta
                  icon={ClockIcon}
                  value={`${tripDurationDays(
                    trip.start_date,
                    trip.end_date
                  )} Days / ${Math.max(
                    tripDurationDays(trip.start_date, trip.end_date) - 1,
                    0
                  )} Nights`}
                />
              </div>
            </div>
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Price
                </p>
                <p className="mt-2 text-sm font-bold text-ink">
                  {formatMoney(trip.price)}{" "}
                  <span className="text-[10px] font-medium text-muted-foreground">
                    incl. GST
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Open Seats
                </p>
                <p className="mt-2 text-sm font-bold text-ink">
                  {openSeats} of {trip.total_seats}
                </p>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="Trip not selected."
            description="This lead needs a trip attached before the team can confirm details."
          />
        )}
      </CardContent>
    </Card>
  )
}

function TripMeta({
  icon: Icon,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink">
      <Icon className="size-3.5 text-ink/75" />
      <span>{value}</span>
    </div>
  )
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon?: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      {Icon ? (
        <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-muted text-primary">
          <Icon className="size-4" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-sm leading-6 text-ink">{value}</p>
      </div>
    </div>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function tripDurationDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`).getTime()
  const end = new Date(`${endDate}T00:00:00`).getTime()
  return Math.max(Math.round((end - start) / 86_400_000) + 1, 1)
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value))
}
