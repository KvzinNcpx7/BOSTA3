// @vitest-environment jsdom
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { ChaosNews } from "./ChaosNews";
import type { News } from "../game/engine";
const article: News = {
  id: 50,
  title: "Pombo exige migalhas auditadas.",
  symbol: "POMBO3",
  impact: 0.1,
  time: Date.now(),
};
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const setup = (news: News = article) => {
  const shared = vi.fn();
  render(
    <ChaosNews
      news={[news]}
      school={false}
      full
      onAll={() => {}}
      onChaos={() => {}}
      onShared={shared}
      notify={() => {}}
    />,
  );
  return shared;
};
describe("compartilhar notícias sem HTML inseguro", () => {
  it("copia notícia e reconhece compartilhamento somente após sucesso", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: copy },
    });
    const shared = setup();
    fireEvent.click(
      screen.getByRole("button", { name: /Compartilhar notícia/ }),
    );
    await waitFor(() => expect(shared).toHaveBeenCalledWith(article));
    expect(copy.mock.calls[0][0]).toContain(article.title);
    expect(copy.mock.calls[0][0]).toContain("Impacto fictício: +10.00%");
  });
  it("cancelar compartilhamento nativo não conta para conquista", async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException("Cancelado", "AbortError"));
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });
    const shared = setup();
    fireEvent.click(
      screen.getByRole("button", { name: /Compartilhar notícia/ }),
    );
    await waitFor(() => expect(share).toHaveBeenCalledOnce());
    expect(shared).not.toHaveBeenCalled();
  });
  it("falha de cópia oferece texto selecionável sem fingir sucesso", async () => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(Error("bloqueado")) },
    });
    const shared = setup();
    fireEvent.click(
      screen.getByRole("button", { name: /Compartilhar notícia/ }),
    );
    expect(await screen.findByRole("textbox")).toBeTruthy();
    expect(shared).not.toHaveBeenCalled();
  });
  it("texto recebido é escapado pelo React, nunca executado", () => {
    setup({ ...article, title: "<img src=x onerror=alert(1)>" });
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeTruthy();
    expect(document.querySelector("img")).toBeNull();
  });
});
