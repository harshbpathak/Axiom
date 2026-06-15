# Axiom (The Computational Co-Founder)

## Project Overview
Axiom is an agentic AI workspace that combines Gemini reasoning with Wolfram-verified math for financial runway optimization. It acts as a computational co-founder, providing actionable financial insights for startups by projecting runway and determining optimal pricing strategies.

## Problem Statement
Startups and founders often rely on "guesstimates" or LLM hallucinations when projecting financial runway and pricing. Traditional LLMs are notoriously bad at precise mathematics. Axiom solves this by routing complex financial computations directly to a local Wolfram Engine, ensuring mathematical perfection while still leveraging the conversational and strategic power of Gemini AI.

## Features
- **Financial Metrics Input**: Easy-to-use form for tracking Cash Reserve, Monthly Burn, Monthly Revenue, and Strategic Goals.
- **Agent Swarm Terminal**: Live feed showing the internal thought process of the AI agents working on your data.
- **Verified Runway Forecast**: A beautiful interactive chart showing cash balance trajectory powered by Wolfram `TimeSeriesForecast`.
- **Actionable Insights**: Executive summary and mathematically verified cards indicating optimal price points, projected runway, and revenue gap.
- **Hybrid AI Architecture**: Seamless handoffs between Gemini (Strategy & Synthesis) and Wolfram Engine (Quantitative Analysis).

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Python, FastAPI, Uvicorn
- **AI / LLM Framework**: LangGraph, Google Gemini (1.5 Pro & Flash)
- **Computation**: Wolfram Engine (Local Kernel)
- **Deployment**: AWS EC2 (Ubuntu), PM2, Nginx

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Environment Variables
echo "GEMINI_API_KEY=your_key_here" > .env
echo "WOLFRAM_MODE=local_kernel" >> .env

# Run the server
uvicorn main:app --reload --port 8000
```
*API docs available at: http://localhost:8000/docs*

### 2. Frontend Setup
```bash
cd app

# Environment Variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the UI
pnpm install
pnpm dev
```
*Open http://localhost:3000 to view the application.*

## Team Details
- Harsh Pathak

## Demo Link
Live Deployment: [http://ec2-13-51-241-71.eu-north-1.compute.amazonaws.com](http://ec2-13-51-241-71.eu-north-1.compute.amazonaws.com)
*(Running on AWS EC2)*
