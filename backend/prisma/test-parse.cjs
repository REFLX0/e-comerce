const fs = require('fs')

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

const content = fs.readFileSync(__dirname + '/lubricant-dataset.csv', 'utf-8')
const lines = content.split('\n').filter(l => l.trim())
const headers = parseCsvLine(lines[0]).map(h => h.trim())
console.log('Headers:', JSON.stringify(headers))
console.log('Header count:', headers.length)

for (let i = 1; i < Math.min(5, lines.length); i++) {
  const vals = parseCsvLine(lines[i])
  console.log('Row ' + i + ' values count:', vals.length)
  const row = {}
  for (let j = 0; j < headers.length; j++) {
    row[headers[j]] = (vals[j] || '').trim()
  }
  console.log('  Row keys:', Object.keys(row).slice(0, 3))
  console.log('  vals[0]:', JSON.stringify(vals[0]))
  console.log('  vals[1]:', JSON.stringify(vals[1]))
  console.log('  row[headers[0]]:', JSON.stringify(row[headers[0]]))
}
