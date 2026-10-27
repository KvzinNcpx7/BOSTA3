import { companies, events } from "./data";
export type Asset = (typeof companies)[number] & {
  open: number;
  history: number[];
};
export type News = {
  id: number;
  title: string;
  symbol: string;
  impact: number;
  time: number;
};
export type Game = {
  version: 1;
  cash: number;
  assets: Asset[];
  positions: Record<string, { quantity: number; average: number }>;
  trades: number;
  realized: number;
  unlocked: string[];
  news: News[];
  timeline: { time: string; value: number }[];
  started: boolean;
};
export const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );
export const pct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
const round = (n: number) => Math.round(n * 100) / 100;
export function fresh(): Game {
  return {
    version: 1,
    cash: 10000,
    assets: companies.map((a, j) => ({
      ...a,
      open: a.price,
      history: Array.from({ length: 40 }, (_, i) =>
        round(
          a.price *
            (1 + Math.sin(i * 0.7 + j) * 0.025 + Math.cos(i * 0.3) * 0.015),
        ),
      ),
    })),
    positions: {},
    trades: 0,
    realized: 0,
    unlocked: [],
    news: [
      {
        id: -1,
        symbol: "ALL",
        title:
          "Pregão aberto: oito empresas, nenhum fundamento e R$ 10 mil para testar seu bom senso.",
        impact: 0,
        time: Date.now(),
      },
    ],
    timeline: [{ time: "Início", value: 10000 }],
    started: false,
  };
}
export function wealth(g: Game) {
  return round(
    g.cash +
      g.assets.reduce(
        (s, a) => s + a.price * (g.positions[a.symbol]?.quantity || 0),
        0,
      ),
  );
}
export function award(g: Game): Game {
  const w = wealth(g);
  const checks: Record<string, boolean> = {
    first: g.trades > 0,
    trader: g.trades >= 20,
    loss: w <= 9500,
    ceo: g.realized <= -1000,
    million: w >= 1000000,
    snack: w <= 10,
  };
  return {
    ...g,
    unlocked: [
      ...new Set([
        ...g.unlocked,
        ...Object.keys(checks).filter((k) => checks[k]),
      ]),
    ],
  };
}
export function trade(
  g: Game,
  symbol: string,
  side: "buy" | "sell",
  quantity: number,
): Game {
  const a = g.assets.find((a) => a.symbol === symbol);
  if (!a || !Number.isSafeInteger(quantity) || quantity < 1)
    throw Error("Escolha uma quantidade inteira maior que zero.");
  const p = g.positions[symbol] || { quantity: 0, average: 0 };
  const total = round(a.price * quantity);
  if (side === "buy" && total > g.cash)
    throw Error("Saldo insuficiente. Nem o dinheiro de mentirinha é infinito.");
  if (side === "sell" && quantity > p.quantity)
    throw Error(
      "Você não tem tantas ações. Aqui não vendemos esperança a descoberto.",
    );
  const positions = { ...g.positions };
  let realized = g.realized;
  let unlocked = [...g.unlocked];
  if (side === "buy")
    positions[symbol] = {
      quantity: p.quantity + quantity,
      average: (p.average * p.quantity + total) / (p.quantity + quantity),
    };
  else {
    realized = round(realized + (a.price - p.average) * quantity);
    if (a.price < p.average) unlocked.push("sellLoss");
    positions[symbol] = { ...p, quantity: p.quantity - quantity };
    if (!positions[symbol].quantity) delete positions[symbol];
  }
  return award({
    ...g,
    positions,
    realized,
    unlocked: [...new Set(unlocked)],
    cash: round(g.cash + (side === "buy" ? -total : total)),
    trades: g.trades + 1,
  });
}
export function tick(
  g: Game,
  rng = Math.random,
  eventIndex?: number,
  day = new Date().getDay(),
): Game {
  const event = eventIndex === undefined ? undefined : events[eventIndex];
  const assets = g.assets.map((a) => {
    let change = (rng() - 0.5) * (a.symbol === "TIGR3" ? 0.09 : 0.018);
    if (day === 1 && a.symbol === "CLT4") change -= 0.0015;
    if (event && (event.symbol === a.symbol || event.symbol === "ALL"))
      change += event.impact;
    const price = Math.max(0.01, round(a.price * (1 + change)));
    return { ...a, price, history: [...a.history.slice(-59), price] };
  });
  const next = {
    ...g,
    assets,
    news: event
      ? [{ ...event, time: Date.now() }, ...g.news].slice(0, 40)
      : g.news,
  };
  return award({
    ...next,
    timeline: [
      ...g.timeline.slice(-59),
      {
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: wealth(next),
      },
    ],
  });
}
export const SAVE_KEY = "bosta3-game-v1";
export function loadGame(): Game {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return fresh();
    const g = JSON.parse(raw);
    if (
      g.version !== 1 ||
      !Number.isFinite(g.cash) ||
      g.cash < 0 ||
      !Array.isArray(g.assets) ||
      g.assets.length !== 8 ||
      !g.assets.every(
        (a: Asset, i: number) =>
          a.symbol === companies[i].symbol &&
          Number.isFinite(a.price) &&
          a.price > 0 &&
          Array.isArray(a.history) &&
          a.history.every(Number.isFinite),
      ) ||
      !g.positions ||
      !Object.values(g.positions).every(
        (p: any) =>
          Number.isSafeInteger(p.quantity) &&
          p.quantity > 0 &&
          Number.isFinite(p.average) &&
          p.average > 0,
      ) ||
      !Array.isArray(g.news) ||
      !Array.isArray(g.timeline) ||
      !Array.isArray(g.unlocked) ||
      !Number.isInteger(g.trades) ||
      !Number.isFinite(g.realized)
    )
      return fresh();
    return g;
  } catch {
    return fresh();
  }
}
