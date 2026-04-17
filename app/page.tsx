"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import NameGate from "@/components/NameGate";
import Header from "@/components/Header";
import { supabase, type Plan } from "@/lib/supabase";
import { useUserName } from "@/components/NameGate";

function PlansList() {
  const { name } = useUserName();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });
    setPlans((data as Plan[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("plans-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plans" },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !name) return;
    const { error } = await supabase.from("plans").insert({
      title: title.trim(),
      description: desc.trim() || null,
      created_by: name,
    });
    if (!error) {
      setTitle("");
      setDesc("");
      setCreating(false);
    } else {
      alert("Hiba: " + error.message);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <section className="mb-8 rounded-2xl bg-white border border-neutral-200 shadow-sm p-6 md:p-8">
        <div className="flex items-start gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kep.jpg"
            alt="A főnök"
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-brand-500 shadow flex-shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">A bagázs naptára 🗓️</h1>
            <p className="text-neutral-600 mb-4">
              Hozz létre tervezéseket (nyaralás, meeting, családi progi…), és
              mindenki bejelölheti mikor ér rá 2026-ban.
            </p>
            <button
              onClick={() => setCreating((v) => !v)}
              className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-lg transition"
            >
              {creating ? "Mégse" : "+ Új tervezés"}
            </button>
          </div>
        </div>
      </section>

      {creating && (
        <form
          onSubmit={create}
          className="mb-6 bg-white rounded-xl p-5 border border-neutral-200 shadow-sm"
        >
          <label className="block text-sm font-medium mb-1">Cím</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="pl. Nyaralás 2026"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-3"
            required
          />
          <label className="block text-sm font-medium mb-1">
            Leírás (opcionális)
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Pár szó a tervezésről"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-3"
            rows={2}
          />
          <button className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2 rounded-lg">
            Létrehozás
          </button>
        </form>
      )}

      <h2 className="text-lg font-semibold mb-3">Tervezések</h2>
      {loading ? (
        <p className="text-neutral-500">Betöltés…</p>
      ) : plans.length === 0 ? (
        <p className="text-neutral-500">
          Még nincs egy tervezés sem. Hozz létre egyet!
        </p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((p) => (
            <li key={p.id}>
              <Link
                href={`/plans/${p.id}`}
                className="block bg-white rounded-xl p-4 border border-neutral-200 hover:border-brand-500 hover:shadow-md transition"
              >
                <h3 className="font-semibold mb-1">{p.title}</h3>
                {p.description && (
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                    {p.description}
                  </p>
                )}
                <p className="text-xs text-neutral-400">
                  {p.created_by} · {new Date(p.created_at).toLocaleDateString("hu-HU")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <NameGate>
      <Header />
      <PlansList />
    </NameGate>
  );
}
