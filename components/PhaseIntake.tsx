'use client'

import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import type { Investigation } from '@/lib/types'

interface PhaseIntakeProps {
  onPhaseChange?: (phase: 'analysis' | 'report', investigationId: string) => void
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function statusBadge(status: Investigation['status']): { label: string; color: string } {
  switch (status) {
    case 'complete':
      return { label: 'COMPLETE', color: 'bg-green-500' }
    case 'failed':
      return { label: 'FAILED', color: 'bg-red-500' }
    default:
      return { label: 'ANALYZING', color: 'bg-amber-500' }
  }
}

export default function PhaseIntake({ onPhaseChange }: PhaseIntakeProps) {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/investigations')
      .then((res) => res.json())
      .then((data) => setInvestigations(data.investigations ?? []))
      .catch(() => setInvestigations([]))
  }, [])

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError(`Unsupported file type "${file.type || 'unknown'}". Supported: JPG, PNG, WEBP.`)
      return
    }

    setError(null)
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/evidence/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Upload failed.')
        return
      }

      onPhaseChange?.('analysis', data.investigation.id)
    } catch {
      setError('Upload failed. Check your connection and try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRowClick = (investigation: Investigation) => {
    const phase = investigation.status === 'complete' || investigation.status === 'failed' ? 'report' : 'analysis'
    onPhaseChange?.(phase, investigation.id)
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Evidence Ingestion Portal Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`bg-zinc-900/50 border rounded-none p-12 flex flex-col items-center justify-center gap-8 transition-colors ${
          isDragging ? 'border-amber-500 bg-amber-950/10' : 'border-zinc-800'
        }`}
      >
        <div className="w-20 h-20 rounded-none border border-amber-500/30 flex items-center justify-center">
          {isUploading ? (
            <Loader2 size={40} className="text-amber-500 animate-spin" />
          ) : (
            <UploadCloud size={40} className="text-amber-500" />
          )}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-mono font-semibold text-foreground mb-3">Evidence Ingestion Portal</h2>
          <p className="text-sm text-zinc-400 font-mono">Securely upload forensic artifacts for automated analysis and chain-of-custody verification.</p>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {['JPG', 'PNG', 'WEBP'].map((format) => (
            <div
              key={format}
              className="px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 text-sm font-mono text-zinc-300 font-semibold"
            >
              {format}
            </div>
          ))}
        </div>

        {error && <div className="text-sm font-mono text-red-400 max-w-md text-center">{error}</div>}

        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-8 py-3 bg-transparent border border-zinc-600 text-zinc-300 font-mono text-sm rounded-none hover:bg-zinc-800/40 hover:border-zinc-500 transition-all font-bold disabled:opacity-50"
        >
          {isUploading ? 'UPLOADING...' : 'BROWSE LOCAL STORAGE'}
        </button>
      </div>

      {/* Investigation Queue Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-none flex flex-col overflow-hidden flex-1">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold">Investigation Queue</h3>
          <p className="text-xs text-zinc-600 font-mono mt-1">{investigations.length} Total Entries</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-950/80 border-b border-zinc-800">
              <tr className="text-xs font-mono uppercase text-zinc-500 font-semibold">
                <th className="px-6 py-3 text-left">Investigation ID</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Date/Time</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {investigations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs font-mono text-zinc-600">
                    No investigations yet. Upload evidence above to start one.
                  </td>
                </tr>
              )}
              {investigations.map((investigation) => {
                const badge = statusBadge(investigation.status)
                return (
                  <tr
                    key={investigation.id}
                    onClick={() => handleRowClick(investigation)}
                    className="text-sm font-mono hover:bg-zinc-800/30 transition-colors cursor-pointer border-b border-zinc-800/50"
                  >
                    <td className="px-6 py-4 text-amber-500 font-semibold">{investigation.id}</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">{investigation.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{formatDateTime(investigation.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${badge.color}`}></div>
                        <span className="text-xs font-mono uppercase text-zinc-300">{badge.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(investigation)
                        }}
                        className="text-zinc-500 hover:text-amber-500 text-xs font-mono uppercase transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
