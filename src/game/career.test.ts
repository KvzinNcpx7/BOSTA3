import { describe, it, expect, vi, afterEach } from "vitest";
import { fresh, trade, tick, loadGame } from "./engine";
import {
  claimMission,
  currentCareer,
  createCompany,
  freshCareer,
  saveProfile,
} from "./career";
const firm = {
  name: "Gambiarra Espacial",
  symbol: "GAMB3",
  emoji: "🪳",
  description: "Fita isolante e fé em cada foguete.",
};
afterEach(() => vi.unstubAllGlobals());
describe("carreira e recompensas", () => {
  it("paga missão uma vez, inclusive após recarregar", () => {
    let g = fresh();
    for (let i = 0; i < 3; i++) g = trade(g, "BOLO4", "buy", 1);
    const cash = g.cash;
    g = claimMission(g, "trades");
    expect(g.cash).toBe(cash + 120);
    expect(g.career.xp).toBe(55);
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(g) });
    expect(() => claimMission(loadGame(), "trades")).toThrow();
    expect(g.career.ledger[0].kind).toBe("reward");
  });
  it("não paga missões incompletas e reinicia contadores no novo dia", () => {
    expect(() => claimMission(fresh(), "trades")).toThrow();
    const c = freshCareer();
    const changed = currentCareer(
      {
        ...c,
        daily: {
          ...c.daily,
          date: "2000-01-01",
          trades: 3,
          claimed: ["trades"],
        },
      },
      new Date(2026, 9, 28),
    );
    expect(changed.daily.date).toBe("2026-10-28");
    expect(changed.daily.trades).toBe(0);
    expect(changed.daily.claimed).toEqual([]);
  });
  it("paga dividendos apenas na 60ª oscilação automática", () => {
    let g = trade(fresh(), "BOLO4", "buy", 100);
    for (let i = 0; i < 59; i++) g = tick(g, () => 0.5, undefined, 2);
    expect(g.career.dividends).toBe(0);
    g = tick(g, () => 0.5, undefined, 2);
    expect(g.career.dividends).toBe(0.9);
    const cash = g.cash;
    g = tick(g, () => 0.5, undefined, 2);
    expect(g.cash).toBe(cash);
    for (let i = 0; i < 100; i++) g = tick(g, () => 0.5, undefined, 2, false);
    expect(g.cash).toBe(cash);
    expect(g.career.ticks).toBe(61);
  });
  it("não paga para carteira vazia e limita proventos a R$ 500", () => {
    let g = fresh();
    g = { ...g, career: { ...g.career, ticks: 59 } };
    expect(tick(g, () => 0.5, undefined, 2).career.dividends).toBe(0);
    g = { ...g, positions: { BOLO4: { quantity: 1000000, average: 4.5 } } };
    expect(tick(g, () => 0.5, undefined, 2).career.dividends).toBe(500);
  });
  it("preserva o progresso da versão antiga e inicia a carreira", () => {
    const old = {
      ...trade(fresh(), "CALV3", "buy", 5),
      version: 1,
      career: undefined,
    };
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(old) });
    const migrated = loadGame();
    expect(migrated.version).toBe(2);
    expect(migrated.cash).toBe(old.cash);
    expect(migrated.positions).toEqual(old.positions);
    expect(migrated.career.xp).toBe(0);
  });
  it("mantém somente 100 registros", () => {
    let g = fresh();
    for (let i = 0; i < 110; i++)
      g = trade(g, "BOLO4", i % 2 ? "sell" : "buy", 1);
    expect(g.career.ledger).toHaveLength(100);
    expect(new Set(g.career.ledger.map((l) => l.id)).size).toBe(100);
  });
});
describe("identidade e empresas", () => {
  it("salva perfil sem alterar patrimônio", () => {
    const g = fresh();
    const next = saveProfile(g, {
      ...g.career.profile,
      name: "  Duque do Boleto  ",
      avatar: "🦆",
      bio: "Invisto em migalhas.",
    });
    expect(next.career.profile.name).toBe("Duque do Boleto");
    expect(next.cash).toBe(g.cash);
    expect(() => saveProfile(g, { ...g.career.profile, name: "A" })).toThrow();
  });
  it("abre empresa, cobra taxa, negocia e restaura o save", () => {
    let g = createCompany(fresh(), firm);
    expect(g.assets.length).toBe(9);
    expect(g.cash).toBe(9750);
    expect(g.positions.GAMB3).toBeUndefined();
    g = trade(g, "GAMB3", "buy", 10);
    expect(g.cash).toBe(9650);
    expect(g.positions.GAMB3.quantity).toBe(10);
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(g) });
    expect(loadGame()).toEqual(g);
  });
  it("impede tickers repetidos, saldo insuficiente e quarta empresa", () => {
    let g = createCompany(fresh(), firm);
    expect(() => createCompany(g, firm)).toThrow();
    expect(() => createCompany({ ...fresh(), cash: 249 }, firm)).toThrow();
    expect(() =>
      createCompany(fresh(), { ...firm, symbol: "<img>" }),
    ).toThrow();
    g = createCompany(g, { ...firm, symbol: "PIXO3" });
    g = createCompany(g, { ...firm, symbol: "LAJE4" });
    expect(() => createCompany(g, { ...firm, symbol: "BOBA3" })).toThrow();
  });
});
