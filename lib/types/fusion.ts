export type FusionSource = 'metadata' | 'ocr' | 'ai' | 'correlation'

export type FusionVerdict = 'verified' | 'suspicious' | 'inconclusive' | 'likely_manipulated'

export interface FusionContribution {
  source: FusionSource
  points: number
  reason: string
  evidenceRef?: string
}

export interface FusionDeduction {
  source: FusionSource
  reason: string
  points: number
  evidenceRef?: string
}

export interface FusionRedistribution {
  originalSource: FusionSource
  originalWeight: number
  redistributedTo: FusionSource[]
  reason: string
}

export interface FusionResult {
  evidenceId: string
  trustScore: number
  fraudProbability: number
  confidence: number
  verdict: FusionVerdict
  weights: Record<FusionSource, number>
  contributions: FusionContribution[]
  deductions: FusionDeduction[]
  redistributions: FusionRedistribution[]
  reasoning: string[]
  computedAt: string
}
