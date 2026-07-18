'use client'

import Hero from './Hero'
import HowItWorks from './HowItWorks'
import TrustPillars from './TrustPillars'
import LivingBackground from './LivingBackground'
import CursorEffects from './CursorEffects'
import MagneticButton from './MagneticButton'

interface LandingPageProps {
  onStartInvestigation: () => void
}

export default function LandingPage({ onStartInvestigation }: LandingPageProps) {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-300 font-mono">
      <LivingBackground />
      <CursorEffects />

      <header className="relative flex items-center justify-between px-6 lg:px-16 py-5 border-b border-zinc-900">
        <div className="text-sm font-mono font-bold text-foreground">
          Verified<span className="text-amber-500">Witness</span>
        </div>
        <MagneticButton
          onClick={onStartInvestigation}
          className="text-xs font-mono text-zinc-400 hover:text-amber-500 transition-colors uppercase tracking-wide"
        >
          Enter Workspace →
        </MagneticButton>
      </header>

      <Hero onStartInvestigation={onStartInvestigation} />
      <HowItWorks />
      <TrustPillars />
    </div>
  )
}
