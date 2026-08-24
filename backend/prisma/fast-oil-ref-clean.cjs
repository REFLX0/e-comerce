const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function buildOilSku(p) {
  const brand = (p.brand?.name || '').toUpperCase()
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

  const name = p.nameFr
  const viscMatch = name.match(/(\d+W[- ]?\d+)/i)
  const visc = viscMatch ? viscMatch[1].toUpperCase().replace(/\s+/, '-') : null

  const volMatch = name.match(/(\d+(?:\.\d+)?)\s*(L|Litres?|ml)\b/i)
  const vol = volMatch ? `${volMatch[1]}${volMatch[2].toLowerCase().startsWith('l') ? 'L' : 'ML'}` : null

  const codeMatch = name.match(/\b([1-9]\d{3,5})\b/)
  const numCode = codeMatch ? codeMatch[1] : null

  let line = ''
  if (/defender/i.test(name)) line = 'DEFENDER'
  else if (/ceramic pro/i.test(name)) line = 'CERAMIC-PRO'
  else if (/legend/i.test(name)) line = 'LEGEND'
  else if (/energy premium/i.test(name)) line = 'ENERGY-PREMIUM'
  else if (/energy formula/i.test(name)) line = 'ENERGY-PD'
  else if (/energy/i.test(name)) line = 'ENERGY'
  else if (/molibden ultra/i.test(name)) line = 'MOLIBDEN-ULTRA'
  else if (/molibden/i.test(name)) line = 'MOLIBDEN'
  else if (/hybride|hybrid/i.test(name)) line = 'HYBRID'
  else if (/special tec/i.test(name)) line = 'SPECIAL-TEC'
  else if (/top tec/i.test(name)) line = 'TOP-TEC'
  else if (/mos2/i.test(name)) line = 'MOS2'
  else if (/super hd/i.test(name)) line = 'SUPER-HD'
  else if (/molygen/i.test(name)) line = 'MOLYGEN'
  else if (/powerbike/i.test(name)) line = 'POWERBIKE'
  else if (/power plus/i.test(name)) line = 'POWER-PLUS'
  else if (/aqua jet/i.test(name)) line = 'AQUA-JET'
  else if (/outboard/i.test(name)) line = 'OUTBOARD'
  else if (/marine/i.test(name)) line = 'MARINE'
  else if (/4 temps|4t\b/i.test(name)) line = '4T'
  else if (/2 temps|2t\b/i.test(name)) line = '2T'
  else if (/fwd/i.test(name)) line = 'FWD'
  else if (/atf/i.test(name)) line = 'ATF'
  else if (/dct/i.test(name)) line = 'DCT'
  else if (/hypoid/i.test(name)) line = 'HYPOID'
  else if (/fourche/i.test(name)) line = 'FOURCHE'
  else if (/transmission/i.test(name)) line = 'TRANS'
  else if (/bo[iî]te/i.test(name)) line = 'BOITE'
  else if (/x-clean/i.test(name)) line = 'X-CLEAN'
  else if (/ineo/i.test(name)) line = 'INEO'
  else if (/quartz/i.test(name)) line = 'QUARTZ'
  else if (/evolution/i.test(name)) line = 'EVO'
  else if (/syntium/i.test(name)) line = 'SYNTIUM'

  let parts = [prefix]
  if (numCode) parts.push(numCode)
  if (line && !numCode) parts.push(line)
  if (visc) parts.push(visc)
  if (vol) parts.push(vol)

  let sku = parts.filter(Boolean).join('-')
  return sku
}

async function fastClean() {
  const lubeBrands = ['Mannol', 'Liqui Moly', 'Motul', 'Castrol', 'TotalEnergies', 'Total Energies', 'Shell', 'Elf', 'Petronas', 'Yacco', 'Rowe', 'Champion Lubricants', 'Osram', 'Neolux']

  // 1. Get all current SKUs in database
  const allSkus = await prisma.product.findMany({ select: { id: true, sku: true } })
  const usedProductSkus = new Set(allSkus.map(p => p.sku))
  
  const allVariants = await prisma.productVariant.findMany({ select: { id: true, skuVariant: true } })
  const usedVariantSkus = new Set(allVariants.map(v => v.skuVariant))

  // 2. Find target products to clean
  const targetProducts = await prisma.product.findMany({
    where: {
      OR: [
        { brand: { name: { in: lubeBrands } } },
        { sku: { startsWith: 'REF-' } }
      ]
    },
    include: { brand: true, variants: true }
  })

  console.log(`Found ${targetProducts.length} target products to standardize...`)

  for (const p of targetProducts) {
    usedProductSkus.delete(p.sku)
    for (const v of p.variants) usedVariantSkus.delete(v.skuVariant)

    const isLube = lubeBrands.includes(p.brand?.name || '')
    let finalSku = ''

    if (isLube) {
      const candidate = buildOilSku(p)
      finalSku = candidate
      let c = 1
      while (usedProductSkus.has(finalSku)) {
        finalSku = `${candidate}-${c}`
        c++
      }
    } else {
      // Auto part: restore OEM reference from title
      const nameParts = p.nameFr.trim().split(/\s+/)
      const lastPart = nameParts[nameParts.length - 1]
      let candidate = lastPart
      if (!candidate || candidate.length < 2 || candidate.toLowerCase().includes('huile')) {
        candidate = `SKU-${p.id.slice(-6).toUpperCase()}`
      }
      finalSku = candidate
      let c = 1
      while (usedProductSkus.has(finalSku)) {
        finalSku = `${candidate}-${c}`
        c++
      }
    }

    usedProductSkus.add(finalSku)
    console.log(`[${p.brand?.name || 'PART'}] ${p.sku} -> ${finalSku} ("${p.nameFr}")`)

    await prisma.product.update({
      where: { id: p.id },
      data: { sku: finalSku }
    })

    for (const v of p.variants) {
      const vol = v.volume && v.volume !== 'unité' ? `-${v.volume.toUpperCase().replace(/\s+/, '')}` : (finalSku.endsWith('L') || finalSku.endsWith('ML') ? '' : '-U')
      let varCandidate = finalSku.endsWith(vol.replace(/^-/, '')) ? finalSku : `${finalSku}${vol}`
      let finalVarSku = varCandidate
      let vc = 1
      while (usedVariantSkus.has(finalVarSku)) {
        finalVarSku = `${varCandidate}-V${vc}`
        vc++
      }
      usedVariantSkus.add(finalVarSku)

      await prisma.productVariant.update({
        where: { id: v.id },
        data: { skuVariant: finalVarSku }
      })
    }
  }

  console.log(`✅ Standardized all ${targetProducts.length} references cleanly and uniquely!`)
}

fastClean()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
