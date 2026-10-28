// @vitest-environment jsdom
import { useState } from "react";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { ResenhaHub, type HubTab } from "./ResenhaHub";
import { fresh, type Game } from "../game/engine";
import { appendChat } from "../game/fun";
const png = vi.hoisted(() => ({ draw: vi.fn(), blob: vi.fn() }));
vi.mock("../services/receipt", async () => {
  const actual = await vi.importActual<typeof import("../services/receipt")>(
    "../services/receipt",
  );
  return { ...actual, drawReceipt: png.draw, receiptPng: png.blob };
});
beforeEach(() => {
  vi.resetAllMocks();
  png.blob.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:card-preview"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function Harness({
  initial = "Zap",
  game: seed = fresh(),
}: {
  initial?: HubTab;
  game?: Game;
}) {
  const [game, setGame] = useState(seed);
  return (
    <>
      <ResenhaHub
        game={game}
        school={false}
        update={setGame}
        notify={() => {}}
        initial={initial}
      />
      <output aria-label="estado">{JSON.stringify(game)}</output>
    </>
  );
}
describe("Central da Resenha", () => {
  it("conversa é local, escola fica fora do modo geral e texto é escapado", () => {
    let game = fresh();
    game = {
      ...game,
      fun: appendChat(
        appendChat(game.fun, "erika", "Mensagem escolar"),
        "irineu",
        "<img src=x onerror=alert(1)>",
      ),
    };
    render(<Harness game={game} />);
    expect(screen.queryByText("Mensagem escolar")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeTruthy();
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText(/Grupo fictício/)).toBeTruthy();
  });
  it("reunião permite revisar efeitos antes de confirmar e aplica uma decisão", () => {
    render(<Harness initial="Assembleia" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Convocar reunião questionável" }),
    );
    const radio = screen.getAllByRole("radio")[0];
    fireEvent.click(radio);
    expect(screen.getByText("Consequência ao confirmar")).toBeTruthy();
    const before = JSON.parse(
      screen.getByLabelText("estado").textContent!,
    ) as Game;
    fireEvent.click(screen.getByRole("button", { name: /Confirmar voto/ }));
    const after = JSON.parse(
      screen.getByLabelText("estado").textContent!,
    ) as Game;
    expect(after.cash).toBe(before.cash);
    expect(after.positions).toEqual(before.positions);
    expect(after.assets).not.toEqual(before.assets);
    expect(after.fun.meetingHistory).toHaveLength(1);
  });
  it("gera prévia, oferece download e revoga a URL ao sair", async () => {
    const rendered = render(<Harness initial="Comprovante" />);
    expect(
      (
        screen.getByLabelText(
          "Nome fictício para este card",
        ) as HTMLInputElement
      ).value,
    ).toBe("Acionista de Migalhas");
    fireEvent.click(screen.getByRole("button", { name: /Gerar comprovante/ }));
    expect(await screen.findByAltText(/Prévia do Comprovante/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Baixar PNG" }).getAttribute("download"),
    ).toBe("BOSTA3-comprovante.png");
    expect(png.draw.mock.calls[0][1].alias).toBe("Acionista de Migalhas");
    rendered.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:card-preview");
  });
  it("comprovante não aparece como pronto se o PNG falhar", async () => {
    png.blob.mockRejectedValue(Error("Falha no PNG"));
    render(<Harness initial="Comprovante" />);
    fireEvent.click(screen.getByRole("button", { name: /Gerar comprovante/ }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Baixar PNG" })).toBeNull();
  });
  it("sair durante geração descarta resultado sem criar URL vazando memória", async () => {
    let resolve: (v: Blob) => void = () => {};
    png.blob.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const rendered = render(<Harness initial="Comprovante" />);
    fireEvent.click(screen.getByRole("button", { name: /Gerar comprovante/ }));
    rendered.unmount();
    resolve(new Blob(["png"], { type: "image/png" }));
    await waitFor(() => expect(png.blob).toHaveBeenCalled());
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
