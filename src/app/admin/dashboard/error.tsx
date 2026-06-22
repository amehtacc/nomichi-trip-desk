"use client"

import { RotateCcw } from "lucide-react"

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <section className="rounded-lg border border-sand/60 bg-card p-8 text-center shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Dashboard paused
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">
        We could not load the dashboard right now.
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink/62">
        The workspace data did not arrive cleanly. Try again, and if it keeps
        happening, check that the workspace database connection and access
        rules are ready.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 cursor-pointer items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-cream transition-colors duration-300 ease-out hover:bg-ink"
      >
        <RotateCcw className="size-4" />
        Try again
      </button>
    </section>
  )
}
