import Image from "next/image"
import Link from "next/link"
import {
  Armchair,
  Briefcase,
  ChevronLeft,
  CalendarDays,
  ChevronRight,
  Download,
  Edit3,
  Filter,
  Lock,
  MapPin,
  Plus,
  Search,
  UserCheck,
  X,
} from "lucide-react"
import { TripForm } from "@/components/admin/trip-form"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { tripStatusLabels } from "@/lib/constants"
import { getLeads, getTrips } from "@/lib/data"
import { formatDate, formatDateTime } from "@/lib/format"
import type { Trip } from "@/lib/types"

const tripImages: Record<string, string> = {
  Kashmir: "/images/trips/kashmir.png",
  Goa: "/images/trips/goa.png",
  "Arunachal Pradesh": "/images/trips/tawang.png",
  Rajasthan: "/images/trips/rajasthan.png",
}

const filterSelectClass =
  "!h-12 min-h-12 w-full rounded-md border-sand/60 bg-card px-4 text-sm shadow-sm"

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    status?: string
    destination?: string
    page?: string
    perPage?: string
    modal?: string
    tripId?: string
  }>
}) {
  const params = await searchParams
  const [trips, leads] = await Promise.all([getTrips(), getLeads()])
  const filteredTrips = filterTrips(trips, params)
  const perPage = parsePerPage(params.perPage)
  const totalPages = Math.max(Math.ceil(filteredTrips.length / perPage), 1)
  const currentPage = Math.min(parsePage(params.page), totalPages)
  const startIndex = (currentPage - 1) * perPage
  const endIndex = startIndex + perPage
  const visibleTrips = filteredTrips.slice(startIndex, endIndex)
  const modalTrip =
    params.modal === "edit"
      ? trips.find((trip) => trip.id === params.tripId) ?? null
      : null
  const showModal = params.modal === "new" || Boolean(modalTrip)
  const closeHref = tripsHref(params, { modal: undefined, tripId: undefined })
  const exportHref = `/admin/trips/export${queryString(params) ? `?${queryString(params)}` : ""}`
  const openTrips = trips.filter((trip) => trip.status === "OPEN").length
  const closedTrips = trips.filter((trip) => trip.status === "CLOSED").length
  const totalSeats = trips.reduce((total, trip) => total + trip.total_seats, 0)
  const seatsBooked = leads.filter((lead) => lead.status === "CONFIRMED").length
  const bookedPercent = totalSeats
    ? Math.min(Math.round((seatsBooked / totalSeats) * 100), 100)
    : 0

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">Trips</h1>
          <p className="mt-2 text-sm text-ink/64">
            Manage all Nomichi trips and their details.
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
          <Button asChild className="h-12 bg-primary px-6 text-cream hover:bg-ink">
            <Link href={tripsHref(params, { modal: "new", tripId: undefined })}>
              <Plus className="size-4" />
              Add Trip
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Briefcase}
          title="Total Trips"
          value={trips.length}
          caption="Trips created by the team"
          bg="bg-[#f9ded3]"
          text="text-primary"
        />
        <StatCard
          icon={CalendarDays}
          title="Open Trips"
          value={openTrips}
          caption="Open for traveller enquiries"
          bg="bg-[#e8edce]"
          text="text-olive"
        />
        <StatCard
          icon={Lock}
          title="Closed Trips"
          value={closedTrips}
          caption="Hidden from public enquiries"
          bg="bg-[#dedbd6]"
          text="text-ink"
        />
        <StatCard
          icon={Armchair}
          title="Total Seats"
          value={totalSeats}
          caption="Capacity across every trip"
          bg="bg-[#fff0bd]"
          text="text-primary"
        />
        <StatCard
          icon={UserCheck}
          title="Seats Booked"
          value={seatsBooked}
          caption={`${bookedPercent}% of total seats`}
          bg="bg-[#dfeaf7]"
          text="text-[#2166a7]"
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-sand/55 bg-card shadow-sm">
        <TripFilters params={params} trips={trips} />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-sand/45 bg-[#fbf7ef] text-left text-ink/62">
                <th className="px-5 py-4 font-medium">Trip</th>
                <th className="px-4 py-4 font-medium">Destination</th>
                <th className="px-4 py-4 font-medium">Dates</th>
                <th className="px-4 py-4 font-medium">Seats</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Created On</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <p className="font-display text-xl font-bold">No trips yet.</p>
                    <p className="mt-2 text-sm text-ink/58">
                      Create a trip or adjust the filters to see existing journeys.
                    </p>
                  </td>
                </tr>
              ) : (
                visibleTrips.map((trip) => {
                  const booked = leads.filter((lead) => lead.trip_id === trip.id).length
                  const seatsLeft = Math.max(trip.total_seats - booked, 0)
                  const duration = daysBetween(trip.start_date, trip.end_date)
                  return (
                    <tr
                      key={trip.id}
                      className="border-b border-sand/35 transition-colors duration-300 ease-out last:border-b-0 hover:bg-primary/5"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-sand/30">
                            <Image
                              src={
                                trip.image_url ??
                                tripImages[trip.destination] ??
                                "/images/trips/kashmir.png"
                              }
                              alt={`${trip.name} image`}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-display text-lg font-bold">
                              {trip.name}
                            </p>
                            <p className="mt-1 max-w-56 text-sm leading-5 text-ink/62">
                              {trip.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="flex items-center gap-2">
                          <MapPin className="size-4 text-olive" />
                          {trip.destination}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="size-4 text-olive" />
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </p>
                        <p className="mt-1 pl-6 text-xs text-ink/58">
                          {duration} days
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">
                          {booked} / {trip.total_seats}
                        </p>
                        <p className="mt-1 text-xs font-medium text-primary">
                          {seatsLeft} seats left
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <TripStatusBadge trip={trip} />
                      </td>
                      <td className="px-4 py-4 text-ink/68">
                        <DateStack value={trip.created_at} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="icon-sm"
                            className="border-sand/60 bg-card"
                          >
                            <Link
                              href={tripsHref(params, {
                                modal: "edit",
                                tripId: trip.id,
                              })}
                              aria-label={`Edit ${trip.name}`}
                            >
                              <Edit3 className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
                href={tripsHref(params, { page: "1", perPage: String(size) })}
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
              href={tripsHref(params, { page: String(currentPage - 1), perPage: String(perPage) })}
              disabled={currentPage <= 1}
              label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </PaginationButton>
            <PaginationButton
              href={tripsHref(params, { page: String(currentPage + 1), perPage: String(perPage) })}
              disabled={currentPage >= totalPages}
              label="Next page"
            >
              <ChevronRight className="size-4" />
            </PaginationButton>
          </div>
        </div>
      </section>

      {showModal ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/35 px-4 py-8 backdrop-blur-[2px]">
          <Link
            href={closeHref}
            aria-label="Close trip form"
            className="fixed inset-0 cursor-default"
          />
          <section className="relative mx-auto max-w-3xl overflow-hidden rounded-xl border border-sand/60 bg-cream shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-sand/50 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Trip management
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                  {modalTrip ? "Edit trip" : "Create trip"}
                </h2>
              </div>
              <Button
                asChild
                variant="outline"
                size="icon-sm"
                className="border-sand/60 bg-card"
              >
                <Link href={closeHref} aria-label="Close trip form">
                  <X className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="max-h-[calc(100vh-160px)] overflow-y-auto p-5">
              <TripForm trip={modalTrip ?? undefined} />
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}

function TripFilters({
  trips,
  params,
}: {
  trips: Trip[]
  params: {
    q?: string
    status?: string
    destination?: string
    perPage?: string
  }
}) {
  const destinations = Array.from(new Set(trips.map((trip) => trip.destination)))

  return (
    <form
      id="trip-filters"
      className="grid gap-3 bg-card p-5 sm:grid-cols-2 xl:grid-cols-[1.6fr_0.75fr_0.85fr_auto_auto]"
    >
      <input type="hidden" name="perPage" value={params.perPage ?? "10"} />
      <label className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink/56" />
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search trips by name or destination..."
          className="h-12 w-full rounded-md border border-sand/60 bg-card px-4 pr-11 text-sm shadow-sm outline-none transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        />
      </label>
      <Select name="status" defaultValue={params.status || "all"}>
        <SelectTrigger className={filterSelectClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={8}>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="OPEN">{tripStatusLabels.OPEN}</SelectItem>
          <SelectItem value="CLOSED">{tripStatusLabels.CLOSED}</SelectItem>
        </SelectContent>
      </Select>
      <Select name="destination" defaultValue={params.destination || "all"}>
        <SelectTrigger className={filterSelectClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={8}>
          <SelectItem value="all">All destinations</SelectItem>
          {destinations.map((destination) => (
            <SelectItem key={destination} value={destination}>
              {destination}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="submit"
        variant="outline"
        className="h-12 border-sand/60 bg-card px-5 text-ink hover:bg-primary hover:text-cream"
      >
        <Filter className="size-4" />
        Apply filters
      </Button>
      {hasActiveTripFilters(params) ? (
        <Button
          asChild
          variant="outline"
          className="h-12 border-sand/60 bg-card px-5 text-ink hover:bg-cream"
        >
          <Link href="/admin/trips">Clear</Link>
        </Button>
      ) : null}
    </form>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  caption,
  bg,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: number
  caption: string
  bg: string
  text: string
}) {
  return (
    <div className="rounded-lg border border-sand/55 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <span className={`grid size-18 place-items-center rounded-full ${bg} ${text}`}>
          <Icon className="size-8" />
        </span>
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="mt-2 font-display text-3xl font-bold">{value}</p>
          <p className="mt-1 text-sm text-ink/58">{caption}</p>
        </div>
      </div>
    </div>
  )
}

function TripStatusBadge({ trip }: { trip: Trip }) {
  if (trip.status === "CLOSED") {
    return (
      <span className="rounded-md bg-[#dedbd6] px-3 py-1 text-xs font-bold uppercase text-ink">
        {tripStatusLabels.CLOSED}
      </span>
    )
  }

  return (
    <span className="rounded-md bg-[#e8edce] px-3 py-1 text-xs font-bold uppercase text-olive">
      {tripStatusLabels.OPEN}
    </span>
  )
}

function DateStack({ value }: { value: string }) {
  const formatted = formatDateTime(value)
  const [date, time] = formatted.split(",")

  return (
    <span>
      <span className="block">{date}</span>
      <span className="block text-xs">{time?.trim()}</span>
    </span>
  )
}

function daysBetween(start: string, end: string) {
  const startTime = new Date(`${start}T00:00:00`).getTime()
  const endTime = new Date(`${end}T00:00:00`).getTime()
  return Math.max(Math.round((endTime - startTime) / 86400000) + 1, 1)
}

function filterTrips(
  trips: Trip[],
  params: {
    q?: string
    status?: string
    destination?: string
  }
) {
  const query = params.q?.trim().toLowerCase()

  return trips.filter((trip) => {
    const matchesQuery =
      !query ||
      trip.name.toLowerCase().includes(query) ||
      trip.destination.toLowerCase().includes(query) ||
      trip.description.toLowerCase().includes(query)
    const matchesStatus =
      !params.status || params.status === "all" || trip.status === params.status
    const matchesDestination =
      !params.destination ||
      params.destination === "all" ||
      trip.destination === params.destination

    return matchesQuery && matchesStatus && matchesDestination
  })
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

function parsePage(value?: string) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parsePerPage(value?: string) {
  const perPage = Number(value)
  return [10, 25, 50].includes(perPage) ? perPage : 10
}

function hasActiveTripFilters(params: {
  q?: string
  status?: string
  destination?: string
}) {
  return Boolean(
    params.q ||
      (params.status && params.status !== "all") ||
      (params.destination && params.destination !== "all")
  )
}

function queryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (
      value &&
      !["page", "perPage", "modal", "tripId"].includes(key) &&
      value !== "all"
    ) {
      query.set(key, value)
    }
  })

  return query.toString()
}

function tripsHref(
  params: Record<string, string | undefined>,
  next: Record<string, string | undefined>
) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })

  Object.entries(next).forEach(([key, value]) => {
    if (value) {
      query.set(key, value)
    } else {
      query.delete(key)
    }
  })

  const value = query.toString()
  return value ? `/admin/trips?${value}` : "/admin/trips"
}
