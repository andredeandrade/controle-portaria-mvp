import { defineConfig } from 'vitest/config'

/**
 * Dois projetos:
 * - `unit`: `*.test.ts` sem banco (roda mesmo sem PostgreSQL).
 * - `integration`: `*.int.test.ts`, usam Supertest + banco `*_test` local.
 *   Rodam em série porque compartilham o mesmo banco (TRUNCATE a cada teste).
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
          exclude: ['**/*.int.test.ts', 'node_modules/**', 'dist/**'],
          setupFiles: ['./test/setup.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['src/**/*.int.test.ts', 'test/**/*.int.test.ts'],
          setupFiles: ['./test/setup.ts', './test/integration-setup.ts'],
          globalSetup: ['./test/global-setup.ts'],
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
})
