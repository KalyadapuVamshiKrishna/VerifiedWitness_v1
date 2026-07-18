'use client'

import { motion } from 'framer-motion'
import { ListChecks, Eye, Lock } from 'lucide-react'

const PILLARS = [
  {
    icon: ListChecks,
    title: 'Explainability',
    description: 'Every conclusion is backed by evidence — no black-box scores.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'Metadata, OCR, and AI findings are all visible, never hidden behind a single number.',
  },
  {
    icon: Lock,
    title: 'Deterministic Trust',
    description: 'AI contributes observations. The Trust Score is computed independently, by a fixed set of rules.',
  },
]

export default function TrustPillars() {
  return (
    <section className="px-6 lg:px-16 py-28 border-t border-zinc-900">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <div className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-3">Why Trust It</div>
        <h2 className="text-2xl lg:text-3xl font-mono font-bold text-foreground">
          AI doesn&apos;t make the decision. Evidence does.
        </h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PILLARS.map((pillar, i) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="bg-zinc-900/40 border border-zinc-800 p-6 hover:border-amber-500/40 transition-colors"
          >
            <div className="w-10 h-10 border border-amber-500/30 flex items-center justify-center mb-4">
              <pillar.icon size={18} className="text-amber-500" />
            </div>
            <div className="text-sm font-mono font-bold text-foreground mb-2">{pillar.title}</div>
            <div className="text-xs font-mono text-zinc-500 leading-relaxed">{pillar.description}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
