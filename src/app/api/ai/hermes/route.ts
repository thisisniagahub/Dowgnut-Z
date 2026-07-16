// Server-side proxy for Hermes Agent API calls.
// Receives { messages, context, stream? } and forwards to Hermes.
// The API key lives server-side — never exposed to the client.

import { NextResponse } from "next/server";
import { streamChat, chatCompletion } from "@/lib/hermes/client";
import { serializeDonut } from "@/lib/serialize";
import type { Donut } from "@/lib/types";

const CONCIERGE_SYSTEM_PROMPT = `You are the DowgNut Concierge, a playful and knowledgeable donut expert for a Malaysian donut delivery app. You help customers find the perfect donut based on their preferences. You speak casually in English and Bahasa Melayu. You know about all donut types: classic, sprinkled, stuffed, specialty. You can recommend donuts, explain flavors, and help with ordering. Keep responses short and fun — you are a hypebeast donut advisor, not a formal assistant.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, context, stream = false } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Add context about cart, favorites, viewed donuts
    let contextPrompt = "";
    if (context?.cart && context.cart.length > 0) {
      const cartItems = context.cart.map((c: any) => `${c.name} x${c.quantity}`).join(", ");
      contextPrompt += `\nCustomer's cart: ${cartItems}.`;
    }
    if (context?.favorites && context.favorites.length > 0) {
      const favNames = context.favorites.map((f: any) => f.name).join(", ");
      contextPrompt += `\nCustomer's favorites: ${favNames}.`;
    }
    if (context?.viewedDonuts && context.viewedDonuts.length > 0) {
      const viewedNames = context.viewedDonuts.map((d: any) => d.name).join(", ");
      contextPrompt += `\nRecently viewed: ${viewedNames}.`;
    }

    const finalMessages = [
      { role: "system", content: CONCIERGE_SYSTEM_PROMPT + contextPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    if (stream) {
      // Streaming response via SSE
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          let tokenBuffer = "";
          let donuts: Donut[] = [];

          try {
            await streamChat(
              finalMessages,
              (token: string) => {
                tokenBuffer += token;
                const data = JSON.stringify({ type: "token", token });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              },
              { stream: true }
            );
          } catch (err: any) {
            const errorData = JSON.stringify({
              type: "error",
              error: err?.message || "Hermes streaming failed",
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
            return;
          }

          // Done event
          const doneData = JSON.stringify({
            type: "done",
            reply: tokenBuffer,
            donuts: donuts,
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming response
      const result = await chatCompletion(finalMessages);
      const reply = result.choices[0]?.message?.content || "Hmm, I'm stumped. Try another craving!";

      return NextResponse.json({ reply, donuts: [] });
    }
  } catch (err: any) {
    console.error("[api/ai/hermes POST]", err);
    return NextResponse.json(
      { error: err?.message || "Hermes request failed" },
      { status: 500 }
    );
  }
}

// Also support GET for health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "hermes-proxy" });
}