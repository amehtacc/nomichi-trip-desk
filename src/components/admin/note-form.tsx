"use client"

import { useActionState, useEffect, useRef } from "react"
import { addNote } from "@/app/actions"
import { initialActionState } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AutoDismissMessage } from "@/components/auto-dismiss-message"

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(addNote, initialActionState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="lead_id" value={leadId} />
      <Textarea
        name="content"
        rows={4}
        placeholder="Add what happened on the call, what matters to them, and the next follow-up."
        disabled={pending}
        className="min-h-28 rounded-md border-sand/60 bg-card px-4 py-3 shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-primary/20"
      />
      {state.message ? (
        <AutoDismissMessage
          key={`${state.ok}-${state.message}`}
          className={
            state.ok ? "text-sm text-olive" : "text-sm text-destructive"
          }
        >
          {state.message}
        </AutoDismissMessage>
      ) : null}
      <Button
        type="submit"
        className="h-10 bg-ink text-cream hover:bg-primary"
        disabled={pending}
      >
        {pending ? "Saving note" : "Save note"}
      </Button>
    </form>
  )
}
