// @vitest-environment jsdom
import { useState } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect } from "vitest";
import { CareerPanel, CompanyPanel } from "./CareerPanel";
import { SocialPanel } from "./SocialPanel";
import { fresh, trade, type Game } from "../game/engine";
afterEach(cleanup);
function Harness({
  view,
  initial = fresh(),
}: {
  view: "career" | "company";
  initial?: Game;
}) {
  const [game, setGame] = useState(initial);
  const Panel = view === "career" ? CareerPanel : CompanyPanel;
  return (
    <>
      <Panel game={game} update={setGame} notify={() => {}} />
      <output aria-label="estado">{JSON.stringify(game)}</output>
    </>
  );
}
const state = () =>
  JSON.parse(screen.getByLabelText("estado").textContent!) as Game;
describe("fluxos da expansão", () => {
  it("personaliza nome e avatar e salva a identidade", async () => {
    const user = userEvent.setup();
    render(<Harness view="career" />);
    const input = screen.getByLabelText("Nome de pregão");
    await user.clear(input);
    await user.type(input, "Duquesa do Boleto");
    await user.click(screen.getByRole("button", { name: "Avatar 🦆" }));
    await user.click(
      screen.getByRole("button", { name: /Reconhecer minha firma/ }),
    );
    expect(state().career.profile.name).toBe("Duquesa do Boleto");
    expect(state().career.profile.avatar).toBe("🦆");
    expect(state().cash).toBe(10000);
  });
  it("resgata missão pronta e impede resgate duplicado na interface", async () => {
    const user = userEvent.setup();
    let g = fresh();
    for (let i = 0; i < 3; i++) g = trade(g, "BOLO4", "buy", 1);
    render(<Harness view="career" initial={g} />);
    await user.click(
      screen.getByRole("button", { name: "Resgatar salário fictício" }),
    );
    expect(state().cash).toBe(g.cash + 120);
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Recebido. O RH está chocado.",
      }).disabled,
    ).toBe(true);
  });
  it("abre empresa pelo formulário e exibe o ativo no mercado local", async () => {
    const user = userEvent.setup();
    render(<Harness view="company" />);
    await user.click(
      screen.getByRole("button", { name: /Abrir capital e perder/ }),
    );
    expect(state().assets.at(-1)?.symbol).toBe("MARM3");
    expect(state().cash).toBe(9750);
    expect(screen.getByText(/MARM3 · Marmita Quântica/)).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: /Abrir capital e perder/ }),
    );
    expect(screen.getByRole("alert").textContent).toContain("Ticker único");
    expect(state().cash).toBe(9750);
  });
  it("informa honestamente quando contas e ligas aguardam configuração", () => {
    render(<SocialPanel game={fresh()} notify={() => {}} />);
    expect(screen.getByText(/Falta ligar o cartório digital/)).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Publicar meu placar atual" }),
    ).toBeNull();
    expect(
      screen.getByRole("link", { name: /Guia do dono/ }).getAttribute("href"),
    ).toContain("docs/SUPABASE.md");
  });
});
