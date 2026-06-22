export const brand = {
  rust: "#D55D27",
  yellow: "#FFFE00",
  ink: "#1C1B1A",
  olive: "#45471D",
  sand: "#D1B788",
  cream: "#FFFBF5",
}

export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "VIBE_CHECK",
  "SENT",
  "CONFIRMED",
  "NOT_A_FIT",
] as const

export const tripStatuses = ["OPEN", "CLOSED"] as const

export const tripStatusLabels: Record<(typeof tripStatuses)[number], string> = {
  OPEN: "Open",
  CLOSED: "Closed",
}

export const groupTypes = [
  "Solo",
  "Couple",
  "Friends",
  "Family",
  "Custom group",
] as const

export const statusLabels: Record<(typeof leadStatuses)[number], string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  VIBE_CHECK: "Vibe check",
  SENT: "Sent",
  CONFIRMED: "Confirmed",
  NOT_A_FIT: "Not a fit",
}
