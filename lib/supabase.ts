import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  realtime: { params: { eventsPerSecond: 10 } },
});

export type Plan = {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
};

export type Availability = {
  id: string;
  plan_id: string;
  user_name: string;
  day: string; // YYYY-MM-DD
};
