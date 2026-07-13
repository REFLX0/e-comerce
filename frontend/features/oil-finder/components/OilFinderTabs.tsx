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
        <div
          className="relative inline-flex rounded-2xl p-1"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Animated background glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-20"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(225,6,0,0.4) 0%, transparent 70%)',
            }}
          />
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300"
                style={{
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: isActive
                    ? 'linear-gradient(135deg, #E10600 0%, #b80500 100%)'
                    : 'transparent',
                  boxShadow: isActive
                    ? '0 4px 20px rgba(225,6,0,0.4), 0 1px 0 rgba(255,255,255,0.1) inset'
                    : 'none',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                }}
              >
                <Icon size={15} />
                {tab.label}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 60%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'specs' ? <EngineSpecFinder /> : <VehicleFinder />}
    </div>
  )
}
