const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function extractViscosity(text) {
  const match = text.match(/(\d+W[- ]?\d+)/i)
  if (match) return match[1].toUpperCase().replace(/\s+/, '-')
  const single = text.match(/(\d+W)/i)
  if (single) return single[1].toUpperCase()
  const sae = text.match(/SAE\s*(\d+)/i)
  if (sae) return `SAE-${sae[1]}`
  return null
}

function extractVolume(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(L|Litres?|ml)\b/i)
  if (match) {
    const val = match[1]
    const unit = match[2].toLowerCase().startsWith('l') ? 'L' : 'ML'
    return `${val}${unit}`
  }
  return null
}

function buildCleanOilSku(product) {
  const name = product.nameFr
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

  // Look for any existing 4-digit code in the name or slug (e.g. 7707, 4210, 6600, 7402)
  const codeMatch = name.match(/\b([1-9]\d{3})\b/)
  const numCode = codeMatch ? codeMatch[1] : null

  const visc = extractViscosity(name)
  const vol = extractVolume(name) || (product.variants[0]?.volume && product.variants[0]?.volume !== 'unité' ? product.variants[0]?.volume.toUpperCase() : null)

  // Extract model/line name (e.g., Defender, Legend, Energy, Top Tec, Special Tec, Molygen, Ceramic Pro, etc.)
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
  else if (/frein|dot/i.test(name)) line = 'DOT'
  else if (/refroidissement|antigel|g11|g12|g13/i.test(name)) line = 'COOLANT'
  else if (/x-clean/i.test(name)) line = 'X-CLEAN'
  else if (/ineo/i.test(name)) line = 'INEO'
  else if (/quartz/i.test(name)) line = 'QUARTZ'
  else if (/evolution/i.test(name)) line = 'EVO'
  else if (/syntium/i.test(name)) line = 'SYNTIUM'

  let parts = [prefix]
  if (numCode) parts.push(numCode)
  if (line && !numCode) parts.push(line)
  else if (line && numCode && !['4T', '2T'].includes(line)) parts.push(line)
  if (visc) parts.push(visc)
  if (vol) parts.push(vol)

  let sku = parts.filter(Boolean).join('-')
  if (sku === prefix) {
    sku = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
  }
  return sku
}

async function fixAllOilRefs() {
  const oils = await prisma.product.findMany({
    where: {
      OR: [
        { brand: { name: { in: ['Mannol', 'Liqui Moly', 'Motul', 'Castrol', 'TotalEnergies', 'Shell', 'Elf', 'Petronas', 'Yacco'] } } },
        { nameFr: { contains: 'Huile', mode: 'insensitive' } },
        { category: { slug: { contains: 'huile' } } },
        { category: { slug: { contains: 'lubrifiant' } } }
      ]
    },
    include: { brand: true, variants: true }
  })

  console.log(`Found ${oils.length} oil products to audit and refine...`)
  const usedSkus = new Set()

  // Pre-populate with existing auto-part SKUs so there are no collisions
  const autoParts = await prisma.product.findMany({
    where: {
      brand: { name: { notIn: ['Mannol', 'Liqui Moly', 'Motul', 'Castrol', 'TotalEnergies', 'Shell', 'Elf', 'Petronas', 'Yacco'] } }
    },
    select: { sku: true }
  })
  autoParts.forEach(p => usedSkus.add(p.sku))

  for (const product of oils) {
    let cleanSku = buildCleanOilSku(product)
    let finalSku = cleanSku
    let count = 1

    while (usedSkus.has(finalSku)) {
      finalSku = `${cleanSku}-${count}`
      count++
    }
    usedSkus.add(finalSku)

    console.log(`[${product.brand?.name || 'OIL'}] ${product.sku} -> ${finalSku} ("${product.nameFr}")`)

    await prisma.product.update({
      where: { id: product.id },
      data: { sku: finalSku }
    })

    for (const v of product.variants) {
      const volSuffix = v.volume && v.volume !== 'unité' ? `-${v.volume.toUpperCase().replace(/\s+/, '')}` : (finalSku.endsWith('L') || finalSku.endsWith('ML') ? '' : '-U')
      const varSku = finalSku.endsWith(volSuffix.replace(/^-/, '')) ? finalSku : `${finalSku}${volSuffix}`

      await prisma.productVariant.update({
        where: { id: v.id },
        data: { skuVariant: varSku }
      })
    }
  }

  console.log(`✅ All ${oils.length} oil & lubricant references successfully fixed!`)
}

fixAllOilRefs()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
