const http = require('http')

const tests = [
  { name: 'AUTOMOBILE / DIESEL (4cyl, 90cv)', query: 'vehicleType=AUTOMOBILE&cylinders=4&power=90&fuelType=DIESEL' },
  { name: 'MOTO / ESSENCE (2cyl, 50cv)', query: 'vehicleType=MOTO&cylinders=2&power=50&fuelType=ESSENCE' },
  { name: 'POIDS_LOURD / DIESEL (6cyl, 250cv)', query: 'vehicleType=POIDS_LOURD&cylinders=6&power=250&fuelType=DIESEL' },
  { name: 'AGRICOLE / DIESEL (4cyl, 100cv)', query: 'vehicleType=AGRICOLE&cylinders=4&power=100&fuelType=DIESEL' },
  { name: 'AUTOMOBILE / ESSENCE (3cyl, 75cv)', query: 'vehicleType=AUTOMOBILE&cylinders=3&power=75&fuelType=ESSENCE' },
]

async function run() {
  for (const t of tests) {
    console.log(`\n=== ${t.name} ===`)
    console.log(`  GET /api/products/oil-recommendations?${t.query}`)
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(`http://localhost:4000/api/products/oil-recommendations?${t.query}`, res => {
          let d = ''
          res.on('data', c => d += c)
          res.on('end', () => resolve(JSON.parse(d)))
        }).on('error', reject)
      })
      console.log(`  Total: ${data.total}`)
      data.data.forEach(p => console.log(`    - ${p.name} | ${p.specs?.viscosity || 'N/A'}`))
    } catch (e) {
      console.error(`  ERROR: ${e.message}`)
    }
  }
}

run()
