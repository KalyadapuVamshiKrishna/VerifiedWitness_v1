'use client'

import { useState } from 'react'
import { Search, Calendar } from 'lucide-react'

interface ViewCaseArchiveProps {
  onCaseSelect?: (caseId: string) => void
}

export default function ViewCaseArchive({ onCaseSelect }: ViewCaseArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const mockCases = [
    {
      id: 'VW-2024-XB2',
      hash: 'e3b0c442...98ba9a1a',
      origin: 'Local Storage',
      status: 'VERIFIED',
      statusColor: 'bg-green-900/30 text-green-400 border-green-800',
      authenticityScore: 98,
    },
    {
      id: 'VW-2024-L09',
      hash: 'f7a18b2c...8821d3e',
      origin: 'Cloud Node 04',
      status: 'FLAGGED',
      statusColor: 'bg-red-900/30 text-red-400 border-red-800',
      authenticityScore: 24,
    },
    {
      id: 'VW-2024-R55',
      hash: '0c1d44aa...6f921a22',
      origin: 'Local Storage',
      status: 'PENDING',
      statusColor: 'bg-amber-900/30 text-amber-400 border-amber-800',
      authenticityScore: 45,
    },
    {
      id: 'VW-2023-A01',
      hash: '9e226011...b5280164',
      origin: 'Central Hive',
      status: 'VERIFIED',
      statusColor: 'bg-green-900/30 text-green-400 border-green-800',
      authenticityScore: 100,
    },
  ]

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Filter Bar */}
      <div className="flex gap-4 items-end bg-zinc-900/30 border border-zinc-800 p-4 rounded-none">
        <div className="flex-1">
          <label className="block text-xs font-mono uppercase text-zinc-600 mb-2">Search</label>
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2">
            <Search size={16} className="text-zinc-500" />
            <input
              type="text"
              placeholder="SHA-256 Hash or Case ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-foreground placeholder-zinc-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-zinc-600 mb-2">Temporal Range</label>
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2">
            <Calendar size={16} className="text-zinc-500" />
            <input
              type="text"
              placeholder="2024-01-01"
              className="bg-transparent outline-none text-sm w-32 text-foreground placeholder-zinc-600"
            />
            <span className="text-zinc-600">→</span>
            <input
              type="text"
              placeholder="2024-12-31"
              className="bg-transparent outline-none text-sm w-32 text-foreground placeholder-zinc-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-zinc-600 mb-2">Classification</label>
          <select className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm outline-none rounded-none text-foreground cursor-pointer">
            <option>All Classifications</option>
            <option>Public</option>
            <option>Confidential</option>
            <option>Restricted</option>
          </select>
        </div>

        <button className="px-4 py-2 bg-amber-500 text-zinc-950 font-mono font-bold text-xs rounded-none hover:bg-amber-400 transition-colors">
          APPLY FILTER
        </button>
      </div>

      {/* Cases Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-none flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800">
              <tr className="text-xs font-mono uppercase text-zinc-500 font-semibold">
                <th className="px-6 py-3 text-left">Case ID</th>
                <th className="px-6 py-3 text-left">Evidence Hash</th>
                <th className="px-6 py-3 text-left">Origin</th>
                <th className="px-6 py-3 text-left">Status Badge</th>
                <th className="px-6 py-3 text-left">Authenticity Score</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {mockCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-zinc-900/30 transition-colors border-b border-zinc-800/50">
                  <td className="px-6 py-4 text-sm font-mono text-amber-500 font-bold">{caseItem.id}</td>
                  <td className="px-6 py-4 text-xs font-mono text-zinc-400">{caseItem.hash}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{caseItem.origin}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-mono font-bold border rounded-full ${caseItem.statusColor}`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            caseItem.authenticityScore >= 80
                              ? 'bg-green-500'
                              : caseItem.authenticityScore >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${caseItem.authenticityScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">{caseItem.authenticityScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onCaseSelect?.(caseItem.id)}
                      className="text-xs font-mono text-amber-500 hover:text-amber-400 font-bold uppercase transition-colors"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
