-- ============================================================================
-- Seed Toyota Land Cruiser 200 & 100 Engine Specifications (Liqui Moly Guide)
-- ============================================================================

-- 1. Oil Specifications
INSERT INTO public."OilFinderOilSpec" (
  id, "viscosity", "apiStandard", "aceaStandard", "oemApproval", "capacityLiters", "changeIntervalKm", "fingerprint"
) VALUES
  (
    'spec-toyota-5w40-71l',
    '5W-40',
    'SN/CF',
    'A3/B4',
    'Toyota / Lexus / MB 229.5 / Porsche A40',
    7.1,
    15000,
    '["5w-40","sn/cf","a3/b4","toyota / lexus / mb 229.5 / porsche a40"]'
  ),
  (
    'spec-toyota-5w40-68l',
    '5W-40',
    'SN/CF',
    'A3/B4',
    'Toyota / Lexus / MB 229.5 / Porsche A40',
    6.8,
    15000,
    '["5w-40","sn/cf","a3/b4","toyota / lexus / mb 229.5 / porsche a40-68l"]'
  ),
  (
    'spec-toyota-0w20-75l',
    '0W-20',
    'SP',
    NULL,
    'ILSAC GF-6A',
    7.5,
    10000,
    '["0w-20","sp",null,"ilsac gf-6a"]'
  ),
  (
    'spec-toyota-5w30-c2-92l',
    '5W-30',
    NULL,
    'C2',
    'Toyota DL-1 / ACEA C2',
    9.2,
    10000,
    '["5w-30",null,"c2","toyota dl-1 / acea c2"]'
  ),
  (
    'spec-toyota-5w30-sp-52l',
    '5W-30',
    'SP',
    NULL,
    'ILSAC GF-6A',
    5.2,
    10000,
    '["5w-30","sp",null,"ilsac gf-6a"]'
  )
ON CONFLICT ("fingerprint") DO UPDATE SET
  "viscosity" = EXCLUDED."viscosity",
  "apiStandard" = EXCLUDED."apiStandard",
  "aceaStandard" = EXCLUDED."aceaStandard",
  "oemApproval" = EXCLUDED."oemApproval",
  "capacityLiters" = EXCLUDED."capacityLiters",
  "changeIntervalKm" = EXCLUDED."changeIntervalKm";

-- 2. Upsert Land Cruiser Vehicles
-- Land Cruiser 200 4.7 V8 (2UZ-FE)
INSERT INTO public."OilFinderVehicle" (
  id, make, model, category, generation, "yearFrom", "yearTo", "engineCode",
  "displacementCc", "powerKw", "powerHp", "fuelType", "oilSpecId", source, confidence
) VALUES
  (
    'veh-toyota-lc-47-2uz',
    'TOYOTA',
    'Land Cruiser',
    'automobile',
    'J200',
    2008,
    2012,
    '2UZ-FE',
    4664,
    212,
    288,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["5w-40","sn/cf","a3/b4","toyota / lexus / mb 229.5 / porsche a40"]'),
    'liqui-moly.com',
    'high'
  ),
  (
    'veh-toyota-lc200-47-2uz',
    'TOYOTA',
    'Land Cruiser 200',
    'automobile',
    'UZJ200',
    2008,
    2012,
    '2UZ-FE',
    4664,
    212,
    288,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["5w-40","sn/cf","a3/b4","toyota / lexus / mb 229.5 / porsche a40"]'),
    'liqui-moly.com',
    'high'
  ),
  (
    'veh-toyota-lc200-47-vvti',
    'TOYOTA',
    'Land Cruiser 200',
    'automobile',
    'UZJ200',
    2008,
    2012,
    '4.7 VVT-i V8',
    4664,
    212,
    288,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["5w-40","sn/cf","a3/b4","toyota / lexus / mb 229.5 / porsche a40"]'),
    'liqui-moly.com',
    'high'
  ),
  -- Land Cruiser 200 5.7 V8 (3UR-FE)
  (
    'veh-toyota-lc-57-3ur',
    'TOYOTA',
    'Land Cruiser',
    'automobile',
    'J200',
    2008,
    2021,
    '3UR-FE',
    5663,
    280,
    381,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["0w-20","sp",null,"ilsac gf-6a"]'),
    'liqui-moly.com',
    'high'
  ),
  (
    'veh-toyota-lc200-57-3ur',
    'TOYOTA',
    'Land Cruiser 200',
    'automobile',
    'URJ202',
    2008,
    2021,
    '3UR-FE',
    5663,
    280,
    381,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["0w-20","sp",null,"ilsac gf-6a"]'),
    'liqui-moly.com',
    'high'
  ),
  (
    'veh-toyota-lc200-57-v8',
    'TOYOTA',
    'Land Cruiser 200',
    'automobile',
    'URJ202',
    2008,
    2021,
    '5.7 V8',
    5663,
    280,
    381,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["0w-20","sp",null,"ilsac gf-6a"]'),
    'liqui-moly.com',
    'high'
  ),
  -- Land Cruiser 200 4.6 V8 (1UR-FE)
  (
    'veh-toyota-lc-46-1ur',
    'TOYOTA',
    'Land Cruiser',
    'automobile',
    'J200',
    2012,
    2021,
    '1UR-FE',
    4608,
    227,
    309,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["0w-20","sp",null,"ilsac gf-6a"]'),
    'liqui-moly.com',
    'high'
  ),
  (
    'veh-toyota-lc200-46-1ur',
    'TOYOTA',
    'Land Cruiser 200',
    'automobile',
    'URJ200',
    2012,
    2021,
    '1UR-FE',
    4608,
    227,
    309,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["0w-20","sp",null,"ilsac gf-6a"]'),
    'liqui-moly.com',
    'high'
  ),
  -- Land Cruiser 200 4.5 D-4D V8 (1VD-FTV)
  (
    'veh-toyota-lc-45-1vd',
    'TOYOTA',
    'Land Cruiser',
    'automobile',
    'J200',
    2008,
    2021,
    '1VD-FTV',
    4461,
    210,
    286,
    'diesel',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["5w-30",null,"c2","toyota dl-1 / acea c2"]'),
    'liqui-moly.com',
    'high'
  ),
  (
    'veh-toyota-lc200-45-1vd',
    'TOYOTA',
    'Land Cruiser 200',
    'automobile',
    'VDJ200',
    2008,
    2021,
    '1VD-FTV',
    4461,
    210,
    286,
    'diesel',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["5w-30",null,"c2","toyota dl-1 / acea c2"]'),
    'liqui-moly.com',
    'high'
  ),
  -- Land Cruiser 200 4.0 V6 (1GR-FE)
  (
    'veh-toyota-lc200-40-1gr',
    'TOYOTA',
    'Land Cruiser 200',
    'automobile',
    'GRJ200',
    2008,
    2021,
    '1GR-FE',
    3956,
    202,
    275,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["5w-30","sp",null,"ilsac gf-6a"]'),
    'liqui-moly.com',
    'high'
  ),
  -- Land Cruiser 100 4.7 V8 (2UZ-FE)
  (
    'veh-toyota-lc100-47-2uz',
    'TOYOTA',
    'Land Cruiser 100',
    'automobile',
    'J100',
    1998,
    2007,
    '2UZ-FE',
    4664,
    173,
    235,
    'essence',
    (SELECT id FROM public."OilFinderOilSpec" WHERE "fingerprint" = '["5w-40","sn/cf","a3/b4","toyota / lexus / mb 229.5 / porsche a40-68l"]'),
    'liqui-moly.com',
    'high'
  )
ON CONFLICT (make, model, generation, "engineCode", source) DO UPDATE SET
  "displacementCc" = EXCLUDED."displacementCc",
  "powerKw" = EXCLUDED."powerKw",
  "powerHp" = EXCLUDED."powerHp",
  "fuelType" = EXCLUDED."fuelType",
  "oilSpecId" = EXCLUDED."oilSpecId",
  confidence = EXCLUDED.confidence;
