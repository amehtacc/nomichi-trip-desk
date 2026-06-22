import { Inbox } from "lucide-react"

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-sand/65 bg-cream/55 p-6 text-center">
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#f4eadb] text-primary">
        <Inbox className="size-5" />
      </span>
      <p className="mt-4 font-display text-xl font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/58">
        {description}
      </p>
    </div>
  )
}
