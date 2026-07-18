import { Search, Plus } from 'lucide-react'

interface TopHeaderProps {
  currentView: string
  onViewChange?: (view: string) => void
}

export default function TopHeader({ currentView, onViewChange }: TopHeaderProps) {
  const getViewLabel = () => {
    switch (currentView) {
      case 'intake':
        return 'Investigation Queue'
      case 'analysis':
        return 'Live Investigation'
      case 'explorer':
        return 'Evidence Explorer'
      case 'report':
        return 'Verification Report'
      case 'archive':
        return 'Case Archive'
      case 'status':
        return 'System Status'
      case 'settings':
        return 'System Configuration'
      case 'idle':
        return 'System Idle'
      default:
        return 'Workspace'
    }
  }

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-zinc-800 bg-[#0B0C0E]">
      {/* Left: Breadcrumb */}
      <div className="text-xs font-mono text-zinc-400">
        <span className="text-amber-500">VerifiedWitness</span>
        <span className="mx-2">{' > '}</span>
        <span>{getViewLabel()}</span>
      </div>

      {/* Middle: Search */}
      <div className="flex-1 mx-6 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search evidence..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900/40 border border-zinc-700 rounded-none text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Right: NEW INVESTIGATION Button */}
      <button
        onClick={() => onViewChange?.('idle')}
        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-zinc-950 font-mono text-xs font-bold rounded-none hover:bg-amber-400 transition-colors"
      >
        <Plus size={14} />
        NEW INVESTIGATION
      </button>
    </header>
  )
}
