import { NextResponse } from 'next/server'
import { getInvestigation, getEvidenceForInvestigation } from '@/lib/db/investigations'
import { getFindingsSnapshot } from '@/lib/db/findings'

export const runtime = 'nodejs'

/**
 * Polled by the client (~every 1.5s) while an investigation is processing — see Phase 1
 * plan notes. Returns the current investigation, evidence, and findings/timeline/log snapshot.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const investigation = await getInvestigation(id)
  if (!investigation) {
    return NextResponse.json({ error: 'Investigation not found' }, { status: 404 })
  }

  const [evidence, findings] = await Promise.all([getEvidenceForInvestigation(id), getFindingsSnapshot(id)])

  return NextResponse.json({ investigation, evidence, findings })
}
