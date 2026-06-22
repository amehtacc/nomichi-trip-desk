import { TripForm } from "@/components/admin/trip-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewTripPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Trip management
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Create trip</h1>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Trip details</CardTitle>
        </CardHeader>
        <CardContent>
          <TripForm />
        </CardContent>
      </Card>
    </div>
  )
}
