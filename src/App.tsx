import { useEffect, useRef, useState } from "react";
import { useDialogFocus } from "./components/useDialogFocus";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  AudioLines,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  Newspaper,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
  X,
  Zap,
  Check,
  TrendingUp,
  TrendingDown,
  IdCard,
  Users,
  BriefcaseBusiness,
  ScrollText,
} from "lucide-react";
import { achievements } from "./game/data";
import {
  award,
  fresh,
  loadGame,
  money,
  pct,
  SAVE_KEY,
  trade,
  wealth,
  type Asset,
} from "./game/engine";
import { Chart } from "./components/Chart";
import {
  CareerPanel,
  CompanyPanel,
  HistoryPanel,
} from "./components/CareerPanel";
import { SocialPanel } from "./components/SocialPanel";
import { ResenhaControls } from "./components/ResenhaControls";
import { SpecialNotice } from "./components/SpecialNotice";
import { ChaosNews } from "./components/ChaosNews";
import { useBanter } from "./components/useBanter";
import { characters } from "./game/banter";
import {
  activeSpecial,
  tradeBlocked,
  enabledSpecial,
  loadHumorPreferences,
  HUMOR_KEY,
  type HumorPreferences,
} from "./game/resenha";
import { specialEvents } from "./game/resenhaContent";
import { advanceMarket, finishSpecial, recordShare } from "./game/simulation";
import { unlockSound, playSpecialTone } from "./services/sound";
type Tab =
  | "Visão geral"
  | "Mercado"
  | "Minha carteira"
  | "Jornal do Caos"
  | "Conquistas"
  | "Minha carreira"
  | "IPO de Pote"
  | "Clube do Boleto"
  | "Extrato";
const nav = [
  { name: "Visão geral" as Tab, icon: LayoutDashboard },
  { name: "Mercado" as Tab, icon: ChartNoAxesCombined },
  { name: "Minha carteira" as Tab, icon: Wallet },
  { name: "Jornal do Caos" as Tab, icon: Newspaper },
  { name: "Conquistas" as Tab, icon: Trophy },
  { name: "Minha carreira" as Tab, icon: IdCard },
  { name: "IPO de Pote" as Tab, icon: BriefcaseBusiness },
  { name: "Clube do Boleto" as Tab, icon: Users },
  { name: "Extrato" as Tab, icon: ScrollText },
];
export default function App() {
  const [game, setGame] = useState(loadGame);
  const [tab, setTab] = useState<Tab>(
    new URLSearchParams(window.location.search).has("clube")
      ? "Clube do Boleto"
      : "Visão geral",
  );
  const [paused, setPaused] = useState(false);
  const [preferences, setPreferences] = useState(() => ({
    ...loadHumorPreferences(),
    sound: false,
  }));
  const [humorSaveFailed, setHumorSaveFailed] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    try {
      localStorage.setItem(
        HUMOR_KEY,
        JSON.stringify({ ...preferences, sound: false }),
      );
      setHumorSaveFailed(false);
    } catch {
      setHumorSaveFailed(true);
    }
  }, [preferences]);
  useEffect(() => {
    if (!game.resenha.active) return;
    setNow(Date.now());
    const clock = setInterval(() => {
      setNow(Date.now());
      setGame((g) => finishSpecial(g));
    }, 500);
    return () => clearInterval(clock);
  }, [game.resenha.active?.startedAt]);
  const seenSpecial = useRef(game.resenha.active?.startedAt);
  useEffect(() => {
    const start = game.resenha.active?.startedAt;
    if (start && seenSpecial.current !== start) {
      seenSpecial.current = start;
      playSpecialTone(preferences.sound);
    }
  }, [game.resenha.active?.startedAt, preferences.sound]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("1");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [guide, setGuide] = useState(false);
  const [reset, setReset] = useState(false);
  const [range, setRange] = useState("Sessão");
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(game));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, [game]);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setGame((g) => advanceMarket(g, preferences)),
      5000,
    );
    return () => clearInterval(timer);
  }, [paused, preferences.school, preferences.extraordinary]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!selected && !guide && !reset && game.started) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setGuide(false);
        setReset(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected, guide, reset, game.started]);
  useDialogFocus(Boolean(selected || guide || reset || !game.started));
  const seenAwards = useRef(game.unlocked);
  useEffect(() => {
    const added = game.unlocked.filter((x) => !seenAwards.current.includes(x));
    if (added.length)
      setToast(
        `🏆 Conquista: ${achievements.find((a) => a.id === added[0])?.name}!`,
      );
    seenAwards.current = game.unlocked;
  }, [game.unlocked]);
  const total = wealth(game),
    profit = total - 10000,
    invested = total - game.cash;
  const asset = game.assets.find((a) => a.symbol === selected);
  const holding = asset ? game.positions[asset.symbol] : undefined;
  const notify = (text: string) => setToast(text);
  const { comment, say } = useBanter(game, preferences.school, notify);
  const speaker = characters[comment.speaker];
  const eventNow = Math.max(now, game.resenha.active?.startedAt || 0);
  const featured = activeSpecial(game.resenha, eventNow);
  const blocked = tradeBlocked(game.resenha, eventNow);
  const visibleAchievements = achievements.filter(
    (a) => preferences.school || !a.school,
  );
  const visibleUnlocked = visibleAchievements.filter((a) =>
    game.unlocked.includes(a.id),
  ).length;
  const changePreference = async (
    key: keyof HumorPreferences,
    value: boolean,
  ) => {
    if (key === "sound" && value && !(await unlockSound())) {
      notify(
        "Este navegador não liberou o áudio. Os alertas continuam na tela.",
      );
      return;
    }
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    if (key === "school" || key === "extraordinary")
      setGame((g) => ({ ...g, resenha: enabledSpecial(g.resenha, next) }));
    if (key === "school")
      notify(
        value
          ? "Modo Resenha Escolar: o pregão entrou no grupo."
          : "Modo brasileiro geral: o grupo ficou no silencioso.",
      );
  };
  const chaos = () => {
    setGame((g) => advanceMarket(g, preferences, true));
  };
  const openTrade = (a: Asset, s: "buy" | "sell" = "buy") => {
    setSelected(a.symbol);
    setSide(s);
    setQuantity("1");
    setError("");
  };
  const execute = () => {
    if (!asset) return;
    try {
      const next = trade(game, asset.symbol, side, Number(quantity));
      const newAwards = next.unlocked.filter((x) => !game.unlocked.includes(x));
      setGame(next);
      setSelected(null);
      notify(
        newAwards.length
          ? `🏆 Conquista: ${achievements.find((a) => a.id === newAwards[0])?.name}!`
          : `${side === "buy" ? "Compra confirmada. A esperança foi debitada." : "Venda confirmada. O desapego foi creditado."}`,
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const filtered = game.assets.filter((a) =>
    (a.symbol + a.name + a.sector).toLowerCase().includes(query.toLowerCase()),
  );
  const change = (a: Asset) => (a.price / a.open - 1) * 100;
  const ticker = game.assets.slice(0, 6);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("Visão geral");
          }}
        >
          <span className="brand-mark">
            B<span>↘</span>
          </span>
          <span>
            BOSTA
            <span className="lime">3</span>
            <small>A BOLSA DOS MEMES</small>
          </span>
        </a>
        <div className="workspace-label">SEU TERMINAL DO CAOS</div>
        <nav>
          {nav.map((n) => (
            <button
              className={tab === n.name ? "nav-item active" : "nav-item"}
              key={n.name}
              onClick={() => setTab(n.name)}
            >
              <n.icon size={18} />
              <span>{n.name}</span>
              {n.name === "Jornal do Caos" && <span className="nav-dot" />}
              {n.name === "Conquistas" && (
                <small>
                  {visibleUnlocked}/{visibleAchievements.length}
                </small>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="risk-card">
            <ShieldCheck size={21} />
            <strong>
              100% fictício.
              <br />
              200% questionável.
            </strong>
            <p>
              Seu dinheiro de verdade está a salvo. Sua dignidade, nem tanto.
            </p>
          </div>
          <button className="utility" onClick={() => setGuide(true)}>
            <CircleHelp size={17} />
            Como sobreviver aqui
          </button>
          <button className="utility" onClick={() => setReset(true)}>
            <RotateCcw size={16} />
            Reiniciar minha carreira
          </button>
          <button className="profile" onClick={() => setTab("Minha carreira")}>
            <div className="avatar">{game.career.profile.avatar}</div>
            <div>
              <strong>{game.career.profile.name}</strong>
              <small>{game.career.profile.title}</small>
            </div>
            <span className="online-dot" />
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            Terminal <ChevronRight size={13} />
            <strong>{tab}</strong>
          </div>
          <div className="top-actions">
            <button
              className="icon-button mobile-utility"
              aria-label="Como jogar"
              onClick={() => setGuide(true)}
            >
              <CircleHelp size={15} />
            </button>
            <button
              className="icon-button mobile-utility"
              aria-label="Reiniciar jogo"
              onClick={() => setReset(true)}
            >
              <RotateCcw size={14} />
            </button>
            <span className="market-open">
              <span className="online-dot" />
              {paused ? "Pregão pausado" : "Mercado aberto"}
            </span>
            <span className="sim-tag">SIMULADOR</span>
            <button
              className="icon-button"
              title={paused ? "Retomar simulação" : "Pausar simulação"}
              aria-label={paused ? "Retomar simulação" : "Pausar simulação"}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
        </header>
        <div className="ticker">
          {ticker.map((a) => (
            <button key={a.symbol} onClick={() => openTrade(a)}>
              <strong>{a.symbol}</strong>
              <span>{money(a.price)}</span>
              <span className={change(a) >= 0 ? "positive" : "negative"}>
                {change(a) >= 0 ? "↗" : "↘"} {pct(change(a))}
              </span>
            </button>
          ))}
          <span className="ticker-end">
            ÍNDICE DE SANIDADE <b className="negative">↘ −99,9%</b>
          </span>
        </div>
        <div className="content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">MENOS JUROS. MAIS SURTOS.</div>
              <h1>
                {tab === "Visão geral"
                  ? "Seu dinheiro vira entretenimento."
                  : tab === "Mercado"
                    ? "Compre o rumor. Venda o bom senso."
                    : tab === "Minha carteira"
                      ? "Seu portfólio de decisões duvidosas."
                      : tab === "Jornal do Caos"
                        ? "Informação privilegiada de procedência duvidosa."
                        : tab === "Minha carreira"
                          ? "Personalidade forte. Fundamentos fracos."
                          : tab === "IPO de Pote"
                            ? "Seu delírio merece um CNPJ imaginário."
                            : tab === "Clube do Boleto"
                              ? "O prejuízo é nosso. A zoeira é coletiva."
                              : tab === "Extrato"
                                ? "Toda péssima ideia deixa um recibo."
                                : "Pequenas vitórias. Grandes questionamentos."}
              </h1>
              <p>
                {tab === "Visão geral"
                  ? "Bem-vindo à bolsa onde o único fundamento é a falta dele."
                  : "Tudo aqui é fictício. As emoções são por sua conta."}
              </p>
            </div>
            <button className="chaos-button" onClick={chaos}>
              <Zap size={17} fill="currentColor" />
              GERAR CAOS
              <ArrowUpRight size={16} />
            </button>
          </section>
          <ResenhaControls
            preferences={preferences}
            onChange={changePreference}
          />
          {humorSaveFailed && (
            <div className="save-warning" role="alert">
              A preferência de humor não pôde ser salva. Ela vale nesta sessão.
            </div>
          )}
          {featured && (
            <SpecialNotice
              key={featured.startedAt}
              active={featured}
              now={eventNow}
              effects={preferences.effects}
            />
          )}
          {saveFailed && (
            <div className="save-warning" role="alert">
              Não foi possível salvar neste navegador. Seu progresso desta
              sessão continua disponível.
            </div>
          )}
          {(tab === "Visão geral" || tab === "Minha carteira") && (
            <section className="stats">
              <div className="stat primary">
                <span>
                  Patrimônio total <Wallet size={16} />
                </span>
                <strong>{money(total)}</strong>
                <small className={profit >= 0 ? "positive" : "negative"}>
                  {pct(profit / 100)} <span>desde o início da sua ilusão</span>
                </small>
              </div>
              <div className="stat">
                <span>
                  Saldo disponível <ArrowDownLeft size={17} />
                </span>
                <strong>{money(game.cash)}</strong>
                <small>Pronto para decisões questionáveis</small>
              </div>
              <div className="stat">
                <span>
                  Lucro / prejuízo <ChartNoAxesCombined size={17} />
                </span>
                <strong className={profit >= 0 ? "positive" : "negative"}>
                  {profit >= 0 ? "+ " : ""}
                  {money(profit)}
                </strong>
                <small>
                  {profit >= 0
                    ? "Até agora, o entretenimento está grátis."
                    : "O aprendizado veio com boleto."}
                </small>
              </div>
              <div className="stat">
                <span>
                  Nível de sanidade <AudioLines size={17} />
                </span>
                <strong className="sanity">
                  {game.trades > 10 ? "Em análise" : "Questionável"}
                  <span>🫠</span>
                </strong>
                <small>
                  {game.trades} operações · {game.unlocked.length} conquistas
                </small>
              </div>
            </section>
          )}
          {tab === "Visão geral" && (
            <section className="v2-banner">
              <span>🪪</span>
              <div>
                <strong>Seu novo emprego: CEO do caos.</strong>
                <p>
                  Missões diárias, dividendos e um documento que nenhum gerente
                  vai aceitar.
                </p>
              </div>
              <button
                className="trade-button"
                onClick={() => setTab("Minha carreira")}
              >
                Minha carreira <ArrowRight size={14} />
              </button>
            </section>
          )}
          {tab === "Visão geral" && (
            <div className="overview-grid">
              <section className="panel evolution">
                <div className="panel-heading">
                  <div>
                    <h2>
                      Evolução do patrimônio{" "}
                      <span className="live-label">AO VIVO</span>
                    </h2>
                    <p>A montanha-russa que você chamou de investimento.</p>
                  </div>
                  <div className="segmented">
                    {["Sessão", "20 ticks"].map((r) => (
                      <button
                        key={r}
                        className={range === r ? "selected" : ""}
                        onClick={() => setRange(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="chart-summary">
                  <strong>{money(total)}</strong>
                  <span className={profit >= 0 ? "positive" : "negative"}>
                    {pct(profit / 100)}
                  </span>
                  <small>DINHEIRO FICTÍCIO, EMOÇÕES REAIS</small>
                </div>
                <Chart
                  large
                  values={
                    (range === "20 ticks"
                      ? game.timeline.slice(-20)
                      : game.timeline
                    ).map((t) => t.value).length > 1
                      ? (range === "20 ticks"
                          ? game.timeline.slice(-20)
                          : game.timeline
                        ).map((t) => t.value)
                      : [10000, 10000]
                  }
                />
                <div className="chart-footer">
                  <span>
                    <i /> Seu patrimônio
                  </span>
                  <span>Atualiza a cada 5 segundos</span>
                </div>
              </section>
              <section className="advisor">
                <div className="advisor-top">
                  <span>
                    <Sparkles size={14} /> ASSESSORIA DUVIDOSA
                  </span>
                  <span className="online-dot" />
                </div>
                <div className="advisor-person">
                  <div className="advisor-portrait">{speaker.emoji}</div>
                  <div>
                    <h3>{speaker.name}</h3>
                    <p>{speaker.job}</p>
                    <span>{speaker.credential}</span>
                  </div>
                </div>
                <blockquote>“{comment.text}”</blockquote>
                <button
                  className="text-button"
                  onClick={() =>
                    say(profit < 0 ? "loss" : profit > 100 ? "gain" : "welcome")
                  }
                >
                  Solicitar outro parecer questionável ↗
                </button>
                <div className="advisor-foot">
                  <span className="lime">✦</span> Zero certificações. Muita
                  convicção.
                </div>
              </section>
            </div>
          )}
          {(tab === "Visão geral" || tab === "Mercado") && (
            <section className="panel market-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    {tab === "Mercado"
                      ? "Mercado de memes"
                      : "Ativos em alta (ou em surto)"}
                    <span className="count-badge">
                      {game.assets.length} ativos
                    </span>
                  </h2>
                  <p>
                    Empresas reais na nossa imaginação. Oportunidades igualmente
                    questionáveis.
                  </p>
                </div>
                {tab === "Visão geral" ? (
                  <button
                    className="text-button"
                    onClick={() => setTab("Mercado")}
                  >
                    Ver mercado completo <ArrowRight size={15} />
                  </button>
                ) : (
                  <label className="search">
                    <Search size={16} />
                    <input
                      placeholder="Buscar ativo ou empresa"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                )}
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>ATIVO / EMPRESA</th>
                      <th>ÚLTIMO PREÇO</th>
                      <th>VARIAÇÃO DA SESSÃO</th>
                      <th>ÚLTIMAS COTAÇÕES</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered
                      .slice(0, tab === "Visão geral" ? 5 : game.assets.length)
                      .map((a) => (
                        <tr key={a.symbol}>
                          <td>
                            <button
                              className="asset-name"
                              onClick={() => openTrade(a)}
                            >
                              <span
                                className="company-icon"
                                style={{ background: a.color + "17" }}
                              >
                                {a.emoji}
                              </span>
                              <span>
                                <strong>{a.symbol}</strong>
                                <small>{a.name}</small>
                              </span>
                            </button>
                          </td>
                          <td className="price">{money(a.price)}</td>
                          <td>
                            <span
                              className={`variation ${change(a) >= 0 ? "up" : "down"}`}
                            >
                              {change(a) >= 0 ? (
                                <TrendingUp size={13} />
                              ) : (
                                <TrendingDown size={13} />
                              )}{" "}
                              {pct(change(a))}
                            </span>
                          </td>
                          <td className="spark-cell">
                            <Chart
                              values={a.history}
                              color={change(a) >= 0 ? "#b8ec70" : "#f07b83"}
                            />
                          </td>
                          <td>
                            <button
                              className="trade-button"
                              onClick={() => openTrade(a)}
                            >
                              Negociar <ArrowUpRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!filtered.length && (
                  <div className="empty">
                    Nenhum ativo encontrado. Até o caos tem limites.
                  </div>
                )}
              </div>
            </section>
          )}
          {tab === "Minha carteira" && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Meus ativos</h2>
                  <p>
                    {money(invested)} investidos · resultado realizado:{" "}
                    {money(game.realized)}
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setTab("Mercado")}
                >
                  Explorar mercado <ArrowRight size={16} />
                </button>
              </div>
              {Object.keys(game.positions).length ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ATIVO</th>
                        <th>QUANTIDADE</th>
                        <th>PREÇO MÉDIO</th>
                        <th>VALOR ATUAL</th>
                        <th>LUCRO / PREJUÍZO</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {game.assets
                        .filter((a) => game.positions[a.symbol])
                        .map((a) => {
                          const p = game.positions[a.symbol];
                          const gain = (a.price - p.average) * p.quantity;
                          return (
                            <tr key={a.symbol}>
                              <td>
                                <button
                                  className="asset-name"
                                  onClick={() => openTrade(a)}
                                >
                                  <span className="company-icon">
                                    {a.emoji}
                                  </span>
                                  <strong>{a.symbol}</strong>
                                </button>
                              </td>
                              <td>{p.quantity}</td>
                              <td>{money(p.average)}</td>
                              <td>{money(a.price * p.quantity)}</td>
                              <td
                                className={gain >= 0 ? "positive" : "negative"}
                              >
                                {money(gain)}
                                <small className="block">
                                  {pct((a.price / p.average - 1) * 100)}
                                </small>
                              </td>
                              <td>
                                <button
                                  className="trade-button"
                                  onClick={() => openTrade(a, "sell")}
                                >
                                  Vender <ArrowUpRight size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty">
                  <Wallet size={40} />
                  <h3>Sua carteira está sensata demais.</h3>
                  <p>
                    Escolha um ativo e compre sua primeira história de
                    investidor.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => setTab("Mercado")}
                  >
                    Conhecer os ativos
                  </button>
                </div>
              )}
            </section>
          )}
          {(tab === "Visão geral" || tab === "Jornal do Caos") && (
            <ChaosNews
              news={game.news}
              school={preferences.school}
              full={tab === "Jornal do Caos"}
              onChaos={chaos}
              onAll={() => setTab("Jornal do Caos")}
              onShared={(n) => setGame((g) => recordShare(g, n))}
              notify={notify}
            />
          )}
          {tab === "Conquistas" && (
            <>
              <div className="achievement-intro">
                <Trophy size={30} />
                <div>
                  <h2>
                    {visibleUnlocked} de {visibleAchievements.length} conquistas
                  </h2>
                  <p>O currículo que nenhuma corretora pediu.</p>
                </div>
                <progress
                  value={visibleUnlocked}
                  max={visibleAchievements.length}
                />
              </div>
              <div className="achievement-grid">
                {visibleAchievements.map((a) => {
                  const unlocked = game.unlocked.includes(a.id);
                  return (
                    <article
                      key={a.id}
                      className={`achievement ${unlocked ? "unlocked" : ""}`}
                    >
                      <span className="achievement-emoji">{a.emoji}</span>
                      <div>
                        <span className="eyebrow">
                          {unlocked
                            ? "DESBLOQUEADA"
                            : "AINDA NÃO FOI DESSA VEZ"}
                        </span>
                        <h3>{a.name}</h3>
                        <p>{a.hint}</p>
                      </div>
                      {unlocked && <Check size={19} className="lime" />}
                    </article>
                  );
                })}
              </div>
            </>
          )}
          {tab === "Minha carreira" && (
            <CareerPanel game={game} update={setGame} notify={notify} />
          )}
          {tab === "IPO de Pote" && (
            <CompanyPanel game={game} update={setGame} notify={notify} />
          )}
          {tab === "Clube do Boleto" && (
            <SocialPanel game={game} notify={notify} />
          )}
          {tab === "Extrato" && <HistoryPanel game={game} />}
          <footer>
            <span>
              <button
                className="brand-mini"
                aria-label="Selo de qualidade questionável"
                onClick={() => {
                  if (preferences.school)
                    notify(
                      "📢 iararara. O departamento de gritos menores agradece sua visita.",
                    );
                  else
                    notify(
                      "Selo conferido por um pombo independente. Independente de quê, ele não explicou.",
                    );
                }}
              >
                B↘
              </button>{" "}
              BOSTA3 · A bolsa oficial dos memes brasileiros. Aqui o único
              investimento seguro é na resenha.
            </span>
            <span>
              <ShieldCheck size={13} /> Nenhum real foi prejudicado na criação
              deste site.
            </span>
          </footer>
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={19} />
          <span>{toast}</span>
          <button aria-label="Fechar notificação" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {asset && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="modal trade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trade-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Fechar negociação"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <div className="eyebrow">HOME BROKER DO ABSURDO</div>
            <div className="modal-asset">
              <span className="company-icon">{asset.emoji}</span>
              <div>
                <h2 id="trade-title">{asset.symbol}</h2>
                <p>{asset.name}</p>
              </div>
              <div className="modal-price">
                <strong>{money(asset.price)}</strong>
                <span className={change(asset) >= 0 ? "positive" : "negative"}>
                  {pct(change(asset))}
                </span>
              </div>
            </div>
            <p className="asset-description">{asset.description}</p>
            <Chart
              values={asset.history}
              large
              color={change(asset) >= 0 ? "#b8ec70" : "#f07b83"}
            />
            <div className="trade-tabs">
              <button
                className={side === "buy" ? "buy selected" : ""}
                onClick={() => {
                  setSide("buy");
                  setError("");
                }}
              >
                Comprar
              </button>
              <button
                className={side === "sell" ? "sell selected" : ""}
                onClick={() => {
                  setSide("sell");
                  setError("");
                }}
              >
                Vender
              </button>
            </div>
            <div className="balance-row">
              <span>
                Saldo: <b>{money(game.cash)}</b>
              </span>
              <span>
                Na carteira: <b>{holding?.quantity || 0}</b>
              </span>
            </div>
            <label className="quantity-label" htmlFor="quantity">
              Quantidade de ações
            </label>
            <div className="quantity-control">
              <button
                aria-label="Diminuir quantidade"
                onClick={() =>
                  setQuantity(String(Math.max(1, (Number(quantity) || 1) - 1)))
                }
              >
                −
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button
                aria-label="Aumentar quantidade"
                onClick={() => setQuantity(String((Number(quantity) || 0) + 1))}
              >
                +
              </button>
              <button
                className="max-button"
                onClick={() =>
                  setQuantity(
                    String(
                      side === "buy"
                        ? Math.floor(game.cash / asset.price)
                        : holding?.quantity || 0,
                    ),
                  )
                }
              >
                Máximo
              </button>
            </div>
            <div className="order-total">
              <span>
                Total estimado <small>Cotação atualizada ao confirmar</small>
              </span>
              <strong>
                {money(Math.max(0, Number(quantity) || 0) * asset.price)}
              </strong>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className={`primary-button full ${side === "sell" ? "sell-button" : ""}`}
              onClick={execute}
              disabled={blocked}
            >
              {blocked
                ? `Greve CLT · ${Math.max(0, Math.ceil(((featured?.until || eventNow) - eventNow) / 1000))}s`
                : side === "buy"
                  ? "Confirmar compra"
                  : "Confirmar venda"}{" "}
              <ArrowRight size={17} />
            </button>
            <small className="modal-disclaimer">
              Simulação fictícia. Não é uma recomendação de investimento.
            </small>
          </section>
        </div>
      )}
      {(!game.started || guide) && (
        <div className="modal-backdrop">
          <section
            className="modal welcome"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
          >
            <span className="welcome-icon">📉</span>
            <div className="eyebrow">BEM-VINDO À BOSTA3</div>
            <h2 id="welcome-title">
              Sua carreira de investidor
              <br />
              começa questionável.
            </h2>
            <p>
              Você ganhou <b>R$ 10.000 fictícios</b>. O que acontece agora é
              entre você, os memes e o botão de caos.
            </p>
            <div className="welcome-step">
              <span>01</span>
              <div>
                <strong>Escolha seu absurdo favorito</strong>
                <p>Compre ações de calvície, fofoca ou aviação de pombos.</p>
              </div>
            </div>
            <div className="welcome-step">
              <span>02</span>
              <div>
                <strong>Acompanhe o estrago</strong>
                <p>
                  Preços mudam a cada 5 segundos. Notícias chegam a cada 25.
                </p>
              </div>
            </div>
            <div className="welcome-step">
              <span>03</span>
              <div>
                <strong>Negocie, colecione conquistas e ria</strong>
                <p>Progresso salvo no navegador. Pause quando quiser.</p>
              </div>
            </div>
            <button
              className="primary-button full"
              onClick={() => {
                setGame((g) => award({ ...g, started: true }));
                setGuide(false);
              }}
            >
              Entendi. Cadê o meu dinheiro? <ArrowRight size={17} />
            </button>
            <small className="modal-disclaimer">
              Jogo de humor. Sem dinheiro real, apostas ou APIs financeiras.
            </small>
          </section>
        </div>
      )}
      {reset && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <h2 id="reset-title">Declarar falência emocional?</h2>
            <p>
              Isso apaga sua carteira, perfil, empresas, missões, histórico e
              conquistas neste navegador. O placar já publicado no clube não é
              apagado. Você recomeça com R$ 10.000 fictícios.
            </p>
            <div className="reset-actions">
              <button className="trade-button" onClick={() => setReset(false)}>
                Continuar minha carreira
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setGame({ ...fresh(), started: true });
                  setReset(false);
                  setPaused(false);
                  notify("Nova chance. O mesmo senso de investimento.");
                }}
              >
                Recomeçar do zero
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
