import { useState } from "react";
import {
  ArrowRight,
  Share2,
  Flame,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { pct, type News } from "../game/engine";
export function newsText(n: News) {
  return `${n.title}\n${n.report ? "Balanço da rodada" : n.impacts ? "Evento especial — veja os impactos no jornal" : `Impacto fictício: ${pct(n.impact * 100)} em ${n.symbol === "ALL" ? "todo o mercado" : n.symbol}`}.\nBOSTA3 — Aqui o único investimento seguro é na resenha. 💀📉\n${window.location.origin}${window.location.pathname}`;
}
function NewsCard({
  news: n,
  onShared,
  notify,
}: {
  news: News;
  onShared: (n: News) => void;
  notify: (text: string) => void;
}) {
  const [fallback, setFallback] = useState("");
  const share = async () => {
    const text = newsText(n);
    const nativeShare = typeof navigator.share === "function";
    try {
      if (nativeShare)
        await navigator.share({ title: "Jornal do Caos · BOSTA3", text });
      else if (typeof navigator.clipboard?.writeText === "function")
        await navigator.clipboard.writeText(text);
      else {
        setFallback(text);
        return;
      }
      onShared(n);
      notify(
        nativeShare
          ? "Notícia compartilhada. A auditoria do grupo já recebeu."
          : "Notícia copiada. O grupo do zap que lute.",
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") setFallback(text);
    }
  };
  return (
    <article className={`news-card ${n.special ? "special-news-card" : ""}`}>
      <div className="news-meta">
        <span>
          {n.special ? "EXTRA! · " : n.report ? "BALANÇO · " : ""}
          {n.symbol === "ALL" ? "MACROECONOMIA DO DELÍRIO" : n.symbol}
          {n.school ? " · RESENHA" : ""}
        </span>
        <small>
          {new Date(n.time).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </small>
      </div>
      <h3>{n.title}</h3>
      {n.impacts ? (
        <div className="impact-list">
          {Object.entries(n.impacts)
            .filter(([, v]) => v !== 0)
            .map(([symbol, impact]) => (
              <span
                key={symbol}
                className={impact >= 0 ? "positive" : "negative"}
              >
                {symbol} {pct(impact * 100)}
              </span>
            ))}
          {!Object.values(n.impacts).some((v) => v !== 0) && (
            <span>
              Ordens suspensas por {n.special === "iarPause" ? 5 : 8} segundos.
              Sem choque direto nas cotações.
            </span>
          )}
        </div>
      ) : (
        <div className="news-impact">
          <span className={n.impact >= 0 ? "positive" : "negative"}>
            {n.impact >= 0 ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}{" "}
            {n.report ? "Variação observada" : "Impacto"}: {pct(n.impact * 100)}
          </span>
          <span>FONTE: CONFIA</span>
        </div>
      )}
      <button
        className="share-news text-button"
        aria-label={`Compartilhar notícia: ${n.title}`}
        onClick={share}
      >
        <Share2 size={13} />
        Encaminhar com “confia”
      </button>
      {fallback && (
        <label className="share-fallback">
          Seu navegador não abriu o compartilhamento. Selecione e copie:
          <textarea
            readOnly
            value={fallback}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      )}
    </article>
  );
}
export function ChaosNews({
  news,
  school,
  full,
  onChaos,
  onAll,
  onShared,
  notify,
}: {
  news: News[];
  school: boolean;
  full: boolean;
  onChaos: () => void;
  onAll: () => void;
  onShared: (n: News) => void;
  notify: (s: string) => void;
}) {
  const visible = news
    .filter((n) => school || !n.school)
    .slice(0, full ? 40 : 3);
  return (
    <section className="news-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> PLANTÃO DO ABSURDO
            {school ? " · EDIÇÃO ESCOLAR" : ""}
          </div>
          <h2>
            Jornal do Caos<span className="muted">.</span>
          </h2>
        </div>
        {!full && (
          <button className="text-button" onClick={onAll}>
            Todas as notícias <ArrowRight size={15} />
          </button>
        )}
      </div>
      <div className="news-grid">
        {visible.map((n, i) => (
          <NewsCard
            key={`${n.time}-${n.id}-${i}`}
            news={n}
            onShared={onShared}
            notify={notify}
          />
        ))}
        {visible.length < (full ? 1 : 3) && (
          <article className="news-card news-placeholder">
            <Flame size={26} />
            <h3>
              {school
                ? "A pauta vazou antes de a reunião existir."
                : "O próximo surto está sendo apurado."}
            </h3>
            <p>
              {school
                ? "O grupo já está digitando. O mercado ainda tenta ler o áudio."
                : "O mercado muda sozinho. Ou você pode dar uma ajudinha."}
            </p>
            <button className="text-button lime" onClick={onChaos}>
              Gerar uma manchete <ArrowRight size={15} />
            </button>
          </article>
        )}
      </div>
    </section>
  );
}
