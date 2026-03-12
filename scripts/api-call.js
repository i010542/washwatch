import { writeFile, mkdir, readFile } from "fs/promises"
import { existsSync } from "fs"

const API_URL = "https://cpw-tracker.p.rapidapi.com/"
const API_KEY = process.env.RAPIDAPI_KEY

if (!API_KEY) {
  console.error("Error: RAPIDAPI_KEY environment variable is required")
  process.exit(1)
}

const TOPICS = [
  { topic: "wash trading",       label: "wash_trading" },
  { topic: "market manipulation", label: "market_manipulation" },
  { topic: "fake volume",        label: "fake_volume" },
]

/**
 * Get start and end dates for data fetch (last 7 days for weekly run)
 */
function getDateRange() {
  const now = new Date()
  const endTime = now
  const startTime = new Date(now)
  startTime.setDate(startTime.getDate() - 7)
  return {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  }
}

/**
 * Fetch events for a single topic
 */
async function fetchTopic(topic) {
  const { startTime, endTime } = getDateRange()
  console.log(`Fetching topic="${topic}" for ${startTime} → ${endTime}`)

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": "cpw-tracker.p.rapidapi.com",
      "x-rapidapi-key": API_KEY,
    },
    body: JSON.stringify({
      entities: "cryptocurrency exchanges",
      topic,
      startTime,
      endTime
    }),
  })

  if (!response.ok) {
    console.warn(`API request failed for "${topic}": ${response.status}`)
    return []
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

/**
 * Merge new events with existing historical data (keep last 90 days)
 */
async function mergeWithHistory(newEvents) {
  const historyFile = "data/events.json"
  let existing = []

  if (existsSync(historyFile)) {
    try {
      const raw = await readFile(historyFile, "utf-8")
      existing = JSON.parse(raw)
    } catch {
      existing = []
    }
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)

  // Deduplicate by timestamp+topic+entity
  const seen = new Set(existing.map(e => `${e.timestamp}|${e.topic}|${e.eventSummary?.slice(0, 50)}`))
  const fresh = newEvents.filter(e => {
    const key = `${e.timestamp}|${e.topic}|${e.eventSummary?.slice(0, 50)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const merged = [...existing, ...fresh]
    .filter(e => new Date(e.timestamp) > cutoff)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return merged
}

async function updateData() {
  try {
    const allEvents = []

    for (const { topic, label } of TOPICS) {
      const events = await fetchTopic(topic)
      const tagged = events.map(e => ({ ...e, topicLabel: label }))
      allEvents.push(...tagged)
      console.log(`  → ${events.length} events for "${topic}"`)
    }

    const merged = await mergeWithHistory(allEvents)
    await mkdir("data", { recursive: true })
    await writeFile("data/events.json", JSON.stringify(merged, null, 2))
    console.log(`Saved ${merged.length} total events to data/events.json`)

    // Write metadata
    const meta = {
      lastUpdated: new Date().toISOString(),
      totalEvents: merged.length,
      newEventsThisRun: allEvents.length,
      topics: TOPICS.map(t => t.label)
    }
    await writeFile("data/meta.json", JSON.stringify(meta, null, 2))
    console.log("Update completed successfully")
  } catch (error) {
    console.error("Update failed:", error.message)
    process.exit(1)
  }
}

updateData()
