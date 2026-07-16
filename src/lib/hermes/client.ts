// Hermes Agent API client — OpenAI-compatible format.
// Connects to the Hermes Agent API server (default: http://127.0.0.1:8642/v1).
// Uses HERMES_API_URL, HERMES_API_KEY, and HERMES_MODEL env vars.

export interface HermesChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface HermesCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

export interface HermesModel {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

export interface HermesCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const DEFAULT_URL = "http://127.0.0.1:8642/v1";
const DEFAULT_MODEL = "hermes-agent";

function getConfig() {
  return {
    baseUrl: (process.env.HERMES_API_URL || DEFAULT_URL).replace(/\/$/, ""),
    apiKey: process.env.HERMES_API_KEY || "",
    model: process.env.HERMES_MODEL || DEFAULT_MODEL,
  };
}

/**
 * Non-streaming chat completion.
 * POST /v1/chat/completions
 */
export async function chatCompletion(
  messages: HermesChatMessage[],
  options: HermesCompletionOptions = {}
): Promise<HermesCompletionResponse> {
  const { baseUrl, apiKey, model } = getConfig();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      ...options,
      stream: false,
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Hermes chat completion failed (${res.status}): ${text || res.statusText}`
    );
  }

  return (await res.json()) as HermesCompletionResponse;
}

/**
 * Streaming chat completion — invokes onToken for each delta token.
 * Internally parses the SSE stream from POST /v1/chat/completions (stream: true).
 */
export async function streamChat(
  messages: HermesChatMessage[],
  onToken: (token: string) => void,
  options: Omit<HermesCompletionOptions, "stream"> = {}
): Promise<string> {
  const { baseUrl, apiKey, model } = getConfig();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      ...options,
      stream: true,
    }),
    signal: options.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Hermes streaming failed (${res.status}): ${text || res.statusText}`
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onToken(delta);
        }
      } catch {
        // ignore malformed chunks
      }
    }
  }

  return fullText;
}

/**
 * List available models.
 * GET /v1/models
 */
export async function listModels(): Promise<HermesModel[]> {
  const { baseUrl, apiKey } = getConfig();

  const res = await fetch(`${baseUrl}/models`, {
    headers: {
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Hermes list models failed (${res.status}): ${text || res.statusText}`
    );
  }

  const json = await res.json();
  return (json?.data ?? json?.models ?? []) as HermesModel[];
}

/**
 * Get server capabilities.
 * GET /v1/capabilities
 */
export async function getCapabilities(): Promise<Record<string, unknown>> {
  const { baseUrl, apiKey } = getConfig();

  const res = await fetch(`${baseUrl}/capabilities`, {
    headers: {
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Hermes capabilities failed (${res.status})`);
  }

  return (await res.json()) as Record<string, unknown>;
}
