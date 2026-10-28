// @vitest-environment jsdom
import { render, screen, cleanup, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { SocialPanel } from "./SocialPanel";
import { fresh } from "../game/engine";
const m = vi.hoisted(() => ({
  handler: null as null | ((event: string, session: any) => void),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  clubs: vi.fn(),
  ranking: vi.fn(),
  shareScore: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock("../services/social", () => ({
  socialReady: true,
  supabase: {
    auth: {
      getSession: m.getSession,
      onAuthStateChange: m.onAuthStateChange,
      signUp: m.signUp,
      signInWithPassword: m.signInWithPassword,
      signOut: m.signOut,
    },
    rpc: m.rpc,
  },
  clubs: m.clubs,
  ranking: m.ranking,
  shareScore: m.shareScore,
}));
const session = {
  user: { id: "player-1", email: "conta@example.invalid" },
  access_token: "token-nao-exibir",
};
const code = "abcdef0123456789abcdef0123456789";
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  window.history.replaceState(null, "", "/BOSTA3/");
  m.handler = null;
  m.getSession.mockResolvedValue({ data: { session: null }, error: null });
  m.onAuthStateChange.mockImplementation((fn) => {
    m.handler = fn;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  m.signUp.mockResolvedValue({ data: { session: null }, error: null });
  m.clubs.mockResolvedValue([]);
  m.ranking.mockResolvedValue([]);
  m.shareScore.mockResolvedValue(undefined);
  m.rpc.mockResolvedValue({ data: "league-1", error: null });
});
afterEach(cleanup);
const setup = () => render(<SocialPanel game={fresh()} notify={() => {}} />);
async function fillSignup() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Abrir conta" }));
  await user.type(
    screen.getByLabelText("E-mail do responsável pelo estrago"),
    "conta@example.invalid",
  );
  await user.type(
    screen.getByLabelText("Senha (mínimo 8 caracteres)"),
    "senha-ficticia-123",
  );
  await user.click(screen.getByRole("button", { name: "Criar minha conta" }));
  return user;
}
describe("login e convite sem avisos antigos", () => {
  it("limpa aviso de confirmação quando a conta entra na sessão", async () => {
    setup();
    await fillSignup();
    expect(
      await screen.findByText(/Confira seu e-mail para confirmar/),
    ).toBeTruthy();
    act(() => m.handler?.("SIGNED_IN", session));
    expect(await screen.findByText("conta@example.invalid")).toBeTruthy();
    expect(screen.queryByText(/Confira seu e-mail para confirmar/)).toBeNull();
  });
  it("resposta atrasada do cadastro não recoloca o aviso depois de login", async () => {
    let finish: (v: any) => void = () => {};
    m.signUp.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    setup();
    await fillSignup();
    act(() => m.handler?.("SIGNED_IN", session));
    await act(async () => finish({ data: { session: null }, error: null }));
    expect(screen.queryByText(/Confira seu e-mail para confirmar/)).toBeNull();
    expect(screen.getByText("conta@example.invalid")).toBeTruthy();
  });
  it("getSession atrasado não desfaz um login mais recente", async () => {
    let finish: (v: any) => void = () => {};
    m.getSession.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    setup();
    act(() => m.handler?.("SIGNED_IN", session));
    await act(async () => finish({ data: { session: null }, error: null }));
    expect(screen.getByText("conta@example.invalid")).toBeTruthy();
  });
  it("mantém convite no cadastro e entra só depois de confirmação explícita", async () => {
    window.history.replaceState(null, "", `/BOSTA3/?clube=${code}`);
    setup();
    await fillSignup();
    expect(m.signUp.mock.calls[0][0].options.emailRedirectTo).toContain(
      `clube=${code}`,
    );
    act(() => m.handler?.("SIGNED_IN", session));
    const input = await screen.findByLabelText("Código enviado por um amigo");
    expect((input as HTMLInputElement).value).toBe(code);
    expect(m.rpc).not.toHaveBeenCalled();
    m.clubs.mockResolvedValue([
      { id: "league-1", name: "Conselho da Laje", invite_code: code },
    ]);
    await userEvent.click(
      screen.getByRole("button", { name: "Entrar nessa sociedade" }),
    );
    await waitFor(() =>
      expect(m.rpc).toHaveBeenCalledWith("join_club", { code }),
    );
    expect(window.location.search).toBe("");
    expect((input as HTMLInputElement).value).toBe("");
  });
  it("aceita link completo colado e mantém convite quando o servidor recusa", async () => {
    m.getSession.mockResolvedValue({ data: { session }, error: null });
    m.rpc.mockResolvedValue({
      data: null,
      error: { message: "Invalid invitation" },
    });
    setup();
    const input = await screen.findByLabelText("Código enviado por um amigo");
    await userEvent.type(
      input,
      `https://kvzinncpx7.github.io/BOSTA3/?clube=${code.toUpperCase()}`,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Entrar nessa sociedade" }),
    );
    await waitFor(() =>
      expect(m.rpc).toHaveBeenCalledWith("join_club", { code }),
    );
    expect(
      await screen.findByText(/Esse convite não foi reconhecido/),
    ).toBeTruthy();
    expect((input as HTMLInputElement).value).toContain(code.toUpperCase());
  });
  it("convite inválido não envia requisição nem publica placar", async () => {
    m.getSession.mockResolvedValue({ data: { session }, error: null });
    setup();
    const input = await screen.findByLabelText("Código enviado por um amigo");
    await userEvent.type(input, "isto-nao-e-um-convite");
    await userEvent.click(
      screen.getByRole("button", { name: "Entrar nessa sociedade" }),
    );
    expect(
      await screen.findByText(/Esse convite não foi reconhecido/),
    ).toBeTruthy();
    expect(m.rpc).not.toHaveBeenCalled();
    expect(m.shareScore).not.toHaveBeenCalled();
  });
});
it("oferece login na carreira sem consultar ou publicar ligas", async () => {
 m.getSession.mockResolvedValue({data:{session},error:null});
 render(<SocialPanel game={fresh()} notify={vi.fn()} accountOnly />);
 await screen.findByText('conta@example.invalid');
 expect(screen.getByText('Minha conta BOSTA3')).toBeTruthy();
 expect(screen.queryByText('Publicar meu placar atual')).toBeNull();
 expect(m.clubs).not.toHaveBeenCalled();expect(m.shareScore).not.toHaveBeenCalled();
});
