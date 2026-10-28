# Ligar o Clube do Boleto

O site continua no GitHub Pages. O Supabase fornece login, banco para as ligas e saves privados entre aparelhos. Sem configuração, a interface explica que o clube ainda não abriu; o jogo local funciona normalmente.

## 1. Criar o projeto

1. Entre em https://supabase.com/dashboard e crie uma conta/projeto.
2. Guarde a senha do banco em seu gerenciador. Ela **não** vai no site nem no GitHub.
3. Espere o projeto terminar de iniciar.

## 2. Instalar o banco

1. No projeto Supabase, abra **SQL Editor → New query**.
2. Copie o conteúdo completo de `supabase/migrations/001_clube_do_boleto.sql` deste repositório.
3. Clique em **Run** uma vez. O arquivo cria tabelas, políticas de acesso e funções para criar/entrar em ligas e consultar ranking.

Para ativar a carreira entre aparelhos, execute também `supabase/migrations/002_private_cloud_saves.sql` em uma nova consulta. Se as ligas já funcionam, execute **somente a 002**; não repita a 001.

O SQL 001 é uma migração inicial: não execute novamente em um banco já configurado. Não desative RLS. Não use banco com outros projetos/tabelas de mesmo nome sem revisar a migração.

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
- Login identifica o jogador no clube e em Minha carreira. A carteira e o perfil podem ser sincronizados privadamente após instalar a migração 002 e ativar a nuvem.
- Perfis enviados ao clube compartilham nome de pregão, avatar, cargo, patrimônio e XP somente nos rankings das ligas em comum. E-mail não aparece no ranking.
- Empresas criadas pelo jogador ficam no mercado local. IPOs compartilhados, eventos globais e negociação multiplayer ainda exigem um mercado no servidor.
- Reiniciar a carreira local não apaga o placar já publicado. Publique novamente para atualizá-lo. O dono pode remover uma conta e seus dados por **Supabase → Authentication → Users → Delete user**; tabelas usam exclusão em cascata.
- Testes locais verificam a migração e isolamento entre membros com PostgreSQL embarcado (PGlite). A ativação real, confirmação de e-mail e envio SMTP precisam ser conferidos depois de configurar seu projeto.

## Convites durante a confirmação de e-mail

O site agora aceita tanto o código quanto o link completo de convite no formulário. O código pendente fica guardado por até sete dias neste navegador, de forma que você pode confirmar o e-mail, voltar e entrar na liga depois. A entrada sempre exige confirmação no botão do formulário; login não inscreve ninguém automaticamente.

O retorno do cadastro inclui a URL do Pages e, quando houver, o parâmetro `clube`. Se quiser preservar o link completo em confirmações abertas em outro dispositivo, confira que a allowlist de Redirect URLs do Supabase aceita a rota de retorno com query (por exemplo, o padrão específico do projeto `https://kvzinncpx7.github.io/BOSTA3/**`). A aplicação não altera essa configuração automaticamente. No mesmo navegador, o convite local continua disponível mesmo se o serviço retornar à Site URL sem a query.

O aviso de confirmação é limpo após autenticação, inclusive com respostas atrasadas do cadastro. Nenhum esquema SQL ou política RLS adicional é necessário para essas correções. Recordes, chat de NPCs e segredos continuam locais; os campos enviados ao ranking existente permanecem os mesmos.


## Continuar a carreira no PC e no celular

1. Após instalar a migração **002_private_cloud_saves.sql** e revisar/publicar a versão, abra **Minha carreira**.
2. Entre ou crie a conta com o mesmo e-mail e senha usados nas ligas. Não é uma segunda conta.
3. No aparelho onde está seu progresso, clique **Ativar nuvem com esta carreira**.
4. Aguarde a confirmação do save. O automático roda a cada 15 segundos enquanto a página estiver aberta; **Salvar agora** permite confirmar antes de sair.
5. No outro aparelho, faça login e escolha **Continuar carreira da nuvem**. Não escolha substituir a nuvem pela carteira vazia do aparelho novo.

Toda sessão pede uma escolha antes de associar a carreira local à conta. Saves não são combinados e não há ganhos simulados enquanto o jogo está fechado. Use um aparelho por vez. Caso dois aparelhos salvem, a revisão atômica recusa a gravação atrasada e pede uma nova escolha, preservando a carteira local. Uma falha de rede para o automático e permite rever os saves ao reconectar. Não há promessa de envio ao fechar a aba: aguarde **Salvar agora**.

Antes de recuperar a nuvem, a cópia local vai para `bosta3-before-cloud-v1` no navegador. Antes de substituir um save remoto, ele vai para `bosta3-cloud-before-replace-v1`. Há também download JSON da carreira local. O save principal continua em `bosta3-game-v1`; nenhum save existente é apagado. Esses backups são locais e não substituem a sincronização. Sair da conta não apaga a cópia local: evite aparelhos compartilhados.

### Privacidade e segurança

A nova tabela `game_saves` é separada de `players`, `clubs` e `club_members`. Só o dono autenticado lê sua linha, inclusive quando está na mesma liga de outra pessoa. Escritas diretas são negadas; `save_game` verifica a identidade e a revisão esperada atomicamente. A migração é aditiva e pode ser repetida sem apagar saves. Não necessita chave privada, service_role ou novas variáveis públicas.

A nuvem guarda a carteira fictícia, perfil, ações, XP, operações, conquistas, histórico e resenha. Não envia sessões, senhas, e-mail da autenticação ou convites. É um save de jogo editável no cliente, sem integridade competitiva; não atualiza automaticamente o ranking das ligas. As preferências de som e movimento continuam próprias de cada aparelho.

Se aparecer o aviso da migração 002, o SQL ainda não foi instalado ou a API não reconheceu a função/tabela. Execute o arquivo completo no SQL Editor e tente novamente. O jogo local continua funcionando mesmo com essa configuração pendente.
