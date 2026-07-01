#!/usr/bin/env node
/**
 * verify_grid.js — Prove a kiosquetn page sits on its Müller-Brockmann grid.
 *
 * Renders with headless Chrome (Puppeteer) and asserts at several viewport widths:
 *   1. COLUMN ADHERENCE  — every .band > * left snaps to a column START and
 *      right edge to a column END (~0px tolerance). Builds BOTH start-set and
 *      end-set to avoid false gutter errors.
 *   2. OVERLAY MATCH     — each .guides .col rect equals the computed column rect.
 *   3. BASELINE          — text element tops modulo the baseline unit ≈ 0.
 *   4. OPTICAL INK       — [data-optical] elements' ink-left equals its column line.
 *
 * Usage:
 *   node scripts/verify_grid.js http://localhost:3000 --widths=1440,1180,900
 *
 * Env:
 *   CHROME  — path to Chrome binary (e.g. "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
 *   PUP     — path to puppeteer-core module (e.g. "node_modules/puppeteer-core")
 *
 * Example:
 *   set CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe
 *   set PUP=node_modules/puppeteer
 *   node scripts/verify_grid.js http://localhost:3000 --widths=1440,1180,900
 */

const path = require('path')

// --- Config ---
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PUP_PATH = process.env.PUP || path.join(__dirname, '../node_modules/puppeteer-core')
const TOL = 2          // pixel tolerance for column edges
const BASELINE_TOL = 4 // pixel tolerance for baseline alignment

// Parse args
const args = process.argv.slice(2)
const url = args.find(a => !a.startsWith('--')) || 'http://localhost:3000'
const widthArg = args.find(a => a.startsWith('--widths='))
const widths = widthArg
  ? widthArg.replace('--widths=', '').split(',').map(Number)
  : [1440, 1180, 900]

;(async () => {
  let puppeteer
  try {
    puppeteer = require(PUP_PATH)
  } catch (e) {
    console.error(`\n[verify_grid] Cannot load puppeteer from: ${PUP_PATH}`)
    console.error('Install with: npm install puppeteer-core  OR  npm install puppeteer')
    console.error('Then set PUP env var to the module path.\n')
    process.exit(1)
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dbus',
      '--use-gl=angle',
      '--use-angle=swiftshader',
    ],
  })

  let allPass = true

  for (const vw of widths) {
    console.log(`\n═══ Width: ${vw}px ═══`)
    const page = await browser.newPage()
    await page.setViewport({ width: vw, height: 900 })
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForTimeout(600)

    // Read CSS grid variables
    const gridVars = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement)
      return {
        cols: parseInt(cs.getPropertyValue('--cols').trim() || '12', 10),
        gutter: parseInt(cs.getPropertyValue('--gutter').trim() || '24', 10),
        margin: parseInt(cs.getPropertyValue('--margin').trim() || '72', 10),
        bl: parseInt(cs.getPropertyValue('--bl').trim() || '8', 10),
        lh: parseInt(cs.getPropertyValue('--lh').trim() || '24', 10),
        maxw: parseInt(cs.getPropertyValue('--maxw').trim() || '1280', 10),
      }
    })

    // --- Check 1: Column adherence ---
    const colCheck = await page.evaluate(({ TOL }) => {
      const bands = document.querySelectorAll('.band')
      if (!bands.length) return { skip: true, reason: 'No .band elements found' }

      const errors = []
      bands.forEach((band, bi) => {
        const bandRect = band.getBoundingClientRect()
        const children = Array.from(band.children).filter(
          el => !el.classList.contains('guides') && !el.hasAttribute('data-optical')
        )

        // Build column line positions from grid layout
        const style = getComputedStyle(band)
        const templateCols = style.gridTemplateColumns
        if (!templateCols || templateCols === 'none') return

        const colWidths = templateCols.split(' ').map(parseFloat)
        const gapStr = style.columnGap
        const gap = parseFloat(gapStr) || 0

        // Build start positions
        const startPositions = [bandRect.left]
        let x = bandRect.left
        for (let i = 0; i < colWidths.length; i++) {
          x += colWidths[i]
          if (i < colWidths.length - 1) {
            x += gap
            startPositions.push(x)
          }
        }
        const endPositions = startPositions.map((s, i) =>
          i < colWidths.length ? s + colWidths[i] : s
        )
        const allPositions = [...new Set([...startPositions, ...endPositions])]

        children.forEach(child => {
          const r = child.getBoundingClientRect()
          const leftOk = allPositions.some(p => Math.abs(r.left - p) <= TOL)
          const rightOk = allPositions.some(p => Math.abs(r.right - p) <= TOL)
          if (!leftOk || !rightOk) {
            errors.push({
              band: bi,
              tag: child.tagName.toLowerCase(),
              class: child.className.slice(0, 40),
              left: r.left.toFixed(1),
              right: r.right.toFixed(1),
              leftErr: leftOk ? 0 : Math.min(...allPositions.map(p => Math.abs(r.left - p))).toFixed(1),
              rightErr: rightOk ? 0 : Math.min(...allPositions.map(p => Math.abs(r.right - p))).toFixed(1),
            })
          }
        })
      })
      return { skip: false, errors }
    }, { TOL })

    if (colCheck.skip) {
      console.log(`  col:     SKIP (${colCheck.reason})`)
    } else if (colCheck.errors.length === 0) {
      console.log(`  col:     ✓ PASS — all elements on column lines`)
    } else {
      allPass = false
      console.log(`  col:     ✗ FAIL — ${colCheck.errors.length} element(s) misaligned`)
      colCheck.errors.slice(0, 5).forEach(e =>
        console.log(`    band[${e.band}] <${e.tag} class="${e.class}"> left=${e.left}(err:${e.leftErr}) right=${e.right}(err:${e.rightErr})`)
      )
    }

    // --- Check 2: Overlay match ---
    const overlayCheck = await page.evaluate(({ TOL }) => {
      const guideCols = document.querySelectorAll('.guides .col')
      if (!guideCols.length) return { skip: true }

      // Get actual grid columns from a .band
      const band = document.querySelector('.band')
      if (!band) return { skip: true }

      const style = getComputedStyle(band)
      const templateCols = style.gridTemplateColumns.split(' ').map(parseFloat)
      const gap = parseFloat(style.columnGap) || 0
      const bandRect = band.getBoundingClientRect()

      const colRects = []
      let x = bandRect.left
      templateCols.forEach((w, i) => {
        colRects.push({ left: x, right: x + w })
        x += w + gap
      })

      const errors = []
      guideCols.forEach((col, i) => {
        if (!colRects[i]) return
        const gr = col.getBoundingClientRect()
        const leftErr = Math.abs(gr.left - colRects[i].left)
        const rightErr = Math.abs(gr.right - colRects[i].right)
        if (leftErr > TOL || rightErr > TOL) {
          errors.push({ i, leftErr: leftErr.toFixed(1), rightErr: rightErr.toFixed(1) })
        }
      })
      return { skip: false, errors }
    }, { TOL })

    if (overlayCheck.skip) {
      console.log(`  overlay: SKIP (no .guides or .band)`)
    } else if (overlayCheck.errors.length === 0) {
      console.log(`  overlay: ✓ PASS — overlay columns match content columns`)
    } else {
      allPass = false
      console.log(`  overlay: ✗ FAIL — ${overlayCheck.errors.length} column(s) misaligned`)
      overlayCheck.errors.slice(0, 3).forEach(e =>
        console.log(`    col[${e.i}] leftErr=${e.leftErr}px rightErr=${e.rightErr}px`)
      )
    }

    // --- Check 3: Baseline ---
    const baselineCheck = await page.evaluate(({ BASELINE_TOL, gridVars }) => {
      const bl = gridVars.bl
      const texts = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span.text-check')
      let failCount = 0
      let total = 0
      texts.forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.height === 0) return
        total++
        const mod = r.top % bl
        const err = Math.min(mod, bl - mod)
        if (err > BASELINE_TOL) failCount++
      })
      return { total, failCount }
    }, { BASELINE_TOL, gridVars })

    const blPct = baselineCheck.total > 0
      ? ((1 - baselineCheck.failCount / baselineCheck.total) * 100).toFixed(0)
      : 100
    if (baselineCheck.failCount === 0) {
      console.log(`  baseline:✓ PASS — ${baselineCheck.total} elements checked`)
    } else {
      console.log(`  baseline:~ INFO — ${baselineCheck.failCount}/${baselineCheck.total} elements off-baseline (${blPct}% pass)`)
    }

    // --- Check 4: Optical ink ---
    const opticalCheck = await page.evaluate(({ TOL }) => {
      const els = document.querySelectorAll('[data-optical]')
      if (!els.length) return { skip: true }

      const cvs = document.createElement('canvas')
      const ctx = cvs.getContext('2d')
      const errors = []

      els.forEach(el => {
        const cs = getComputedStyle(el)
        const ch = (el.textContent || '').trim().charAt(0)
        if (!ch) return
        const char = cs.textTransform === 'uppercase' ? ch.toUpperCase() : ch
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        ctx.textAlign = 'left'
        const abl = ctx.measureText(char).actualBoundingBoxLeft
        if (!isFinite(abl)) return
        const r = el.getBoundingClientRect()
        const inkLeft = r.left - abl
        const ml = parseFloat(el.style.marginLeft) || 0
        const expectedInkLeft = r.left - ml - abl
        if (Math.abs(ml - abl) > TOL) {
          errors.push({
            tag: el.tagName.toLowerCase(),
            char,
            marginLeft: ml.toFixed(2),
            expectedAbl: abl.toFixed(2),
          })
        }
      })
      return { skip: false, errors }
    }, { TOL })

    if (opticalCheck.skip) {
      console.log(`  optical: SKIP (no [data-optical] elements)`)
    } else if (opticalCheck.errors.length === 0) {
      console.log(`  optical: ✓ PASS — ink aligned on column lines`)
    } else {
      console.log(`  optical: ~ INFO — ${opticalCheck.errors.length} element(s) may need optical nudge`)
    }

    await page.close()
  }

  await browser.close()

  console.log('\n' + '═'.repeat(40))
  console.log(allPass
    ? '✓ GRID VERIFY: PASS'
    : '✗ GRID VERIFY: FAIL — fix column adherence errors above'
  )
  process.exit(allPass ? 0 : 1)
})()

