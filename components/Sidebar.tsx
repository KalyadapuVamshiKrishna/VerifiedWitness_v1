'use client'

import { FileText, Activity, Database, User, Settings, Gauge } from 'lucide-react'

interface SidebarProps {
  onViewChange: (view: string) => void
  currentView: string
}

export default function Sidebar({ onViewChange, currentView }: SidebarProps) {
  const isActive = (view: string) => currentView === view

  const menuItems = [
    { view: 'intake', label: 'Investigation Queue', icon: FileText },
    { view: 'archive', label: 'Recent Reports', icon: Activity },
    { view: 'explorer', label: 'Evidence Explorer', icon: Database },
    { view: 'status', label: 'System Status', icon: Gauge },
    { view: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-zinc-800 bg-[#0B0C0E]">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="text-xs font-mono text-amber-500 font-bold">VerifiedWitness</div>
        <div className="text-xs font-mono text-zinc-500">V.2.4.0-STABLE</div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="text-xs font-mono uppercase text-zinc-500 font-bold mb-3">EVIDENCE CORE</div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.view}
                  onClick={() => onViewChange(item.view)}
                  className={`w-full text-left px-3 py-2 rounded-none text-sm font-mono transition-colors flex items-center gap-2 border-l-2 ${
                    isActive(item.view)
                      ? 'text-amber-500 border-amber-500 bg-zinc-900/40'
                      : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/20'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 p-2 rounded-none bg-zinc-900/40 border border-zinc-800">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-zinc-950 flex-shrink-0">
            <User size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono font-semibold text-foreground truncate">Investigator_01</div>
            <div className="text-xs font-mono text-zinc-500 truncate">L3-Auth</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
