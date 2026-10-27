# BOSTA3 📉

**A Bolsa Oficial dos Memes Brasileiros.** Seu dinheiro não rende. Ele vira entretenimento.

Primeira versão jogável de um simulador satírico. Todo dinheiro, empresa, notícia e investimento é fictício. Não usa APIs financeiras, dinheiro real, apostas ou recomendações de investimento.

## Executar

Requer Node.js 22+ e npm.

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
- A cada 25 segundos, uma das 34 notícias impacta uma empresa ou o mercado inteiro. **GERAR CAOS** provoca uma notícia imediatamente. Impactos exibidos são os choques da notícia; a oscilação normal também participa da variação final.
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

Sem backend, autenticação, credenciais ou integrações externas. O estado local não deve ser usado como fonte confiável para competições ou rankings.

## Publicar no GitHub Pages

O Vite está configurado com `base: '/BOSTA3/'`. No repositório GitHub, em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. Após revisar e integrar as alterações em `main`, o workflow `.github/workflows/deploy.yml` executa `npm ci`, testes e build, e publica `dist/` no Pages. A URL esperada é `https://KvzinNcpx7.github.io/BOSTA3/` (só estará disponível depois do deploy).

Não há rotas de servidor: a navegação é feita no próprio app, sem necessidade de fallback de URLs. Se o repositório for renomeado, atualize o `base` no Vite.

## Próximas versões

Contas, multiplayer, ranking entre amigos, empresas criadas por jogadores, IPOs, eventos globais, competições e perfis personalizados. Essas funções exigem backend, identidade e validação das operações no servidor; estão fora desta versão.
