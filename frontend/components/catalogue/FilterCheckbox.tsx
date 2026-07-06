"use client";

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterCheckboxProps {
  label: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  accentColor?: 'primary' | 'accent'
}

/**
 * Shared checkbox component for the filter sidebar with nice transitions
 */
export function FilterCheckbox({
  label,
  checked,
  onChange,
  disabled,
  className,
  id,
  accentColor = 'primary',
}: FilterCheckboxProps) {
  const isAccent = accentColor === 'accent'

  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex items-center gap-3',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200',
          checked
            ? isAccent
              ? 'border-brand-accent bg-brand-accent text-brand-primary'
              : 'border-brand-primary bg-brand-primary text-white'
            : 'border-brand-border bg-brand-surface group-hover:border-brand-primary/50'
        )}
      >
        <Check
          size={14}
          strokeWidth={3}
          className={cn(
            'transition-transform duration-200',
            checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
        />
      </div>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={cn(
          'text-sm transition-colors duration-200',
          checked ? 'font-medium text-brand-primary' : 'text-brand-muted group-hover:text-brand-primary'
        )}
      >
        {label}
      </div>
    </label>
  )
}
