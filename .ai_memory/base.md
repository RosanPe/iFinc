# PROTOCOLO DE GERENCIAMENTO DE MEMORIA (AI-MEMORY)

Este projeto usa a pasta `.ai_memory/` para preservar contexto, decisoes de
arquitetura e progresso entre sessoes e ferramentas de IA.

## 1. Leitura Obrigatoria

Antes de escrever codigo ou propor alteracoes, ler e cruzar, nesta ordem:

1. `.ai_memory/system_architecture.md`: stack, limites e padroes obrigatorios.
2. `.ai_memory/context_memory.md`: contexto do produto, decisoes e riscos.
3. `.ai_memory/task_backlog.md`: foco atual, itens concluidos e pendencias.
4. `docs/project-structure.md`: estrutura oficial e responsabilidades das pastas.

Se houver divergencia entre memoria e implementacao, verificar o workspace e
atualizar a memoria sem apagar decisoes ainda validas.

## 2. Premissas Fundamentais

- Este e um projeto original em Next.js, React, TypeScript e Supabase.
- Nao existe migracao de sistema, aplicacao anterior ou legado Streamlit/Python.
- Nao criar tarefas, referencias ou decisoes relacionadas a migracao ou paridade
  com sistemas inexistentes.
- A aplicacao e mobile first, usa exportacao estatica para GitHub Pages e acessa o
  Supabase diretamente pelo navegador, protegido por Auth e RLS.
- `docs/project-structure.md` e a referencia normativa para criar e localizar
  modulos. Mudancas estruturais relevantes devem atualizar esse documento e a
  memoria de arquitetura.

## 3. Manutencao da Memoria

### `system_architecture.md`

Atualizar ao definir stack, biblioteca, padrao de codigo, contrato de dados,
estrutura de pastas ou restricao de deploy e seguranca.

### `context_memory.md`

Atualizar ao tomar decisoes de produto ou arquitetura, resolver problemas nao
obvios, identificar riscos ou estabelecer regras de dominio.

### `task_backlog.md`

Atualizar ao concluir funcionalidades, alterar o foco, descobrir debito tecnico ou
adicionar trabalho futuro. Usar `[x]` para concluido e `[ ]` para pendente.

## 4. Diretrizes de Escrita

- Ser conciso e orientado ao motivo das decisoes.
- Preferir listas, tabelas e frases curtas.
- Registrar fatos confirmados; nao transformar hipoteses em decisoes.
- Nunca registrar segredos, tokens ou valores de arquivos locais sensiveis.
- Ao alterar `.ai_memory/`, informar no fechamento quais arquivos foram atualizados.
