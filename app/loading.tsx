export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-surface-dark border-t-brand-primary rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Chargement en cours...</p>
      </div>
    </div>
  )
}
