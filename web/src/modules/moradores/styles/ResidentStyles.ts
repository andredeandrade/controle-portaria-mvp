import { ResidentRelationEnum } from '@/types/moradores'

/**
 * Mapa de cores dos chips de categoria de morador, reaproveitado entre a
 * tabela desktop e o card mobile.
 */
export const residentCategoryChipColor: Record<string, { bg: string; color: string }> = {
  [ResidentRelationEnum.PROPRIETARIO]: { bg: 'rgba(78, 222, 163, 0.16)', color: '#4edea3' },
  [ResidentRelationEnum.INQUILINO]: { bg: 'rgba(173, 198, 255, 0.16)', color: '#adc6ff' },
  [ResidentRelationEnum.DEPENDENTE]: { bg: 'rgba(255, 185, 95, 0.16)', color: '#ffb95f' },
}

export const DEFAULT_RESIDENT_CATEGORY_CHIP_COLOR = {
  bg: 'rgba(173, 198, 255, 0.12)',
  color: '#adc6ff',
}
