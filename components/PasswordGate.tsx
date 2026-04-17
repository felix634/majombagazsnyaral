"use client";
import { useEffect, useState } from "react";

const KEY = "mbn_pw_ok";
const PASSWORD = "Majombagázs";

export default function PasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setOk(localStorage.getItem(KEY) === "1");
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input === PASSWORD) {
              localStorage.setItem(KEY, "1");
              setOk(true);
            } else {
              setError(true);
            }
          }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-neutral-200"
        >
          <h1 className="text-2xl font-bold mb-2">🔒 Jelszó szükséges</h1>
          <p className="text-neutral-600 mb-6">
            Add meg a közös jelszót a belépéshez.
          </p>
          <input
            autoFocus
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Jelszó"
            className={`w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 ${
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-neutral-300 focus:ring-brand-500"
            }`}
          />
          {error && (
            <p className="text-sm text-red-600 mb-3">Hibás jelszó.</p>
          )}
          <button
            type="submit"
            disabled={!input}
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
