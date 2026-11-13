# API

Backend do Controle Portaria (Express + PostgreSQL).

## Fluxo de autenticação multi-tenant

O frontend deve enviar `condominiumId` no body das requisições de autenticação.

Fluxo:

1. Obter slug (a partir do subdomínio).
2. Consultar `GET /api/condominiums/slug/:slug/id`.
3. Usar o `id` retornado como `condominiumId` no login/cadastro.

## Endpoints relevantes

- `GET /api/condominiums/slug/:slug/id`
  - Retorno: `{ "id": "<condominium-id>" }`
- `POST /api/condominiums`
  - Protegido: exige header `x-platform-setup-secret` igual à env var `PLATFORM_SETUP_SECRET`. Não há criação de condomínio via usuário autenticado — só via esse secret, conhecido apenas pelo operador da plataforma.
  - Body: `{ "name": "...", "slug": "..." (opcional) }`
- `POST /api/auth/register`
  - Dois modos:
    - **Bootstrap** (header `x-platform-setup-secret` válido): cria o primeiro usuário de um condomínio novo, sem sessão autenticada. Body: `{ "condominiumId": "...", "name": "...", "email": "...", "password": "...", "role": "ADMIN|GESTOR|SINDICO|SEGURANCA" }`.
    - **Normal** (`Authorization: Bearer <token>` de um usuário `ADMIN`): cria um novo usuário dentro do próprio tenant do admin autenticado — `condominiumId` é sempre derivado do token, **não** é lido do body. Body: `{ "name": "...", "email": "...", "password": "...", "role": "ADMIN|GESTOR|SINDICO|SEGURANCA" }`.
- `POST /api/auth/login`
  - Body: `{ "condominiumId": "...", "email": "...", "password": "..." }`

### Onboarding de um condomínio novo

Como não existe tela de autocadastro no frontend, o onboarding de um condomínio é manual (Postman/script), usando o secret de bootstrap:

1. `POST /api/condominiums` com o header `x-platform-setup-secret` → cria o condomínio.
2. `POST /api/auth/register` com o mesmo header e `role: "ADMIN"` → cria o primeiro admin desse condomínio.
3. A partir daí, esse admin usa `POST /api/auth/register` autenticado (sem o secret) para criar os demais usuários do próprio condomínio.
