"use client"

import { useRouter } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const selectClass =
  "!h-12 min-h-12 max-h-12 w-full rounded-md border border-sand/55 bg-cream/95 px-4 py-0 text-sm leading-none shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15"

const selectContentClass =
  "max-h-56 w-[var(--radix-select-trigger-width)] min-w-0 max-w-[var(--radix-select-trigger-width)]"

type TripBrowserFiltersProps = {
  query: string
  destination: string
  sort: string
  destinations: string[]
}

export function TripBrowserFilters({
  query,
  destination,
  sort,
  destinations,
}: TripBrowserFiltersProps) {
  const router = useRouter()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(window.location.search)

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/trips${params.toString() ? `?${params.toString()}` : ""}`)
  }

  return (
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

      <Select
        value={destination || "all"}
        onValueChange={(value) =>
          updateFilter("destination", value === "all" ? "" : value)
        }
      >
        <SelectTrigger className={selectClass}>
          <SelectValue placeholder="All destinations" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className={selectContentClass}
        >
          <SelectItem value="all">All destinations</SelectItem>
          {destinations.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(value) => updateFilter("sort", value)}>
        <SelectTrigger className={selectClass}>
          <SelectValue placeholder="Soonest first" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className={selectContentClass}
        >
          <SelectItem value="soonest">Soonest first</SelectItem>
          <SelectItem value="price-low">Price low to high</SelectItem>
          <SelectItem value="price-high">Price high to low</SelectItem>
          <SelectItem value="seats-low">Fewest seats left</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="submit"
        className="h-12 rounded-md bg-primary px-6 text-cream shadow-sm hover:bg-ink"
      >
        <SlidersHorizontal className="size-4" />
        Apply
      </Button>
    </form>
  )
}
