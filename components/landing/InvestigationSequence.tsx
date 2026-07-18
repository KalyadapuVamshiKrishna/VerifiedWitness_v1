'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Clock, Palette, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { SEQUENCE_STAGES } from '@/lib/landing/sequence'

// Free-to-use under the Unsplash License (commercial use, no attribution required):
// https://unsplash.com/license — a real receipt photo, used consistently across the
// Received/Metadata/OCR/AI stages so the sequence reads as one piece of evidence moving
// through the pipeline rather than four unrelated placeholder icons.
const EVIDENCE_PHOTO_URL =
  'https://images.unsplash.com/photo-1731686602391-7484df33a03c?w=400&h=400&fit=crop&q=80&auto=format'

function EvidencePhoto({ className }: { className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={EVIDENCE_PHOTO_URL}
      alt="Evidence photo"
      className={`object-cover grayscale-[0.15] contrast-[1.1] ${className}`}
    />
  )
}

function useCountUp(target: number, active: boolean, durationMs = 2200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(progress * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, durationMs])

  return value
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

function ReceivedStage() {
  return (
    <motion.div className="flex flex-col items-center gap-4" {...fadeUp}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="w-32 h-32 border border-zinc-700 overflow-hidden"
      >
        <EvidencePhoto className="w-full h-full" />
      </motion.div>
      <div className="text-xs font-mono text-zinc-500">EVD_0001.JPG · 4.2MB</div>
    </motion.div>
  )
}

function MetadataStage() {
  const tags = [
    { icon: Camera, text: 'Camera: iPhone 15 Pro' },
    { icon: MapPin, text: 'GPS: 40.71°N, 74.01°W' },
    { icon: Clock, text: 'Captured: 14:22:09' },
    { icon: Palette, text: 'Color Space: sRGB' },
  ]
  return (
    <motion.div className="flex flex-col items-center gap-3" {...fadeUp}>
      <div className="w-20 h-20 border border-zinc-700 overflow-hidden mb-1">
        <EvidencePhoto className="w-full h-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {tags.map((tag, i) => (
          <motion.div
            key={tag.text}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.35 }}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400"
          >
            <tag.icon size={11} className="text-amber-500 flex-shrink-0" />
            <span className="truncate">{tag.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function OcrStage() {
  const lines = ['RECEIPT', 'TOTAL: $482.00', 'DATE: 2026-03-14']
  return (
    <motion.div className="flex flex-col items-center gap-4" {...fadeUp}>
      <div className="relative w-24 h-24 border border-zinc-700 overflow-hidden">
        <EvidencePhoto className="w-full h-full" />
        <motion.div
          className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent"
          initial={{ top: '-10%' }}
          animate={{ top: '100%' }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div className="space-y-1.5 text-center">
        {lines.map((line, i) => (
          <motion.div
            key={line}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.5 }}
            className="text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1"
          >
            {line}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function AiStage() {
  const observations = [
    { label: 'Lighting: Consistent', style: { top: '10%', left: '8%' } },
    { label: 'Shadow: Consistent', style: { top: '55%', left: '55%' } },
    { label: 'Editing Clue: None', style: { top: '30%', left: '30%' } },
  ]
  return (
    <motion.div className="flex flex-col items-center gap-4" {...fadeUp}>
      <div className="relative w-32 h-32 border border-zinc-700 overflow-hidden">
        <EvidencePhoto className="w-full h-full" />
        {observations.map((o, i) => (
          <motion.div
            key={o.label}
            className="absolute w-8 h-8 border border-amber-500/70"
            style={o.style}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1], scale: [0.6, 1.05, 1] }}
            transition={{ delay: 0.4 + i * 0.6, duration: 0.6 }}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {observations.map((o, i) => (
          <motion.div
            key={o.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.6 }}
            className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5"
          >
            <CheckCircle2 size={11} className="text-green-500" />
            {o.label}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function CorrelationStage() {
  const hub = { x: 50, y: 58 }
  const nodes = [
    { label: 'Metadata', x: 12, y: 15 },
    { label: 'OCR', x: 88, y: 15 },
    { label: 'AI', x: 50, y: 95 },
  ]

  return (
    <motion.div className="flex flex-col items-center gap-5" {...fadeUp}>
      <div className="relative w-48 h-40">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {nodes.map((n, i) => (
            <g key={n.label}>
              <motion.line
                x1={n.x} y1={n.y} x2={hub.x} y2={hub.y}
                stroke="#52525b" strokeWidth={0.6}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: i * 0.3, duration: 0.6 }}
              />
              {/* pulse traveling from source node into the hub, looping */}
              <motion.circle
                r={2.2}
                fill="#f59e0b"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [n.x, hub.x],
                  cy: [n.y, hub.y],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  delay: 0.7 + i * 0.35,
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 1.6,
                  ease: 'easeIn',
                }}
              />
            </g>
          ))}

          <motion.circle
            cx={hub.x} cy={hub.y} r={16} fill="url(#hubGlow)"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [1, 1.15, 1] }}
            transition={{ delay: 1.5, scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
          />
          <motion.circle
            cx={hub.x} cy={hub.y} r={5.5}
            fill="#f59e0b"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 16 }}
          />
        </svg>

        {nodes.map((n, i) => (
          <motion.div
            key={n.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.3 }}
          >
            <div className="w-2 h-2 rounded-full bg-zinc-500 ring-4 ring-zinc-900" />
            <span className="text-[9px] font-mono text-zinc-500 whitespace-nowrap">{n.label}</span>
          </motion.div>
        ))}

        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.7, type: 'spring', stiffness: 300, damping: 18 }}
        >
          <CheckCircle2 size={13} className="text-zinc-950" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.1 }}
        className="text-xs font-mono text-green-500 flex items-center gap-1.5 px-2.5 py-1 bg-green-900/10 border border-green-500/30"
      >
        <CheckCircle2 size={13} />
        3/3 checks consistent
      </motion.div>
    </motion.div>
  )
}

function FusionStage({ active }: { active: boolean }) {
  const score = useCountUp(94, active)
  const circumference = 2 * Math.PI * 42

  return (
    <motion.div className="flex flex-col items-center gap-3" {...fadeUp}>
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx={50} cy={50} r={42} fill="none" stroke="#27272a" strokeWidth={6} />
          <motion.circle
            cx={50} cy={50} r={42} fill="none" stroke="#f59e0b" strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
            transition={{ ease: 'linear', duration: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold text-foreground">{score}</span>
          <span className="text-[9px] font-mono text-zinc-500">/ 100</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-mono text-amber-500">
        <ShieldCheck size={13} />
        VerifiedTrust™ Score
      </div>
    </motion.div>
  )
}

function ReportStage() {
  const items = ['Metadata Analyzed', 'OCR Complete', 'AI Observations Recorded', 'Trust Score Computed']
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-xs bg-zinc-900/60 border border-zinc-800 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono text-zinc-500 uppercase">Verification Report</span>
        <span className="text-[10px] font-mono text-green-500 border border-green-500/40 bg-green-900/20 px-1.5 py-0.5">VERIFIED</span>
      </div>
      <div className="text-3xl font-mono font-bold text-foreground mb-3">94/100</div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.35 }}
            className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400"
          >
            <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />
            {item}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

interface InvestigationSequenceProps {
  restartSignal: number
}

export default function InvestigationSequence({ restartSignal }: InvestigationSequenceProps) {
  const [stageIndex, setStageIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setStageIndex(0)
  }, [restartSignal])

  useEffect(() => {
    const stage = SEQUENCE_STAGES[stageIndex]
    timerRef.current = setTimeout(() => {
      setStageIndex((i) => (i + 1) % SEQUENCE_STAGES.length)
    }, stage.durationMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [stageIndex])

  const stage = SEQUENCE_STAGES[stageIndex]

  const renderStage = () => {
    switch (stage.id) {
      case 'received':
        return <ReceivedStage />
      case 'metadata':
        return <MetadataStage />
      case 'ocr':
        return <OcrStage />
      case 'ai':
        return <AiStage />
      case 'correlation':
        return <CorrelationStage />
      case 'fusion':
        return <FusionStage active={stage.id === 'fusion'} />
      case 'report':
        return <ReportStage />
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/5] bg-zinc-950 border border-zinc-800 overflow-hidden">
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/90 z-10">
        <span className="text-[10px] font-mono text-amber-500 font-semibold uppercase tracking-wide">{stage.label}</span>
        <div className="flex gap-1">
          {SEQUENCE_STAGES.map((s, i) => (
            <div key={s.id} className={`w-1.5 h-1.5 rounded-full ${i <= stageIndex ? 'bg-amber-500' : 'bg-zinc-700'}`} />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 pt-12 pb-6 px-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <div key={stage.id}>{renderStage()}</div>
        </AnimatePresence>
      </div>
    </div>
  )
}
