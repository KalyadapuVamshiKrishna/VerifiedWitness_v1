import type { MetadataFindings, OcrFindings, AiFindings, CorrelationResult, CorrelationCheck } from '@/lib/types'
import { timestampVsOcrDate, gpsVsAiSceneContext, editingSoftwareVsAiEditingClues } from './checks'

type CheckFn = (metadata: MetadataFindings, ocr: OcrFindings, ai: AiFindings) => CorrelationCheck

// Phase 1 scope: 3 checks. Remaining checks (timestampVsAiSceneContext, resolutionVsAiSceneDetail,
// missingMetadataVsOcrPresence) land in the "full correlation" phase per the build plan.
const CHECKS: CheckFn[] = [timestampVsOcrDate, gpsVsAiSceneContext, editingSoftwareVsAiEditingClues]

/**
 * Deterministic — not another Gemini call. Compares already-structured findings from
 * metadata/OCR/AI and reports agreement, conflict, or insufficient data per check.
 */
export function runCorrelation(
  metadata: MetadataFindings,
  ocr: OcrFindings,
  ai: AiFindings,
  evidenceId: string
): CorrelationResult {
  const matrix = CHECKS.map((check) => check(metadata, ocr, ai))

  return {
    evidenceId,
    matrix,
    conflicts: matrix.filter((c) => c.status === 'conflict'),
    supporting: matrix.filter((c) => c.status === 'agree'),
    gaps: matrix.filter((c) => c.status === 'insufficient_data'),
  }
}
