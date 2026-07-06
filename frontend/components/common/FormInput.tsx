"use client";

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
  required?: boolean
  action?: React.ReactNode
}

/**
 * Unified form input component — consistent styling across login, checkout,
 * and all other forms. Supports leading icon, error state, and password toggle.
 */
export function FormInput({
  label,
  error,
  icon,
  required,
  action,
  type,
  className,
  id,
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="space-y-1.5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
        {action}
      </div>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={inputType}
          className={cn(
            'form-input w-full',
            icon && 'pl-11',
            isPassword && 'pr-11',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          ⚠ {error}
        </p>
      )}
    </div>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  required?: boolean
}

export function FormTextarea({
  label,
  error,
  required,
  className,
  id,
  ...props
}: FormTextareaProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <textarea
        id={id}
        className={cn(
          'form-input w-full resize-none',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          ⚠ {error}
        </p>
      )}
    </div>
  )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  required?: boolean
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function FormSelect({
  label,
  error,
  required,
  options,
  placeholder,
  className,
  id,
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <select
        id={id}
        className={cn(
          'form-input w-full',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          ⚠ {error}
        </p>
      )}
    </div>
  )
}
