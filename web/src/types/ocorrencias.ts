export enum OccurrenceTypeEnum {
  ORIENTACAO = 'orientacao',
  AVERIGUACAO_ATITUDE_SUSPEITA = 'averiguacao_atitude_suspeita',
  ACESSO_NAO_AUTORIZADO = 'acesso_nao_autorizado',
  VEICULO_ATITUDE_SUSPEITA = 'veiculo_atitude_suspeita',
  DISCUSSAO_CONFLITO = 'discussao_conflito',
  FALHA_TECNICA = 'falha_tecnica',
  FALTA_ENERGIA = 'falta_energia',
  FALTA_AGUA = 'falta_agua',
  PERTUBACAO_SOSSEGO = 'pertubacao_sossego',
  INCENDIO = 'incendio',
  EMERGENCIA_MEDICA = 'emergencia_medica',
  DESCARTE_IRREGULAR_LIXO = 'descarte_irregular_lixo',
  RESGATE_OU_INVASAO_ANIMAL = 'resgate_ou_invasao_animal',
  FURTO = 'furto',
  ROUBO = 'roubo',
  VANDALISMO = 'vandalismo',
  OUTRO = 'outro',
}

export const OCCURRENCE_TYPE_LABEL: Record<OccurrenceTypeEnum, string> = {
  [OccurrenceTypeEnum.ORIENTACAO]: 'Orientacao',
  [OccurrenceTypeEnum.AVERIGUACAO_ATITUDE_SUSPEITA]: 'Averiguacao atitude suspeita',
  [OccurrenceTypeEnum.ACESSO_NAO_AUTORIZADO]: 'Acesso nao autorizado',
  [OccurrenceTypeEnum.VEICULO_ATITUDE_SUSPEITA]: 'Veiculo atitude suspeita',
  [OccurrenceTypeEnum.DISCUSSAO_CONFLITO]: 'Discussao conflito',
  [OccurrenceTypeEnum.FALHA_TECNICA]: 'Falha tecnica',
  [OccurrenceTypeEnum.FALTA_ENERGIA]: 'Falta de energia',
  [OccurrenceTypeEnum.FALTA_AGUA]: 'Falta de agua',
  [OccurrenceTypeEnum.PERTUBACAO_SOSSEGO]: 'Pertubacao do sossego',
  [OccurrenceTypeEnum.INCENDIO]: 'Incendio',
  [OccurrenceTypeEnum.EMERGENCIA_MEDICA]: 'Emergencia medica',
  [OccurrenceTypeEnum.DESCARTE_IRREGULAR_LIXO]: 'Descarte irregular de lixo',
  [OccurrenceTypeEnum.RESGATE_OU_INVASAO_ANIMAL]: 'Resgate ou invasao animal',
  [OccurrenceTypeEnum.FURTO]: 'Furto',
  [OccurrenceTypeEnum.ROUBO]: 'Roubo',
  [OccurrenceTypeEnum.VANDALISMO]: 'Vandalismo',
  [OccurrenceTypeEnum.OUTRO]: 'Outro',
}

export const OCCURRENCE_TYPE_OPTIONS = Object.values(OccurrenceTypeEnum).map((value) => ({
  value,
  label: OCCURRENCE_TYPE_LABEL[value],
}))

export type OccurrenceRecord = {
  id: string
  occurrenceType: string
  occurrenceTypeLabel: string
  date: string
  time: string
  place: string
  report: string
  createdByUserName: string
}

export type OccurrencesPaginationState = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
