-- ============================================================================
-- SpecPart / KiosqueTN: Fix Oil Finder Audit Inconsistencies
-- ============================================================================
-- 1. Adds missing Marine (NMMA FC-W) and Agricultural (Kubota CI-4/E7) specs.
-- 2. Corrects petrol engines erroneously linked to diesel DPF RN0720.
-- 3. Canonicalizes spec variants (VW 504/507, GM Dexos2, PSA B71).
-- 4. Populates accurate production years (yearFrom / yearTo) for classic vehicles.
-- ============================================================================

BEGIN;

-- ── 1. UPSERT CANONICAL OIL SPECIFICATIONS ───────────────────────────────────

-- 1.1 Kubota Agricultural Heavy-Duty Diesel Spec (15W-40 CI-4 / E7)
INSERT INTO public."OilFinderOilSpec" (
  id, "viscosity", "apiStandard", "aceaStandard", "oemApproval", "capacityLiters", "changeIntervalKm", "fingerprint"
) VALUES (
  'spec-agri-kubota-15w40',
  '15W-40',
  'CI-4',
  'E7',
  'Kubota Engine Oil',
  8.0,
  10000,
  '["15w-40","ci-4","e7","kubota engine oil"]'
)
ON CONFLICT ("fingerprint") DO UPDATE SET
  "viscosity" = EXCLUDED."viscosity",
  "apiStandard" = EXCLUDED."apiStandard",
  "aceaStandard" = EXCLUDED."aceaStandard",
  "oemApproval" = EXCLUDED."oemApproval";

-- 1.2 Marine 4-Stroke Outboard Spec (10W-30 NMMA FC-W / API SJ/SL)
INSERT INTO public."OilFinderOilSpec" (
  id, "viscosity", "apiStandard", "aceaStandard", "oemApproval", "capacityLiters", "changeIntervalKm", "fingerprint"
) VALUES (
  'spec-marine-nmma-fcw-10w30',
  '10W-30',
  'SJ/SL',
  NULL,
  'NMMA FC-W',
  1.5,
  5000,
  '["10w-30","sj/sl",null,"nmma fc-w"]'
)
ON CONFLICT ("fingerprint") DO UPDATE SET
  "viscosity" = EXCLUDED."viscosity",
  "apiStandard" = EXCLUDED."apiStandard",
  "oemApproval" = EXCLUDED."oemApproval";

-- 1.3 Renault Atmospheric Gasoline Spec (10W-40 RN0700 A3/B4)
INSERT INTO public."OilFinderOilSpec" (
  id, "viscosity", "apiStandard", "aceaStandard", "oemApproval", "capacityLiters", "changeIntervalKm", "fingerprint"
) VALUES (
  'spec-renault-rn0700-10w40',
  '10W-40',
  'SL/CF',
  'A3/B4',
  'Renault RN0700',
  4.0,
  10000,
  '10w-40_renault-rn0700_a3b4'
)
ON CONFLICT ("fingerprint") DO UPDATE SET
  "viscosity" = EXCLUDED."viscosity",
  "oemApproval" = EXCLUDED."oemApproval";

-- 1.4 Renault Turbo Gasoline Spec (5W-40 RN0710 A3/B4)
INSERT INTO public."OilFinderOilSpec" (
  id, "viscosity", "apiStandard", "aceaStandard", "oemApproval", "capacityLiters", "changeIntervalKm", "fingerprint"
) VALUES (
  'spec-renault-rn0710-5w40',
  '5W-40',
  'SN/CF',
  'A3/B4',
  'Renault RN0710 / RN0700',
  4.5,
  15000,
  '5w-40_renault-rn0710_a3b4'
)
ON CONFLICT ("fingerprint") DO UPDATE SET
  "viscosity" = EXCLUDED."viscosity",
  "oemApproval" = EXCLUDED."oemApproval";

-- 1.5 Canonical VW 504 00 / 507 00
INSERT INTO public."OilFinderOilSpec" (
  id, "viscosity", "apiStandard", "aceaStandard", "oemApproval", "capacityLiters", "changeIntervalKm", "fingerprint"
) VALUES (
  'spec-vw-50400-50700-5w30',
  '5W-30',
  'SN',
  'C3',
  'VW 504 00 / 507 00 (LongLife III)',
  4.5,
  15000,
  '5w-30_vw-50400-50700_c3'
)
ON CONFLICT ("fingerprint") DO UPDATE SET
  "viscosity" = EXCLUDED."viscosity",
  "oemApproval" = EXCLUDED."oemApproval";

-- 1.6 Canonical GM Dexos2
INSERT INTO public."OilFinderOilSpec" (
  id, "viscosity", "apiStandard", "aceaStandard", "oemApproval", "capacityLiters", "changeIntervalKm", "fingerprint"
) VALUES (
  'spec-gm-dexos2-5w30',
  '5W-30',
  'SN/CF',
  'C3',
  'GM Dexos2',
  4.5,
  15000,
  '5w-30_gm-dexos2_c3'
)
ON CONFLICT ("fingerprint") DO UPDATE SET
  "viscosity" = EXCLUDED."viscosity",
  "apiStandard" = EXCLUDED."apiStandard",
  "oemApproval" = EXCLUDED."oemApproval";


-- ── 2. FIX MISSING SPECS (KUBOTA & MARINE OUTBOARDS) ─────────────────────────

-- 2.1 Kubota L5030 & M7040
UPDATE public."OilFinderVehicle"
SET "oilSpecId" = (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '["15w-40","ci-4","e7","kubota engine oil"]' LIMIT 1)
WHERE UPPER(make) = 'KUBOTA' AND (UPPER(model) LIKE '%L5030%' OR UPPER(model) LIKE '%M7040%');

-- 2.2 Parsun & Selva Marine Outboards
UPDATE public."OilFinderVehicle"
SET "oilSpecId" = (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '["10w-30","sj/sl",null,"nmma fc-w"]' LIMIT 1)
WHERE UPPER(make) IN ('PARSUN', 'SELVA');


-- ── 3. FIX ERRONEOUS DIESEL DPF RN0720 ON GASOLINE ENGINES ───────────────────

-- 3.1 Atmospheric gasoline engines (1.2 16V, 1.4, 1.6 16V) mistakenly given RN0720 -> assign RN0700 10W-40
UPDATE public."OilFinderVehicle"
SET "oilSpecId" = (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '10w-40_renault-rn0700_a3b4' LIMIT 1)
WHERE UPPER(make) IN ('RENAULT', 'DACIA')
  AND (
    LOWER("fuelType") IN ('essence', 'petrol', 'gasoline')
    OR "engineCode" ILIKE '%1.2 16V%'
    OR "engineCode" ILIKE '%1.4%'
    OR "engineCode" ILIKE '%1.6 16V%'
    OR "engineCode" ILIKE '%1.2 (BB0A%'
  )
  AND NOT ("engineCode" ILIKE '%tce%' OR "engineCode" ILIKE '%dci%' OR "engineCode" ILIKE '%k9k%')
  AND "oilSpecId" IN (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4');

-- 3.2 Turbo gasoline engines (0.9 TCe, 1.2 TCe, 1.3 TCe, 1.0 TCe) mistakenly given RN0720 -> assign RN0710 5W-40
UPDATE public."OilFinderVehicle"
SET "oilSpecId" = (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '5w-40_renault-rn0710_a3b4' LIMIT 1)
WHERE UPPER(make) IN ('RENAULT', 'DACIA')
  AND "engineCode" ILIKE '%tce%'
  AND "oilSpecId" IN (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4');


-- ── 4. CANONICALIZE SPEC VARIANTS ───────────────────────────────────────────

-- 4.1 Re-point any vehicle pointing to alternate Dexos2 specs to canonical spec
UPDATE public."OilFinderVehicle"
SET "oilSpecId" = (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos2_c3' LIMIT 1)
WHERE "oilSpecId" IN (
  SELECT id FROM public."OilFinderOilSpec"
  WHERE UPPER("oemApproval") LIKE '%DEXOS2%' AND fingerprint <> '5w-30_gm-dexos2_c3'
);

-- 4.2 Standardize any lingering VW 504.00/507.00 specs
UPDATE public."OilFinderOilSpec"
SET "oemApproval" = 'VW 504 00 / 507 00 (LongLife III)',
    "apiStandard" = 'SN'
WHERE "oemApproval" = 'VW 504.00/507.00';

-- 4.3 Standardize PSA B71 2294 to PSA B71 2300 / B71 2294
UPDATE public."OilFinderOilSpec"
SET "oemApproval" = 'Peugeot Citroën PSA B71 2300 / B71 2294'
WHERE "oemApproval" = 'PSA B71 2294';

-- 4.4 Standardize Toyota 1VD-FTV across Land Cruiser 200 and Land Cruiser 76/79
UPDATE public."OilFinderVehicle"
SET "oilSpecId" = (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '["5w-30",null,"c2","toyota dl-1 / acea c2"]' LIMIT 1)
WHERE "engineCode" = '1VD-FTV';

-- 4.5 Standardize Citroen EB2F PureTech to canonical PSA B71 2290 C2
UPDATE public."OilFinderVehicle"
SET "oilSpecId" = (SELECT id FROM public."OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1)
WHERE UPPER(make) = 'CITROEN' AND UPPER("engineCode") = 'EB2F';



-- ── 5. POPULATE PRODUCTION YEARS FOR POPULAR VEHICLES ────────────────────────

-- Volkswagen Golf IV (1997 - 2004)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 1997, "yearTo" = 2004
WHERE UPPER(make) = 'VOLKSWAGEN' AND (UPPER(model) LIKE '%GOLF IV%' OR UPPER(model) LIKE '%GOLF 4%') AND "yearFrom" IS NULL;

-- Volkswagen Golf V (2003 - 2009)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2003, "yearTo" = 2009
WHERE UPPER(make) = 'VOLKSWAGEN' AND (UPPER(model) LIKE '%GOLF V %' OR UPPER(model) LIKE '%GOLF 5%') AND "yearFrom" IS NULL;

-- Volkswagen Golf VI (2008 - 2013)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2008, "yearTo" = 2013
WHERE UPPER(make) = 'VOLKSWAGEN' AND (UPPER(model) LIKE '%GOLF VI %' OR UPPER(model) LIKE '%GOLF 6%') AND "yearFrom" IS NULL;

-- Volkswagen Golf VII (2012 - 2020)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2012, "yearTo" = 2020
WHERE UPPER(make) = 'VOLKSWAGEN' AND (UPPER(model) LIKE '%GOLF VII%' OR UPPER(model) LIKE '%GOLF 7%') AND "yearFrom" IS NULL;

-- Peugeot 206 (1998 - 2009)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 1998, "yearTo" = 2009
WHERE UPPER(make) = 'PEUGEOT' AND UPPER(model) LIKE '%206%' AND "yearFrom" IS NULL;

-- Peugeot 207 (2006 - 2014)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2006, "yearTo" = 2014
WHERE UPPER(make) = 'PEUGEOT' AND UPPER(model) LIKE '%207%' AND "yearFrom" IS NULL;

-- Peugeot 307 (2001 - 2008)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2001, "yearTo" = 2008
WHERE UPPER(make) = 'PEUGEOT' AND UPPER(model) LIKE '%307%' AND "yearFrom" IS NULL;

-- Citroën Saxo (1996 - 2003)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 1996, "yearTo" = 2003
WHERE UPPER(make) = 'CITROEN' AND UPPER(model) LIKE '%SAXO%' AND "yearFrom" IS NULL;

-- Citroën Xsara (1997 - 2005)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 1997, "yearTo" = 2005
WHERE UPPER(make) = 'CITROEN' AND UPPER(model) LIKE '%XSARA%' AND "yearFrom" IS NULL;

-- Renault Clio II (1998 - 2012)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 1998, "yearTo" = 2012
WHERE UPPER(make) = 'RENAULT' AND (UPPER(model) LIKE '%CLIO II%' OR UPPER(model) LIKE '%CLIO 2%') AND "yearFrom" IS NULL;

-- Renault Clio III (2005 - 2014)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2005, "yearTo" = 2014
WHERE UPPER(make) = 'RENAULT' AND (UPPER(model) LIKE '%CLIO III%' OR UPPER(model) LIKE '%CLIO 3%') AND "yearFrom" IS NULL;

-- Renault Clio IV (2012 - 2019)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2012, "yearTo" = 2019
WHERE UPPER(make) = 'RENAULT' AND (UPPER(model) LIKE '%CLIO IV%' OR UPPER(model) LIKE '%CLIO 4%') AND "yearFrom" IS NULL;

-- Fiat Punto II (1999 - 2010)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 1999, "yearTo" = 2010
WHERE UPPER(make) = 'FIAT' AND (UPPER(model) LIKE '%PUNTO (188%' OR UPPER(model) LIKE '%PUNTO II%') AND "yearFrom" IS NULL;

-- Opel Astra G (1998 - 2004)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 1998, "yearTo" = 2004
WHERE UPPER(make) = 'OPEL' AND UPPER(model) LIKE '%ASTRA G%' AND "yearFrom" IS NULL;

-- Opel Astra H (2004 - 2010)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2004, "yearTo" = 2010
WHERE UPPER(make) = 'OPEL' AND UPPER(model) LIKE '%ASTRA H%' AND "yearFrom" IS NULL;

-- Opel Corsa C (2000 - 2006)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2000, "yearTo" = 2006
WHERE UPPER(make) = 'OPEL' AND UPPER(model) LIKE '%CORSA C%' AND "yearFrom" IS NULL;

-- Opel Corsa D (2006 - 2014)
UPDATE public."OilFinderVehicle"
SET "yearFrom" = 2006, "yearTo" = 2014
WHERE UPPER(make) = 'OPEL' AND UPPER(model) LIKE '%CORSA D%' AND "yearFrom" IS NULL;

COMMIT;
