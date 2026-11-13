---
name: ship
description: Valida, faz commit das alterações da tarefa atual, dá push e abre/atualiza o PR vinculado à issue.
argument-hint: "[mensagem opcional]"
disable-model-invocation: true
model: sonnet
allowed-tools: Bash(gh *), Bash(git *), Bash(pnpm lint*), Bash(pnpm format*), Bash(pnpm --filter ./web exec tsc*), Bash(pnpm --filter ./api exec tsc*), Bash(pnpm --filter ./web test*), Bash(pnpm --filter ./api test*), Bash(pnpm --filter ./api typecheck*), Read, Edit, Glob, Grep
---

# Entregar tarefa

Argumentos recebidos: `$ARGUMENTS`

## 1. Conferir a branch
- `git branch --show-current`. Se for `main`/branch padrão, **pare e avise** — nunca commite direto nela.
- Extraia prefixo e número da issue do nome: `feat/42-visitor-registration` → prefixo `feat`, issue `42`.
  Se o nome não tiver número, pergunte qual é a issue.
- `git status --porcelain`: se não houver alterações nem commits à frente do remoto, avise e pare.

## 2. Validar
O repo é um monorepo pnpm com testes Vitest em `web/` e `api/`. Rode conforme o que foi alterado:
- `web/`: `pnpm lint`, `pnpm --filter ./web exec tsc --noEmit` e `pnpm --filter ./web test` (não precisa de DB nem API rodando).
- `api/`: `pnpm --filter ./api exec tsc --noEmit`, `pnpm --filter ./api typecheck` (inclui os `*.test.ts`) e `pnpm --filter ./api test:unit`.
  - Integração (`pnpm --filter ./api test:integration`) só se existir `api/.env.test` e o Postgres local estiver de pé;
    caso contrário, pule e avise no resumo final que os testes de integração não foram rodados.
- `pnpm format:check`
- Se falhar por causa das mudanças atuais, mostre o erro e pergunte se deve corrigir antes de seguir.

## 3. Commit
- Veja o que mudou com `git diff --stat` e `git diff` (só o necessário para entender).
- Nunca adicione `.env*`, segredos ou credenciais. Use `git add` nos arquivos da tarefa (evite `git add -A` se houver arquivos estranhos à tarefa — pergunte).
- Mensagem **sempre em inglês**, em Conventional Commits, no imperativo, com a issue:
  `<prefixo>(<escopo>): <short description> (#<N>)`
  Ex.: `feat(visitors): add registration form with photo (#42)`
  Se o usuário passou uma mensagem em `$ARGUMENTS` (mesmo em português), use-a como base e traduza para o inglês.
- Se as mudanças forem de assuntos diferentes, pode dividir em mais de um commit.

## 4. Push
- `git push -u origin <branch>` (nunca `--force`).

## 5. Pull Request
- `gh pr view --json url,isDraft` para ver se já existe PR da branch.
- Se não existir:
  `gh pr create --draft --base main --title "<prefixo>: <título da issue em inglês>" --body "<summary in English>\n\nCloses #<N>"`
  (pegue o título com `gh issue view <N> --json title` e traduza para o inglês).
- Se existir, só informe que o PR foi atualizado.
- Termine mostrando: commits criados e link do PR.
