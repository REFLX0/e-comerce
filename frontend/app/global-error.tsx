"use client";

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// global-error.tsx catches errors in the root layout itself.
// It must include its own <html> and <body> tags.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error)
  }, [error])

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#f8fafc',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              margin: '0 auto 24px',
            }}
          >
            <AlertTriangle size={36} style={{ color: '#ef4444' }} />
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '12px',
              lineHeight: 1.3,
            }}
          >
            Le site rencontre un problème
          </h1>

          {/* Message */}
          <p
            style={{
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '8px',
              fontSize: '1rem',
            }}
          >
            Une erreur critique s&apos;est produite. Veuillez rafraîchir la
            page ou réessayer dans quelques instants.
          </p>

          {error.digest && (
            <p
              style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
                marginBottom: '32px',
                fontFamily: 'monospace',
              }}
            >
              Référence erreur: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 24px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              type="button"
              onMouseOver={(e) =>
                (e.currentTarget.style.opacity = '0.85')
              }
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <RefreshCw size={16} />
              Rafraîchir la page
            </button>

            <a
              href="/"
              style={{
                color: '#0f172a',
                fontSize: '0.875rem',
                textDecoration: 'underline',
                opacity: 0.6,
              }}
            >
              Retour à l&apos;accueil
            </a>
          </div>

          {/* Status */}
          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#f97316',
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Notre équipe a été alertée automatiquement
            </span>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </body>
    </html>
  )
}
