"use client"

import { useEffect, useState, useTransition } from "react"
import { updateLeadOwner } from "@/app/actions"
import type { Profile } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const unassignedValue = "unassigned"

export function OwnerSelect({
  leadId,
  ownerId,
  profiles,
}: {
  leadId: string
  ownerId: string | null
  profiles: Profile[]
}) {
  const [value, setValue] = useState(ownerId ?? unassignedValue)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(() => setMessage(""), 5000)
    return () => window.clearTimeout(timer)
  }, [message])

  function changeOwner(nextOwner: string) {
    setValue(nextOwner)
    setMessage("")
    startTransition(async () => {
      const result = await updateLeadOwner({
        lead_id: leadId,
        owner_id: nextOwner === unassignedValue ? null : nextOwner,
      })
      setMessage(result.ok ? "" : result.message)
      if (!result.ok) setValue(ownerId ?? unassignedValue)
    })
  }

  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={changeOwner} disabled={isPending}>
        <SelectTrigger className="!h-10 min-h-10 w-full min-w-40 rounded-md border-sand/60 bg-card px-3 text-sm shadow-sm">
          <SelectValue placeholder="Assign owner" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={8}>
          <SelectItem value={unassignedValue}>Unassigned</SelectItem>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name || profile.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  )
}
