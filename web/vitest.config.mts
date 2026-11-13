import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const alias = {
  '@test': fileURLToPath(new URL('./test', import.meta.url)),
  '@': fileURLToPath(new URL('./src', import.meta.url)),
}

/**
 * Dois projetos, separados pela extensão do arquivo de teste:
 * - `node`: `*.test.ts` — BFF (`app/api/**`), `proxy.ts`, `lib/`, `services/`.
 *   Roda no runtime Node, com `Request`/`Response`/`fetch` nativos (como os Route Handlers).
 * - `dom`: `*.test.tsx` — hooks e componentes React em jsdom + Testing Library.
 */
export default defineConfig({
  resolve: { alias },
  test: {
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
          setupFiles: ['./test/setup.node.ts'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx', 'test/**/*.test.tsx'],
          setupFiles: ['./test/setup.dom.ts'],
        },
      },
    ],
  },
})
