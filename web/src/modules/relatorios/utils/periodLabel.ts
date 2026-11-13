import type { ReportsPeriodFilter } from '@/types/relatorios'

function formatDateBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

const SHORTCUT_LABELS: Record<string, string> = {
  hoje: 'Hoje',
  '7': 'Últimos 7 dias',
  '30': 'Últimos 30 dias',
  mes: 'Este mês',
  todos: 'Todo o período',
}

/**
 * Descreve, em texto legível, o período atualmente selecionado no filtro de relatórios.
 */
export function getPeriodLabel(filter: ReportsPeriodFilter): string {
  if (filter.from && filter.to) {
    return `${formatDateBr(filter.from)} — ${formatDateBr(filter.to)}`
  }

  if (filter.from) {
    return `a partir de ${formatDateBr(filter.from)}`
  }

  if (filter.to) {
    return `até ${formatDateBr(filter.to)}`
  }

  return SHORTCUT_LABELS[filter.shortcut ?? 'todos'] ?? 'Todo o período'
}
