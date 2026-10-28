export const npcCharacters = {
  irineu: {
    name: "Irineu",
    emoji: "🗿",
    role: "Diretor sem conhecimento da nomeação",
    school: false,
  },
  primo: {
    name: "Primo do Primo",
    emoji: "🥸",
    role: "Assessoria sem evidências",
    school: false,
  },
  fiscal: {
    name: "Fiscal do Serasa Fictício",
    emoji: "🕵️",
    role: "Fiscaliza só boletos de mentirinha",
    school: false,
  },
  erika: {
    name: "Érika da Galera",
    emoji: "🗣️",
    role: "Administra todos os grupos",
    school: true,
  },
  iar: {
    name: "Iararara",
    emoji: "📢",
    role: "Microfone não homologado",
    school: true,
  },
  pombo: {
    name: "CEO da POMBO3",
    emoji: "🐦",
    role: "Aviação e pequenos furtos de pão",
    school: false,
  },
  bolo: {
    name: "CEO da BOLO4",
    emoji: "🧁",
    role: "Crescimento dentro do pote",
    school: false,
  },
  clt: {
    name: "CEO da CLT4",
    emoji: "💼",
    role: "Disponível depois do expediente",
    school: false,
  },
  fofo: {
    name: "CEO da FOFO3",
    emoji: "👀",
    role: "Não fui eu que contei",
    school: false,
  },
} as const;
export type Npc = keyof typeof npcCharacters;
export type ChatContext =
  "buy" | "sell" | "loss" | "gain" | "news" | "special" | "meeting";
export const chatLines: Record<ChatContext, [Npc, string][]> = {
  buy: [
    [
      "irineu",
      "Você sabe por que comprou {symbol}? Nem eu. Mas já temos esse ponto em comum.",
    ],
    [
      "primo",
      "Entrou em {symbol}. Agora só falta a tese. A gente monta depois do print.",
    ],
    [
      "fofo",
      "Chegou ordem em {symbol}. Não pergunte quem contou. O próprio sistema contou.",
    ],
    [
      "pombo",
      "{symbol}? Se sobrar troco, diversifica em farelo. Liquidez de praça.",
    ],
  ],
  sell: [
    [
      "irineu",
      "Vendeu {symbol}. Foi estratégia ou o dedo escorregou? Não precisa responder no grupo.",
    ],
    [
      "primo",
      "Resultado realizado em {symbol}. O gerente do arrependimento já pediu uma cópia.",
    ],
    [
      "clt",
      "Conseguiu encerrar uma posição. Eu não consigo nem encerrar a reunião das 17h.",
    ],
    [
      "bolo",
      "A venda caiu no caixa? Então dá pra comprar tampa. Aqui a expansão tem limite físico.",
    ],
  ],
  loss: [
    [
      "fiscal",
      "Passei aqui pra ver o estrago. Minha prancheta pediu para ficar no carro.",
    ],
    [
      "irineu",
      "O gráfico de {symbol} desceu. Eu também sairia dessa reunião se pudesse.",
    ],
    [
      "primo",
      "Essa queda em {symbol} está dentro do meu cenário. Meu cenário era não ter cenário.",
    ],
    [
      "pombo",
      "Voo de {symbol} em procedimento de descida. O chão ainda está sendo negociado.",
    ],
  ],
  gain: [
    [
      "fiscal",
      "Lucro? Perdão, grupo errado. Vou voltar quando o entusiasmo acabar.",
    ],
    [
      "primo",
      "{symbol} subiu. Não muda a bio pra “especialista” antes de fechar o pregão.",
    ],
    ["irineu", "Eu sabia. Sabia o quê? Isso vamos definir depois."],
    ["bolo", "O lucro deu para uma colher? Aqui a gente comemora em etapas."],
  ],
  news: [
    [
      "irineu",
      "Acabei de ler sobre {symbol}. Continuo sem saber, agora com fonte.",
    ],
    ["fofo", "O comunicado de {symbol} era sigiloso até virar meu status."],
    [
      "clt",
      "Essa notícia de {symbol} podia ter chegado durante o expediente. Meu intervalo é patrimônio.",
    ],
    [
      "pombo",
      "Li a manchete de {symbol}. Não li a segunda parte porque caiu um pão aqui.",
    ],
  ],
  special: [
    [
      "irineu",
      "Me nomearam diretor econômico. Mandei “quem é?” no grupo e disseram que era eu.",
    ],
    [
      "primo",
      "Suspenderam o bom senso. O pregão continua dentro da normalidade da BOSTA3.",
    ],
    [
      "erika",
      "Convocação enviada. Metade respondeu “mas eu tenho ação?”. Já estou fazendo a lista da metade.",
    ],
    [
      "iar",
      "IARARARA. A transcrição automática escreveu “renda fixa”. Não confiem.",
    ],
  ],
  meeting: [
    [
      "irineu",
      "Já temos pauta e quatro opções. Só falta alguém que saiba o que está acontecendo.",
    ],
    [
      "pombo",
      "Voto por mais pombos. Declaro meu conflito de interesse e como o papel da declaração.",
    ],
    [
      "bolo",
      "Se a proposta não cabe no pote, é porque o pote ainda não fez IPO.",
    ],
    [
      "clt",
      "Essa assembleia vale como hora trabalhada ou como episódio traumático?",
    ],
  ],
};
export const secrets = [
  {
    id: "logo",
    name: "O logo pediu adicional",
    hint: "O logotipo também tem limite de paciência.",
    reveal: "7 cliques no logo em até 8 segundos.",
    school: false,
  },
  {
    id: "irineu",
    name: "Diretoria do Não Sei",
    hint: "Um nome que ninguém sabe explicar.",
    reveal: "Digite IRINEU fora dos campos de texto.",
    school: false,
  },
  {
    id: "iar",
    name: "Grito de bolso",
    hint: "O pregão tem uma palavra que não cabe no microfone.",
    reveal: "No modo escolar, digite IARARARA fora dos campos.",
    school: true,
  },
  {
    id: "bill",
    name: "Bill ficou no home office",
    hint: "Tem um convite brasileiro que já virou método.",
    reveal: "Digite BORABILL fora dos campos de texto.",
    school: false,
  },
  {
    id: "nice",
    name: "Lote tecnicamente específico",
    hint: "Uma quantidade bem particular de convicção.",
    reveal: "Compre exatamente 69 ações em uma ordem.",
    school: false,
  },
  {
    id: "snackBudget",
    name: "Liquidez de uma empada",
    hint: "A reserva de emergência está ficando crocante.",
    reveal: "Fique com patrimônio fictício de até R$ 10.",
    school: false,
  },
  {
    id: "tenLosses",
    name: "Fidelidade ao prejuízo",
    hint: "O prejuízo também tem programa de pontos.",
    reveal: "Faça 10 vendas com prejuízo.",
    school: false,
  },
  {
    id: "fortyTwo",
    name: "Resposta para o pregão",
    hint: "A resposta existe. Falta perguntar a coisa certa.",
    reveal: "Complete 42 operações.",
    school: false,
  },
  {
    id: "eightHours",
    name: "Oito horas de renda passiva",
    hint: "Uma posição de sono perfeitamente recomendável.",
    reveal: "Tenha exatamente 8 ações de SONO3.",
    school: false,
  },
  {
    id: "allEight",
    name: "Colecionador de problemas",
    hint: "O catálogo original está pedindo uma reunião de família.",
    reveal: "Tenha ao menos uma ação de cada uma das 8 empresas originais.",
    school: false,
  },
  {
    id: "rh",
    name: "Funcionário fictício do mês",
    hint: "O RH imaginário finalmente liberou todos os pagamentos.",
    reveal: "Resgate as 3 missões do dia.",
    school: false,
  },
  {
    id: "coffee",
    name: "Café com proventos",
    hint: "Seu cafezinho está ganhando uma quantidade suspeita.",
    reveal: "Receba ao menos R$ 69 em dividendos fictícios.",
    school: false,
  },
  {
    id: "name",
    name: "Crachá sem explicação",
    hint: "A diretoria reconhece o nome no seu crachá.",
    reveal: "Use Irineu no nome fictício do perfil.",
    school: false,
  },
];
export const receiptQuips = [
  "Meu assessor era um áudio. O áudio pediu demissão.",
  "Auditoria realizada por um pombo que não leu o extrato.",
  "Este documento comprova convicção. Competência segue em análise.",
  "Print autorizado pelo departamento de escolhas questionáveis.",
  "Comprei o rumor. Vendi a paz.",
  "Se alguém perguntar, foi um estudo de caso.",
  "A estratégia funcionou perfeitamente para a outra ponta.",
  "Nenhum real foi perdido. A pose, infelizmente, não era fictícia.",
];
export type MeetingOption = {
  id: string;
  text: string;
  reason: string;
  impacts: Record<string, number>;
};
export const meetingTemplates: {
  id: string;
  company: string;
  title: string;
  intro: string;
  options: MeetingOption[];
}[] = [
  {
    id: "pombo",
    company: "POMBO3",
    title: "A POMBO3 está gastando mais migalhas do que recebe. E agora?",
    intro:
      "O CEO pousou em cima do balanço. Por favor, vote antes que ele coma a seção de custos.",
    options: [
      {
        id: "pigeons",
        text: "Contratar mais pombos.",
        reason:
          "Mais rotas, mais salários em pão. O plano de voo ganha volume.",
        impacts: { POMBO3: 0.06, CLT4: -0.02 },
      },
      {
        id: "corn",
        text: "Trocar o plano estratégico por milho.",
        reason:
          "Passageiros aprovam o lanche; BOLO4 perde espaço no intervalo.",
        impacts: { POMBO3: 0.1, BOLO4: -0.04 },
      },
      {
        id: "human",
        text: "Demitir o único funcionário humano.",
        reason: "Economia de crachá; ninguém sabe mais a senha do radar.",
        impacts: { POMBO3: -0.09, FOFO3: 0.05 },
      },
      {
        id: "opportunity",
        text: "Declarar que a crise é uma oportunidade.",
        reason:
          "FOFO3 vende a frase. POMBO3 ganha um dia para arrumar o slide.",
        impacts: { POMBO3: 0.02, FOFO3: 0.04 },
      },
    ],
  },
  {
    id: "bolo",
    company: "BOLO4",
    title: "O pote cresceu. O bolo ficou do mesmo tamanho. Qual é o plano?",
    intro:
      "A reunião foi convocada porque o investidor encontrou mais ar que brigadeiro.",
    options: [
      {
        id: "lid",
        text: "Lançar tampa premium.",
        reason: "O mesmo bolo, agora com sensação de exclusividade.",
        impacts: { BOLO4: 0.08, POMBO3: -0.02 },
      },
      {
        id: "subscription",
        text: "Assinatura mensal de coxinha.",
        reason: "Receita recorrente e expediente menos triste.",
        impacts: { BOLO4: 0.12, CLT4: 0.04 },
      },
      {
        id: "corn",
        text: "Colocar milho no pote e chamar de pivô.",
        reason: "Os pombos gostaram. O cliente de chocolate não.",
        impacts: { BOLO4: -0.06, POMBO3: 0.06 },
      },
      {
        id: "audit",
        text: "Auditar o brigadeiro com degustação.",
        reason: "Transparência sobe; o estoque some no processo.",
        impacts: { BOLO4: -0.03, FOFO3: 0.07 },
      },
    ],
  },
  {
    id: "clt",
    company: "CLT4",
    title:
      "CLT4 precisa motivar a equipe sem usar a expressão “somos uma família”.",
    intro:
      "O slide de clima organizacional travou justamente na palavra “clima”.",
    options: [
      {
        id: "holiday",
        text: "Marcar reunião no feriado.",
        reason: "Engajamento negativo. Até o cochilo perde valor.",
        impacts: { CLT4: -0.07, SONO3: -0.05 },
      },
      {
        id: "snack",
        text: "Liberar vale-coxinha fictício.",
        reason: "A equipe acredita na gestão por aproximadamente um intervalo.",
        impacts: { CLT4: 0.09, BOLO4: 0.07 },
      },
      {
        id: "friday",
        text: "Emendar a sexta-feira.",
        reason: "Descanso sobe e a equipe volta menos hostil ao calendário.",
        impacts: { SONO3: 0.1, CLT4: 0.03 },
      },
      {
        id: "group",
        text: "Criar grupo para cobrar o grupo antigo.",
        reason: "FOFO3 cresce. A produtividade fica digitando…",
        impacts: { FOFO3: 0.08, CLT4: -0.05 },
      },
    ],
  },
];
