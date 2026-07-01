import { ChevronDown } from 'lucide-react'

export default function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group overflow-hidden rounded-xl border border-gray-200">
      <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
        <span className="text-brand-primary font-medium">{question}</span>
        <ChevronDown
          size={20}
          className="shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-gray-600">
        <p>{answer}</p>
      </div>
    </details>
  )
}
