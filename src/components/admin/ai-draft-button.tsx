"use client"

import { useEffect, useState, useTransition } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function AiDraftButton({ leadId }: { leadId: string }) {
  const [draft, setDraft] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(() => setMessage(""), 5000)
    return () => window.clearTimeout(timer)
  }, [message])

  function generate() {
    setMessage("")
    startTransition(async () => {
      const response = await fetch("/api/ai/whatsapp-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      })
      const payload = await response.json()

      if (!response.ok) {
        setMessage("We could not write a draft right now. Please try again.")
        return
      }

      setDraft(payload.message)
    })
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={generate}
        className="bg-ink text-cream hover:bg-primary"
        disabled={isPending}
      >
        <Sparkles className="size-4" />
        {isPending ? "Writing draft" : "Generate WhatsApp message"}
      </Button>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
      {draft ? (
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={5}
          aria-label="Generated WhatsApp draft"
          className="rounded-md border-sand/60 bg-card px-4 py-3 shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-primary/20"
        />
      ) : null}
    </div>
  )
}
