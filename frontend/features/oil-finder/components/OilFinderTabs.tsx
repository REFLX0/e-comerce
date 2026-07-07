'use client'

import { useState } from 'react'
import { EngineSpecFinder } from './EngineSpecFinder'
import { VehicleFinder } from './VehicleFinder'
import { Car, Gauge } from 'lucide-react'

const TABS = [
  { id: 'specs', label: 'Par caractéristiques', icon: Gauge },
  { id: 'vehicle', label: 'Par véhicule', icon: Car },
] as const

export function OilFinderTabs() {
  const [activeTab, setActiveTab] = useState<'specs' | 'vehicle'>('specs')

  return (
    <div id="oil-finder" className="mx-auto w-full max-w-5xl">
      {/* Tabs */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-sm">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-accent text-black shadow-lg shadow-brand-accent/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'specs' ? <EngineSpecFinder /> : <VehicleFinder />}
    </div>
  )
}
