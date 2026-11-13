import type { UserOptions } from 'jspdf-autotable'

import { REPORT_MODULES, type ReportRow } from './reportDefs'
import { fetchReportPage } from './service'
import type { ReportModuleKey, ReportsPeriodFilter } from '@/types/relatorios'

type ReportSection = {
  title: string
  columns: string[]
  columnStyles?: UserOptions['columnStyles']
  rows: ReportRow[]
}

/** Converte as linhas do relatório para o jspdf-autotable; cabeçalhos de grupo ocupam todas as colunas. */
function toTableBody(section: ReportSection) {
  return section.rows.map((row) =>
    Array.isArray(row)
      ? row
      : [
          {
            content: row.group,
            colSpan: section.columns.length,
            styles: {
              fontStyle: 'bold' as const,
              fillColor: [226, 232, 240] as [number, number, number],
              textColor: [15, 23, 42] as [number, number, number],
            },
          },
        ],
  )
}

async function fetchAllPages<T>(path: string, params?: URLSearchParams): Promise<T[]> {
  const allItems: T[] = []
  let page = 1
  const pageSize = 100

  do {
    const p = new URLSearchParams(params)
    p.set('page', String(page))
    p.set('pageSize', String(pageSize))

    const result = await fetchReportPage<T>(path, p)
    allItems.push(...result.items)

    if (page >= result.pagination.totalPages) break
    page++
  } while (true)

  return allItems
}

/**
 * Monta os parâmetros de período (from/to) para envio à API de relatórios.
 * Sem `from`/`to` preenchidos, nenhum filtro é aplicado (todos os registros).
 */
function paramsFromFilter(filter: ReportsPeriodFilter): URLSearchParams {
  const params = new URLSearchParams()

  if (filter.from && filter.to) {
    params.set('from', filter.from)
    params.set('to', filter.to)
  }

  return params
}

function addPdfSection(
  doc: import('jspdf').jsPDF,
  autoTable: (typeof import('jspdf-autotable'))['default'],
  section: ReportSection,
): void {
  doc.setFontSize(14)
  doc.text(section.title, 14, 16)
  doc.setFontSize(9)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [section.columns],
    body: toTableBody(section),
    styles: { fontSize: 8, cellPadding: 2, valign: 'top' },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: section.columnStyles,
  })
}

/** Gera o PDF de um módulo: a tabela principal e, em páginas seguintes, as tabelas de detalhe. */
async function buildPdf(sections: ReportSection[]): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'landscape' })

  sections.forEach((section, index) => {
    if (index > 0) doc.addPage()
    addPdfSection(doc, autoTable, section)
  })

  const [main] = sections
  doc.save(`${(main?.title ?? 'relatorio').toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

/**
 * Gera um único PDF com uma seção (título + tabela) por módulo, evitando disparar
 * vários downloads separados de uma vez — o que navegadores bloqueiam silenciosamente
 * a partir do segundo arquivo automático.
 */
async function buildCombinedPdf(sections: ReportSection[]): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'landscape' })

  sections.forEach((section, index) => {
    if (index > 0) doc.addPage()
    addPdfSection(doc, autoTable, section)
  })

  doc.save('relatorios-geral.pdf')
}

/**
 * Busca os dados de um módulo e monta suas seções: a tabela principal e as tabelas
 * de detalhe (ex.: acessos de convidados e veículos no relatório de eventos).
 * Tabelas de detalhe sem linhas são omitidas.
 */
async function fetchReportSections(
  moduleKey: ReportModuleKey,
  filter: ReportsPeriodFilter,
): Promise<ReportSection[]> {
  const def = REPORT_MODULES[moduleKey]
  const items = await fetchAllPages<unknown>(def.bffPath, paramsFromFilter(filter))

  const mainSection: ReportSection = {
    title: def.label,
    columns: def.columns,
    columnStyles: def.columnStyles,
    rows: items.map((item) => def.mapRow(item)),
  }

  const detailSections = (def.detailSections ?? [])
    .map(
      (detail): ReportSection => ({
        title: detail.title,
        columns: detail.columns,
        columnStyles: detail.columnStyles,
        rows: items.flatMap((item) => detail.mapRows(item)),
      }),
    )
    .filter((section) => section.rows.length > 0)

  return [mainSection, ...detailSections]
}

export async function exportReport(
  moduleKey: ReportModuleKey,
  filter: ReportsPeriodFilter,
): Promise<void> {
  const sections = await fetchReportSections(moduleKey, filter)
  await buildPdf(sections)
}

/**
 * Exporta todos os módulos de relatório em um único PDF (uma seção por módulo),
 * gerando um só download em vez de um por módulo.
 */
export async function exportAllReports(filter: ReportsPeriodFilter): Promise<void> {
  const sections: ReportSection[] = []

  for (const moduleKey of Object.keys(REPORT_MODULES) as ReportModuleKey[]) {
    sections.push(...(await fetchReportSections(moduleKey, filter)))
  }

  await buildCombinedPdf(sections)
}
