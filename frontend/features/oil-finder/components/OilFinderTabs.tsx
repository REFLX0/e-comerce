'use client'

import { useState } from 'react'
import { Car, Bike, Truck, Tractor, Search, ArrowLeft, Check, ChevronRight, RotateCcw, Sparkles } from 'lucide-react'
import { EngineSpecFinder } from './EngineSpecFinder'
import { VehicleFinder } from './VehicleFinder'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

type VehicleType = 'automobile' | 'moto' | 'poids_lourd' | 'agricole' | 'marine'
type SearchMode = 'vehicle' | 'specs'

export function OilFinderTabs() {
  const t = useTranslations('OilFinder')
  const [step, setStep] = useState(1)
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null)

  const VEHICLE_TYPES = [
    { id: 'automobile' as const, image: '/img/categories/automobile.jpg', fallbackIcon: Car, label: t('typeAutomobile'), sub: t('typeAutoSub') },
    { id: 'moto' as const, image: '/img/categories/moto.jpg', fallbackIcon: Bike, label: t('typeMoto'), sub: t('typeMotoSub') },
    { id: 'marine' as const, image: '/img/categories/marine.jpg', fallbackIcon: Sparkles, label: t('typeMarine'), sub: t('typeMarineSub') },
    { id: 'poids_lourd' as const, image: '/img/categories/poids_lourd.jpg', fallbackIcon: Truck, label: t('typePL'), sub: t('typePLSub') },
    { id: 'agricole' as const, image: '/img/categories/agricole.jpg', fallbackIcon: Tractor, label: t('typeAgricole'), sub: t('typeAgricoleSub') },
  ]

  const progress = (step / 3) * 100
  const selectedVehicle = VEHICLE_TYPES.find((type) => type.id === vehicleType)

  const handleSelectType = (type: VehicleType) => {
    setVehicleType(type)
    setStep(2)
  }

  const handleSelectMode = (mode: SearchMode) => {
    setSearchMode(mode)
    setStep(3)
  }

  const handleReset = () => {
    setStep(1)
    setVehicleType(null)
    setSearchMode(null)
  }

  const stepLabels = [t('stepVehicle'), t('stepMethod'), t('stepSearch')]

  return (
    <div id="oil-finder" className="mx-auto w-full max-w-6xl px-4">
      <div className="overflow-hidden rounded-[2rem] border border-brand-primary/10 bg-white shadow-[0_24px_70px_rgba(22,37,76,0.12)]">
        <div className="border-b border-brand-primary/10 bg-[linear-gradient(110deg,#16254c_0%,#1f356b_68%,#283e79_100%)] px-5 py-5 text-white sm:px-8 md:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-accent text-brand-primary shadow-lg shadow-black/10">
                <Sparkles size={20} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-accent-light">{t('selectionAssistant')}</p>
                <p className="mt-1 text-sm text-white/75">{t('selectionAssistantDesc')}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 sm:self-auto"
            >
              <RotateCcw size={14} />
              {t('restart')}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            {stepLabels.map((label, index) => {
              const stage = index + 1
              const isComplete = stage < step
              const isCurrent = stage === step
              return (
                <div key={label} className="flex min-w-0 items-center gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isComplete ? 'bg-brand-accent text-brand-primary' : isCurrent ? 'bg-white text-brand-primary' : 'bg-white/10 text-white/70'}`}>
                    {isComplete ? <Check size={14} strokeWidth={3} /> : stage}
                  </div>
                  <span className={`hidden truncate text-xs font-semibold sm:block ${isCurrent || isComplete ? 'text-white' : 'text-white/70'}`}>{label}</span>
                  {stage < 3 && <div className={`ml-auto h-px flex-1 ${isComplete ? 'bg-brand-accent' : 'bg-white/15'}`} />}
                </div>
              )
            })}
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full bg-brand-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="relative bg-[radial-gradient(circle_at_top_right,rgba(212,167,106,0.12),transparent_30%),#fff]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 md:p-10"
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">{t('step1Label')}</p>
              <h3 className="text-2xl font-bold tracking-tight text-brand-primary">
                {t('step1Title')}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                {t('step1Desc')}
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-5">
                {VEHICLE_TYPES.map((type) => {
                  const FallbackIcon = type.fallbackIcon
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleSelectType(type.id)}
                      className="group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4A76A] hover:shadow-[0_12px_30px_rgba(212,167,106,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A76A]"
                    >
                      {/* Image container: strictly confined to the top, stops above the bottom label */}
                      <div className="relative flex-1 w-full min-h-[145px] overflow-hidden bg-slate-900">
                        <Image
                          src={type.image}
                          alt={type.label}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                          <FallbackIcon size={40} />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Label container: clean solid white bottom with no gradient bleed */}
                      <div className="relative w-full z-10 p-3.5 text-center bg-white border-t border-slate-100 transition-colors group-hover:bg-slate-50/60">
                        <span className="block text-sm font-black uppercase tracking-wider text-[#16254c] group-hover:text-[#D4A76A] transition-colors">
                          {type.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-medium text-gray-500">
                          {type.sub}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && vehicleType && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 md:p-10"
            >
              <div className="mb-7 flex items-start gap-3">
                <button
                  onClick={handleReset}
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-gray-500 transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
                  aria-label={t('backToVehicle')}
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">{t('step2Label')}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-brand-primary">
                    {t('step2Title')}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedVehicle?.label} · {t('step2Desc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => handleSelectMode('vehicle')}
                  className="group flex min-h-56 flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-brand-primary/35 hover:shadow-[0_16px_30px_rgba(22,37,76,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/15"><Car size={24} /></div>
                  <div className="mt-auto">
                    <span className="block text-lg font-bold text-brand-primary">{t('byVehicle')}</span>
                    <span className="mt-2 block text-sm leading-6 text-gray-500">{t('byVehicleDesc')}</span>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-primary">{t('start')} <ChevronRight size={14} /></span>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectMode('specs')}
                  className="group flex min-h-56 flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-brand-primary/35 hover:shadow-[0_16px_30px_rgba(22,37,76,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent text-brand-primary shadow-lg shadow-brand-accent/20"><Search size={24} /></div>
                  <div className="mt-auto">
                    <span className="block text-lg font-bold text-brand-primary">{t('bySpecs')}</span>
                    <span className="mt-2 block text-sm leading-6 text-gray-500">{t('bySpecsDesc')}</span>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-primary">{t('start')} <ChevronRight size={14} /></span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && searchMode === 'vehicle' && (
            <motion.div
              key="vehicle-finder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="pb-24 sm:pb-32"
            >
              <div className="border-b border-slate-100 bg-slate-50/70 p-4 md:px-6">
                <button
                  onClick={() => { setStep(2); setSearchMode(null) }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  {t('back')}
                </button>
              </div>
              <div className="p-4 sm:p-6 md:p-8">
                <VehicleFinder onClose={() => {}} initialVehicleType={vehicleType} />
              </div>
            </motion.div>
          )}

          {step === 3 && searchMode === 'specs' && (
            <motion.div
              key="specs-finder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="border-b border-slate-100 bg-slate-50/70 p-4 md:px-6">
                <button
                  onClick={() => { setStep(2); setSearchMode(null) }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} />
                  {t('back')}
                </button>
              </div>
              <EngineSpecFinder onClose={() => {}} initialVehicleType={vehicleType !== 'marine' ? vehicleType : null} />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
