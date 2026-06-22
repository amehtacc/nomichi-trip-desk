"use client"

import { useState } from "react"
import { tripStatusLabels, tripStatuses } from "@/lib/constants"
import type { TripStatus } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TripStatusSelect({ status }: { status: TripStatus }) {
  const [value, setValue] = useState(status)

  return (
    <>
      <input type="hidden" name="status" value={value} />
      <Select value={value} onValueChange={(next) => setValue(next as TripStatus)}>
        <SelectTrigger className="!h-11 min-h-11 w-full rounded-md border-sand/60 bg-card px-4 text-sm shadow-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={8}>
          {tripStatuses.map((item) => (
            <SelectItem key={item} value={item}>
              {tripStatusLabels[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
