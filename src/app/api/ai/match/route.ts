import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Donut } from "@/lib/types";
import {
  getCatalogForPrompt,
  callChat,
  parseJsonArray,
} from "@/lib/ai";
import { serializeDonut } from "@/lib/serialize";

// POST /api/ai/match  { craving: string, sessionId? }
// Returns { donuts: Donut[], reasoning: string }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const craving = String(body.craving ?? "").trim();
    if (!craving) {
      return NextResponse.json(
        { error: "craving is required" },
        { status: 400 }
      );
    }

    const catalog = await getCatalogForPrompt();

    const systemPrompt = `You are the DowgNut Flavor Match engine. The user will describe a craving in natural language. Pick the EXACT 3 best-matching donuts from the catalog for that craving.

CATALOG:
${JSON.stringify(catalog)}

Reply with ONLY a JSON array (no prose, no markdown, no code fences) of exactly 3 objects:
[{"id":"<donutId>","reason":"<one short sentence explaining why this donut satisfies the craving>"}]

Rules:
- Output ONLY the JSON array. Nothing else.
- Use real IDs from the CATALOG. Never invent IDs.
- Always return exactly 3 items unless the catalog has fewer (then return all of them).`;

    const fullText = await callChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: craving },
    ]);

    const parsed = parseJsonArray<{ id: string; reason?: string }>(fullText);

    let picks: { id: string; reason?: string }[] = [];
    if (parsed && parsed.length > 0) {
      // keep only valid catalog ids, take top 3
      const validIds = new Set(catalog.map((d) => d.id));
      picks = parsed.filter((p) => p.id && validIds.has(p.id)).slice(0, 3);
    }

    // Defensive fallback: if parsing failed or no valid picks, top-3 by rating.
    if (picks.length === 0) {
      const top = await db.donut.findMany({
        orderBy: { rating: "desc" },
        take: 3,
      });
      const donuts = top.map(serializeDonut);
      const reasoning = donuts
        .map((d) => `${d.name}: top-rated (${d.rating.toFixed(1)}★)`)
        .join(" | ");
      return NextResponse.json({
        donuts,
        reasoning:
          reasoning ||
          "No matches found — try a different craving.",
      });
    }

    const rows = await db.donut.findMany({
      where: { id: { in: picks.map((p) => p.id) } },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const donuts: Donut[] = picks
      .map((p) => byId.get(p.id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map(serializeDonut);

    const reasoning = picks
      .map((p) => {
        const d = byId.get(p.id);
        const name = d?.name ?? p.id;
        return p.reason ? `${name}: ${p.reason}` : name;
      })
      .join(" | ");

    return NextResponse.json({ donuts, reasoning });
  } catch (err) {
    console.error("[api/ai/match POST]", err);
    return NextResponse.json(
      { error: "Flavor match failed" },
      { status: 500 }
    );
  }
}
