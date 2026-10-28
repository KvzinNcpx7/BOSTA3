import { it, expect, vi, afterEach } from "vitest";
import { fresh, decodeGame, loadGame } from "../game/engine";
import { snapshot, readCloud, writeCloud } from "./cloud";
const m=vi.hoisted(()=>({ select:vi.fn(), eq:vi.fn(), maybeSingle:vi.fn(), rpc:vi.fn() }));
vi.mock('./social',()=>({supabase:{from:()=>({select:m.select}),rpc:m.rpc}}));
afterEach(()=>{vi.resetAllMocks();vi.unstubAllGlobals();});
it('valida nuvem corrompida sem resetar a carreira ou gravar um save novo',async()=>{
 m.select.mockReturnValue({eq:m.eq});m.eq.mockReturnValue({maybeSingle:m.maybeSingle});
 m.maybeSingle.mockResolvedValue({data:{payload:{version:999},revision:1},error:null});
 await expect(readCloud('alice')).rejects.toThrow('incompatível');
 expect(m.rpc).not.toHaveBeenCalled();expect(m.eq).toHaveBeenCalledWith('owner_id','alice');
});
it('separa campos do jogo de sessão e metadados externos',()=>{
 const g=Object.assign(fresh(),{access_token:'privado',email:'privado',invite:'privado'});
 expect(snapshot(g)).not.toHaveProperty('access_token');expect(snapshot(g)).not.toHaveProperty('email');
 expect(snapshot(g)).not.toHaveProperty('invite');expect(snapshot(g).cash).toBe(g.cash);
});
it('envia identidade e revisão esperada para proteção no banco',async()=>{
 m.rpc.mockResolvedValue({data:3,error:null});
 await expect(writeCloud('alice',2,fresh())).resolves.toBe(3);
 expect(m.rpc).toHaveBeenCalledWith('save_game',expect.objectContaining({p_owner:'alice',p_expected:2}));
});
it('a validação pura não toca no navegador; loadGame mantém fallback local antigo',()=>{
 vi.stubGlobal('localStorage',{getItem:()=>'{invalido'});
 expect(decodeGame('{invalido')).toBeNull();expect(loadGame().cash).toBe(10000);
 const g={...fresh(),cash:4321};expect(decodeGame(JSON.stringify(g))?.cash).toBe(4321);
});
