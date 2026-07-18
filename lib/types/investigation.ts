export type InvestigationStatus = 'intake' | 'processing' | 'complete' | 'failed'

export interface Investigation {
  id: string
  name: string
  status: InvestigationStatus
  createdAt: string
  updatedAt: string
  summary?: string
  evidenceId: string
  trustScore?: number
}

export type EvidenceMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'

export interface Evidence {
  id: string
  investigationId: string
  fileName: string
  mimeType: EvidenceMimeType
  fileSizeBytes: number
  sha256: string
  blobUrl: string
  blobPathname: string
  uploadedAt: string
  pageCount?: number
}
