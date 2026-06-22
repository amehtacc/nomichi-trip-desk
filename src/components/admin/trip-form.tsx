import { saveTrip } from "@/app/actions"
import Image from "next/image"
import type { Trip } from "@/lib/types"
import { TripStatusSelect } from "@/components/admin/trip-status-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const fieldClass =
  "h-11 rounded-md border-sand/60 bg-card px-4 shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-primary/20"

export function TripForm({ trip }: { trip?: Trip }) {
  return (
    <form action={saveTrip} className="grid gap-5" encType="multipart/form-data">
      {trip ? <input type="hidden" name="id" value={trip.id} /> : null}
      <input type="hidden" name="image_url" value={trip?.image_url ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Name</span>
          <Input
            name="name"
            defaultValue={trip?.name}
            placeholder="Slow Roads of Spiti"
            className={fieldClass}
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Destination</span>
          <Input
            name="destination"
            defaultValue={trip?.destination}
            placeholder="Spiti Valley"
            className={fieldClass}
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Start date</span>
          <Input
            name="start_date"
            type="date"
            defaultValue={trip?.start_date}
            className={fieldClass}
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">End date</span>
          <Input
            name="end_date"
            type="date"
            defaultValue={trip?.end_date}
            className={fieldClass}
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Price including GST</span>
          <Input
            name="price"
            type="number"
            min="1"
            defaultValue={trip?.price}
            className={fieldClass}
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Total seats</span>
          <Input
            name="total_seats"
            type="number"
            min="1"
            defaultValue={trip?.total_seats}
            className={fieldClass}
            required
          />
        </label>
      </div>
      <label className="space-y-2">
        <span className="text-sm font-medium">Status</span>
        <TripStatusSelect status={trip?.status ?? "OPEN"} />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Trip image</span>
        {trip?.image_url ? (
          <div className="relative h-40 overflow-hidden rounded-lg border border-sand/60 bg-sand/20">
            <Image
              src={trip.image_url}
              alt={`${trip.name} image`}
              fill
              sizes="(min-width: 768px) 680px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <Input
          name="image"
          type="file"
          accept="image/*"
          className={fieldClass}
        />
        <p className="text-xs leading-5 text-ink/58">
          Upload a landscape image under 4 MB. It will appear on the public
          trip cards and in the admin trip table.
        </p>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Description</span>
        <Textarea
          name="description"
          defaultValue={trip?.description}
          rows={5}
          placeholder="A quiet high-altitude journey with village stays, monastery mornings, and room to breathe between long roads."
          className="rounded-md border-sand/60 bg-card px-4 py-3 shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-primary/20"
          required
        />
      </label>
      <Button type="submit" className="h-11 bg-ink text-cream hover:bg-primary">
        {trip ? "Save trip" : "Create trip"}
      </Button>
    </form>
  )
}
