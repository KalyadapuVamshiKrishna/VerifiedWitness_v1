'use client'

interface TopBarProps {
  onNewInvestigation: () => void
}

export default function TopBar({ onNewInvestigation }: TopBarProps) {
  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-muted-foreground">Workspace</span>
        <span className="text-muted-foreground">›</span>
        <span className="text-sm font-mono text-foreground font-semibold">Demo Investigation</span>
      </div>

      <button
        onClick={onNewInvestigation}
        className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-none font-mono font-medium hover:bg-amber-600 transition-colors text-sm"
      >
        + NEW INVESTIGATION
      </button>
    </div>
  )
}
