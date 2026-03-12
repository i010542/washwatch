# 🌰 WashWatch — Crypto Wash Trading Intelligence Monitor

> Automated surveillance of wash trading, market manipulation, and fake volume signals across cryptocurrency exchanges.

**Live Dashboard:** https://i010542.github.io/washwatch/

---

## 🌰 What Is WashWatch?

Crypto wash trading is estimated to inflate reported exchange volumes by **70–95%**, yet no dedicated AI product monitors it in real-time. WashWatch fills that gap.

Every week, WashWatch automatically:
1. **Fetches intelligence** from the CPW Tracker API across 3 topics: wash trading, market manipulation, and fake volume
2. **Merges with 90-day rolling history** (with deduplication to avoid noise)
3. **Generates an AI brief** using GitHub Models (gpt-4o-mini, free via built-in `GITHUB_TOKEN`)
4. **Deploys a live dashboard** to GitHub Pages — fully automated, no manual steps

---

## 🌰 Why This Matters

Reviewing crypto intelligence products reveals a gap: most focus on **security breaches and exploits**. None address the daily integrity problem of **wash trading**, which distorts every market health metric analysts rely on.

WashWatch monitors exactly what dn-institute's mission requires: **market integrity at the trading layer.**

---

## 🌰 Features

| Feature | Description |
|---------|-------------|
| 🔴 Wash Trading Monitor | Self-trading, round-trip trades, suspicious volume spikes |
| 🟠 Market Manipulation | Coordinated pumps, layering, spoofing patterns |
| 🟡 Fake Volume Detection | Academic and industry research on inflated metrics |
| 🤖 Weekly AI Brief | GPT-4o-mini summarises the week's signals into analyst-grade intelligence |
| 📊 Live Dashboard | GitHub Pages dashboard with filters, event feed, risk level indicator |
| ⚡ Zero-Config AI | GitHub Models via built-in `GITHUB_TOKEN` — no extra secrets needed |

---

## 🌰 Setup

1. **Use this template**: Click the "Use this template" button above
2. **Subscribe to CPW API**: Go to [CPW Tracker on RapidAPI](https://rapidapi.com/CPWatch/api/cpw-tracker) and subscribe to the `Basic` plan (100 free requests/month)
3. **Add API key secret**: Go to `Settings → Secrets → Actions`, add `RAPIDAPI_KEY`
4. **Enable GitHub Pages**: Go to `Settings → Pages`, set source to **GitHub Actions**
5. **Trigger first run**: Go to `Actions → WashWatch Weekly Update → Run workflow`

That's it. Your live dashboard will be at `https://[your-username].github.io/washwatch/` 🌰

---

## 🌰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Data | [CPW Tracker API](https://rapidapi.com/CPWatch/api/cpw-tracker) — cryptocurrency exchanges × 3 manipulation topics |
| AI | [GitHub Models](https://github.com/marketplace/models) (gpt-4o-mini) — free via built-in `GITHUB_TOKEN` |
| Automation | GitHub Actions — weekly cron every Monday 08:00 UTC |
| Frontend | Vanilla HTML/CSS/JS — zero dependencies, dark theme, mobile-responsive |
| Deploy | GitHub Pages — auto-deploys on every run |

---

## 🌰 Data Structure

Events are stored in `data/events.json`:
```json
[
  {
    "timestamp": "2026-03-10T09:00:00.000Z",
    "entities": "cryptocurrency exchanges",
    "topic": "wash trading",
    "topicLabel": "wash_trading",
    "eventSummary": "Description of the event...\nSources:\n- https://source.url"
  }
]
```

The AI brief is stored in `data/brief.json`:
```json
{
  "generatedAt": "2026-03-10T10:00:00.000Z",
  "model": "gpt-4o-mini",
  "eventsAnalysed": 5,
  "brief": "## Weekly Intelligence Brief\n..."
}
```

---

## 🌰 Schedule

| Event | When |
|-------|------|
| Data fetch + AI brief | Every Monday at 08:00 UTC |
| Dashboard deploy | Every push to `main` + every Monday |
| Manual trigger | Any time via `Actions → Run workflow` |

---

*Built with 🌰 for the [dn-institute](https://dn.institute) ecosystem — tracking crypto market integrity since 2024.*
