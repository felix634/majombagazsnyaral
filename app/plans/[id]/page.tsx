"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import NameGate, { useUserName } from "@/components/NameGate";
import Header from "@/components/Header";
import YearCalendar from "@/components/YearCalendar";
import { supabase, type Availability, type Plan } from "@/lib/supabase";

function PlanPage() {
  const params = useParams<{ id: string }>();
  const planId = params.id;
  const { name } = useUserName();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [avails, setAvails] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    summary: string;
    days: string[];
  } | null>(null);

  const load = async () => {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from("plans").select("*").eq("id", planId).maybeSingle(),
      supabase.from("availabilities").select("*").eq("plan_id", planId),
    ]);
    setPlan((p as Plan) || null);
    setAvails((a as Availability[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`plan-${planId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availabilities",
          filter: `plan_id=eq.${planId}`,
        },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [planId]);

  const availabilityByDay = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of avails) {
      const arr = m.get(a.day) || [];
      arr.push(a.user_name);
      m.set(a.day, arr);
    }
    return m;
  }, [avails]);

  const allUsers = useMemo(() => {
    const s = new Set<string>();
    avails.forEach((a) => s.add(a.user_name));
    if (name) s.add(name);
    return Array.from(s).sort((a, b) => a.localeCompare(b, "hu"));
  }, [avails, name]);

  const mySet = useMemo(() => {
    const s = new Set<string>();
    if (!name) return s;
    avails.filter((a) => a.user_name === name).forEach((a) => s.add(a.day));
    return s;
  }, [avails, name]);

  const toggleDay = async (iso: string) => {
    if (!name) return;
    if (mySet.has(iso)) {
      // optimistic
      setAvails((prev) =>
        prev.filter((a) => !(a.user_name === name && a.day === iso))
      );
      await supabase
        .from("availabilities")
        .delete()
        .eq("plan_id", planId)
        .eq("user_name", name)
        .eq("day", iso);
    } else {
      const temp: Availability = {
        id: "temp-" + Math.random(),
        plan_id: planId,
        user_name: name,
        day: iso,
      };
      setAvails((prev) => [...prev, temp]);
      await supabase
        .from("availabilities")
        .insert({ plan_id: planId, user_name: name, day: iso });
    }
  };

  const runAI = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTitle: plan?.title,
          planDescription: plan?.description,
          users: allUsers,
          availabilityByDay: Object.fromEntries(availabilityByDay),
        }),
      });
      const j = await res.json();
      if (res.ok) setAiResult(j);
      else alert("AI hiba: " + (j.error || "ismeretlen"));
    } catch (e: any) {
      alert("AI hiba: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10 text-neutral-500">
        Betöltés…
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <p className="mb-3">Ez a tervezés nem található.</p>
        <Link href="/" className="text-brand-600 underline">
          Vissza
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <Link href="/" className="text-sm text-neutral-500 hover:text-brand-600">
        ← Vissza
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          {plan.description && (
            <p className="text-neutral-600 mt-1">{plan.description}</p>
          )}
          <p className="text-xs text-neutral-400 mt-1">
            Létrehozta: {plan.created_by}
          </p>
        </div>
        <button
          onClick={runAI}
          disabled={aiLoading || avails.length === 0}
          className="bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-medium px-4 py-2 rounded-lg"
        >
          {aiLoading ? "AI gondolkodik…" : "✨ AI ajánlás"}
        </button>
      </div>

      <div className="mb-5 rounded-xl bg-white border border-neutral-200 p-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-sm">
          <span className="text-neutral-500">Résztvevők ({allUsers.length}):</span>
          {allUsers.map((u) => (
            <span
              key={u}
              className={`px-2 py-0.5 rounded-full border text-xs ${
                u === name
                  ? "bg-brand-100 border-brand-500 text-brand-700 font-medium"
                  : "bg-neutral-100 border-neutral-200"
              }`}
            >
              {u}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-600">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-emerald-500 rounded-sm"></span>
            mindenki
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-emerald-300 rounded-sm"></span>
            ≥ 2/3
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-emerald-100 rounded-sm"></span>
            ≥ 1/3
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 ring-2 ring-brand-600 rounded-sm"></span>
            te jelölted
          </span>
        </div>
      </div>

      {aiResult && (
        <div className="mb-5 rounded-xl bg-yellow-50 border border-yellow-300 p-4">
          <h3 className="font-semibold mb-1">✨ AI ajánlás</h3>
          <p className="text-sm text-neutral-800 whitespace-pre-wrap">
            {aiResult.summary}
          </p>
          {aiResult.days.length > 0 && (
            <p className="text-xs text-neutral-600 mt-2">
              Kiemelt napok: {aiResult.days.join(", ")}
            </p>
          )}
        </div>
      )}

      <YearCalendar
        year={2026}
        availabilityByDay={availabilityByDay}
        currentUser={name || ""}
        onToggle={toggleDay}
        totalUsers={allUsers.length}
        highlightedDays={aiResult?.days || []}
      />
    </main>
  );
}

export default function Page() {
  return (
    <NameGate>
      <Header />
      <PlanPage />
    </NameGate>
  );
}
