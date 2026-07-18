'use client'

import { useState } from 'react'

interface AuthScreenProps {
  onLogin: () => void
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [agentId, setAgentId] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [mfaEnabled, setMfaEnabled] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className="w-full h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md tactical-card border-2 border-border p-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-none border border-accent flex items-center justify-center text-accent text-xs font-bold">
            🛡️
          </div>
          <span className="text-lg font-mono font-bold text-foreground">VerifiedWitness</span>
          <span className="ml-auto text-xs font-mono bg-amber-950 text-amber-500 px-2 py-1 border border-amber-700">
            L3-AUTH REQUIRED
          </span>
        </div>

        <div className="border-t-2 border-accent my-4"></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="tactical-label">AGENT_IDENTIFIER</label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3 text-muted-foreground">👤</span>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="VW-XXXX-XXXX"
                className="tactical-input w-full pl-8"
                required
              />
            </div>
          </div>

          <div>
            <label className="tactical-label">SECURE_PASSPHRASE</label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3 text-muted-foreground">🔐</span>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="tactical-input w-full pl-8"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-none bg-background border border-border">
            <input
              type="checkbox"
              id="mfa"
              checked={mfaEnabled}
              onChange={(e) => setMfaEnabled(e.target.checked)}
              className="w-4 h-4 rounded-none border border-border bg-card cursor-pointer"
            />
            <label htmlFor="mfa" className="tactical-label cursor-pointer">
              ENABLE_MULTI_FACTOR_CHALLENGE
            </label>
          </div>

          <button type="submit" className="tactical-button w-full">
            Initialize Session →
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border space-y-1">
          <div className="text-xs font-mono text-green-600">● CONNECTION_ESTABLISHED: 192.168.1.1</div>
          <div className="text-xs font-mono text-muted-foreground">ENCRYPTION: AES-256-GCM</div>
          <div className="text-xs font-mono text-muted-foreground">PROTO: VW-SSH-V4</div>
        </div>

        <div className="mt-6 p-3 rounded-none bg-yellow-950 border border-yellow-900">
          <div className="text-xs font-mono text-yellow-200 leading-relaxed">
            ⚠️ SYSTEM NOTICE: ALL TERMINAL ACTIVITIES ARE LOGGED AND SUBJECT TO AUDIT BY THE EVIDENCE CORE. UNAUTHORIZED ACCESS ATTEMPTS WILL BE GEOLOCATED AND REPORTED.
          </div>
        </div>
      </div>
    </div>
  )
}
