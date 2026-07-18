import { put } from '@vercel/blob'
import { findEvidenceBySha256 } from '@/lib/db/investigations'
import { sha256Hex } from './hash'

function extensionFor(fileName: string, mimeType: string): string {
  const fromName = /\.[a-zA-Z0-9]+$/.exec(fileName)?.[0]
  if (fromName) return fromName
  const byMime: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  }
  return byMime[mimeType] ?? ''
}

export interface StoredEvidenceBlob {
  sha256: string
  blobUrl: string
  blobPathname: string
  reused: boolean
}

/**
 * Stores evidence bytes in Vercel Blob, reusing an existing blob if this exact file
 * (by SHA-256) was already uploaded for a prior investigation — see plan's dedup decision.
 */
export async function storeEvidenceBlob(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<StoredEvidenceBlob> {
  const sha256 = sha256Hex(buffer)

  const existing = await findEvidenceBySha256(sha256)
  if (existing) {
    return { sha256, blobUrl: existing.blobUrl, blobPathname: existing.blobPathname, reused: true }
  }

  const pathname = `evidence/${sha256}${extensionFor(fileName, mimeType)}`
  const blob = await put(pathname, buffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType: mimeType,
  })

  return { sha256, blobUrl: blob.url, blobPathname: blob.pathname, reused: false }
}
