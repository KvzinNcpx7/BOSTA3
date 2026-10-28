import { horsemenLines, horsemen } from "./horsemen";
import type { Game } from "./engine";
import {
  chatLines,
  npcCharacters,
  secrets,
  type Npc,
  type ChatContext,
} from "./funContent";
export type ChatMessage = {
  id: number;
  speaker: Npc;
  text: string;
  time: number;
  school: boolean;
};
export type MeetingCall = {
  template: string;
  id: string;
  openedAt: number;
  expiresAt: number;
};
export type FunState = {
  careerId: string;
  chat: ChatMessage[];
  sequence: number;
  seenTrades: number;
  lastRealized: number;
  seenNews: string;
  seenCrisis: string;
  seenSpecials: number;
  fiscalLevel: number;
  secrets: string[];
  bestProfit: number;
  worstLoss: number;
  crises: number;
  observations: number;
  meeting: MeetingCall | null;
  lastMeetingAt: number;
  lastMeetingTemplate: string;
  meetingHistory: {
    id: string;
    title: string;
    decision: string;
    result: string;
    time: number;
  }[];
  bulletin: { headline: string; startedAt: number; until: number } | null;
  lastBulletinAt: number;
};
const total = (g: Game) =>
  Math.round(
    (g.cash +
      g.assets.reduce(
        (s, a) => s + a.price * (g.positions[a.symbol]?.quantity || 0),
        0,
      )) *
      100,
  ) / 100;
export const newsKey = (g: Game) =>
  g.news[0] ? `${g.news[0].id}:${g.news[0].time}:${g.news[0].title}` : "";
export function freshFun(): FunState {
  return {
    careerId: crypto.randomUUID(),
    chat: [
      {
        id: 1,
        speaker: "irineu",
        text: "Você sabe a pauta desse grupo? Nem eu. Bom dia.",
        time: Date.now(),
        school: false,
      },
      {
        id: 2,
        speaker: "primo",
        text: "Grupo de NPCs. Aqui nem o “digitando…” é uma promessa de informação.",
        time: Date.now(),
        school: false,
      },
    ],
    sequence: 2,
    seenTrades: 0,
    lastRealized: 0,
    seenNews: "",
    seenCrisis: "",
    seenSpecials: 0,
    fiscalLevel: 0,
    secrets: [],
    bestProfit: 0,
    worstLoss: 0,
    crises: 0,
    observations: 0,
    meeting: null,
    lastMeetingAt: 0,
    lastMeetingTemplate: "",
    meetingHistory: [],
    bulletin: null,
    lastBulletinAt: 0,
  };
}
export function restoreFun(raw: unknown, g: Game): FunState {
  const fallback = freshFun();
  const historical = [
    10000,
    total(g),
    ...g.timeline.map((t) => t.value).filter(Number.isFinite),
    g.resenha.lowestWealth,
  ];
  fallback.bestProfit = Math.max(0, ...historical.map((v) => v - 10000));
  fallback.worstLoss = Math.max(0, ...historical.map((v) => 10000 - v));
  fallback.seenTrades = g.trades;
  fallback.lastRealized = g.realized;
  fallback.seenNews = newsKey(g);
  fallback.seenSpecials = Object.values(g.resenha.specialCounts).reduce(
    (s, n) => s + (n || 0),
    0,
  );
  fallback.crises = fallback.seenSpecials;
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<FunState>;
  const n = (v: unknown, d = 0) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : d;
  return {
    ...fallback,
    careerId: typeof r.careerId === "string" ? r.careerId : fallback.careerId,
    sequence: n(r.sequence, 2),
    seenTrades: n(r.seenTrades, g.trades),
    lastRealized:
      typeof r.lastRealized === "number" && Number.isFinite(r.lastRealized)
        ? r.lastRealized
        : g.realized,
    seenNews: typeof r.seenNews === "string" ? r.seenNews : newsKey(g),
    seenCrisis: typeof r.seenCrisis === "string" ? r.seenCrisis : "",
    seenSpecials: n(r.seenSpecials, fallback.seenSpecials),
    fiscalLevel: n(r.fiscalLevel),
    secrets: Array.isArray(r.secrets)
      ? r.secrets.filter((id) => secrets.some((s) => s.id === id))
      : [],
    bestProfit: Math.max(fallback.bestProfit, n(r.bestProfit)),
    worstLoss: Math.max(fallback.worstLoss, n(r.worstLoss)),
    crises: n(r.crises),
    observations: n(r.observations),
    chat: Array.isArray(r.chat)
      ? r.chat
          .filter(
            (m) =>
              m &&
              typeof m.speaker === "string" &&
              Object.hasOwn(npcCharacters, m.speaker) &&
              typeof m.text === "string" &&
              Number.isFinite(m.time) &&
              Number.isFinite(m.id),
          )
          .slice(-40)
          .map((m) => ({
            ...m,
            text: m.text.slice(0, 500),
            school: npcCharacters[m.speaker].school,
          }))
      : fallback.chat,
    meeting:
      r.meeting &&
      typeof r.meeting.id === "string" &&
      ["pombo", "bolo", "clt"].includes(r.meeting.template) &&
      Number.isFinite(r.meeting.openedAt) &&
      Number.isFinite(r.meeting.expiresAt)
        ? r.meeting
        : null,
    lastMeetingAt: n(r.lastMeetingAt),
    lastMeetingTemplate:
      typeof r.lastMeetingTemplate === "string" ? r.lastMeetingTemplate : "",
    meetingHistory: Array.isArray(r.meetingHistory)
      ? r.meetingHistory
          .filter(
            (m) =>
              m &&
              ["id", "title", "decision", "result"].every(
                (k) => typeof m[k as keyof typeof m] === "string",
              ) &&
              Number.isFinite(m.time),
          )
          .slice(-10)
      : [],
    bulletin:
      r.bulletin &&
      typeof r.bulletin.headline === "string" &&
      Number.isFinite(r.bulletin.startedAt) &&
      Number.isFinite(r.bulletin.until)
        ? r.bulletin
        : null,
    lastBulletinAt: n(r.lastBulletinAt),
  };
}
export function appendChat(
  f: FunState,
  speaker: Npc,
  text: string,
  now = Date.now(),
): FunState {
  if (f.chat.at(-1)?.text === text) return f;
  const id = f.sequence + 1;
  return {
    ...f,
    sequence: id,
    chat: [
      ...f.chat,
      { id, speaker, text, time: now, school: npcCharacters[speaker].school },
    ].slice(-40),
  };
}
export function chatReply(
  f: FunState,
  context: ChatContext,
  symbol: string,
  school = false,
  rng = Math.random,
  now = Date.now(),
): FunState {
  const eligible = chatLines[context].filter(
    ([speaker]) => school || !npcCharacters[speaker].school,
  );
  const recent = f.chat.slice(-6).map((m) => m.text);
  const remaining = eligible.filter(
    ([, text]) => !recent.includes(text.replaceAll("{symbol}", symbol)),
  );
  const pool = remaining.length
    ? remaining
    : eligible.filter(
        ([, t]) => t.replaceAll("{symbol}", symbol) !== f.chat.at(-1)?.text,
      );
  const [speaker, text] =
    pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  return appendChat(f, speaker, text.replaceAll("{symbol}", symbol), now);
}
export function discoverSecret(g: Game, id: string, now = Date.now()): Game {
  if (g.fun.secrets.includes(id) || !secrets.some((s) => s.id === id)) return g;
  const secret = secrets.find((s) => s.id === id)!;
  return {
    ...g,
    fun: appendChat(
      { ...g.fun, secrets: [...g.fun.secrets, id] },
      "irineu",
      `🔎 Segredo encontrado: ${secret.name}. Eu sabia. Só não sabia que sabia.`,
      now,
    ),
  };
}
/** Observes public game facts only; it never changes cash, positions, auth or server data. */
export function observeFun(g: Game, rng = Math.random, now = Date.now()): Game {
  let f = g.fun || freshFun();
  const value = total(g);
  f = {
    ...f,
    bestProfit: Math.max(f.bestProfit, value - 10000, 0),
    worstLoss: Math.max(f.worstLoss, 10000 - value, 0),
    observations: f.observations + 1,
  };
  const specialCount = Object.values(g.resenha.specialCounts).reduce(
    (s, n) => s + (n || 0),
    0,
  );
  if (specialCount > f.seenSpecials)
    f = {
      ...f,
      crises: f.crises + specialCount - f.seenSpecials,
      seenSpecials: specialCount,
    };
  if (g.trades > f.seenTrades) {
    const last = g.career.ledger.find(
      (l) => l.kind === "buy" || l.kind === "sell",
    );
    const context =
      last?.kind === "buy"
        ? "buy"
        : g.realized < f.lastRealized
          ? "loss"
          : "sell";
    f = chatReply(f, context, last?.symbol || "ALL", false, rng, now);
    f = { ...f, seenTrades: g.trades, lastRealized: g.realized };
  }
  const key = newsKey(g);
  if (key !== f.seenNews) {
    const news = g.news[0];
    if (news && news.id !== -1)
      f = chatReply(
        f,
        news.special
          ? "special"
          : news.impact < -0.08
            ? "loss"
            : news.impact > 0.08
              ? "gain"
              : "news",
        news.symbol,
        Boolean(news.school),
        rng,
        now,
      );
    if (news?.special && news.special in horsemen) {
      const speaker = news.special as keyof typeof horsemen;
      const lines = horsemenLines.filter(([id]) => id === speaker);
      const line = lines[Math.min(lines.length - 1, Math.floor(rng() * lines.length))];
      f = appendChat(f, speaker, `SÁTIRA FICTÍCIA · ${line[1]}`, now);
    }
    if (news?.special === "cavaleiros") {
      for (const [speaker, text] of [
        ["vorcaro", "Balanço aprovado: 900 trilhões de coxinhas e um passivo de guardanapos."],
        ["hipotetico", "E SE a ata fosse um áudio?"],
        ["painho", "ME DÁ TUDO, CUMPANHEIRO! Até o microfone dessa reunião!"],
        ["taxad", "Taxa de participação: um susto por CPF imaginário. Nenhum débito."],
        ["irineu", "IRINEU, VOCÊ NÃO SABE NEM EU!"],
      ] as const) f = appendChat(f, speaker, `SÁTIRA FICTÍCIA · ${text}`, now);
    }
    f = { ...f, seenNews: key };
  }
  const crisis = g.news.slice(0, 2).find((n) => n.report && n.impact <= -0.12);
  if (crisis) {
    const key = `${crisis.time}:${crisis.title}`;
    if (key !== f.seenCrisis) {
      f = { ...f, seenCrisis: key, crises: f.crises + 1 };
      if (now - f.lastBulletinAt >= 90000)
        f = {
          ...f,
          lastBulletinAt: now,
          bulletin: {
            headline: "CARAI BORRACHA! O MERCADO FOI DE ARRASTA!",
            startedAt: now,
            until: now + 6500,
          },
        };
    }
  }
  const level = value <= 5000 ? 3 : value <= 8500 ? 2 : value <= 9500 ? 1 : 0;
  if (level > f.fiscalLevel) {
    const line = [
      "",
      "Patrimônio abaixo de R$ 9.500. Vim só deixar o cartão. Ele também é fictício.",
      "Abaixo de R$ 8.500? Minha prancheta abriu um chamado para proteger a própria saúde emocional.",
      "Metade do patrimônio foi passear. Não trouxe cobrança, trouxe uma cadeira para acompanhar.",
    ][level];
    f = appendChat({ ...f, fiscalLevel: level }, "fiscal", line, now);
  }
  let next = { ...g, fun: f };
  const last = g.career.ledger.find(
    (l) => l.kind === "buy" || l.kind === "sell",
  );
  const checks: Record<string, boolean> = {
    nice: last?.kind === "buy" && last.quantity === 69,
    snackBudget: value <= 10,
    tenLosses: g.resenha.lossSales >= 10,
    fortyTwo: g.trades >= 42,
    eightHours: g.positions.SONO3?.quantity === 8,
    allEight: g.assets
      .slice(0, 8)
      .every((a) => (g.positions[a.symbol]?.quantity || 0) > 0),
    rh: g.career.daily.claimed.length >= 3,
    coffee: g.career.dividends >= 69,
    name: /irineu/i.test(g.career.profile.name),
  };
  for (const [id, done] of Object.entries(checks))
    if (done) next = discoverSecret(next, id, now);
  return next;
}
