// @vitest-environment jsdom
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import App from "./App";
import { fresh, trade, SAVE_KEY, type Game } from "./game/engine";
import { HUMOR_KEY } from "./game/resenha";
import { triggerSpecial } from "./game/simulation";
vi.mock("./components/Chart", () => ({
  Chart: () => <div aria-label="Gráfico de cotações" />,
}));
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(Math, "random").mockReturnValue(0.99);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function start(g: Game = { ...fresh(), started: true }) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(g));
  return render(<App />);
}
const saved = () => JSON.parse(localStorage.getItem(SAVE_KEY)!) as Game;
describe("Modo Resenha Escolar integrado", () => {
  it("ativa, persiste e desativa o modo sem mudar patrimônio ou posições", () => {
    const g = { ...trade(fresh(), "FOFO3", "buy", 8), started: true };
    const mounted = start(g);
    const toggle = screen.getByRole("checkbox", {
      name: /MODO RESENHA ESCOLAR/,
    });
    fireEvent.click(toggle);
    expect(JSON.parse(localStorage.getItem(HUMOR_KEY)!).school).toBe(true);
    expect(saved().cash).toBe(g.cash);
    expect(saved().positions).toEqual(g.positions);
    mounted.unmount();
    render(<App />);
    expect(
      screen.getByRole<HTMLInputElement>("checkbox", {
        name: /MODO RESENHA ESCOLAR/,
      }).checked,
    ).toBe(true);
    fireEvent.click(
      screen.getByRole("checkbox", { name: /MODO RESENHA ESCOLAR/ }),
    );
    expect(saved().cash).toBe(g.cash);
    expect(JSON.parse(localStorage.getItem(HUMOR_KEY)!).school).toBe(false);
  });
  it("modo geral oculta notícias escolares antigas e o modo escolar as revela", () => {
    const g = { ...fresh(), started: true };
    g.news = [
      {
        id: 100,
        time: Date.now(),
        symbol: "FOFO3",
        impact: 0.12,
        school: true,
        title: "Érika convocou reunião na cantina.",
      },
      ...g.news,
    ];
    start(g);
    expect(screen.queryByText("Érika convocou reunião na cantina.")).toBeNull();
    fireEvent.click(
      screen.getByRole("checkbox", { name: /MODO RESENHA ESCOLAR/ }),
    );
    expect(screen.getByText("Érika convocou reunião na cantina.")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("checkbox", { name: /MODO RESENHA ESCOLAR/ }),
    );
    expect(saved().news[0].title).toBe("Érika convocou reunião na cantina.");
    expect(screen.queryByText("Érika convocou reunião na cantina.")).toBeNull();
  });
  it("retoma ordens automaticamente ao terminar greve, inclusive com pregão pausado", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-28T12:00:00Z"));
    const g = {
      ...triggerSpecial(fresh(), "strike", () => 0.5, Date.now()),
      started: true,
    };
    start(g);
    fireEvent.click(screen.getByRole("button", { name: "Pausar simulação" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Negociar/ })[0]);
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: /Greve CLT/ })
        .disabled,
    ).toBe(true);
    act(() => vi.advanceTimersByTime(8500));
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Confirmar compra",
      }).disabled,
    ).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar compra" }));
    expect(saved().trades).toBe(1);
  });
  it("desativar extraordinários encerra uma greve sem tocar no saldo", () => {
    const g = {
      ...triggerSpecial(fresh(), "strike", () => 0.5, Date.now()),
      started: true,
    };
    start(g);
    fireEvent.click(screen.getByText("Preferências do caos"));
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Eventos extraordinários/ }),
    );
    expect(saved().resenha.active).toBeNull();
    expect(saved().cash).toBe(g.cash);
  });
  it("som começa desligado mesmo quando outra sessão o habilitou", () => {
    localStorage.setItem(
      HUMOR_KEY,
      JSON.stringify({
        school: true,
        sound: true,
        effects: true,
        extraordinary: true,
      }),
    );
    start();
    fireEvent.click(screen.getByText("Preferências do caos"));
    expect(
      screen.getByRole<HTMLInputElement>("checkbox", { name: /Alerta sonoro/ })
        .checked,
    ).toBe(false);
  });
  it("todas as telas existentes e a Central continuam acessíveis sem alterar a carteira", () => {
    const g = { ...fresh(), started: true };
    start(g);
    const nav = screen.getByRole("navigation", {
      name: "Navegação do terminal",
    });
    const screens = [
      ["Mercado", /Mercado de memes/],
      ["Minha carteira", /Meus ativos/],
      ["Jornal do Caos", /Jornal do Caos/],
      ["Conquistas", /de 17 conquistas/],
      ["Minha carreira", /Departamento de identidade questionável/],
      ["IPO de Pote", /Abra seu unicórnio/],
      ["Clube do Boleto", /Falta ligar o cartório digital/],
      ["Extrato", /Extrato de arrependimentos/],
      ["Central da Resenha", /Zap dos Acionistas/],
    ] as const;
    for (const [name, heading] of screens) {
      fireEvent.click(within(nav).getByRole("button", { name }));
      expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    }
    expect(saved().cash).toBe(g.cash);
    expect(saved().positions).toEqual(g.positions);
  });
});
