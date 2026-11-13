# CLAUDE.md — api (backend)

This file complements the repository root `CLAUDE.md`. It documents backend-specific implementation detail found in `api/src` — it does not repeat the monorepo-level commands or architecture already covered at the root.

## App structure

- `src/server.ts` is only the process entrypoint (`app.listen`, `SIGTERM`/`SIGINT` → close server + `prisma.$disconnect()`). Actual Express app config (CORS, JSON body parsing, route mounting, error handling) lives in `src/app.ts`.
- CORS: single origin from `CORS_ORIGIN` env var (default `http://localhost:3000`) — no multi-origin/array support today.
- Security middleware in `app.ts`: `helmet()`, a global per-IP rate limiter on `/api` (`middlewares/rate-limit.ts`, `RATE_LIMIT_*`), `express.json({ limit })` (`BODY_LIMIT`, default `100kb`) and `trust proxy` from `TRUST_PROXY`. `POST /auth/login` and `/auth/register` additionally use the stricter `authRateLimiter` (`AUTH_RATE_LIMIT_*`, counts only failed attempts).
- No HTTP request-logging middleware (no morgan/pino/winston). Only `console.log`/`console.error`, and only in `server.ts` (startup/shutdown) and the global error handler in `app.ts`.

## Module pattern detail

- Layering is `*.routes.ts` → `*.controller.ts` → `*.service.ts` → Prisma. **No repository layer** — Prisma is only ever called from `*.service.ts` files.
- Controllers do manual request parsing/coercion (`getBodyAsRecord`, `readOptionalString`, per-field parse helpers) before calling the service — keep new endpoints consistent with this instead of parsing/coercing inline in the service.
- `POST /auth/login` is fully public (skips `authenticate`). `POST /auth/register` has two modes via the `registerGate` middleware in `auth.routes.ts`: a valid `x-platform-setup-secret` header bypasses `authenticate` entirely (bootstrap of a new tenant's first user, `condominiumId` read from the body); otherwise it requires `authenticate` + `authorizeRoles('ADMIN')`, and the controller then forces `condominiumId` from `req.authUser.condominiumId` (never the body) so an authenticated ADMIN can only create users in their own tenant. `GET /me` requires `authenticate`; `GET /admin-area` requires `authenticate` + `authorizeRoles('ADMIN')`. `POST /condominiums` similarly requires the `x-platform-setup-secret` header (`middlewares/platform-secret.ts`) — there is no authenticated path to create a new tenant.
- `modules/auth/index.ts` has a stale doc comment describing a planned `auth.schema.ts` with Zod validation — **zod is not installed or used anywhere in this repo**; don't assume it exists.

## Prisma schema

- The tenant FK (`condominiumId`) is present on every top-level domain model (`User`, `Resident`, `Visitor`, `ServiceProvider`, `Authorization`, `AccessRecord`, `Event`, `Incident`). Child records (`Vehicle`, `EventGuest`, `AccessRecordPerson`) are scoped indirectly through their parent FK, not their own `condominiumId` — don't add a redundant `condominiumId` to a child model without checking this existing pattern first.
- `User` has `@@unique([condominiumId, email])` — this compound key, not a bare email unique, is what auth login/register rely on.
- Composite tenant-scoped indexes exist on hot query paths, e.g. `Resident: @@index([condominiumId, fullName])`; `AccessRecord: @@index([condominiumId, checkInAt])`. Follow this `[condominiumId, <filter field>]` shape when adding a new indexed query path.
- A resident can have multiple units: they live in the child model `ResidentUnit` (`unit`, `position` for display order, `@@unique([residentId, unit])`), not a column on `Resident`. The API exposes them as `units: string[]`; search by unit uses `units: { some: { unit: { contains } } }`.
- Roles enum: `UserRole { ADMIN, GESTOR, SINDICO, SEGURANCA }` (the original `PORTARIA` was renamed by migration `rename_portaria_add_gestor_sindico`).

## Multi-tenancy & IDOR prevention

- Every service-layer `findMany`/`findFirst`/`update`/`delete` on a domain resource filters by `condominiumId` in the `where` clause — verified consistently across all modules.
- Get-by-id and mutation flows use a **check-then-act** pattern: `findFirst({ where: { id, condominiumId } })` first (404, not 403, on miss — this avoids confirming a record's existence to a different tenant), then a separate `update`/`delete` filtered only by `id`. Follow this exact two-step shape for new by-id endpoints, rather than relying on a single `where: { id, condominiumId }` on the mutation call itself.
- `Condominium.getById` (raw id, intentionally unscoped since `Condominium` is the tenant boundary itself) is **not exposed as a route** — only `POST /`, `GET /slug/:slug/id`, `GET /me`, `PATCH /me` are mounted. Don't add a `GET /condominiums/:id` route without deliberately deciding whether it should stay unscoped.

## JWT auth

- Token payload: `{ sub, email, role, condominiumId }` (`lib/jwt.ts`); expiry from `JWT_EXPIRES_IN` (default `1d`).
- `middlewares/authenticate.ts` re-fetches the user from the DB by `{ id: payload.sub, condominiumId: payload.condominiumId }` on every request — this catches a token whose user was deleted or moved to a different condominium after issuance. Don't remove this DB round-trip to "optimize" auth; it's the actual tenant-membership check, not just signature verification.
- Attaches `req.authUser: { id, condominiumId, email, role, name }` via `types/express.d.ts` module augmentation — use `req.authUser` (not the raw JWT payload) in controllers/services.

## Role-based authorization

- `lib/permissions.ts` holds a permission matrix `role → resource → actions` (`residents`, `visitors`, `service-providers`, `authorizations`, `events`, `incidents`, `access-records`, `reports`). `ADMIN` and `GESTOR` have full access; `SINDICO` is full except `access-records` (view only); `SEGURANCA` is mostly view-only (can check in/out, register event access, add event guests and create incidents; no reports).
- `middlewares/authorize.ts` exports `authorizePermission(resource, action)` — used on every domain route (and `reports` as a whole) — and `authorizeRoles(...roles)`, used only for admin-only routes: `GET /auth/admin-area`, `PATCH /condominiums/me` and the authenticated mode of `POST /auth/register`.
- Both answer 403 with a generic message. Authorization is checked _after_ `authenticate` and is independent of tenant scoping: a permitted role still only sees its own `condominiumId`.
- When adding a route or action, extend the matrix (and the mirrored one in `web/src/lib/permissions/`) and add a case to `authorize.int.test.ts`/the module's tests instead of inlining role checks.

## Input validation

- No validation library (no zod/joi/yup/express-validator). Validation is manual and duplicated per module: controllers coerce shape/types, services enforce business rules via `if` checks and regex (e.g. email format, `password.length >= 8`, minimum name length). Match this manual style for new fields — don't introduce a validation library for one endpoint without a broader decision to adopt it project-wide.

## PII encryption

- **Use `lib/crypto.ts` for `encryptText`/`decryptText` — this is what every service module actually imports.** `lib/encryption.ts` implements the same AES-256-GCM scheme (same IV/auth-tag approach, base64 instead of `crypto.ts`'s hex encoding) but has zero importers anywhere in `src` — it's dead/duplicate code, not an alternative implementation to use.
- Key derivation: SHA-256 hash of the `DATA_ENCRYPTION_KEY` env var → 32-byte AES key. IV is a random 12 bytes per call, packed as `iv:authTag:ciphertext` (hex-joined).
- Applied to PII fields (email, phone, document, plate, observations): encrypt on write, decrypt on read, inside the service layer only — never in controllers.

## Prisma transactions

`$transaction` (array form, not the interactive callback form) is used specifically to pair a paginated `findMany` with its matching `count` in every module's list endpoint:

```ts
const [items, total] = await prisma.$transaction([
  prisma.resident.findMany({ where, skip, take: pageSize, ... }),
  prisma.resident.count({ where }),
])
```

Follow this exact shape for any new paginated list endpoint.

## Error handling

- `lib/http-error.ts`: a single `HttpError extends Error { statusCode }` class — throw this from services/controllers for any expected error condition (not-found, validation, auth).
- Controllers don't try/catch — Express 5 forwards async rejections to the error middleware automatically. Don't wrap controller bodies in try/catch just to re-throw; let it propagate.
- One centralized 4-arg error handler at the bottom of `app.ts`: a known `HttpError` becomes `{ statusCode, message }`; anything else becomes a 500, with the real message hidden behind a generic string when `NODE_ENV=production`.

## Logging

- Minimal by design: only startup/shutdown logs in `server.ts` and one `console.error(err)` in the global error handler. No request/PII logging found anywhere.
- Dev-only risk to be aware of: `lib/prisma.ts` enables Prisma's `['query', 'error', 'warn']` logging when `NODE_ENV=development`, which prints raw SQL with bound parameters (including plaintext values pre-hash/pre-encryption in some flows) to the console. This is development-only — production uses `['error']` only.

## Migrations

21 migrations to date, one per schema change (from `add_auth_user` to `add_resident_units`). Run via `pnpm --filter ./api prisma:migrate`; path config in `prisma.config.ts`.

## Password handling

bcrypt, `SALT_ROUNDS = 10` (`lib/password.ts`).

## Env config

`config/env.ts` does manual checks (no schema library) that throw synchronously at module load — fail-fast on boot — if `DATABASE_URL`, `JWT_SECRET`, `DATA_ENCRYPTION_KEY` or `PLATFORM_SETUP_SECRET` are missing. Optional vars with defaults: `PORT` (3333), `CORS_ORIGIN`, `JWT_EXPIRES_IN` (`1d`), `NODE_ENV`, `TRUST_PROXY`, `BODY_LIMIT`, `RATE_LIMIT_*`, `AUTH_RATE_LIMIT_*`. With `NODE_ENV=production` it also refuses `CORS_ORIGIN='*'` and any of the three secrets that is shorter than 32 chars or contains `change-me`. `PLATFORM_SETUP_SECRET` gates `POST /condominiums` and the bootstrap mode of `POST /auth/register` (`lib/platform-secret.ts`, `middlewares/platform-secret.ts`) — it is a shared operator secret, not tied to any tenant.

## TypeScript

- `strict: true`, target ES2022/NodeNext. Zero `any`/`as any` in hand-written code.
- `*.types.ts` files predominantly use `interface` for object shapes and `type` for string-literal unions (e.g. `ResidentRelation`) — match this split rather than defaulting to one or the other.

## Known gaps to be aware of

Not necessarily bugs to fix opportunistically — flag with the user if a task touches these rather than silently changing scope:

- No input validation library — validation rigor varies by module (manual, per service).
- No structured/request logging and no error monitoring (open issues in the backlog).
- `lib/encryption.ts` is dead code kept only with its own unit test.
