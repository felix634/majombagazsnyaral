"use client";
import Link from "next/link";
import { useUserName } from "./NameGate";

export default function Header() {
  const { name, clear } = useUserName();
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span>🌴</span>
          <span>Majombagázs Nyaral</span>
        </Link>
        {name && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-600">
              Szia, <strong>{name}</strong>
            </span>
            <button
              onClick={() => {
                clear();
                location.href = "/";
              }}
              className="text-neutral-500 hover:text-brand-600 underline"
            >
              név csere
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
