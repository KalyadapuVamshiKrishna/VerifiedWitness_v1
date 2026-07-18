'use client'

import { useState } from 'react'
import InvestigationSequence from './InvestigationSequence'
import MagneticButton from './MagneticButton'

interface HeroProps {
  onStartInvestigation: () => void
}

export default function Hero({ onStartInvestigation }: HeroProps) {
  const [replaySignal, setReplaySignal] = useState(0)

  return (
    <section className="min-h-[calc(100vh-70px)] flex flex-col lg:flex-row items-center justify-center gap-16 px-6 lg:px-16 py-16">
      <div className="max-w-xl">
        <div className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-4">
          Digital Evidence Investigation Platform
        </div>
        <h1 className="text-4xl lg:text-5xl font-mono font-bold text-foreground leading-tight mb-6">
          Trust Digital Evidence.
          <br />
          Not Blind AI.
        </h1>
        <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-8 max-w-md">
          VerifiedWitness combines forensic metadata analysis, OCR, and multimodal AI into a
          transparent investigation workflow — AI contributes observations, a deterministic engine
          computes the trust score.
        </p>
        <div className="flex flex-wrap gap-3">
          <MagneticButton
            onClick={onStartInvestigation}
            className="px-6 py-3 bg-amber-500 text-zinc-950 font-mono font-bold text-sm rounded-none hover:bg-amber-400 transition-colors"
          >
            Start Investigation →
          </MagneticButton>
          <MagneticButton
            onClick={() => setReplaySignal((s) => s + 1)}
            className="px-6 py-3 border border-zinc-700 text-zinc-300 font-mono text-sm rounded-none hover:bg-zinc-800/40 hover:border-zinc-500 transition-colors"
          >
            Watch Demo
          </MagneticButton>
        </div>
      </div>

      <div className="w-full max-w-md">
        <InvestigationSequence restartSignal={replaySignal} />
      </div>
    </section>
  )
}
