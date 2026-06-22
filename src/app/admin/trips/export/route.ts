import { NextResponse, type NextRequest } from "next/server"
import { tripStatusLabels } from "@/lib/constants"
import { getLeads, getTrips } from "@/lib/data"
import { formatDate, formatDateTime, formatMoney } from "@/lib/format"
import type { Trip } from "@/lib/types"

const columns = [
  "Name",
  "Destination",
  "Start Date",
  "End Date",
  "Price Including GST",
  "Total Seats",
  "Booked Seats",
  "Seats Left",
  "Status",
  "Description",
  "Created",
  "Updated",
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const [trips, leads] = await Promise.all([getTrips(), getLeads()])
  const filteredTrips = filterTrips(trips, {
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    destination: searchParams.get("destination") ?? undefined,
  })

  const rows = filteredTrips.map((trip) => {
    const booked = leads.filter((lead) => lead.trip_id === trip.id).length
    const seatsLeft = Math.max(trip.total_seats - booked, 0)

    return [
      trip.name,
      trip.destination,
      formatDate(trip.start_date),
      formatDate(trip.end_date),
      formatMoney(trip.price),
      String(trip.total_seats),
      String(booked),
      String(seatsLeft),
      tripStatusLabels[trip.status],
      trip.description,
      formatDateTime(trip.created_at),
      formatDateTime(trip.updated_at),
    ]
  })
  const csv = [columns, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nomichi-trips-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  })
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

function escapeCsvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}
