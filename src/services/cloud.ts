import { decodeGame, type Game } from "../game/engine";
import { supabase } from "./social";
export type CloudSave = { game: Game; revision: number; updatedAt: string };
// Explicit allowlist: auth sessions, invitation URLs and arbitrary legacy fields never leave the device.
export function snapshot(g: Game): Game {
  const { version, cash, assets, positions, trades, realized, unlocked, news, timeline, started, career, resenha, fun } = g;
  return { version, cash, assets, positions, trades, realized, unlocked, news, timeline, started, career, resenha, fun };
}
export async function readCloud(owner: string): Promise<CloudSave | null> {
  if (!supabase) throw Error("Configure o Supabase para ligar a nuvem.");
  const { data, error } = await supabase.from("game_saves").select("payload,revision,updated_at").eq("owner_id", owner).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const game = decodeGame(JSON.stringify(data.payload));
  if (!game || !Number.isSafeInteger(data.revision) || data.revision < 1) throw Error("Save da nuvem incompatível. Sua carreira local foi preservada.");
  return { game, revision: data.revision, updatedAt: data.updated_at };
}
export async function writeCloud(owner: string, expected: number, game: Game): Promise<number> {
  if (!supabase) throw Error("Nuvem indisponível.");
  const { data, error } = await supabase.rpc("save_game", { p_owner: owner, p_expected: expected, p_payload: snapshot(game) });
  if (error) throw error;
  if (!Number.isSafeInteger(data) || data < 1) throw Error("A nuvem não confirmou o salvamento.");
  return data;
}
export function cloudError(error: unknown): string {
  const e = error as { message?: string; code?: string };
  if (e?.message?.includes("SAVE_CONFLICT")) return "Outro aparelho salvou uma versão nova. Escolha qual carreira continuar; não sobrescrevemos nada.";
  if (["42P01", "PGRST202", "PGRST205"].includes(e?.code || "")) return "O dono do site precisa executar a migração 002 no Supabase. O jogo local continua salvo.";
  return "Não foi possível sincronizar. Seu jogo continua salvo neste aparelho. Confira a conexão e tente novamente.";
}
export function backupLocal(game: Game) {
  // One recoverable snapshot before every explicit replacement; never a silent reset.
  localStorage.setItem("bosta3-before-cloud-v1", JSON.stringify(snapshot(game)));
}
export function downloadBackup(game: Game) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot(game))], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = "bosta3-carreira-backup.json"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
