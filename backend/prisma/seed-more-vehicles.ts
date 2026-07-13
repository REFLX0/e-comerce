import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding many more vehicles...')

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
    { name: 'Citroën', slug: 'citroen' },
    { name: 'Opel', slug: 'opel' },
    { name: 'Škoda', slug: 'skoda' },
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

  for (const b of brands) {
    const make = await prisma.vehicleMake.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug },
    })
    
    // Add some default models just so it's not empty
    await prisma.vehicleModel.upsert({
      where: { slug: `${b.slug}-model-1` },
      update: {},
      create: { makeId: make.id, name: 'Modèle Standard', slug: `${b.slug}-model-1` },
    })
    await prisma.vehicleModel.upsert({
      where: { slug: `${b.slug}-model-2` },
      update: {},
      create: { makeId: make.id, name: 'Modèle Sport', slug: `${b.slug}-model-2` },
    })
    await prisma.vehicleModel.upsert({
      where: { slug: `${b.slug}-model-3` },
      update: {},
      create: { makeId: make.id, name: 'SUV', slug: `${b.slug}-model-3` },
    })
  }

  console.log('Added multiple brands successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
