# Estrutura do Projeto Next.js

Estrutura recomendada para o App Router com exportacao estatica e acesso ao Supabase
exclusivamente pelo navegador.

```text
ProjetoiFin/
|-- app/
|   |-- (auth)/
|   |   |-- login/page.tsx
|   |   |-- cadastro/page.tsx
|   |   |-- recuperar-senha/page.tsx
|   |   `-- redefinir-senha/page.tsx
|   |-- (app)/
|   |   |-- dashboard/page.tsx
|   |   |-- financas/page.tsx
|   |   |-- investimentos/page.tsx
|   |   `-- assistente/page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- auth/
|   |-- app-shell/
|   |   |-- app-header.tsx
|   |   |-- bottom-navigation.tsx
|   |   `-- floating-action-button.tsx
|   |-- finance/
|   |-- investments/        # carteira, operacoes, proventos, estrategia e patrimonio
|   |-- charts/             # rosca, linha e historico combinado responsivos
|   |-- forms/
|   `-- ui/
|-- hooks/
|   |-- use-finance-catalogs.ts
|   `-- use-recurring-generation.ts
|-- lib/
|   |-- domain/
|   |   |-- finance/
|   |   `-- investments/    # posicoes, preco medio e resultados
|   |-- repositories/
|   |   |-- transactions-repository.ts
|   |   |-- recurring-transactions-repository.ts
|   |   |-- budgets-repository.ts
|   |   |-- assets-repository.ts
|   |   |-- investment-operations-repository.ts
|   |   |-- investment-income-repository.ts
|   |   |-- investment-targets-repository.ts
|   |   `-- net-worth-snapshots-repository.ts
|   |-- supabase/
|   |   `-- client.ts
|   |-- formatters.ts
|   `-- utils.ts
|-- stores/
|-- types/
|   |-- database.types.ts
|   `-- domain.ts
|-- public/
|   |-- icons/
|   `-- manifest.webmanifest
|-- supabase/
|   |-- migrations/000_rebuild_public_schema.sql
|   `-- tests/
|       |-- rls_isolation.sql
|       `-- crud_smoke.sql
|-- tests/
|   |-- finance/
|   `-- investments/
|-- .ai_memory/
|-- .env.local.example
|-- components.json
|-- next.config.ts
|-- package.json
|-- postcss.config.mjs
|-- tailwind.config.ts
`-- tsconfig.json
```

## Responsabilidades

- `app/`: composicao de rotas e layouts. As paginas publicadas devem ser estaticas.
- `components/`: interface reutilizavel, separada por dominio.
- `components/auth/`: contexto de sessao, protecao de rotas e formularios Auth.
- `lib/domain/`: calculos puros, sem React ou Supabase.
- `lib/domain/finance/`: datas, parcelamentos, saldos, recorrencias, orcamentos e
  consolidacao mensal.
- `lib/domain/investments/`: posicoes derivadas, preco medio, custo e resultados de
  compras e vendas, alocacao, aporte e patrimonio consolidado.
- `components/charts/`: visualizacoes locais sem dependencia externa, acessiveis e
  compativeis com exportacao estatica.
- `lib/domain/finance/history.ts`: serie mensal, periodos, variacoes e meses atipicos.
- `lib/repositories/`: consultas client-side e mapeamento entre banco e dominio.
- Cada cadastro persistente possui repositorio proprio; componentes nao acessam
  `.from(...)` diretamente.
- `lib/supabase/client.ts`: unica fabrica do cliente browser do Supabase.
- `stores/`: estado global estritamente necessario; estado local permanece nos componentes.
- `types/database.types.ts`: contrato tipado do schema aplicado; migrar para geracao
  automatica pelo Supabase CLI quando o projeto for vinculado ao CLI.
- `tests/`: testes de preco medio, vendas, parcelamento, faturas, recorrencias e
  consolidacao.
- `tests/finance/`: suite Vitest das regras financeiras, independente de rede.
- `supabase/migrations/000_rebuild_public_schema.sql`: reset destrutivo e criacao
  integral do schema da aplicacao; apaga todos os dados de `public` quando executado.
- `supabase/tests/rls_isolation.sql`: teste transacional de isolamento entre dois
  usuarios Auth; termina com rollback e nao persiste os registros de teste.
- `supabase/tests/crud_smoke.sql`: percorre criacao, leitura, atualizacao e exclusao
  das tabelas de dominio, respeita as dependencias e termina com rollback.

## Restricoes do Build Estatico

- Configurar `output: "export"` em `next.config.ts`.
- Nao usar Server Actions, Route Handlers, middleware dependente de servidor ou SSR.
- Componentes que acessam autenticacao, estado do navegador ou Supabase devem usar
  `"use client"`.
- Imagens do `next/image` devem usar `unoptimized: true` ou um loader compativel.
- `basePath` e `assetPrefix` dependem do nome final do repositorio no GitHub Pages.
- Somente a URL e a chave publishable do Supabase podem usar prefixo `NEXT_PUBLIC_`.
