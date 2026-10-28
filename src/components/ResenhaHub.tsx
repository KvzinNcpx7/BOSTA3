import { useEffect, useRef, useState } from "react";
import {
  Download,
  Share2,
  MessageCircle,
  Check,
  ArrowRight,
} from "lucide-react";
import { money, pct, wealth, type Game } from "../game/engine";
import {
  npcCharacters,
  secrets,
  meetingTemplates,
  receiptQuips,
} from "../game/funContent";
import { callMeeting, settleMeeting, skipMeeting } from "../game/meetings";
import { receiptData, drawReceipt, receiptPng } from "../services/receipt";
export type HubTab = "Zap" | "Assembleia" | "Recordes" | "Comprovante";
type Props = {
  game: Game;
  school: boolean;
  update: (g: Game) => void;
  notify: (s: string) => void;
  initial?: HubTab;
};
function Meetings({ game, update, notify }: Props) {
  const [choice, setChoice] = useState("");
  const [error, setError] = useState("");
  const call = game.fun.meeting;
  const template = meetingTemplates.find((t) => t.id === call?.template);
  const option = template?.options.find((o) => o.id === choice);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    setChoice("");
    setError("");
  }, [call?.id]);
  useEffect(() => {
    if (!call) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [call?.id]);
  const run = (fn: () => Game) => {
    try {
      update(fn());
      setError("");
      notify("Ata registrada. A firma segue aberta a interpretações.");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <section className="panel meeting-panel">
      <div className="panel-heading">
        <div>
          <h2>Reunião de acionistas</h2>
          <p>
            Escolhas locais. Sem custo no saldo, com consequências nas cotações.
          </p>
        </div>
      </div>
      {call && template ? (
        <form
          className="meeting-vote"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => settleMeeting(game, call.id, choice));
          }}
        >
          <div className="eyebrow">
            PAUTA ABERTA ·{" "}
            {Math.max(0, Math.ceil((call.expiresAt - now) / 1000))}s PARA VOTAR
          </div>
          <h3>{template.title}</h3>
          <p>{template.intro}</p>
          <fieldset>
            <legend>Seu voto</legend>
            {template.options.map((o, i) => (
              <label key={o.id} className={choice === o.id ? "chosen" : ""}>
                <input
                  type="radio"
                  name="meeting-vote"
                  required
                  checked={choice === o.id}
                  onChange={() => setChoice(o.id)}
                />
                <span>
                  <b>
                    {String.fromCharCode(65 + i)}) {o.text}
                  </b>
                  <small>{o.reason}</small>
                </span>
              </label>
            ))}
          </fieldset>
          {option && (
            <div className="vote-preview">
              <strong>Consequência ao confirmar</strong>
              <div className="impact-list">
                {Object.entries(option.impacts).map(([s, n]) => (
                  <span key={s} className={n >= 0 ? "positive" : "negative"}>
                    {s} {pct(n * 100)}
                  </span>
                ))}
              </div>
              <p>
                O saldo e as quantidades permanecem iguais. O valor da carteira
                reage aos novos preços.
              </p>
            </div>
          )}
          <div className="hub-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={!choice || call.expiresAt <= now}
            >
              Confirmar voto <Check size={15} />
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => update(skipMeeting(game, call.id))}
            >
              Não vou participar
            </button>
          </div>
        </form>
      ) : (
        <div className="empty">
          <span className="meeting-emoji">🪑</span>
          <h3>Ninguém abriu o PowerPoint. Ainda.</h3>
          <p>
            Assembleias podem surgir no pregão. Você também pode convocar uma a
            cada 3 minutos.
          </p>
          <button
            className="primary-button"
            onClick={() => run(() => callMeeting(game))}
          >
            Convocar reunião questionável
          </button>
        </div>
      )}
      {error && (
        <p className="form-error hub-error" role="alert">
          {error}
        </p>
      )}
      {game.fun.meetingHistory.length > 0 && (
        <div className="meeting-history">
          <h3>Atas anteriores</h3>
          {game.fun.meetingHistory.map((h) => (
            <article key={h.id}>
              <strong>{h.decision}</strong>
              <p>{h.result}</p>
              <small>{new Date(h.time).toLocaleString("pt-BR")}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function Receipt({ game, notify }: Props) {
  const [alias, setAlias] = useState("Acionista de Migalhas");
  const [image, setImage] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const currentUrl = useRef("");
  const lastQuip = useRef("");
  const alive = useRef(true);
  const generation = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    };
  }, []);
  useEffect(() => {
    generation.current++;
    setBlob(null);
    setImage("");
    if (currentUrl.current) {
      URL.revokeObjectURL(currentUrl.current);
      currentUrl.current = "";
    }
  }, [game.fun.careerId]);
  const generate = async () => {
    const request = ++generation.current;
    setBusy(true);
    setError("");
    try {
      const options = receiptQuips.filter((q) => q !== lastQuip.current);
      const quip = options[Math.floor(Math.random() * options.length)];
      const data = receiptData(game, alias, quip);
      drawReceipt(canvas.current!, data);
      const result = await receiptPng(canvas.current!);
      if (!alive.current || request !== generation.current) return;
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
      currentUrl.current = URL.createObjectURL(result);
      setBlob(result);
      setImage(currentUrl.current);
      lastQuip.current = quip;
      notify("Comprovante emitido. Reconhecemos a firma, não a estratégia.");
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const share = async () => {
    if (!blob) return;
    const file = new File([blob], "BOSTA3-comprovante.png", {
      type: "image/png",
    });
    try {
      if (
        typeof navigator.share !== "function" ||
        typeof navigator.canShare !== "function" ||
        !navigator.canShare({ files: [file] })
      ) {
        notify(
          "Este navegador não compartilha arquivos. Baixe o PNG e envie pelo aplicativo que preferir.",
        );
        return;
      }
      await navigator.share({
        files: [file],
        title: "Comprovante de Vergonha · BOSTA3",
      });
      notify(
        "Comprovante compartilhado. Agora a ata do churrasco está completa.",
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setError("O compartilhamento não abriu. Você pode baixar o PNG.");
    }
  };
  return (
    <section className="panel receipt-panel">
      <div className="panel-heading">
        <div>
          <h2>Comprovante de Vergonha</h2>
          <p>
            PNG de 1200 × 1500. Sem e-mail, conta, convite ou informação
            privada.
          </p>
        </div>
      </div>
      <div className="receipt-content">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
        >
          <label>
            Nome fictício para este card
            <input
              value={alias}
              disabled={busy}
              minLength={3}
              maxLength={40}
              required
              onChange={(e) => setAlias(e.target.value)}
            />
          </label>
          <p>
            Use um apelido de brincadeira. O card é uma foto do resultado no
            momento em que você gerar; o mercado continua andando.
          </p>
          <button className="primary-button" disabled={busy}>
            {busy ? "Carimbando o PNG…" : "Gerar comprovante"}
            <ArrowRight size={15} />
          </button>
        </form>
        <canvas ref={canvas} hidden aria-hidden="true" />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {image ? (
          <>
            <img
              className="receipt-preview"
              src={image}
              alt="Prévia do Comprovante de Vergonha com apelido fictício e resultados públicos escolhidos"
            />
            <div className="hub-actions">
              <a
                className="primary-button"
                href={image}
                download="BOSTA3-comprovante.png"
              >
                <Download size={15} />
                Baixar PNG
              </a>
              <button className="trade-button" onClick={share}>
                <Share2 size={15} />
                Compartilhar PNG
              </button>
            </div>
            <small>
              Revise o card antes de compartilhar. Novo resultado? Gere outra
              imagem.
            </small>
          </>
        ) : (
          <div className="receipt-empty">
            <span>B↘</span>
            <h3>Seu prejuízo merece papel timbrado.</h3>
            <p>Selo oficial. Deboche original. Validade financeira: nenhuma.</p>
          </div>
        )}
      </div>
    </section>
  );
}
export function ResenhaHub(props: Props) {
  const { game, school } = props;
  const chatBox = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<HubTab>(props.initial || "Zap");
  useEffect(() => {
    if (props.initial) setTab(props.initial);
  }, [props.initial]);
  useEffect(() => {
    if (tab === "Zap" && chatBox.current)
      chatBox.current.scrollTop = chatBox.current.scrollHeight;
  }, [tab]);
  const chat = game.fun.chat.filter((m) => school || !m.school);
  const visibleSecrets = secrets.filter((s) => school || !s.school);
  const gain = Math.max(game.fun.bestProfit, wealth(game) - 10000, 0);
  const loss = Math.max(game.fun.worstLoss, 10000 - wealth(game), 0);
  return (
    <div className="resenha-hub">
      <nav className="hub-tabs" aria-label="Seções da Central da Resenha">
        {(["Zap", "Assembleia", "Recordes", "Comprovante"] as HubTab[]).map(
          (t) => (
            <button
              key={t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
            >
              {t}
              {t === "Assembleia" && game.fun.meeting && (
                <span className="online-dot" />
              )}
            </button>
          ),
        )}
      </nav>
      {tab === "Zap" && (
        <section className="panel zap-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <MessageCircle size={19} /> Zap dos Acionistas
              </h2>
              <p>
                Grupo fictício · só NPCs · gerado neste navegador · ninguém vai
                pedir seu Pix
              </p>
            </div>
            <span className="count-badge">{chat.length}/40 mensagens</span>
          </div>
          <div
            ref={chatBox}
            className="zap-messages"
            role="log"
            aria-label="Conversas simuladas dos acionistas"
            aria-live="polite"
            aria-relevant="additions"
          >
            {chat.map((m) => {
              const p = npcCharacters[m.speaker];
              return (
                <article
                  className={`zap-bubble ${m.speaker === "fiscal" ? "fiscal-bubble" : ""}`}
                  key={m.id}
                >
                  <span className="npc-avatar" aria-hidden="true">
                    {p.emoji}
                  </span>
                  <div>
                    <div className="zap-author">
                      <strong>{p.name}</strong>
                      <small>
                        {new Date(m.time).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                    <p>{m.text}</p>
                    <small className="npc-role">{p.role}</small>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="zap-footer">
            <button
              className="text-button"
              onClick={() => {
                if (chatBox.current)
                  chatBox.current.scrollTop = chatBox.current.scrollHeight;
              }}
            >
              Ir para a última mensagem ↓
            </button>
            🔒 Não é chat real. As mensagens reagem às suas operações, notícias
            e assembleias. Nenhum texto é enviado a outros jogadores.
          </div>
        </section>
      )}
      {tab === "Assembleia" && <Meetings {...props} />}{" "}
      {tab === "Recordes" && (
        <>
          <section className="record-grid">
            {[
              ["Maior lucro observado", money(gain), "positive"],
              [
                "Maior prejuízo observado",
                loss ? `−${money(loss)}` : money(0),
                "negative",
              ],
              ["Crises e extraordinários", String(game.fun.crises), ""],
              ["Operações realizadas", String(game.trades), ""],
              [
                "Segredos encontrados",
                `${game.fun.secrets.length}/${secrets.length}`,
                "",
              ],
              ["Conquistas desbloqueadas", String(game.unlocked.length), ""],
            ].map(([label, value, color]) => (
              <article className="stat" key={label}>
                <span>{label}</span>
                <strong className={color}>{value}</strong>
              </article>
            ))}
          </section>
          <p className="records-note">
            Recordes locais de patrimônio em relação aos R$ 10 mil iniciais.
            Saves antigos usam o histórico ainda disponível; não inventamos
            recordes perdidos. Estes dados não são enviados ao ranking de ligas.
          </p>
          <section className="panel secret-panel">
            <div className="panel-heading">
              <div>
                <h2>Arquivo de segredos opcionais</h2>
                <p>
                  Nenhum deles tira dinheiro, impede operações ou altera as
                  cotações.
                </p>
              </div>
            </div>
            <div className="secret-grid">
              {visibleSecrets.map((s) => {
                const found = game.fun.secrets.includes(s.id);
                return (
                  <article
                    className={found ? "secret found" : "secret"}
                    key={s.id}
                  >
                    <span>{found ? "🔎" : "🔒"}</span>
                    <div>
                      <h3>{found ? s.name : "Segredo não encontrado"}</h3>
                      <p>{found ? s.reveal : s.hint}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
      {tab === "Comprovante" && <Receipt {...props} />}
    </div>
  );
}
