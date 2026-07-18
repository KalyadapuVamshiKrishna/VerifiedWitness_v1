import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { storeEvidenceBlob } from '@/lib/blob/upload'
import { createInvestigationWithEvidence } from '@/lib/db/investigations'
import { generateInvestigationId } from '@/lib/ids'
import type { EvidenceMimeType } from '@/lib/types'

export const runtime = 'nodejs'

// PDF is a supported Evidence mime type in the data model, but intake only accepts images
// until Phase 4 (PDF support: text-layer extraction + OCR fallback) lands.
const SUPPORTED_MIME_TYPES: readonly EvidenceMimeType[] = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.type as EvidenceMimeType)) {
    return NextResponse.json(
      {
        error: `Unsupported file type "${file.type || 'unknown'}". Supported: JPG, PNG, WEBP.`,
      },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const stored = await storeEvidenceBlob(buffer, file.name, file.type)

  const investigationId = generateInvestigationId()
  const evidenceId = randomUUID()
  const name = formData.get('name')?.toString() || file.name

  const { investigation, evidence } = await createInvestigationWithEvidence({
    investigationId,
    name,
    evidence: {
      id: evidenceId,
      fileName: file.name,
      mimeType: file.type as EvidenceMimeType,
      fileSizeBytes: buffer.byteLength,
      sha256: stored.sha256,
      blobUrl: stored.blobUrl,
      blobPathname: stored.blobPathname,
      uploadedAt: new Date().toISOString(),
    },
  })

  return NextResponse.json({ investigation, evidence, reusedExistingEvidence: stored.reused })
}
