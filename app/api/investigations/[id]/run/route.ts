import { NextResponse } from 'next/server'
import { runPipeline } from '@/lib/pipeline/orchestrator'

export const runtime = 'nodejs'
// exifr + Tesseract OCR + one Gemini call for a single image can plausibly take 10-30s
// combined — past the default function timeout. See Phase 1 plan notes.
export const maxDuration = 60

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    await runPipeline(id)
    return NextResponse.json({ status: 'complete' })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ status: 'failed', error: message }, { status: 500 })
  }
}
