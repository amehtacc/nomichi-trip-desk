import type { leadStatuses, tripStatuses } from "@/lib/constants"

export type LeadStatus = (typeof leadStatuses)[number]
export type TripStatus = (typeof tripStatuses)[number]

export type Profile = {
  id: string
  email: string
  name: string | null
  role: string | null
  created_at: string
}

export type Trip = {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  price: number
  total_seats: number
  status: TripStatus
  description: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export type Lead = {
  id: string
  name: string
  phone: string
  email: string
  trip_id: string
  group_type: string
  preferred_month: string
  expectation: string
  status: LeadStatus
  owner_id: string | null
  created_at: string
  updated_at: string
}

export type Note = {
  id: string
  lead_id: string
  author_id: string
  content: string
  created_at: string
}

export type LeadWithTripOwner = Lead & {
  trips: Pick<Trip, "id" | "name" | "destination" | "image_url"> | null
  profiles: Pick<Profile, "id" | "name" | "email"> | null
}

export type NoteWithAuthor = Note & {
  profiles: Pick<Profile, "id" | "name" | "email"> | null
}

export type NotificationItem = {
  id: string
  title: string
  body: string
  href?: string
}
