const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const MAKES_MODELS = [
  {
    name: 'Tesla', slug: 'tesla',
    models: [
      { name: 'Model S', slug: 'tesla-model-s', engines: [{ code: 'Dual Motor AWD', from: 2012, to: null }, { code: 'Plaid Tri Motor', from: 2021, to: null }] },
      { name: 'Model 3', slug: 'tesla-model-3', engines: [{ code: 'Standard Range Plus', from: 2017, to: null }, { code: 'Long Range AWD', from: 2017, to: null }, { code: 'Performance AWD', from: 2017, to: null }] },
      { name: 'Model X', slug: 'tesla-model-x', engines: [{ code: 'Dual Motor AWD', from: 2015, to: null }, { code: 'Plaid Tri Motor', from: 2021, to: null }] },
      { name: 'Model Y', slug: 'tesla-model-y', engines: [{ code: 'Long Range AWD', from: 2020, to: null }, { code: 'Performance AWD', from: 2020, to: null }] },
    ]
  },
  {
    name: 'Jaguar', slug: 'jaguar',
    models: [
      { name: 'F-Pace', slug: 'jag-f-pace', engines: [{ code: '2.0 D165', from: 2016, to: null }, { code: '2.0 P250', from: 2016, to: null }, { code: '3.0 P400', from: 2016, to: null }] },
      { name: 'XE', slug: 'jag-xe', engines: [{ code: '2.0 D200', from: 2015, to: null }, { code: '2.0 P250', from: 2015, to: null }] },
      { name: 'XF', slug: 'jag-xf', engines: [{ code: '2.0 D200', from: 2015, to: null }, { code: '2.0 P250', from: 2015, to: null }, { code: '3.0 D300', from: 2015, to: null }] },
    ]
  },
  {
    name: 'Aston Martin', slug: 'aston-martin',
    models: [
      { name: 'DB11', slug: 'aston-db11', engines: [{ code: '4.0 V8 510', from: 2016, to: null }, { code: '5.2 V12 608', from: 2016, to: null }] },
      { name: 'Vantage', slug: 'aston-vantage', engines: [{ code: '4.0 V8 510', from: 2018, to: null }] },
      { name: 'DBX', slug: 'aston-dbx', engines: [{ code: '4.0 V8 550', from: 2020, to: null }, { code: '4.0 V8 707', from: 2022, to: null }] },
    ]
  },
  {
    name: 'Ferrari', slug: 'ferrari',
    models: [
      { name: '488', slug: 'ferrari-488', engines: [{ code: '3.9 V8 670 GTB', from: 2015, to: 2019 }, { code: '3.9 V8 720 Pista', from: 2018, to: 2020 }] },
      { name: 'F8', slug: 'ferrari-f8', engines: [{ code: '3.9 V8 720 Tributo', from: 2019, to: null }] },
      { name: 'Roma', slug: 'ferrari-roma', engines: [{ code: '3.9 V8 620', from: 2020, to: null }] },
      { name: 'SF90', slug: 'ferrari-sf90', engines: [{ code: '4.0 V8 PHEV 1000 Stradale', from: 2019, to: null }] },
    ]
  },
  {
    name: 'Lamborghini', slug: 'lamborghini',
    models: [
      { name: 'Huracán', slug: 'lambo-huracan', engines: [{ code: '5.2 V10 610-4', from: 2014, to: null }, { code: '5.2 V10 640-4 EVO', from: 2019, to: null }] },
      { name: 'Aventador', slug: 'lambo-aventador', engines: [{ code: '6.5 V12 700-4', from: 2011, to: null }, { code: '6.5 V12 740-4 S', from: 2017, to: null }] },
      { name: 'Urus', slug: 'lambo-urus', engines: [{ code: '4.0 V8 650', from: 2018, to: null }, { code: '4.0 V8 666 Performante', from: 2022, to: null }] },
    ]
  },
  {
    name: 'Maserati', slug: 'maserati',
    models: [
      { name: 'Ghibli', slug: 'maserati-ghibli', engines: [{ code: '3.0 V6 350', from: 2013, to: null }, { code: '3.0 V6 430 S', from: 2013, to: null }, { code: '3.0 V6 275 Diesel', from: 2013, to: null }] },
      { name: 'Levante', slug: 'maserati-levante', engines: [{ code: '3.0 V6 350', from: 2016, to: null }, { code: '3.0 V6 430 S', from: 2016, to: null }, { code: '3.8 V8 580 Trofeo', from: 2018, to: null }] },
      { name: 'Quattroporte', slug: 'maserati-quattroporte', engines: [{ code: '3.0 V6 410 S', from: 2013, to: null }, { code: '3.8 V8 530 GTS', from: 2013, to: null }] },
    ]
  },
  {
    name: 'Bentley', slug: 'bentley',
    models: [
      { name: 'Continental GT', slug: 'bentley-conti-gt', engines: [{ code: '4.0 V8 550', from: 2018, to: null }, { code: '6.0 W12 635', from: 2018, to: null }] },
      { name: 'Bentayga', slug: 'bentley-bentayga', engines: [{ code: '4.0 V8 550', from: 2016, to: null }, { code: '6.0 W12 608', from: 2016, to: null }, { code: '3.0 V6 PHEV 449', from: 2019, to: null }] },
      { name: 'Flying Spur', slug: 'bentley-flying-spur', engines: [{ code: '4.0 V8 550', from: 2019, to: null }, { code: '6.0 W12 635', from: 2019, to: null }, { code: '2.9 V6 PHEV 544', from: 2021, to: null }] },
    ]
  },
  {
    name: 'Rolls-Royce', slug: 'rolls-royce',
    models: [
      { name: 'Ghost', slug: 'rr-ghost', engines: [{ code: '6.75 V12 571', from: 2020, to: null }] },
      { name: 'Phantom', slug: 'rr-phantom', engines: [{ code: '6.75 V12 571', from: 2017, to: null }] },
      { name: 'Cullinan', slug: 'rr-cullinan', engines: [{ code: '6.75 V12 571', from: 2018, to: null }, { code: '6.75 V12 600 Black Badge', from: 2019, to: null }] },
    ]
  },
  {
    name: 'McLaren', slug: 'mclaren',
    models: [
      { name: '720S', slug: 'mclaren-720s', engines: [{ code: '4.0 V8 720', from: 2017, to: null }] },
      { name: 'Artura', slug: 'mclaren-artura', engines: [{ code: '3.0 V6 PHEV 680', from: 2021, to: null }] },
      { name: 'GT', slug: 'mclaren-gt', engines: [{ code: '4.0 V8 620', from: 2019, to: null }] },
    ]
  },
  {
    name: 'Bugatti', slug: 'bugatti',
    models: [
      { name: 'Chiron', slug: 'bugatti-chiron', engines: [{ code: '8.0 W16 1500', from: 2016, to: null }] },
      { name: 'Veyron', slug: 'bugatti-veyron', engines: [{ code: '8.0 W16 1001', from: 2005, to: 2015 }, { code: '8.0 W16 1200 Super Sport', from: 2010, to: 2015 }] },
    ]
  },
  {
    name: 'Cadillac', slug: 'cadillac',
    models: [
      { name: 'Escalade', slug: 'cadillac-escalade', engines: [{ code: '6.2 V8 420', from: 2021, to: null }, { code: '3.0 Duramax 277', from: 2021, to: null }, { code: '6.2 V8 Supercharged 682 V', from: 2023, to: null }] },
      { name: 'CT5', slug: 'cadillac-ct5', engines: [{ code: '2.0T 237', from: 2020, to: null }, { code: '3.0T V6 335', from: 2020, to: null }, { code: '6.2 V8 Supercharged 668 V Blackwing', from: 2022, to: null }] },
      { name: 'XT5', slug: 'cadillac-xt5', engines: [{ code: '2.0T 237', from: 2017, to: null }, { code: '3.6 V6 310', from: 2017, to: null }] },
    ]
  },
  {
    name: 'Lincoln', slug: 'lincoln',
    models: [
      { name: 'Navigator', slug: 'lincoln-navigator', engines: [{ code: '3.5 V6 Twin-Turbo 440', from: 2018, to: null }] },
      { name: 'Aviator', slug: 'lincoln-aviator', engines: [{ code: '3.0 V6 Twin-Turbo 400', from: 2020, to: null }, { code: '3.0 V6 PHEV 494 Grand Touring', from: 2020, to: null }] },
      { name: 'Corsair', slug: 'lincoln-corsair', engines: [{ code: '2.0T 250', from: 2020, to: null }, { code: '2.5 PHEV 266 Grand Touring', from: 2021, to: null }] },
    ]
  },
  {
    name: 'Chrysler', slug: 'chrysler',
    models: [
      { name: '300', slug: 'chrysler-300', engines: [{ code: '3.6 V6 292', from: 2011, to: 2023 }, { code: '5.7 V8 363', from: 2011, to: 2023 }] },
      { name: 'Pacifica', slug: 'chrysler-pacifica', engines: [{ code: '3.6 V6 287', from: 2017, to: null }, { code: '3.6 V6 PHEV 260 Hybrid', from: 2017, to: null }] },
    ]
  },
  {
    name: 'Dodge', slug: 'dodge',
    models: [
      { name: 'Charger', slug: 'dodge-charger', engines: [{ code: '3.6 V6 300', from: 2011, to: null }, { code: '5.7 V8 370 R/T', from: 2011, to: null }, { code: '6.4 V8 485 Scat Pack', from: 2015, to: null }, { code: '6.2 V8 Supercharged 717 Hellcat', from: 2015, to: null }] },
      { name: 'Challenger', slug: 'dodge-challenger', engines: [{ code: '3.6 V6 303', from: 2011, to: null }, { code: '5.7 V8 375 R/T', from: 2009, to: null }, { code: '6.4 V8 485 Scat Pack', from: 2015, to: null }, { code: '6.2 V8 Supercharged 717 Hellcat', from: 2015, to: null }] },
      { name: 'Durango', slug: 'dodge-durango', engines: [{ code: '3.6 V6 295', from: 2011, to: null }, { code: '5.7 V8 360 R/T', from: 2011, to: null }, { code: '6.4 V8 475 SRT', from: 2018, to: null }, { code: '6.2 V8 Supercharged 710 Hellcat', from: 2021, to: 2021 }] },
    ]
  },
  {
    name: 'Ram', slug: 'ram',
    models: [
      { name: '1500', slug: 'ram-1500', engines: [{ code: '3.6 V6 eTorque 305', from: 2019, to: null }, { code: '5.7 V8 395', from: 2019, to: null }, { code: '3.0 EcoDiesel 260', from: 2020, to: null }, { code: '6.2 V8 Supercharged 702 TRX', from: 2021, to: null }] },
      { name: '2500', slug: 'ram-2500', engines: [{ code: '6.4 V8 410', from: 2019, to: null }, { code: '6.7 Cummins Diesel 370', from: 2019, to: null }] },
    ]
  },
  {
    name: 'GMC', slug: 'gmc',
    models: [
      { name: 'Sierra 1500', slug: 'gmc-sierra-1500', engines: [{ code: '2.7T 310', from: 2019, to: null }, { code: '5.3 V8 355', from: 2019, to: null }, { code: '6.2 V8 420', from: 2019, to: null }, { code: '3.0 Duramax 277', from: 2020, to: null }] },
      { name: 'Yukon', slug: 'gmc-yukon', engines: [{ code: '5.3 V8 355', from: 2021, to: null }, { code: '6.2 V8 420', from: 2021, to: null }, { code: '3.0 Duramax 277', from: 2021, to: null }] },
      { name: 'Acadia', slug: 'gmc-acadia', engines: [{ code: '2.0T 228', from: 2020, to: null }, { code: '3.6 V6 310', from: 2017, to: null }] },
    ]
  },
  {
    name: 'Infiniti', slug: 'infiniti',
    models: [
      { name: 'Q50', slug: 'infiniti-q50', engines: [{ code: '3.0t V6 300', from: 2016, to: null }, { code: '3.0t V6 400 Red Sport', from: 2016, to: null }] },
      { name: 'QX60', slug: 'infiniti-qx60', engines: [{ code: '3.5 V6 295', from: 2022, to: null }] },
      { name: 'QX80', slug: 'infiniti-qx80', engines: [{ code: '5.6 V8 400', from: 2011, to: null }] },
    ]
  },
  {
    name: 'Smart', slug: 'smart',
    models: [
      { name: 'Fortwo', slug: 'smart-fortwo', engines: [{ code: '1.0 71', from: 2014, to: 2019 }, { code: '0.9 Turbo 90', from: 2014, to: 2019 }, { code: 'EQ Electric 82', from: 2017, to: null }] },
      { name: 'Forfour', slug: 'smart-forfour', engines: [{ code: '1.0 71', from: 2014, to: 2019 }, { code: '0.9 Turbo 90', from: 2014, to: 2019 }, { code: 'EQ Electric 82', from: 2017, to: 2021 }] },
    ]
  },
  {
    name: 'Vauxhall', slug: 'vauxhall',
    models: [
      { name: 'Corsa', slug: 'vauxhall-corsa', engines: [{ code: '1.2 75', from: 2019, to: null }, { code: '1.2 Turbo 100', from: 2019, to: null }, { code: 'Corsa-e Electric 136', from: 2019, to: null }] },
      { name: 'Astra', slug: 'vauxhall-astra', engines: [{ code: '1.2 Turbo 110', from: 2021, to: null }, { code: '1.2 Turbo 130', from: 2021, to: null }, { code: 'PHEV 180', from: 2021, to: null }] },
      { name: 'Mokka', slug: 'vauxhall-mokka', engines: [{ code: '1.2 Turbo 100', from: 2020, to: null }, { code: '1.2 Turbo 130', from: 2020, to: null }, { code: 'Mokka-e Electric 136', from: 2020, to: null }] },
    ]
  },
  {
    name: 'Abarth', slug: 'abarth',
    models: [
      { name: '595', slug: 'abarth-595', engines: [{ code: '1.4 T-Jet 145', from: 2016, to: null }, { code: '1.4 T-Jet 165 Turismo', from: 2016, to: null }, { code: '1.4 T-Jet 180 Competizione', from: 2016, to: null }] },
      { name: '695', slug: 'abarth-695', engines: [{ code: '1.4 T-Jet 180', from: 2022, to: null }] },
    ]
  },
  {
    name: 'Lancia', slug: 'lancia',
    models: [
      { name: 'Ypsilon', slug: 'lancia-ypsilon', engines: [{ code: '1.2 69', from: 2011, to: 2020 }, { code: '1.0 Hybrid 70', from: 2020, to: null }] },
    ]
  },
  {
    name: 'MG', slug: 'mg',
    models: [
      { name: 'ZS', slug: 'mg-zs', engines: [{ code: '1.5 VTi 106', from: 2017, to: null }, { code: '1.0 T-GDI 111', from: 2017, to: null }, { code: 'EV 143', from: 2019, to: null }, { code: 'EV Long Range 156', from: 2021, to: null }] },
      { name: 'HS', slug: 'mg-hs', engines: [{ code: '1.5 T-GDI 162', from: 2018, to: null }, { code: '1.5 T-GDI PHEV 258', from: 2020, to: null }] },
      { name: 'MG4', slug: 'mg-mg4', engines: [{ code: 'EV Standard Range 170', from: 2022, to: null }, { code: 'EV Long Range 204', from: 2022, to: null }, { code: 'XPower 435', from: 2023, to: null }] },
    ]
  },
]

async function main() {
  console.log('=== MEGA SEED 2: Adding 22 more makes ===')

  let makeCount = 0
  let modelCount = 0

  for (const mkData of MAKES_MODELS) {
    const make = await p.vehicleMake.upsert({
      where: { slug: mkData.slug },
      update: { name: mkData.name },
      create: { name: mkData.name, slug: mkData.slug },
    })
    makeCount++
    process.stdout.write(`  Make: ${make.name}\n`)

    for (const mdData of mkData.models) {
      await p.vehicleModel.upsert({
        where: { slug: mdData.slug },
        update: { name: mdData.name },
        create: { makeId: make.id, name: mdData.name, slug: mdData.slug },
      })
      modelCount++
    }
  }

  console.log(`\nDone: Added ${makeCount} makes, ${modelCount} models`)
  console.log('=== MEGA SEED 2 COMPLETE ===')
  await p.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await p.$disconnect()
  process.exit(1)
})
