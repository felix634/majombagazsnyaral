"use client";
import { useEffect, useState } from "react";

const KEY = "mbn_name";

export function useUserName() {
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    setName(v);
    setReady(true);
  }, []);

  const save = (n: string) => {
    localStorage.setItem(KEY, n);
    setName(n);
  };

  const clear = () => {
    localStorage.removeItem(KEY);
    setName(null);
  };

  return { name, setName: save, clear, ready };
}

export default function NameGate({ children }: { children: React.ReactNode }) {
  const { name, setName, ready } = useUserName();
  const [input, setInput] = useState("");

  if (!ready) return null;

  if (!name) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = input.trim();
            if (v) setName(v);
          }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-neutral-200"
        >
          <h1 className="text-2xl font-bold mb-2">Majombagázs Nyaral 🌴</h1>
          <p className="text-neutral-600 mb-6">
            Írd be a neved, hogy mindenki lássa mikor érsz rá.
          </p>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="pl. Feri"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-neutral-300 text-white font-medium py-3 rounded-lg transition"
          >
            Belépés
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
