import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
} from "lucide-react"
import { LeadFilters } from "@/components/admin/lead-filters"
import { Button } from "@/components/ui/button"
import { statusLabels } from "@/lib/constants"
import { getLeads, getProfiles, getTrips } from "@/lib/data"
import { formatDate, formatDateTime } from "@/lib/format"
import type { LeadStatus } from "@/lib/types"

const statusClass: Record<LeadStatus, string> = {
  NEW: "bg-[#f9ded3] text-primary",
  CONTACTED: "bg-[#fde9c6] text-primary",
  QUALIFIED: "bg-[#fff0bd] text-[#c46f00]",
  VIBE_CHECK: "bg-[#e8edce] text-olive",
  SENT: "bg-[#e8e9d8] text-olive",
  CONFIRMED: "bg-[#c9c78b] text-olive",
  NOT_A_FIT: "bg-[#dedbd6] text-ink",
}

const avatarColors = [
  "bg-[#ead8d2]",
  "bg-[#fde0b3]",
  "bg-[#dfe8c5]",
  "bg-[#d9e6c0]",
  "bg-[#e7e2cc]",
  "bg-[#f1d5cc]",
]

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    status?: string
    trip?: string
    owner?: string
    page?: string
    perPage?: string
  }>
}) {
  const params = await searchParams
  const [leads, trips, profiles] = await Promise.all([
    getLeads({
      query: params.q,
      status: params.status,
      trip: params.trip,
      owner: params.owner,
    }),
    getTrips(),
    getProfiles(),
  ])
  const perPage = parsePerPage(params.perPage)
  const totalPages = Math.max(Math.ceil(leads.length / perPage), 1)
  const currentPage = Math.min(parsePage(params.page), totalPages)
  const startIndex = (currentPage - 1) * perPage
  const endIndex = startIndex + perPage
  const visibleLeads = leads.slice(startIndex, endIndex)
  const exportHref = `/admin/leads/export${queryString(params) ? `?${queryString(params)}` : ""}`

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">Leads</h1>
          <p className="mt-2 text-sm text-ink/64">
            Manage and track all traveller enquiries in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="outline"
            className="h-12 border-sand/60 bg-card px-6 text-ink transition-all duration-300 ease-out hover:border-primary/40 hover:bg-primary hover:text-cream hover:shadow-md"
          >
            <Link href={exportHref}>
              <Download className="size-4" />
              Export
            </Link>
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-sand/55 bg-card shadow-sm">
        <LeadFilters params={params} trips={trips} profiles={profiles} />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-sand/45 bg-[#fbf7ef] text-left text-ink/62">
                <th className="px-3 py-4 font-medium">Traveller</th>
                <th className="px-3 py-4 font-medium">Trip</th>
                <th className="px-3 py-4 font-medium">Status</th>
                <th className="px-3 py-4 font-medium">Owner</th>
                <th className="px-3 py-4 font-medium">Created On</th>
                <th className="px-3 py-4 font-medium">Last Activity</th>
                <th className="px-3 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="font-display text-xl font-bold">No leads found.</p>
                    <p className="mt-2 text-sm text-ink/58">
                      Try a different search or wait for the next enquiry.
                    </p>
                  </td>
                </tr>
              ) : (
                visibleLeads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className="border-b border-sand/35 transition-colors duration-300 ease-out last:border-b-0 hover:bg-primary/5"
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-4">
                        <span
                          className={`grid size-10 place-items-center rounded-full text-xs font-semibold text-ink ${avatarColors[(startIndex + index) % avatarColors.length]}`}
                        >
                          {initials(lead.name)}
                        </span>
                        <div>
                          <p className="font-semibold">{lead.name}</p>
                          <p className="text-xs text-ink/58">{lead.email}</p>
                          <p className="text-xs text-ink/58">{lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium">
                        {lead.trips?.name ?? "Trip not selected"}
                      </p>
                      <p className="mt-1 text-xs text-ink/58">
                        {lead.trips?.destination ?? "Needs team review"}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <StatusPill status={lead.status} />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-full bg-[#e8edce] text-[10px] font-bold text-olive">
                          {initials(lead.profiles?.name ?? lead.profiles?.email ?? "NT")}
                        </span>
                        <span>{lead.profiles?.name || lead.profiles?.email || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-ink/68">
                      <DateStack value={lead.created_at} />
                    </td>
                    <td className="px-3 py-4 text-ink/68">{relativeTime(lead.updated_at)}</td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="icon-sm"
                          className="border-sand/60 bg-card"
                        >
                          <Link href={`/admin/leads/${lead.id}`} aria-label={`View ${lead.name}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sand/45 px-5 py-4 text-sm text-ink/68">
          <div className="flex items-center gap-2">
            Rows per page:
            {[10, 25, 50].map((size) => (
              <Link
                key={size}
                href={pageHref(params, 1, size)}
                className={
                  perPage === size
                    ? "rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-primary"
                    : "rounded-md border border-sand/60 bg-card px-3 py-2 text-ink transition-colors duration-300 ease-out hover:border-primary/35 hover:text-primary"
                }
              >
                {size}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <PaginationButton
              href={pageHref(params, currentPage - 1, perPage)}
              disabled={currentPage <= 1}
              label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </PaginationButton>
            <PaginationButton
              href={pageHref(params, currentPage + 1, perPage)}
              disabled={currentPage >= totalPages}
              label="Next page"
            >
              <ChevronRight className="size-4" />
            </PaginationButton>
          </div>
        </div>
      </section>
    </>
  )
}

function PaginationButton({
  href,
  disabled,
  label,
  children,
}: {
  href: string
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <span
        aria-label={label}
        aria-disabled="true"
        className="grid size-10 place-items-center rounded-md border border-sand/45 text-ink/28"
      >
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="grid size-10 place-items-center rounded-md border border-sand/55 text-ink transition-colors duration-300 ease-out hover:border-primary/40 hover:text-primary"
    >
      {children}
    </Link>
  )
}

function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className={`rounded-md px-3 py-1 text-xs font-bold uppercase ${statusClass[status]}`}>
      {statusLabels[status]}
    </span>
  )
}

function DateStack({ value }: { value: string }) {
  return (
    <span>
      <span className="block">{formatDate(value.slice(0, 10))}</span>
      <span className="block text-xs">{formatDateTime(value).split(",").pop()?.trim()}</span>
    </span>
  )
}

function initials(name: string) {
  const value = name || "NT"
  return value
    .replace(/@.*/, "")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.max(Math.round(diff / 60000), 1)

  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

function parsePage(value?: string) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parsePerPage(value?: string) {
  const perPage = Number(value)
  return [10, 25, 50].includes(perPage) ? perPage : 10
}

function queryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page" && key !== "perPage") query.set(key, value)
  })

  return query.toString()
}

function pageHref(
  params: Record<string, string | undefined>,
  page: number,
  perPage: number
) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page" && key !== "perPage") query.set(key, value)
  })

  query.set("page", String(Math.max(page, 1)))
  query.set("perPage", String(perPage))

  return `/admin/leads?${query.toString()}`
}
