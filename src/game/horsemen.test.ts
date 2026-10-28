import { describe, it, expect, vi, afterEach } from "vitest";
import { fresh, wealth, trade, loadGame } from "./engine";
import { triggerSpecial } from "./simulation";
import { chooseSpecial } from "./resenha";
import { horsemenLines } from "./horsemen";
import { newHeadlines } from "./resenhaContent";
afterEach(() => vi.unstubAllGlobals());
describe("Cavaleiros fictícios", () => {
  it("Painho não modifica sequer a referência do save nem bloqueia operações", () => {
    const g = fresh(); const snapshot = JSON.stringify(g);
    expect(triggerSpecial(g, "painho")).toBe(g);
    expect(JSON.stringify(g)).toBe(snapshot);
    expect(wealth(g)).toBe(10000);
    expect(trade(g, "POMBO3", "buy", 1)).toBeTruthy();
  });
  it("oferece mais de 30 notícias e falas novas", () => {
    expect(horsemenLines.length + newHeadlines.filter(n => n.title.includes("SÁTIRA FICTÍCIA")).length).toBeGreaterThanOrEqual(30);
  });
  it("cenários hipotéticos podem variar em direções opostas", () => {
    const g = fresh(); let n = 0;
    const next = triggerSpecial(g, "hipotetico", () => [0, 0.5, 1, 0.5][n++ % 4]);
    expect(next.assets[0].price).toBeLessThan(g.assets[0].price);
    expect(next.assets[1].price).toBeGreaterThan(g.assets[1].price);
    expect(next.cash).toBe(g.cash); expect(next.positions).toBe(g.positions);
  });
  it("quarteto é raríssimo e move cotações sem debitar caixa", () => {
    expect(chooseSpecial(false, () => 0.995)).toBe("cavaleiros");
    expect(chooseSpecial(false, () => 0.5)).not.toBe("cavaleiros");
    const g = fresh(); const next = triggerSpecial(g, "cavaleiros");
    expect(next.cash).toBe(g.cash); expect(next.positions).toBe(g.positions);
    expect(next.assets.map(a => a.price)).not.toEqual(g.assets.map(a => a.price));
    expect(next.fun.chat.slice(-5).map(m => m.speaker)).toEqual(["vorcaro", "hipotetico", "painho", "taxad", "irineu"]);
    expect(triggerSpecial(next, "cavaleiros")).toBe(next);
  });
  it("migra save anterior preservando saldo e títulos", () => {
    const g = fresh(); delete (g.resenha.specialCounts as Partial<typeof g.resenha.specialCounts>).cavaleiros;
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(g) });
    const restored = loadGame();
    expect(restored.cash).toBe(g.cash); expect(restored.positions).toEqual(g.positions);
    expect(restored.resenha.specialCounts.cavaleiros).toBe(0);
  });
});
