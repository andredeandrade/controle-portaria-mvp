/**
 * Executado em cada worker antes de importar os arquivos de teste, para que
 * `src/config/env.ts` já leia as variáveis de `api/.env.test`.
 */

import { loadTestEnv } from './env.js'

loadTestEnv()
