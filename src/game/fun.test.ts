import { describe, it, expect, vi, afterEach } from "vitest";
import { fresh, trade, loadGame, award, tick, wealth } from "./engine";
import {
  observeFun,
  discoverSecret,
  chatReply,
  appendChat,
  restoreFun,
} from "./fun";
import { secrets, npcCharacters, meetingTemplates } from "./funContent";
import { callMeeting, settleMeeting, skipMeeting, expireFun } from "./meetings";
import { triggerSpecial } from "./simulation";
const now = Date.UTC(2026, 9, 28, 12);
afterEach(() => vi.unstubAllGlobals());
describe("progresso e recordes locais", () => {
  it.each([1, 2])(
    "migra save v%s sem apagar caixa, posições, resenha ou conquistas",
    (version) => {
      const g = trade(fresh(), "CALV3", "buy", 5);
      const raw = {
        ...g,
        version,
        fun: undefined,
        ...(version === 1 ? { career: undefined } : {}),
      };
      vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(raw) });
      const next = loadGame();
      expect(next.cash).toBe(g.cash);
      expect(next.positions).toEqual(g.positions);
      expect(next.unlocked).toEqual(g.unlocked);
      expect(next.resenha).toEqual(g.resenha);
      expect(next.fun.seenTrades).toBe(1);
    },
  );
  it("campo novo corrompido não invalida patrimônio antigo", () => {
    const g = trade(fresh(), "FOFO3", "buy", 10);
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify({ ...g, fun: "ruim" }),
    });
    expect(loadGame().cash).toBe(g.cash);
    expect(loadGame().positions).toEqual(g.positions);
  });
  it("preserva máximas e mínimas ao recarregar e recuperar o saldo", () => {
    let g = award({ ...fresh(), cash: 13000 });
    g = award({ ...g, cash: 7000 });
    expect(g.fun.bestProfit).toBe(3000);
    expect(g.fun.worstLoss).toBe(3000);
    g = award({ ...g, cash: 10000 });
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(g) });
    expect(loadGame().fun.bestProfit).toBe(3000);
    expect(loadGame().fun.worstLoss).toBe(3000);
  });
  it("descobertas não alteram saldo, posições ou preços", () => {
    const g = trade(fresh(), "POMBO3", "buy", 6);
    const next = discoverSecret(g, "irineu", now);
    expect(next.cash).toBe(g.cash);
    expect(next.positions).toEqual(g.positions);
    expect(next.assets).toEqual(g.assets);
    expect(discoverSecret(next, "irineu", now)).toBe(next);
  });
  it("mantém ao menos dez segredos com critérios observáveis", () => {
    expect(secrets.length).toBeGreaterThanOrEqual(10);
    expect(new Set(secrets.map((s) => s.id)).size).toBe(secrets.length);
    let g = trade(fresh(), "BOLO4", "buy", 69);
    expect(g.fun.secrets).toContain("nice");
    g = trade(g, "SONO3", "buy", 8);
    expect(g.fun.secrets).toContain("eightHours");
    expect(award({ ...fresh(), cash: 5 }).fun.secrets).toContain("snackBudget");
  });
  it("detecta operações, perdas, dividendos e metas sem inventar transações", () => {
    const g = fresh();
    const next = observeFun({
      ...g,
      trades: 42,
      resenha: { ...g.resenha, lossSales: 10 },
      career: {
        ...g.career,
        dividends: 69,
        daily: { ...g.career.daily, claimed: ["trades", "sells", "chaos"] },
        profile: { ...g.career.profile, name: "Irineu da Laje" },
      },
    });
    expect(next.fun.secrets).toEqual(
      expect.arrayContaining(["fortyTwo", "tenLosses", "coffee", "rh", "name"]),
    );
    expect(next.cash).toBe(10000);
    expect(next.trades).toBe(42);
  });
  it("identifica coleção das oito empresas originais", () => {
    let g = fresh();
    for (const a of g.assets) g = trade(g, a.symbol, "buy", 1);
    expect(g.fun.secrets).toContain("allEight");
  });
});
describe("Zap, fiscal e plantões", () => {
  it("mensagens reagem à compra e à venda com prejuízo sem repetir na observação seguinte", () => {
    let g = trade(fresh(), "CALV3", "buy", 10);
    expect(g.fun.chat.at(-1)?.text).toContain("CALV3");
    const length = g.fun.chat.length;
    g = observeFun(g);
    expect(g.fun.chat).toHaveLength(length);
    g = {
      ...g,
      assets: g.assets.map((a) =>
        a.symbol === "CALV3" ? { ...a, price: 20 } : a,
      ),
    };
    g = trade(g, "CALV3", "sell", 10);
    expect(g.fun.chat.at(-1)?.text).toBeTruthy();
    expect(g.fun.lastRealized).toBe(-149);
  });
  it("evita repetição imediata e limita conversa a 40 mensagens", () => {
    let f = fresh().fun;
    for (let i = 0; i < 60; i++) {
      const old = f.chat.at(-1)?.text;
      f = chatReply(f, "news", "FOFO3", false, () => 0, now + i);
      expect(f.chat.at(-1)?.text).not.toBe(old);
      expect(npcCharacters[f.chat.at(-1)!.speaker].school).toBe(false);
    }
    expect(f.chat).toHaveLength(40);
    expect(new Set(f.chat.map((m) => m.id)).size).toBe(40);
  });
  it("fiscal aparece em limiares reais sem repetir a cobrança fictícia a cada tick", () => {
    let g = award({ ...fresh(), cash: 9400 });
    expect(g.fun.chat.some((m) => m.speaker === "fiscal")).toBe(true);
    const count = g.fun.chat.filter((m) => m.speaker === "fiscal").length;
    g = award(g);
    expect(g.fun.chat.filter((m) => m.speaker === "fiscal")).toHaveLength(
      count,
    );
    g = award({ ...g, cash: 4900 });
    expect(g.fun.fiscalLevel).toBe(3);
    expect(g.fun.chat.at(-1)?.speaker).toBe("fiscal");
  });
  it("conta crises e emite plantão apenas uma vez por queda observada", () => {
    const g = fresh();
    const news = {
      id: -200,
      title: "Queda grande",
      symbol: "TIGR3",
      impact: -0.2,
      report: true,
      time: now,
    };
    const first = observeFun({ ...g, news: [news, ...g.news] }, () => 0.5, now);
    expect(first.fun.crises).toBe(1);
    expect(first.fun.bulletin?.headline).toContain("CARAI BORRACHA");
    expect(observeFun(first, () => 0.5, now + 1).fun.crises).toBe(1);
    expect(expireFun(first, now + 6501).fun.bulletin).toBeNull();
  });
  it("Irineu altera empresas e Iararara pausa ordens por somente cinco segundos", () => {
    const g = triggerSpecial(fresh(), "irineu", () => 0.9, now);
    expect(g.assets[3].price).toBeGreaterThan(fresh().assets[3].price);
    expect(g.fun.crises).toBe(1);
    const paused = triggerSpecial(fresh(), "iarPause", () => 0.5, now);
    expect(() => trade(paused, "BOLO4", "buy", 1, now + 4999)).toThrow(
      "Pausa Iararara",
    );
    expect(trade(paused, "BOLO4", "buy", 1, now + 5000).trades).toBe(1);
  });
});
describe("assembleias com escolhas locais", () => {
  it("abre pauta sem mover caixa e respeita intervalo de 3 minutos", () => {
    const g = fresh();
    const called = callMeeting(g, now, () => 0);
    expect(called.cash).toBe(g.cash);
    expect(called.assets).toEqual(g.assets);
    expect(callMeeting(called, now + 1)).toBe(called);
    const skipped = skipMeeting(called, called.fun.meeting!.id);
    expect(() => callMeeting(skipped, now + 1000)).toThrow("3 minutos");
    expect(callMeeting(skipped, now + 180001).fun.meeting).not.toBeNull();
  });
  it("todas as propostas produzem consequências diferentes sem mudar quantidades", () => {
    for (const template of meetingTemplates) {
      const g = fresh();
      const called = {
        ...g,
        fun: {
          ...g.fun,
          meeting: {
            id: "call",
            template: template.id,
            openedAt: now,
            expiresAt: now + 300000,
          },
        },
      };
      const outcomes = template.options.map((o) => {
        const next = settleMeeting(called, "call", o.id, now + 1);
        expect(next.cash).toBe(g.cash);
        expect(next.positions).toEqual(g.positions);
        expect(next.fun.meeting).toBeNull();
        expect(next.fun.meetingHistory).toHaveLength(1);
        expect(next.news[0].impacts).toEqual(o.impacts);
        expect(() => settleMeeting(next, "call", o.id, now + 2)).toThrow();
        return JSON.stringify(next.assets.map((a) => a.price));
      });
      expect(new Set(outcomes).size).toBe(4);
    }
  });
  it("expiração ou recusa não aplica decisão escondida", () => {
    const g = callMeeting(fresh(), now, () => 0);
    expect(() =>
      settleMeeting(g, g.fun.meeting!.id, "pigeons", now + 300001),
    ).toThrow("prazo");
    const ended = expireFun(g, now + 300001);
    expect(ended.fun.meeting).toBeNull();
    expect(wealth(ended)).toBe(wealth(g));
    expect(ended.assets).toEqual(g.assets);
  });
});
