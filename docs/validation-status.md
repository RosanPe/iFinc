# Estado de Validacao

Ultima verificacao: 14 de junho de 2026.

## Local

- Suite Vitest de regras financeiras e investimentos.
- TypeScript sem emissao.
- ESLint.
- Build estatico com Webpack e geracao de todas as rotas.

## Supabase Hospedado

- Acesso anonimo a `accounts`: HTTP 401, bloqueio confirmado.
- Tentativa automatizada com dois usuarios temporarios: sem sessoes criadas.
- Consulta adicional ao Auth: endpoint permaneceu sem resposta e a tentativa foi
  encerrada. Esse comportamento ja havia sido observado neste ambiente.

## Pendente Externo

Executar `supabase/tests/rls_isolation.sql` no SQL Editor com dois usuarios Auth
existentes e validar os fluxos de interface em um navegador autenticado. Nao considerar
a ausencia de resposta do cadastro automatizado como falha confirmada do Supabase.
