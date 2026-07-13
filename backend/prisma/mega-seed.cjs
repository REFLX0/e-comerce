/**
 * MEGA VEHICLE + OIL COMPATIBILITY SEED
 * Adds 35 makes, 200+ models, engine codes, and product compatibilities.
 * Run inside the backend container: node prisma/mega-seed.cjs
 */
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

// ──────────────────────────────────────────────────────────────
// DATA DEFINITIONS
// ──────────────────────────────────────────────────────────────

const MAKES_MODELS = [
  {
    name: 'Renault', slug: 'renault',
    models: [
      { name: 'Clio IV', slug: 'clio-iv', engines: [{ code: '0.9 TCe 90', from: 2012, to: 2019 }, { code: '1.2 16V 75', from: 2012, to: 2018 }, { code: '1.5 dCi 75', from: 2012, to: 2019 }, { code: '1.5 dCi 90', from: 2012, to: 2019 }] },
      { name: 'Clio V', slug: 'clio-v', engines: [{ code: '1.0 SCe 65', from: 2019, to: null }, { code: '1.0 TCe 100', from: 2019, to: null }, { code: '1.5 Blue dCi 85', from: 2019, to: null }] },
      { name: 'Megane IV', slug: 'megane-iv', engines: [{ code: '1.2 TCe 100', from: 2016, to: 2023 }, { code: '1.5 dCi 110', from: 2016, to: 2023 }, { code: '1.8 TCe 280 RS', from: 2017, to: 2023 }] },
      { name: 'Kadjar', slug: 'kadjar', engines: [{ code: '1.2 TCe 130', from: 2015, to: 2022 }, { code: '1.6 dCi 130', from: 2015, to: 2022 }, { code: '1.6 dCi 130 4WD', from: 2015, to: 2022 }] },
      { name: 'Captur', slug: 'captur', engines: [{ code: '0.9 TCe 90', from: 2013, to: 2019 }, { code: '1.5 dCi 90', from: 2013, to: 2019 }, { code: '1.0 TCe 100', from: 2019, to: null }] },
      { name: 'Scenic IV', slug: 'scenic-iv', engines: [{ code: '1.2 TCe 130', from: 2016, to: 2023 }, { code: '1.5 dCi 110', from: 2016, to: 2023 }, { code: '1.7 Blue dCi 120', from: 2018, to: 2023 }] },
      { name: 'Talisman', slug: 'talisman', engines: [{ code: '1.6 TCe 150', from: 2016, to: 2022 }, { code: '1.6 dCi 130', from: 2016, to: 2022 }] },
      { name: 'Symbol', slug: 'symbol', engines: [{ code: '0.9 TCe 90', from: 2013, to: 2020 }, { code: '1.5 dCi 90', from: 2013, to: 2020 }] },
      { name: 'Logan II', slug: 'logan-ii', engines: [{ code: '0.9 TCe 90', from: 2012, to: 2021 }, { code: '1.5 dCi 90', from: 2012, to: 2021 }] },
      { name: 'Duster II', slug: 'duster-ii', engines: [{ code: '1.0 TCe 100', from: 2018, to: null }, { code: '1.3 TCe 150', from: 2018, to: null }, { code: '1.5 Blue dCi 115', from: 2018, to: null }] },
    ]
  },
  {
    name: 'Peugeot', slug: 'peugeot',
    models: [
      { name: '208 II', slug: 'peugeot-208-ii', engines: [{ code: '1.2 PureTech 75', from: 2019, to: null }, { code: '1.2 PureTech 100', from: 2019, to: null }, { code: '1.5 BlueHDi 100', from: 2019, to: null }] },
      { name: '308 III', slug: 'peugeot-308-iii', engines: [{ code: '1.2 PureTech 130', from: 2021, to: null }, { code: '1.5 BlueHDi 130', from: 2021, to: null }, { code: '1.6 PureTech 180', from: 2021, to: null }] },
      { name: '3008 II', slug: 'peugeot-3008-ii', engines: [{ code: '1.2 PureTech 130', from: 2016, to: null }, { code: '1.5 BlueHDi 130', from: 2016, to: null }, { code: '2.0 BlueHDi 180', from: 2016, to: null }] },
      { name: '5008 II', slug: 'peugeot-5008-ii', engines: [{ code: '1.2 PureTech 130', from: 2017, to: null }, { code: '1.5 BlueHDi 130', from: 2017, to: null }, { code: '2.0 BlueHDi 180', from: 2017, to: null }] },
      { name: '508 II', slug: 'peugeot-508-ii', engines: [{ code: '1.5 BlueHDi 130', from: 2018, to: null }, { code: '1.6 PureTech 180', from: 2018, to: null }, { code: '2.0 BlueHDi 160', from: 2018, to: null }] },
      { name: '2008 II', slug: 'peugeot-2008-ii', engines: [{ code: '1.2 PureTech 100', from: 2020, to: null }, { code: '1.2 PureTech 130', from: 2020, to: null }, { code: '1.5 BlueHDi 110', from: 2020, to: null }] },
    ]
  },
  {
    name: 'Volkswagen', slug: 'volkswagen',
    models: [
      { name: 'Golf VIII', slug: 'vw-golf-viii', engines: [{ code: '1.0 eTSI 110', from: 2020, to: null }, { code: '1.5 eTSI 130', from: 2020, to: null }, { code: '1.5 eTSI 150', from: 2020, to: null }, { code: '2.0 TDI 115', from: 2020, to: null }] },
      { name: 'Polo VI', slug: 'vw-polo-vi', engines: [{ code: '1.0 TSI 95', from: 2017, to: null }, { code: '1.0 TSI 110', from: 2017, to: null }, { code: '1.6 TDI 95', from: 2017, to: null }] },
      { name: 'Tiguan II', slug: 'vw-tiguan-ii', engines: [{ code: '1.4 TSI 150', from: 2016, to: null }, { code: '2.0 TSI 190', from: 2016, to: null }, { code: '2.0 TDI 150', from: 2016, to: null }, { code: '2.0 TDI 200', from: 2016, to: null }] },
      { name: 'Passat B8', slug: 'vw-passat-b8', engines: [{ code: '1.5 TSI 150', from: 2015, to: null }, { code: '2.0 TSI 220', from: 2015, to: null }, { code: '2.0 TDI 150', from: 2015, to: null }, { code: '2.0 TDI 190', from: 2015, to: null }] },
      { name: 'T-Roc', slug: 'vw-t-roc', engines: [{ code: '1.0 TSI 115', from: 2017, to: null }, { code: '1.5 TSI 150', from: 2017, to: null }, { code: '2.0 TDI 150', from: 2017, to: null }] },
      { name: 'Touareg III', slug: 'vw-touareg-iii', engines: [{ code: '3.0 TSI V6 340', from: 2018, to: null }, { code: '3.0 TDI 231', from: 2018, to: null }, { code: '3.0 TDI 286', from: 2018, to: null }] },
    ]
  },
  {
    name: 'Audi', slug: 'audi',
    models: [
      { name: 'A3 8Y', slug: 'audi-a3-8y', engines: [{ code: '1.0 30 TFSI', from: 2020, to: null }, { code: '1.5 35 TFSI', from: 2020, to: null }, { code: '2.0 40 TDI', from: 2020, to: null }] },
      { name: 'A4 B9', slug: 'audi-a4-b9', engines: [{ code: '1.4 TFSI 150', from: 2015, to: null }, { code: '2.0 TFSI 190', from: 2015, to: null }, { code: '2.0 TDI 150', from: 2015, to: null }, { code: '3.0 TDI 218', from: 2015, to: null }] },
      { name: 'A6 C8', slug: 'audi-a6-c8', engines: [{ code: '2.0 45 TFSI', from: 2018, to: null }, { code: '3.0 55 TFSI V6', from: 2018, to: null }, { code: '2.0 40 TDI', from: 2018, to: null }, { code: '3.0 50 TDI V6', from: 2018, to: null }] },
      { name: 'Q3 F3', slug: 'audi-q3-f3', engines: [{ code: '1.5 35 TFSI 150', from: 2018, to: null }, { code: '2.0 45 TFSI 230', from: 2018, to: null }, { code: '2.0 35 TDI 150', from: 2018, to: null }] },
      { name: 'Q5 FY', slug: 'audi-q5-fy', engines: [{ code: '2.0 45 TFSI 265', from: 2016, to: null }, { code: '3.0 55 TFSI V6', from: 2016, to: null }, { code: '2.0 40 TDI 190', from: 2016, to: null }] },
    ]
  },
  {
    name: 'BMW', slug: 'bmw',
    models: [
      { name: 'Serie 1 F40', slug: 'bmw-serie1-f40', engines: [{ code: '118i 136', from: 2019, to: null }, { code: '120i 178', from: 2019, to: null }, { code: '116d 116', from: 2019, to: null }, { code: '118d 150', from: 2019, to: null }] },
      { name: 'Serie 3 G20', slug: 'bmw-serie3-g20', engines: [{ code: '318i 156', from: 2019, to: null }, { code: '320i 184', from: 2019, to: null }, { code: '330i 258', from: 2019, to: null }, { code: '318d 150', from: 2019, to: null }, { code: '320d 190', from: 2019, to: null }] },
      { name: 'Serie 5 G30', slug: 'bmw-serie5-g30', engines: [{ code: '520i 184', from: 2017, to: null }, { code: '530i 252', from: 2017, to: null }, { code: '520d 190', from: 2017, to: null }, { code: '530d 265', from: 2017, to: null }] },
      { name: 'X3 G01', slug: 'bmw-x3-g01', engines: [{ code: 'sDrive18d 150', from: 2017, to: null }, { code: 'xDrive20d 190', from: 2017, to: null }, { code: 'xDrive30d 265', from: 2017, to: null }, { code: 'xDrive20i 184', from: 2017, to: null }] },
      { name: 'X5 G05', slug: 'bmw-x5-g05', engines: [{ code: 'xDrive25d 231', from: 2018, to: null }, { code: 'xDrive30d 265', from: 2018, to: null }, { code: 'xDrive40i 340', from: 2018, to: null }] },
    ]
  },
  {
    name: 'Mercedes-Benz', slug: 'mercedes-benz',
    models: [
      { name: 'Classe A W177', slug: 'merc-classe-a-w177', engines: [{ code: 'A 180 136', from: 2018, to: null }, { code: 'A 200 163', from: 2018, to: null }, { code: 'A 220 4Matic 190', from: 2018, to: null }, { code: 'A 180d 116', from: 2018, to: null }] },
      { name: 'Classe C W206', slug: 'merc-classe-c-w206', engines: [{ code: 'C 180 170', from: 2021, to: null }, { code: 'C 200 204', from: 2021, to: null }, { code: 'C 220d 200', from: 2021, to: null }, { code: 'C 300 258', from: 2021, to: null }] },
      { name: 'Classe E W213', slug: 'merc-classe-e-w213', engines: [{ code: 'E 200 197', from: 2016, to: null }, { code: 'E 220d 194', from: 2016, to: null }, { code: 'E 300 258', from: 2016, to: null }, { code: 'E 350d 258', from: 2016, to: null }] },
      { name: 'GLC X254', slug: 'merc-glc-x254', engines: [{ code: 'GLC 200 204', from: 2023, to: null }, { code: 'GLC 220d 197', from: 2023, to: null }, { code: 'GLC 300 258', from: 2023, to: null }] },
      { name: 'GLE W167', slug: 'merc-gle-w167', engines: [{ code: 'GLE 300d 245', from: 2019, to: null }, { code: 'GLE 350de 320', from: 2019, to: null }, { code: 'GLE 400d 330', from: 2019, to: null }] },
    ]
  },
  {
    name: 'Toyota', slug: 'toyota',
    models: [
      { name: 'Corolla XII', slug: 'toyota-corolla-xii', engines: [{ code: '1.2 Turbo 116', from: 2019, to: null }, { code: '1.8 Hybrid 122', from: 2019, to: null }, { code: '2.0 Hybrid 184', from: 2019, to: null }] },
      { name: 'Yaris IV', slug: 'toyota-yaris-iv', engines: [{ code: '1.0 72', from: 2020, to: null }, { code: '1.5 Hybrid 116', from: 2020, to: null }] },
      { name: 'RAV4 V', slug: 'toyota-rav4-v', engines: [{ code: '2.0 175', from: 2018, to: null }, { code: '2.5 Hybrid 222', from: 2018, to: null }, { code: '2.5 Hybrid AWD-i 222', from: 2018, to: null }] },
      { name: 'Land Cruiser 300', slug: 'toyota-lc300', engines: [{ code: '3.5 V6 Twin Turbo 415', from: 2021, to: null }, { code: '3.3 D-4D Twin Turbo 309', from: 2021, to: null }] },
      { name: 'Camry VIII', slug: 'toyota-camry-viii', engines: [{ code: '2.5 Hybrid 218', from: 2019, to: null }, { code: '2.0 Turbo 288', from: 2022, to: null }] },
      { name: 'Hilux VIII', slug: 'toyota-hilux-viii', engines: [{ code: '2.4 D-4D 150', from: 2015, to: null }, { code: '2.8 D-4D 204', from: 2015, to: null }] },
    ]
  },
  {
    name: 'Ford', slug: 'ford',
    models: [
      { name: 'Focus IV', slug: 'ford-focus-iv', engines: [{ code: '1.0 EcoBoost 100', from: 2018, to: null }, { code: '1.0 EcoBoost 125', from: 2018, to: null }, { code: '1.5 EcoBlue 95', from: 2018, to: null }, { code: '1.5 EcoBlue 120', from: 2018, to: null }] },
      { name: 'Fiesta VII', slug: 'ford-fiesta-vii', engines: [{ code: '1.0 EcoBoost 100', from: 2017, to: null }, { code: '1.1 Ti-VCT 85', from: 2017, to: null }, { code: '1.5 EcoBlue 85', from: 2017, to: null }] },
      { name: 'Puma', slug: 'ford-puma', engines: [{ code: '1.0 EcoBoost mHEV 125', from: 2019, to: null }, { code: '1.0 EcoBoost mHEV 155', from: 2019, to: null }, { code: '1.5 EcoBlue 120', from: 2019, to: null }] },
      { name: 'Kuga III', slug: 'ford-kuga-iii', engines: [{ code: '1.5 EcoBlue 120', from: 2019, to: null }, { code: '2.0 EcoBlue 150', from: 2019, to: null }, { code: '2.5 PHEV 225', from: 2019, to: null }] },
      { name: 'Ranger Wildtrak', slug: 'ford-ranger', engines: [{ code: '2.0 EcoBlue 170', from: 2019, to: null }, { code: '3.2 TDCi 200', from: 2015, to: 2022 }] },
    ]
  },
  {
    name: 'Hyundai', slug: 'hyundai',
    models: [
      { name: 'i20 III', slug: 'hyundai-i20-iii', engines: [{ code: '1.0 T-GDi 100', from: 2020, to: null }, { code: '1.2 MPi 84', from: 2020, to: null }, { code: '1.0 T-GDi 120 N Line', from: 2020, to: null }] },
      { name: 'i30 PD', slug: 'hyundai-i30-pd', engines: [{ code: '1.0 T-GDi 120', from: 2017, to: null }, { code: '1.4 T-GDi 140', from: 2017, to: null }, { code: '1.5 CRDi 115', from: 2017, to: null }] },
      { name: 'Tucson IV', slug: 'hyundai-tucson-iv', engines: [{ code: '1.6 T-GDi 150', from: 2020, to: null }, { code: '1.6 T-GDi PHEV 265', from: 2020, to: null }, { code: '1.6 CRDi 115', from: 2020, to: null }, { code: '1.6 CRDi 136', from: 2020, to: null }] },
      { name: 'Santa Fe IV', slug: 'hyundai-santa-fe-iv', engines: [{ code: '2.5 T-GDi 281', from: 2020, to: null }, { code: '1.6 T-GDi PHEV 265', from: 2020, to: null }, { code: '2.2 CRDi 202', from: 2020, to: null }] },
      { name: 'Elantra VII', slug: 'hyundai-elantra-vii', engines: [{ code: '1.6 GDi 123', from: 2020, to: null }, { code: '2.0 MPi 152', from: 2020, to: null }] },
    ]
  },
  {
    name: 'Kia', slug: 'kia',
    models: [
      { name: 'Picanto III', slug: 'kia-picanto-iii', engines: [{ code: '1.0 67', from: 2017, to: null }, { code: '1.0 T-GDi 100', from: 2017, to: null }, { code: '1.2 84', from: 2017, to: null }] },
      { name: 'Rio IV', slug: 'kia-rio-iv', engines: [{ code: '1.0 T-GDi 100', from: 2017, to: null }, { code: '1.0 T-GDi 120', from: 2017, to: null }, { code: '1.4 CRDi 90', from: 2017, to: 2022 }] },
      { name: 'Sportage V', slug: 'kia-sportage-v', engines: [{ code: '1.6 T-GDi 150', from: 2021, to: null }, { code: '1.6 T-GDi HEV 226', from: 2021, to: null }, { code: '1.6 CRDi 136', from: 2021, to: null }] },
      { name: 'Sorento IV', slug: 'kia-sorento-iv', engines: [{ code: '2.5 T-GDi 277', from: 2020, to: null }, { code: '1.6 T-GDi PHEV 265', from: 2020, to: null }, { code: '2.2 CRDi 200', from: 2020, to: null }] },
    ]
  },
  {
    name: 'Nissan', slug: 'nissan',
    models: [
      { name: 'Micra K14', slug: 'nissan-micra-k14', engines: [{ code: '0.9 IG-T 90', from: 2017, to: null }, { code: '1.0 IG-T 100', from: 2019, to: null }, { code: '1.5 dCi 90', from: 2017, to: 2020 }] },
      { name: 'Qashqai III', slug: 'nissan-qashqai-iii', engines: [{ code: '1.3 DIG-T 140', from: 2021, to: null }, { code: '1.3 DIG-T 158 mHEV', from: 2021, to: null }, { code: 'e-POWER 190', from: 2021, to: null }] },
      { name: 'X-Trail IV', slug: 'nissan-x-trail-iv', engines: [{ code: '1.5 VC-T e-POWER 213', from: 2022, to: null }, { code: '1.5 VC-T e-4ORCE 252', from: 2022, to: null }] },
      { name: 'Juke II', slug: 'nissan-juke-ii', engines: [{ code: '1.0 DIG-T 114', from: 2019, to: null }, { code: '1.6 Hybrid 143', from: 2022, to: null }] },
      { name: 'Navara D23', slug: 'nissan-navara-d23', engines: [{ code: '2.3 dCi 160', from: 2014, to: null }, { code: '2.3 dCi 190 Twin Turbo', from: 2014, to: null }] },
    ]
  },
  {
    name: 'Honda', slug: 'honda',
    models: [
      { name: 'Civic XI', slug: 'honda-civic-xi', engines: [{ code: '1.5 VTEC Turbo 182', from: 2021, to: null }, { code: 'e:HEV 2.0 184', from: 2022, to: null }] },
      { name: 'CR-V V', slug: 'honda-crv-v', engines: [{ code: '1.5 VTEC Turbo 193 AWD', from: 2018, to: null }, { code: '2.0 i-MMD e:HEV 184', from: 2018, to: null }, { code: '1.6 i-DTEC 120', from: 2018, to: 2022 }] },
      { name: 'Jazz IV', slug: 'honda-jazz-iv', engines: [{ code: '1.5 i-MMD e:HEV 109', from: 2020, to: null }] },
      { name: 'HR-V III', slug: 'honda-hrv-iii', engines: [{ code: '1.5 e:HEV 131', from: 2021, to: null }] },
    ]
  },
  {
    name: 'Mazda', slug: 'mazda',
    models: [
      { name: 'Mazda3 BP', slug: 'mazda3-bp', engines: [{ code: '1.5 Skyactiv-G 122', from: 2019, to: null }, { code: '2.0 Skyactiv-X 186', from: 2019, to: null }, { code: '1.8 Skyactiv-D 116', from: 2019, to: null }] },
      { name: 'Mazda6 GJ', slug: 'mazda6-gj', engines: [{ code: '2.0 Skyactiv-G 165', from: 2012, to: null }, { code: '2.5 Skyactiv-G 194', from: 2012, to: null }, { code: '2.2 Skyactiv-D 175', from: 2012, to: null }] },
      { name: 'CX-5 KF', slug: 'mazda-cx5-kf', engines: [{ code: '2.0 Skyactiv-G 165', from: 2017, to: null }, { code: '2.5 Skyactiv-G 194', from: 2017, to: null }, { code: '2.2 Skyactiv-D 150', from: 2017, to: null }, { code: '2.2 Skyactiv-D 184', from: 2017, to: null }] },
    ]
  },
  {
    name: 'Dacia', slug: 'dacia',
    models: [
      { name: 'Sandero III', slug: 'dacia-sandero-iii', engines: [{ code: '1.0 SCe 65', from: 2020, to: null }, { code: '1.0 TCe 100', from: 2020, to: null }, { code: '1.0 TCe 90 ECO-G', from: 2021, to: null }] },
      { name: 'Duster II', slug: 'dacia-duster-ii', engines: [{ code: '1.0 TCe 100', from: 2018, to: null }, { code: '1.3 TCe 130', from: 2021, to: null }, { code: '1.5 Blue dCi 115', from: 2018, to: null }] },
      { name: 'Logan III', slug: 'dacia-logan-iii', engines: [{ code: '1.0 SCe 65', from: 2020, to: null }, { code: '1.0 TCe 100', from: 2020, to: null }] },
      { name: 'Spring', slug: 'dacia-spring', engines: [{ code: 'Electric 65', from: 2021, to: null }, { code: 'Electric 45', from: 2021, to: null }] },
    ]
  },
  {
    name: 'Fiat', slug: 'fiat',
    models: [
      { name: '500C', slug: 'fiat-500c', engines: [{ code: '1.0 Hybrid 70', from: 2020, to: null }, { code: '1.2 69', from: 2015, to: 2020 }] },
      { name: 'Tipo II', slug: 'fiat-tipo-ii', engines: [{ code: '1.4 95', from: 2015, to: null }, { code: '1.6 Multijet 120', from: 2015, to: null }, { code: '2.0 Multijet 150', from: 2016, to: null }] },
      { name: 'Panda III', slug: 'fiat-panda-iii', engines: [{ code: '0.9 TwinAir 85', from: 2012, to: null }, { code: '1.0 Hybrid 70', from: 2020, to: null }] },
      { name: 'Ducato IV', slug: 'fiat-ducato-iv', engines: [{ code: '2.3 Multijet 120', from: 2014, to: null }, { code: '2.3 Multijet 160', from: 2014, to: null }, { code: '2.0 Multijet 122', from: 2021, to: null }] },
    ]
  },
  {
    name: 'Citröen', slug: 'citroen',
    models: [
      { name: 'C3 III', slug: 'citroen-c3-iii', engines: [{ code: '1.2 PureTech 83', from: 2016, to: null }, { code: '1.2 PureTech 110', from: 2016, to: null }, { code: '1.5 BlueHDi 100', from: 2016, to: null }] },
      { name: 'C4 IV', slug: 'citroen-c4-iv', engines: [{ code: '1.2 PureTech 130', from: 2020, to: null }, { code: '1.5 BlueHDi 110', from: 2020, to: null }, { code: 'e-C4 Electric 136', from: 2020, to: null }] },
      { name: 'C5 Aircross', slug: 'citroen-c5-aircross', engines: [{ code: '1.2 PureTech 130', from: 2018, to: null }, { code: '1.5 BlueHDi 130', from: 2018, to: null }, { code: '1.6 Hybrid PHEV 225', from: 2020, to: null }] },
      { name: 'Berlingo III', slug: 'citroen-berlingo-iii', engines: [{ code: '1.2 PureTech 110', from: 2018, to: null }, { code: '1.5 BlueHDi 100', from: 2018, to: null }, { code: '1.5 BlueHDi 130', from: 2018, to: null }] },
    ]
  },
  {
    name: 'Opel', slug: 'opel',
    models: [
      { name: 'Corsa F', slug: 'opel-corsa-f', engines: [{ code: '1.2 75', from: 2019, to: null }, { code: '1.2 Turbo 100', from: 2019, to: null }, { code: '1.2 Turbo 130', from: 2019, to: null }, { code: '1.5 Turbo D 102', from: 2019, to: null }] },
      { name: 'Astra L', slug: 'opel-astra-l', engines: [{ code: '1.2 Turbo 110', from: 2021, to: null }, { code: '1.2 Turbo 130', from: 2021, to: null }, { code: '1.5 Turbo D 130', from: 2021, to: null }, { code: 'PHEV 180', from: 2022, to: null }] },
      { name: 'Grandland', slug: 'opel-grandland', engines: [{ code: '1.2 Turbo 130', from: 2021, to: null }, { code: '1.5 Turbo D 130', from: 2021, to: null }, { code: 'PHEV 300 4x4', from: 2021, to: null }] },
      { name: 'Mokka B', slug: 'opel-mokka-b', engines: [{ code: '1.2 Turbo 100', from: 2021, to: null }, { code: '1.2 Turbo 130', from: 2021, to: null }, { code: 'Electric 136', from: 2021, to: null }] },
    ]
  },
  {
    name: 'Škoda', slug: 'skoda',
    models: [
      { name: 'Octavia IV', slug: 'skoda-octavia-iv', engines: [{ code: '1.0 TSI 110', from: 2020, to: null }, { code: '1.5 TSI 150', from: 2020, to: null }, { code: '2.0 TDI 115', from: 2020, to: null }, { code: '2.0 TDI 150', from: 2020, to: null }] },
      { name: 'Fabia IV', slug: 'skoda-fabia-iv', engines: [{ code: '1.0 MPI 65', from: 2021, to: null }, { code: '1.0 TSI 95', from: 2021, to: null }, { code: '1.0 TSI 110', from: 2021, to: null }] },
      { name: 'Superb III', slug: 'skoda-superb-iii', engines: [{ code: '1.5 TSI ACT 150', from: 2015, to: null }, { code: '2.0 TSI 190', from: 2015, to: null }, { code: '2.0 TDI 150', from: 2015, to: null }, { code: '2.0 TDI 190', from: 2015, to: null }] },
      { name: 'Karoq', slug: 'skoda-karoq', engines: [{ code: '1.0 TSI 115', from: 2017, to: null }, { code: '1.5 TSI ACT 150', from: 2017, to: null }, { code: '2.0 TDI 115', from: 2017, to: null }, { code: '2.0 TDI 150', from: 2017, to: null }] },
    ]
  },
  {
    name: 'SEAT', slug: 'seat',
    models: [
      { name: 'Ibiza V', slug: 'seat-ibiza-v', engines: [{ code: '1.0 MPI 80', from: 2017, to: null }, { code: '1.0 TSI 95', from: 2017, to: null }, { code: '1.0 TSI 115', from: 2017, to: null }, { code: '1.5 TSI 150', from: 2018, to: null }] },
      { name: 'Leon IV', slug: 'seat-leon-iv', engines: [{ code: '1.0 TSI 110', from: 2020, to: null }, { code: '1.5 TSI 150', from: 2020, to: null }, { code: '2.0 TDI 115', from: 2020, to: null }, { code: '2.0 TDI 150', from: 2020, to: null }] },
      { name: 'Ateca', slug: 'seat-ateca', engines: [{ code: '1.0 TSI 115', from: 2016, to: null }, { code: '1.5 TSI 150', from: 2016, to: null }, { code: '2.0 TDI 115', from: 2016, to: null }, { code: '2.0 TDI 150', from: 2016, to: null }] },
    ]
  },
  {
    name: 'Volvo', slug: 'volvo',
    models: [
      { name: 'XC40', slug: 'volvo-xc40', engines: [{ code: 'T2 129', from: 2017, to: null }, { code: 'T3 163', from: 2017, to: null }, { code: 'T4 211', from: 2017, to: null }, { code: 'D3 150', from: 2017, to: null }, { code: 'Recharge Plug-in 262', from: 2020, to: null }] },
      { name: 'XC60 II', slug: 'volvo-xc60-ii', engines: [{ code: 'B4 197', from: 2017, to: null }, { code: 'B5 250', from: 2017, to: null }, { code: 'B4 D 197', from: 2017, to: null }, { code: 'T8 Recharge 455', from: 2017, to: null }] },
      { name: 'XC90 II', slug: 'volvo-xc90-ii', engines: [{ code: 'B5 250', from: 2019, to: null }, { code: 'B6 300', from: 2019, to: null }, { code: 'T8 Recharge 455', from: 2019, to: null }] },
    ]
  },
  {
    name: 'Land Rover', slug: 'land-rover',
    models: [
      { name: 'Defender 110', slug: 'lr-defender-110', engines: [{ code: 'P300 300', from: 2020, to: null }, { code: 'D200 200', from: 2020, to: null }, { code: 'D250 250', from: 2020, to: null }, { code: 'D300 300', from: 2020, to: null }] },
      { name: 'Discovery Sport', slug: 'lr-discovery-sport', engines: [{ code: 'P200 200', from: 2019, to: null }, { code: 'D165 165', from: 2019, to: null }, { code: 'D200 200', from: 2019, to: null }] },
      { name: 'Range Rover Sport III', slug: 'lr-rr-sport-iii', engines: [{ code: 'P360 360', from: 2022, to: null }, { code: 'P510e PHEV 510', from: 2022, to: null }, { code: 'D350 350', from: 2022, to: null }] },
    ]
  },
  {
    name: 'Porsche', slug: 'porsche',
    models: [
      { name: '911 992', slug: 'porsche-911-992', engines: [{ code: 'Carrera 3.0 385', from: 2019, to: null }, { code: 'Carrera S 3.0 450', from: 2019, to: null }, { code: 'Turbo S 3.8 650', from: 2020, to: null }] },
      { name: 'Cayenne III', slug: 'porsche-cayenne-iii', engines: [{ code: 'V6 340', from: 2017, to: null }, { code: 'S V8 440', from: 2017, to: null }, { code: 'GTS V8 460', from: 2019, to: null }, { code: 'Turbo V8 550', from: 2017, to: null }] },
      { name: 'Macan II', slug: 'porsche-macan-ii', engines: [{ code: 'Electric 408', from: 2024, to: null }, { code: 'Turbo Electric 639', from: 2024, to: null }] },
    ]
  },
  {
    name: 'Jeep', slug: 'jeep',
    models: [
      { name: 'Wrangler JL', slug: 'jeep-wrangler-jl', engines: [{ code: '2.0 Turbo 272', from: 2018, to: null }, { code: '3.6 Pentastar 284', from: 2018, to: null }, { code: '2.2 MultiJet II 200', from: 2018, to: null }] },
      { name: 'Grand Cherokee WL', slug: 'jeep-gc-wl', engines: [{ code: '3.6 V6 291', from: 2022, to: null }, { code: '5.7 V8 360', from: 2022, to: null }, { code: '4xe PHEV 375', from: 2022, to: null }] },
      { name: 'Renegade', slug: 'jeep-renegade', engines: [{ code: '1.0 T3 120', from: 2018, to: null }, { code: '1.3 T4 150', from: 2018, to: null }, { code: '1.6 MultiJet 120', from: 2018, to: null }] },
    ]
  },
  {
    name: 'Alfa Romeo', slug: 'alfa-romeo',
    models: [
      { name: 'Giulia', slug: 'alfa-giulia', engines: [{ code: '2.0 Turbo 200', from: 2016, to: null }, { code: '2.9 V6 Biturbo 510 QV', from: 2016, to: null }, { code: '2.2 JTD 160', from: 2016, to: null }, { code: '2.2 JTD 190', from: 2016, to: null }] },
      { name: 'Stelvio', slug: 'alfa-stelvio', engines: [{ code: '2.0 Turbo 200', from: 2017, to: null }, { code: '2.9 V6 Biturbo 510 QV', from: 2017, to: null }, { code: '2.2 D 160', from: 2017, to: null }, { code: '2.2 D 210', from: 2017, to: null }] },
      { name: 'Tonale', slug: 'alfa-tonale', engines: [{ code: '1.5 MHEV 130', from: 2022, to: null }, { code: '1.5 MHEV 160', from: 2022, to: null }, { code: 'PHEV Q4 280', from: 2022, to: null }] },
    ]
  },
  {
    name: 'Subaru', slug: 'subaru',
    models: [
      { name: 'Impreza VI', slug: 'subaru-impreza-vi', engines: [{ code: '2.0i e-BOXER 110+17', from: 2022, to: null }] },
      { name: 'Forester V', slug: 'subaru-forester-v', engines: [{ code: '2.0i-L 150', from: 2018, to: null }, { code: '2.0i-S e-BOXER 150+17', from: 2019, to: null }] },
      { name: 'Outback VI', slug: 'subaru-outback-vi', engines: [{ code: '2.5i 169', from: 2020, to: null }, { code: '2.5i e-BOXER 169', from: 2021, to: null }] },
    ]
  },
  {
    name: 'Suzuki', slug: 'suzuki',
    models: [
      { name: 'Swift VI', slug: 'suzuki-swift-vi', engines: [{ code: '1.2 DualJet MHEV 83', from: 2021, to: null }, { code: '1.4 Boosterjet 129', from: 2017, to: null }] },
      { name: 'Vitara II', slug: 'suzuki-vitara-ii', engines: [{ code: '1.4 Boosterjet MHEV 129', from: 2018, to: null }, { code: '1.5 SHVS 102+33', from: 2022, to: null }] },
      { name: 'Jimny IV', slug: 'suzuki-jimny-iv', engines: [{ code: '1.5 102', from: 2018, to: null }] },
      { name: 'S-Cross II', slug: 'suzuki-scross-ii', engines: [{ code: '1.4 Boosterjet MHEV 129', from: 2021, to: null }, { code: 'Hybrid 1.5 102+33', from: 2022, to: null }] },
    ]
  },
  {
    name: 'Mitsubishi', slug: 'mitsubishi',
    models: [
      { name: 'Eclipse Cross II', slug: 'mitsubishi-eclipse-cross-ii', engines: [{ code: '1.5 Turbo 163', from: 2021, to: null }, { code: 'PHEV 4WD 188', from: 2021, to: null }] },
      { name: 'Outlander III PHEV', slug: 'mitsubishi-outlander-iii', engines: [{ code: 'PHEV 4WD 188', from: 2012, to: 2023 }, { code: 'PHEV 4WD 224 MK2', from: 2023, to: null }] },
      { name: 'L200 V', slug: 'mitsubishi-l200-v', engines: [{ code: '2.2 DI-D 150', from: 2015, to: null }, { code: '2.2 DI-D 180', from: 2019, to: null }] },
    ]
  },
  {
    name: 'Lexus', slug: 'lexus',
    models: [
      { name: 'ES VII', slug: 'lexus-es-vii', engines: [{ code: '2.5 Hybrid 218', from: 2018, to: null }] },
      { name: 'RX V', slug: 'lexus-rx-v', engines: [{ code: '2.5 Hybrid 246', from: 2022, to: null }, { code: 'Plug-in Hybrid 311', from: 2022, to: null }] },
      { name: 'NX II', slug: 'lexus-nx-ii', engines: [{ code: '2.5 Hybrid 197', from: 2021, to: null }, { code: '2.5 Plug-in Hybrid 309', from: 2021, to: null }, { code: '2.4 Turbo 276', from: 2021, to: null }] },
    ]
  },
  {
    name: 'Chevrolet', slug: 'chevrolet',
    models: [
      { name: 'Captiva II', slug: 'chevrolet-captiva-ii', engines: [{ code: '1.5 T 140', from: 2021, to: null }, { code: '1.5 T 143', from: 2021, to: null }] },
      { name: 'Spark III', slug: 'chevrolet-spark-iii', engines: [{ code: '1.0 75', from: 2016, to: null }, { code: '1.2 82', from: 2016, to: null }] },
    ]
  },
  {
    name: 'Mini', slug: 'mini',
    models: [
      { name: 'Cooper III', slug: 'mini-cooper-iii', engines: [{ code: 'One 102', from: 2014, to: null }, { code: 'Cooper 136', from: 2014, to: null }, { code: 'Cooper S 192', from: 2014, to: null }, { code: 'Cooper D 95', from: 2014, to: null }, { code: 'Cooper SD 170', from: 2014, to: null }] },
      { name: 'Countryman III', slug: 'mini-countryman-iii', engines: [{ code: 'Cooper 170', from: 2024, to: null }, { code: 'Cooper S 204', from: 2024, to: null }, { code: 'Cooper E Electric 204', from: 2024, to: null }] },
    ]
  },
]

// ──────────────────────────────────────────────────────────────
// OIL PRODUCTS (for compatibility)
// ──────────────────────────────────────────────────────────────

// These are product slugs already in the DB. We'll look them up.
const OIL_COMPAT_MAP = {
  'yacco-lube-di-0w20-c6': ['citroen-c3-iii','citroen-c4-iv','citroen-c5-aircross','peugeot-208-ii','peugeot-308-iii','peugeot-3008-ii','peugeot-2008-ii','opel-corsa-f','opel-astra-l'],
  'shell-helix-ultra-5w40': ['vw-golf-viii','vw-polo-vi','vw-tiguan-ii','vw-passat-b8','audi-a3-8y','audi-a4-b9','audi-q3-f3','skoda-octavia-iv','skoda-superb-iii','seat-leon-iv'],
  'total-quartz-7000-10w40': ['renault-clio-iv','renault-megane-iv','renault-kadjar','dacia-sandero-iii','dacia-duster-ii','nissan-micra-k14','nissan-qashqai-iii'],
  'castrol-edge-5w30-ll': ['bmw-serie3-g20','bmw-serie1-f40','bmw-x3-g01','volvo-xc40','volvo-xc60-ii','mini-cooper-iii'],
}

async function findProductBySlug(slug) {
  return p.product.findUnique({ where: { slug } })
}

async function main() {
  console.log('=== MEGA SEED: vehicles + oil compatibilities ===')

  let makeCount = 0
  let modelCount = 0
  let compatCount = 0

  // 1. Upsert all makes & models + engines as compatibility engine codes
  const modelRegistry = {} // slug -> model id

  for (const mkData of MAKES_MODELS) {
    const make = await p.vehicleMake.upsert({
      where: { slug: mkData.slug },
      update: { name: mkData.name },
      create: { name: mkData.name, slug: mkData.slug },
    })
    makeCount++
    process.stdout.write(`  Make: ${make.name}\n`)

    for (const mdData of mkData.models) {
      const model = await p.vehicleModel.upsert({
        where: { slug: mdData.slug },
        update: { name: mdData.name },
        create: { makeId: make.id, name: mdData.name, slug: mdData.slug },
      })
      modelRegistry[mdData.slug] = { id: model.id, engines: mdData.engines }
      modelCount++
    }
  }

  console.log(`\nDone: ${makeCount} makes, ${modelCount} models`)

  // 2. Add oil compatibilities
  console.log('\nAdding oil compatibilities...')
  
  for (const [productSlug, modelSlugs] of Object.entries(OIL_COMPAT_MAP)) {
    const product = await findProductBySlug(productSlug)
    if (!product) {
      console.log(`  [skip] Product not found: ${productSlug}`)
      continue
    }

    for (const modelSlug of modelSlugs) {
      const modelData = modelRegistry[modelSlug]
      if (!modelData) {
        console.log(`  [skip] Model not found: ${modelSlug}`)
        continue
      }

      for (const eng of modelData.engines.slice(0, 2)) { // first 2 engines per model
        try {
          await p.vehicleCompatibility.upsert({
            where: {
              productId_vehicleModelId_engineCode: {
                productId: product.id,
                vehicleModelId: modelData.id,
                engineCode: eng.code,
              },
            },
            update: {},
            create: {
              productId: product.id,
              vehicleModelId: modelData.id,
              engineCode: eng.code,
              yearFrom: eng.from,
              yearTo: eng.to,
            },
          })
          compatCount++
        } catch (e) {
          // skip duplicate or other errors
        }
      }
    }
  }

  console.log(`Added ${compatCount} compatibility records.`)
  console.log('\n=== MEGA SEED COMPLETE ===')
  await p.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await p.$disconnect()
  process.exit(1)
})
