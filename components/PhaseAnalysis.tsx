'use client'

import { useEffect, useRef } from 'react'
import { Smartphone, MapPin } from 'lucide-react'
import type { TimelineStage, TimelineStatus } from '@/lib/types'
import { usePolledInvestigation } from '@/lib/store/use-investigation'

interface PhaseAnalysisProps {
  investigationId: string | null
  onPhaseChange?: (phase: 'explorer') => void
}

const STAGE_ORDER: TimelineStage[] = ['received', 'metadata', 'ocr', 'ai_visual', 'correlation', 'fusion', 'report', 'complete']

const STAGE_LABELS: Record<TimelineStage, string> = {
  received: 'EVIDENCE INTAKE',
  metadata: 'METADATA EXTRACTION',
  ocr: 'OCR CONTENT ANALYSIS',
  ai_visual: 'AI VISUAL INVESTIGATION',
  correlation: 'EVIDENCE CORRELATION',
  fusion: 'TRUST FUSION',
  report: 'REPORT GENERATION',
  complete: 'INVESTIGATION COMPLETE',
}

const DOT_COLOR: Record<TimelineStatus, string> = {
  complete: 'bg-green-500 ring-green-500/30',
  active: 'bg-amber-500 ring-amber-500/30',
  failed: 'bg-red-500 ring-red-500/30',
  pending: 'bg-zinc-700 ring-transparent',
}

const LABEL_COLOR: Record<TimelineStatus, string> = {
  complete: 'text-foreground',
  active: 'text-amber-500',
  failed: 'text-red-500',
  pending: 'text-zinc-500',
}

export default function PhaseAnalysis({ investigationId, onPhaseChange }: PhaseAnalysisProps) {
  const { data } = usePolledInvestigation(investigationId)
  const hasTriggeredRun = useRef(false)
  const hasAdvanced = useRef(false)

  useEffect(() => {
    if (!investigationId || hasTriggeredRun.current) return
    hasTriggeredRun.current = true
    fetch(`/api/investigations/${investigationId}/run`, { method: 'POST' }).catch(() => {})
  }, [investigationId])

  useEffect(() => {
    if (data?.investigation.status === 'complete' && !hasAdvanced.current) {
      hasAdvanced.current = true
      const timer = setTimeout(() => onPhaseChange?.('explorer'), 1200)
      return () => clearTimeout(timer)
    }
  }, [data?.investigation.status, onPhaseChange])

  const events = data?.findings?.timelineEvents ?? []
  const metadata = data?.findings?.metadataFindings ?? null
  const evidence = data?.evidence ?? null
  const failed = data?.investigation.status === 'failed'

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Column 1: Evidence Preview */}
      <div className="col-span-4 flex flex-col">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-none flex flex-col flex-1 overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10">
            <div className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-none">
              <span className="text-xs font-mono text-amber-500 font-semibold">
                {failed ? 'ANALYSIS FAILED' : 'PROCESSING EVIDENCE'}
              </span>
            </div>
          </div>

          <div className="flex-1 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-none border border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <span className="text-xs text-zinc-600 font-mono px-2 text-center break-all">
                  {evidence?.fileName ?? 'LOADING...'}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800 flex gap-4">
            <div>
              <div className="text-xs text-zinc-600 font-mono mb-1">SHA-256</div>
              <div className="text-xs text-zinc-300 font-mono">
                {evidence ? `${evidence.sha256.slice(0, 8)}...${evidence.sha256.slice(-8)}` : 'pending'}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600 font-mono mb-1">RES</div>
              <div className="text-xs text-zinc-300 font-mono">
                {metadata?.resolution ? `${metadata.resolution.width}x${metadata.resolution.height}` : 'pending'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Column 2: Live Timeline */}
      <div className="col-span-4 flex flex-col">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-none p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold mb-6">Live Investigation Timeline</h3>

            <div className="space-y-6">
              {STAGE_ORDER.map((stage, i) => {
                const event = events.find((e) => e.stage === stage)
                const status: TimelineStatus = event?.status ?? 'pending'
                const isLast = i === STAGE_ORDER.length - 1

                return (
                  <div key={stage} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ring-2 ${DOT_COLOR[status]}`}></div>
                      {!isLast && (
                        <div className="w-0.5 h-12 my-1 bg-gradient-to-b from-zinc-700 to-zinc-700"></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <div className={`text-sm font-mono font-semibold ${LABEL_COLOR[status]}`}>{STAGE_LABELS[stage]}</div>
                      <div className={`text-xs font-mono mt-1 ${LABEL_COLOR[status]}`}>
                        {status === 'failed' ? (event?.detail ?? 'FAILED') : status.toUpperCase()}
                        {event?.durationMs !== undefined && status === 'complete' ? ` · ${event.durationMs}ms` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Evidence Summary */}
      <div className="col-span-4 flex flex-col gap-6">
        {/* Primary Origin Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-none p-6">
          <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold mb-4">Primary Origin</h4>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-none bg-zinc-950 border border-zinc-700 flex items-center justify-center">
              <Smartphone size={24} className="text-zinc-400" />
            </div>
            <div>
              <div className="text-sm font-mono text-foreground font-semibold">
                {metadata?.camera?.model ?? (metadata ? 'Not available' : 'Pending...')}
              </div>
              <div className="text-xs text-zinc-500 font-mono">{metadata?.camera?.make ?? ''}</div>
            </div>
          </div>
        </div>

        {/* Location Telemetry Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-none p-6 flex-1 flex flex-col">
          <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold mb-4">Location Telemetry</h4>

          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-none mb-4 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-zinc-600 mx-auto mb-2" />
              <div className="text-xs text-zinc-600 font-mono">
                {metadata?.gps ? 'GPS Signal Found' : metadata ? 'No GPS Data' : 'Awaiting Data'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-zinc-600 font-mono mb-1">LAT</div>
              <div className="text-sm font-mono text-foreground font-semibold">
                {metadata?.gps ? `${metadata.gps.lat.toFixed(4)}°` : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600 font-mono mb-1">LONG</div>
              <div className="text-sm font-mono text-foreground font-semibold">
                {metadata?.gps ? `${metadata.gps.lng.toFixed(4)}°` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
