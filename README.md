# Majombagázs Nyaral 🌴

Egy egyszerű, jelszó nélküli időpont-tervező a bagázsnak – mint a when2meet, csak jobb és csak napokra (2026).

## Funkciók

- Név beírása → egyszer, localStorage-be ment
- Tervezések listája (nyaralás / meeting / családi progi stb.)
- Bárki létrehozhat új tervezést
- 2026 egész évre naptár, kattintással jelölöd a szabad napjaidat
- Színkód mutatja, hány ember ér rá (hőtérkép)
- Realtime frissül mindenkinek
- ✨ AI ajánlás (Anthropic Claude) – javasol 1-3 jó időszakot a jelölések alapján

## Tech stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind → Vercelre
- **Backend / DB:** Supabase (Postgres + Realtime)
- **AI:** Anthropic Claude (serverless route)

## Setup

### 1. Supabase

1. Hozz létre egy új projektet a [supabase.com](https://supabase.com)-on.
2. A `Project Settings → API` alatt másold ki a `Project URL`-t és az `anon public` kulcsot.
3. Az `SQL Editor`-ban futtasd le a [`supabase/schema.sql`](supabase/schema.sql) tartalmát.

### 2. Anthropic kulcs

Szerezz egy API kulcsot [console.anthropic.com](https://console.anthropic.com) alatt.

### 3. Környezeti változók

Hozz létre egy `.env.local`-t a projekt gyökerében (lásd `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Futtatás

```bash
npm install
npm run dev
```

### 5. Kép

Tedd be a saját képedet `public/hero.jpg` néven. (Ez jelenik meg a főoldal hero részén.)

## Deploy Vercelre

1. Push-old a repót GitHubra.
2. [vercel.com/new](https://vercel.com/new) → importáld.
3. Állítsd be ugyanezeket az env változókat a Vercel projektben (Settings → Environment Variables).
4. Deploy.
