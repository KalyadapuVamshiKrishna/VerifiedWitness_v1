'use client'

import { Activity, Download } from 'lucide-react'

export default function ViewSystemStatus() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Top Grid - 4 Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* System Uptime */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-zinc-500" />
            <div className="text-xs font-mono uppercase text-zinc-600">System Uptime</div>
          </div>
          <div className="text-3xl font-mono font-bold text-foreground">99.998%</div>
          <div className="text-xs text-green-500 font-mono mt-2">High Precision Cluster Sync</div>
        </div>

        {/* Active C++ Daemons */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-amber-500" />
            <div className="text-xs font-mono uppercase text-zinc-600">Active C++ Daemons</div>
          </div>
          <div className="text-3xl font-mono font-bold text-amber-500">14</div>
          <div className="text-xs text-amber-600 font-mono mt-2">Running</div>
        </div>

        {/* Cloud Nodes */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-zinc-500" />
            <div className="text-xs font-mono uppercase text-zinc-600">Cloud Nodes</div>
          </div>
          <div className="text-3xl font-mono font-bold text-foreground">128 / 150</div>
          <div className="text-xs text-zinc-600 font-mono mt-2">STATUS: NORMAL</div>
        </div>

        {/* Decryption Load */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-zinc-500" />
            <div className="text-xs font-mono uppercase text-zinc-600">Decryption Load</div>
          </div>
          <div className="text-3xl font-mono font-bold text-foreground">68%</div>
          <div className="flex h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div className="w-2/3 bg-amber-500"></div>
          </div>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-none flex flex-col flex-1 overflow-hidden">
        {/* Control Bar */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-zinc-800 bg-zinc-950/50 flex-shrink-0">
          <select className="bg-zinc-950 border border-zinc-800 px-3 py-1 text-xs font-mono outline-none rounded-none text-zinc-300 cursor-pointer">
            <option>All Logs</option>
            <option>[SYSTEM]</option>
            <option>[SUCCESS]</option>
            <option>[AUTH]</option>
            <option>[ERROR]</option>
            <option>[WARN]</option>
            <option>[INFO]</option>
          </select>
          <button className="px-3 py-1 bg-amber-500 text-zinc-950 font-mono font-bold text-xs rounded-none hover:bg-amber-400 transition-colors flex items-center gap-2">
            <Download size={14} />
            Export Logs as .CSV
          </button>
        </div>

        {/* Logs Terminal */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
          <div className="text-green-500">[00:00:01] [SYSTEM] Kernel forensic stream initialized. Handshake successful.</div>
          <div className="text-green-500">[14:22:01] [SUCCESS] Node-124 heartbeat stable at 12ms latency.</div>
          <div className="text-yellow-500">[14:22:05] [AUTH] Handshake protocol V2 initiated for Agent-884.</div>
          <div className="text-red-500">[14:23:12] [ERROR] Packet loss detected on Decryption-Silo-09. Rerouting to standby.</div>
          <div className="text-yellow-500">[14:23:15] [WARN] Cluster 04 approaching memory threshold (91% utilization).</div>
          <div className="text-blue-500">[14:24:00] [INFO] Automated log rotation complete. Purged 4.2GB forensic cache.</div>
          <div className="text-red-500">[06:50:05] [ERROR] Integrity hash mismatch resolved via consensus.</div>
          <div className="text-zinc-500">[14:28:01] [KERNEL_STREAM] LIVE_IO_LINK</div>
        </div>
      </div>
    </div>
  )
}
