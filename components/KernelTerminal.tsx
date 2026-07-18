'use client'

import { useInvestigation, usePolledInvestigation } from '@/lib/store/use-investigation'
import type { LogLevel } from '@/lib/types'

function getLevelColor(level: LogLevel): string {
  switch (level) {
    case 'SYSTEM':
      return 'text-blue-400'
    case 'SUCCESS':
      return 'text-green-500'
    case 'AUTH':
      return 'text-amber-500'
    case 'ERROR':
      return 'text-red-500'
    case 'WARNING':
      return 'text-amber-400'
    case 'INFO':
      return 'text-gray-400'
    default:
      return 'text-foreground'
  }
}

export default function KernelTerminal() {
  const { activeInvestigationId } = useInvestigation()
  const { data } = usePolledInvestigation(activeInvestigationId)
  const logs = data?.findings?.logEntries ?? []

  return (
    <div className="h-48 flex-shrink-0 bg-[#0B0C0E] border-t border-zinc-800 overflow-y-auto flex flex-col">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between flex-shrink-0 bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeInvestigationId ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
          <span className="text-xs font-mono text-amber-500 font-bold">KERNEL_STREAM</span>
          <span className="text-xs font-mono text-foreground">{activeInvestigationId ? 'LIVE_IO_LINK' : 'STANDBY'}</span>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {activeInvestigationId ? `INVESTIGATION: ${activeInvestigationId}` : 'No active investigation'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-xs">
        {logs.length === 0 && (
          <div className="text-zinc-600">
            {activeInvestigationId ? 'Waiting for pipeline activity...' : 'Open or start an investigation to see live logs.'}
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 text-muted-foreground">
            <span className="text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span className={getLevelColor(log.level)}>[{log.level}]</span>
            <span className="text-foreground">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
