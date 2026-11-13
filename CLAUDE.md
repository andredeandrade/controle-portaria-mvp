# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Language

Respond in Portuguese (pt-BR) when working in this repository, matching the existing project convention (`.github/agents/controleportaria.agent.md`).

## Project overview

Controle Portaria is a multi-tenant condominium gate/access-control system (visitor, resident, and service-provider check-in/check-out management), used by multiple condominiums (`condominiums`) via subdomain-based tenancy. Domain entities use Portuguese names: `Resident`(morador), `Visitor` (visitante), `ServiceProvider` (prestador de serviço), `Authorization` (autorização), `AccessRecord` (registro de acesso), `Event`/`EventGuest` (evento/convidado), `Incident` (ocorrência), `Vehicle`.

pnpm monorepo with two independent packages, no shared code between them:
- `web/` — Next.js 16 (App Router) frontend, TypeScript, MUI, React Query, TanStack Table
- `api/` — Express 5 + Prisma 7 + PostgreSQL backend (separate service, own `.env`, own Dockerfile)

**`web` never talks to Postgres/Prisma directly.** It calls its own `app/api/*` Route Handlers (a BFF layer), which proxy over HTTP to the Express `api` service.

## Commands

Run from repo root unless noted:

| Command | Effect |
|---|---|
| `pnpm install` | Install all workspace packages |
| `pnpm dev` | Run `web` dev server (Next.js) at localhost:3000 |
| `pnpm build` | Build `web` for production |
| `pnpm start` | Start `web` in production mode |
| `pnpm lint` | ESLint on `web` |
| `pnpm format` / `pnpm format:check` | Prettier across all workspace packages |
| `pnpm --filter ./web <script>` | Run any `web/package.json` script |
| `pnpm --filter ./api <script>` | Run any `api/package.json` script |

`api` scripts (run via `pnpm --filter ./api <script>` or `cd api && pnpm <script>`):
- `dev` — `tsx watch src/server.ts` (API on :3333)
- `build` — `tsc`
- `start` — run compiled `dist/server.js`
- `prisma:generate` / `prisma:migrate` / `prisma:studio`
- `seed` — `prisma db seed` → runs `api/scripts/seed.ts` (configured in `api/prisma.config.ts`). Wipes and recreates fake data only for the `demo` condominium; refuses to run against a non-local DB or with `NODE_ENV=production`. In Docker dev: `docker compose exec api pnpm seed`. Login at `demo.localhost:3000` with `admin@demo.local` / `Senha@123`. When changing the Prisma schema, keep the seed in sync — it writes every domain model directly via Prisma. Full usage in `README.md` ("Dados de teste (seed)").

### Tests

Both packages use Vitest 4 (`api/`: + Supertest; `web/`: + jsdom + Testing Library). There is no Playwright/E2E. `pnpm test` at the root runs `pnpm -r --if-present test`.

`api` test scripts (`pnpm --filter ./api <script>`):
- `test` — all projects (`vitest run`); `test:watch` — watch mode
- `test:unit` — only `*.test.ts` that don't touch the DB (runs without Postgres)
- `test:integration` — only `*.int.test.ts` (Supertest against `src/app.ts` + real Postgres)
- `typecheck` — `tsc -p tsconfig.test.json` (the build `tsconfig.json` excludes `*.test.ts`)

Test DB setup: copy `api/.env.test.example` → `api/.env.test` (gitignored). `test/env.ts` aborts unless `DATABASE_URL` host is local (`localhost`/`127.0.0.1`/`::1`) and the DB name ends in `_test`, or if `NODE_ENV=production`. `test/global-setup.ts` creates the DB if missing and runs `prisma migrate deploy`; `test/integration-setup.ts` TRUNCATEs every table before each test, so integration files run serially (`fileParallelism: false`). The Postgres from `docker compose` (port 5432) works as-is. Requires Node ≥ 20 (Vitest 4; don't bump to Vitest 5 while `api/Dockerfile` uses `node:20`).

Conventions: test file next to the source file; helpers in `api/test/helpers/` (`createTestTenant()` → condominium + `ADMIN` + `SEGURANCA` users with signed JWTs, `authHeader()`); every new module should get a `*.tenant.int.test.ts` proving tenant B's data is invisible/immutable with tenant A's token (list, GET/PATCH/DELETE by id → 404).

`web` test scripts (`pnpm --filter ./web <script>`): `test` (`vitest run`), `test:watch`. No DB or running API needed — `fetch` is mocked.
- Two Vitest projects in `web/vitest.config.mts`, split by extension: `*.test.ts` → `node` env (BFF `app/api/**`, `proxy.ts`, `lib/`, `services/`); `*.test.tsx` → `jsdom` (hooks/components). `test/setup.node.ts` pins `API_BASE_URL=http://api.test/api`, so the BFF's fallback order is `api.test` → `localhost:3333` → `api:3333`.
- Helpers in `web/test/` (alias `@test/*`): `fetch.ts` (`mockFetch()` = typed `vi.stubGlobal('fetch')` that throws on unexpected calls, `jsonResponse()`, `getFetchCall()`), `render.tsx` (`renderWithProviders()` / `renderHookWithProviders()` — fresh `QueryClient` per test with `retry: false`, MUI theme, `AppSnackbarProvider`), `factories/`, and `bff-helpers-contract.ts` (`describeDomainHelpersContract()` — shared contract for the per-domain `request<Domain>Api` helpers: Bearer JWT, no tenant id sent, 401/403 → `clearCookie`, base-URL fallback; new BFF domains should call it from their `helpers.test.ts`).
- Reusable contracts — prefer one call over hand-written cases when adding a domain:
  - `bff-route-contract.ts` — `describeProtectedRouteContract()` for `route.ts` handlers (401 without cookie and no API call, Bearer/URL/method/body forwarded, 401/403 → same status + cookie deleted, 404/409/500 → `{ error }` message forwarded, 502 on network failure), plus `bffRequest()` / `routeParams()`.
  - `next-headers.ts` — `cookies()` stand-in (`signIn()`, `resetCookies()`, `deletedCookies`); wire it with `vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)`.
  - `crud-service-contract.ts` — `describeCrudServiceContract()` for `services/<domain>/service.ts` (list/register/get/update/delete; delete by `body` or `path`).
  - `mutation-hook-contract.tsx` — `describeMutationHook()`: seeds every query key and asserts exactly the expected prefixes are invalidated on success and none on error.
  - `list-hook-contract.tsx` — `describePaginatedListHook()` / `describeDetailHook()`.
  - `factories/payloads.ts` — create payloads per domain.
- BFF route handlers must `encodeURIComponent()` every path param (`id`, `eventId`, `guestId`, `vehicleId`) before building the Express URL, and allowlist query values that have a fixed set (e.g. dashboard `period`) — tests cover both.
- Mock only framework boundaries: `next/headers` (`cookies()`) in Route Handler tests, `next/navigation` (`useRouter`) in component tests. `proxy.ts` is tested by calling `proxy(new NextRequest(...))` plus `getRedirectUrl` / `unstable_doesMiddlewareMatch` from `next/experimental/testing/server` (the Next 16 docs call it `unstable_doesProxyMatch`, but the installed build only exports the `Middleware` name).
- Form inputs use `TextFieldLabel` (not a `<label for>`), so query fields by `name` (`container.querySelector('[name="fullName"]')`) instead of `getByLabelText`. Inputs also carry native `required`, which blocks submit in jsdom (and browsers) before RHF runs.
- Keep `jsdom` at 26 and `@testing-library/jest-dom` at 6: newer majors require Node ≥ 22 and `web/Dockerfile` uses `node:20`.

Docker (reads root `.env`, copy from `.env.example` first):
- `docker compose up --build` — full stack: web :3000, api :3333, postgres :5432
- `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d` — hot-reload dev mode (web via Turbopack `next dev`, api via `tsx watch`)

## Architecture

### Multi-tenancy
Every domain table carries `condominiumId`. The frontend extracts a tenant slug from the subdomain (`web/src/lib/auth/session.ts`), resolves it to a `condominiumId` via the API, and sends that id on auth calls. Always consider tenant isolation when touching queries, API payloads, or permissions.

### Auth
Custom JWT auth, no third-party auth library.
- API (`api/src/modules/auth/`) issues JWTs (`api/src/lib/jwt.ts`), hashes passwords with bcrypt (`api/src/lib/password.ts`). `api/src/middlewares/authenticate.ts` validates the Bearer token; `authorize.ts` exports `authorizePermission(resource, action)` (checks the role × resource × action matrix in `api/src/lib/permissions.ts`, applied to every domain route) and `authorizeRoles(...roles)` (fixed-role gates, e.g. `ADMIN`). Roles: `ADMIN`, `GESTOR`, `SINDICO`, `SEGURANCA`. The web mirrors the matrix in `web/src/lib/permissions/` (`useCan` hook) only to hide UI — the API is the authority.
- Web login route (`web/src/app/api/auth/login/route.ts`) resolves the tenant, calls the API, and stores the JWT in an httpOnly cookie (`web/src/lib/auth/session.ts`).
- `web/src/proxy.ts` is the middleware guarding protected route prefixes (`/dashboard`, `/acessos`, etc.) — it validates the cookie against `/auth/me` and redirects unauthenticated requests to `/`.

### Data & encryption
PII fields (email, phone, document, plate, observations) are stored as `*Encrypted` columns using AES-256-GCM (`api/src/lib/crypto.ts` — the module every service imports; `lib/encryption.ts` is an unused duplicate; key from `DATA_ENCRYPTION_KEY`). Every module's service layer encrypts on write and decrypts on read — follow this pattern for any new PII field rather than storing plaintext.

### API module pattern (`api/src/modules/<domain>/`)
Each domain (`auth`, `condominiums`, `residents`, `visitors`, `service-providers`, `authorizations`, `events`, `incidents`, `access-records`, `reports`, `dashboard`) follows the same file set: `*.routes.ts` → `*.controller.ts` → `*.service.ts` → `*.types.ts` → `index.ts` barrel. Mounted centrally in `api/src/routes/index.ts`.

### Web BFF route pattern (`web/src/app/api/<domain>/`)
Each Next.js Route Handler pairs `route.ts` (handler) + `helpers.ts` (server-side fetch to the Express API + error translation) + `types.ts` (request/response shapes). Follow this 3-file structure for new BFF endpoints rather than inlining fetch logic in `route.ts`.

### Web feature-folder pattern (`web/src/modules/<domain>/`)
Each domain (`acessos`, `moradores`, `visitantes`, `prestadores-servicos`, `autorizacoes`, `eventos`, `ocorrencias`) bundles a `components/` subfolder with `*List.tsx`, `*Table.tsx`, `Register*Form.tsx`, `Register*Button.tsx`; a `mobile/` subfolder with the responsive-split `*MobileList.tsx`; and a local `hooks/` subfolder as siblings of `components/`/`mobile/`. Match this shape when adding a new domain area.

### Shared building blocks
- `web/src/services/shared/http.ts` — `safeReadJson()` / `getApiErrorMessage()`, used by every `services/<domain>/service.ts`; each domain also defines its own `<Domain>ServiceError extends Error`.
- `web/src/modules/form/` — shared form primitives (`TextField`, `TextFieldStack`, `FormPaper`, `ColorSelect`, `PersonTypeSelect`, `LocomotionSelect`) living in `form/components/`, barreled via `form/index.ts`.
- `web/src/lib/mui/theme.ts` — the MUI theme (Inter font, custom palette, component overrides); wired through `web/src/providers/AppThemeProvider.tsx` with `AppRouterCacheProvider` for SSR emotion caching.
- `web/src/providers/AppProviders.tsx` — nests ReactQuery → Theme → Snackbar providers, mounted once in root `layout.tsx`.
- Server state is React Query only (`web/src/lib/react-query/queryClient.ts`, 30s staleTime, no refetch-on-focus) via a per-domain `useX.ts` (query) / `useCreateX.ts` (mutation) hook pair — never duplicate server cache in local state.
- Forms use `react-hook-form` throughout.
- Tables use `@tanstack/react-table` via `web/src/modules/table/components/DataTable.tsx` with typed column defs.
- PDF export uses `jspdf`/`jspdf-autotable` (`web/src/services/relatorios/pdf.ts`).

## Conventions

From the project's established rules (`.github/agents/controleportaria.agent.md`):
- Strict TypeScript — no implicit `any`; type props, return values, and API payloads explicitly.
- Use MUI components and the theming system (`sx`/`styled`) over inline CSS.
- Isolate business logic and API calls in custom hooks (`use*.ts`), not directly in components.
- Use React Query (`useQuery`/`useMutation`) for all server state.
- Prefer typed TanStack Table column APIs; extract reusable column defs to separate files.
- Use MUI breakpoints (`xs`, `sm`, `md`, `lg`) for responsive layout.
- JSDoc only on hooks, utilities, and complex types — not on simple components.
