import { horsemen, horsemenLines } from "./horsemen";
export const characters = {
  ...horsemen,
  primo: {
    name: "Primo do Primo",
    emoji: "🥸",
    job: "Especialista em absolutamente nada",
    credential: "CNPI: confia no pai, investidor",
    school: false,
  },
  fiscal: {
    name: "Fiscal do Serasa Fictício",
    emoji: "🕵️",
    job: "Departamento de boletos imaginários",
    credential: "Nenhuma cobrança real. Só observações.",
    school: false,
  },
  board: {
    name: "Diretoria da BOSTA3",
    emoji: "🧑‍💼",
    job: "Comitê de decisões tomadas no zap",
    credential: "Ata aprovada antes da reunião começar.",
    school: false,
  },
  erika: {
    name: "Érika da Galera",
    emoji: "🗣️",
    job: "Relações com literalmente todo mundo",
    credential: "Personagem fictícia · contato: o grupo inteiro",
    school: true,
  },
  iar: {
    name: "Iararara",
    emoji: "📢",
    job: "Indicador técnico não homologado",
    credential: "Personagem fictício · análise na base do grito",
    school: true,
  },
} as const;
export type CharacterId = keyof typeof characters;
export type Context =
  "welcome" | "buy" | "sell" | "sellLoss" | "loss" | "gain" | "rich" | "event";
export type Banter = { speaker: CharacterId; text: string };
const entries: Record<Context, [CharacterId, string][]> = {
  welcome: [
    [
      "primo",
      "Meu método tem três etapas: abrir o aplicativo, confiar e culpar a conjuntura.",
    ],
    [
      "board",
      "Bem-vindo. O áudio com as instruções tem sete minutos. A parte importante ficou para o próximo áudio.",
    ],
    [
      "fiscal",
      "Seu cadastro no Serasa Fictício está limpo. Por enquanto é só potencial.",
    ],
    [
      "primo",
      "Antes de investir, defina seu perfil. O meu é uma foto de terno tirada no casamento do primo.",
    ],
    [
      "erika",
      "Já te coloquei no grupo dos investidores, no do lanche e no da reunião que não tinha assunto.",
    ],
    ["iar", "iararara. Em minúsculas porque o mercado ainda está acordando."],
  ],
  buy: [
    [
      "primo",
      "Compra confirmada. Você transformou uma impressão em uma posição financeira. É quase ciência.",
    ],
    [
      "board",
      "O conselho aprovou sua compra por unanimidade. O conselho é uma pessoa segurando dois celulares.",
    ],
    [
      "fiscal",
      "Anotei: gastou porque o botão estava disponível. Justificativa recebida, não compreendida.",
    ],
    ["primo", "Receba! A ação é sua. O motivo da compra continua em aberto."],
    [
      "erika",
      "Eu conheço alguém que conhece o mascote dessa empresa. Vou marcar vocês no grupo.",
    ],
    ["iar", "IARARARA. Isso não foi uma recomendação. Foi o recibo."],
  ],
  sell: [
    [
      "primo",
      "Vendeu e sobrou dinheiro. Evite chamar isso de método na frente de testemunhas.",
    ],
    [
      "fiscal",
      "Saldo creditado. O fiscal vai usar “surpreendentemente” no relatório.",
    ],
    [
      "board",
      "Operação encerrada. O departamento de arrependimento continua funcionando normalmente.",
    ],
    [
      "primo",
      "Realizou o resultado antes de mandar print. Uma decisão rara e tecnicamente adulta.",
    ],
    [
      "erika",
      "Posso avisar o grupo ou você quer fingir que foi tudo planejado primeiro?",
    ],
    ["iar", "iararara de saída. Sem taxa de despedida. Ainda."],
  ],
  sellLoss: [
    [
      "primo",
      "Comprou na alta e vendeu na baixa. O gráfico agradece a demonstração prática.",
    ],
    [
      "fiscal",
      "Prejuízo realizado. Pelo menos alguém realizou alguma coisa nesta reunião.",
    ],
    [
      "board",
      "Chamaremos isso de desinvestimento estratégico. O nome não devolve o dinheiro, mas cabe no slide.",
    ],
    ["primo", "Você não deixou dinheiro na mesa. Financiou a mesa inteira."],
    [
      "erika",
      "Eu ia mandar “eu avisei”, mas procurei no grupo e eu também tinha comprado.",
    ],
    ["iar", "Iararara baixinho. Momento de respeitar o extrato."],
  ],
  loss: [
    [
      "primo",
      "Meu amigo, o gráfico não está caindo. Ele está procurando petróleo.",
    ],
    [
      "fiscal",
      "Seu saldo entrou em modo economia de energia. A tela continua brilhando por educação.",
    ],
    [
      "board",
      "A diretoria acompanha o cenário com atenção. Sem solução, mas com atenção.",
    ],
    [
      "primo",
      "Fechar o aplicativo não recupera dinheiro. Mas encerra a reunião com o problema.",
    ],
    [
      "erika",
      "Natália de Costa pra Mim sugeriu virar a cadeira. O prejuízo continuou, mas a janela é bonita.",
    ],
    [
      "iar",
      "O grito agora é do acionista. Não confundir com indicador de compra.",
    ],
  ],
  gain: [
    [
      "primo",
      "Está no lucro. Não mande “eu falei” no grupo antes de conferir se o botão vender funciona.",
    ],
    [
      "fiscal",
      "O fiscal do Serasa Fictício recolheu a prancheta. Disse que passa mais tarde.",
    ],
    [
      "board",
      "Resultado acima do esperado. Vamos corrigir a expectativa antes que alguém peça aumento.",
    ],
    [
      "primo",
      "O miserável é um gênio! Ou o pombo pisou no botão certo. Seguimos apurando.",
    ],
    [
      "erika",
      "Já avisei todo mundo que você entende de bolsa. Pode abrir a reunião de amanhã?",
    ],
    [
      "iar",
      "IARARARA em tom de parabéns. O mercado não oferece garantia de continuidade.",
    ],
  ],
  rich: [
    [
      "primo",
      "A Receita Federal fictícia já estacionou. Veio num carro desenhado no caderno.",
    ],
    [
      "fiscal",
      "Seu saldo agora é maior que a sua justificativa para comprar. Estamos diante de um marco.",
    ],
    [
      "board",
      "Parabéns. Você já pode recusar uma reunião usando a expressão “conflito de agenda”.",
    ],
    [
      "primo",
      "Já dá para comprar um salgado sem perguntar o preço. A coxinha premium ainda exige cautela.",
    ],
    [
      "erika",
      "Heide perguntou se você quer adquirir a cantina ou só furar a fila. Eu disse que ia confirmar.",
    ],
    ["iar", "IARARARA patrimonial. A vírgula mudou de bairro."],
  ],
  event: [
    [
      "primo",
      "A notícia chegou depois da minha análise. Vou atualizar a análise para parecer que chegou antes.",
    ],
    [
      "board",
      "Comunicado: os próximos comunicados serão comunicados em comunicado próprio.",
    ],
    [
      "fiscal",
      "O grupo mandou um áudio. O fiscal pediu a versão escrita e perdeu o cargo no grupo.",
    ],
    [
      "primo",
      "Calma, calabreso. A manchete tem exclamação, mas a conta ainda precisa fechar.",
    ],
    [
      "erika",
      "Confirmei com três grupos. Os três receberam o mesmo print. Três fontes, tecnicamente.",
    ],
    [
      "iar",
      "Se ouvir IARARARA, confira o gráfico. Se não ouvir, confira também. O microfone pode estar desligado.",
    ],
  ],
};
export function chooseBanter(
  context: Context,
  school: boolean,
  recent: string[] = [],
  rng = Math.random,
  forced?: CharacterId,
): Banter {
  const candidates = entries[context].filter(
    ([speaker]) => school || !characters[speaker].school,
  );
  const filtered = forced
    ? candidates.filter(([speaker]) => speaker === forced)
    : candidates;
  const eligible = filtered.length ? filtered : candidates;
  const remaining = eligible.filter(([, text]) => !recent.includes(text));
  const pool = remaining.length
    ? remaining
    : eligible.filter(([, text]) => text !== recent.at(-1));
  const [speaker, text] =
    pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  return { speaker, text };
}

for (const context of ["welcome", "buy", "sell", "sellLoss", "loss", "gain", "rich", "event"] as const) entries[context].push(...horsemenLines);
