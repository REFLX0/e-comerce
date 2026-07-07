function normalizeForMatch(name, brandName) {
  let n = name ? name.toLowerCase() : ''
  if (brandName) {
    const bn = brandName.toLowerCase()
    if (n.startsWith(bn)) n = n.slice(bn.length).trim()
  }
  return n.replace(/[^a-z0-9]/g, '')
}

function matchScore(dbName, csvProduct, csvBrand) {
  const dbNorm = normalizeForMatch(dbName, csvBrand)
  const csvNorm = normalizeForMatch(csvProduct, null)

  console.log(`  dbNorm="${dbNorm}" csvNorm="${csvNorm}"`)
  console.log(`  dbNorm === csvNorm: ${dbNorm === csvNorm}`)
  console.log(`  dbNorm.includes(csvNorm): ${dbNorm.includes(csvNorm)}`)
  console.log(`  csvNorm.includes(dbNorm): ${csvNorm.includes(dbNorm)}`)

  if (dbNorm === csvNorm) return 100
  if (dbNorm.includes(csvNorm)) return 80
  if (csvNorm.includes(dbNorm)) return 70

  const viscMatch = csvProduct.match(/(\d+W[-\s]?\d+)/i)
  if (viscMatch) {
    const csvVisc = viscMatch[1].replace(/\s+/g, '').toLowerCase()
    if (dbNorm.includes(csvVisc)) return 50
  }

  return 0
}

// Test Motul case
console.log('Match 1: Motul 300V Factory Line 10W-40 vs 300V 4T FACTORY LINE 10W-40')
console.log(matchScore('Motul 300V Factory Line 10W-40', '300V 4T FACTORY LINE 10W-40', 'Motul'))
console.log()

// Test Yacco case
console.log('Match 2: Yacco Lube DI 0W-20 C6 vs LUBE RN-17 FE 0W-20')
console.log(matchScore('Yacco Lube DI 0W-20 C6', 'LUBE RN-17 FE 0W-20', 'Yacco'))
console.log()

// Test Total case
console.log('Match 3: Total Quartz 7000 10W-40 vs Quartz 5000 10W-40')
console.log(matchScore('Total Quartz 7000 10W-40', 'Quartz 5000 10W-40', 'TotalEnergies'))
console.log()
