const fs = require('fs')
const content = fs.readFileSync(__dirname + '/lubricant-dataset.csv', 'utf-8')
const lines = content.split('\n').filter(l => l.trim())

for (const line of lines) {
  const parts = line.split(',')
  const brand = parts[0].trim()
  if (brand.startsWith('Motul') || brand.startsWith('Yacco') || brand.startsWith('Total')) {
    console.log('Brand:', JSON.stringify(brand), 'length:', brand.length, 'chars:', [...brand].map(c => c.charCodeAt(0)))
  }
}

const yaccoLines = lines.filter(l => l.startsWith('Yacco'))
console.log('Yacco lines:', yaccoLines.length)
const motulLines = lines.filter(l => l.startsWith('Motul'))
console.log('Motul lines:', motulLines.length)
