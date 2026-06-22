import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react"
import { PublicFooter, PublicTripCard } from "@/components/public/public-shell"
import { Button } from "@/components/ui/button"
import { getOpenTrips } from "@/lib/data"
import type { Trip } from "@/lib/types"

type TripsPageProps = {
  searchParams: Promise<{
    q?: string
    destination?: string
    sort?: string
  }>
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const params = await searchParams
  const trips = await getOpenTrips()
  const query = params.q?.trim() ?? ""
  const destination = params.destination ?? ""
  const sort = params.sort ?? "soonest"
  const destinations = Array.from(
    new Set(trips.map((trip) => trip.destination))
  ).sort((a, b) => a.localeCompare(b))
  const visibleTrips = sortTrips(
    filterTrips(trips, { query, destination }),
    sort
  )

  return (
    <main className="min-h-screen overflow-hidden bg-cream text-ink paper-texture">
      <header className="paper-noise border-b border-sand/45 bg-cream/90">
        <div className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <Link href="/" className="inline-flex leading-none">
            <Image
              src="/images/nomichi-logo-rust.svg"
              alt="Nomichi"
              width={170}
              height={43}
              priority
              className="h-auto w-36 sm:w-40"
            />
          </Link>
          <Button
            asChild
            className="h-11 rounded-md bg-primary px-5 text-cream shadow-sm hover:bg-ink"
          >
            <Link href="/#enquiry">Send Enquiry</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-4 pb-14 pt-12 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              Open trips
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-tight text-ink sm:text-6xl">
              Browse slow journeys that are open now.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/70 sm:text-base">
              Search by place, filter by destination, and choose the trip that
              feels closest to the season you are in.
            </p>
          </div>
          <div className="rounded-2xl border border-sand/50 bg-card/80 p-5 soft-paper-shadow">
            <p className="font-display text-2xl font-bold">
              {visibleTrips.length} open{" "}
              {visibleTrips.length === 1 ? "trip" : "trips"}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              Every trip here is created by the Nomichi team and open for new
              enquiries.
            </p>
          </div>
        </div>

        <form className="mt-10 grid gap-3 rounded-2xl border border-sand/50 bg-card/85 p-4 soft-paper-shadow lg:grid-cols-[1fr_240px_220px_auto]">
          <label className="relative">
            <span className="sr-only">Search trips</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/50" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search trips or destinations..."
              className="h-12 w-full rounded-md border border-sand/55 bg-cream/95 pl-11 pr-4 text-sm shadow-sm outline-none transition-all duration-300 ease-out focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </label>

          <label>
            <span className="sr-only">Destination</span>
            <select
              name="destination"
              defaultValue={destination}
              className="h-12 w-full cursor-pointer rounded-md border border-sand/55 bg-cream/95 px-4 text-sm shadow-sm outline-none transition-all duration-300 ease-out focus:border-primary focus:ring-3 focus:ring-primary/15"
            >
              <option value="">All destinations</option>
              {destinations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Sort trips</span>
            <select
              name="sort"
              defaultValue={sort}
              className="h-12 w-full cursor-pointer rounded-md border border-sand/55 bg-cream/95 px-4 text-sm shadow-sm outline-none transition-all duration-300 ease-out focus:border-primary focus:ring-3 focus:ring-primary/15"
            >
              <option value="soonest">Soonest first</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
              <option value="seats-low">Fewest seats left</option>
            </select>
          </label>

          <Button
            type="submit"
            className="h-12 rounded-md bg-primary px-6 text-cream shadow-sm hover:bg-ink"
          >
            <SlidersHorizontal className="size-4" />
            Apply
          </Button>
        </form>

        {visibleTrips.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-sand bg-card p-10 text-center">
            <h2 className="font-display text-2xl font-bold">
              No open trips match this search.
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/65">
              Try a different destination, clear the filters, or send us an
              enquiry and we will help you find the right fit.
            </p>
            <Button
              asChild
              className="mt-6 h-11 rounded-md bg-primary px-5 text-cream hover:bg-ink"
            >
              <Link href="/trips">
                Clear filters
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {visibleTrips.map((trip) => (
              <PublicTripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <PublicFooter />
    </main>
  )
}

function filterTrips(
  trips: Trip[],
  filters: {
    query: string
    destination: string
  }
) {
  const query = filters.query.toLowerCase()

  return trips.filter((trip) => {
    const matchesQuery =
      !query ||
      trip.name.toLowerCase().includes(query) ||
      trip.destination.toLowerCase().includes(query) ||
      trip.description.toLowerCase().includes(query)
    const matchesDestination =
      !filters.destination || trip.destination === filters.destination

    return matchesQuery && matchesDestination
  })
}

function sortTrips(trips: Trip[], sort: string) {
  return [...trips].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price
    if (sort === "price-high") return b.price - a.price
    if (sort === "seats-low") return a.total_seats - b.total_seats
    return a.start_date.localeCompare(b.start_date)
  })
}
