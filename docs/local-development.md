# Desenvolvimento Local

## Preparacao

1. Use Node.js 20.9 ou superior e pnpm 11.
2. Execute `pnpm install`.
3. Crie `.env.local` a partir de `.env.local.example`.
4. Mantenha `NEXT_PUBLIC_BASE_PATH` vazio localmente.
5. Execute a migration-base no SQL Editor de um projeto Supabase descartavel.

## Supabase

O navegador acessa diretamente o Supabase com URL e chave publishable. Auth e RLS
sao obrigatorios. A migration `000_rebuild_public_schema.sql` apaga e recria todo o
schema `public`; nao deve ser reaplicada sobre dados que precisem ser preservados.

Para recuperacao de senha, configure a URL local abaixo nas Redirect URLs do Auth:

```text
http://localhost:3000/redefinir-senha/
```

No deploy do GitHub Pages, use tambem:

```text
https://rosanpe.github.io/iFinc/redefinir-senha/
```

## Execucao

```bash
pnpm dev
```

Rotas principais:

- `/dashboard/`: consolidado, grafico historico e detalhes mensais.
- `/financas/`: lancamentos, faturas, recorrencias, orcamentos e cadastros.
- `/investimentos/`: carteira, operacoes, proventos, estrategia e patrimonio.

## Verificacao

```bash
pnpm lint
pnpm test
pnpm build
```

O build precisa listar todas as rotas como estaticas. Testes de dominio nao dependem
de React, navegador ou rede.

## Deploy

O push na branch `main` aciona `.github/workflows/deploy-pages.yml`, que repete lint,
TypeScript, testes e build antes de publicar `out/`. O repositorio deve usar GitHub
Actions como fonte do Pages e possuir os secrets `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Seguranca

- Nao exponha `service_role` ou secrets no frontend.
- Nao desative RLS para contornar erros de acesso.
- Execute `supabase/tests/rls_isolation.sql` com dois usuarios Auth antes de publicar.
- Nao registre valores de `.env.local` ou `.supabaseSecret` em documentacao e logs.

## Modo Offline

O modo degradado preserva apenas dados ja presentes no estado da pagina. Nao ha cache
persistente ou sincronizacao de mutacoes. Ao recuperar a conexao, use o botao de retry
quando uma consulta tiver falhado.
