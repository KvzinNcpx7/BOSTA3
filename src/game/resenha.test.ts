import { afterEach, describe, it, expect, vi } from "vitest";
import baseline from "./fixtures/v2-catalog.json";
import { events, achievements } from "./data";
import { fresh, trade, tick, loadGame, award, wealth } from "./engine";
import {
  freshResenha,
  chooseEvent,
  chooseSpecial,
  loadHumorPreferences,
  HUMOR_KEY,
  defaultPreferences,
  enabledSpecial,
} from "./resenha";
import { newHeadlines, specialEvents } from "./resenhaContent";
import { characters, chooseBanter } from "./banter";
import {
  advanceMarket,
  finishSpecial,
  triggerSpecial,
  recordShare,
} from "./simulation";
const now = Date.UTC(2026, 9, 28, 12);
afterEach(() => vi.unstubAllGlobals());
describe("compatibilidade e catálogo", () => {
  it("preserva todos os IDs, ordem e conteúdo dos eventos e conquistas da v2", () => {
    expect(
      events
        .slice(0, baseline.events.length)
        .map(({ id, title, symbol, impact }) => ({
          id,
          title,
          symbol,
          impact,
        })),
    ).toEqual(baseline.events);
    expect(achievements.slice(0, baseline.achievements.length)).toEqual(
      baseline.achievements,
    );
  });
  it("acrescenta pelo menos 60 notícias com alvos e impactos válidos", () => {
    expect(newHeadlines.length).toBeGreaterThanOrEqual(60);
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
    expect(new Set(newHeadlines.map((e) => e.title)).size).toBe(
      newHeadlines.length,
    );
    for (const e of newHeadlines) {
      expect(["ALL", ...fresh().assets.map((a) => a.symbol)]).toContain(
        e.symbol,
      );
      expect(Math.abs(e.impact)).toBeGreaterThan(0);
      expect(Math.abs(e.impact)).toBeLessThanOrEqual(0.3);
    }
  });
  it.each([1, 2])(
    "carrega save v%s sem reiniciar saldo, posições ou conquistas",
    (version) => {
      const before = trade(fresh(), "CALV3", "buy", 12);
      const raw = {
        ...before,
        version,
        resenha: undefined,
        ...(version === 1 ? { career: undefined } : {}),
      };
      vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(raw) });
      const loaded = loadGame();
      expect(loaded.cash).toBe(before.cash);
      expect(loaded.positions).toEqual(before.positions);
      expect(loaded.unlocked).toEqual(before.unlocked);
      expect(loaded.resenha).toEqual(freshResenha());
    },
  );
  it("migra apenas o campo novo quando ele está corrompido", () => {
    const g = trade(fresh(), "POMBO3", "buy", 5);
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify({ ...g, resenha: "ruim" }),
    });
    expect(loadGame().cash).toBe(g.cash);
    expect(loadGame().positions).toEqual(g.positions);
  });
  it("salva e recupera preferência escolar sem tocar no save financeiro", () => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) =>
        key === HUMOR_KEY
          ? JSON.stringify({
              school: true,
              sound: false,
              effects: false,
              extraordinary: true,
            })
          : null,
    });
    expect(loadHumorPreferences()).toEqual({
      school: true,
      sound: false,
      effects: false,
      extraordinary: true,
    });
  });
});
describe("seleção e falas", () => {
  it("modo geral exclui personagens escolares e evita as 6 últimas notícias", () => {
    let recent: number[] = [];
    for (let i = 0; i < 30; i++) {
      const id = chooseEvent(false, recent, () => 0.99);
      expect(events[id].school).toBe(false);
      expect(recent).not.toContain(id);
      recent = [...recent, id].slice(-6);
    }
    expect(
      specialEvents.find((e) => e.id === chooseSpecial(false, () => 0.99))
        ?.school,
    ).toBe(false);
  });
  it("modo escolar inclui notícias próprias e comunicados da Érika", () => {
    expect(events[chooseEvent(true, [], () => 0.99)].school).toBe(true);
    const e = events[chooseEvent(true, [], () => 0.99, true)];
    expect(e.school).toBe(true);
    expect(e.symbol).toBe("FOFO3");
  });
  it("falas variam sem repetir em sequência e respeitam o modo", () => {
    let recent: string[] = [];
    for (let i = 0; i < 20; i++) {
      const comment = chooseBanter("loss", false, recent, () => 0);
      expect(characters[comment.speaker].school).toBe(false);
      expect(comment.text).not.toBe(recent.at(-1));
      recent = [...recent, comment.text].slice(-8);
    }
    expect(
      characters[chooseBanter("buy", true, [], () => 0.99).speaker].school,
    ).toBe(true);
  });
});
describe("efeitos especiais reais", () => {
  it("Grande Iararara move todas as ações sem alterar quantidades ou caixa", () => {
    const g = trade(fresh(), "FOFO3", "buy", 5);
    const next = triggerSpecial(g, "iararara", () => 0.5, now);
    expect(next.assets.every((a, i) => a.price !== g.assets[i].price)).toBe(
      true,
    );
    expect(next.cash).toBe(g.cash);
    expect(next.positions).toEqual(g.positions);
    expect(next.news[0].impacts?.CALV3).toBe(0.22);
    expect(next.unlocked).not.toContain("iarSurvivor");
    expect(finishSpecial(next, now + 8000).unlocked).toContain("iarSurvivor");
  });
  it("Érika aumenta FOFO3 e sua volatilidade por somente 40 segundos", () => {
    const g = triggerSpecial(fresh(), "erika", () => 0.5, now);
    expect(g.assets[3].price).toBe(32.14);
    const during = tick(g, () => 0.9, undefined, 2, false, now + 1000);
    const after = tick(g, () => 0.9, undefined, 2, false, now + 41000);
    expect(during.assets[3].price).toBeGreaterThan(after.assets[3].price);
    expect(g.unlocked).toContain("erikaFriend");
    const news = advanceMarket(
      g,
      { school: true, extraordinary: true },
      false,
      () => 0.99,
      now + 5000,
    );
    expect(news.news[0].symbol).toBe("FOFO3");
    expect(news.news[0].school).toBe(true);
  });
  it("greve bloqueia somente ordens por 8s e permite retomada sem reiniciar", () => {
    const g = triggerSpecial(fresh(), "strike", () => 0.5, now);
    expect(() => trade(g, "BOLO4", "buy", 1, now + 1000)).toThrow("Greve CLT");
    expect(trade(g, "BOLO4", "buy", 1, now + 8000).cash).toBe(9995.5);
    expect(
      tick(g, () => 0.9, undefined, 2, true, now + 1000).assets[0].price,
    ).not.toBe(g.assets[0].price);
  });
  it("Priscila move várias empresas e crise da cantina penaliza BOLO4", () => {
    const g = fresh();
    const p = triggerSpecial(g, "priscila", () => 0.5, now);
    expect(p.assets[3].price).toBeGreaterThan(g.assets[3].price);
    expect(p.assets[1].price).toBeLessThan(g.assets[1].price);
    const c = triggerSpecial(g, "cantina", () => 0.5, now);
    expect(c.assets[7].price).toBe(3.51);
    expect(c.assets[6].price).toBeGreaterThan(g.assets[6].price);
  });
  it("persiste cooldown de 2min e impede especiais consecutivos", () => {
    const g = triggerSpecial(fresh(), "erika", () => 0.5, now);
    expect(triggerSpecial(g, "cantina", () => 0.5, now + 41000)).toBe(g);
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(g) });
    expect(loadGame().resenha.cooldownUntil).toBe(now + 120000);
    expect(
      triggerSpecial(
        finishSpecial(g, now + 41000),
        "cantina",
        () => 0.5,
        now + 120001,
      ).news[0].special,
    ).toBe("cantina");
  });
  it("não dispara extraordinários desligados nem escolares no modo geral", () => {
    const g = advanceMarket(
      fresh(),
      { school: false, extraordinary: false },
      true,
      () => 0,
      now,
    );
    expect(g.resenha.active).toBeNull();
    const general = advanceMarket(
      fresh(),
      { school: false, extraordinary: true },
      true,
      () => 0,
      now,
    );
    expect(general.resenha.active?.kind).toBe("strike");
    const school = advanceMarket(
      fresh(),
      { school: true, extraordinary: true },
      true,
      () => 0,
      now,
    );
    expect(school.resenha.active?.kind).toBe("iararara");
  });
  it("desligar modo limpa somente o efeito escolar, sem reverter preços ou patrimônio", () => {
    const g = triggerSpecial(fresh(), "erika", () => 0.5, now);
    const r = enabledSpecial(g.resenha, {
      ...defaultPreferences,
      school: false,
    });
    expect(r.active).toBeNull();
    expect(r.cooldownUntil).toBe(g.resenha.cooldownUntil);
    expect(wealth({ ...g, resenha: r })).toBe(wealth(g));
  });
  it("caos manual não acelera dividendos e agenda notícias a cada 5 ticks", () => {
    let g = advanceMarket(
      fresh(),
      { school: false, extraordinary: false },
      true,
      () => 0.5,
      now,
    );
    expect(g.career.ticks).toBe(0);
    expect(g.career.daily.chaos).toBe(1);
    expect(g.resenha.chaosPresses).toBe(1);
    for (let i = 0; i < 4; i++)
      g = advanceMarket(
        g,
        { school: false, extraordinary: false },
        false,
        () => 0.5,
        now + (i + 1) * 5000,
      );
    const previous = g.news[0];
    g = advanceMarket(
      g,
      { school: false, extraordinary: false },
      false,
      () => 0.5,
      now + 25000,
    );
    expect(g.news[0]).not.toBe(previous);
  });
  it("variação grande gera balanço sem aplicar o impacto duas vezes", () => {
    const g = fresh();
    const event = events.find((e) => e.impact >= 0.15)!;
    const next = tick(g, () => 0.5, event.id, 2, false, now);
    expect(next.news.some((n) => n.report)).toBe(true);
    const index = g.assets.findIndex((a) => a.symbol === event.symbol);
    expect(next.assets[index].price).toBe(
      Math.round(g.assets[index].price * (1 + event.impact) * 100) / 100,
    );
  });
});
describe("novas conquistas com critérios diferentes", () => {
  it("compartilhar exige 3 notícias distintas e não duplica contagem", () => {
    let g = fresh();
    for (let i = 0; i < 3; i++) g = recordShare(g, { ...events[i], time: now });
    expect(g.unlocked).toContain("zapEconomist");
    expect(
      recordShare(g, { ...events[0], time: now }).resenha.sharedNews,
    ).toHaveLength(3);
  });
  it("desbloqueia ações específicas somente ao atingir os limites", () => {
    expect(trade(fresh(), "POMBO3", "buy", 4).unlocked).not.toContain(
      "pigeonShareholder",
    );
    expect(trade(fresh(), "POMBO3", "buy", 5).unlocked).toContain(
      "pigeonShareholder",
    );
    expect(trade(fresh(), "CLT4", "buy", 10).unlocked).toContain("cltPremium");
  });
  it("exige recebimento de dividendos para empresário da coxinha", () => {
    let g = trade(fresh(), "BOLO4", "buy", 20);
    expect(g.unlocked).not.toContain("coxinhaEntrepreneur");
    g = { ...g, career: { ...g.career, ticks: 59 } };
    expect(tick(g, () => 0.5, undefined, 2, true, now).unlocked).toContain(
      "coxinhaEntrepreneur",
    );
  });
  it("registra compras no topo e desbloqueia somente na terceira", () => {
    let g = fresh();
    g = { ...g, assets: g.assets.map((a) => ({ ...a, history: [a.price] })) };
    for (let i = 0; i < 2; i++) g = trade(g, "CALV3", "buy", 1);
    expect(g.unlocked).not.toContain("topDoctor");
    g = trade(g, "CALV3", "buy", 1);
    expect(g.unlocked).toContain("topDoctor");
  });
  it("considera prejuízo realizado, frequência, riqueza e recuperação", () => {
    const base = fresh();
    expect(award({ ...base, realized: -2500 }).unlocked).toContain(
      "serasaPartner",
    );
    expect(award({ ...base, trades: 50 }).unlocked).toContain("lossDegree");
    expect(award({ ...base, cash: 1e9 }).unlocked).toContain("billion");
    const loss = award({ ...base, cash: 9400 });
    expect(award({ ...loss, cash: 10001, trades: 1 }).unlocked).toContain(
      "economicsRecovery",
    );
    expect(
      award({
        ...base,
        realized: -5000,
        resenha: { ...base.resenha, lossSales: 5 },
      }).unlocked,
    ).toContain("lossKing");
  });
});
