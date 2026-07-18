'use client'

import { FileText, Share2 } from 'lucide-react'
import { usePolledInvestigation } from '@/lib/store/use-investigation'
import type { FusionVerdict } from '@/lib/types'

interface PhaseReportProps {
  investigationId: string | null
}

const VERDICT_STYLE: Record<FusionVerdict, { label: string; color: string }> = {
  verified: { label: 'VERIFIED HIGH INTEGRITY', color: 'text-green-500' },
  suspicious: { label: 'SUSPICIOUS — REVIEW RECOMMENDED', color: 'text-amber-500' },
  inconclusive: { label: 'INCONCLUSIVE — INSUFFICIENT EVIDENCE', color: 'text-zinc-400' },
  likely_manipulated: { label: 'LIKELY MANIPULATED', color: 'text-red-500' },
}

export default function PhaseReport({ investigationId }: PhaseReportProps) {
  const { data } = usePolledInvestigation(investigationId)

  if (!data?.findings?.fusionResult) {
    return <div className="text-xs font-mono text-zinc-500 p-6">Loading verification report...</div>
  }

  const { metadataFindings: metadata, aiFindings: ai, correlationResult: correlation, fusionResult: fusion } = data.findings
  const verdictStyle = VERDICT_STYLE[fusion.trustScore >= 0 ? fusion.verdict : 'inconclusive']

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-4xl bg-zinc-900/30 border border-zinc-800 p-8">
        {/* Report Header with Action Buttons */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-mono font-bold text-foreground mb-1">DIGITAL EVIDENCE VERIFICATION REPORT</h1>
            <p className="text-xs font-mono text-zinc-400">FORENSIC INTEGRITY AUDIT &amp; AUTHENTICATION DOSSIER</p>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mt-4">
              <div>CASE: {data.investigation.id}</div>
              <div>ISSUED: {fusion.computedAt}</div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <button className="flex items-center gap-2 px-3 py-2 bg-transparent border border-zinc-700 text-zinc-400 font-mono text-xs hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors rounded-none">
              <FileText size={16} />
              EXPORT PDF
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-transparent border border-zinc-700 text-zinc-400 font-mono text-xs hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors rounded-none">
              <Share2 size={16} />
              SHARE
            </button>
          </div>
        </div>

        <div className="pb-6 border-b-2 border-amber-500"></div>

        {/* Executive Summary */}
        <div className="mb-8 mt-6">
          <h2 className="text-sm font-mono font-bold text-amber-500 mb-4 uppercase">Executive Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4">
              <div className="text-xs text-zinc-600 mb-2 font-semibold">AUTHENTICITY INTEGRITY SCORE</div>
              <div className={`text-4xl font-mono font-bold ${verdictStyle.color}`}>{fusion.trustScore}/100</div>
              <div className={`text-xs font-mono mt-2 ${verdictStyle.color}`}>{verdictStyle.label}</div>
              <div className="text-xs font-mono text-zinc-600 mt-2">Confidence: {fusion.confidence}/100</div>
            </div>
            <div className="col-span-2 text-sm font-mono text-foreground leading-relaxed">
              <p>
                Forensic analysis of evidence {data.evidence?.id.slice(0, 8)} combined deterministic metadata
                structural analysis, OCR consistency checks, AI visual observations, and cross-source evidence
                correlation into a single deterministic trust score. Gemini contributed observations only — the
                score below was computed entirely by the VerifiedTrust Fusion Engine.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1.0 Metadata */}
          <div>
            <h3 className="text-xs font-mono font-bold text-foreground mb-3 uppercase">1.0 Metadata Structural Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-zinc-400">CAPTURE SOURCE</span>
                <span className="text-foreground">
                  {metadata?.camera ? `${metadata.camera.make ?? ''} ${metadata.camera.model ?? ''}`.trim() || 'Unknown' : 'Not available'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-zinc-400">RESOLUTION</span>
                <span className="text-foreground">
                  {metadata?.resolution ? `${metadata.resolution.width}x${metadata.resolution.height}` : 'Not available'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-zinc-400">SOFTWARE SIGNATURE</span>
                <span className={metadata?.editingSoftware.length ? 'text-amber-400' : 'text-foreground'}>
                  {metadata?.editingSoftware.length ? metadata.editingSoftware.join(', ') : 'None detected'}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-zinc-950 border border-zinc-800 text-xs">
                <span className="text-zinc-400">METADATA INTEGRITY SCORE</span>
                <span className="text-foreground">{metadata?.integrityScore ?? '—'}/100</span>
              </div>
            </div>
          </div>

          {/* 2.0 AI Visual Observations */}
          <div>
            <h3 className="text-xs font-mono font-bold text-foreground mb-3 uppercase">2.0 AI Visual Observations</h3>
            <div className="space-y-2">
              {(ai?.observations ?? []).map((obs, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-zinc-950 border border-zinc-800 text-xs">
                  <span
                    className={`flex-shrink-0 ${
                      obs.consistent === false ? 'text-amber-500' : obs.consistent === true ? 'text-green-500' : 'text-zinc-500'
                    }`}
                  >
                    ●
                  </span>
                  <span className="text-foreground">
                    {obs.category.toUpperCase().replace('_', ' ')}: {obs.finding}
                  </span>
                </div>
              ))}
              {(!ai || ai.observations.length === 0) && (
                <div className="text-xs font-mono text-zinc-600">No AI observations recorded.</div>
              )}
            </div>
          </div>

          {/* 3.0 Evidence Correlation & Trust Fusion Breakdown */}
          <div>
            <h3 className="text-xs font-mono font-bold text-foreground mb-3 uppercase">3.0 Evidence Correlation &amp; Trust Fusion Breakdown</h3>
            <div className="space-y-2">
              {(correlation?.matrix ?? []).map((check) => (
                <div key={check.id} className="flex justify-between p-2 bg-zinc-950 border border-zinc-800 text-xs">
                  <span className="text-zinc-400">{check.label}</span>
                  <span
                    className={
                      check.status === 'conflict' ? 'text-red-500' : check.status === 'agree' ? 'text-green-500' : 'text-zinc-500'
                    }
                  >
                    {check.status.toUpperCase()}
                  </span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1">
                {fusion.reasoning.map((line, i) => (
                  <div key={i} className="text-xs font-mono text-zinc-400">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4.0 Investigator Recommendations */}
          <div>
            <h3 className="text-xs font-mono font-bold text-foreground mb-3 uppercase">4.0 Investigator Recommendations</h3>
            <div className="space-y-2">
              {(ai?.recommendations ?? []).map((rec, i) => (
                <div key={i} className="p-2 bg-zinc-950 border border-zinc-800">
                  <div className="text-xs font-mono text-amber-500 font-bold mb-1">{String(i + 1).padStart(2, '0')}</div>
                  <div className="text-xs font-mono text-foreground">{rec}</div>
                </div>
              ))}
              {(!ai || ai.recommendations.length === 0) && (
                <div className="text-xs font-mono text-zinc-600">No recommendations recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-600 font-mono text-center mt-8 pt-6 border-t border-zinc-800">
          <div>VerifiedWitness</div>
          <div>OFFICIAL EVIDENCE VERIFICATION DOCUMENT</div>
          <div className="mt-2">ID: {data.investigation.id}</div>
        </div>
      </div>
    </div>
  )
}
