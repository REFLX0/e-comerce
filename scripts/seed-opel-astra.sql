-- ============================================================================
-- SPEC-PART: SEED OPEL ASTRA H (A04) - 5W-30 GM DEXOS2
-- ============================================================================

-- 1. Ensure the 5W-30 GM Dexos2 spec exists
INSERT INTO "OilFinderOilSpec" (
  id, fingerprint, viscosity, "apiStandard", "aceaStandard", "oemApproval", 
  "capacityLiters", "changeIntervalKm"
)
VALUES (
  gen_random_uuid()::text,
  '5w-30_sn-cf_c3_gm-dexos2',
  '5W-30',
  'SN/CF',
  'C3',
  'GM Dexos2',
  3.5,
  15000
)
ON CONFLICT (fingerprint) DO UPDATE SET
  viscosity = EXCLUDED.viscosity,
  "apiStandard" = EXCLUDED."apiStandard",
  "aceaStandard" = EXCLUDED."aceaStandard",
  "oemApproval" = EXCLUDED."oemApproval",
  "capacityLiters" = EXCLUDED."capacityLiters",
  "changeIntervalKm" = EXCLUDED."changeIntervalKm";

-- 2. Link Opel Astra H variants to this 5W-30 GM Dexos2 spec
WITH spec AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_sn-cf_c3_gm-dexos2' LIMIT 1
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
  v.fuel,
  v.hp,
  spec.id,
  'Opel Service / Manuel Constructeur GM Dexos2',
  'high'
FROM spec, (VALUES
  -- ── Exact TecDoc model: ASTRA H (A04) ──
  ('OPEL', 'ASTRA H (A04)', 'A04', '1.4 (L48)', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H (A04)', 'A04', '1.4', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'Z 14 XEP', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'Z14XEP', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H (A04)', 'A04', '1.4 LPG (L48)', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H (A04)', 'A04', '', 1364, 'essence', 90),

  ('OPEL', 'ASTRA H (A04)', 'A04', '1.6 (L48)', 1598, 'essence', 105),
  ('OPEL', 'ASTRA H (A04)', 'A04', '1.6', 1598, 'essence', 105),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'Z 16 XEP', 1598, 'essence', 105),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'Z 16 XER', 1598, 'essence', 115),

  ('OPEL', 'ASTRA H (A04)', 'A04', '1.8 (L48)', 1796, 'essence', 125),
  ('OPEL', 'ASTRA H (A04)', 'A04', '1.8', 1796, 'essence', 140),

  ('OPEL', 'ASTRA H (A04)', 'A04', '1.3 CDTI (L48)', 1248, 'diesel', 90),
  ('OPEL', 'ASTRA H (A04)', 'A04', '1.3 CDTI', 1248, 'diesel', 90),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'Z 13 DTH', 1248, 'diesel', 90),

  ('OPEL', 'ASTRA H (A04)', 'A04', '1.7 CDTI (L48)', 1686, 'diesel', 100),
  ('OPEL', 'ASTRA H (A04)', 'A04', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'Z 17 DTH', 1686, 'diesel', 100),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'A 17 DTJ', 1686, 'diesel', 110),

  ('OPEL', 'ASTRA H (A04)', 'A04', '1.9 CDTI (L48)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA H (A04)', 'A04', '1.9 CDTI', 1910, 'diesel', 150),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'Z 19 DT', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA H (A04)', 'A04', 'Z 19 DTH', 1910, 'diesel', 150),

  -- ── TecDoc GTC variant: ASTRA H GTC (A04) ──
  ('OPEL', 'ASTRA H GTC (A04)', 'A04', '1.4 (L08)', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H GTC (A04)', 'A04', '1.4', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H GTC (A04)', 'A04', '', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H GTC (A04)', 'A04', '1.6 (L08)', 1598, 'essence', 105),
  ('OPEL', 'ASTRA H GTC (A04)', 'A04', '1.7 CDTI (L08)', 1686, 'diesel', 100),
  ('OPEL', 'ASTRA H GTC (A04)', 'A04', '1.9 CDTI (L08)', 1910, 'diesel', 120),

  -- ── TecDoc Estate variant: ASTRA H Estate (A04) ──
  ('OPEL', 'ASTRA H Estate (A04)', 'A04', '1.4 (L35)', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H Estate (A04)', 'A04', '1.4', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H Estate (A04)', 'A04', '', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H Estate (A04)', 'A04', '1.6 (L35)', 1598, 'essence', 105),
  ('OPEL', 'ASTRA H Estate (A04)', 'A04', '1.7 CDTI (L35)', 1686, 'diesel', 100),
  ('OPEL', 'ASTRA H Estate (A04)', 'A04', '1.9 CDTI (L35)', 1910, 'diesel', 120),

  -- ── Plain Model Name: Astra H & ASTRA H ──
  ('OPEL', 'Astra H', 'H', '1.4 (L48)', 1364, 'essence', 90),
  ('OPEL', 'Astra H', 'H', '1.4', 1364, 'essence', 90),
  ('OPEL', 'Astra H', 'H', '', 1364, 'essence', 90),
  ('OPEL', 'Astra H', 'H', '1.6', 1598, 'essence', 105),
  ('OPEL', 'Astra H', 'H', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'Astra H', 'H', '1.9 CDTI', 1910, 'diesel', 120),

  ('OPEL', 'ASTRA H', 'H', '1.4 (L48)', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H', 'H', '1.4', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H', 'H', '', 1364, 'essence', 90),
  ('OPEL', 'ASTRA H', 'H', '1.6', 1598, 'essence', 105),
  ('OPEL', 'ASTRA H', 'H', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'ASTRA H', 'H', '1.9 CDTI', 1910, 'diesel', 120),

  -- ── Plain Model Name: Astra ──
  ('OPEL', 'Astra', 'H', '1.4 (L48)', 1364, 'essence', 90),
  ('OPEL', 'Astra', 'H', '1.4', 1364, 'essence', 90),
  ('OPEL', 'Astra', 'H', 'Z 14 XEP', 1364, 'essence', 90)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- 3. Verify Opel Astra H against 5W-30 products in catalog
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
        ps.viscosity ILIKE '%5W%30%'
        OR p."nameFr" ILIKE '%5W%30%'
      )
  ) AS oils_in_catalog
FROM "OilFinderVehicle" v
JOIN "OilFinderOilSpec" s ON s.id = v."oilSpecId"
WHERE v.make = 'OPEL' AND v.model ILIKE '%astra%h%'
LIMIT 10;
