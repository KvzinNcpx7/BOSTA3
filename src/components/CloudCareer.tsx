import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { money, type Game } from "../game/engine";
import { supabase, socialReady } from "../services/social";
import { backupLocal, cloudError, downloadBackup, readCloud, snapshot, writeCloud, type CloudSave } from "../services/cloud";
type Phase = "guest" | "loading" | "choice" | "ready" | "error";
export function CloudCareer({ game, restore, openAccount }: { game: Game; restore: (g: Game) => void; openAccount: () => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>("guest");
  const [remote, setRemote] = useState<CloudSave | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState("");
  const latest = useRef(game); latest.current = game;
  const owner = useRef<string | null>(null);
  const epoch = useRef(0);
  const revision = useRef(0);
  const lastPayload = useRef("");
  const inFlight = useRef<number | null>(null);
  async function inspect(id: string, generation: number) {
    setPhase("loading"); setMessage(""); setConfirm(false);
    try {
      const result = await readCloud(id);
      if (epoch.current !== generation) return;
      setRemote(result); setPhase("choice");
    } catch (e) { if (epoch.current === generation) { setMessage(cloudError(e)); setPhase("error"); } }
  }
  useEffect(() => {
    if (!supabase) return;
    let live = true, changed = false;
    const receive = (next: Session | null) => {
      if (!live) return;
      setSession(next);
      const id = next?.user.id || null;
      if (owner.current === id) return;
      owner.current = id; const gen = ++epoch.current;
      lastPayload.current = ""; revision.current = 0;
      setRemote(null); setMessage(""); setSaved(""); setConfirm(false); setBusy(false);
      if (id) void inspect(id, gen); else setPhase("guest");
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      changed = true;
      // Do not make Supabase calls while its auth callback holds the auth lock.
      setTimeout(() => receive(next), 0);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!live || changed) return;
      if (error) { setMessage(cloudError(error)); return; }
      receive(data.session);
    }).catch(e => { if (live) setMessage(cloudError(e)); });
    return () => { live = false; ++epoch.current; subscription.unsubscribe(); };
  }, []);
  const save = async (initial = false) => {
    const id = owner.current;
    if (!id || inFlight.current === epoch.current || (!initial && phase !== "ready")) return;
    const payload = snapshot(latest.current), encoded = JSON.stringify(payload);
    if (!initial && encoded === lastPayload.current) return;
    const gen = epoch.current;
    inFlight.current = gen; setBusy(true); setMessage("");
    try {
      const nextRevision = await writeCloud(id, revision.current, payload);
      if (epoch.current !== gen) return;
      revision.current = nextRevision; lastPayload.current = encoded;
      setSaved(new Date().toLocaleTimeString("pt-BR")); setPhase("ready"); setConfirm(false);
    } catch (e) {
      if (epoch.current === gen) { setMessage(cloudError(e)); setPhase("error"); }
    } finally { if (inFlight.current === gen) inFlight.current = null; if (epoch.current === gen) setBusy(false); }
  };
  useEffect(() => {
    if (phase !== "ready") return;
    const timer = setInterval(() => void save(), 15000);
    const hidden = () => { if (document.visibilityState === "hidden") void save(); };
    document.addEventListener("visibilitychange", hidden);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", hidden); };
  }, [phase, session?.user.id]);
  const chooseLocal = async () => {
    if (remote && !confirm) { setConfirm(true); return; }
    try {
      if (remote) localStorage.setItem("bosta3-cloud-before-replace-v1", JSON.stringify(snapshot(remote.game)));
      backupLocal(latest.current);
      revision.current = remote?.revision || 0;
      await save(true);
    } catch { setMessage("Não conseguimos guardar o backup. Baixe a carreira e libere espaço antes de substituir."); }
  };
  const chooseCloud = async () => {
    if (!owner.current || inFlight.current === epoch.current) return;
    const gen = epoch.current; inFlight.current = gen; setBusy(true);
    try {
      const result = await readCloud(owner.current);
      if (epoch.current !== gen) return;
      if (!result) throw Error("Save ausente");
      backupLocal(latest.current);
      latest.current = result.game; restore(result.game);
      revision.current = result.revision; lastPayload.current = JSON.stringify(snapshot(result.game));
      setRemote(result); setPhase("ready"); setMessage(""); setConfirm(false);
      setSaved(new Date(result.updatedAt).toLocaleString("pt-BR"));
    } catch (e) { if (epoch.current === gen) { setMessage(cloudError(e)); setPhase("error"); } }
    finally { if (inFlight.current === gen) inFlight.current = null; if (epoch.current === gen) setBusy(false); }
  };
  if (!socialReady) return null;
  return <section className="cloud-career panel" aria-label="Save da carreira na nuvem">
    <div><h2>☁️ Seu prejuízo, agora portátil</h2>
      <p>{!session ? "Entre em Minha carreira para levar o mesmo jogo do PC ao celular." : phase === "ready" ? `Salvamento automático ativo a cada 15 segundos. Último save: ${saved || "aguardando"}.` : phase === "loading" ? "Consultando o cartório dos seus tombos…" : "Escolha a carreira que quer continuar nesta conta. Nenhum save é substituído sem sua escolha."}</p>
    </div>
    {!session ? <button className="trade-button" onClick={openAccount}>Entrar / criar conta</button> : <>
      <p className="form-help">Um aparelho por vez. Antes de trocar de tela ou aparelho, use “Salvar agora” e aguarde a confirmação. Sair da conta mantém a cópia local neste aparelho.</p>
      {phase === "choice" && <div className="cloud-choices">
        <p>Neste aparelho: <strong>{game.career.profile.name}</strong> · {money(game.cash + game.assets.reduce((n, a) => n + a.price * (game.positions[a.symbol]?.quantity || 0), 0))}</p>
        {remote && <p>Na conta: <strong>{remote.game.career.profile.name}</strong> · salvo em {new Date(remote.updatedAt).toLocaleString("pt-BR")}</p>}
        {remote && <button className="primary-button" disabled={busy} onClick={() => void chooseCloud()}>Continuar carreira da nuvem</button>}
        <button className="trade-button" disabled={busy} onClick={() => void chooseLocal()}>{remote ? confirm ? "Confirmar: substituir a nuvem por este aparelho" : "Usar carreira deste aparelho na conta" : "Ativar nuvem com esta carreira"}</button>
        {confirm && <><p>Isso substituirá a carreira da conta. As duas versões terão backup neste aparelho. Não combina carteiras.</p><button className="trade-button" onClick={() => setConfirm(false)}>Cancelar substituição</button></>}
      </div>}
      {phase === "ready" && <button className="primary-button" disabled={busy} onClick={() => void save()}>{busy ? "Salvando…" : "Salvar agora"}</button>}
      {phase === "error" && <button className="trade-button" disabled={busy} onClick={() => owner.current && void inspect(owner.current, epoch.current)}>Rever saves e tentar novamente</button>}
      <button className="trade-button" onClick={() => downloadBackup(game)}>Baixar backup deste aparelho</button>
    </>}
    {message && <p role="status" className="social-message">{message}</p>}
  </section>;
}
