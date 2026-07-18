'use client'

import { AlertTriangle, CheckCircle, MinusCircle } from 'lucide-react'
import { usePolledInvestigation } from '@/lib/store/use-investigation'
import type { CorrelationStatus } from '@/lib/types'

interface PhaseExplorerProps {
  investigationId: string | null
  onPhaseChange?: (phase: 'report') => void
}

const CORRELATION_BADGE: Record<CorrelationStatus, { label: string; className: string }> = {
  agree: { label: 'CONSISTENT', className: 'text-green-500 bg-green-900/20 border-green-500/40' },
  conflict: { label: 'CONFLICT', className: 'text-red-500 bg-red-900/20 border-red-500/40' },
  insufficient_data: { label: 'INSUFFICIENT DATA', className: 'text-zinc-400 bg-zinc-800/40 border-zinc-700' },
}

export default function PhaseExplorer({ investigationId, onPhaseChange }: PhaseExplorerProps) {
  const { data } = usePolledInvestigation(investigationId)

  const handleLockFindings = () => {
    onPhaseChange?.('report')
  }

  if (!data?.findings) {
    return <div className="text-xs font-mono text-zinc-500 p-6">Loading evidence findings...</div>
  }

  const { metadataFindings: metadata, ocrFindings: ocr, aiFindings: ai, correlationResult: correlation } = data.findings
  const isComplete = data.investigation.status === 'complete'

  const anomalyCount = (metadata?.consistencyFlags.length ?? 0) + (correlation?.conflicts.length ?? 0)

  return (
    <div className="pb-24">
      <div className="grid grid-cols-2 gap-6">
        {/* Card 1: METADATA EXPLORER */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold mb-4">Metadata Explorer</h3>

          <table className="w-full mb-4 text-xs font-mono">
            <tbody className="divide-y divide-zinc-800">
              <tr>
                <td className="py-2 px-2 text-zinc-400 bg-zinc-950">Make / Model</td>
                <td className="py-2 px-2 text-foreground font-semibold bg-zinc-950">
                  {metadata?.camera ? `${metadata.camera.make ?? ''} ${metadata.camera.model ?? ''}`.trim() || 'Unknown' : 'Not available'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-zinc-400 bg-zinc-950">Capture Time</td>
                <td className="py-2 px-2 text-foreground font-semibold bg-zinc-950">
                  {metadata?.timestamps.captured ?? 'Not available'}
                </td>
              </tr>
              <tr>
                <td className={`py-2 px-2 ${metadata?.editingSoftware.length ? 'text-zinc-400 bg-amber-950/20' : 'text-zinc-400 bg-zinc-950'}`}>Software</td>
                <td className={`py-2 px-2 font-semibold ${metadata?.editingSoftware.length ? 'text-amber-400 bg-amber-950/20' : 'text-foreground bg-zinc-950'}`}>
                  {metadata?.editingSoftware.length ? metadata.editingSoftware.join(', ') : 'None detected'}
                </td>
              </tr>
            </tbody>
          </table>

          {metadata && metadata.consistencyFlags.length > 0 ? (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded-none">
              <div className="font-bold text-xs mb-1">KEY FINDING</div>
              <div className="text-xs">{metadata.consistencyFlags[0].description}</div>
            </div>
          ) : (
            <div className="bg-green-900/20 border border-green-500/40 text-green-400 p-3 rounded-none">
              <div className="font-bold text-xs mb-1">NO ANOMALIES</div>
              <div className="text-xs">No metadata consistency flags detected. Integrity score: {metadata?.integrityScore ?? '—'}/100.</div>
            </div>
          )}
        </div>

        {/* Card 2: TEXT EVIDENCE (OCR) */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold mb-4">Text Evidence (OCR)</h3>

          <div className="bg-zinc-950 border border-zinc-800 p-4 text-xs font-mono leading-relaxed">
            {ocr?.fullText ? (
              <div className="text-zinc-300 whitespace-pre-wrap break-words">{ocr.fullText}</div>
            ) : (
              <div className="text-zinc-600">No text detected in evidence.</div>
            )}
          </div>
          {ocr && (
            <div className="mt-2 text-xs font-mono text-zinc-500">
              Aggregate confidence: {ocr.confidence.toFixed(0)}%
              {ocr.issues.length > 0 ? ` · ${ocr.issues.join(' ')}` : ''}
            </div>
          )}
        </div>

        {/* Card 3: AI VISUAL INVESTIGATION */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 col-span-2">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold mb-4">AI Visual Investigation</h3>
          <p className="text-xs text-zinc-600 font-mono mb-4">{ai?.sceneDescription}</p>

          <div className="grid grid-cols-2 gap-3">
            {(ai?.observations ?? []).map((obs, i) => (
              <div key={i} className="flex items-start gap-2 bg-zinc-950 border border-zinc-800 p-3 text-xs font-mono">
                {obs.consistent === true && <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />}
                {obs.consistent === false && <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />}
                {obs.consistent === null && <MinusCircle size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />}
                <div>
                  <div className="text-zinc-500 uppercase text-[10px] mb-1">{obs.category.replace('_', ' ')}</div>
                  <div className="text-foreground">{obs.finding}</div>
                  <div className="text-zinc-600 mt-1">Confidence: {obs.confidence.toFixed(0)}%</div>
                </div>
              </div>
            ))}
            {(!ai || ai.observations.length === 0) && (
              <div className="text-xs font-mono text-zinc-600">No AI observations available.</div>
            )}
          </div>
        </div>

        {/* Card 4: FILE INTEGRITY */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold mb-4">File Integrity</h3>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-zinc-600 font-semibold mb-1">CONTENT HASH (SHA-256)</div>
              <div className="bg-black border border-zinc-800 p-2 text-xs font-mono text-zinc-300 break-all">
                {data.evidence?.sha256 ?? '—'}
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-600 font-semibold mb-1">MIME TYPE</div>
              <div className="bg-black border border-zinc-800 p-2 text-xs font-mono text-zinc-300">
                {data.evidence?.mimeType ?? '—'}
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-600 font-semibold mb-1">FILE SIZE</div>
              <div className="bg-black border border-zinc-800 p-2 text-xs font-mono text-zinc-300">
                {data.evidence ? `${(data.evidence.fileSizeBytes / 1024).toFixed(1)} KB` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: EVIDENCE CORRELATION */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold mb-4">Evidence Correlation</h3>
          <div className="space-y-2">
            {(correlation?.matrix ?? []).map((check) => {
              const badge = CORRELATION_BADGE[check.status]
              return (
                <div key={check.id} className="bg-zinc-950 border border-zinc-800 p-3 text-xs font-mono">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-zinc-300 font-semibold">{check.label}</span>
                    <span className={`px-2 py-0.5 border rounded-none text-[10px] ${badge.className}`}>{badge.label}</span>
                  </div>
                  <div className="text-zinc-500">{check.description}</div>
                </div>
              )
            })}
            {(!correlation || correlation.matrix.length === 0) && (
              <div className="text-xs font-mono text-zinc-600">No correlation checks available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer Action Bar */}
      <div className="sticky bottom-0 z-10 bg-zinc-950 border-t border-zinc-800 p-4 flex justify-between items-center h-16 mt-6">
        <div className="text-xs font-mono text-amber-500">
          FINDING SUMMARY: {anomalyCount} {anomalyCount === 1 ? 'ANOMALY' : 'ANOMALIES'}
        </div>
        <button
          onClick={handleLockFindings}
          disabled={!isComplete}
          className="px-6 py-2 bg-amber-500 text-zinc-950 font-mono font-bold text-xs rounded-none hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          LOCK FINDINGS
        </button>
      </div>
    </div>
  )
}
