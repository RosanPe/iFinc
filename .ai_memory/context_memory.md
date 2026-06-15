# Contexto e Decisoes

## Produto

- Aplicativo web pessoal que consolida financas do dia a dia, investimentos e
  evolucao patrimonial em uma unica interface.
- O produto nasce nesta stack web; nao existe sistema anterior, migracao ou legado
  Streamlit/Python.
- A experiencia deve ser mobile first, rapida, acessivel e com baixa friccao para
  registrar transacoes e operacoes.
- BRL e a moeda-base. Visualizacao opcional em USD permanece uma evolucao futura.
- Todo texto visivel da interface deve estar em portugues.

## Escopo Funcional

- Financas: contas e carteiras, cartoes, receitas, despesas, transferencias, tags,
  subcategorias, parcelamentos, recorrencias, orcamentos e fluxo de caixa mensal.
- Cartoes: limite, fechamento, vencimento e consolidacao de faturas futuras.
- Indicadores mensais: receitas, despesas pagas e pendentes, saldo operacional e
  taxa de poupanca.
- Investimentos: renda fixa, acoes, FIIs, ETFs, criptoativos e exterior.
- Posicao: quantidade, preco medio, custo investido, valor de mercado e resultado
  absoluto e percentual.
- Estrategia: metas de alocacao, rebalanceamento e indicacao do proximo aporte.
- Proventos: dividendos, JCP e rendimentos recebidos ou provisionados por mes e ativo.
- Patrimonio: saldo das contas somado ao valor de mercado dos investimentos, com
  historico consolidado.

## Banco e Dominio

- Supabase PostgreSQL, Auth e RLS sao a fonte central de dados e seguranca.
- Todas as tabelas privadas possuem `user_id` relacionado a `auth.users` e politicas
  RLS; filtros no React nao substituem isolamento no banco.
- O projeto Supabase atual e descartavel durante o desenvolvimento local.
- `000_rebuild_public_schema.sql` e a fonte unica atual do schema: apaga `public` com
  `DROP SCHEMA public CASCADE` e recria tabelas, funcoes, triggers, grants e RLS.
- A migration-base foi aplicada pelo usuario no Supabase hospedado em 14 de junho de
  2026. Alteracoes posteriores devem ser avaliadas como migrations incrementais.
- O reset preserva `auth.users` e faz backfill de perfis e categorias basicas.
- Depois que houver ambiente persistente ou producao, evolucoes voltam a usar
  migrations incrementais sem reescrever historico aplicado.
- Cartoes permanecem em `credit_cards`, separados de `accounts`, devido ao ciclo de
  limite, fechamento e vencimento.
- Os nomes canonicos existentes sao `investment_operations` para operacoes e
  `investment_income` para proventos; nao duplicar como `asset_operations` ou
  `earnings` apenas para reproduzir nomes conceituais do produto.
- Parcelas sao transacoes materializadas e agrupadas por `installment_group_id`,
  facilitando consultas mensais e auditoria.
- Saldos, posicoes e preco medio sao derivados das operacoes. Snapshots patrimoniais
  guardam somente pontos historicos consolidados.
- Tabelas e contratos devem continuar estruturados para futura inclusao de registros
  produzidos por um interpretador de linguagem natural.

## Frontend e UX

- A navegacao principal usa bottom bar: Dashboard, Financas, Investimentos e IA/Aportes.
- O FAB de novo registro deve permanecer acessivel nos fluxos autenticados.
- Cards principais exibem patrimonio total, saldo em contas, valor investido e
  resultado mensal.
- Graficos devem funcionar em telas verticais sem overflow horizontal.
- O dashboard deve possuir um grafico geral mes a mes no estilo de serie financeira,
  combinando barras de receitas/despesas/saldo e linha de patrimonio liquido.
- O grafico geral deve oferecer periodos `6M`, `1A`, `5A`, `10A` e `Tudo`. Selecionar
  um mes por clique, toque ou teclado abre seu consolidado financeiro e patrimonial.
- Meses com variacao relevante devem ter destaque acessivel e explicacao no
  consolidado, sem usar somente cor como indicador.
- O grafico geral, seletores de periodo e consolidado mensal foram implementados.
  Cards do dashboard e do resumo financeiro abrem detalhes mantendo o mes escolhido.
- Selecionar um mes no grafico abre um card modal responsivo com o consolidado, que
  fecha por botao, clique externo ou `Esc`. O grafico possui linha propria para a
  evolucao dos investimentos, e o modal exibe o valor investido do snapshot mensal.
- A aplicacao possui skip link, error boundary autenticado, retry de consultas, aviso
  offline e contencao global de overflow horizontal.
- Tema claro/escuro acompanha inicialmente a preferencia do sistema.
- O dashboard inicial usa dados mockados ate a integracao autenticada dos repositorios.

## Estado Atual Confirmado

- Next.js 16.2.9, React 19.2.7, Tailwind CSS 4.3.1 e pnpm 11 compoem a base instalada.
- O shell possui header, tema, bottom navigation, FAB e dashboard inicial mockado.
- O cliente browser-side do Supabase e o exemplo de variaveis de ambiente existem.
- O repositorio de deploy e `git@github.com:RosanPe/iFinc.git`.
- `NEXT_PUBLIC_BASE_PATH` fica vazio localmente e usa `/iFinc` no GitHub Actions.
- O deploy do Pages parte da branch `main` e publica a exportacao estatica `out/`
  somente depois de lint, TypeScript, testes e build passarem.
- A rota raiz usa redirecionamento client-side para `/dashboard/`, pois redirects de
  servidor exportados pelo Next nao sao executados pelo GitHub Pages.
- Login, cadastro, recuperacao, redefinicao de senha, persistencia de sessao e protecao
  das rotas internas foram implementados no client-side.
- O cadastro cria perfil e categorias padrao por trigger no Supabase.
- `.env.local` foi criado a partir das chaves publicas locais, permanece ignorado pelo
  Git e usa permissao `600`.
- A tela Financas possui CRUD real de contas, cartoes, categorias, subcategorias e
  tags, com estados de carregamento, vazio, sucesso e erro.
- A Fase 3 foi implementada com resumo mensal, lancamentos, transferencias,
  parcelamentos, faturas, recorrencias e orcamentos conectados ao Supabase.
- A Fase 4 foi iniciada com CRUD de classes e ativos, registro de compras e vendas,
  carteira consolidada, preco medio, custo, resultado realizado e resultado em aberto.
- A Fase 4 foi concluida com proventos, metas por classe ou ativo, sugestao do proximo
  aporte, grafico de distribuicao, patrimonio consolidado, snapshots e evolucao.
- O dashboard inclui investimentos em BRL e faturas pendentes no patrimonio total.
- Graficos locais em SVG/CSS foram escolhidos para evitar dependencia e preservar o
  build estatico.
- brapi.dev, Alpha Vantage e CoinGecko foram avaliados em 14 de junho de 2026. Nenhum
  foi integrado porque o frontend estatico nao pode proteger tokens; cotacao manual
  permanece a estrategia vigente.
- Operacoes sao validadas cronologicamente no client-side para impedir venda acima da
  posicao e exclusao de compra que invalide vendas posteriores.
- O dashboard deixou de usar mocks financeiros e calcula saldos, receitas, despesas,
  pendencias e taxa de poupanca com os registros reais.
- Compras parceladas dividem centavos sem perda e criam uma linha por competencia.
- Faturas usam a competencia do vencimento; marcar a fatura como paga reduz a conta
  vinculada ao cartao por calculo derivado, sem duplicar lancamentos.
- Recorrencias sao geradas automaticamente ao abrir Financas e manualmente pela tela.
- Vitest 4.1.8 foi adotado. As suites de dominio e repositorios possuem 28 testes
  automatizados.
- Em 14 de junho de 2026, lint, TypeScript e build estatico passaram com todas as
  rotas prerenderizadas. O acesso anonimo a `accounts` retornou HTTP 401.
- A validacao RLS autenticada automatica continua pendente: o endpoint Auth nao
  respondeu mesmo fora do sandbox. Usar dois usuarios existentes no SQL Editor.
- Em handlers `submit` assincronos, capturar `const formElement = event.currentTarget`
  antes do primeiro `await`. Recarregamentos de estado podem desmontar o formulario e
  tornar `event.currentTarget` nulo antes de chamar `reset()`.
- A exclusao de recorrencias foi corrigida: ocorrencias historicas sao desvinculadas
  e preservadas, evitando o bloqueio da FK `transactions_recurring_user_fk`.
- Recorrencias, orcamentos e faturas exibem erros de repositorio na propria tela;
  nenhum desses CRUDs deixa rejeicoes escaparem para o error boundary do Next.js.
- O acesso anonimo ao endpoint `accounts` retornou HTTP 401, confirmando que a tabela
  nao esta publica.
- `supabase/tests/rls_isolation.sql` valida isolamento entre dois usuarios Auth em
  transacao e termina com rollback. A execucao remota exige dois usuarios existentes.
- `types/database.types.ts` cobre as 16 tabelas e os enums da migration-base.
- `docs/project-structure.md` define a estrutura esperada e deve orientar novos modulos.
- Neste ambiente, comandos pnpm podem usar o store `/tmp/pnpm-store`.
- Quando o store do pnpm nao estiver acessivel, usar os binarios em
  `node_modules/.bin` para lint, TypeScript e build.
- O pnpm 11 exige `allowBuilds` booleano em `pnpm-workspace.yaml`; `sharp` e
  `unrs-resolver` sao autorizados porque fazem parte da cadeia de build do Next.js.
- ESLint permanece na linha 9 enquanto a configuracao atual do Next for incompativel
  com ESLint 10.
- Nao usar `next/font` com fontes remotas: o build estatico deve funcionar offline.

## Riscos Conhecidos

- GitHub Pages nao oferece backend, protecao de segredos, SSR ou rotas de servidor.
- Apenas URL e chave publishable do Supabase podem estar no cliente.
- Qualquer variavel `NEXT_PUBLIC_*` e publica.
- Uma chave Gemini no frontend pode sofrer abuso. A integracao futura exige decisao
  explicita sobre cotas, restricoes de chave ou um backend seguro separado.
- Cotacoes de mercado exigirao uma fonte gratuita compativel com aplicacao estatica,
  limites de uso e politicas de CORS.
- Chamadas de cadastro Auth feitas pelo ambiente Codex ficaram sem resposta mesmo
  com rede liberada; nao assumir falha do Supabase sem reproduzir no navegador local.

## Segredos

- `.supabaseSecret/secrets.toml` e configuracao local sensivel.
- Nunca exibir, versionar ou copiar segredos para codigo cliente ou memoria.
