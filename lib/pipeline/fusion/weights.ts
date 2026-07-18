import type { FusionSource, FusionVerdict } from '@/lib/types'

export const BASE_WEIGHTS: Record<FusionSource, number> = {
  metadata: 0.3,
  ocr: 0.2,
  ai: 0.3,
  correlation: 0.2,
}

// Deduction magnitude per correlation check id when it reports 'conflict'. Deliberately
// asymmetric vs. the positive contribution an 'agree' on the same check would earn —
// evidence suggestive of tampering is weighted more heavily than its mere absence.
export const CORRELATION_CONFLICT_SEVERITY: Record<string, number> = {
  timestampVsOcrDate: 12,
  gpsVsAiSceneContext: 8,
  editingSoftwareVsAiEditingClues: 15,
}

export function deriveVerdict(trustScore: number, confidence: number): FusionVerdict {
  if (trustScore >= 80 && confidence >= 50) return 'verified'
  if (trustScore >= 80) return 'inconclusive'
  if (trustScore >= 50) return 'suspicious'
  return 'likely_manipulated'
}
