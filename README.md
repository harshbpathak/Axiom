# Axiom

**Axiom (The Computational Co-Founder)** is an agentic AI workspace that combines Gemini reasoning with Wolfram-verified math for financial runway optimization.

## Project Structure

```
Axiom/
├── app/          # Next.js frontend (Mission Control UI)
├── backend/      # FastAPI + LangGraph agent pipeline
└── docs/         # Specifications and execution plan
```

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Add your GEMINI_API_KEY to .env

python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd app
cp .env.example .env.local

pnpm install
pnpm dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | `backend/.env` | Google Gemini API key (Strategist + Architect agents) |
| `WOLFRAM_LICENSE_PATH` | `backend/.env` | Optional Wolfram Engine license path |
| `NEXT_PUBLIC_API_URL` | `app/.env.local` | Backend URL (default: `http://localhost:8000`) |

## Architecture

1. **Strategist** (Gemini 1.5 Pro) — extracts variables from user metrics and goal
2. **Quant** (Wolfram Engine) — runs `TimeSeriesForecast` and pricing optimization
3. **Architect** (Gemini 1.5 Flash) — synthesizes verified results into executive summary

If Wolfram is unavailable, the Quant agent falls back to deterministic Python math.

## MVP Features

- Financial metrics input form (cash, burn, revenue, goal)
- Live agent swarm terminal feed during computation
- Runway projection chart (historical + Wolfram forecast)
- 3 actionable insight cards with verified numbers
