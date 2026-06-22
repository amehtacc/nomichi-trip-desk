"use client"

import Link from "next/link"
import { useState } from "react"
import { Filter, Search, SlidersHorizontal, UserRound } from "lucide-react"
import { leadStatuses, statusLabels } from "@/lib/constants"
import type { Profile, Trip } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const allValue = "all"
const selectClass =
  "!h-12 min-h-12 w-full rounded-md border-sand/60 bg-card px-4 text-sm shadow-sm"

export function LeadFilters({
  params,
  trips,
  profiles,
}: {
  params: {
    q?: string
    status?: string
    trip?: string
    owner?: string
    perPage?: string
  }
  trips: Trip[]
  profiles: Profile[]
}) {
  const [statusValue, setStatusValue] = useState(params.status || allValue)
  const [tripValue, setTripValue] = useState(params.trip || allValue)
  const [ownerValue, setOwnerValue] = useState(params.owner || allValue)

  return (
    <form
      id="lead-filters"
      className="grid gap-3 rounded-t-lg border-b border-sand/45 bg-card p-5 sm:grid-cols-2 xl:grid-cols-[1.8fr_0.75fr_0.75fr_0.75fr_auto_auto]"
    >
      <input type="hidden" name="perPage" value={params.perPage ?? "10"} />
      <label className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink/56" />
        <Input
          name="q"
          defaultValue={params.q}
          placeholder="Search by traveller name, email, phone or trip..."
          className="h-12 rounded-md border-sand/60 bg-card px-4 pr-11 shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </label>

      <input type="hidden" name="status" value={statusValue === allValue ? "" : statusValue} />
      <Select value={statusValue} onValueChange={setStatusValue}>
        <SelectTrigger className={selectClass}>
          <span className="mr-1 size-2.5 rounded-full border-2 border-[#ec9f00]" />
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={8}>
          <SelectItem value={allValue}>All statuses</SelectItem>
          {leadStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {statusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input type="hidden" name="trip" value={tripValue === allValue ? "" : tripValue} />
      <Select value={tripValue} onValueChange={setTripValue}>
        <SelectTrigger className={selectClass}>
          <SlidersHorizontal className="mr-1 size-4 text-olive" />
          <SelectValue placeholder="All trips" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={8}>
          <SelectItem value={allValue}>All trips</SelectItem>
          {trips.map((trip) => (
            <SelectItem key={trip.id} value={trip.id}>
              {trip.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input type="hidden" name="owner" value={ownerValue === allValue ? "" : ownerValue} />
      <Select value={ownerValue} onValueChange={setOwnerValue}>
        <SelectTrigger className={selectClass}>
          <UserRound className="mr-1 size-4 text-ink/65" />
          <SelectValue placeholder="All owners" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={8}>
          <SelectItem value={allValue}>All owners</SelectItem>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name || profile.email}
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
      {params.q || params.status || params.trip || params.owner ? (
        <Button
          asChild
          variant="outline"
          className="h-12 border-sand/60 bg-card px-5 text-ink hover:bg-cream"
        >
          <Link href="/admin/leads">Clear</Link>
        </Button>
      ) : null}
    </form>
  )
}
