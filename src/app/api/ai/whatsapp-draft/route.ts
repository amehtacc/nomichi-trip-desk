import { NextResponse } from "next/server"
import { getLead, requireUser } from "@/lib/data"

type RequestBody = {
  lead_id?: string
  tone?: string
}

export async function POST(request: Request) {
  await requireUser()

  const body = (await request.json()) as RequestBody
  if (!body.lead_id) {
    return NextResponse.json(
      { error: "Choose a lead before writing a draft." },
      { status: 400 }
    )
  }

  const tone =
    body.tone === "calm" || body.tone === "concise" ? body.tone : "friendly"

  const lead = await getLead(body.lead_id)
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 })
  }

  const prompt = [
    "Write a first WhatsApp message for a Nomichi travel associate.",
    "Requirements: warm, short, human sounding, calm, specific, no emojis, no marketing language, no exclamation marks.",
    `Tone: ${tone}.`,
    `Traveller name: ${lead.name}`,
    `Trip name: ${lead.trips?.name ?? "Selected trip"}`,
    `Destination: ${lead.trips?.destination ?? "Destination"}`,
    `Expectation: ${lead.expectation || "Not shared yet"}`,
  ].join("\n")

  try {
    if (process.env.OPENAI_API_KEY) {
      const message = await generateWithOpenAI(prompt)
      return NextResponse.json({ message })
    }

    if (process.env.GEMINI_API_KEY) {
      const message = await generateWithGemini(prompt)
      return NextResponse.json({ message })
    }

    return NextResponse.json({
      message: fallbackDraft({
        name: lead.name,
        trip: lead.trips?.name ?? "the trip",
        destination: lead.trips?.destination ?? "the destination",
        expectation: lead.expectation,
        tone,
      }),
    })
  } catch (error) {
    void error
    return NextResponse.json(
      {
        error: "We could not write a draft right now. Please try again.",
      },
      { status: 500 }
    )
  }
}

async function generateWithOpenAI(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      instructions:
        "You write concise WhatsApp drafts for Nomichi. Return only the message.",
      input: prompt,
      max_output_tokens: 180,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message ?? "OpenAI request failed.")
  }

  return extractOpenAIText(data)
}

async function generateWithGemini(prompt: string) {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "You write concise WhatsApp drafts for Nomichi. Return only the message.",
            },
          ],
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 180,
          temperature: 0.7,
        },
      }),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Gemini request failed.")
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Gemini returned an empty draft.")
  return text.trim()
}

function extractOpenAIText(data: {
  output_text?: string
  output?: Array<{
    content?: Array<{ text?: string }>
  }>
}) {
  if (data.output_text) return data.output_text.trim()

  const text = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text)
    .filter(Boolean)
    .join("\n")

  if (!text) throw new Error("OpenAI returned an empty draft.")
  return text.trim()
}

function fallbackDraft({
  name,
  trip,
  destination,
  expectation,
  tone,
}: {
  name: string
  trip: string
  destination: string
  expectation: string
  tone: string
}) {
  const opener =
    tone === "concise"
      ? `Hi ${name}, this is Nomichi.`
      : tone === "calm"
        ? `Hi ${name}, this is from Nomichi. I read your enquiry carefully.`
        : `Hi ${name}, this is from Nomichi.`

  if (!expectation.trim()) {
    return `${opener} Thanks for asking about ${trip} in ${destination}. I would love to understand what pace, comfort, and kind of group you have in mind before suggesting the next step.`
  }

  return `${opener} I read your note about wanting ${expectation.toLowerCase()}. ${trip} in ${destination} could be a good fit. I would love to understand what pace and comfort you have in mind before suggesting the next step.`
}
