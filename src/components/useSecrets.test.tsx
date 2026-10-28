// @vitest-environment jsdom
import { useState } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { useSecrets } from "./useSecrets";
import { fresh } from "../game/engine";
afterEach(cleanup);
function Harness({ school = false }: { school?: boolean }) {
  const [game, setGame] = useState(fresh);
  const logo = useSecrets(school, setGame);
  return (
    <>
      <button onClick={logo}>Logo</button>
      <input aria-label="Senha privada" type="password" />
      <output>{game.fun.secrets.join(",")}</output>
      <div aria-label="saldo">{game.cash}</div>
    </>
  );
}
function type(target: Element | Document, text: string) {
  for (const key of text) fireEvent.keyDown(target, { key });
}
describe("segredos opcionais sem interceptar credenciais", () => {
  it("7 cliques no logo descobrem uma única vez sem alterar dinheiro", () => {
    render(<Harness />);
    for (let i = 0; i < 14; i++)
      fireEvent.click(screen.getByRole("button", { name: "Logo" }));
    expect(screen.getByRole("status").textContent).toBe("logo");
    expect(screen.getByLabelText("saldo").textContent).toBe("10000");
  });
  it("digitar IRINEU fora dos campos descobre; no campo de senha não faz nada", () => {
    render(<Harness />);
    type(screen.getByLabelText("Senha privada"), "IRINEU");
    expect(screen.getByRole("status").textContent).toBe("");
    type(document, "IRINEU");
    expect(screen.getByRole("status").textContent).toBe("irineu");
  });
  it("Iararara respeita o modo escolar e Bora Bill funciona no modo geral", () => {
    const first = render(<Harness />);
    type(document, "IARARARA");
    expect(screen.getByRole("status").textContent).toBe("");
    type(document, "BORABILL");
    expect(screen.getByRole("status").textContent).toBe("bill");
    first.unmount();
    render(<Harness school />);
    type(document, "IARARARA");
    expect(screen.getByRole("status").textContent).toBe("iar");
  });
});
