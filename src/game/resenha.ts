import { events } from "./data";
import { specialEvents, type SpecialKind } from "./resenhaContent";
export type HumorPreferences = {
  school: boolean;
  sound: boolean;
  effects: boolean;
  extraordinary: boolean;
};
export const HUMOR_KEY = "bosta3-humor-v1";
export const defaultPreferences: HumorPreferences = {
  school: false,
  sound: false,
  effects: true,
  extraordinary: true,
};
export function loadHumorPreferences(): HumorPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(HUMOR_KEY) || "null");
    return Object.fromEntries(
      Object.entries(defaultPreferences).map(([k, v]) => [
        k,
        typeof parsed?.[k] === "boolean" ? parsed[k] : v,
      ]),
    ) as HumorPreferences;
  } catch {
    return { ...defaultPreferences };
  }
}
export type ResenhaState = {
  active: { kind: SpecialKind; startedAt: number; until: number } | null;
  cooldownUntil: number;
  specialCounts: Partial<Record<SpecialKind, number>>;
  completed: SpecialKind[];
  recentEvents: number[];
  sharedNews: string[];
  lossSales: number;
  topBuys: number;
  lowestWealth: number;
  chaosPresses: number;
  nextNewsTick: number;
};
export function freshResenha(): ResenhaState {
  return {
    active: null,
    cooldownUntil: 0,
    specialCounts: {
      iararara: 0,
      erika: 0,
      strike: 0,
      priscila: 0,
      cantina: 0,
    },
    completed: [],
    recentEvents: [],
    sharedNews: [],
    lossSales: 0,
    topBuys: 0,
    lowestWealth: 10000,
    chaosPresses: 0,
    nextNewsTick: 5,
  };
}
/** Optional local fields are migrated independently; they never invalidate an existing wallet. */
export function restoreResenha(raw: unknown): ResenhaState {
  const fallback = freshResenha();
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<ResenhaState>;
  const kinds = specialEvents.map((s) => s.id);
  const number = (v: unknown, d = 0) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : d;
  return {
    active:
      r.active &&
      kinds.includes(r.active.kind) &&
      Number.isFinite(r.active.startedAt) &&
      Number.isFinite(r.active.until) &&
      r.active.until > r.active.startedAt &&
      r.active.until - r.active.startedAt <= 40000
        ? r.active
        : null,
    cooldownUntil: number(r.cooldownUntil),
    specialCounts: Object.fromEntries(
      kinds.map((k) => [k, number(r.specialCounts?.[k])]),
    ),
    completed: Array.isArray(r.completed)
      ? r.completed.filter((k) => kinds.includes(k))
      : [],
    recentEvents: Array.isArray(r.recentEvents)
      ? r.recentEvents.filter(Number.isSafeInteger).slice(-6)
      : [],
    sharedNews: Array.isArray(r.sharedNews)
      ? r.sharedNews.filter((k) => typeof k === "string").slice(-200)
      : [],
    lossSales: number(r.lossSales),
    topBuys: number(r.topBuys),
    lowestWealth: number(r.lowestWealth, 10000),
    chaosPresses: number(r.chaosPresses),
    nextNewsTick: number(r.nextNewsTick, 5),
  };
}
export function chooseEvent(
  school: boolean,
  recent: number[],
  rng = Math.random,
  erika = false,
): number {
  let pool = events.filter(
    (e) => (school || !e.school) && !recent.includes(e.id),
  );
  if (erika && school) {
    const communications = pool.filter((e) => e.school && e.symbol === "FOFO3");
    if (communications.length) pool = communications;
  }
  if (!pool.length) pool = events.filter((e) => school || !e.school);
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))].id;
}
export function chooseSpecial(school: boolean, rng = Math.random): SpecialKind {
  const pool = specialEvents.filter((s) => school || !s.school);
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))].id;
}
export function activeSpecial(r: ResenhaState, now = Date.now()) {
  return r.active && r.active.until > now ? r.active : null;
}
export function tradeBlocked(r: ResenhaState, now = Date.now()) {
  return activeSpecial(r, now)?.kind === "strike";
}
export function enabledSpecial(
  r: ResenhaState,
  prefs: HumorPreferences,
): ResenhaState {
  if (
    r.active &&
    (!prefs.extraordinary ||
      (!prefs.school &&
        specialEvents.find((s) => s.id === r.active!.kind)?.school))
  )
    return { ...r, active: null };
  return r;
}
