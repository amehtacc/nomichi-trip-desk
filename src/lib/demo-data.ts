import type { LeadWithTripOwner, NoteWithAuthor, Profile, Trip } from "@/lib/types"

export const demoProfiles: Profile[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "maya@thenomichi.com",
    name: "Maya",
    role: "associate",
    created_at: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "kabir@thenomichi.com",
    name: "Kabir",
    role: "associate",
    created_at: "2026-06-01T08:00:00.000Z",
  },
]

export const demoTrips: Trip[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "Kashmir in Slow Motion",
    destination: "Kashmir",
    start_date: "2026-05-20",
    end_date: "2026-05-27",
    price: 24500,
    total_seats: 8,
    status: "OPEN",
    description:
      "Lakes, meadows and quiet mountain towns.",
    image_url: null,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    name: "Goa Beyond the Beaches",
    destination: "Goa",
    start_date: "2026-06-10",
    end_date: "2026-06-15",
    price: 18900,
    total_seats: 6,
    status: "OPEN",
    description:
      "Slow down in villages, forts and secret shores.",
    image_url: null,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    name: "Tawang and the Hidden Himalayas",
    destination: "Arunachal Pradesh",
    start_date: "2026-07-05",
    end_date: "2026-07-12",
    price: 27900,
    total_seats: 7,
    status: "OPEN",
    description:
      "High passes, old monasteries and raw landscapes.",
    image_url: null,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-01T08:00:00.000Z",
  },
  {
    id: "99999999-9999-9999-9999-999999999999",
    name: "Rajasthan Unhurried",
    destination: "Rajasthan",
    start_date: "2026-08-18",
    end_date: "2026-08-24",
    price: 21500,
    total_seats: 10,
    status: "OPEN",
    description:
      "Havelis, local stories and timeless desert towns.",
    image_url: null,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-01T08:00:00.000Z",
  },
]

export const demoLeads: LeadWithTripOwner[] = [
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    name: "Aarav Mehta",
    phone: "+919876543210",
    email: "aarav@example.com",
    trip_id: demoTrips[0].id,
    group_type: "Solo",
    preferred_month: "September",
    expectation:
      "I want something quiet, scenic, and not packed with too many activities.",
    status: "QUALIFIED",
    owner_id: demoProfiles[0].id,
    created_at: "2026-06-18T09:30:00.000Z",
    updated_at: "2026-06-19T11:10:00.000Z",
    trips: demoTrips[0],
    profiles: demoProfiles[0],
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    name: "Naina Rao",
    phone: "+919111112222",
    email: "naina@example.com",
    trip_id: demoTrips[1].id,
    group_type: "Friends",
    preferred_month: "August",
    expectation:
      "A reset with rain, forest, good food, and enough free time to write.",
    status: "NEW",
    owner_id: null,
    created_at: "2026-06-20T07:45:00.000Z",
    updated_at: "2026-06-20T07:45:00.000Z",
    trips: demoTrips[1],
    profiles: null,
  },
]

export const demoNotes: NoteWithAuthor[] = [
  {
    id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    lead_id: demoLeads[0].id,
    author_id: demoProfiles[0].id,
    content:
      "Called traveller. Interested in photography and slower itineraries. Follow up on Monday.",
    created_at: "2026-06-19T11:10:00.000Z",
    profiles: demoProfiles[0],
  },
]
