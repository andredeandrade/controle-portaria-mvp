import { describe, expect, it } from 'vitest'

import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import {
  AccessRecordsApiError,
  clearAccessToken,
  getErrorMessage,
  readAccessToken,
  requestAccessRecordsApi,
} from './helpers'

describeDomainHelpersContract({
  resourcePath: '/access-records',
  request: requestAccessRecordsApi,
  ApiError: AccessRecordsApiError,
  getErrorMessage,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar registros de acesso.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de registros de acesso.',
  readsExpressErrorField: true,
})

describe('getErrorMessage (access-records)', () => {
  it('prioriza `error` (formato da API Express) sobre `message`', () => {
    expect(getErrorMessage({ error: 'Pessoa já está dentro.', message: 'antigo' }, 'fb')).toBe(
      'Pessoa já está dentro.',
    )
  })

  it('cai em `message` quando `error` está vazio', () => {
    expect(getErrorMessage({ error: '', message: 'Mensagem legada.' }, 'fb')).toBe(
      'Mensagem legada.',
    )
  })
})
