import { createClient } from "@supabase/supabase-js";
import type { Game } from "../game/engine";
import { wealth } from "../game/engine";
const env = (
  import.meta as ImportMeta & { env: Record<string, string | undefined> }
).env;
export const socialReady = Boolean(
  env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY,
);
export const supabase = socialReady
  ? createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!, {
      auth: { storageKey: "bosta3-auth" },
    })
  : null;
export type Club = { id: string; name: string; invite_code: string };
export type RankingRow = {
  id: string;
  name: string;
  avatar: string;
  title: string;
  wealth: number;
  xp: number;
  updated_at: string;
};
export async function shareScore(g: Game) {
  if (!supabase) throw Error("O clube ainda está montando as cadeiras.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw Error("Entre na sua conta primeiro.");
  const { error } = await supabase.from("players").upsert({
    id: user.id,
    name: g.career.profile.name,
    avatar: g.career.profile.avatar,
    title: g.career.profile.title,
    wealth: wealth(g),
    xp: g.career.xp,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
export async function clubs() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("clubs")
    .select("id,name,invite_code")
    .order("created_at");
  if (error) throw error;
  return data as Club[];
}
export async function ranking(club: string) {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("club_ranking", { club_id: club });
  if (error) throw error;
  return data as RankingRow[];
}
