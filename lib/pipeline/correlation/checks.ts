import type { MetadataFindings, OcrFindings, AiFindings, CorrelationCheck, CorrelationStatus } from '@/lib/types'

const DATE_PATTERNS = [
  /\b(19|20)\d{2}[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/g,
  /\b(0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])[-/.](19|20)\d{2}\b/g,
]

function extractDatesFromText(text: string): Date[] {
  const dates: Date[] = []
  for (const pattern of DATE_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const d = new Date(match[0])
      if (!isNaN(d.getTime())) dates.push(d)
    }
  }
  return dates
}

export function timestampVsOcrDate(metadata: MetadataFindings, ocr: OcrFindings): CorrelationCheck {
  const captured = metadata.timestamps.captured ? new Date(metadata.timestamps.captured) : undefined
  const ocrDates = extractDatesFromText(ocr.fullText)

  let status: CorrelationStatus
  let description: string

  if (!captured && ocrDates.length === 0) {
    status = 'insufficient_data'
    description = 'No capture timestamp in metadata and no date text detected via OCR.'
  } else if (!captured || ocrDates.length === 0) {
    status = 'insufficient_data'
    description = captured
      ? 'Capture timestamp present in metadata but no comparable date text found via OCR.'
      : 'Date text found via OCR but no capture timestamp present in metadata.'
  } else {
    const closest = ocrDates.reduce((best, d) =>
      Math.abs(d.getTime() - captured.getTime()) < Math.abs(best.getTime() - captured.getTime()) ? d : best
    )
    const diffDays = Math.abs(closest.getTime() - captured.getTime()) / 86_400_000
    if (diffDays <= 2) {
      status = 'agree'
      description = `OCR-detected date (${closest.toISOString().slice(0, 10)}) is consistent with metadata capture timestamp (${captured.toISOString().slice(0, 10)}).`
    } else {
      status = 'conflict'
      description = `OCR-detected date (${closest.toISOString().slice(0, 10)}) differs from metadata capture timestamp (${captured.toISOString().slice(0, 10)}) by ${Math.round(diffDays)} day(s).`
    }
  }

  return {
    id: 'timestampVsOcrDate',
    label: 'Capture Timestamp vs OCR Date',
    sources: ['metadata', 'ocr'],
    status,
    description,
    evidenceRefs: [
      { source: 'metadata', field: 'timestamps.captured', value: metadata.timestamps.captured },
      { source: 'ocr', field: 'fullText (date extraction)', value: ocrDates.map((d) => d.toISOString()) },
    ],
  }
}

const CLIMATE_KEYWORDS = {
  cold: ['snow', 'ice', 'blizzard', 'frost', 'glacier', 'skiing'],
  tropical: ['palm tree', 'beach', 'desert sand', 'cactus', 'tropical', 'jungle'],
}

function inferClimateZoneFromLat(lat: number): 'cold' | 'tropical' | 'temperate' {
  const abs = Math.abs(lat)
  if (abs > 55) return 'cold'
  if (abs < 23.5) return 'tropical'
  return 'temperate'
}

export function gpsVsAiSceneContext(metadata: MetadataFindings, ocr: OcrFindings, ai: AiFindings): CorrelationCheck {
  const gps = metadata.gps
  const sceneText = [ai.sceneDescription, ...ai.observations.map((o) => o.finding)].join(' ').toLowerCase()

  const mentionsCold = CLIMATE_KEYWORDS.cold.some((k) => sceneText.includes(k))
  const mentionsTropical = CLIMATE_KEYWORDS.tropical.some((k) => sceneText.includes(k))

  let status: CorrelationStatus
  let description: string

  if (!gps || (!mentionsCold && !mentionsTropical)) {
    status = 'insufficient_data'
    description = !gps
      ? 'No GPS coordinates in metadata to compare against the AI scene description.'
      : 'GPS coordinates present but the AI scene description contains no strong climate/geography cues to compare.'
  } else {
    const climateZone = inferClimateZoneFromLat(gps.lat)
    const conflict = (climateZone === 'cold' && mentionsTropical) || (climateZone === 'tropical' && mentionsCold)
    status = conflict ? 'conflict' : 'agree'
    description = conflict
      ? `GPS latitude ${gps.lat.toFixed(2)}° implies a ${climateZone} climate zone, but the AI scene description suggests a ${mentionsTropical ? 'tropical' : 'cold'} setting.`
      : `GPS latitude ${gps.lat.toFixed(2)}° (${climateZone} zone) is consistent with the AI scene description.`
  }

  return {
    id: 'gpsVsAiSceneContext',
    label: 'GPS Location vs AI Scene Context',
    sources: ['metadata', 'ai'],
    status,
    description,
    evidenceRefs: [
      { source: 'metadata', field: 'gps', value: gps },
      { source: 'ai', field: 'sceneDescription', value: ai.sceneDescription },
    ],
  }
}

export function editingSoftwareVsAiEditingClues(metadata: MetadataFindings, ocr: OcrFindings, ai: AiFindings): CorrelationCheck {
  const hasEditingSoftware = metadata.editingSoftware.length > 0
  const metadataDataMissing = metadata.missingFields.includes('editingSoftware')
  const aiEditingClues = ai.observations.filter((o) => o.category === 'editing_clue')
  const aiDetectedEditing = aiEditingClues.some((o) => o.consistent === false)
  const aiHasNoClues = aiEditingClues.length === 0 || aiEditingClues.every((o) => o.consistent !== false)

  let status: CorrelationStatus
  let description: string

  if (metadataDataMissing && aiEditingClues.length === 0) {
    status = 'insufficient_data'
    description = 'No editing-software metadata tag and no AI editing-clue observations to compare.'
  } else if (hasEditingSoftware && aiDetectedEditing) {
    status = 'agree'
    description = `Metadata editing-software tag ("${metadata.editingSoftware.join(', ')}") and an AI-detected editing clue both indicate this image was edited.`
  } else if (hasEditingSoftware && aiHasNoClues) {
    status = 'conflict'
    description = `Metadata shows an editing-software tag ("${metadata.editingSoftware.join(', ')}") but AI visual inspection found no corresponding editing clues.`
  } else if (!hasEditingSoftware && aiDetectedEditing) {
    status = 'conflict'
    description = 'AI visual inspection flagged a possible editing clue, but no editing-software tag is present in metadata.'
  } else {
    status = 'agree'
    description = 'Neither metadata nor AI visual inspection indicate editing.'
  }

  return {
    id: 'editingSoftwareVsAiEditingClues',
    label: 'Editing Software vs AI Editing Clues',
    sources: ['metadata', 'ai'],
    status,
    description,
    evidenceRefs: [
      { source: 'metadata', field: 'editingSoftware', value: metadata.editingSoftware },
      { source: 'ai', field: 'observations[category=editing_clue]', value: aiEditingClues },
    ],
  }
}
