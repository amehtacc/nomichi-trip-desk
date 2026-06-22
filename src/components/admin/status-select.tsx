"use client"

import { useEffect, useState, useTransition } from "react"
import { updateLeadStatus } from "@/app/actions"
import { leadStatuses, statusLabels } from "@/lib/constants"
import type { LeadStatus } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function StatusSelect({
  leadId,
  status,
}: {
  leadId: string
  status: LeadStatus
}) {
  const [value, setValue] = useState(status)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(() => setMessage(""), 5000)
    return () => window.clearTimeout(timer)
  }, [message])

  function changeStatus(nextStatus: LeadStatus) {
    setValue(nextStatus)
    setMessage("")
    startTransition(async () => {
      const result = await updateLeadStatus({
        lead_id: leadId,
        status: nextStatus,
      })
      setMessage(result.ok ? "" : result.message)
      if (!result.ok) setValue(status)
    })
  }

  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={changeStatus} disabled={isPending}>
        <SelectTrigger className="!h-10 min-h-10 w-full min-w-36 rounded-md border-sand/60 bg-card px-3 text-sm shadow-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={8}>
          {leadStatuses.map((item) => (
            <SelectItem key={item} value={item}>
              {statusLabels[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  )
}
