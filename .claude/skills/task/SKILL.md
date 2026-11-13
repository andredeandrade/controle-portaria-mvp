---
name: task
description: Pega uma tarefa (issue) do GitHub Projects e cria a branch vinculada a ela. Opcionalmente implementa.
argument-hint: "[numero-da-issue] [--implement]"
disable-model-invocation: true
model: sonnet
allowed-tools: Bash(gh *), Bash(git *), Read, Edit, Write, Glob, Grep, Agent
---

# Iniciar tarefa

Argumentos recebidos: `$ARGUMENTS`

## 1. Escolher a tarefa
- Se nenhum número foi passado, rode
  `gh issue list --assignee @me --state open --limit 15`
  e pergunte qual tarefa pegar. Não continue sem a resposta.
- Leia a tarefa: `gh issue view <N> --json number,title,body,labels,assignees`
- Se não estiver atribuída a ninguém: `gh issue edit <N> --add-assignee @me`.

## 2. Preparar o repositório
- `git status --porcelain`: se houver alterações não commitadas, **pare e avise** (não faça stash nem descarte nada).
- `git checkout main && git pull --ff-only` (use a branch padrão do repo se não for `main`).

## 3. Criar a branch vinculada à issue
- Prefixo pela label: `bug` → `fix`, `docs` → `docs`, `chore` → `chore`, `refactor` → `refactor`, senão `feat`.
- Nome: `<prefixo>/<N>-<slug>`, onde o slug é o título da issue **traduzido para o inglês**, curto, em kebab-case, sem acentos (máx. ~50 caracteres).
  Ex.: issue #42 "Cadastro de visitantes na portaria" → `feat/42-visitor-registration`.
- Se já existir branch remota começando com `<prefixo>/<N>-`: `git fetch` e checkout nela.
- Senão: `gh issue develop <N> --name <branch> --base main --checkout`
  (liga a branch à issue, aparecendo em "Development").

## 4. Implementar (só com `--implement`)
Sem `--implement`: mostre o nome da branch, um resumo curto da tarefa e diga
"Quando terminar, rode `/ship`." — e **pare aqui**.

Com `--implement`:
- Entenda os critérios de aceite da issue. Se estiver ambíguo, pergunte antes.
- Explore só o suficiente para decidir quais áreas a tarefa toca (Glob/Grep, leia o mínimo).
- **Delegue a implementação aos agentes do projeto (`.claude/agents/`)** conforme o contexto, em vez de implementar tudo direto:

  | Área tocada pela tarefa | Agente |
  |---|---|
  | `api/` (módulos, Prisma, middlewares, auth, criptografia) | `backend` |
  | `web/` (telas, componentes, hooks, services, rotas BFF `web/src/app/api`) | `frontend` |
  | Testes novos/ajustados (Vitest, Supertest, Testing Library) | `test-engineer` |
  | Revisão de auth, permissões, tenant isolation, PII, IDOR | `security` (somente leitura) |

- Ordem quando a tarefa envolve mais de uma área:
  1. `backend` primeiro, se o contrato da API mudar (rotas, payloads, schema).
  2. `frontend` depois, passando no prompt o contrato definido pelo backend (rotas, shapes de request/response).
     Se as duas partes forem independentes, rode `backend` e `frontend` em paralelo.
  3. `test-engineer` para cobrir o que foi alterado (inclusive o `*.tenant.int.test.ts` em módulos novos da API).
  4. `security` sempre que a tarefa tocar acesso a dados, autenticação, autorização, multi-tenancy ou PII.
     Se reportar problemas, repasse as correções ao agente da área (`backend`/`frontend`) e revalide.
- Cada agente começa sem o contexto da conversa: no prompt inclua número/título da issue, critérios de aceite,
  arquivos relevantes já identificados, o que os outros agentes já fizeram e a instrução de **não fazer commit**.
- Tarefas triviais (ex.: ajuste de texto, uma linha, só docs) podem ser feitas direto, sem agente.
- Siga os padrões do projeto descritos no `CLAUDE.md`; mudanças pequenas e focadas, sem refatorações não pedidas.
- Ao final, resuma o que cada agente fez (arquivos alterados, pontos de atenção do `security`).
- Não faça commit. Ao terminar, diga "Revise as mudanças e rode `/ship`."
