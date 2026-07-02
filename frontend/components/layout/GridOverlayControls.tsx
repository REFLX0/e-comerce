"use client"

import { useEffect, useState } from 'react'

export function GridOverlayControls() {
  const [isGridOn, setIsGridOn] = useState(false)

  useEffect(() => {
    const applyGridState = (nextState: boolean) => {
      document.body.classList.toggle('grid-on', nextState)
      localStorage.setItem('grid-on', nextState ? '1' : '0')
      setIsGridOn(nextState)
    }

    applyGridState(localStorage.getItem('grid-on') === '1')

    const handleKeyDown = (event: KeyboardEvent) => {
      const tagName = document.activeElement?.tagName
      if (
        (event.key === 'g' || event.key === 'G') &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        tagName !== 'INPUT' &&
        tagName !== 'TEXTAREA' &&
        tagName !== 'SELECT'
      ) {
        applyGridState(!document.body.classList.contains('grid-on'))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleGrid = () => {
    const nextState = !isGridOn
    document.body.classList.toggle('grid-on', nextState)
    localStorage.setItem('grid-on', nextState ? '1' : '0')
    setIsGridOn(nextState)
  }

  return (
    <button
      id="gridToggle"
      className="grid-toggle"
      aria-pressed={isGridOn}
      aria-label="Afficher/Masquer la grille de mise en page"
      title="G - Afficher/Masquer la grille"
      type="button"
      onClick={toggleGrid}
    >
      <span className="dot" aria-hidden="true" />
      <span className="lbl">{isGridOn ? 'Hide grid' : 'Show grid'}</span>
    </button>
  )
}
