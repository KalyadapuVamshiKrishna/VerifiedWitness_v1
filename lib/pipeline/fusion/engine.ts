import type {
  MetadataFindings,
  OcrFindings,
  AiFindings,
  CorrelationResult,
  FusionResult,
  FusionSource,
  FusionContribution,
  FusionDeduction,
  FusionRedistribution,
} from '@/lib/types'
import { BASE_WEIGHTS, CORRELATION_CONFLICT_SEVERITY, deriveVerdict } from './weights'

function computeAbsence(
  metadata: MetadataFindings,
  ocr: OcrFindings,
  ai: AiFindings,
  correlation: CorrelationResult
): Record<FusionSource, boolean> {
  return {
    metadata: ['camera', 'gps', 'timestamps.captured', 'resolution'].every((f) => metadata.missingFields.includes(f)),
    ocr: ocr.fullText.trim().length === 0,
    ai: ai.observations.length === 0,
    correlation: correlation.matrix.length === 0 || correlation.matrix.every((c) => c.status === 'insufficient_data'),
  }
}

function redistributeWeights(absence: Record<FusionSource, boolean>): {
  weights: Record<FusionSource, number>
  redistributions: FusionRedistribution[]
} {
  const sources: FusionSource[] = ['metadata', 'ocr', 'ai', 'correlation']
  const present = sources.filter((s) => !absence[s])
  const absent = sources.filter((s) => absence[s])

  const weights = { ...BASE_WEIGHTS }
  const redistributions: FusionRedistribution[] = []

  if (absent.length > 0 && present.length > 0) {
    const totalAbsentWeight = absent.reduce((sum, s) => sum + BASE_WEIGHTS[s], 0)
    const totalPresentWeight = present.reduce((sum, s) => sum + BASE_WEIGHTS[s], 0)

    for (const s of absent) {
      weights[s] = 0
      redistributions.push({
        originalSource: s,
        originalWeight: BASE_WEIGHTS[s],
        redistributedTo: present,
        reason: `${s} signal entirely absent — its weight was redistributed proportionally across ${present.join(', ')}.`,
      })
    }
    for (const s of present) {
      weights[s] = BASE_WEIGHTS[s] + (BASE_WEIGHTS[s] / totalPresentWeight) * totalAbsentWeight
    }
  }

  return { weights, redistributions }
}

/**
 * The only entity allowed to carry a score. Deterministic — no LLM call anywhere in this
 * file. Every point in trustScore traces back to a contributions[]/deductions[] entry.
 */
export function runFusion(
  metadata: MetadataFindings,
  ocr: OcrFindings,
  ai: AiFindings,
  correlation: CorrelationResult,
  evidenceId: string
): FusionResult {
  const absence = computeAbsence(metadata, ocr, ai, correlation)
  const { weights, redistributions } = redistributeWeights(absence)

  const contributions: FusionContribution[] = []
  const deductions: FusionDeduction[] = []

  if (!absence.metadata) {
    contributions.push({
      source: 'metadata',
      points: weights.metadata * 100 * (metadata.integrityScore / 100),
      reason: `Metadata integrity score ${metadata.integrityScore}/100.`,
      evidenceRef: 'metadata.integrityScore',
    })
  }

  if (!absence.ocr) {
    contributions.push({
      source: 'ocr',
      points: weights.ocr * 100 * (ocr.confidence / 100),
      reason: `OCR aggregate confidence ${ocr.confidence.toFixed(0)}%.`,
      evidenceRef: 'ocr.confidence',
    })
  }

  if (!absence.ai) {
    const inconsistentCount = ai.observations.filter((o) => o.consistent === false).length
    const cleanliness = 1 - inconsistentCount / ai.observations.length
    contributions.push({
      source: 'ai',
      points: weights.ai * 100 * cleanliness,
      reason: `${ai.observations.length - inconsistentCount} of ${ai.observations.length} AI observations reported as consistent.`,
      evidenceRef: 'ai.observations',
    })
  }

  if (!absence.correlation) {
    const scorableChecks = correlation.matrix.filter((c) => c.status !== 'insufficient_data')
    const perCheckPoints = scorableChecks.length > 0 ? (weights.correlation * 100) / scorableChecks.length : 0

    for (const check of correlation.matrix) {
      if (check.status === 'agree') {
        contributions.push({ source: 'correlation', points: perCheckPoints, reason: check.description, evidenceRef: check.id })
      } else if (check.status === 'conflict') {
        deductions.push({
          source: 'correlation',
          points: -(CORRELATION_CONFLICT_SEVERITY[check.id] ?? 10),
          reason: check.description,
          evidenceRef: check.id,
        })
      }
    }
  }

  const rawScore = [...contributions, ...deductions].reduce((sum, c) => sum + c.points, 0)
  const trustScore = Math.round(Math.max(0, Math.min(100, rawScore)))
  const fraudProbability = Math.round(Math.max(0, Math.min(100, 100 - trustScore)))

  const absentCount = Object.values(absence).filter(Boolean).length
  const gapCount = correlation.gaps.length
  const confidence = Math.round(Math.max(0, Math.min(100, 100 - absentCount * 20 - gapCount * 10)))

  const verdict = deriveVerdict(trustScore, confidence)

  const reasoning: string[] = [
    ...contributions.map((c) => `+${c.points.toFixed(1)} (${c.source}): ${c.reason}`),
    ...deductions.map((d) => `${d.points.toFixed(1)} (${d.source}): ${d.reason}`),
    ...redistributions.map((r) => r.reason),
    `Confidence ${confidence}/100 reflects ${absentCount} absent signal source(s) and ${gapCount} correlation gap(s) — these are not counted as tampering evidence, only as thinner corroboration.`,
    `Final trust score: ${trustScore}/100 (verdict: ${verdict}).`,
  ]

  return {
    evidenceId,
    trustScore,
    fraudProbability,
    confidence,
    verdict,
    weights,
    contributions,
    deductions,
    redistributions,
    reasoning,
    computedAt: new Date().toISOString(),
  }
}
