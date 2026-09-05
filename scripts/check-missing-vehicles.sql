-- ============================================================================
-- SPEC-PART AUDIT: DETECT UNSEEDED CARS (LIKE SAXO) & CATALOGUE STOCK GAPS
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo ' 1. TOP-MARKET CARS IN TECDOC WITH NO OIL SPEC (UNSEEDED - LIKE SAXO)'
\echo '============================================================================'
\echo 'These cars exist in your TecDoc dropdowns but have 0 specs in OilFinderVehicle.'
\echo ''

SELECT 
  COALESCE(NULLIF(mfr.description, ''), mfr.matchcode) AS "Brand",
  m.description AS "TecDoc Model",
  COUNT(pc.id) AS "Engine Trims"
FROM tecdoc.models m
JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
LEFT JOIN tecdoc.passengercars pc ON pc.model_id = m.id AND pc.can_be_displayed = true
WHERE m.can_be_displayed = true
  AND (m.is_passenger_car = true OR mfr.is_passenger_car = true)
  -- Focus on the core market brands (French, German, Italian, Asian volume)
  AND (
    LOWER(mfr.matchcode) IN ('citro', 'peuge', 'renau', 'dacia', 'vw', 'fiat', 'toyot', 'hyund', 'kia', 'bmw', 'merce', 'audi', 'seat', 'skoda', 'ford', 'nissa', 'opel', 'chevr')
    OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) ~* '(citroen|peugeot|renault|dacia|volkswagen|fiat|toyota|hyundai|kia|bmw|mercedes|audi|seat|skoda|ford|nissan|opel|chevrolet)'
  )
  -- Filter out models that already have specs in OilFinderVehicle
  AND NOT EXISTS (
    SELECT 1 
    FROM "OilFinderVehicle" ofv 
    WHERE (
      LOWER(REGEXP_REPLACE(ofv.make, '[^a-zA-Z0-9]+', '', 'g')) = LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '', 'g'))
      OR LOWER(REGEXP_REPLACE(ofv.make, '[^a-zA-Z0-9]+', '', 'g')) = LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '', 'g'))
    )
    AND (
      LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '', 'g')) LIKE '%' || LOWER(REGEXP_REPLACE(ofv.model, '[^a-zA-Z0-9]+', '', 'g')) || '%'
      OR LOWER(REGEXP_REPLACE(ofv.model, '[^a-zA-Z0-9]+', '', 'g')) LIKE '%' || LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '', 'g')) || '%'
    )
  )
GROUP BY "Brand", m.description
ORDER BY "Brand" ASC, "Engine Trims" DESC
LIMIT 40;

\echo ''
\echo '============================================================================'
\echo ' 2. SEEDED VEHICLES WITH 0 COMPATIBLE OILS IN STORE CATALOGUE'
\echo '============================================================================'
\echo 'These vehicles have an oil spec, but you currently stock 0 matching oils.'
\echo ''

SELECT 
  v.make AS "Make",
  v.model AS "Model",
  s.viscosity AS "Required Viscosity",
  COALESCE(s."oemApproval", '-') AS "OEM Approval",
  COUNT(DISTINCT v.id) AS "Vehicle Variants"
FROM "OilFinderVehicle" v
JOIN "OilFinderOilSpec" s ON s.id = v."oilSpecId"
GROUP BY v.make, v.model, s.viscosity, s."oemApproval"
HAVING (
  SELECT COUNT(DISTINCT ps."productId")
  FROM "ProductSpecs" ps
  JOIN "Product" p ON p.id = ps."productId"
  WHERE p."isPublished" = true
    AND (
      ps.viscosity = s.viscosity
      OR ps.viscosity = REPLACE(s.viscosity, '-', '')
      OR ps.viscosity ILIKE '%' || s.viscosity || '%'
    )
) = 0
ORDER BY v.make ASC, v.model ASC
LIMIT 30;

\echo ''
\echo '============================================================================'
\echo ' 3. OVERALL CATALOGUE COVERAGE SUMMARY'
\echo '============================================================================'

SELECT 
  (SELECT COUNT(DISTINCT make || ' ' || model) FROM "OilFinderVehicle") AS "Total Seeded Models",
  (SELECT COUNT(*) FROM "OilFinderVehicle") AS "Total Seeded Vehicles",
  (SELECT COUNT(*) FROM "OilFinderOilSpec") AS "Total Distinct Oil Specs",
  (
    SELECT COUNT(DISTINCT v.id)
    FROM "OilFinderVehicle" v
    JOIN "OilFinderOilSpec" s ON s.id = v."oilSpecId"
    WHERE (
      SELECT COUNT(DISTINCT ps."productId")
      FROM "ProductSpecs" ps
      JOIN "Product" p ON p.id = ps."productId"
      WHERE p."isPublished" = true
        AND (
          ps.viscosity = s.viscosity
          OR ps.viscosity = REPLACE(s.viscosity, '-', '')
          OR ps.viscosity ILIKE '%' || s.viscosity || '%'
        )
    ) > 0
  ) AS "Vehicles With Oils In Stock",
  (
    SELECT COUNT(DISTINCT v.id)
    FROM "OilFinderVehicle" v
    JOIN "OilFinderOilSpec" s ON s.id = v."oilSpecId"
    WHERE (
      SELECT COUNT(DISTINCT ps."productId")
      FROM "ProductSpecs" ps
      JOIN "Product" p ON p.id = ps."productId"
      WHERE p."isPublished" = true
        AND (
          ps.viscosity = s.viscosity
          OR ps.viscosity = REPLACE(s.viscosity, '-', '')
          OR ps.viscosity ILIKE '%' || s.viscosity || '%'
        )
    ) = 0
  ) AS "Vehicles Missing Oil Stock";
