'use client'

import { AlertCircle } from 'lucide-react'

export default function ViewSystemIdle() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 h-full">
      {/* Loading Spinner */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-zinc-700 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
        </div>
        <div className="text-base font-mono text-amber-500 font-bold">SYSTEM IDLE</div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
        {/* Encrypted Traffic Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="text-xs font-mono uppercase text-zinc-500 mb-3">Encrypted Traffic</div>
          <div className="text-3xl font-mono font-bold text-amber-500">1.2 TB</div>
          <div className="text-xs font-mono text-zinc-600 mt-1">/HR</div>
        </div>

        {/* Active Listeners Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="text-xs font-mono uppercase text-zinc-500 mb-3">Active Listeners</div>
          <div className="text-3xl font-mono font-bold text-amber-500">24</div>
          <div className="text-xs font-mono text-zinc-600 mt-1">NODES</div>
        </div>

        {/* Decryption Load Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="text-xs font-mono uppercase text-zinc-500 mb-3">Decryption Load</div>
          <div className="text-3xl font-mono font-bold text-amber-500">0.04%</div>
          <div className="text-xs font-mono text-zinc-600 mt-1">NOMINAL</div>
        </div>
      </div>
    </div>
  )
}
