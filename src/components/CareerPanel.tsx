import { useState } from "react";
import {
  ArrowRight,
  Check,
  Shuffle,
  BriefcaseBusiness,
  ScrollText,
} from "lucide-react";
import type { Game } from "../game/engine";
import { money } from "../game/engine";
import {
  avatars,
  titles,
  offices,
  bios,
  missions,
  currentCareer,
  claimMission,
  saveProfile,
  createCompany,
  type Profile,
} from "../game/career";
type Props = {
  game: Game;
  update: (g: Game) => void;
  notify: (s: string) => void;
};
const random = <T,>(list: readonly T[]) =>
  list[Math.floor(Math.random() * list.length)];
export function CareerPanel({ game, update, notify }: Props) {
  const [profile, setProfile] = useState<Profile>(game.career.profile);
  const c = currentCareer(game.career);
  const level = 1 + Math.floor(c.xp / 150);
  const run = (fn: () => Game) => {
    try {
      update(fn());
      notify("Alteração registrada. O cartório está rindo, mas registrou.");
    } catch (e) {
      notify((e as Error).message);
    }
  };
  return (
    <div className="career-layout">
      <section
        className="identity-card"
        style={{ "--identity": profile.color } as React.CSSProperties}
      >
        <div className="identity-stamp">
          REPÚBLICA FEDERATIVA DO PREJUÍZO
          <br />
          CARTEIRA NACIONAL DE INVESTIDOR DUVIDOSO
        </div>
        <div className="identity-main">
          <span className="identity-avatar">{profile.avatar}</span>
          <div>
            <div className="eyebrow">
              NÍVEL {level} · {c.xp} XP DE TRAUMA
            </div>
            <h2>{profile.name}</h2>
            <p>{profile.title}</p>
          </div>
        </div>
        <blockquote>“{profile.bio}”</blockquote>
        <div className="identity-bottom">
          <span>
            SEDE FISCAL
            <br />
            <b>{profile.office}</b>
          </span>
          <span>
            VALIDADE
            <br />
            <b>Até a próxima decisão</b>
          </span>
        </div>
        <div className="identity-watermark">SEM VALOR MORAL</div>
      </section>
      <section className="panel profile-editor">
        <div className="panel-heading">
          <div>
            <h2>Departamento de identidade questionável</h2>
            <p>
              Seu currículo pode ser mentira. Seu avatar precisa ter presença.
            </p>
          </div>
        </div>
        <form
          className="career-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveProfile(game, profile));
          }}
        >
          <label>
            Nome de pregão
            <input
              value={profile.name}
              minLength={3}
              maxLength={40}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </label>
          <label>Mascote da pessoa física</label>
          <div className="avatar-picker">
            {avatars.map((a) => (
              <button
                type="button"
                aria-label={`Avatar ${a}`}
                aria-pressed={profile.avatar === a}
                key={a}
                className={profile.avatar === a ? "selected" : ""}
                onClick={() => setProfile({ ...profile, avatar: a })}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="form-pair">
            <label>
              Cargo autodeclarado
              <select
                value={profile.title}
                onChange={(e) =>
                  setProfile({ ...profile, title: e.target.value })
                }
              >
                {titles.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Sede da operação
              <select
                value={profile.office}
                onChange={(e) =>
                  setProfile({ ...profile, office: e.target.value })
                }
              >
                {offices.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Frase para assustar o gerente
            <textarea
              value={profile.bio}
              maxLength={160}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </label>
          <div className="profile-actions">
            <label className="color-label">
              Cor do império
              <input
                type="color"
                value={profile.color}
                onChange={(e) =>
                  setProfile({ ...profile, color: e.target.value })
                }
              />
            </label>
            <button
              className="trade-button"
              type="button"
              onClick={() =>
                setProfile({
                  ...profile,
                  avatar: random(avatars),
                  title: random(titles),
                  office: random(offices),
                  bio: random(bios),
                  name: random([
                    "Duque do Cheque Especial",
                    "Robson Loss",
                    "Valdir da Liquidez Seca",
                    "Dona Marli do Circuit Breaker",
                    "Cleiton de Berkshire Laje",
                  ]),
                })
              }
            >
              <Shuffle size={14} />
              Sortear meu delírio
            </button>
            <button className="primary-button" type="submit">
              Reconhecer minha firma <Check size={15} />
            </button>
          </div>
        </form>
      </section>
      <section className="panel daily-panel">
        <div className="panel-heading">
          <div>
            <h2>Missões do expediente imaginário</h2>
            <p>
              {c.daily.date.split("-").reverse().join("/")} · reiniciam à
              meia-noite do seu navegador · sem precisar perder dinheiro
            </p>
          </div>
        </div>
        <div className="mission-grid">
          {missions.map((m) => {
            const done = c.daily.claimed.includes(m.id);
            const count = c.daily[m.id];
            return (
              <article
                className={`mission ${done ? "complete" : ""}`}
                key={m.id}
              >
                <span className="mission-emoji">{m.emoji}</span>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <progress max={m.target} value={Math.min(count, m.target)} />
                <div className="mission-reward">
                  <span>
                    {Math.min(count, m.target)}/{m.target}
                  </span>
                  <b>
                    {money(m.reward)} + {m.xp} XP
                  </b>
                </div>
                <button
                  className="trade-button"
                  disabled={done || count < m.target}
                  onClick={() => run(() => claimMission(game, m.id))}
                >
                  {done
                    ? "Recebido. O RH está chocado."
                    : count < m.target
                      ? "Missão em andamento"
                      : "Resgatar salário fictício"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
const pitches = [
  {
    name: "Marmita Quântica",
    symbol: "MARM3",
    emoji: "🦐",
    description:
      "A marmita está quente e fria ao mesmo tempo. Só colapsa quando você abre no escritório.",
  },
  {
    name: "Chinelo de Gala",
    symbol: "CHIN4",
    emoji: "🦆",
    description:
      "Calçado premium para reuniões que exigem elegância da cintura para cima.",
  },
  {
    name: "Áudio de 8 Minutos S.A.",
    symbol: "AUDI3",
    emoji: "🗿",
    description:
      "Transformamos um “oi sumido” em oito minutos de passivo emocional.",
  },
  {
    name: "Gambiarra Espacial",
    symbol: "GAMB3",
    emoji: "🪳",
    description:
      "Fita isolante e fé levando a humanidade onde a garantia não cobre.",
  },
];
export function CompanyPanel({ game, update, notify }: Props) {
  const [form, setForm] = useState({ ...pitches[0] });
  const [error, setError] = useState("");
  return (
    <div className="company-layout">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Abra seu unicórnio de garagem</h2>
            <p>
              Não exigimos plano de negócio. A ausência dele é o nosso plano.
            </p>
          </div>
          <BriefcaseBusiness className="lime" />
        </div>
        <form
          className="career-form"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              update(createCompany(game, form));
              setError("");
              notify(
                `🔔 ${form.symbol.toUpperCase()} abriu o capital. Fechou o bom senso.`,
              );
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <button
            type="button"
            className="trade-button"
            onClick={() => setForm({ ...random(pitches) })}
          >
            <Shuffle size={14} />
            Preciso de uma ideia pior
          </button>
          <label>
            Razão de existir
            <input
              required
              maxLength={45}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Ticker (ex.: PIXO3)
            <input
              required
              pattern="[a-zA-Z]{3,5}[34]"
              maxLength={6}
              value={form.symbol}
              onChange={(e) =>
                setForm({ ...form, symbol: e.target.value.toUpperCase() })
              }
            />
          </label>
          <label>Presidente do conselho</label>
          <div className="avatar-picker">
            {avatars.map((a) => (
              <button
                type="button"
                key={a}
                aria-label={`Mascote ${a}`}
                aria-pressed={form.emoji === a}
                className={form.emoji === a ? "selected" : ""}
                onClick={() => setForm({ ...form, emoji: a })}
              >
                {a}
              </button>
            ))}
          </div>
          <label>
            Pitch que faria um tubarão pedir demissão
            <textarea
              required
              minLength={10}
              maxLength={180}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div className="ipo-terms">
            <span>
              Taxa de cartório imaginário <b>{money(250)}</b>
            </span>
            <span>
              Preço inicial por ação <b>{money(10)}</b>
            </span>
            <span>
              Empresas abertas <b>{game.assets.length - 8}/3</b>
            </span>
            <p>
              As ações entram no seu mercado local. Você compra como qualquer
              investidor; não recebe ações grátis. Empresas e cotações ainda não
              são compartilhadas entre jogadores.
            </p>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary-button full"
            disabled={game.assets.length >= 11}
            type="submit"
          >
            {game.assets.length >= 11
              ? "Limite de holdings atingido"
              : "Abrir capital e perder a privacidade"}
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
      <aside>
        <div className="ipo-preview">
          <div className="eyebrow">PRÉVIA DO PRÓXIMO PROBLEMA</div>
          <span className="ipo-mascot">{form.emoji}</span>
          <h2>{form.symbol || "XXXX3"}</h2>
          <h3>{form.name || "Empresa sem rumo S.A."}</h3>
          <p>{form.description}</p>
          <strong>R$ 10,00</strong>
          <small>Valuation: tirado da cabeça do fundador.</small>
        </div>
        {game.assets.slice(8).map((a) => (
          <article key={a.symbol} className="news-card owned-company">
            <h3>
              {a.emoji} {a.symbol} · {a.name}
            </h3>
            <p>{money(a.price)} por ação · já disponível no Mercado</p>
          </article>
        ))}
      </aside>
    </div>
  );
}
export function HistoryPanel({ game }: Pick<Props, "game">) {
  const [filter, setFilter] = useState("all");
  const rows = game.career.ledger.filter(
    (r) => filter === "all" || r.kind === filter,
  );
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>
            <ScrollText size={18} /> Extrato de arrependimentos
          </h2>
          <p>
            Últimos 100 registros · dividendos recebidos:{" "}
            {money(game.career.dividends)}
          </p>
        </div>
        <label className="history-filter">
          Filtrar
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tudo que deu nisso</option>
            <option value="buy">Compras</option>
            <option value="sell">Vendas</option>
            <option value="dividend">Dividendos</option>
            <option value="reward">Missões</option>
            <option value="ipo">Abertura de empresa</option>
          </select>
        </label>
      </div>
      {rows.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>DATA</th>
                <th>OPERAÇÃO</th>
                <th>ATIVO</th>
                <th>QUANTIDADE</th>
                <th>MOVIMENTO EM CAIXA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.time).toLocaleString("pt-BR")}</td>
                  <td>{r.label}</td>
                  <td>{r.symbol}</td>
                  <td>{r.quantity}</td>
                  <td className={r.amount >= 0 ? "positive" : "negative"}>
                    {r.amount >= 0 ? "+" : ""}
                    {money(r.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <ScrollText size={32} />
          <h3>Nenhum recibo do caos por aqui.</h3>
          <p>
            Novas operações, missões e dividendos aparecem automaticamente.
            Operações anteriores a esta atualização não tinham extrato.
          </p>
        </div>
      )}
      <div className="dividend-explainer">
        ☕ A cada 60 oscilações automáticas (cerca de 5 minutos em primeiro
        plano), posições pagam 0,2% do valor atual, até R$ 500 por rodada.
        Pregão pausado não conta. O caos manual não acelera o cafezinho.
      </div>
    </section>
  );
}
