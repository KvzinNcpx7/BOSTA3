import { describe, it, expect } from "vitest";
import { fresh, trade, tick, wealth, award } from "./engine";
import { events } from "./data";
describe("negociação fictícia", () => {
  it("começa com 10 mil e nenhum ativo", () => {
    const g = fresh();
    expect(g.cash).toBe(10000);
    expect(wealth(g)).toBe(10000);
    expect(g.positions).toEqual({});
  });
  it("debita compra, calcula média ponderada e preserva patrimônio", () => {
    let g = trade(fresh(), "CALV3", "buy", 10);
    expect(g.cash).toBe(9651);
    expect(wealth(g)).toBe(10000);
    g = {
      ...g,
      assets: g.assets.map((a) =>
        a.symbol === "CALV3" ? { ...a, price: 40 } : a,
      ),
    };
    g = trade(g, "CALV3", "buy", 10);
    expect(g.positions.CALV3).toEqual({ quantity: 20, average: 37.45 });
    expect(g.unlocked).toContain("first");
  });
  it("vende com prejuízo, credita saldo e desbloqueia conquista", () => {
    let g = trade(fresh(), "CALV3", "buy", 10);
    g = {
      ...g,
      assets: g.assets.map((a) =>
        a.symbol === "CALV3" ? { ...a, price: 20 } : a,
      ),
    };
    g = trade(g, "CALV3", "sell", 10);
    expect(g.cash).toBe(9851);
    expect(g.realized).toBe(-149);
    expect(g.positions.CALV3).toBeUndefined();
    expect(g.unlocked).toContain("sellLoss");
  });
  it("impede saldo negativo, venda descoberta e quantidades inválidas", () => {
    const g = fresh();
    expect(() => trade(g, "CALV3", "buy", 10000)).toThrow();
    expect(() => trade(g, "CALV3", "sell", 1)).toThrow();
    for (const n of [-1, 0, 0.5, NaN, Infinity])
      expect(() => trade(g, "CALV3", "buy", n)).toThrow();
  });
});
describe("simulação", () => {
  it("tem ao menos 30 notícias e cada uma impacta os ativos corretos", () => {
    expect(events.length).toBeGreaterThanOrEqual(30);
    events.forEach((e, i) => {
      const before = fresh();
      const after = tick(before, () => 0.5, i, 2);
      after.assets.forEach((a, j) => {
        const expected =
          e.symbol === "ALL" || a.symbol === e.symbol
            ? Math.max(
                0.01,
                Math.round(before.assets[j].price * (1 + e.impact) * 100) / 100,
              )
            : before.assets[j].price;
        expect(a.price).toBe(expected);
      });
      expect(after.news[0].title).toBe(e.title);
    });
  });
  it("CLT cai segunda-feira e preços nunca ficam negativos", () => {
    expect(tick(fresh(), () => 0.5, undefined, 1).assets[1].price).toBeLessThan(
      fresh().assets[1].price,
    );
    let g = fresh();
    for (let i = 0; i < 1000; i++) g = tick(g, () => 0, 32, 1);
    expect(
      g.assets.every((a) => a.price >= 0.01 && a.history.length <= 60),
    ).toBe(true);
    expect(g.timeline.length).toBeLessThanOrEqual(60);
    expect(g.news.length).toBeLessThanOrEqual(40);
  });
  it("libera marcos sem duplicar conquistas", () => {
    let g = award({ ...fresh(), cash: 1000000, trades: 20 });
    g = award(g);
    expect(g.unlocked).toEqual(["first", "trader", "million"]);
    expect(award({ ...fresh(), cash: 5 }).unlocked).toContain("snack");
  });
});

describe("persistência", () => {
  it("mantém posições e saldo após serialização", async () => {
    const { vi } = await import("vitest");
    const { loadGame, SAVE_KEY } = await import("./engine");
    const g = trade(fresh(), "BOLO4", "buy", 20);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => (key === SAVE_KEY ? JSON.stringify(g) : null),
    });
    expect(loadGame()).toEqual(g);
    vi.unstubAllGlobals();
  });
  it("recupera estado inicial se o save estiver corrompido ou indisponível", async () => {
    const { vi } = await import("vitest");
    const { loadGame } = await import("./engine");
    for (const raw of [
      "{bad",
      "{}",
      JSON.stringify({ ...fresh(), cash: -1 }),
    ]) {
      vi.stubGlobal("localStorage", { getItem: () => raw });
      expect(loadGame().cash).toBe(10000);
    }
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw Error("blocked");
      },
    });
    expect(loadGame().cash).toBe(10000);
    vi.unstubAllGlobals();
  });
});
