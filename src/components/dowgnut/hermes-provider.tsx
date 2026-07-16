"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  ReactNode,
} from "react";

// Types shared between provider and consumers.

interface HermesContextMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface HermesContext {
  cart?: { donutId: string; name: string; quantity: number }[];
  viewedDonuts?: { id: string; name: string; type: string }[];
  favorites?: { donutId: string; name: string }[];
}

interface DonutCard {
  id: string;
  name: string;
  type: string;
  price: number;
  imgUrl: string;
  tags: string[];
  rating: number;
}

interface UseHermesReturn {
  sendMessage: (
    messages: HermesContextMessage[],
    context?: HermesContext,
    onToken?: (token: string) => void
  ) => Promise<{ reply: string; donuts: DonutCard[] }>;
  isTyping: boolean;
  error: string | null;
}

const HermesContext = createContext<UseHermesReturn | null>(null);

export function HermesProvider({ children }: { children: ReactNode }) {
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      messages: HermesContextMessage[],
      context?: HermesContext,
      onToken?: (token: string) => void
    ): Promise<{ reply: string; donuts: DonutCard[] }> => {
      setIsTyping(true);
      setError(null);

      // Abort any in-flight request.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ai/hermes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, context, stream: true }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => "");
          throw new Error(
            `Hermes request failed (${res.status}): ${errText || res.statusText}`
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let tokenBuffer = "";
        let donuts: DonutCard[] = [];
        let replyText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "token") {
                tokenBuffer += parsed.token;
                onToken?.(parsed.token);
              } else if (parsed.type === "done") {
                replyText = parsed.reply ?? tokenBuffer;
                donuts = parsed.donuts ?? [];
              } else if (parsed.type === "error") {
                throw new Error(parsed.error ?? "Hermes error");
              }
            } catch {
              // ignore malformed SSE lines
            }
          }
        }

        // If no "done" event was received, use the token buffer.
        if (!replyText) replyText = tokenBuffer;

        return { reply: replyText, donuts };
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return { reply: "", donuts: [] };
        }
        const msg = err?.message ?? "Something went wrong with the concierge.";
        setError(msg);
        return { reply: msg, donuts: [] };
      } finally {
        setIsTyping(false);
      }
    },
    []
  );

  return (
    <HermesContext.Provider value={{ sendMessage, isTyping, error }}>
      {children}
    </HermesContext.Provider>
  );
}

export function useHermes(): UseHermesReturn {
  const ctx = useContext(HermesContext);
  if (!ctx) {
    throw new Error("useHermes must be used within a HermesProvider");
  }
  return ctx;
}
