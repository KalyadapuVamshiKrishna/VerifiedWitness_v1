import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { sql } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'

export const runtime = 'nodejs'

/**
 * Throwaway infra round-trip check (Phase 0 "done" condition) — not part of the product.
 * Confirms Neon and Vercel Blob are both reachable and writable from a deployed/dev route.
 */
export async function GET() {
  const result: { db: string; blob: string } = { db: 'unchecked', blob: 'unchecked' }

  try {
    await ensureSchema()
    const db = sql()
    const testId = `health-${crypto.randomUUID()}`

    await db`insert into investigations (id, name, status) values (${testId}, 'health-check', 'intake')`
    const rows = await db`select id from investigations where id = ${testId}`
    await db`delete from investigations where id = ${testId}`

    result.db = rows.length === 1 ? 'ok' : 'row-mismatch'
  } catch (err) {
    result.db = `error: ${err instanceof Error ? err.message : String(err)}`
  }

  try {
    const pathname = `health-checks/${crypto.randomUUID()}.txt`
    const blob = await put(pathname, 'verifiedwitness health check', {
      access: 'public',
      addRandomSuffix: false,
    })
    await del(blob.url)
    result.blob = 'ok'
  } catch (err) {
    result.blob = `error: ${err instanceof Error ? err.message : String(err)}`
  }

  const ok = result.db === 'ok' && result.blob === 'ok'
  return NextResponse.json(result, { status: ok ? 200 : 500 })
}
