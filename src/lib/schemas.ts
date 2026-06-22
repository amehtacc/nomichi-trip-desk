import { z } from "zod"
import { leadStatuses, tripStatuses } from "@/lib/constants"

const phoneRegex = /^\+?[0-9\s-]{10,16}$/

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Tell us your name."),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number."),
  email: z.string().trim().email("Enter a valid email address."),
  trip_id: z.string().uuid("Choose a trip."),
  group_type: z.string().trim().min(1, "Choose a group type."),
  preferred_month: z.string().trim().min(2, "Tell us your preferred month."),
  expectation: z.string().trim().optional().default(""),
})

export const tripSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Trip name is required."),
  destination: z.string().trim().min(2, "Destination is required."),
  start_date: z.string().min(1, "Start date is required."),
  end_date: z.string().min(1, "End date is required."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  total_seats: z.coerce.number().int().min(1, "Seats must be at least 1."),
  status: z.enum(tripStatuses),
  description: z.string().trim().min(20, "Add a useful short description."),
  image_url: z.string().url().optional().or(z.literal("")),
})

export const leadStatusSchema = z.object({
  lead_id: z.string().uuid(),
  status: z.enum(leadStatuses),
})

export const ownerSchema = z.object({
  lead_id: z.string().uuid(),
  owner_id: z.string().uuid().nullable(),
})

export const noteSchema = z.object({
  lead_id: z.string().uuid(),
  content: z.string().trim().min(3, "Add a note before saving."),
})

export type ActionState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string[] | undefined>
}

export const initialActionState: ActionState = {
  ok: false,
  message: "",
}
