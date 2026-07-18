'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function ViewSettings() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [anomalyThreshold, setAnomalyThreshold] = useState(75)
  const [ocrConfidence, setOcrConfidence] = useState(85)
  const [neuralHashDepth, setNeuralHashDepth] = useState(6)

  return (
    <div className="flex gap-6 h-full pb-20">
      {/* Left Sidebar - Navigation */}
      <div className="w-48 flex-shrink-0">
        <nav className="space-y-2">
          {[
            { label: 'General', active: true },
            { label: 'API Integrations', active: false },
            { label: 'Security & Roles', active: false },
            { label: 'Thresholds', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full text-left px-4 py-2 text-sm font-mono rounded-none transition-colors border-l-2 ${
                item.active
                  ? 'text-amber-500 border-amber-500 bg-zinc-900/40'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Core Forensic API Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 flex items-center justify-center rounded-none">
              <span className="text-xs font-bold text-amber-500">⚙</span>
            </div>
            <h3 className="text-sm font-mono uppercase text-zinc-300 font-bold">Core Forensic API</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-600 mb-2">Gemini API Key</label>
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-none">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  defaultValue="sk-proj-••••••••••••••••••••••••••••••••"
                  className="bg-transparent outline-none text-sm flex-1 font-mono text-zinc-300"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs font-mono text-zinc-600 mt-2">
                Required for automated metadata extraction and neural-visual forensic analysis.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-600 mb-2">OCR Engine Endpoint</label>
              <input
                type="text"
                defaultValue="https://ocr-node-04.internal.verifiedwitness"
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm font-mono text-zinc-300 outline-none rounded-none"
              />
            </div>
          </div>
        </div>

        {/* System Thresholds Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 flex items-center justify-center rounded-none">
              <span className="text-xs font-bold text-amber-500">⚙</span>
            </div>
            <h3 className="text-sm font-mono uppercase text-zinc-300 font-bold">System Thresholds</h3>
          </div>

          <div className="space-y-6">
            {/* Anomaly Detection Sensitivity */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-mono uppercase text-zinc-600">Anomaly Detection Sensitivity</label>
                <span className="text-xs font-mono font-bold text-amber-500">{anomalyThreshold}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-xs font-mono text-zinc-600 mt-2">Calibrate outlier detection in forensic datasets.</p>
            </div>

            {/* OCR Confidence Floor */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-mono uppercase text-zinc-600">OCR Confidence Floor</label>
                <span className="text-xs font-mono font-bold text-amber-500">{ocrConfidence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ocrConfidence}
                onChange={(e) => setOcrConfidence(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-xs font-mono text-zinc-600 mt-2">Min. probability score for automatic character recognition.</p>
            </div>

            {/* Neural Hash Depth */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-mono uppercase text-zinc-600">Neural Hash Depth</label>
                <span className="text-xs font-mono font-bold text-amber-500">{neuralHashDepth}/8</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={neuralHashDepth}
                onChange={(e) => setNeuralHashDepth(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-xs font-mono text-zinc-600 mt-2">Recursive layer analysis for bitmask verification.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 flex justify-between items-center">
        <div className="text-xs font-mono text-amber-600">UNSAVED CHANGES DETECTED IN 'API INTEGRATIONS'</div>
        <button className="px-6 py-2 bg-amber-500 text-zinc-950 font-mono font-bold text-sm rounded-none hover:bg-amber-400 transition-colors">
          SAVE CONFIGURATION
        </button>
      </div>
    </div>
  )
}
