"use client"

import { useEffect, useState } from 'react'

function alignOpticalText() {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return

  document.querySelectorAll<HTMLElement>('[data-optical]').forEach((element) => {
    element.style.marginLeft = '0px'

    const styles = getComputedStyle(element)
    let firstCharacter = (element.textContent || '').trim().charAt(0)
    if (!firstCharacter) return
    if (styles.textTransform === 'uppercase') firstCharacter = firstCharacter.toUpperCase()

    context.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`
    context.textAlign = 'left'

    const leftBearing = context.measureText(firstCharacter).actualBoundingBoxLeft
    if (Number.isFinite(leftBearing)) {
      element.style.marginLeft = `${leftBearing.toFixed(2)}px`
    }
  })
}

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

  useEffect(() => {
    alignOpticalText()
    document.fonts?.ready.then(alignOpticalText)

    let resizeTimer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(alignOpticalText, 120)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
    }
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
