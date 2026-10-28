import {
  pendingInvite,
  parseInvite,
  rememberInvite,
  clearInvite,
  signupReturnUrl,
  socialError,
} from "../services/invitations";
import { useEffect, useState, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { Users, Copy, RefreshCw, LogOut } from "lucide-react";
import {
  supabase,
  socialReady,
  clubs,
  ranking,
  shareScore,
  type Club,
  type RankingRow,
} from "../services/social";
import { money, type Game } from "../game/engine";
export function SocialPanel({
  game,
  notify,
  accountOnly = false,
}: {
  accountOnly?: boolean;
  game: Game;
  notify: (s: string) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState<Club[]>([]);
  const [selected, setSelected] = useState("");
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [name, setName] = useState("");
  const [invite, setInvite] = useState(pendingInvite);
  const currentSession = useRef<Session | null>(null);
  useEffect(() => {
    if (parseInvite(invite)) rememberInvite(invite);
  }, [invite]);
  const fail = (e: unknown) => setMessage(socialError(e));
  useEffect(() => {
    if (!supabase) return;
    let live = true;
    let authChanged = false;
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!live || authChanged) return;
        if (error) fail(error);
        currentSession.current = data.session;
        setSession(data.session);
        if (data.session) setMessage("");
      })
      .catch((e) => {
        if (live && !authChanged) fail(e);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!live) return;
      authChanged = true;
      currentSession.current = next;
      setSession(next);
      if (next && _event === "SIGNED_IN") {
        setMessage("");
        setPassword("");
      }
    });
    return () => {
      live = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    let live = true;
    setGroups([]);
    setRows([]);
    setSelected("");
    if (session && !accountOnly)
      clubs()
        .then((v) => {
          if (live) {
            setGroups(v);
            setSelected(v[0]?.id || "");
          }
        })
        .catch((e) => {
          if (live) fail(e);
        });
    return () => {
      live = false;
    };
  }, [session?.user.id, accountOnly]);
  useEffect(() => {
    let live = true;
    setRows([]);
    if (selected)
      ranking(selected)
        .then((v) => {
          if (live) setRows(v);
        })
        .catch((e) => {
          if (live) fail(e);
        });
    return () => {
      live = false;
    };
  }, [selected]);
  const refresh = async () => {
    const list = await clubs();
    setGroups(list);
    const id = selected || list[0]?.id || "";
    setSelected(id);
    if (id) setRows(await ranking(id));
  };
  const action = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };
  const group = groups.find((g) => g.id === selected);
  if (!socialReady)
    return (
      <section className="club-unavailable panel">
        <span className="club-emoji">🪑</span>
        <div className="eyebrow">CLUBE DO BOLETO · EM PREPARAÇÃO</div>
        <h2>
          O salão está pronto.
          <br />
          Falta ligar o cartório digital.
        </h2>
        <p>
          Contas e ligas entre amigos precisam da configuração única do Supabase
          pelo dono do site. Assim que ele ativar, você poderá criar conta,
          abrir sua liga e compartilhar o código com os outros responsáveis pelo
          prejuízo.
        </p>
        <div className="setup-steps">
          <span>01 · Criar projeto Supabase</span>
          <span>02 · Executar o SQL do repositório</span>
          <span>03 · Configurar as duas variáveis e publicar</span>
        </div>
        <p className="muted">
          Enquanto isso, sua carreira local continua funcionando. Nenhum ranking
          falso preenchendo cadeira.
        </p>
        <a
          className="primary-button"
          href="https://github.com/KvzinNcpx7/BOSTA3/blob/main/docs/SUPABASE.md"
          target="_blank"
          rel="noreferrer"
        >
          Guia do dono do clube ↗
        </a>
      </section>
    );
  return (
    <div className="social-layout">
      <section className="panel social-account">
        <div className="panel-heading">
          <div>
            <h2>
              <Users size={18} /> {accountOnly ? "Minha conta BOSTA3" : "Clube do Boleto"}
            </h2>
            <p>Porque passar vergonha em grupo tem desconto emocional.</p>
          </div>
        </div>
        {!session ? (
          <form
            className="career-form"
            onSubmit={(e) => {
              e.preventDefault();
              action(async () => {
                if (mode === "signup") {
                  const { data, error } = await supabase!.auth.signUp({
                    email,
                    password,
                    options: {
                      emailRedirectTo: signupReturnUrl(invite),
                    },
                  });
                  if (error) throw error;
                  setPassword("");
                  setMessage(
                    data.session || currentSession.current
                      ? ""
                      : "Confira seu e-mail para confirmar a conta. O boleto de boas-vindas é metafórico.",
                  );
                } else {
                  const { error } = await supabase!.auth.signInWithPassword({
                    email,
                    password,
                  });
                  if (error) throw error;
                  setPassword("");
                  setMessage("");
                }
              });
            }}
          >
            <div className="trade-tabs">
              <button
                type="button"
                className={mode === "login" ? "buy selected" : ""}
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                Já sou sócio do caos
              </button>
              <button
                type="button"
                className={mode === "signup" ? "buy selected" : ""}
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                }}
              >
                Abrir conta
              </button>
            </div>
            <label>
              E-mail do responsável pelo estrago
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              {mode === "signup" ? "Senha (mínimo 8 caracteres)" : "Senha"}
              <input
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                minLength={mode === "signup" ? 8 : 1}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="primary-button full" disabled={busy}>
              {busy
                ? "Carimbando papelada…"
                : mode === "login"
                  ? "Entrar no clube"
                  : "Criar minha conta"}
            </button>
            <p className="form-help">
              Use a mesma conta no PC e no celular. Em Minha carreira, ative o save na nuvem para continuar seu jogo em outro aparelho.
            </p>
          </form>
        ) : (
          <div className="career-form">
            <p className="account-status">
              🪪 Sócio autenticado: <strong>{session.user.email}</strong>
            </p>
            {!accountOnly && <><button
              className="primary-button full"
              disabled={busy}
              onClick={() =>
                action(async () => {
                  await shareScore(game);
                  await refresh();
                  notify(
                    "Patrimônio publicado. Seus amigos agora têm material para o churrasco.",
                  );
                })
              }
            >
              Publicar meu placar atual
            </button>
            <p className="form-help">
              Publica seu nome de pregão, avatar, cargo, patrimônio e XP para
              membros das suas ligas. Você decide quando atualizar.
            </p></>}
            <button
              className="trade-button"
              disabled={busy}
              onClick={() =>
                action(async () => {
                  const { error } = await supabase!.auth.signOut();
                  if (error) throw error;
                  setRows([]);
                })
              }
            >
              <LogOut size={14} />
              Sair com a dignidade restante
            </button>
          </div>
        )}
        {message && (
          <p className="social-message" role="status">
            {message}
          </p>
        )}
      </section>
      {session && !accountOnly && (
        <>
          <section className="panel league-tools">
            <div className="panel-heading">
              <div>
                <h2>Monte sua associação de duvidosos</h2>
                <p>
                  Máximo de 20 ligas por pessoa. Acima disso já é pirâmide de
                  reuniões.
                </p>
              </div>
            </div>
            <form
              className="career-form"
              onSubmit={(e) => {
                e.preventDefault();
                action(async () => {
                  await shareScore(game);
                  const { data, error } = await supabase!.rpc("create_club", {
                    club_name: name.trim(),
                  });
                  if (error) throw error;
                  setName("");
                  const list = await clubs();
                  setGroups(list);
                  setSelected(data);
                  notify("Liga criada. A ata da reunião já veio com prejuízo.");
                });
              }}
            >
              <label>
                Nome da liga
                <input
                  required
                  minLength={3}
                  maxLength={50}
                  placeholder="Conselho Fiscal do Churrasco"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <button className="primary-button" disabled={busy}>
                Fundar sindicato do caos
              </button>
            </form>
            <form
              className="career-form join-club"
              onSubmit={(e) => {
                e.preventDefault();
                action(async () => {
                  const code = parseInvite(invite);
                  if (!code) throw Error("Convite inválido");
                  await shareScore(game);
                  const { data, error } = await supabase!.rpc("join_club", {
                    code,
                  });
                  if (error) throw error;
                  clearInvite();
                  setInvite("");
                  const list = await clubs();
                  setGroups(list);
                  setSelected(data);
                  notify("Você entrou na liga. A culpa agora é coletiva.");
                });
              }}
            >
              <label>
                Código enviado por um amigo
                <input
                  required
                  maxLength={512}
                  placeholder="Cole o link completo ou o código de 32 caracteres"
                  aria-describedby="invite-help"
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                />
              </label>
              <p className="form-help" id="invite-help">
                Seu convite fica guardado neste navegador por até 7 dias,
                inclusive durante a confirmação do e-mail. Você escolhe quando
                entrar.
              </p>
              <button className="trade-button" disabled={busy}>
                Entrar nessa sociedade
              </button>
            </form>
          </section>
          <section className="panel league-ranking">
            <div className="panel-heading">
              <div>
                <h2>Ranking de responsabilidade compartilhada</h2>
                <p>
                  Placar recreativo: valores declarados pelo navegador, sem
                  validação das operações no servidor. Não vale prêmio nem
                  dinheiro.
                </p>
              </div>
              <button
                className="icon-button"
                disabled={busy || !selected}
                aria-label="Atualizar ranking"
                onClick={() => action(refresh)}
              >
                <RefreshCw size={16} />
              </button>
            </div>
            {groups.length ? (
              <>
                <div className="league-selector">
                  <label>
                    Sua liga
                    <select
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                    >
                      {groups.map((g) => (
                        <option value={g.id} key={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {group && (
                    <button
                      className="trade-button"
                      disabled={busy}
                      onClick={() =>
                        action(async () => {
                          const url = new URL(
                            window.location.origin + window.location.pathname,
                          );
                          url.searchParams.set("clube", group.invite_code);
                          try {
                            await navigator.clipboard.writeText(url.toString());
                            notify(
                              "Convite copiado. Encaminhe com a frase “confia”.",
                            );
                          } catch {
                            setMessage(
                              `Copie o código do convite: ${group.invite_code}`,
                            );
                          }
                        })
                      }
                    >
                      <Copy size={14} />
                      Copiar convite
                    </button>
                  )}
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>POSIÇÃO</th>
                        <th>INVESTIDOR</th>
                        <th>PATRIMÔNIO DECLARADO</th>
                        <th>XP</th>
                        <th>ATUALIZAÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr
                          key={r.id}
                          className={
                            r.id === session.user.id ? "my-ranking" : ""
                          }
                        >
                          <td>{["🥇", "🥈", "🥉"][i] || `#${i + 1}`}</td>
                          <td>
                            <strong>
                              {r.avatar} {r.name}
                              {r.id === session.user.id ? " (você)" : ""}
                            </strong>
                            <small className="block muted">{r.title}</small>
                          </td>
                          <td>{money(r.wealth)}</td>
                          <td>{r.xp}</td>
                          <td>
                            {new Date(r.updated_at).toLocaleString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!rows.length && (
                  <div className="empty">
                    A liga ainda não publicou nenhum placar. O silêncio também é
                    uma estratégia.
                  </div>
                )}
              </>
            ) : (
              <div className="empty">
                Crie uma liga ou entre com o código de um amigo.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
