import { award, tick, wealth, type Game, type News } from "./engine";
import { currentCareer } from "./career";
import {
  activeSpecial,
  chooseEvent,
  chooseSpecial,
  type HumorPreferences,
} from "./resenha";
import { specialEvents, type SpecialKind } from "./resenhaContent";
const rounded = (n: number) => Math.round(n * 100) / 100;
export function finishSpecial(g: Game, now = Date.now()): Game {
  if (!g.resenha.active || g.resenha.active.until > now) return g;
  return award({
    ...g,
    resenha: {
      ...g.resenha,
      completed: [...new Set([...g.resenha.completed, g.resenha.active.kind])],
      active: null,
    },
  });
}
export function triggerSpecial(
  g: Game,
  kind: SpecialKind,
  rng = Math.random,
  now = Date.now(),
): Game {
  const definition = specialEvents.find((s) => s.id === kind)!;
  if (g.resenha.cooldownUntil > now || activeSpecial(g.resenha, now)) return g;
  const impacts: Record<string, number> = {};
  g.assets.forEach((a, i) => {
    impacts[a.symbol] =
      kind === "iararara"
        ? rounded((i % 2 ? -0.12 : 0.22) + (rng() - 0.5) * 0.08)
        : kind === "erika"
          ? a.symbol === "FOFO3"
            ? 0.12
            : 0
          : kind === "priscila"
            ? (
                {
                  FOFO3: 0.14,
                  BOLO4: 0.1,
                  POMBO3: 0.08,
                  CLT4: -0.06,
                } as Record<string, number>
              )[a.symbol] || 0
            : kind === "cantina"
              ? a.symbol === "BOLO4"
                ? -0.22
                : a.symbol === "SONO3"
                  ? 0.07
                  : -0.06
              : 0;
  });
  const assets = g.assets.map((a) => {
    const price = Math.max(0.01, rounded(a.price * (1 + impacts[a.symbol])));
    return { ...a, price, history: [...a.history.slice(-59), price] };
  });
  const news: News = {
    id: -100 - specialEvents.indexOf(definition),
    title: `${definition.emoji} ${definition.name}: ${definition.description}`,
    symbol: kind === "erika" ? "FOFO3" : "ALL",
    impact: kind === "erika" ? 0.12 : 0,
    impacts,
    school: definition.school,
    special: kind,
    time: now,
  };
  const next = {
    ...g,
    assets,
    resenha: {
      ...g.resenha,
      active: { kind, startedAt: now, until: now + definition.duration },
      cooldownUntil: now + 120000,
      specialCounts: {
        ...g.resenha.specialCounts,
        [kind]: (g.resenha.specialCounts[kind] || 0) + 1,
      },
    },
    news: [news, ...g.news].slice(0, 40),
  };
  return award({
    ...next,
    timeline: [
      ...g.timeline.slice(-59),
      {
        time: new Date(now).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: wealth(next),
      },
    ],
  });
}
export function advanceMarket(
  g: Game,
  prefs: Pick<HumorPreferences, "school" | "extraordinary">,
  manual = false,
  rng = Math.random,
  now = Date.now(),
): Game {
  let next = finishSpecial(g, now);
  if (manual) {
    const c = currentCareer(next.career);
    next = {
      ...next,
      career: { ...c, daily: { ...c.daily, chaos: c.daily.chaos + 1 } },
      resenha: { ...next.resenha, chaosPresses: next.resenha.chaosPresses + 1 },
    };
  }
  const erika =
    activeSpecial(next.resenha, now)?.kind === "erika" && prefs.school;
  const scheduled =
    manual || next.career.ticks + 1 >= next.resenha.nextNewsTick || erika;
  // Rare events share a persisted two-minute cooldown, including after reload.
  if (
    scheduled &&
    prefs.extraordinary &&
    next.resenha.cooldownUntil <= now &&
    !activeSpecial(next.resenha, now) &&
    rng() < 0.045
  ) {
    const featured = triggerSpecial(
      next,
      chooseSpecial(prefs.school, rng),
      rng,
      now,
    );
    if (manual) return featured;
    const stepped = tick(
      featured,
      rng,
      undefined,
      new Date(now).getDay(),
      true,
      now,
    );
    return {
      ...stepped,
      resenha: { ...stepped.resenha, nextNewsTick: stepped.career.ticks + 5 },
    };
  }
  const index = scheduled
    ? chooseEvent(prefs.school, next.resenha.recentEvents, rng, erika)
    : undefined;
  const stepped = tick(next, rng, index, new Date(now).getDay(), !manual, now);
  return scheduled
    ? {
        ...stepped,
        resenha: { ...stepped.resenha, nextNewsTick: stepped.career.ticks + 5 },
      }
    : stepped;
}
export function recordShare(g: Game, n: News): Game {
  const key = `${n.id}:${n.title}`;
  if (g.resenha.sharedNews.includes(key)) return g;
  return award({
    ...g,
    resenha: {
      ...g.resenha,
      sharedNews: [...g.resenha.sharedNews, key].slice(-200),
    },
  });
}
