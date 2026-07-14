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
    <div id="oil-finder" className="mx-auto w-full max-w-5xl px-4">
      {/* Tabs */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-brand-primary'
                  }
                `}
              >
                <Icon size={15} />
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
