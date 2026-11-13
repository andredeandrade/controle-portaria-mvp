'use client'

import type { AccessRecord, CheckOutAccessRecordRequest } from '@/app/api/access-records/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { AccessRecordsServiceError, checkOutAccessRecord } from '@/services/acessos/service'

export function useCheckOutAccessRecord() {
  const queryClient = useQueryClient()

  return useMutation<AccessRecord, AccessRecordsServiceError, CheckOutAccessRecordRequest>({
    mutationFn: checkOutAccessRecord,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'access-records')
    },
  })
}
