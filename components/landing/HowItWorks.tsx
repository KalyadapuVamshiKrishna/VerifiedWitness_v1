'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { UploadCloud, Tags, ScanText, Sparkles, GitBranch, ShieldCheck, FileText } from 'lucide-react'

const STAGES = [
  {
    icon: UploadCloud,
    label: 'Evidence Upload',
    description: 'Drop in a photo, PDF, or document — hashed and stored for chain-of-custody.',
  },
  {
    icon: Tags,
    label: 'Metadata Analysis',
    description: 'Camera, GPS, timestamps, and editing-software signatures extracted from the file itself.',
  },
  {
    icon: ScanText,
    label: 'OCR Extraction',
    description: 'Any text in the evidence is read, scored for confidence, and made searchable.',
  },
  {
    icon: Sparkles,
    label: 'AI Evidence Analysis',
    description: 'Gemini reports lighting, shadow, and editing observations — never a verdict.',
  },
  {
    icon: GitBranch,
    label: 'Evidence Correlation',
    description: 'Metadata, OCR, and AI findings are cross-checked against each other for agreement or conflict.',
  },
  {
    icon: ShieldCheck,
    label: 'VerifiedTrust™',
    description: 'A deterministic engine — not AI — computes the trust score from every signal above.',
  },
  {
    icon: FileText,
    label: 'Verification Report',
    description: 'Every point on the score is traceable back to the evidence that produced it.',
  },
]

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.4'],
  })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section className="px-6 lg:px-16 py-28 border-t border-zinc-900">
      <div className="max-w-2xl mx-auto text-center mb-20">
        <div className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-3">How It Works</div>
        <h2 className="text-2xl lg:text-3xl font-mono font-bold text-foreground">One pipeline. Every step visible.</h2>
      </div>

      <div ref={containerRef} className="relative max-w-lg mx-auto">
        <div className="absolute left-5 top-2 bottom-2 w-px bg-zinc-800" />
        <motion.div className="absolute left-5 top-2 w-px bg-amber-500 origin-top" style={{ height: lineHeight }} />

        <div className="space-y-14">
          {STAGES.map((stage) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5 }}
              className="relative flex items-start gap-5"
            >
              <div className="relative z-10 w-10 h-10 flex-shrink-0 rounded-full bg-zinc-950 border-2 border-amber-500 flex items-center justify-center">
                <stage.icon size={16} className="text-amber-500" />
              </div>
              <div className="pt-1.5">
                <div className="text-sm font-mono font-bold text-foreground mb-1">{stage.label}</div>
                <div className="text-xs font-mono text-zinc-500 leading-relaxed max-w-sm">{stage.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
