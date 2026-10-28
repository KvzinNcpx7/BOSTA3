/** Fictional caricatures supplied for an opt-in school universe. No real profiles or images. */
export type Headline = {
  symbol: string;
  title: string;
  impact: number;
  school: boolean;
};
const general: [string, string, number][] = [
  [
    "CLT4",
    "CLT4 recua após funcionário conferir o calendário e descobrir que amanhã ainda é terça-feira.",
    -0.09,
  ],
  [
    "FOFO3",
    "Grupo do zap cria comissão para investigar quem criou outro grupo sem avisar o primeiro.",
    0.11,
  ],
  [
    "BOLO4",
    "Bolo de Pote lança plano família. Família pergunta se pode pagar no fiado.",
    -0.06,
  ],
  [
    "POMBO3",
    "Pombo Airlines anuncia check-in por migalha. Passageiro com pão de forma ganha prioridade.",
    0.09,
  ],
  [
    "SONO3",
    "Aluno diz “só vou descansar os olhos”. Assembleia de acionistas termina três horas depois.",
    0.1,
  ],
  [
    "TIGR3",
    "TIGR3 contrata consultor que explica o balanço usando “gain ou loss”. Relatório tem três palavras.",
    -0.08,
  ],
  [
    "CALV3",
    "CALV3 vende curso de gestão de crise. Primeira aula: aceitar que o gráfico também tem entradas.",
    0.07,
  ],
  [
    "WEBN3",
    "Mensagem “bom dia” chega sem emoji. Comitê de risco convoca reunião extraordinária.",
    -0.09,
  ],
  [
    "ALL",
    "Analista grita “Bora Bill!” na abertura. Bill não vem, mas a ordem de compra já foi.",
    0.05,
  ],
  [
    "BOLO4",
    "“Receba!”: cliente recebe 400 potes após apertar duas vezes o botão do pedido.",
    0.12,
  ],
  [
    "CLT4",
    "Diretor pede “calma, calabreso” ao gráfico. O gráfico solicita férias.",
    -0.07,
  ],
  [
    "FOFO3",
    "Caneta azul assina contrato. Auditores perdem vinte minutos conferindo se a tinta conta como ativo.",
    0.06,
  ],
  [
    "WEBN3",
    "Departamento de compliance ouve “lá ele” e passa a revisar todos os comunicados em dupla.",
    -0.05,
  ],
  [
    "CLT4",
    "Sextou no grupo da firma. O Excel permanece aberto apenas por respeito aos colegas.",
    0.11,
  ],
  [
    "TIGR3",
    "“O miserável é um gênio”: investidor evita prejuízo porque esqueceu a senha.",
    0.08,
  ],
  [
    "ALL",
    "Presidente do pregão lê “agora deu ruim” no teleprompter e descobre que era o próprio balanço.",
    -0.06,
  ],
  [
    "TIGR3",
    "Loss atrás de loss vira assinatura mensal. Cancelamento exige outra operação.",
    -0.11,
  ],
  [
    "FOFO3",
    "Faria limers trocam análise técnica por enquete: “confia?” vence com dois votos e um áudio.",
    0.09,
  ],
  [
    "BOLO4",
    "Boleto vencido é promovido a patrimônio histórico. BOLO4 cobra ingresso para visitar a cobrança.",
    0.08,
  ],
  [
    "ALL",
    "Serasa Fictício oferece selo de verificado para quem admitir que não sabe o que está fazendo.",
    0.04,
  ],
  [
    "SONO3",
    "Trabalho em grupo divide tarefas: um faz, três mandam “ficou top”. SONO3 contrata os três.",
    0.13,
  ],
  [
    "POMBO3",
    "Excursão escolar reserva voo para oito quilômetros. Piloto sugere ir andando e guardar o pão.",
    -0.08,
  ],
  [
    "BOLO4",
    "Cantina aceita apresentação de slides como garantia. Primeiro calote vem com transição de estrela.",
    -0.1,
  ],
  [
    "FOFO3",
    "Representante de turma manda “pessoal, assunto sério”. Mercado prepara as figurinhas.",
    0.12,
  ],
  [
    "WEBN3",
    "Casal marca reunião para alinhar expectativas. A ata vem com “vamos ser amigos”.",
    -0.16,
  ],
  [
    "CALV3",
    "CALV3 fecha parceria com ventilador da sala. Conselho exige teste de resistência do boné.",
    -0.07,
  ],
  [
    "SONO3",
    "Professor apaga a luz para passar vídeo. SONO3 chama de expansão de mercado.",
    0.14,
  ],
  [
    "CLT4",
    "Estagiário resolve bug desligando o computador. Empresa nomeia método de transformação digital.",
    0.09,
  ],
  [
    "FOFO3",
    "Áudio de sete minutos termina em “depois eu explico melhor”. Receita futura é revisada para cima.",
    0.15,
  ],
  [
    "TIGR3",
    "Investidor desenha seta para cima no caderno. A corretora solicita o nome do indicador.",
    0.08,
  ],
  [
    "POMBO3",
    "CEO pousa na mesa do conselho, come a pauta e anuncia que todas as matérias foram consumidas.",
    -0.06,
  ],
  [
    "BOLO4",
    "Bolo de Pote compra a tampa da concorrente. Analistas chamam de fechamento de mercado.",
    0.12,
  ],
  [
    "ALL",
    "Banco Central do Caos proíbe usar “é sobre isso” como justificativa no relatório trimestral.",
    -0.04,
  ],
  [
    "SONO3",
    "Sinal toca mais cedo por engano. SONO3 registra lucro antes de o inspetor perceber.",
    0.11,
  ],
  [
    "WEBN3",
    "Wi-fi da escola bloqueia coração no chat. Romance migra para bilhete e recupera liquidez.",
    0.09,
  ],
  [
    "ALL",
    "Diretoria descobre que a reunião não tinha dono. Mantém a reunião para decidir de quem é.",
    -0.05,
  ],
];
const school: [string, string, number][] = [
  [
    "FOFO3",
    "Érika da Galera convoca 500 investidores. Todos confirmam antes de alguém perguntar a pauta.",
    0.13,
  ],
  [
    "FOFO3",
    "Érika cria o grupo “rapidinho”. Em quatro minutos já tem subgrupo, ata e comissão de salgado.",
    0.09,
  ],
  [
    "FOFO3",
    "Érika conhece o primo do auditor. Auditor pede para entrar na lista da excursão.",
    0.08,
  ],
  [
    "FOFO3",
    "Érika manda “ninguém espalha”. FOFO3 precisa contratar o turno da madrugada.",
    0.12,
  ],
  [
    "ALL",
    "IARARARA ecoa no pregão. Analistas fingem que era exatamente o sinal que estavam esperando.",
    0.14,
  ],
  [
    "TIGR3",
    "TIGR3 instala detector de Iararara. Aparelho apita sozinho e pede participação nos lucros.",
    -0.1,
  ],
  [
    "SONO3",
    "Iararara é ouvido na última aula. SONO3 perde a clientela antes do intervalo.",
    -0.12,
  ],
  [
    "ALL",
    "Banco Central testa juros na base do Iararara. Microfone entra como membro votante.",
    -0.07,
  ],
  [
    "BOLO4",
    "Heide Holdings compra a cantina. O anúncio de dividendos termina com “frango ou queijo?”.",
    0.15,
  ],
  [
    "BOLO4",
    "Heide lança moeda lastreada em coxinha. Auditores solicitam amostra e somem no intervalo.",
    0.11,
  ],
  [
    "POMBO3",
    "Heide compra a rota até a cantina. Pombo Airlines passa a chamar a fila de conexão doméstica.",
    0.1,
  ],
  [
    "BOLO4",
    "Heide exige plano de expansão da estufa. CEO apresenta a extensão elétrica.",
    0.08,
  ],
  [
    "ALL",
    "Natália de Costa pra Mim vira de costas para o vermelho. Gráfico exige contato visual para continuar caindo.",
    0.06,
  ],
  [
    "WEBN3",
    "Natália de Costa pra Mim muda a cadeira de lugar. WEBN3 chama de reposicionamento estratégico.",
    0.09,
  ],
  [
    "TIGR3",
    "Natália olha o resultado pelo reflexo da janela. TIGR3 anuncia relatório com perspectiva invertida.",
    -0.08,
  ],
  [
    "CALV3",
    "Natália vira as costas para a apresentação. CALV3 troca todos os slides por “depois a gente vê”.",
    -0.05,
  ],
  [
    "ALL",
    "Priscila de Todos assume os 14 departamentos. Primeira decisão: juntar as 14 reuniões numa só.",
    0.1,
  ],
  [
    "BOLO4",
    "Priscila compra a própria firma. O setor de compras solicita aprovação à própria Priscila.",
    0.12,
  ],
  [
    "FOFO3",
    "Priscila vira diretora, fiscal e acionista. FOFO3 não sabe para quem vazar a informação primeiro.",
    0.14,
  ],
  [
    "CLT4",
    "Priscila cobre todas as faltas. CLT4 considera feriado, mas precisa da assinatura da Priscila.",
    0.09,
  ],
  [
    "ALL",
    "Cristiane anuncia prova surpresa de investimentos. Metade da bolsa pergunta se pode fazer em dupla.",
    -0.13,
  ],
  [
    "TIGR3",
    "Cristiane pede para mostrar os cálculos. TIGR3 entrega um print e um pedido de desculpas.",
    -0.16,
  ],
  [
    "CLT4",
    "Cristiane devolve o balanço com “desenvolva melhor”. CLT4 faz mais duas horas de relatório.",
    -0.09,
  ],
  [
    "SONO3",
    "Cristiane libera a revisão para casa. SONO3 recebe a transferência antes de tocar o sinal.",
    0.12,
  ],
  [
    "FOFO3",
    "Érika monta fila de investidores por ordem de quem ela conhece. A fila faz uma volta no quarteirão.",
    0.1,
  ],
  [
    "BOLO4",
    "Heide divide a coxinha em cotas. Investidor com uma migalha exige assento no conselho.",
    0.08,
  ],
  [
    "POMBO3",
    "Priscila assume a torre de controle. Todos os voos passam a pousar no departamento dela.",
    0.13,
  ],
  [
    "WEBN3",
    "Érika organiza reconciliação em grupo. WEBN3 pede que cada casal abra um protocolo separado.",
    0.11,
  ],
  [
    "CALV3",
    "Cristiane confere o caixa da CALV3. A única divergência é um boné lançado como imóvel.",
    -0.08,
  ],
  [
    "ALL",
    "Iararara entra na ata como voto de minerva. Ninguém sabe qual lado venceu, mas a ata foi aprovada.",
    0.09,
  ],
  [
    "SONO3",
    "Natália de Costa pra Mim vira a carteira para o sol. SONO3 classifica o gesto como renda passiva.",
    0.08,
  ],
  [
    "CLT4",
    "Érika convoca reunião no intervalo. CLT4 pede ao menos a presença remunerada do pão de queijo.",
    -0.07,
  ],
  [
    "BOLO4",
    "Heide anuncia “última coxinha”. Conselho inteiro passa a negociar olhando para a mesma bandeja.",
    0.13,
  ],
  [
    "FOFO3",
    "Priscila audita Priscila após denúncia da Priscila. Parecer: encaminhar para Priscila.",
    -0.09,
  ],
  [
    "ALL",
    "Cristiane aceita recuperação do balanço. Mercado descobre que terá de explicar o prejuízo oralmente.",
    -0.1,
  ],
  [
    "POMBO3",
    "Iararara é confundido com chamada de embarque. Pombo Airlines decola com a comissão da Érika.",
    0.12,
  ],
];
const politicalParodies: [string, string, number][] = [
  ["FOFO3", "VORCARO DO MULTIVERSO lança um balanço tão bonito que o gráfico pediu autógrafo. Tudo nesta notícia é ficção.", 0.09],
  ["TIGR3", "Vorcaro entra no pregão com uma planilha de 900 abas. A aba 'explicação' continua carregando.", -0.08],
  ["BOLO4", "Vorcaro anuncia banco de bolo de pote. O lastro é uma colher emprestada.", 0.10],
  ["ALL", "BOLSONARO HIPOTÉTICO abre coletiva: 'E SE as ações subissem?' Metade compra e a outra metade pede o PowerPoint.", 0.06],
  ["CLT4", "Bolsonaro Hipotético propõe semana com oito sextas-feiras. O calendário pede esclarecimentos.", 0.12],
  ["FOFO3", "Bolsonaro Hipotético pergunta 'E SE?' 37 vezes. Analistas cobram tese por minuto.", -0.06],
  ["ALL", "PAINHO CUMPANHEIRO chega ao pregão: 'ME DÁ TUDO!' Mas era a conta do Banco Imaginário. O Pix de mentira foi estornado.", -0.07],
  ["SONO3", "Painho Cumpanheiro confisca todos os travesseiros fictícios. SONO3 convoca CPI do cochilo.", -0.10],
  ["POMBO3", "Painho Cumpanheiro tenta levar a frota da POMBO3. Os pombos fogem voando. Auditoria encerra o caso.", 0.11],
  ["CLT4", "TAXAD cria imposto sobre clicar em 'Comprar'. Investidores passam a negociar piscando para o gráfico.", -0.09],
  ["BOLO4", "Taxad apresenta a taxa do pote sem tampa. Conselho econômico pede a nota fiscal da colher.", -0.11],
  ["FOFO3", "Taxad anuncia taxação sobre fofoca não declarada. O grupo inteiro manda 'não fui eu'.", 0.08],
  ["ALL", "O quarteto Vorcaro, Bolsonaro Hipotético, Painho Cumpanheiro e Taxad entra numa reunião. A ata é só 'CARAI BORRACHA!'.", -0.04],
  ["TIGR3", "Irineu pergunta ao Taxad qual a alíquota do susto. Resposta: 'Você não sabe nem eu!'.", 0.07],
];
export const newHeadlines: Headline[] = [
  ...general.map(([symbol, title, impact]) => ({
    symbol,
    title,
    impact,
    school: false,
  })),
  ...school.map(([symbol, title, impact]) => ({
    symbol,
    title,
    impact,
    school: true,
  })),
  // Append new parody events so every published news ID remains stable.
  ...politicalParodies.map(([symbol, title, impact]) => ({
    symbol,
    title: `SÁTIRA FICTÍCIA · ${title}`,
    impact,
    school: false,
  })),
];
export type SpecialKind =
  | "iararara"
  | "erika"
  | "strike"
  | "priscila"
  | "cantina"
  | "irineu"
  | "iarPause"
  | "vorcaro"
  | "hipotetico"
  | "painho"
  | "taxad"
  | "cavaleiros";
export const specialEvents: {
  id: SpecialKind;
  name: string;
  emoji: string;
  school: boolean;
  duration: number;
  description: string;
  consequence: string;
}[] = [
  {
    id: "iararara",
    name: "O GRANDE IARARARA",
    emoji: "📢",
    school: true,
    duration: 8000,
    description:
      "O microfone pediu demissão. O mercado entendeu como sinal de compra. E de venda. Ao mesmo tempo.",
    consequence:
      "Choques diferentes em todas as empresas. O grito não oferece orientação.",
  },
  {
    id: "erika",
    name: "ÉRIKA CONVOCOU A GALERA",
    emoji: "🗣️",
    school: true,
    duration: 40000,
    description:
      "Já tem lista, sublista e alguém perguntando se pode levar acompanhante.",
    consequence:
      "FOFO3 sobe 12% no anúncio e fica mais volátil por 40 segundos. Comunicados ocupam o jornal.",
  },
  {
    id: "strike",
    name: "GREVE DOS INVESTIDORES CLT",
    emoji: "💼",
    school: false,
    duration: 8000,
    description:
      "O vale-refeição não caiu. O home broker também não vai trabalhar de graça.",
    consequence:
      "Compras e vendas suspensas por 8 segundos. As cotações continuam oscilando.",
  },
  {
    id: "priscila",
    name: "PRISCILA COMPROU TUDO",
    emoji: "🧾",
    school: true,
    duration: 10000,
    description:
      "Compradora: Priscila. Vendedora: Priscila. Testemunha: pode deixar que ela assina também.",
    consequence:
      "FOFO3, BOLO4 e POMBO3 sobem; CLT4 recua com a promessa de mais reuniões.",
  },
  {
    id: "cantina",
    name: "CRISE DA CANTINA",
    emoji: "🥟",
    school: true,
    duration: 10000,
    description:
      "Heide Holdings confirmou: acabou a coxinha. O guardanapo foi vendido separadamente.",
    consequence: "BOLO4 cai 22%, SONO3 sobe 7% e os demais ativos recuam 6%.",
  },
  {
    id: "irineu",
    name: "IRINEU ASSUME A DIRETORIA ECONÔMICA",
    emoji: "🗿",
    school: false,
    duration: 10000,
    description:
      "Ninguém sabe o motivo. Nem ele. O crachá veio com ponto de interrogação.",
    consequence:
      "FOFO3 sobe 5%; TIGR3 reage à nomeação com uma oscilação de até 6%.",
  },
  {
    id: "iarPause",
    name: "IARARARA OUVIDA A 7 KM DE DISTÂNCIA",
    emoji: "📢",
    school: true,
    duration: 5000,
    description:
      "O microfone chegou antes do comunicado. O departamento de ouvidos pediu um intervalo.",
    consequence:
      "Compras e vendas pausam por 5 segundos. As cotações continuam oscilando.",
  },
  {
    id: "vorcaro",
    name: "VORCARO DO MULTIVERSO ASSUME A PLANILHA",
    emoji: "📊",
    school: false,
    duration: 10000,
    description: "Esta é uma sátira fictícia: o balanço tem 900 abas e nenhuma explica por que o botão de lucro está piscando.",
    consequence: "TIGR3 sobe 15%, FOFO3 sobe 9% e BOLO4 cai 5%. Nenhum fato real está sendo relatado.",
  },
  {
    id: "hipotetico",
    name: "BOLSONARO HIPOTÉTICO ABRE O DEBATE DO E SE",
    emoji: "🤔",
    school: false,
    duration: 9000,
    description: "E SE o mercado só negociasse possibilidades? A corretora respondeu com um gráfico que sobe e desce ao mesmo tempo.",
    consequence: "Cada ação recebe um cenário aleatório de alta ou queda entre 4% e 12%. Cenário puramente imaginário.",
  },
  {
    id: "painho",
    name: "PAINHO CUMPANHEIRO CONFISCA TUDO (DE MENTIRINHA)",
    emoji: "🫳",
    school: false,
    duration: 8000,
    description: "CARAI BORRACHA! O personagem fictício entrou na sala: 'ME DÁ TUDO, CUMPANHEIRO!' O sistema mostra R$ 0,00 por pegadinha.",
    consequence: "Confisco 100% VISUAL por 8s; saldo, ações, cotações, XP e ranking ficam intactos. É só uma piada.",
  },
  {
    id: "taxad",
    name: "TAXAD CRIA O IMPOSTO DO IMPOSTO",
    emoji: "🧾",
    school: false,
    duration: 9000,
    description: "O ministro fictício da Receita Imaginária decidiu taxar até o espaço vazio entre dois cliques.",
    consequence: "CLT4 cai 8%, BOLO4 cai 6% e FOFO3 sobe 7% com o vazamento do novo formulário.",
  },
  {
    id: "cavaleiros", name: "REUNIÃO DOS 4 CAVALEIROS DO PREJUÍZO!", emoji: "🐎",
    school: false, duration: 14000,
    description: "SÁTIRA FICTÍCIA · Vorcaro apresenta o balanço em coxinhas. Bolsonaro Hipotético pergunta E SE? Painho pede tudo. Taxad anuncia a taxa de participação. Irineu: IRINEU, VOCÊ NÃO SABE NEM EU!",
    consequence: "CARAI BORRACHA! ESSA REUNIÃO CUSTOU 3 TRILHÕES DE REAIS FICTÍCIOS! Só as cotações reagem: nenhum débito no caixa. POMBO3 e FOFO3 sobem; CLT4 e BOLO4 recuam.",
  },
];
export const resenhaAchievements = [
  {
    id: "zapEconomist",
    name: "Economista do Zap",
    hint: "Compartilhe 3 notícias diferentes.",
    emoji: "🏆",
  },
  {
    id: "serasaPartner",
    name: "Sócio do Serasa Fictício",
    hint: "Acumule R$ 2.500 de prejuízo realizado.",
    emoji: "💀",
  },
  {
    id: "lossDegree",
    name: "Formado em Perder Dinheiro",
    hint: "Faça 50 operações — diploma por tempo de serviço.",
    emoji: "📉",
  },
  {
    id: "cltPremium",
    name: "CLT Premium",
    hint: "Tenha pelo menos 10 ações de CLT4.",
    emoji: "🧑‍💼",
  },
  {
    id: "erikaFriend",
    name: "Amigo da Érika da Galera",
    hint: "Presencie a convocação especial da Érika.",
    emoji: "🗣️",
    school: true,
  },
  {
    id: "iarSurvivor",
    name: "Sobrevivente do Iararara",
    hint: "Atravesse até o fim um Grande Iararara.",
    emoji: "📢",
    school: true,
  },
  {
    id: "pigeonShareholder",
    name: "Acionista do Pombo",
    hint: "Tenha pelo menos 5 ações de POMBO3.",
    emoji: "🐦",
  },
  {
    id: "coxinhaEntrepreneur",
    name: "Empresário da Coxinha",
    hint: "Tenha 20 ações de BOLO4 e já tenha recebido dividendos.",
    emoji: "🧁",
  },
  {
    id: "topDoctor",
    name: "Doutor em Comprar no Topo",
    hint: "Compre 3 vezes no maior preço do histórico visível do ativo.",
    emoji: "🤡",
  },
  {
    id: "billion",
    name: "Bilionário de Mentirinha",
    hint: "Alcance R$ 1 bilhão de patrimônio fictício.",
    emoji: "💸",
  },
  {
    id: "economicsRecovery",
    name: "Recuperação em Economia",
    hint: "Após ficar com R$ 9.500 ou menos, volte a R$ 10.000 negociando.",
    emoji: "📚",
  },
  {
    id: "lossKing",
    name: "Rei do Prejuízo",
    hint: "Faça 5 vendas no prejuízo e acumule R$ 5.000 de prejuízo realizado.",
    emoji: "🥇",
  },
];
