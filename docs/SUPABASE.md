# Ligar o Clube do Boleto

O site continua no GitHub Pages. O Supabase fornece login e banco para as ligas. Sem configuração, a interface explica que o clube ainda não abriu; o jogo local funciona normalmente.

## 1. Criar o projeto

1. Entre em https://supabase.com/dashboard e crie uma conta/projeto.
2. Guarde a senha do banco em seu gerenciador. Ela **não** vai no site nem no GitHub.
3. Espere o projeto terminar de iniciar.

## 2. Instalar o banco

1. No projeto Supabase, abra **SQL Editor → New query**.
2. Copie o conteúdo completo de `supabase/migrations/001_clube_do_boleto.sql` deste repositório.
3. Clique em **Run** uma vez. O arquivo cria tabelas, políticas de acesso e funções para criar/entrar em ligas e consultar ranking.

O SQL é uma migração inicial: não execute novamente em um banco já configurado. Não desative RLS. Não use banco com outros projetos/tabelas de mesmo nome sem revisar a migração.

## 3. Configurar o login

1. Em **Authentication → Providers**, habilite **Email**. Deixe a confirmação de e-mail habilitada.
2. Em **Authentication → URL Configuration**, defina **Site URL** como `https://kvzinncpx7.github.io/BOSTA3/`.
3. Adicione essa mesma URL em **Redirect URLs**. Para desenvolvimento, adicione `http://localhost:5173/BOSTA3/`.
4. Para uso com muitos jogadores, configure SMTP próprio em Authentication; o envio padrão do Supabase tem limites.

## 4. Configurar o GitHub

1. No Supabase, em **Project Settings → API** (ou no diálogo **Connect**), copie a **Project URL** e a chave **publishable** ou **anon**.
2. No GitHub, abra **BOSTA3 → Settings → Secrets and variables → Actions → Variables → New repository variable**.
3. Crie:
   - `VITE_SUPABASE_URL`: a URL do projeto.
   - `VITE_SUPABASE_ANON_KEY`: a chave pública publishable/anon.
4. Na aba **Actions**, abra **Validate and deploy Pages → Run workflow → main → Run workflow** para reconstruir e publicar o site com a configuração.

Essas duas variáveis são públicas e entram no JavaScript do navegador. **Nunca cole senha do banco, chave secret ou `service_role`**. A segurança do banco depende das políticas RLS e funções da migração, não do sigilo da chave pública.

Localmente: copie `.env.example` para `.env.local`, preencha os dois valores e reinicie `npm run dev`. `.env.local` está ignorado pelo Git.

## 5. Testar entre amigos

1. Abra **Clube do Boleto → Abrir conta**, cadastre e confirme seu e-mail.
2. Entre com e-mail e senha. Personalize sua identidade em **Minha carreira**.
3. Crie uma liga. Seu placar inicial é publicado ao criar ou entrar em uma liga.
4. Clique em **Copiar convite** e envie o link a um amigo. O link abre o clube com o código preenchido.
5. Seu amigo cria uma conta, confirma o e-mail, entra e usa o código.
6. Cada jogador usa **Publicar meu placar atual** para atualizar seu resultado; use atualizar ranking para ver novos placares.

Somente membros podem consultar o ranking de uma liga. Contas diferentes não podem editar o perfil/placar de outras pessoas nem entrar em liga sem o código. Convites dão acesso à liga: compartilhe somente com quem deseja convidar. Ranking mostra até 100 participantes ordenados por patrimônio, XP e ID para desempate estável.

## Limites desta etapa

- O ranking é **recreativo e autodeclarado**. Dinheiro e operações continuam no navegador, que pode ser alterado pelo jogador. Não há premiação, competição financeira ou proteção contra trapaça nos resultados enviados. Uma competição verificada exige motor de jogo no servidor.
- Login identifica o jogador no clube; **não sincroniza a carteira** nem o perfil local entre dispositivos.
- Perfis enviados ao clube compartilham nome de pregão, avatar, cargo, patrimônio e XP somente nos rankings das ligas em comum. E-mail não aparece no ranking.
- Empresas criadas pelo jogador ficam no mercado local. IPOs compartilhados, eventos globais e negociação multiplayer ainda exigem um mercado no servidor.
- Reiniciar a carreira local não apaga o placar já publicado. Publique novamente para atualizá-lo. O dono pode remover uma conta e seus dados por **Supabase → Authentication → Users → Delete user**; tabelas usam exclusão em cascata.
- Testes locais verificam a migração e isolamento entre membros com PostgreSQL embarcado (PGlite). A ativação real, confirmação de e-mail e envio SMTP precisam ser conferidos depois de configurar seu projeto.
