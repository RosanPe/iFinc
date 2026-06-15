# Arquitetura do Sistema

## Fundamentos

- Projeto greenfield: nao existe migracao, sistema anterior ou legado Streamlit/Python.
- Frontend mobile first em Next.js 16, React 19 e TypeScript.
- App Router com exportacao estatica obrigatoria por `output: "export"`.
- Gerenciador de pacotes: pnpm 11, com `pnpm-lock.yaml` versionado.
- Scripts de instalacao permitidos ficam explicitamente limitados a `sharp` e
  `unrs-resolver` por `allowBuilds` em `pnpm-workspace.yaml`.
- Hospedagem do frontend: GitHub Pages.
- Repositorio de deploy: `RosanPe/iFinc`, publicado sob o base path `/iFinc`.
- O workflow de Pages valida lint, TypeScript, testes e build antes de publicar `out/`.
- O CI usa Node.js 22 e pnpm 11.3.0 com lockfile congelado.
- Backend/BaaS: Supabase para PostgreSQL, Auth e persistencia.
- Seguranca: RLS por usuario em todas as tabelas privadas.

## Limites do Build Estatico

- Acesso a autenticacao e dados ocorre diretamente no navegador pelo Supabase JS SDK.
- Componentes que dependem do navegador, Auth, estado ou Supabase usam `"use client"`.
- Nao usar SSR, Server Actions, middleware dependente de servidor ou rotas `/api/*`.
- Server Components puramente estaticos podem compor layout e conteudo sem acesso a
  dados privados ou APIs de servidor.
- Imagens do `next/image` usam `unoptimized: true` ou loader compativel com exportacao.
- O build de producao usa `next build --webpack` pela compatibilidade com o ambiente.
- `basePath` e `assetPrefix` sao configurados por `NEXT_PUBLIC_BASE_PATH`.
- No GitHub Actions, `NEXT_PUBLIC_BASE_PATH` e fixado em `/iFinc`. A URL usa o
  secret `NEXT_PUBLIC_SUPABASE_URL`; o secret `SUPABASE_PUBLISHABLE_KEY` e mapeado
  para `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` durante o build.
- O Pages deve ser habilitado manualmente com **GitHub Actions** como fonte. O
  `GITHUB_TOKEN` do workflow nao pode usar `configure-pages` com `enablement: true`.

## Interface e Design System

- Tailwind CSS 4 como base de estilos.
- Shadcn/ui e Radix Primitives para componentes acessiveis.
- `next-themes` para tema claro/escuro com preferencia inicial do sistema.
- Lucide React para iconografia.
- Visual minimalista: tons slate, bordas discretas, tipografia limpa e cards.
- Interface sem overflow horizontal, com alvos de toque adequados e navegacao inferior.
- Bottom navigation: Dashboard, Financas, Investimentos e IA/Aportes.
- FAB global para adicionar transacao ou operacao com baixa friccao.
- Graficos responsivos usam componentes locais em SVG/CSS, sem biblioteca externa:
  rosca para alocacao, linha para evolucao patrimonial e grafico combinado mensal.
- O grafico geral usa barras para receitas, despesas e saldo, linhas para patrimonio
  e investimentos, periodos de 6 meses a todo o historico e selecao acessivel por
  mes que abre um consolidado modal.

## Estrutura de Codigo

- `docs/project-structure.md` e a fonte de verdade para pastas e responsabilidades.
- `app/`: rotas e layouts estaticamente exportaveis.
- `components/app-shell/`: header, bottom navigation, tema e FAB.
- `components/finance/`: interface do dominio financeiro.
- `components/investments/`: interface do dominio de investimentos.
- `components/charts/`: visualizacoes responsivas compartilhadas.
- `components/forms/`: formularios compartilhados ou entre dominios.
- `components/ui/`: primitives Shadcn compartilhados.
- `hooks/`: hooks reutilizaveis de interface e dados.
- `lib/domain/`: regras e calculos puros, sem React ou Supabase.
- `lib/repositories/`: acesso client-side e mapeamento banco-dominio.
- `lib/supabase/client.ts`: unica fabrica do cliente browser do Supabase.
- `stores/`: apenas estado global necessario; preferir estado local quando suficiente.
- `types/database.types.ts`: espelha integralmente a migration-base aplicada. Quando o
  projeto for vinculado ao Supabase CLI, substituir pela geracao oficial automatica.
- `tests/`: testes de regras financeiras, investimentos e consolidacao patrimonial.

## Estado e Dados

- Preferir estado local, hooks especificos e Zustand somente quando houver estado
  global real entre rotas ou dominios.
- O Supabase e a fonte de verdade persistente; stores nao duplicam dados sem estrategia
  explicita de cache e sincronizacao.
- O modo offline e somente degradado: preserva estado ja carregado, informa perda de
  conectividade e oferece retry. Nao existe cache persistente ou fila de mutacoes.
- Enums permanecem em ingles no banco e sao traduzidos na interface.
- Repositorios encapsulam consultas Supabase e retornam tipos de dominio.
- Cadastros basicos usam repositorios separados em `lib/repositories/`; componentes
  nao fazem consultas Supabase diretamente.
- Regras de parcelamento, fatura, recorrencia, preco medio, alocacao e consolidacao
  ficam em funcoes puras de `lib/domain/`.
- Posicoes de investimentos sao derivadas cronologicamente de `investment_operations`.
  Taxas de compra compoem o custo; taxas de venda reduzem o resultado realizado;
  vendas acima da quantidade disponivel sao rejeitadas no dominio e na interface.
- Metas de alocacao aceitam classe ou ativo. A sugestao de aporte distribui o valor
  informado proporcionalmente aos deficits em relacao aos percentuais desejados.
- Patrimonio consolidado soma contas e investimentos em BRL e desconta compras de
  cartao pendentes. Ativos em outra moeda ficam fora do consolidado ate existir cambio.
- Snapshots patrimoniais sao idempotentes por usuario e data via `upsert`.
- Vitest e a suite de testes TypeScript; regras financeiras ficam em
  `tests/finance/` e regras de investimentos em `tests/investments/`; ambas devem
  rodar sem Supabase ou React.
- Durante a fase local e descartavel, `000_rebuild_public_schema.sql` recria todo o
  schema `public`. O arquivo e destrutivo e deve declarar esse risco no cabecalho.
- Quando o Supabase deixar de ser descartavel, congelar a migration-base aplicada e
  fazer todas as alteracoes futuras em migrations incrementais.
- `investment_operations` e `investment_income` sao nomes canonicos do schema atual.
- Posicoes e saldos sao derivados; `net_worth_snapshots` armazena historico consolidado.
- Parcelamentos sao materializados em `transactions` e ligados por
  `installment_group_id`.
- A competencia do cartao representa o mes real de vencimento da fatura. Compras
  posteriores ao fechamento avancam mais um ciclo.
- Pagamentos de fatura mudam as compras para `paid`; o saldo da conta vinculada ao
  cartao e derivado dessas compras pagas, sem criar uma segunda despesa.
- Recorrencias vencidas sao materializadas no client-side ao abrir Financas e tambem
  podem ser geradas manualmente. A consulta previa evita ocorrencias duplicadas.
- Excluir uma recorrencia preserva as transacoes materializadas: o repositorio limpa
  `recurring_transaction_id` e `recurrence_date` antes de remover a regra.
- Erros de CRUD nao devem escapar de handlers de interface. Modulos exibem feedback
  local; bloqueios `23503` continuam intencionais para cadastros referenciados.

## Seguranca

- Usar somente URL e chave publishable do Supabase em variaveis `NEXT_PUBLIC_*`.
- Nunca expor `service_role`, secret keys ou credenciais administrativas.
- Considerar todo valor `NEXT_PUBLIC_*` publicamente inspecionavel.
- RLS deve validar `auth.uid() = user_id` e relacionamentos privados aplicaveis.
- Validar isolamento real com pelo menos dois usuarios antes do deploy.
- `AuthProvider` restaura e acompanha a sessao; `AuthGuard` protege as rotas internas.
- O perfil e as categorias iniciais sao criados por trigger apos cadastro no Auth.
- Testes de RLS ficam em `supabase/tests/` e devem ser transacionais, terminar com
  rollback e nunca depender de `service_role` no frontend.
- `supabase/tests/crud_smoke.sql` percorre CRUDs das tabelas de dominio com um usuario
  autenticado, respeita a ordem das chaves estrangeiras e termina com rollback.

## Integracao Futura de IA

- O sistema deve aceitar futuramente JSON estruturado para transacoes, parcelamentos
  e operacoes de ativos sem alterar os contratos centrais de dominio.
- A integracao planejada e com o SDK oficial `@google/genai`.
- Nao implementar chave secreta Gemini diretamente no cliente sem avaliacao formal de
  abuso, cotas e restricoes.
- Se um segredo real for necessario, adotar backend gratuito separado ou rever a
  restricao de hospedagem estatica mediante decisao arquitetural registrada.

## Restricoes

- Priorizar infraestrutura gratuita.
- Nao introduzir backend Node implicito no Next.js.
- Nao adotar recursos incompativeis com GitHub Pages.
- Nao criar referencias, tarefas ou codigo de migracao de sistemas inexistentes.
- Cotacoes permanecem manuais. Nao expor tokens de provedores de mercado no frontend;
  a avaliacao vigente esta em `docs/market-data-evaluation.md`.
