const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const brands = [
  { name: 'Peugeot', slug: 'peugeot' },
  { name: 'Renault', slug: 'renault' },
  { name: 'Volkswagen', slug: 'volkswagen' },
  { name: 'Audi', slug: 'audi' },
  { name: 'BMW', slug: 'bmw' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz' },
  { name: 'Toyota', slug: 'toyota' },
  { name: 'Ford', slug: 'ford' },
  { name: 'Fiat', slug: 'fiat' },
  { name: 'Hyundai', slug: 'hyundai' },
  { name: 'Kia', slug: 'kia' },
  { name: 'Nissan', slug: 'nissan' },
  { name: 'Honda', slug: 'honda' },
  { name: 'Mazda', slug: 'mazda' },
  { name: 'Citroen', slug: 'citroen' },
  { name: 'Opel', slug: 'opel' },
  { name: 'Skoda', slug: 'skoda' },
  { name: 'SEAT', slug: 'seat' },
  { name: 'Dacia', slug: 'dacia' },
  { name: 'Jeep', slug: 'jeep' },
  { name: 'Land Rover', slug: 'land-rover' },
  { name: 'Volvo', slug: 'volvo' },
  { name: 'Subaru', slug: 'subaru' },
  { name: 'Suzuki', slug: 'suzuki' },
  { name: 'Mitsubishi', slug: 'mitsubishi' },
  { name: 'Porsche', slug: 'porsche' },
  { name: 'Lexus', slug: 'lexus' },
  { name: 'Alfa Romeo', slug: 'alfa-romeo' },
  { name: 'Chevrolet', slug: 'chevrolet' },
  { name: 'Mini', slug: 'mini' },
]

const modelsByMake = {
  'peugeot':       ['208','308','3008','5008','508'],
  'renault':       ['Clio 4','Megane 4','Kadjar','Duster','Symbol','Logan'],
  'volkswagen':    ['Golf 7','Polo 6','Passat','Tiguan','Touareg'],
  'audi':          ['A3','A4','A6','Q3','Q5'],
  'bmw':           ['Serie 1','Serie 3','Serie 5','X3','X5'],
  'mercedes-benz': ['Classe A','Classe C','Classe E','GLC','GLE'],
  'toyota':        ['Corolla','Yaris','RAV4','Land Cruiser','Camry'],
  'ford':          ['Focus','Fiesta','Kuga','Puma'],
  'fiat':          ['Punto','500','Tipo','Panda'],
  'hyundai':       ['i20','i30','Tucson','Santa Fe','Elantra'],
  'kia':           ['Picanto','Rio','Sportage','Sorento'],
  'nissan':        ['Micra','Qashqai','X-Trail','Juke'],
  'honda':         ['Civic','CR-V','Jazz','HR-V'],
  'mazda':         ['Mazda3','Mazda6','CX-5','MX-5'],
  'citroen':       ['C3','C4','C5 Aircross','Berlingo'],
  'opel':          ['Corsa','Astra','Insignia','Grandland X'],
  'skoda':         ['Octavia','Fabia','Superb','Karoq'],
  'seat':          ['Ibiza','Leon','Arona','Ateca'],
  'dacia':         ['Sandero','Duster','Logan','Dokker'],
  'jeep':          ['Wrangler','Cherokee','Grand Cherokee','Renegade'],
  'land-rover':    ['Discovery','Range Rover','Defender','Freelander'],
  'volvo':         ['S60','V40','XC40','XC60','XC90'],
  'subaru':        ['Impreza','Forester','Outback'],
  'suzuki':        ['Swift','Vitara','S-Cross','Jimny'],
  'mitsubishi':    ['Lancer','Outlander','Eclipse Cross','L200'],
  'porsche':       ['911','Cayenne','Macan','Panamera'],
  'lexus':         ['IS','ES','RX','NX'],
  'alfa-romeo':    ['Giulia','Stelvio','147','156'],
  'chevrolet':     ['Cruze','Spark','Malibu','Captiva'],
  'mini':          ['Cooper','Clubman','Countryman','Paceman'],
}

async function main() {
  console.log('Seeding 30 vehicle makes...')
  let count = 0

  for (const b of brands) {
    let make
    try {
      make = await p.vehicleMake.upsert({
        where: { slug: b.slug },
        update: { name: b.name },
        create: { name: b.name, slug: b.slug },
      })
    } catch (e) {
      console.log('  skipping make', b.slug, e.message)
      continue
    }

    const modelNames = modelsByMake[b.slug] || ['Standard','Sport','SUV']
    for (const modelName of modelNames) {
      const modelSlug = b.slug + '-' + modelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      try {
        await p.vehicleModel.upsert({
          where: { slug: modelSlug },
          update: {},
          create: { makeId: make.id, name: modelName, slug: modelSlug },
        })
      } catch (e) {
        console.log('  skipping model', modelSlug)
      }
    }

    count++
    console.log('  Added', b.name, 'with', modelNames.length, 'models')
  }

  console.log('Done! Added', count, 'makes.')
  await p.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await p.$disconnect()
  process.exit(1)
})
