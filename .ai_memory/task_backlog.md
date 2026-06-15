# Backlog de Tarefas

## Fase 1 - Fundacao do Produto (Concluida)

- [x] Inicializar Next.js com App Router, TypeScript e Tailwind CSS.
- [x] Configurar exportacao estatica com `output: "export"`.
- [x] Parametrizar `basePath` e `assetPrefix` via `NEXT_PUBLIC_BASE_PATH`.
- [x] Instalar a base do Shadcn/ui e Radix Primitives.
- [x] Configurar tema claro/escuro com `next-themes`.
- [x] Criar `.env.local.example` com variaveis publicas do Supabase.
- [x] Ignorar `.env.local` e `.supabaseSecret` no Git.
- [x] Inicializar o cliente Supabase browser-side.
- [x] Documentar a arquitetura em `docs/project-structure.md`.
- [x] Criar shell responsivo com header, bottom navigation e FAB.
- [x] Criar dashboard inicial com dados mockados.
- [x] Validar lint, TypeScript e build estatico inicial.
- [x] Manter `NEXT_PUBLIC_BASE_PATH` vazio no desenvolvimento local.
- [x] Validar estrutura responsiva, foco visivel, alvos de toque e movimento reduzido.

## Fase 2 - Autenticacao e Cadastros Base (Implementacao Concluida)

- [x] Criar telas de login, cadastro, recuperacao e redefinicao de senha.
- [x] Integrar Supabase Auth no client-side.
- [x] Persistir, restaurar e observar mudancas de sessao no navegador.
- [x] Proteger rotas internas e implementar logout.
- [x] Criar perfil e categorias iniciais apos cadastro por trigger.
- [x] Consolidar o schema em migration destrutiva para reconstruir `public`.
- [x] Implementar CRUD de contas e carteiras.
- [x] Implementar CRUD de cartoes com limite, fechamento e vencimento.
- [x] Implementar CRUD de categorias, subcategorias e tags.
- [x] Confirmar bloqueio de acesso anonimo nas tabelas privadas.
- [x] Criar teste transacional de isolamento RLS para dois usuarios autenticados.
- [ ] Executar `supabase/tests/rls_isolation.sql` com dois usuarios Auth existentes.
- [x] Gerar `types/database.types.ts` a partir da migration-base aplicada.

## Fase 3 - Controle Financeiro (Concluida)

- [x] Implementar formulario de receitas, despesas e transferencias.
- [x] Implementar listagem, filtros, edicao e exclusao de transacoes.
- [x] Implementar parcelamentos materializados por mes.
- [x] Implementar transacoes recorrentes e geracao de ocorrencias.
- [x] Implementar faturas atuais e futuras por competencia do cartao.
- [x] Implementar orcamentos por categoria com alertas de limite.
- [x] Implementar fluxo de caixa mensal, pendencias e taxa de poupanca.
- [x] Substituir mocks financeiros por repositorios Supabase.
- [x] Testar parcelamentos, faturas, recorrencias e consolidacao mensal.

## Fase 4 - Investimentos e Patrimonio (Concluida)

- [x] Implementar cadastro de ativos por classe.
- [x] Implementar operacoes de compra e venda.
- [x] Calcular quantidade, preco medio, custo e lucro/prejuizo.
- [x] Implementar cadastro e calendario de proventos.
- [x] Implementar metas de alocacao por classe ou ativo.
- [x] Calcular rebalanceamento e sugestao do proximo aporte.
- [x] Implementar grafico responsivo de distribuicao da carteira.
- [x] Implementar patrimonio consolidado de contas e investimentos.
- [x] Implementar snapshots e grafico de evolucao patrimonial.
- [x] Avaliar fonte gratuita para cotacoes de mercado.
- [x] Testar preco medio, vendas, alocacao e patrimonio consolidado.

## Fase 5 - Qualidade Local (Concluida) e Deploy (Adiado)

- [x] Garantir ausencia de overflow horizontal em todas as rotas.
- [x] Validar acessibilidade por teclado, foco e leitores de tela.
- [x] Adicionar estados de carregamento, vazio, erro e modo offline degradado.
- [x] Executar lint, testes e build estatico completos.
- [x] Configurar workflow de deploy no GitHub Pages.
- [x] Conectar o repositorio `RosanPe/iFinc` e definir `/iFinc` como base path de deploy.
- [x] Documentar desenvolvimento local, Supabase e variaveis de ambiente.
- [ ] Validar todos os fluxos contra o projeto Supabase hospedado. Bloqueio anonimo
  confirmado; validacao autenticada depende de dois usuarios existentes porque o
  endpoint Auth nao respondeu neste ambiente.
- [x] Ampliar graficos de visualizacao no dashboard e nos consolidados mensais.
- [x] Implementar grafico geral combinado de evolucao financeira mes a mes: barras
  para receitas/despesas/saldo e linha para patrimonio liquido.
- [x] Adicionar seletores de periodo `6M`, `1A`, `5A`, `10A` e `Tudo`, com agregacao e
  densidade de rotulos responsivas ao intervalo escolhido.
- [x] Permitir selecionar um mes no grafico por clique, toque ou teclado.
- [x] Exibir consolidado do mes selecionado com patrimonio, saldo em contas,
  investimentos, receitas, despesas, pendencias e variacao contra o mes anterior.
- [x] Destacar no grafico meses com variacao relevante ou resultado atipico, sem
  depender apenas de cor para comunicar a diferenca.
- [x] Tornar cards de receitas, despesas, pendencias e economia clicaveis.
- [x] Exibir detalhamento consolidado do mes ao abrir cada card, preservando filtros.
- [x] Padronizar tratamento de erros dos CRUDs sem rejeicoes escapando para o runtime.
- [x] Preservar ocorrencias historicas ao excluir regras de recorrencia.
- [x] Criar smoke test SQL transacional para integridade dos CRUDs e chaves estrangeiras.

## Fase 6 - Linguagem Natural e IA (Futuro)

- [ ] Definir contratos JSON para despesa, receita, parcelamento e operacao de ativo.
- [ ] Avaliar riscos de usar Gemini em uma aplicacao estatica.
- [ ] Definir mitigacao de abuso, restricoes de chave e limites de uso.
- [ ] Decidir se a IA exige backend seguro separado.
- [ ] Instalar o SDK oficial `@google/genai` somente apos decisao arquitetural.
- [ ] Implementar entrada por texto e futura transcricao de audio.
- [ ] Validar Structured Outputs antes de persistir dados no Supabase.
- [ ] Exibir confirmacao editavel antes de gravar registros interpretados pela IA.

## Decisoes Pendentes

- [x] Usar graficos locais em SVG/CSS compativeis com exportacao estatica.
- [x] Definir Vitest como suite de testes TypeScript.
- [ ] Definir estrategia de cache para cotacoes e dados de dashboard.
- [x] Manter cotacao manual ate existir backend seguro; avaliacao documentada.
- [ ] Definir arquitetura segura para Gemini antes de expor qualquer integracao.
