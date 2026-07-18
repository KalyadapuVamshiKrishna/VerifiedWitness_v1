'use client'

import { useState } from 'react'
import AuthScreen from '@/components/AuthScreen'
import Sidebar from '@/components/Sidebar'
import TopHeader from '@/components/TopHeader'
import KernelTerminal from '@/components/KernelTerminal'
import PhaseIntake from '@/components/PhaseIntake'
import PhaseAnalysis from '@/components/PhaseAnalysis'
import PhaseExplorer from '@/components/PhaseExplorer'
import PhaseReport from '@/components/PhaseReport'
import ViewSystemIdle from '@/components/ViewSystemIdle'
import ViewCaseArchive from '@/components/ViewCaseArchive'
import ViewSystemStatus from '@/components/ViewSystemStatus'
import ViewSettings from '@/components/ViewSettings'
import { InvestigationProvider } from '@/lib/store/investigation-context'
import { useInvestigation } from '@/lib/store/use-investigation'

type CurrentView = 'auth' | 'intake' | 'idle' | 'analysis' | 'explorer' | 'report' | 'archive' | 'status' | 'settings'

function Workspace() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentView, setCurrentView] = useState<CurrentView>('intake')
  const { activeInvestigationId, setActiveInvestigationId } = useInvestigation()

  if (!isLoggedIn) {
    return <AuthScreen onLogin={() => setIsLoggedIn(true)} />
  }

  const openInvestigation = (phase: 'analysis' | 'report', investigationId: string) => {
    setActiveInvestigationId(investigationId)
    setCurrentView(phase)
  }

  const renderView = () => {
    switch (currentView) {
      case 'idle':
        return <ViewSystemIdle />
      case 'intake':
        return <PhaseIntake onPhaseChange={openInvestigation} />
      case 'analysis':
        return (
          <PhaseAnalysis investigationId={activeInvestigationId} onPhaseChange={() => setCurrentView('explorer')} />
        )
      case 'explorer':
        return (
          <PhaseExplorer investigationId={activeInvestigationId} onPhaseChange={() => setCurrentView('report')} />
        )
      case 'report':
        return <PhaseReport investigationId={activeInvestigationId} />
      case 'archive':
        return <ViewCaseArchive onCaseSelect={() => setCurrentView('report')} />
      case 'status':
        return <ViewSystemStatus />
      case 'settings':
        return <ViewSettings />
      default:
        return <PhaseIntake onPhaseChange={openInvestigation} />
    }
  }

  const handleViewChange = (view: string) => {
    if (view === 'intake') setCurrentView('intake')
    else if (view === 'archive') setCurrentView('archive')
    else if (view === 'explorer') setCurrentView('explorer')
    else if (view === 'status') setCurrentView('status')
    else if (view === 'settings') setCurrentView('settings')
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 flex font-mono text-zinc-300 text-sm">
      {/* Left Sidebar */}
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <TopHeader currentView={currentView} onViewChange={handleViewChange} />

        {/* Main Workspace - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          {renderView()}
        </main>

        {/* Bottom Kernel Terminal */}
        <KernelTerminal />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <InvestigationProvider>
      <Workspace />
    </InvestigationProvider>
  )
}
