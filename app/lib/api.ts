import type { ComputationResponse, StrategyInput, HealthResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/api/v1/health`);
  if (!response.ok) throw new Error("Health check failed");
  return response.json();
}

export async function computeStrategy(
  input: StrategyInput
): Promise<ComputationResponse> {
  const response = await fetch(`${API_BASE}/api/v1/strategy/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Strategy computation failed");
  }

  return response.json();
}

export async function computeStrategyStream(
  input: StrategyInput,
  onStep: (message: string) => void
): Promise<ComputationResponse> {
  const response = await fetch(`${API_BASE}/api/v1/strategy/compute/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to start strategy stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: ComputationResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split(/\r?\n\r?\n/);
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split(/\r?\n/);
      let event = "message";
      let data = "";

      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }

      if (event === "step" && data) onStep(data);
      if (event === "complete" && data) result = JSON.parse(data);
      if (event === "error" && data) throw new Error(data);
    }
  }

  if (!result) throw new Error("Stream ended without a result");
  return result;
}
