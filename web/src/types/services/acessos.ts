import type { AccessRecord, AccessRecordsListResponse } from '@/app/api/access-records/types'

export type ListAccessRecordsApiResponseBody =
  | ({ message?: string } & Partial<AccessRecordsListResponse>)
  | null

export type RegisterAccessRecordApiResponseBody =
  | ({ message?: string } & Partial<AccessRecord>)
  | null

export type CheckOutAccessRecordApiResponseBody =
  | ({ message?: string } & Partial<AccessRecord>)
  | null
