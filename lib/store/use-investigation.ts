'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Investigation, Evidence } from '@/lib/types'
import type { FindingsSnapshot } from '@/lib/db/findings'
import { useInvestigationContext } from './investigation-context'

export function useInvestigation() {
  return useInvestigationContext()
}

export interface InvestigationSnapshot {
  investigation: Investigation
  evidence: Evidence | null
  findings: FindingsSnapshot | null
}

/**
 * Polls GET /api/investigations/[id] on an interval while the pipeline runs. This is the
 * only channel that sees live progress — see Phase 1 plan notes on the serverless execution
 * model. Stops polling once status is 'complete' or 'failed'.
 */
export function usePolledInvestigation(investigationId: string | null, intervalMs = 1500) {
  const [data, setData] = useState<InvestigationSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchOnce = useCallback(async () => {
    if (!investigationId) return
    try {
      const res = await fetch(`/api/investigations/${investigationId}`)
      if (!res.ok) throw new Error(`Failed to load investigation (${res.status})`)
      const json = (await res.json()) as InvestigationSnapshot
      setData(json)
      setError(null)
      if (
        (json.investigation.status === 'complete' || json.investigation.status === 'failed') &&
        timerRef.current
      ) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }, [investigationId])

  useEffect(() => {
    if (!investigationId) {
      setData(null)
      return
    }
    setIsLoading(true)
    fetchOnce()
    timerRef.current = setInterval(fetchOnce, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [investigationId, intervalMs, fetchOnce])

  return { data, error, isLoading }
}
