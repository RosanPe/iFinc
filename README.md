# iFin

Aplicacao web mobile first para controle financeiro, investimentos e patrimonio
consolidado.

## Requisitos

- Node.js 20.9 ou superior
- pnpm 11
- Projeto Supabase com as migrations de `supabase/migrations/` aplicadas

## Configuracao local

1. Instale as dependencias:

   ```bash
   pnpm install
   ```

2. Crie `.env.local` com base em `.env.local.example` e informe apenas a URL e a
   chave publishable do Supabase.

3. Em um projeto Supabase novo ou descartavel, execute o conteudo de
   `supabase/migrations/000_rebuild_public_schema.sql` no SQL Editor. O arquivo usa
   `DROP SCHEMA public CASCADE` e apaga integralmente os dados atuais de `public`.

4. Inicie o servidor:

   ```bash
   pnpm dev
   ```

## Validacao

```bash
pnpm lint
pnpm test
pnpm build
```

O build usa Webpack e gera a exportacao estatica em `out/`. No GitHub Pages, defina
`NEXT_PUBLIC_BASE_PATH=/nome-do-repositorio` durante o build. Em desenvolvimento
local, mantenha a variavel vazia.

O workflow `.github/workflows/deploy-pages.yml` valida e publica a branch `main` em
`https://rosanpe.github.io/iFinc/`, usando `NEXT_PUBLIC_BASE_PATH=/iFinc`.

Antes do primeiro deploy, configure no repositorio os Actions secrets
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Apesar de serem
valores publicos no bundle do navegador, os secrets evitam manter a configuracao do
projeto hospedado versionada. Em **Settings > Pages**, selecione **GitHub Actions**
como fonte de publicacao.

## Autenticacao

- Login: `/login/`
- Cadastro: `/cadastro/`
- Recuperacao: `/recuperar-senha/`
- Nova senha: `/redefinir-senha/`

No painel do Supabase Auth, adicione a URL local
`http://localhost:3000/redefinir-senha/` nas Redirect URLs para testar recuperacao.
Para producao, adicione tambem
`https://rosanpe.github.io/iFinc/redefinir-senha/`.

## Teste de RLS

Depois de criar pelo menos dois usuarios no Supabase Auth, execute
`supabase/tests/rls_isolation.sql` no SQL Editor. O teste comprova que um usuario nao
le os registros do outro e termina com `ROLLBACK`.

Para validar integridade e operacoes CRUD com um usuario existente, execute tambem
`supabase/tests/crud_smoke.sql`. O teste percorre as tabelas de dominio, respeita as
chaves estrangeiras e termina com `ROLLBACK`.

## Arquitetura

- Next.js App Router e TypeScript
- Tailwind CSS e componentes no padrao Shadcn UI
- Supabase Auth/PostgreSQL acessado exclusivamente pelo navegador
- RLS como fronteira de seguranca dos dados privados
- Exportacao estatica compativel com GitHub Pages

Consulte `docs/project-structure.md` para a divisao de responsabilidades.

## Cadastros Disponiveis

A rota `/financas/` permite criar, editar, ativar, desativar e excluir contas,
cartoes, categorias, subcategorias e tags. Exclusoes bloqueadas por relacionamentos
do banco retornam uma mensagem sem remover os dados relacionados.

O mesmo modulo inclui resumo mensal, receitas, despesas, transferencias, compras
parceladas, faturas por competencia, recorrencias e orcamentos por categoria.

## Investimentos e Patrimonio

A rota `/investimentos/` inclui:

- classes e ativos com cotacao manual;
- compras, vendas, quantidade, preco medio e resultados;
- proventos previstos e recebidos;
- metas de alocacao e sugestao do proximo aporte;
- distribuicao da carteira por classe;
- patrimonio consolidado, snapshots e evolucao historica.

Ativos fora de BRL aparecem na moeda original, mas nao entram no patrimonio
consolidado ate existir uma fonte cambial segura. Consulte
`docs/market-data-evaluation.md` para a avaliacao de provedores.

## Dashboard

O dashboard consolida financas e investimentos. O grafico geral combina receitas,
despesas e saldo em barras com linhas separadas para patrimonio e investimentos. Os
periodos disponiveis sao 6 meses, 1 ano, 5 anos, 10 anos e todo o historico. Um mes
pode ser selecionado por clique, toque ou teclado para abrir um card modal com o
consolidado correspondente.

Os cards principais tambem sao interativos e abrem detalhes preservando o mes
selecionado.

## Conectividade

Sem rede, os dados que ja estavam carregados permanecem visiveis na tela atual. Novas
consultas e alteracoes dependem de reconexao. O projeto ainda nao implementa cache
persistente nem fila de sincronizacao offline.

## Variaveis de Ambiente

Somente estas variaveis publicas devem existir no frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_BASE_PATH=
```

Nunca use `service_role`, secret keys, tokens de provedores de cotacao ou credenciais
administrativas em variaveis `NEXT_PUBLIC_*`.
