export type CorrelationSource = 'metadata' | 'ocr' | 'ai'

export type CorrelationStatus = 'agree' | 'conflict' | 'insufficient_data'

export interface CorrelationEvidenceRef {
  source: CorrelationSource
  field: string
  value: unknown
}

export interface CorrelationCheck {
  id: string
  label: string
  sources: CorrelationSource[]
  status: CorrelationStatus
  description: string
  evidenceRefs: CorrelationEvidenceRef[]
}

export interface CorrelationResult {
  evidenceId: string
  matrix: CorrelationCheck[]
  conflicts: CorrelationCheck[]
  supporting: CorrelationCheck[]
  gaps: CorrelationCheck[]
}
