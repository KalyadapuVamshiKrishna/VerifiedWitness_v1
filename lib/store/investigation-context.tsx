'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface InvestigationContextValue {
  activeInvestigationId: string | null
  setActiveInvestigationId: (id: string | null) => void
}

const InvestigationContext = createContext<InvestigationContextValue | undefined>(undefined)

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [activeInvestigationId, setActiveInvestigationId] = useState<string | null>(null)
  return (
    <InvestigationContext.Provider value={{ activeInvestigationId, setActiveInvestigationId }}>
      {children}
    </InvestigationContext.Provider>
  )
}

export function useInvestigationContext(): InvestigationContextValue {
  const ctx = useContext(InvestigationContext)
  if (!ctx) {
    throw new Error('useInvestigationContext must be used within an InvestigationProvider')
  }
  return ctx
}
