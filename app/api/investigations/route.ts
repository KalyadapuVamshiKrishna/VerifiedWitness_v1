import { NextRequest, NextResponse } from 'next/server'
import { listInvestigations } from '@/lib/db/investigations'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? undefined
  const investigations = await listInvestigations({ search })
  return NextResponse.json({ investigations })
}
