import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

type Body = {
  planTitle?: string;
  planDescription?: string | null;
  users: string[];
  availabilityByDay: Record<string, string[]>;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY nincs beállítva" },
      { status: 500 }
    );
  }
  const body = (await req.json()) as Body;
  const { planTitle, planDescription, users, availabilityByDay } = body;
  if (!users?.length || !availabilityByDay) {
    return NextResponse.json({ error: "Hiányzó adat" }, { status: 400 });
  }

  // Compact summary: top 15 days with highest coverage.
  const ranked = Object.entries(availabilityByDay)
    .map(([day, list]) => ({ day, count: list.length, users: list }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count || a.day.localeCompare(b.day))
    .slice(0, 25);

  const allUsers = users.join(", ");
  const dayLines = ranked
    .map((d) => `- ${d.day}: ${d.count}/${users.length} (${d.users.join(", ")})`)
    .join("\n");

  const client = new Anthropic({ apiKey });

  const sys = `Magyar nyelvű asszisztens vagy. A felhasználók egy időpont-tervezéshez jelölték be a szabad napjaikat 2026-ra.
A feladatod: ajánlj 1-3 konkrét időszakot vagy napot, amikor a legtöbben ráérnek.
Indokold röviden (2-4 mondat). Ha a tervezés nyaralás, vegyél figyelembe egy összefüggő hosszabb intervallumot (min. 3-7 nap).
Ha meeting/progi, egy-két jó nap is elég.
A válaszod CSAK JSON legyen, ebben a formában:
{"summary": "magyarázó szöveg", "days": ["YYYY-MM-DD", ...]}
A days csak a konkrét kiemelt napokat tartalmazza (legfeljebb 7).`;

  const user = `Tervezés: ${planTitle || "(nincs cím)"}
${planDescription ? `Leírás: ${planDescription}\n` : ""}Résztvevők (${users.length}): ${allUsers}

Napok (csökkenő szavazatsorrend):
${dayLines || "(nincs jelölés)"}

Adj ajánlást JSON-ben.`;

  try {
    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: sys,
      messages: [{ role: "user", content: user }],
    });
    const text =
      resp.content
        .map((c: any) => (c.type === "text" ? c.text : ""))
        .join("")
        .trim() || "";

    // extract JSON
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({
        summary: text || "Nincs egyértelmű ajánlás.",
        days: [],
      });
    }
    let parsed: { summary?: string; days?: string[] } = {};
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ summary: text, days: [] });
    }
    return NextResponse.json({
      summary: parsed.summary || "Nincs egyértelmű ajánlás.",
      days: Array.isArray(parsed.days) ? parsed.days.slice(0, 7) : [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "AI hívási hiba" },
      { status: 500 }
    );
  }
}
