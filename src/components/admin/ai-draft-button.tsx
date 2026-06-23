"use client"

import { useEffect, useState, useTransition } from "react"
import { Copy, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AiDraftButton({ leadId }: { leadId: string }) {
  const [draft, setDraft] = useState("")
  const [message, setMessage] = useState("")
  const [tone, setTone] = useState("friendly")
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
        body: JSON.stringify({ lead_id: leadId, tone }),
      })
      const payload = await response.json()

      if (!response.ok) {
        setMessage("We could not write a draft right now. Please try again.")
        return
      }

      setDraft(payload.message)
    })
  }

  async function copyDraft() {
    if (!draft) return

    try {
      await navigator.clipboard.writeText(draft)
      setMessage("Draft copied. Review it once before sending.")
    } catch {
      setMessage("Copy did not work here. Select the message and copy it.")
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <span className="text-sm font-bold text-ink">AI Assistant</span>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700">
          Beta
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
        <p className="text-xs font-bold text-ink">Generate WhatsApp Draft</p>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger className="!h-8 min-h-8 w-full rounded-md border-sand/55 bg-card px-2 text-xs shadow-none sm:w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={8} className="max-h-56">
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="calm">Calm</SelectItem>
            <SelectItem value="concise">Concise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {draft ? (
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={5}
          aria-label="Generated WhatsApp draft"
          className="mt-3 min-h-32 rounded-md border-sand/60 bg-card px-3 py-3 text-sm leading-6 shadow-sm transition-all duration-300 ease-out focus-visible:border-primary focus-visible:ring-primary/20 sm:px-4"
        />
      ) : (
        <div className="mt-3 rounded-md border border-dashed border-sand/70 bg-cream/45 p-4 text-sm leading-6 text-muted-foreground">
          Generate a short first message using this traveller&apos;s enquiry and
          trip details.
        </div>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={generate}
          className="h-9 rounded-md border-sand/65 bg-card text-xs text-ink hover:border-primary/30 hover:bg-primary/8"
          disabled={isPending}
        >
          <RefreshCw className={isPending ? "size-3.5 animate-spin" : "size-3.5"} />
          {draft ? "Regenerate" : "Generate"}
        </Button>
        <Button
          type="button"
          onClick={copyDraft}
          className="h-9 rounded-md bg-primary text-xs text-primary-foreground hover:bg-primary/85"
          disabled={!draft}
        >
          <Copy className="size-3.5" />
          Copy Message
        </Button>
      </div>
      {message ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{message}</p>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        AI-generated content. Please review before sending.
      </p>
    </div>
  )
}
