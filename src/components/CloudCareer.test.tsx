// @vitest-environment jsdom
import { render, screen, cleanup, act, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { CloudCareer } from "./CloudCareer";
import { fresh } from "../game/engine";
const m = vi.hoisted(() => ({ handler: null as any, read: vi.fn(), write: vi.fn(), getSession: vi.fn() }));
vi.mock("../services/social", () => ({ socialReady: true, supabase: { auth: {
 getSession: m.getSession, onAuthStateChange: (fn: any) => { m.handler=fn; return {data:{subscription:{unsubscribe:vi.fn()}}}; }
} } }));
vi.mock("../services/cloud", async importOriginal => {
 const actual = await importOriginal<typeof import("../services/cloud")>();
 return {...actual, readCloud:m.read, writeCloud:m.write};
});
const session = {user:{id:'alice'}};
beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); m.getSession.mockResolvedValue({data:{session}}); m.read.mockResolvedValue(null); m.write.mockResolvedValue(1); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
it("não envia o save no login; ativação explícita e vinculada ao dono", async () => {
 render(<CloudCareer game={fresh()} restore={vi.fn()} openAccount={vi.fn()} />);
 await screen.findByText("Ativar nuvem com esta carreira"); expect(m.write).not.toHaveBeenCalled();
 fireEvent.click(screen.getByText("Ativar nuvem com esta carreira"));
 await waitFor(() => expect(m.write).toHaveBeenCalledWith('alice',0,expect.objectContaining({cash:10000})));
 expect(localStorage.getItem('bosta3-before-cloud-v1')).toBeTruthy();
});
it("recupera carreira da nuvem com backup local e escolha explícita", async () => {
 const remote = {...fresh(),cash:5555}; const local = {...fresh(),cash:8888}; const restore=vi.fn();
 m.read.mockResolvedValue({game:remote,revision:4,updatedAt:new Date().toISOString()});
 render(<CloudCareer game={local} restore={restore} openAccount={vi.fn()} />);
 await screen.findByText("Continuar carreira da nuvem"); expect(restore).not.toHaveBeenCalled();
 fireEvent.click(screen.getByText("Continuar carreira da nuvem"));
 await waitFor(() => expect(restore).toHaveBeenCalledWith(remote));
 expect(JSON.parse(localStorage.getItem('bosta3-before-cloud-v1')!).cash).toBe(8888);
 expect(m.write).not.toHaveBeenCalled();
});
it("exige confirmação antes de substituir carreira existente", async () => {
 m.read.mockResolvedValue({game:fresh(),revision:7,updatedAt:new Date().toISOString()});
 render(<CloudCareer game={fresh()} restore={vi.fn()} openAccount={vi.fn()} />);
 fireEvent.click(await screen.findByText('Usar carreira deste aparelho na conta'));
 expect(m.write).not.toHaveBeenCalled();
 fireEvent.click(screen.getByText('Confirmar: substituir a nuvem por este aparelho'));
 await waitFor(() => expect(m.write).toHaveBeenCalledWith('alice',7,expect.anything()));
});
it("conflito interrompe salvamento e conserva jogo local", async () => {
 m.write.mockRejectedValue({message:'SAVE_CONFLICT'}); const restore=vi.fn();
 render(<CloudCareer game={fresh()} restore={restore} openAccount={vi.fn()} />);
 fireEvent.click(await screen.findByText('Ativar nuvem com esta carreira'));
 await screen.findByText(/Outro aparelho salvou/);
 expect(restore).not.toHaveBeenCalled(); expect(m.write).toHaveBeenCalledTimes(1);
});
it("ignora leitura atrasada depois do logout", async () => {
 let resolve: (x:any)=>void = () => {}; m.read.mockReturnValue(new Promise(r=>{resolve=r}));
 render(<CloudCareer game={fresh()} restore={vi.fn()} openAccount={vi.fn()} />);
 await waitFor(()=>expect(m.read).toHaveBeenCalled());
 await act(async()=>m.handler('SIGNED_OUT',null));
 await screen.findByText('Entrar / criar conta');
 await act(async()=>resolve({game:fresh(),revision:9,updatedAt:new Date().toISOString()}));
 expect(screen.getByText('Entrar / criar conta')).toBeTruthy(); expect(screen.queryByText('Continuar carreira da nuvem')).toBeNull();
});
it("salva automaticamente o estado mais recente mesmo com ticks frequentes", async () => {
 vi.useFakeTimers(); const game=fresh();
 const { rerender } = render(<CloudCareer game={game} restore={vi.fn()} openAccount={vi.fn()} />);
 await act(async()=>{});
 await act(async()=>fireEvent.click(screen.getByText('Ativar nuvem com esta carreira')));
 m.write.mockResolvedValue(2);
 for (let i=1;i<=3;i++) {
  rerender(<CloudCareer game={{...game,cash:10000-i*100}} restore={vi.fn()} openAccount={vi.fn()} />);
  await act(async()=>{ vi.advanceTimersByTime(5000); });
 }
 expect(m.write).toHaveBeenCalledTimes(2);
 expect(m.write).toHaveBeenLastCalledWith('alice',1,expect.objectContaining({cash:9700}));
});
it("troca de conta exige nova escolha e ignora conclusão do save antigo", async () => {
 const { rerender } = render(<CloudCareer game={fresh()} restore={vi.fn()} openAccount={vi.fn()} />);
 let resolve:(n:number)=>void=()=>{};
 m.write.mockReturnValue(new Promise(r=>{resolve=r}));
 fireEvent.click(await screen.findByText('Ativar nuvem com esta carreira'));
 await act(async()=>m.handler('SIGNED_IN',{user:{id:'bob'}}));
 await waitFor(()=>expect(m.read).toHaveBeenLastCalledWith('bob'));
 await screen.findByText('Ativar nuvem com esta carreira');
 await act(async()=>resolve(1));
 expect(screen.queryByText('Salvar agora')).toBeNull();
 expect(m.write).toHaveBeenCalledTimes(1);
 expect(m.read).toHaveBeenLastCalledWith('bob');
});
