# Majombagázs Nyaral 🌴

Egy egyszerű, jelszóval védett időpont-tervező a bagázsnak – mint a when2meet, csak jobb és csak napokra (2026).

## Funkciók

- 🔒 Közös jelszó a belépéshez
- Név beírása → localStorage-be ment
- Tervezések listája (nyaralás / meeting / családi progi stb.)
- Bárki létrehozhat új tervezést
- 2026 egész évre naptár, kattintással jelölöd a szabad napjaidat
- Színkód mutatja, hány ember ér rá (hőtérkép)
- Realtime frissül mindenkinek
- ⭐ Legjobb időpont gomb – a legtöbb szavazatot kapott napokat emeli ki

## Tech stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind → Vercelre
- **Backend / DB:** Supabase (Postgres + Realtime)

## Setup

### 1. Supabase

1. Hozz létre egy új projektet a [supabase.com](https://supabase.com)-on.
2. A `Project Settings → API` alatt másold ki a `Project URL`-t és az `anon public` kulcsot.
3. Az `SQL Editor`-ban futtasd le a [`supabase/schema.sql`](supabase/schema.sql) tartalmát.

### 2. Környezeti változók

Hozz létre egy `.env.local`-t a projekt gyökerében (lásd `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Futtatás

```bash
npm install
npm run dev
```

### 4. Kép

Tedd be a saját képedet `public/hero.jpg` néven. (Ez jelenik meg a főoldal hero részén.)

## Deploy Vercelre

1. Push-old a repót GitHubra.
2. [vercel.com/new](https://vercel.com/new) → importáld.
3. Állítsd be ugyanezeket az env változókat a Vercel projektben.
4. Deploy.

## Jelszó

A közös belépési jelszó a `components/PasswordGate.tsx` fájlban van (`PASSWORD` konstans). Ha meg akarod változtatni, ott írd át.
