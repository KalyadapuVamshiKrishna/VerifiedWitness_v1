export type SequenceStageId = 'received' | 'metadata' | 'ocr' | 'ai' | 'correlation' | 'fusion' | 'report'

export interface SequenceStage {
  id: SequenceStageId
  label: string
  durationMs: number
}

// Choreography for the autonomous hero demo — total ≈ 36s, within the 30-45s target.
// Purely illustrative/decorative (not driven by the real pipeline or real evidence).
export const SEQUENCE_STAGES: SequenceStage[] = [
  { id: 'received', label: 'Evidence Received', durationMs: 3000 },
  { id: 'metadata', label: 'Metadata Extraction', durationMs: 5000 },
  { id: 'ocr', label: 'OCR Extraction', durationMs: 5000 },
  { id: 'ai', label: 'AI Visual Investigation', durationMs: 6000 },
  { id: 'correlation', label: 'Evidence Correlation', durationMs: 5000 },
  { id: 'fusion', label: 'VerifiedTrust™ Fusion', durationMs: 6000 },
  { id: 'report', label: 'Verification Report', durationMs: 6000 },
]

export const TOTAL_SEQUENCE_DURATION_MS = SEQUENCE_STAGES.reduce((sum, s) => sum + s.durationMs, 0)
