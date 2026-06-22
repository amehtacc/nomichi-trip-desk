import type { ComponentType } from "react"
import { notFound } from "next/navigation"
import { CalendarDays, Mail, MapPin, Phone, Users } from "lucide-react"
import { AiDraftButton } from "@/components/admin/ai-draft-button"
import { EmptyState } from "@/components/admin/empty-state"
import { NoteForm } from "@/components/admin/note-form"
import { OwnerSelect } from "@/components/admin/owner-select"
import { StatusSelect } from "@/components/admin/status-select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { leadStatuses, statusLabels } from "@/lib/constants"
import { getLead, getNotes, getProfiles } from "@/lib/data"
import { formatDateTime } from "@/lib/format"

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
  const latestNote = notes[notes.length - 1]
  const expectation = lead.expectation || "Not shared yet."

  return (
    <div className="space-y-7">
      <div className="rounded-xl bg-ink p-6 text-cream shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Lead detail
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold">
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

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
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
                <div className="rounded-lg border border-primary/20 bg-primary/8 p-4">
                  <Info label="What they hope this feels like" value={expectation} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {leadStatuses.map((status, index) => {
                  const isCurrent = status === lead.status
                  const isPast = index < currentStageIndex
                  return (
                    <div
                      key={status}
                      className={
                        isCurrent
                          ? "rounded-lg border border-primary bg-primary p-3 text-primary-foreground"
                          : isPast
                            ? "rounded-lg border border-olive/25 bg-olive/10 p-3 text-olive"
                            : "rounded-lg border border-border bg-muted/50 p-3 text-muted-foreground"
                      }
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                        {statusLabels[status]}
                      </p>
                    </div>
                  )
                })}
              </div>
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
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Trip information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Info label="Trip" value={lead.trips?.name ?? "Trip not selected"} />
              <Info
                icon={MapPin}
                label="Destination"
                value={lead.trips?.destination ?? "Needs team review"}
              />
              <Info label="Created" value={formatDateTime(lead.created_at)} />
              <Info label="Updated" value={formatDateTime(lead.updated_at)} />
            </CardContent>
          </Card>

          <Card className="rounded-lg border-primary/30 bg-primary/8">
            <CardHeader>
              <CardTitle>Where this stands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6">
              <p>
                {latestNote
                  ? latestNote.content
                  : "No call note yet. First action is to reach out and understand pace, comfort, and intent."}
              </p>
              <p className="text-muted-foreground">
                Suggested next step: update the status after the next touchpoint
                and leave a short note for the team.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Pipeline status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusSelect leadId={lead.id} status={lead.status} />
            </CardContent>
          </Card>

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

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>First WhatsApp draft</CardTitle>
            </CardHeader>
            <CardContent>
              <AiDraftButton leadId={lead.id} />
            </CardContent>
          </Card>
        </aside>
      </div>
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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm leading-6">{value}</p>
      </div>
    </div>
  )
}
