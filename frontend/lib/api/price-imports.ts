import { createApiClient } from './client'
import { backendApiBreaker } from './circuit-breaker'

// PDF parsing + matching can take longer than the default 15s window, and
// these endpoints create/mutate DB records — retries are disabled so a slow
// response never causes a duplicate import or a double price-apply.
function resolveBackendUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://nginx:8082/api'
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api'
}

const api = createApiClient({
  baseUrl: resolveBackendUrl(),
  timeoutMs: 60_000,
  retries: 0,
  breaker: backendApiBreaker,
})

export type PriceImportItemStatus =
  | 'MATCHED'
  | 'NOT_FOUND'
  | 'AMBIGUOUS'
  | 'DUPLICATE'
  | 'INVALID_PRICE'
  | 'APPLIED'
  | 'SKIPPED'
  | 'ROLLED_BACK'

export type PriceImportStatus = 'PREVIEW' | 'APPLIED' | 'ROLLED_BACK'

export interface PriceImportItem {
  id: string
  rowIndex: number
  articleNumber: string
  description: string | null
  content: string | null
  newSupplierPrice: number | null
  newSellingPrice: number | null
  oldSellingPrice: number | null
  oldSupplierPrice: number | null
  changePercent: number | null
  status: PriceImportItemStatus
  isSuspicious: boolean
  warning: string | null
  selected: boolean
  product?: { id: string; nameFr: string; sku: string } | null
}

export interface PriceImportUser {
  id: string
  name: string | null
  email: string
}

export interface PriceImport {
  id: string
  filename: string
  fileUrl: string | null
  supplier: string | null
  parserKey: string
  status: PriceImportStatus
  detectedCount: number
  matchedCount: number
  unmatchedCount: number
  duplicateCount: number
  updatedCount: number
  appliedAt: string | null
  rolledBackAt: string | null
  createdAt: string
  uploadedBy?: PriceImportUser | null
  appliedBy?: PriceImportUser | null
  rolledBackBy?: PriceImportUser | null
  items: PriceImportItem[]
}

export interface PriceImportHistoryPage {
  data: Omit<PriceImport, 'items'>[]
  total: number
  page: number
  totalPages: number
}

export const priceImportsApi = {
  preview: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<PriceImport>('/admin/price-imports/preview', formData)
  },

  apply: (importId: string, itemIds: string[]) =>
    api.post<PriceImport>(`/admin/price-imports/${importId}/apply`, { itemIds }),

  rollback: (importId: string) =>
    api.post<PriceImport>(`/admin/price-imports/${importId}/rollback`, {}),

  getHistory: (page = 1, limit = 20) =>
    api.get<PriceImportHistoryPage>('/admin/price-imports', { params: { page, limit } }),

  getOne: (id: string) => api.get<PriceImport>(`/admin/price-imports/${id}`),
}
