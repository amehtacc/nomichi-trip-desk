import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PublicFinalCta, PublicFooter, PublicTripCard } from "@/components/public/public-shell"
import { TripBrowserFilters } from "@/components/public/trip-browser-filters"
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

        <TripBrowserFilters
          query={query}
          destination={destination}
          sort={sort}
          destinations={destinations}
        />

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

      <PublicFinalCta />
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
