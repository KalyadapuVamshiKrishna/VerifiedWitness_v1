export interface ConsistencyFlag {
  field: string
  description: string
}

export interface MetadataFindings {
  evidenceId: string
  camera?: {
    make?: string
    model?: string
    lens?: string
  }
  gps?: {
    lat: number
    lng: number
    altitude?: number
  }
  timestamps: {
    captured?: string
    modified?: string
    digitized?: string
  }
  orientation?: string
  resolution?: {
    width: number
    height: number
  }
  editingSoftware: string[]
  colorSpace?: string
  compression?: string
  missingFields: string[]
  consistencyFlags: ConsistencyFlag[]
  integrityScore: number
  raw: Record<string, unknown>
}

export interface OcrWord {
  text: string
  confidence: number
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

export interface OcrFindings {
  evidenceId: string
  fullText: string
  confidence: number
  language: string
  words: OcrWord[]
  issues: string[]
  page?: number
  pageResults?: OcrFindings[]
}

export type AiObservationCategory =
  | 'lighting'
  | 'perspective'
  | 'shadow'
  | 'reflection'
  | 'object_consistency'
  | 'editing_clue'
  | 'scene_context'
  | 'anomaly'

export interface AiObservation {
  category: AiObservationCategory
  finding: string
  consistent: boolean | null
  confidence: number
  evidenceRef?: string
}

export interface AiFindings {
  evidenceId: string
  observations: AiObservation[]
  sceneDescription: string
  recommendations: string[]
  modelVersion: string
  rawResponse?: unknown
}
