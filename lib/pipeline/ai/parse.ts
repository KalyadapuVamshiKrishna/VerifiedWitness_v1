import type { AiFindings, AiObservation, AiObservationCategory } from '@/lib/types'
import { AI_OBSERVATION_CATEGORIES } from './prompts'

// Second line of defense (first is the system instruction in prompts.ts): if Gemini's
// output ever contains a score/verdict-like key at any depth, it's flagged and — since
// the fields below are only ever reconstructed explicitly, never spread from `raw` —
// such a field is structurally excluded from the resulting AiFindings regardless.
const FORBIDDEN_KEY_PATTERN = /score|verdict|fraud|trust|authentic/i

function scanForForbiddenKeys(value: unknown, path: string, hits: string[]): void {
  if (value === null || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((item, i) => scanForForbiddenKeys(item, `${path}[${i}]`, hits))
    return
  }
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEY_PATTERN.test(key)) hits.push(`${path}.${key}`)
    scanForForbiddenKeys(nested, `${path}.${key}`, hits)
  }
}

function isValidCategory(value: unknown): value is AiObservationCategory {
  return typeof value === 'string' && (AI_OBSERVATION_CATEGORIES as readonly string[]).includes(value)
}

export interface ParsedAiResponse {
  findings: AiFindings
  policyWarnings: string[]
}

export function parseAiResponse(rawText: string, evidenceId: string, modelVersion: string): ParsedAiResponse {
  let raw: unknown
  try {
    raw = JSON.parse(rawText)
  } catch {
    throw new Error('Gemini response was not valid JSON.')
  }

  const policyWarnings: string[] = []
  const forbiddenHits: string[] = []
  scanForForbiddenKeys(raw, 'response', forbiddenHits)
  if (forbiddenHits.length > 0) {
    policyWarnings.push(
      `Gemini response contained disallowed score/verdict-like field(s): ${forbiddenHits.join(', ')} — discarded, only whitelisted observation fields are used.`
    )
  }

  const rawObj = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const rawObservations = Array.isArray(rawObj.observations) ? rawObj.observations : []

  const observations: AiObservation[] = []
  for (const item of rawObservations) {
    if (typeof item !== 'object' || item === null) continue
    const o = item as Record<string, unknown>
    if (!isValidCategory(o.category) || typeof o.finding !== 'string' || typeof o.confidence !== 'number') {
      continue
    }
    observations.push({
      category: o.category,
      finding: o.finding,
      consistent: typeof o.consistent === 'boolean' ? o.consistent : null,
      confidence: Math.max(0, Math.min(100, o.confidence)),
      evidenceRef: typeof o.evidenceRef === 'string' ? o.evidenceRef : undefined,
    })
  }

  const recommendations = Array.isArray(rawObj.recommendations)
    ? rawObj.recommendations.filter((r): r is string => typeof r === 'string')
    : []

  const findings: AiFindings = {
    evidenceId,
    observations,
    sceneDescription: typeof rawObj.sceneDescription === 'string' ? rawObj.sceneDescription : '',
    recommendations,
    modelVersion,
    rawResponse: raw,
  }

  return { findings, policyWarnings }
}
