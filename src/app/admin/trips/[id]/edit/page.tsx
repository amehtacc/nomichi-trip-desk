import { notFound } from "next/navigation"
import { TripForm } from "@/components/admin/trip-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTrip } from "@/lib/data"

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const trip = await getTrip(id)

  if (!trip) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Trip management
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Edit trip</h1>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>{trip.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <TripForm trip={trip} />
        </CardContent>
      </Card>
    </div>
  )
}
