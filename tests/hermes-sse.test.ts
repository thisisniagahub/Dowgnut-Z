import { describe, it, expect } from "vitest";

// Hermes SSE delta parser mirror tests

function makeSseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

async function consume(chunks: string[]): Promise<string[]> {
  const tokens: string[] = [];
  const stream = makeSseStream(chunks);
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
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
        if (delta) tokens.push(delta);
      } catch {
        // ignore malformed chunks
      }
    }
  }
  return tokens;
}

describe("Hermes SSE delta parser", () => {
  it("concatenates partial tokens that straddle chunk boundaries", async () => {
    const tokens = await consume([
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      "\n",
      'data: {"choices":[{"delta":{"content":", world"}}]}\n\ndata: [DONE]\n',
    ]);
    expect(tokens.join("")).toBe("Hello, world");
  });

  it("ignores malformed JSON chunks", async () => {
    const tokens = await consume([
      "data: not-json\n",
      'data: {"choices":[{"delta":{"content":"kept"}}]}\n\n',
    ]);
    expect(tokens).toEqual(["kept"]);
  });

  it("ignores empty data lines and missing delta.content", async () => {
    const tokens = await consume([
      "data: \n",
      "data: {" + JSON.stringify({ choices: [{ delta: {} }] }) + "}\n",
      'data: {"choices":[{"delta":{"content":"only-one" }}]}\n\n',
    ]);
    expect(tokens).toEqual(["only-one"]);
  });
});
