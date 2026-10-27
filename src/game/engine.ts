import {
  freshCareer,
  currentCareer,
  ledger,
  progressTick,
  type Career,
} from "./career";
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
  version: 2;
  career: Career;
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
    version: 2,
    career: freshCareer(),
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
    career: ledger(
      {
        ...currentCareer(g.career),
        xp: g.career.xp + 5,
        daily: {
          ...currentCareer(g.career).daily,
          trades: currentCareer(g.career).daily.trades + 1,
          sells:
            currentCareer(g.career).daily.sells + (side === "sell" ? 1 : 0),
        },
      },
      {
        kind: side,
        symbol,
        quantity,
        amount: side === "buy" ? -total : total,
        label:
          side === "buy"
            ? "Compra: esperança adquirida com sucesso"
            : "Venda: desapego processado",
      },
    ),
  });
}
export function tick(
  g: Game,
  rng = Math.random,
  eventIndex?: number,
  day = new Date().getDay(),
  advanceClock = true,
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
  const progressed = advanceClock ? progressTick(next) : next;
  return award({
    ...progressed,
    timeline: [
      ...g.timeline.slice(-59),
      {
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: wealth(progressed),
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
      (g.version !== 1 && g.version !== 2) ||
      !Number.isFinite(g.cash) ||
      g.cash < 0 ||
      !Array.isArray(g.assets) ||
      g.assets.length < 8 ||
      g.assets.length > 11 ||
      !g.assets.every(
        (a: Asset, i: number) =>
          (i < 8
            ? a.symbol === companies[i].symbol
            : /^[A-Z]{3,5}[34]$/.test(a.symbol)) &&
          [a.name, a.symbol, a.emoji, a.description, a.sector, a.color].every(
            (v) => typeof v === "string",
          ) &&
          Number.isFinite(a.open) &&
          a.open > 0 &&
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
    const base = freshCareer();
    const career = g.version === 2 ? g.career : base;
    if (
      !career ||
      !Number.isFinite(career.xp) ||
      career.xp < 0 ||
      !Number.isSafeInteger(career.ticks) ||
      !Number.isFinite(career.dividends) ||
      !Number.isSafeInteger(career.lastDividendTick) ||
      !Array.isArray(career.ledger) ||
      !career.daily ||
      !Array.isArray(career.daily.claimed) ||
      !["trades", "sells", "chaos", "ipos"].every(
        (k) => Number.isSafeInteger(career.daily[k]) && career.daily[k] >= 0,
      ) ||
      !career.profile ||
      !["name", "avatar", "title", "office", "bio", "color"].every(
        (k) => typeof career.profile[k] === "string",
      ) ||
      !/^#[0-9a-f]{6}$/i.test(career.profile.color) ||
      career.ticks < 0 ||
      career.lastDividendTick < 0 ||
      career.lastDividendTick > career.ticks ||
      career.dividends < 0 ||
      !career.ledger.every(
        (r: any) =>
          r &&
          typeof r.id === "string" &&
          Number.isFinite(r.time) &&
          ["buy", "sell", "dividend", "reward", "ipo"].includes(r.kind) &&
          typeof r.label === "string" &&
          typeof r.symbol === "string" &&
          Number.isFinite(r.amount) &&
          Number.isSafeInteger(r.quantity),
      )
    )
      return fresh();
    return { ...g, version: 2, career: currentCareer(career) };
  } catch {
    return fresh();
  }
}
