import type { Game, Asset } from "./engine";
export const avatars = [
  "🥸",
  "🦆",
  "🧑‍🦲",
  "🦐",
  "🐸",
  "🦝",
  "🧌",
  "🪳",
  "🤡",
  "🗿",
  "🐔",
  "🦥",
];
export const titles = [
  "Estagiário do Apocalipse",
  "Farinha Limer",
  "Day Trader de Air Fryer",
  "Barão do Nome Sujo",
  "Herdeiro de Boleto",
  "Faraó do Pix Imaginário",
  "CEO do Nada S.A.",
  "Ministro da Gambiarra",
];
export const offices = [
  "Quarto na casa da mãe",
  "Laje com vista pro boleto",
  "Faria Lima de chinelo",
  "Banheiro do coworking",
  "Sede fiscal: um Uno 2004",
  "Cobertura do puxadinho",
];
export const bios = [
  "Compro na emoção e vendo no desespero.",
  "Meu assessor é um áudio de 2017.",
  "Diversifiquei: devo em quatro bancos.",
  "Investidor qualificado pelo grupo da família.",
  "Meu stop loss é fechar o aplicativo.",
  "Transformando herança imaginária em dívida metafórica.",
];
export type Profile = {
  name: string;
  avatar: string;
  title: string;
  office: string;
  bio: string;
  color: string;
};
export type Ledger = {
  id: string;
  time: number;
  kind: "buy" | "sell" | "dividend" | "reward" | "ipo";
  symbol: string;
  quantity: number;
  amount: number;
  label: string;
};
export type Career = {
  profile: Profile;
  xp: number;
  ticks: number;
  dividends: number;
  lastDividendTick: number;
  ledger: Ledger[];
  daily: {
    date: string;
    trades: number;
    sells: number;
    chaos: number;
    ipos: number;
    claimed: string[];
  };
};
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function freshCareer(): Career {
  return {
    profile: {
      name: "Pessoa Física, Dano Jurídico",
      avatar: "🥸",
      title: titles[0],
      office: offices[0],
      bio: bios[0],
      color: "#c1f36b",
    },
    xp: 0,
    ticks: 0,
    dividends: 0,
    lastDividendTick: 0,
    ledger: [],
    daily: {
      date: dayKey(),
      trades: 0,
      sells: 0,
      chaos: 0,
      ipos: 0,
      claimed: [],
    },
  };
}
export function currentCareer(c: Career, now = new Date()): Career {
  return c.daily.date === dayKey(now)
    ? c
    : {
        ...c,
        daily: {
          date: dayKey(now),
          trades: 0,
          sells: 0,
          chaos: 0,
          ipos: 0,
          claimed: [],
        },
      };
}
export const missions = [
  {
    id: "trades",
    name: "CLT do home broker",
    description: "Faça 3 operações. Trabalhar de verdade era a outra opção.",
    target: 3,
    reward: 120,
    xp: 40,
    emoji: "💼",
  },
  {
    id: "chaos",
    name: "Fiscal de incêndio com isqueiro",
    description: "Gere caos 2 vezes. O mercado estava feliz demais.",
    target: 2,
    reward: 80,
    xp: 30,
    emoji: "🔥",
  },
  {
    id: "sells",
    name: "Desapego com nota fiscal",
    description: "Venda ações uma vez. Terapia em forma de ordem de venda.",
    target: 1,
    reward: 100,
    xp: 35,
    emoji: "🧘",
  },
] as const;
const cents = (n: number) => Math.round(n * 100) / 100;
export function ledger(c: Career, item: Omit<Ledger, "id" | "time">): Career {
  return {
    ...c,
    ledger: [
      { ...item, id: crypto.randomUUID(), time: Date.now() },
      ...c.ledger,
    ].slice(0, 100),
  };
}
export function claimMission(g: Game, id: string): Game {
  const c = currentCareer(g.career);
  const m = missions.find((m) => m.id === id);
  if (!m || c.daily.claimed.includes(id) || c.daily[m.id] < m.target)
    throw Error(
      "Ainda falta cumprir a missão. A auditoria sabe contar até três.",
    );
  return {
    ...g,
    cash: cents(g.cash + m.reward),
    career: ledger(
      {
        ...c,
        xp: c.xp + m.xp,
        daily: { ...c.daily, claimed: [...c.daily.claimed, id] },
      },
      {
        kind: "reward",
        symbol: "MISSÃO",
        quantity: 1,
        amount: m.reward,
        label: `Salário de missão: ${m.name}`,
      },
    ),
  };
}
export function saveProfile(g: Game, p: Profile): Game {
  if (
    p.name.trim().length < 3 ||
    p.name.trim().length > 40 ||
    p.bio.length > 160 ||
    !avatars.includes(p.avatar) ||
    !titles.includes(p.title) ||
    !offices.includes(p.office) ||
    !/^#[0-9a-f]{6}$/i.test(p.color)
  )
    throw Error(
      "Nome de 3 a 40 letras e bio de até 160. Nem o ego cabe infinito.",
    );
  return {
    ...g,
    career: {
      ...g.career,
      profile: { ...p, name: p.name.trim(), bio: p.bio.trim() },
    },
  };
}
export function createCompany(
  g: Game,
  form: { name: string; symbol: string; emoji: string; description: string },
): Game {
  const symbol = form.symbol.trim().toUpperCase();
  const name = form.name.trim();
  const description = form.description.trim();
  if (g.assets.length >= 11)
    throw Error("Três empresas já é uma holding. Vai administrar primeiro.");
  if (
    !/^[A-Z]{3,5}[34]$/.test(symbol) ||
    g.assets.some((a) => a.symbol === symbol)
  )
    throw Error("Ticker único: 3 a 5 letras e final 3 ou 4. Exemplo: PIXO3.");
  if (
    name.length < 3 ||
    name.length > 45 ||
    description.length < 10 ||
    description.length > 180
  )
    throw Error(
      "Empresa: 3–45 caracteres. Pitch: 10–180. Capriche no delírio.",
    );
  if (!avatars.includes(form.emoji))
    throw Error("Escolha um mascote do conselho.");
  if (g.cash < 250)
    throw Error(
      "O cartório imaginário cobra R$ 250. Seu saldo não cobre o cafezinho.",
    );
  const a: Asset = {
    symbol,
    name,
    emoji: form.emoji,
    description,
    sector: "Empreendedorismo de procedência duvidosa",
    price: 10,
    open: 10,
    color: g.career.profile.color,
    history: Array(40).fill(10),
  };
  const c = currentCareer(g.career);
  return {
    ...g,
    cash: cents(g.cash - 250),
    assets: [...g.assets, a],
    career: ledger(
      { ...c, xp: c.xp + 50, daily: { ...c.daily, ipos: c.daily.ipos + 1 } },
      {
        kind: "ipo",
        symbol,
        quantity: 1,
        amount: -250,
        label: "Taxa de abertura: firma reconhecida pelo pombo",
      },
    ),
  };
}
export function progressTick(g: Game): Game {
  let c = currentCareer(g.career);
  c = { ...c, ticks: c.ticks + 1 };
  if (c.ticks - c.lastDividendTick < 60) return { ...g, career: c };
  const amount = cents(
    g.assets.reduce(
      (sum, a) =>
        sum + (g.positions[a.symbol]?.quantity || 0) * a.price * 0.002,
      0,
    ),
  );
  c = { ...c, lastDividendTick: c.ticks };
  if (amount <= 0) return { ...g, career: c };
  const paid = Math.min(amount, 500);
  return {
    ...g,
    cash: cents(g.cash + paid),
    career: ledger(
      { ...c, dividends: cents(c.dividends + paid) },
      {
        kind: "dividend",
        symbol: "PROVENTOS",
        quantity: 1,
        amount: paid,
        label: "Dividendos: o cafezinho dos acionistas (sem café)",
      },
    ),
  };
}
