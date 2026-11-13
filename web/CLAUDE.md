# CLAUDE.md — web (frontend)

This file complements the repository root `CLAUDE.md`. It documents frontend-specific implementation detail found in `web/src` — it does not repeat the monorepo-level commands or architecture already covered at the root.

## Server vs Client Components

- `page.tsx` files are server components (no `'use client'`): they only set `export const metadata` and render one client component that owns state/data-fetching.
- Root `app/layout.tsx` is a server component. `app/(dashboard)/layout.tsx` is `'use client'` (owns mobile drawer open/close state).
- The actual dividing line: anything using hooks, MUI interactive state, or React Query needs `'use client'` at the top. Nearly every component file under `modules/`, `hooks/`, and `providers/` has it.
- The middleware file is `src/proxy.ts` (not `middleware.ts`), exporting `proxy()` instead of `middleware()` — a breaking-change rename in this custom Next.js build (see root `AGENTS.md`).

## MUI / theme

- Theme lives in `src/lib/mui/theme.ts` — manual color scale, `spacing: 4`, `shape.borderRadius: 8`, custom typography, component overrides for `MuiButton`/`MuiOutlinedInput`/`MuiCard`/`MuiChip`. Wired through `providers/AppThemeProvider.tsx` (`AppRouterCacheProvider` for SSR emotion cache → `ThemeProvider` → `CssBaseline`).
- `sx` is the default styling mechanism throughout. `styled()` is reserved for a handful of shared primitives (`modules/form/components/TextField.tsx`, `styles/MobileList.styles.ts`) — don't reach for `styled()` for one-off component styling, use `sx`.

## React Query

- Global defaults (`lib/react-query/queryClient.ts`): 30s `staleTime`, `retry: 1` for queries / `retry: 0` for mutations, `refetchOnWindowFocus: false`.
- Per-domain hook pair, colocated under `modules/<domain>/hooks/`: `use<Domain>.ts` (list query) + `useCreate<Domain>.ts` (mutation).
- Query keys are arrays like `['residents', page, pageSize, debouncedSearchTerm]`; search input is locally debounced (~350ms) before it enters the key.
- Mutations invalidate by key **prefix** on success (`invalidateQueries({ queryKey: ['residents'] })`), not the exact compound key — follow this broad-invalidate pattern for new mutations.

## React Hook Form

- No schema resolver (no zod/yup) — validation is inline RHF rules: `register(name, { required, minLength, pattern, validate })`.
- Plain fields: spread `register()` onto the shared `TextField`. Controlled/MUI-select fields and dynamic arrays: `Controller` (`control`, `rules`, `render`) or `useFieldArray`.
- Error display is always the same pair on the field: `error={Boolean(errors.field)}` + `helperText={errors.field?.message}`.

## TanStack Table

- `modules/table/components/DataTable.tsx` is the single generic table, built on `useReactTable` with only `getCoreRowModel` registered — no client-side sorting/filtering/pagination.
- Pagination, sorting, and search are server-side: the list hook sends `page`/`pageSize`/search params to the BFF route, which forwards them to the Express API; the table renders whatever page it's given, plus an MUI `Pagination` bound to `pagination.totalPages`/`pagination.page` from the response.
- Columns are `ColumnDef<T>[]` defined inline per domain in `<Domain>Table.tsx`, mixing `accessorKey` columns with custom `id`+`cell` columns for composite/action cells.
- `DataTable.tsx` carries an eslint-disable for `react-hooks/incompatible-library` (TanStack Table is flagged by the React Compiler lint) — expected, not something to "fix".

## Domain component structure (`modules/<domain>/`)

Repeated identically across `acessos`, `autorizacoes`, `eventos`, `moradores`, `ocorrencias`, `prestadores-servicos`, `visitantes`:

- `components/<Domain>List.tsx` — orchestrator: calls the list hook, picks mobile vs desktop via `useMediaQuery(theme.breakpoints.down('sm'))`, handles loading/error/empty inline (see below), delegates to Table or MobileList.
- `components/<Domain>Table.tsx` / `mobile/<Domain>MobileList.tsx` — the responsive split, both fed the same `records` prop. Mobile-specific components live in a dedicated `mobile/` subfolder, as a sibling of `components/`.
- `components/Register<Domain>Form.tsx` / `components/Register<Domain>Button.tsx`.
- `hooks/use<Domain>.ts`, `hooks/useCreate<Domain>.ts` — `hooks/` (and `context/`/`providers/`/`styles/` where present) stay as siblings of `components/`/`mobile/`, not nested inside them.

Most domain folders have **no** `index.ts` barrel — import each file directly by path. Barrels only exist for `modules/form/` (`modules/form/index.ts` re-exporting from `./components/`), `providers/`, `modules/sideBar/`, `modules/topBar/`, `lib/mui/`.

## BFF layer (`src/app/api/<domain>/`)

Each route folder is `route.ts` + `helpers.ts` + `types.ts`:

- `route.ts` reads the httpOnly access-token cookie via `cookies()`, 401s if missing, calls the domain's `request<Domain>Api()` helper, and on a thrown API error returns `NextResponse.json({ message }, { status })` — clearing the cookie first if `error.clearCookie` (set when the API returned 401/403).
- `helpers.ts` iterates `getApiBaseUrls()` (Docker vs local fallback base URLs) and `fetch`es the Express API with `Authorization: Bearer <token>` and `cache: 'no-store'`.
- Each domain defines its own `<Domain>ApiError extends Error` with `status`/`clearCookie` fields — this is duplicated per domain rather than shared. Match this existing shape when adding a new BFF route; don't try to unify it as part of an unrelated task.

## Services & hooks

- `services/shared/http.ts` exports `safeReadJson()` / `getApiErrorMessage()`, used by every `services/<domain>/service.ts`. Note: the BFF `helpers.ts` files independently re-implement the same two functions locally rather than importing from `services/shared/http.ts` — that's existing duplication, not something you're missing.
- Client services call the Next.js BFF routes (`fetch('/api/residents...')`), **never** the Express API directly, and throw a per-domain `<Domain>ServiceError extends Error` on a non-ok or malformed response.

## Loading / error / empty states

- There are no `loading.tsx`, `error.tsx`, or `not-found.tsx` route boundaries anywhere under `app/` — don't assume one exists to hook into.
- Convention instead, inline in the `*List.tsx` orchestrators: `isError` → MUI `Alert severity="error"` with a "Tentar novamente" button calling `refetch()`; `isLoading` → `CircularProgress`; empty result → a `Typography` message inside `MobileList`/`Table` (e.g. "Nenhum morador encontrado."), or `DataTable`'s built-in `emptyMessage` prop.

## Authentication (frontend)

- `lib/auth/session.ts` owns tenant-slug extraction/normalization (`extractTenantSlugFromHost`, `normalizeTenantSlug`, `isValidTenantSlug`) and `getApiBaseUrls()`.
- Access-token cookie: `cp_access_token`, httpOnly, `secure` in production, `sameSite: 'lax'`, 24h `maxAge` — set only from `app/api/auth/login/route.ts`. Never read it from client JS; go through a BFF route or `useAuthenticatedUser()`.
- `lib/permissions/permissions.ts` mirrors the API's role × resource × action matrix and is consumed through the `useCan` hook (and `proxy.ts`) to hide/disable UI. It is a UX aid only — the API enforces authorization; keep both matrices in sync when a permission changes.
- `src/proxy.ts` guards `PROTECTED_ROUTE_PREFIXES`, validates the cookie against `/auth/me` on every matched request, and redirects unauthenticated/invalid sessions to `/`.

## Multi-tenancy (frontend)

- The frontend never sends a separate tenant header/param on domain requests — tenant identity lives entirely inside the JWT after login. Login resolves `condominiumId` once (explicit `condominiumSlug` in the request body, or the subdomain) via `GET /condominiums/slug/:slug/id`, then sends it to `/auth/login`.
- `condominiumId` appears in a couple of auth-related types (`app/api/auth/me/types.ts`, `app/api/auth/login/types.ts`) but is never rendered in the UI — there's no tenant-id display/selection UI today.

## TypeScript

- `strict: true`; zero `any`/`as any` found anywhere in `src`.
- `type` is strongly preferred over `interface` (~149 vs ~14 occurrences) — match this when adding new types.

## Reuse / known duplication

- `modules/form/` barrel (`TextField`, `TextFieldStack`, `FormPaper`, `ColorSelect`, `PersonTypeSelect`, `LocomotionSelect`) is the shared form-primitive layer — reuse these instead of styling raw MUI inputs.
- There is no shared `utils/`/`helpers/` module for formatting. Formatting logic (e.g. `formatVehicles()`) is currently duplicated per component (`moradores/components/ResidentsTable.tsx` and `moradores/mobile/ResidentsMobileList.tsx` each define their own copy) — extracting a shared helper is reasonable if you're touching this area, but don't assume one already exists elsewhere.

## Performance

- `useMemo` appears only in a few places (route-config hooks, snackbar context value). `useCallback`, `React.memo`, `next/dynamic`, and `next/image` are not used anywhere in `src`. There's no established memoization/code-splitting convention to follow here — if you add one, you're setting precedent, not matching it.

## Accessibility

- Current coverage is limited to `aria-label` on a handful of icon-only buttons (password-visibility toggle, add/remove vehicle, row actions) and one `alt` on the login logo. No `role=` attributes anywhere in `src`. Treat this as a low bar to raise on new work, not a pattern to strictly replicate.

## Naming conventions

- Components PascalCase; hooks camelCase `use*` inside a domain's local `hooks/` folder; domain folders mostly kebab-case Portuguese route names (`prestadores-servicos`, `ocorrencias`) — except `sideBar` and `topBar`, which are camelCase (pre-existing inconsistency, not something to copy for new folders).
