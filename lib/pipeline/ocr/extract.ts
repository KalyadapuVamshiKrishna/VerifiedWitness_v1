import { createWorker } from 'tesseract.js'
import type { OcrFindings, OcrWord } from '@/lib/types'

const LOW_CONFIDENCE_THRESHOLD = 60

/**
 * Runs Tesseract.js OCR against evidence bytes. First invocation on a cold serverless
 * instance is slower while language data is fetched/cached — expected, not a bug.
 */
export async function extractOcr(buffer: Buffer, evidenceId: string): Promise<OcrFindings> {
  const worker = await createWorker('eng')

  try {
    const { data } = await worker.recognize(buffer)

    const words: OcrWord[] = []
    for (const block of data.blocks ?? []) {
      for (const paragraph of block.paragraphs) {
        for (const line of paragraph.lines) {
          for (const word of line.words) {
            words.push({ text: word.text, confidence: word.confidence, bbox: word.bbox })
          }
        }
      }
    }

    const fullText = data.text.trim()
    const issues: string[] = []

    if (!fullText) {
      issues.push('No text detected in evidence image.')
    }

    const lowConfidenceWords = words.filter((w) => w.confidence < LOW_CONFIDENCE_THRESHOLD)
    if (words.length > 0 && lowConfidenceWords.length > 0) {
      issues.push(`${lowConfidenceWords.length} of ${words.length} recognized words below ${LOW_CONFIDENCE_THRESHOLD}% confidence.`)
    }

    return {
      evidenceId,
      fullText,
      confidence: data.confidence,
      language: 'eng',
      words,
      issues,
    }
  } finally {
    await worker.terminate()
  }
}
