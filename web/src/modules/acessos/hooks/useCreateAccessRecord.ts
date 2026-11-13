'use client'

import type { AccessRecord, CreateAccessRecordRequest } from '@/app/api/access-records/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { AccessRecordsServiceError, registerAccessRecord } from '@/services/acessos/service'

export function useCreateAccessRecord() {
  const queryClient = useQueryClient()

  return useMutation<AccessRecord, AccessRecordsServiceError, CreateAccessRecordRequest>({
    mutationFn: registerAccessRecord,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'access-records')
    },
  })
}
