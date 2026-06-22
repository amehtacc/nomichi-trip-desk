import { NextResponse, type NextRequest } from "next/server"
import { statusLabels } from "@/lib/constants"
import { getLeads } from "@/lib/data"
import { formatDateTime } from "@/lib/format"

const columns = [
  "Name",
  "Email",
  "Phone",
  "Trip",
  "Destination",
  "Status",
  "Owner",
  "Group Type",
  "Preferred Month",
  "Expectation",
  "Created",
  "Updated",
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const leads = await getLeads({
    query: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    trip: searchParams.get("trip") ?? undefined,
    owner: searchParams.get("owner") ?? undefined,
  })

  const rows = leads.map((lead) => [
    lead.name,
    lead.email,
    lead.phone,
    lead.trips?.name ?? "Trip not selected",
    lead.trips?.destination ?? "Needs team review",
    statusLabels[lead.status],
    lead.profiles?.name ?? lead.profiles?.email ?? "Unassigned",
    lead.group_type,
    lead.preferred_month,
    lead.expectation,
    formatDateTime(lead.created_at),
    formatDateTime(lead.updated_at),
  ])
  const csv = [columns, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nomichi-leads-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  })
}

function escapeCsvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}
