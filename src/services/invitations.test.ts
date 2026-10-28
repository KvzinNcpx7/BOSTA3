// @vitest-environment jsdom
import { beforeEach, describe, it, expect } from "vitest";
import {
  parseInvite,
  pendingInvite,
  rememberInvite,
  clearInvite,
  signupReturnUrl,
} from "./invitations";
const code = "abcdef0123456789abcdef0123456789";
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/BOSTA3/");
});
describe("convites de ligas", () => {
  it("normaliza código e link completo sem executar nem abrir a URL", () => {
    expect(parseInvite(code.toUpperCase())).toBe(code);
    expect(
      parseInvite(
        `https://kvzinncpx7.github.io/BOSTA3/?clube=${code.toUpperCase()}`,
      ),
    ).toBe(code);
    expect(parseInvite("javascript:alert(1)")).toBeNull();
    expect(parseInvite("abc")).toBeNull();
  });
  it("sobrevive a sair do link para confirmar o e-mail", () => {
    window.history.replaceState(null, "", `/BOSTA3/?clube=${code}`);
    expect(pendingInvite(100000)).toBe(code);
    window.history.replaceState(null, "", "/BOSTA3/");
    expect(pendingInvite(100001)).toBe(code);
  });
  it("expira depois de sete dias e limpa após a entrada", () => {
    rememberInvite(code, 1000);
    expect(pendingInvite(1000 + 7 * 86400000 + 1)).toBe("");
    rememberInvite(code);
    window.history.replaceState(null, "", `/BOSTA3/?clube=${code}&teste=1`);
    clearInvite();
    expect(pendingInvite()).toBe("");
    expect(window.location.search).toBe("?teste=1");
  });
  it("retorno do cadastro inclui somente rota do Pages e convite válido", () => {
    window.history.replaceState(
      null,
      "",
      `/BOSTA3/?segredo=nao-copiar#token-privado`,
    );
    const url = new URL(signupReturnUrl(code));
    expect(url.pathname).toBe("/BOSTA3/");
    expect(url.searchParams.get("clube")).toBe(code);
    expect(url.searchParams.has("segredo")).toBe(false);
    expect(url.hash).toBe("");
  });
});
