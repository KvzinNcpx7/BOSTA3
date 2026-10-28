import { award, wealth, type Game, type News } from "./engine";
import { chatReply } from "./fun";
import { meetingTemplates } from "./funContent";
export function callMeeting(
  g: Game,
  now = Date.now(),
  rng = Math.random,
): Game {
  if (g.fun.meeting && g.fun.meeting.expiresAt > now) return g;
  if (g.fun.lastMeetingAt && now - g.fun.lastMeetingAt < 180000)
    throw Error(
      "A ata ainda está sendo digitada. Aguarde 3 minutos entre assembleias.",
    );
  const pool = meetingTemplates.filter(
    (t) => t.id !== g.fun.lastMeetingTemplate,
  );
  const meeting =
    pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  return {
    ...g,
    fun: chatReply(
      {
        ...g.fun,
        meeting: {
          template: meeting.id,
          id: crypto.randomUUID(),
          openedAt: now,
          expiresAt: now + 300000,
        },
        lastMeetingAt: now,
        lastMeetingTemplate: meeting.id,
      },
      "meeting",
      meeting.company,
      false,
      rng,
      now,
    ),
  };
}
export function settleMeeting(
  g: Game,
  id: string,
  choice: string,
  now = Date.now(),
): Game {
  const call = g.fun.meeting;
  if (!call || call.id !== id)
    throw Error("Essa reunião já encerrou. A ata não aceita voto retroativo.");
  if (call.expiresAt <= now)
    throw Error(
      "O prazo de 5 minutos acabou. Nenhuma decisão foi aplicada. Convoque outra reunião.",
    );
  const meeting = meetingTemplates.find((t) => t.id === call.template)!;
  const option = meeting.options.find((o) => o.id === choice);
  if (!option) throw Error("Escolha uma das propostas antes de votar.");
  const assets = g.assets.map((a) => {
    const impact = option.impacts[a.symbol] || 0;
    const price = Math.max(
      0.01,
      Math.round(a.price * (1 + impact) * 100) / 100,
    );
    return { ...a, price, history: [...a.history.slice(-59), price] };
  });
  const title = `📋 Assembleia da ${meeting.company}: ${option.text} ${option.reason}`;
  const news: News = {
    id: -400 - meetingTemplates.indexOf(meeting),
    title,
    symbol: meeting.company,
    impact: option.impacts[meeting.company] || 0,
    impacts: option.impacts,
    time: now,
  };
  const next = {
    ...g,
    assets,
    news: [news, ...g.news].slice(0, 40),
    fun: chatReply(
      {
        ...g.fun,
        meeting: null,
        meetingHistory: [
          {
            id: call.id,
            title: meeting.title,
            decision: option.text,
            result: option.reason,
            time: now,
          },
          ...g.fun.meetingHistory,
        ].slice(0, 10),
      },
      "meeting",
      meeting.company,
      false,
      Math.random,
      now,
    ),
  };
  return award({
    ...next,
    timeline: [
      ...g.timeline.slice(-59),
      {
        time: new Date(now).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: wealth(next),
      },
    ],
  });
}
export function skipMeeting(g: Game, id: string): Game {
  return g.fun.meeting?.id === id
    ? { ...g, fun: { ...g.fun, meeting: null } }
    : g;
}
export function expireFun(g: Game, now = Date.now()): Game {
  let f = g.fun;
  if (f.bulletin && f.bulletin.until <= now) f = { ...f, bulletin: null };
  if (f.meeting && f.meeting.expiresAt <= now) f = { ...f, meeting: null };
  return f === g.fun ? g : { ...g, fun: f };
}
