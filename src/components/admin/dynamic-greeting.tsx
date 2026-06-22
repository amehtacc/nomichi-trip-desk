"use client"

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 5) return "Good night"
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  if (hour < 21) return "Good evening"
  return "Good night"
}

export function DynamicGreeting({ name }: { name: string }) {
  return (
    <h1
      suppressHydrationWarning
      className="font-display text-4xl font-bold tracking-tight text-ink"
    >
      {getGreeting()}, {name}
    </h1>
  )
}
