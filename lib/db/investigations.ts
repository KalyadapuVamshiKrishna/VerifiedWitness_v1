import { sql } from './client'
import { ensureSchema } from './migrate'
import type { Investigation, Evidence, EvidenceMimeType } from '@/lib/types'

function rowToInvestigation(row: Record<string, unknown>): Investigation {
  return {
    id: row.id as string,
    name: row.name as string,
    status: row.status as Investigation['status'],
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
    summary: (row.summary as string) ?? undefined,
    evidenceId: row.evidence_id as string,
    trustScore: row.trust_score === null ? undefined : (row.trust_score as number),
  }
}

function rowToEvidence(row: Record<string, unknown>): Evidence {
  return {
    id: row.id as string,
    investigationId: row.investigation_id as string,
    fileName: row.file_name as string,
    mimeType: row.mime_type as EvidenceMimeType,
    fileSizeBytes: Number(row.file_size_bytes),
    sha256: row.sha256 as string,
    blobUrl: row.blob_url as string,
    blobPathname: row.blob_pathname as string,
    uploadedAt: (row.uploaded_at as Date).toISOString(),
    pageCount: row.page_count === null ? undefined : (row.page_count as number),
  }
}

export async function findEvidenceBySha256(sha256: string): Promise<Evidence | null> {
  await ensureSchema()
  const db = sql()
  const rows = await db`select * from evidence where sha256 = ${sha256} order by uploaded_at desc limit 1`
  return rows.length ? rowToEvidence(rows[0] as Record<string, unknown>) : null
}

export async function createInvestigationWithEvidence(params: {
  investigationId: string
  name: string
  evidence: Omit<Evidence, 'investigationId'>
}): Promise<{ investigation: Investigation; evidence: Evidence }> {
  await ensureSchema()
  const db = sql()

  await db`
    insert into investigations (id, name, status, evidence_id)
    values (${params.investigationId}, ${params.name}, 'intake', ${params.evidence.id})
  `

  await db`
    insert into evidence (
      id, investigation_id, file_name, mime_type, file_size_bytes,
      sha256, blob_url, blob_pathname, page_count
    )
    values (
      ${params.evidence.id}, ${params.investigationId}, ${params.evidence.fileName},
      ${params.evidence.mimeType}, ${params.evidence.fileSizeBytes}, ${params.evidence.sha256},
      ${params.evidence.blobUrl}, ${params.evidence.blobPathname}, ${params.evidence.pageCount ?? null}
    )
  `

  await db`insert into investigation_findings (investigation_id) values (${params.investigationId}) on conflict (investigation_id) do nothing`

  const investigation = await getInvestigation(params.investigationId)
  const evidence = await getEvidenceForInvestigation(params.investigationId)
  if (!investigation || !evidence) {
    throw new Error('Failed to read back newly created investigation/evidence')
  }
  return { investigation, evidence }
}

export async function getInvestigation(id: string): Promise<Investigation | null> {
  await ensureSchema()
  const db = sql()
  const rows = await db`select * from investigations where id = ${id}`
  return rows.length ? rowToInvestigation(rows[0] as Record<string, unknown>) : null
}

export async function getEvidenceForInvestigation(investigationId: string): Promise<Evidence | null> {
  const db = sql()
  const rows = await db`select * from evidence where investigation_id = ${investigationId} limit 1`
  return rows.length ? rowToEvidence(rows[0] as Record<string, unknown>) : null
}

export async function updateInvestigationStatus(
  id: string,
  status: Investigation['status'],
  trustScore?: number
): Promise<void> {
  const db = sql()
  await db`
    update investigations
    set status = ${status}, trust_score = coalesce(${trustScore ?? null}, trust_score), updated_at = now()
    where id = ${id}
  `
}

export async function listInvestigations(opts: { search?: string; limit?: number } = {}): Promise<Investigation[]> {
  await ensureSchema()
  const db = sql()
  const limit = opts.limit ?? 50
  const rows = opts.search
    ? await db`select * from investigations where name ilike ${'%' + opts.search + '%'} or id ilike ${'%' + opts.search + '%'} order by created_at desc limit ${limit}`
    : await db`select * from investigations order by created_at desc limit ${limit}`
  return rows.map((row) => rowToInvestigation(row as Record<string, unknown>))
}
