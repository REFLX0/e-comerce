-- 1. Ensure the 10W-40 PSA B71 2294 spec exists
INSERT INTO "OilFinderOilSpec" (
  id, fingerprint, viscosity, "apiStandard", "aceaStandard", "oemApproval", 
  "capacityLiters", "changeIntervalKm"
)
VALUES (
  gen_random_uuid()::text,
  '10w-40_sl-cf_a3-b4_psa-b71-2294',
  '10W-40',
  'SL/CF',
  'A3/B4',
  'PSA B71 2294',
  3.5,
  15000
)
ON CONFLICT (fingerprint) DO NOTHING;

-- 2. Link Citroën Saxo to this spec (both 'Saxo' and TecDoc 'SAXO (S0, S1)')
WITH spec AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_sl-cf_a3-b4_psa-b71-2294' LIMIT 1
)
INSERT INTO "OilFinderVehicle" (
  id, category, make, model, generation, "engineCode",
  "displacementCc", "fuelType", "powerHp", "oilSpecId",
  source, confidence
)
SELECT 
  gen_random_uuid()::text,
  'automobile',
  v.make,
  v.model,
  v.generation,
  v.engine_code,
  v.disp,
  'essence',
  v.hp,
  spec.id,
  'PSA Service Box / Manuel Constructeur Citroën',
  'high'
FROM spec, (VALUES
  -- Match by plain model name 'Saxo'
  ('CITROEN', 'Saxo', 'S0, S1', '1.1 X,SX', 1124, 60),
  ('CITROEN', 'Saxo', 'S0, S1', '1.1', 1124, 60),
  ('CITROEN', 'Saxo', 'S0, S1', 'HDZ', 1124, 60),
  ('CITROEN', 'Saxo', 'S0, S1', 'HFX', 1124, 60),
  ('CITROEN', 'Saxo', 'S0, S1', '', 1124, 60),
  ('CITROEN', 'Saxo', 'S0, S1', '1.4 VTS', 1360, 75),
  ('CITROEN', 'Saxo', 'S0, S1', '1.6 VTS', 1587, 98),
  -- Match by TecDoc description 'SAXO (S0, S1)'
  ('CITROEN', 'SAXO (S0, S1)', 'S0, S1', '1.1 X,SX', 1124, 60),
  ('CITROEN', 'SAXO (S0, S1)', 'S0, S1', '1.1', 1124, 60),
  ('CITROEN', 'SAXO (S0, S1)', 'S0, S1', 'HDZ', 1124, 60),
  ('CITROEN', 'SAXO (S0, S1)', 'S0, S1', 'HFX', 1124, 60),
  ('CITROEN', 'SAXO (S0, S1)', 'S0, S1', '', 1124, 60),
  ('CITROEN', 'SAXO (S0, S1)', 'S0, S1', '1.4 VTS', 1360, 75),
  ('CITROEN', 'SAXO (S0, S1)', 'S0, S1', '1.6 VTS', 1587, 98)
) AS v(make, model, generation, engine_code, disp, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- 3. Verify Saxo against products in catalog
SELECT 
  v.make, 
  v.model, 
  v."engineCode", 
  s.viscosity, 
  s."oemApproval",
  s."capacityLiters",
  (
    SELECT count(DISTINCT ps."productId")
    FROM "ProductSpecs" ps
    JOIN "Product" p ON p.id = ps."productId"
    WHERE p."isPublished" = true
      AND (
        ps.viscosity = s.viscosity
        OR ps.viscosity = REPLACE(s.viscosity, '-', '')
        OR ps.viscosity ILIKE '%' || s.viscosity || '%'
      )
  ) AS oils_in_catalog
FROM "OilFinderVehicle" v
JOIN "OilFinderOilSpec" s ON s.id = v."oilSpecId"
WHERE v.make = 'CITROEN' AND v.model ILIKE '%saxo%'
LIMIT 10;
