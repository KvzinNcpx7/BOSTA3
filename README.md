# BOSTA3 📉

**A Bolsa Oficial dos Memes Brasileiros.** Seu dinheiro não rende. Ele vira entretenimento.

Segunda versão jogável de um simulador satírico. Todo dinheiro, empresa, notícia e investimento é fictício. Não usa APIs financeiras, dinheiro real, apostas ou recomendações de investimento.

## Executar

Requer Node.js 22.22.2+ e npm.

```sh
npm ci
npm run dev
```

Abra `http://localhost:5173/BOSTA3/`. Para conferir o pacote de produção:

```sh
npm run build
npm run preview
```

Abra a URL impressa pelo Vite, com o caminho `/BOSTA3/`.

## Jogar

- Comece com R$ 10.000 fictícios e compre ações de oito empresas memes.
- Use **Negociar** para consultar descrição, histórico, saldo e quantidade disponível. Compras e vendas usam a cotação vigente ao confirmar.
- Os preços variam a cada 5 segundos enquanto a página está aberta. TIGR3 tem volatilidade maior; CLT4 sofre pressão negativa às segundas-feiras (dia local do navegador).
- A cada 25 segundos, uma notícia do catálogo ativo impacta uma empresa ou o mercado inteiro. **GERAR CAOS** provoca uma notícia imediatamente. Impactos exibidos são os choques da notícia; a oscilação normal também participa da variação final.
- A carteira mostra quantidade, preço médio ponderado, valor atual e resultado. O dashboard contabiliza saldo mais posições, e lucro/prejuízo em relação aos R$ 10.000 iniciais.
- Desbloqueie sete conquistas, acompanhe o Jornal do Caos e os comentários do Primo do Primo.
- O ícone de pausa suspende a simulação automática; operações e caos manual continuam disponíveis.
- Progresso salvo automaticamente no `localStorage` deste navegador. Não existe sincronização entre dispositivos. Não há simulação retroativa com a página fechada; abas em segundo plano podem ter timers limitados pelo navegador.
- **Reiniciar minha carreira** pede confirmação antes de apagar o progresso. No celular, ajuda e reinício também estão disponíveis no menu do terminal (botões no cabeçalho).

## Verificar

```sh
npm test
npm run build
```

Vitest testa saldo inicial, compras, preço médio, vendas, prejuízo realizado, operações inválidas, todos os eventos, limites de histórico, piso das cotações, comportamento da CLT e conquistas. TypeScript é verificado pelo build. A integração contínua executa testes e build em pull requests e na branch principal.

## Arquitetura

- `src/game/data.ts`: catálogo de empresas, acontecimentos e conquistas.
- `src/game/engine.ts`: regras puras de negociação e simulação, cálculo patrimonial, persistência versionada e conquistas. Pode ser substituído futuramente por serviço de servidor.
- `src/components/Chart.tsx`: gráficos reutilizáveis com Recharts.
- `src/components/useDialogFocus.ts`: foco e navegação de teclado dos diálogos.
- `src/App.tsx`: terminal e telas de mercado, carteira, notícias e conquistas.
- `src/style.css`: Tailwind CSS, identidade visual e layouts responsivos.

O motor de jogo continua no navegador. A integração opcional com Supabase cuida de identidade e ligas; não valida negociações. O estado local não deve ser usado como fonte confiável para competições ou rankings com premiação.

## Publicar no GitHub Pages

O Vite está configurado com `base: '/BOSTA3/'`. No repositório GitHub, em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. Após revisar e integrar as alterações em `main`, o workflow `.github/workflows/deploy.yml` executa `npm ci`, testes e build, e publica `dist/` no Pages. A URL esperada é `https://KvzinNcpx7.github.io/BOSTA3/` (só estará disponível depois do deploy).

Não há rotas de servidor: a navegação é feita no próprio app, sem necessidade de fallback de URLs. Se o repositório for renomeado, atualize o `base` no Vite.

## Expansão: carreiras, empresas e ligas

- **Minha carreira**: cartão de investidor com nome, avatar, cargo, sede, cor e bio; gerador de identidade absurda; nível por XP. Perfil salvo localmente.
- **Missões diárias**: três objetivos com dinheiro fictício e XP, resgate único por missão/dia. Os contadores reiniciam no dia local do navegador. Alterar o relógio ou o save pode afetá-los; não são mecanismos de competição verificada.
- **Dividendos**: a cada 60 ticks automáticos (cerca de cinco minutos em primeiro plano), posições pagam 0,2% do valor atual, até R$ 500 por rodada. Pausar interrompe o relógio. Caos manual não acelera pagamentos.
- **Extrato**: últimas 100 compras, vendas, dividendos, recompensas e aberturas de empresa. Operações feitas na versão anterior não podem ser reconstruídas.
- **IPO de Pote**: até três empresas locais por carreira. Taxa fictícia de R$ 250, ação inicial de R$ 10 e nenhum lote grátis para o fundador. Ativos podem ser comprados e vendidos normalmente.
- **Clube do Boleto**: cadastro/login por e-mail, ligas por convite e ranking recreativo de patrimônio declarado. Implementado com Supabase, mas precisa da configuração descrita em [docs/SUPABASE.md](docs/SUPABASE.md) para ser ativado. Sem configuração, a tela informa a indisponibilidade e o jogo local funciona.
- Saves da primeira versão são migrados automaticamente, preservando carteira e saldo. A chave histórica do jogo original é mantida.

**Não há sincronização de carteira, mercado multiplayer nem validação de resultados no servidor.** As contas identificam os participantes das ligas; os placares são publicados pelo próprio jogador, não automaticamente.

## Testes da expansão

`npm test` também testa resgate único e reinício diário, dividendos e seus limites, migração de saves, histórico, criação/negociação de empresas e formulários interativos em DOM simulado. A migração SQL é executada em PostgreSQL embarcado (PGlite), com testes de isolamento entre contas, ligas por convite e bloqueio de acesso anônimo. Isso não substitui uma verificação em um projeto Supabase real após sua configuração.

## Próximas versões

Mercado compartilhado e operações verificadas pelo servidor, sincronização de saves entre dispositivos, IPOs entre jogadores, eventos globais e competições. A versão atual suporta empresas locais e ligas recreativas, sem premiação ou dinheiro real.

## Modo Resenha Escolar 💀 (v2.1)

A opção **MODO RESENHA ESCOLAR 💀** aparece no terminal e começa desligada. Quando ligada, libera o universo de personagens caricatos e fictícios fornecido para a resenha; não são perfis de pessoas reais. Nenhuma foto, dado pessoal ou áudio externo é utilizado. Desligar oculta conteúdo escolar no jornal e nas conquistas e retira comentários/efeitos escolares ativos, preservando notícias históricas, preços, posições e conquistas já obtidas.

- **72 novas manchetes**: 36 gerais e 36 escolares. O catálogo passa de 42 para 114 eventos; os primeiros 42 IDs, textos e ordem permanecem intactos. O modo geral usa 78 eventos; o escolar usa todos os 114. A seleção evita os seis últimos eventos.
- **48 falas distribuídas por situação**, com Primo do Primo, Fiscal do Serasa Fictício, Diretoria e, no modo escolar, Érika e Iararara. Falas reagem a compras, vendas, prejuízos, ganhos e notícias, evitando repetição em sequência.
- **12 conquistas novas**, somadas às sete originais. Há 17 visíveis no modo geral e 19 no escolar, sempre preservando desbloqueios anteriores. Critérios estão nas descrições das conquistas.
- **Compartilhamento** pelo navegador ou cópia de texto para o clipboard. Cancelamento/falha não conta como compartilhamento. Se o navegador negar ambas as opções, o jornal oferece texto selecionável.
- **Balanços extraordinários** relatam movimentos de pelo menos 12% em uma rodada. São resumos do movimento já aplicado, não um segundo choque.

### Cinco acontecimentos raros

| Evento                     | Disponível | Consequência real                                                                             |
| -------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| O Grande Iararara          | Escolar    | Choques de sinais diferentes em todas as empresas; comunicado por 8s.                         |
| Érika convocou a galera    | Escolar    | FOFO3 +12% no anúncio, maior volatilidade por 40s e comunicados escolares da FOFO3 no jornal. |
| Greve dos investidores CLT | Ambos      | Compras e vendas suspensas por 8s; preços continuam oscilando.                                |
| Priscila comprou tudo      | Escolar    | FOFO3 +14%, BOLO4 +10%, POMBO3 +8% e CLT4 −6%.                                                |
| Crise da cantina           | Escolar    | BOLO4 −22%, SONO3 +7% e demais ativos −6%.                                                    |

A chance é 4,5% nas rodadas que geram notícia, com intervalo mínimo persistido de dois minutos entre especiais. Não há botão público para forçar um especial específico. Fora dos especiais, o comportamento normal permanece. Caos manual não aumenta o relógio dos dividendos.

**Preferências do caos** permite desligar eventos extraordinários, seus efeitos visuais e ativar som. O som é desligado ao reabrir a página e só é desbloqueado por interação explícita; usa dois tons suaves gerados via Web Audio. Os comunicados ficam no painel, sem modal bloqueando a negociação; só a greve suspende ordens temporariamente. Animações respeitam `prefers-reduced-motion`, inclusive nos gráficos.

### Compatibilidade e arquivos

O jogo mantém a versão do save em 2 e a chave `bosta3-game-v1`. Saves v1/v2 recebem somente o campo adicional `resenha`, sem reiniciar carteira, caixa, perfil, XP ou conquistas. Preferências ficam separadas em `bosta3-humor-v1`; reiniciar a carreira não apaga essa preferência. Falha de persistência é informada na interface.

- `src/game/resenhaContent.ts`: notícias, especiais e conquistas novas.
- `src/game/resenha.ts`: preferências, estado adicional, migração tolerante e seleção de eventos.
- `src/game/simulation.ts`: orquestração das rodadas, especiais, expiração e compartilhamentos.
- `src/game/banter.ts` e `src/components/useBanter.ts`: personagens, falas e reações.
- `src/game/engine.ts` e `src/game/data.ts`: integração preservando o catálogo anterior.
- `src/components/ResenhaControls.tsx`, `SpecialNotice.tsx` e `ChaosNews.tsx`: controles, comunicados e jornal.
- `src/services/sound.ts`: alerta sonoro gerado localmente.
- `src/components/Chart.tsx` e `useReducedMotion.ts`: preferência de movimento e IDs únicos dos gráficos.
- `src/App.tsx` e `src/style.css`: integração e visual responsivo.

Nenhuma migração nova de banco, mudança de autenticação, chave, política RLS ou configuração do Supabase é necessária. O workflow e o caminho `/BOSTA3/` do GitHub Pages permanecem iguais. A atualização deve ser revisada pela PR antes da integração em `main`.

Os testes adicionais incluem um catálogo fixo da v2 para verificar IDs/ordem/conteúdo, migração de saves, segregação dos modos, efeitos dos cinco especiais, cooldown/expiração, dividendos, conquistas, preferência persistida, formulário de negociação durante a greve e compartilhamento seguro. Testes de interface usam DOM simulado; não substituem inspeção visual em navegadores reais.
