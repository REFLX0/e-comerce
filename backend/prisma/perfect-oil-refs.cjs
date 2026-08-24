const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function cleanSlugName(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
}

function buildSmartRef(product) {
  const brand = (product.brand?.name || '').toUpperCase()
  let prefix = 'REF'
  if (brand.includes('MANNOL')) prefix = 'MN'
  else if (brand.includes('LIQUI MOLY') || brand.includes('LIQUIMOLY')) prefix = 'LM'
  else if (brand.includes('MOTUL')) prefix = 'MOT'
  else if (brand.includes('CASTROL')) prefix = 'CAS'
  else if (brand.includes('TOTAL')) prefix = 'TOT'
  else if (brand.includes('SHELL')) prefix = 'SHL'
  else if (brand.includes('ELF')) prefix = 'ELF'
  else if (brand.includes('PETRONAS')) prefix = 'PET'
  else if (brand.includes('YACCO')) prefix = 'YAC'
  else if (brand.includes('ROWE')) prefix = 'ROWE'
  else if (brand.includes('CHAMPION')) prefix = 'CHAMP'
  else if (brand.includes('OSRAM')) prefix = 'OSR'
  else if (brand.includes('NEOLUX')) prefix = 'NEO'

  const rawName = cleanSlugName(product.nameFr)
  const words = rawName.split(/\s+/).filter(Boolean)

  const stopWords = new Set(['LIQUI', 'MOLY', 'MANNOL', 'MOTUL', 'CASTROL', 'TOTAL', 'ENERGIES', 'SHELL', 'ELF', 'PETRONAS', 'YACCO', 'ROWE', 'OSRAM', 'NEOLUX', 'DE', 'DU', 'DES', 'LE', 'LA', 'LES', 'POUR', 'A', 'ET', 'EN', 'UN', 'UNE', 'AVEC', 'PAR', 'SUR', 'AU', 'AUX'])

  // Extract Viscosity (e.g. 5W-30, 10W-40, 0W-20, 75W-80, 80W-90)
  const viscMatch = product.nameFr.match(/(\d+W[- ]?\d+)/i)
  const visc = viscMatch ? viscMatch[1].toUpperCase().replace(/\s+/, '-') : null

  // Extract Volume (e.g. 1L, 4L, 5L, 20L, 250ML, 300ML, 400ML, 500ML)
  const volMatch = product.nameFr.match(/(\d+(?:\.\d+)?)\s*(L|Litres?|ml)\b/i)
  const vol = volMatch ? `${volMatch[1]}${volMatch[2].toLowerCase().startsWith('l') ? 'L' : 'ML'}` : null

  // Extract 4-to-5 digit product codes
  const codeMatch = product.nameFr.match(/\b([1-9]\d{3,4})\b/)
  const numCode = codeMatch ? codeMatch[1] : null

  // Filter significant words
  const keyWords = []
  for (const w of words) {
    const upper = w.toUpperCase()
    if (stopWords.has(upper)) continue
    if (visc && upper.includes('W')) continue
    if (vol && upper.includes(vol)) continue
    if (numCode && upper === numCode) continue
    if (upper === 'HUILE' || upper === 'MOTEUR') continue
    keyWords.push(upper)
  }

  const parts = [prefix]
  if (numCode) parts.push(numCode)
  
  const descPart = keyWords.slice(0, 3).join('-')
  if (descPart && (!numCode || keyWords.length <= 2)) {
    parts.push(descPart)
  } else if (!descPart && !numCode && !visc) {
    parts.push('PRODUCT')
  }

  if (visc) parts.push(visc)
  if (vol) parts.push(vol)

  let clean = parts.filter(Boolean).join('-')
  clean = clean.replace(/-+/g, '-')
  return clean
}

async function perfectAllOils() {
  const lubeBrands = ['Mannol', 'Liqui Moly', 'Motul', 'Castrol', 'TotalEnergies', 'Total Energies', 'Shell', 'Elf', 'Petronas', 'Yacco', 'Rowe', 'Champion Lubricants', 'Osram', 'Neolux']

  const allProducts = await prisma.product.findMany({
    select: { id: true, sku: true }
  })
  const usedSkus = new Set(allProducts.map(p => p.sku))

  const allVariants = await prisma.productVariant.findMany({
    select: { id: true, skuVariant: true }
  })
  const usedVarSkus = new Set(allVariants.map(v => v.skuVariant))

  const targetProducts = await prisma.product.findMany({
    where: {
      brand: { name: { in: lubeBrands } }
    },
    include: { brand: true, variants: true }
  })

  console.log(`Cleaning ${targetProducts.length} oil & accessory references...`)

  for (const p of targetProducts) {
    usedSkus.delete(p.sku)
    for (const v of p.variants) usedVarSkus.delete(v.skuVariant)

    let candidate = buildSmartRef(p)
    let finalSku = candidate
    let c = 1
    while (usedSkus.has(finalSku)) {
      finalSku = `${candidate}-${c}`
      c++
    }
    usedSkus.add(finalSku)

    console.log(`[${p.brand?.name}] ${p.sku} -> ${finalSku} ("${p.nameFr}")`)

    await prisma.product.update({
      where: { id: p.id },
      data: { sku: finalSku }
    })

    for (let i = 0; i < p.variants.length; i++) {
      const v = p.variants[i]
      const vol = v.volume && v.volume !== 'unité' ? `-${v.volume.toUpperCase().replace(/\s+/, '')}` : (finalSku.endsWith('L') || finalSku.endsWith('ML') ? '' : '-U')
      let varCandidate = finalSku.endsWith(vol.replace(/^-/, '')) ? finalSku : `${finalSku}${vol}`
      let finalVarSku = varCandidate
      let vc = 1
      while (usedVarSkus.has(finalVarSku)) {
        finalVarSku = `${varCandidate}-V${vc}`
        vc++
      }
      usedVarSkus.add(finalVarSku)

      await prisma.productVariant.update({
        where: { id: v.id },
        data: { skuVariant: finalVarSku }
      })
    }
  }

  console.log('✅ ALL oil & lubricant product references are now 100% human-readable, professional and unique!')
}

perfectAllOils()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
