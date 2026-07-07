const fs = require('fs')

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += ch }
  }
  result.push(current)
  return result
}

const content = fs.readFileSync(__dirname + '/lubricant-dataset.csv', 'utf-8')
const lines = content.split('\n').filter(l => l.trim())
const headers = parseCsvLine(lines[0]).map(h => h.trim())

// Find the 5 CSV rows that were matched
const targets = [
  { brand: 'Castrol', product: 'EDGE 5W-30' },
  { brand: 'Shell', product: 'Helix Ultra 5W-40' },
  { brand: 'TotalEnergies', product: 'Quartz 5000 10W-40' },
  { brand: 'Motul', product: '300V 4T FACTORY LINE 10W-40' },
  { brand: 'Yacco', product: 'LUBE RN-17 FE 0W-20' },
]

for (const t of targets) {
  for (const line of lines.slice(1)) {
    const vals = parseCsvLine(line).map(v => v.trim())
    if (vals[0] === t.brand && vals[1] === t.product) {
      const row = {}
      for (let i = 0; i < headers.length; i++) row[headers[i]] = vals[i]
      console.log(`\n=== ${t.brand} / ${t.product} ===`)
      console.log(`  Viscosity: ${row.Viscosity}`)
      console.log(`  API: ${row.API}`)
      console.log(`  ACEA: ${row.ACEA}`)
      console.log(`  VehicleTypes: ${row.VehicleTypes}`)
      console.log(`  FuelTypes: ${row.FuelTypes}`)
      console.log(`  OEMApprovals: ${row.OEMApprovals}`)
      console.log(`  Applications: ${row.Applications}`)
      break
    }
  }
}

// Also show ALL Castrol, Yacco, Motul rows in the CSV to compare
console.log('\n\n=== ALL ROWS FOR EACH RELEVANT BRAND (product name only) ===')
for (const brand of ['Castrol', 'Yacco', 'Motul', 'TotalEnergies']) {
  console.log(`\n--- ${brand} ---`)
  for (const line of lines.slice(1)) {
    const vals = parseCsvLine(line).map(v => v.trim())
    if (vals[0] === brand) {
      console.log(`  ${vals[1]} | visc=${vals[2]} | API=${vals[3]} | ACEA=${vals[4]} | Veh=${vals[6]} | Fuel=${vals[7]}`)
    }
  }
}
