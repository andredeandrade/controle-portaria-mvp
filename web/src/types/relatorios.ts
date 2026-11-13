export type ReportModuleKey =
  | 'acessos'
  | 'moradores'
  | 'visitantes'
  | 'prestadores'
  | 'eventos'
  | 'ocorrencias'
  | 'autorizacoes'

export type ReportPeriodShortcut = 'hoje' | '7' | '30' | 'mes' | 'todos'

export type ReportsPeriodFilter = {
  from: string
  to: string
  shortcut: ReportPeriodShortcut | null
}
