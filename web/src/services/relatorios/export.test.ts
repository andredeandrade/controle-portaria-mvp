import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReportsPeriodFilter } from '@/types/relatorios'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'

import { exportAllReports, exportReport } from './export'

type AutoTableOptions = { head: string[][]; body: unknown[][]; startY: number }

const pdf = vi.hoisted(() => {
  const docs: Array<{
    options: unknown
    texts: string[]
    pages: number
    savedAs: string | null
  }> = []
  const tables: Array<{ docIndex: number; options: AutoTableOptions }> = []

  class FakeJsPdf {
    private readonly index: number

    constructor(options: unknown) {
      this.index = docs.push({ options, texts: [], pages: 1, savedAs: null }) - 1
    }

    setFontSize(): void {}

    text(value: string): void {
      docs[this.index]?.texts.push(value)
    }

    addPage(): void {
      const doc = docs[this.index]
      if (doc) doc.pages += 1
    }

    save(filename: string): void {
      const doc = docs[this.index]
      if (doc) doc.savedAs = filename
    }

    get docIndex(): number {
      return this.index
    }
  }

  return { docs, tables, FakeJsPdf }
})

// Fronteira: jspdf gera/baixa arquivo de verdade; aqui só registramos as chamadas.
vi.mock('jspdf', () => ({ jsPDF: pdf.FakeJsPdf }))
vi.mock('jspdf-autotable', () => ({
  default: (doc: InstanceType<typeof pdf.FakeJsPdf>, options: AutoTableOptions) => {
    pdf.tables.push({ docIndex: doc.docIndex, options })
  },
}))

const SEM_FILTRO: ReportsPeriodFilter = { from: '', to: '', shortcut: 'todos' }
const NOVEMBRO: ReportsPeriodFilter = { from: '2026-11-01', to: '2026-11-30', shortcut: 'mes' }

const OCORRENCIA = {
  date: '2026-11-12',
  time: '23:10',
  occurrenceType: 'falta_agua',
  report: 'Relato fictício.',
  place: null,
  createdByUserName: null,
  createdAt: '2026-11-12T23:10:00.000Z',
}

function page(items: unknown[], pageNumber: number, totalPages: number) {
  return jsonResponse({
    items,
    pagination: { total: items.length, page: pageNumber, pageSize: 100, totalPages },
  })
}

describe('exportReport (PDF de relatórios)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    pdf.docs.length = 0
    pdf.tables.length = 0
  })

  it('busca todas as páginas com o período e gera um PDF paisagem com a tabela', async () => {
    fetchMock
      .mockResolvedValueOnce(page([OCORRENCIA], 1, 2))
      .mockResolvedValueOnce(page([{ ...OCORRENCIA, time: '08:00' }], 2, 2))

    await exportReport('ocorrencias', NOVEMBRO)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(getFetchCall(fetchMock, 0).url).toBe(
      '/api/reports/incidents?from=2026-11-01&to=2026-11-30&page=1&pageSize=100',
    )
    expect(getFetchCall(fetchMock, 1).url).toContain('page=2')

    expect(pdf.docs).toHaveLength(1)
    expect(pdf.docs[0]).toMatchObject({
      options: { orientation: 'landscape' },
      savedAs: 'registro-de-ocorrências.pdf',
    })
    expect(pdf.docs[0]?.texts[0]).toBe('Registro de ocorrências')

    const [table] = pdf.tables
    expect(table?.options.head).toEqual([
      ['Data', 'Hora', 'Tipo', 'Local', 'Relato', 'Cadastrado por'],
    ])
    expect(table?.options.body).toHaveLength(2)
    expect(table?.options.body[0]).toEqual([
      '12/11/2026',
      '23:10',
      'Falta de agua',
      '—',
      'Relato fictício.',
      expect.stringContaining('Usuário removido'),
    ])
  })

  it('não envia from/to quando o período está incompleto', async () => {
    fetchMock.mockResolvedValueOnce(page([], 1, 1))

    await exportReport('ocorrencias', { ...SEM_FILTRO, from: '2026-11-01' })

    expect(getFetchCall(fetchMock).url).toBe('/api/reports/incidents?page=1&pageSize=100')
  })

  it('não gera PDF quando o BFF falha', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Sem permissão.' }, 403))

    await expect(exportReport('ocorrencias', SEM_FILTRO)).rejects.toThrow('Sem permissão.')
    expect(pdf.docs).toHaveLength(0)
  })

  it('exportAllReports gera um único PDF com uma página por módulo', async () => {
    fetchMock.mockImplementation(async () => page([], 1, 1))

    await exportAllReports(SEM_FILTRO)

    const modulos = 7
    expect(fetchMock).toHaveBeenCalledTimes(modulos)
    expect(pdf.docs).toHaveLength(1)
    expect(pdf.docs[0]).toMatchObject({ pages: modulos, savedAs: 'relatorios-geral.pdf' })
    expect(pdf.tables).toHaveLength(modulos)
  })
})
