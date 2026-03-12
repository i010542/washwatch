/**
 * generate-brief.js — Weekly AI Intelligence Brief Generator 🌰
 *
 * Uses GitHub Models (gpt-4o-mini, free via GITHUB_TOKEN) to synthesise
 * the week's wash trading / market manipulation events into a concise
 * analyst-grade intelligence brief, then saves to data/brief.json.
 */

import { readFile, writeFile } from "fs/promises"
import { existsSync } from "fs"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN is required for GitHub Models")
  process.exit(1)
}

const MODELS_API = "https://models.inference.ai.azure.com/chat/completions"
const MODEL = "gpt-4o-mini"

async function loadRecentEvents(days = 7) {
  const file = "data/events.json"
  if (!existsSync(file)) return []
  const raw = await readFile(file, "utf-8")
  const all = JSON.parse(raw)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return all.filter(e => new Date(e.timestamp) > cutoff)
}

function buildPrompt(events) {
  const byTopic = {}
  for (const e of events) {
    const label = e.topicLabel || e.topic || "market_manipulation"
    if (!byTopic[label]) byTopic[label] = []
    byTopic[label].push(`[${e.timestamp?.slice(0, 10)}] ${e.eventSummary}`)
  }

  const sections = Object.entries(byTopic)
    .map(([topic, items]) => `### ${topic.replace(/_/g, " ").toUpperCase()}\n${items.slice(0, 10).join("\n")}`)
    .join("\n\n")

  return `You are a senior crypto market surveillance analyst. Based on the following intelligence signals from the past 7 days, write a concise weekly brief (300-400 words) covering:

1. **Key Incidents** — Most significant wash trading / market manipulation events detected
2. **Exchanges at Risk** — Which exchanges or tokens appear most frequently  
3. **Pattern Analysis** — Recurring patterns or escalating trends
4. **Analyst Outlook** — Short 2-3 sentence assessment of market integrity risk

Keep the tone objective and factual. Format with clear headers. End with a risk level: 🟢 LOW / 🟡 MEDIUM / 🔴 HIGH.

SIGNALS:
${sections || "No new signals this week."}

Write the intelligence brief now:`
}

async function generateBrief(events) {
  const prompt = buildPrompt(events)

  const response = await fetch(MODELS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional crypto market surveillance analyst specializing in wash trading detection and market manipulation patterns. 🌰"
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 600,
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`GitHub Models API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "Brief generation failed."
}

async function main() {
  try {
    const events = await loadRecentEvents(7)
    console.log(`Generating brief for ${events.length} events from last 7 days...`)

    const briefText = await generateBrief(events)
    console.log("Brief generated successfully")

    const brief = {
      generatedAt: new Date().toISOString(),
      model: MODEL,
      eventsAnalysed: events.length,
      brief: briefText
    }

    await writeFile("data/brief.json", JSON.stringify(brief, null, 2))
    console.log("Saved to data/brief.json")
  } catch (error) {
    console.error("Brief generation failed:", error.message)
    process.exit(1)
  }
}

main()
