# Estado de Validacao

Ultima verificacao: 15 de junho de 2026.

## Local

- Suite Vitest de regras financeiras e investimentos.
- TypeScript sem emissao.
- ESLint.
- Build estatico com Webpack e geracao de todas as rotas.
- Build de Pages validado com `NEXT_PUBLIC_BASE_PATH=/iFinc`.
- Raiz, login e asset estatico responderam HTTP 200 sob `/iFinc/` em servidor local.
- Commit inicial enviado para `RosanPe/iFinc` na branch `main`.

## Supabase Hospedado

- Acesso anonimo a `accounts`: HTTP 401, bloqueio confirmado.
- Tentativa automatizada com dois usuarios temporarios: sem sessoes criadas.
- Consulta adicional ao Auth: endpoint permaneceu sem resposta e a tentativa foi
  encerrada. Esse comportamento ja havia sido observado neste ambiente.

## Pendente Externo

Executar `supabase/tests/rls_isolation.sql` no SQL Editor com dois usuarios Auth
existentes e validar os fluxos de interface em um navegador autenticado. Nao considerar
a ausencia de resposta do cadastro automatizado como falha confirmada do Supabase.

No GitHub, cadastrar `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como Actions secrets, selecionar GitHub Actions
como fonte do Pages e confirmar o workflow e a URL de producao. Essas configuracoes
administrativas nao podem ser feitas apenas com a autenticacao SSH do Git.
