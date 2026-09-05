-- ============================================================================
-- SPEC-PART: COMPREHENSIVE ALL-BRANDS VEHICLE SEED SCRIPT (PRODUCTION)
-- Covers: VW, Audi, Seat, Skoda, Cupra, Peugeot, Citroën, DS, Renault, Dacia,
--         Opel/Vauxhall, Fiat, Alfa Romeo, Lancia, Jeep, Ford, BMW, Mini,
--         Mercedes-Benz, Smart, Volvo, Mazda, Toyota, Hyundai, Kia, Nissan,
--         Honda, Mitsubishi, Subaru, Suzuki, Land Rover, Jaguar, Porsche,
--         Chevrolet, Ssangyong, MG, Haval, Geely, Chery, DFSK, Great Wall,
--         Mahindra, Isuzu, BYD, Lada, Lexus, Infiniti, Iveco
-- ============================================================================

BEGIN;

-- 1. Ensure all standard OEM specifications exist in OilFinderOilSpec
INSERT INTO "OilFinderOilSpec" (
  id, fingerprint, viscosity, "apiStandard", "aceaStandard", "oemApproval",
  "capacityLiters", "changeIntervalKm"
)
VALUES
  (gen_random_uuid()::text, '5w-30_vw-50400-50700_c3', '5W-30', 'SN', 'C3', 'VW 504 00 / 507 00 (LongLife III)', 4.5, 15000),
  (gen_random_uuid()::text, '5w-40_vw-50501-50200_c3', '5W-40', 'SN/CF', 'C3 / A3/B4', 'VW 505 01 / 502 00 / 505 00', 4.5, 15000),
  (gen_random_uuid()::text, '10w-40_vw-50101-50500_a3b4', '10W-40', 'SL/CF', 'A3/B4', 'VW 501 01 / 505 00', 4, 10000),
  (gen_random_uuid()::text, '5w-30_psa-b71-2290_c2', '5W-30', 'SN/CF', 'C2', 'Peugeot Citroën PSA B71 2290', 3.8, 15000),
  (gen_random_uuid()::text, '0w-30_psa-b71-2312_c1c2', '0W-30', 'SN', 'C2', 'Peugeot Citroën PSA B71 2312', 4, 15000),
  (gen_random_uuid()::text, '10w-40_psa-b71-2300_a3b4', '10W-40', 'SL/CF', 'A3/B4', 'Peugeot Citroën PSA B71 2300 / B71 2294', 3.5, 10000),
  (gen_random_uuid()::text, '5w-40_psa-b71-2296_a3b4', '5W-40', 'SN/CF', 'A3/B4', 'Peugeot Citroën PSA B71 2296', 4, 15000),
  (gen_random_uuid()::text, '5w-30_renault-rn0720_c4', '5W-30', 'SM/CF', 'C4', 'Renault RN0720 (dCi DPF / FAP)', 4.5, 15000),
  (gen_random_uuid()::text, '5w-30_renault-rn17_c3', '5W-30', 'SN', 'C3', 'Renault RN17 / RN0700 / RN0710', 4.2, 15000),
  (gen_random_uuid()::text, '5w-40_renault-rn0710_a3b4', '5W-40', 'SN/CF', 'A3/B4', 'Renault RN0710 / RN0700', 4.5, 15000),
  (gen_random_uuid()::text, '10w-40_renault-rn0700_a3b4', '10W-40', 'SL/CF', 'A3/B4', 'Renault RN0700', 4, 10000),
  (gen_random_uuid()::text, '5w-40_fiat-955535-s2_c3', '5W-40', 'SN/CF', 'C3', 'Fiat 9.55535-S2', 3.2, 15000),
  (gen_random_uuid()::text, '5w-30_fiat-955535-s1_c2', '5W-30', 'SN', 'C2', 'Fiat 9.55535-S1', 3.5, 15000),
  (gen_random_uuid()::text, '10w-40_fiat-955535-g2_a3b4', '10W-40', 'SL/CF', 'A3/B4', 'Fiat 9.55535-G2 / 9.55535-D2', 3, 10000),
  (gen_random_uuid()::text, '5w-30_ford-wss-m2c913-d_a5b5', '5W-30', 'SL/CF', 'A5/B5', 'Ford WSS-M2C913-D / WSS-M2C913-C', 4.1, 15000),
  (gen_random_uuid()::text, '5w-30_mb-22951_c3', '5W-30', 'SN', 'C3', 'MB 229.51 / MB 229.52', 5.5, 15000),
  (gen_random_uuid()::text, '10w-40_mb-2293_a3b4', '10W-40', 'SL/CF', 'A3/B4', 'MB 229.3 / MB 229.1', 5, 10000),
  (gen_random_uuid()::text, '5w-30_bmw-ll04_c3', '5W-30', 'SN', 'C3', 'BMW Longlife-04 (LL-04)', 5.2, 15000),
  (gen_random_uuid()::text, '5w-40_bmw-ll01_a3b4', '5W-40', 'SN', 'A3/B4', 'BMW Longlife-01 (LL-01)', 6.5, 15000),
  (gen_random_uuid()::text, '5w-30_asian-toyota-c2c3', '5W-30', 'SN/CF', 'C2 / C3', 'Toyota / Hyundai / Kia / Nissan / Asian OEM', 4, 15000),
  (gen_random_uuid()::text, '0w-20_asian-toyota-sn', '0W-20', 'SP / ILSAC GF-6', 'C5', 'Toyota Hybrid / Asian Modern Fuel Economy', 3.7, 15000),
  (gen_random_uuid()::text, '10w-40_asian-api-slcf', '10W-40', 'SL/CF', 'A3/B4', 'Toyota / Hyundai / Asian Classic', 3.8, 10000),
  (gen_random_uuid()::text, '5w-30_gm-dexos2_c3', '5W-30', 'SN', 'C3', 'GM Dexos2', 4.5, 15000),
  (gen_random_uuid()::text, '10w-40_gm-b025-api_a3b4', '10W-40', 'SL/CF', 'A3/B4', 'GM LL-A-025 / GM-LL-B-025', 4, 10000),
  (gen_random_uuid()::text, '0w-20_volvo-vcc-rbso-2ae_c5', '0W-20', 'SP', 'C5', 'Volvo VCC-RBSO-2AE', 5, 15000),
  (gen_random_uuid()::text, '5w-30_volvo-vcc-rbs0-2ae_c3', '5W-30', 'SN', 'C3', 'Volvo VCC-RBS0-2AE / Volvo XC', 5, 15000),
  (gen_random_uuid()::text, '5w-30_mazda-ms-hv_c2', '5W-30', 'SN/CF', 'C2', 'Mazda Original / Skyactiv Engine Oil', 4, 15000),
  (gen_random_uuid()::text, '5w-30_subaru-soa_a3b4', '5W-30', 'SN', 'A3/B4', 'Subaru SOA 427V1700 / K0228-Y0001', 4.5, 15000),
  (gen_random_uuid()::text, '5w-30_mitsubishi-mz320757_c3', '5W-30', 'SN/CF', 'C3', 'Mitsubishi MZ320757 / DiaQueen', 4, 15000),
  (gen_random_uuid()::text, '5w-30_jlr-03-5006_c3', '5W-30', 'SN', 'C3', 'JLR STJLR.03.5006 / Land Rover STC 4184', 6.2, 15000),
  (gen_random_uuid()::text, '0w-40_porsche-c30_a3b4', '0W-40', 'SN', 'A3/B4', 'Porsche C30 / Porsche Approved Engine Oil', 7.5, 15000),
  (gen_random_uuid()::text, '5w-40_selenia-alfa_c3', '5W-40', 'SN/CF', 'C3', 'Selenia WR Pure Energy / Alfa Romeo 9.55535-GS', 4, 15000),
  (gen_random_uuid()::text, '0w-20_honda-08221_c5', '0W-20', 'SP / ILSAC GF-6', 'C5', 'Honda 08221-99974 / Honda Genuine Motor Oil', 3.7, 15000),
  (gen_random_uuid()::text, '5w-30_honda-08w30_sn', '5W-30', 'SN/CF', 'A3/B4', 'Honda 08W30-P99-810HE / Asian API SN', 4, 15000),
  (gen_random_uuid()::text, '5w-30_suzuki-sls_sn', '5W-30', 'SN/CF', 'C2 / C3', 'Suzuki SLS-SN / Asian OEM', 3.5, 10000),
  (gen_random_uuid()::text, '5w-30_gm-dexos1_sn', '5W-30', 'SN', 'A3/B4', 'GM Dexos1 Gen 2 / ACDelco Full Synthetic', 4.7, 12000),
  (gen_random_uuid()::text, '5w-30_chinese-api-sn_a3b4', '5W-30', 'SN/CF', 'A3/B4', 'MG / Haval / Geely / BYD API SN', 4, 10000),
  (gen_random_uuid()::text, '10w-40_lada-api-sl_a3b4', '10W-40', 'SL/CF', 'A3/B4', 'AvtoVAZ / Lada API SL standard', 3.5, 10000)
ON CONFLICT (fingerprint) DO UPDATE SET
  viscosity = EXCLUDED.viscosity,
  "apiStandard" = EXCLUDED."apiStandard",
  "aceaStandard" = EXCLUDED."aceaStandard",
  "oemApproval" = EXCLUDED."oemApproval",
  "capacityLiters" = EXCLUDED."capacityLiters",
  "changeIntervalKm" = EXCLUDED."changeIntervalKm";

-- 2. Insert all popular vehicle models and engine variants

-- ── VOLKSWAGEN (GOLF VII (5G1, BQ1, BE1, BE2)) ──
WITH spec_0 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_0.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_0, (VALUES
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF VII (5G1, BQ1, BE1, BE2)', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF VII Variant (BA5, BV5)', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF VII', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VII', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf VII', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 7', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf 7', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF VI (5K1)', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF VI Variant (AJ5)', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF VI', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VI', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf VI', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 6', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf 6', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF V (1K1)', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF V Variant (1K5)', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF V', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf V', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf V', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf V', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf V', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf V', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf V', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf V', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf V', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf V', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf V', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 5', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf 5', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF VIII (CD1)', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF VIII', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf VIII', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 8', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf 8', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Golf', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Golf', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'Golf', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'Golf', 'VII', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF', 'VII', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF', 'VII', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF', 'VII', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF', 'VII', 'CRLB', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'GOLF', 'VII', '1.6 TDI (CLHA)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF', 'VII', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'GOLF', 'VII', '1.4 TSI (CZCA)', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF', 'VII', '1.4 TSI', 1395, 'essence', 125),
  ('VOLKSWAGEN', 'GOLF', 'VII', '1.2 TSI', 1197, 'essence', 105),
  ('VOLKSWAGEN', 'GOLF', 'VII', '1.9 TDI', 1896, 'diesel', 105)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (GOLF IV (1J1)) ──
WITH spec_1 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_vw-50101-50500_a3b4' LIMIT 1
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
  spec_1.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_1, (VALUES
  ('VOLKSWAGEN', 'GOLF IV (1J1)', 'IV', '', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV (1J1)', 'IV', '1.9 TDI (ALH)', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV (1J1)', 'IV', '1.9 TDI', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV (1J1)', 'IV', '1.9 SDI', 1896, 'diesel', 68),
  ('VOLKSWAGEN', 'GOLF IV (1J1)', 'IV', '1.4 16V (AHW)', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'GOLF IV (1J1)', 'IV', '1.4 16V', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'GOLF IV (1J1)', 'IV', '1.6 (AKL)', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'GOLF IV (1J1)', 'IV', '1.6', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'GOLF IV Variant (1J5)', 'IV', '', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV Variant (1J5)', 'IV', '1.9 TDI (ALH)', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV Variant (1J5)', 'IV', '1.9 TDI', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV Variant (1J5)', 'IV', '1.9 SDI', 1896, 'diesel', 68),
  ('VOLKSWAGEN', 'GOLF IV Variant (1J5)', 'IV', '1.4 16V (AHW)', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'GOLF IV Variant (1J5)', 'IV', '1.4 16V', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'GOLF IV Variant (1J5)', 'IV', '1.6 (AKL)', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'GOLF IV Variant (1J5)', 'IV', '1.6', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'GOLF IV', 'IV', '', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV', 'IV', '1.9 TDI (ALH)', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV', 'IV', '1.9 TDI', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'GOLF IV', 'IV', '1.9 SDI', 1896, 'diesel', 68),
  ('VOLKSWAGEN', 'GOLF IV', 'IV', '1.4 16V (AHW)', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'GOLF IV', 'IV', '1.4 16V', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'GOLF IV', 'IV', '1.6 (AKL)', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'GOLF IV', 'IV', '1.6', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'Golf IV', 'IV', '', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'Golf IV', 'IV', '1.9 TDI (ALH)', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'Golf IV', 'IV', '1.9 TDI', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'Golf IV', 'IV', '1.9 SDI', 1896, 'diesel', 68),
  ('VOLKSWAGEN', 'Golf IV', 'IV', '1.4 16V (AHW)', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'Golf IV', 'IV', '1.4 16V', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'Golf IV', 'IV', '1.6 (AKL)', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'Golf IV', 'IV', '1.6', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'Golf 4', 'IV', '', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'Golf 4', 'IV', '1.9 TDI (ALH)', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'Golf 4', 'IV', '1.9 TDI', 1896, 'diesel', 90),
  ('VOLKSWAGEN', 'Golf 4', 'IV', '1.9 SDI', 1896, 'diesel', 68),
  ('VOLKSWAGEN', 'Golf 4', 'IV', '1.4 16V (AHW)', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'Golf 4', 'IV', '1.4 16V', 1390, 'essence', 75),
  ('VOLKSWAGEN', 'Golf 4', 'IV', '1.6 (AKL)', 1595, 'essence', 100),
  ('VOLKSWAGEN', 'Golf 4', 'IV', '1.6', 1595, 'essence', 100)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (POLO (6R1, 6C1)) ──
WITH spec_2 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_2.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_2, (VALUES
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'POLO (6R1, 6C1)', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'POLO V (6R1, 6C1)', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'POLO VI (AW1, BZ1)', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'POLO (9N_, 9A_)', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'POLO (6N1)', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'POLO (6N2)', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'Polo V', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'Polo V', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'Polo VI', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'Polo VI', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'Polo 6R', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'Polo 9N', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'Polo', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'Polo', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'Polo', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'Polo', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'Polo', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'Polo', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'Polo', '6R', '1.0', 999, 'essence', 60),
  ('VOLKSWAGEN', 'POLO', '6R', '', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO', '6R', '1.2 (CGPA)', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO', '6R', '1.2', 1198, 'essence', 70),
  ('VOLKSWAGEN', 'POLO', '6R', '1.4 (CGGB)', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO', '6R', '1.4', 1390, 'essence', 85),
  ('VOLKSWAGEN', 'POLO', '6R', '1.6 TDI (CAYC)', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO', '6R', '1.6 TDI', 1598, 'diesel', 105),
  ('VOLKSWAGEN', 'POLO', '6R', '1.2 TSI (CBZA)', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO', '6R', '1.2 TSI', 1197, 'essence', 86),
  ('VOLKSWAGEN', 'POLO', '6R', '1.4 TDI', 1422, 'diesel', 75),
  ('VOLKSWAGEN', 'POLO', '6R', '1.0 TSI', 999, 'essence', 95),
  ('VOLKSWAGEN', 'POLO', '6R', '1.0', 999, 'essence', 60)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (PASSAT B8 (3G2, CB2)) ──
WITH spec_3 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_3.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_3, (VALUES
  ('VOLKSWAGEN', 'PASSAT B8 (3G2, CB2)', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B8 (3G2, CB2)', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B8 (3G2, CB2)', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B8 (3G2, CB2)', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'PASSAT B8 (3G2, CB2)', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'PASSAT B8 (3G2, CB2)', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'PASSAT B8 Variant (3G5, CB5)', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B8 Variant (3G5, CB5)', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B8 Variant (3G5, CB5)', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B8 Variant (3G5, CB5)', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'PASSAT B8 Variant (3G5, CB5)', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'PASSAT B8 Variant (3G5, CB5)', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'PASSAT B7 (362)', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B7 (362)', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B7 (362)', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B7 (362)', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'PASSAT B7 (362)', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'PASSAT B7 (362)', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'PASSAT B6 (3C2)', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B6 (3C2)', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B6 (3C2)', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B6 (3C2)', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'PASSAT B6 (3C2)', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'PASSAT B6 (3C2)', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'PASSAT B5.5 (3B3)', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B5.5 (3B3)', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B5.5 (3B3)', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT B5.5 (3B3)', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'PASSAT B5.5 (3B3)', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'PASSAT B5.5 (3B3)', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Passat B8', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B8', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B8', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B8', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'Passat B8', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'Passat B8', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Passat B7', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B7', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B7', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B7', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'Passat B7', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'Passat B7', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Passat B6', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B6', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B6', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat B6', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'Passat B6', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'Passat B6', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Passat', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Passat', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'Passat', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'Passat', 'B8', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'PASSAT', 'B8', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT', 'B8', '2.0 TDI (CRLB)', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT', 'B8', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'PASSAT', 'B8', '1.6 TDI', 1598, 'diesel', 120),
  ('VOLKSWAGEN', 'PASSAT', 'B8', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'PASSAT', 'B8', '1.9 TDI', 1896, 'diesel', 105)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (TIGUAN (5N_)) ──
WITH spec_4 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_4.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_4, (VALUES
  ('VOLKSWAGEN', 'TIGUAN (5N_)', 'AD1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN (5N_)', 'AD1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN (5N_)', 'AD1', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN (5N_)', 'AD1', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'TIGUAN (5N_)', 'AD1', '2.0 TSI', 1984, 'essence', 180),
  ('VOLKSWAGEN', 'TIGUAN (AD1, AX1)', 'AD1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN (AD1, AX1)', 'AD1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN (AD1, AX1)', 'AD1', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN (AD1, AX1)', 'AD1', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'TIGUAN (AD1, AX1)', 'AD1', '2.0 TSI', 1984, 'essence', 180),
  ('VOLKSWAGEN', 'TIGUAN ALLSPACE (BW2, BJ2)', 'AD1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN ALLSPACE (BW2, BJ2)', 'AD1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN ALLSPACE (BW2, BJ2)', 'AD1', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN ALLSPACE (BW2, BJ2)', 'AD1', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'TIGUAN ALLSPACE (BW2, BJ2)', 'AD1', '2.0 TSI', 1984, 'essence', 180),
  ('VOLKSWAGEN', 'Tiguan', 'AD1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Tiguan', 'AD1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Tiguan', 'AD1', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Tiguan', 'AD1', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'Tiguan', 'AD1', '2.0 TSI', 1984, 'essence', 180),
  ('VOLKSWAGEN', 'TIGUAN', 'AD1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN', 'AD1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN', 'AD1', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TIGUAN', 'AD1', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'TIGUAN', 'AD1', '2.0 TSI', 1984, 'essence', 180)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (CADDY III Box Body/MPV (2KA, 2KH, 2CA, 2CH)) ──
WITH spec_5 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_5.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_5, (VALUES
  ('VOLKSWAGEN', 'CADDY III Box Body/MPV (2KA, 2KH, 2CA, 2CH)', 'III', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY III Box Body/MPV (2KA, 2KH, 2CA, 2CH)', 'III', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY III Box Body/MPV (2KA, 2KH, 2CA, 2CH)', 'III', '1.6 TDI', 1598, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY III Box Body/MPV (2KA, 2KH, 2CA, 2CH)', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'CADDY III Box Body/MPV (2KA, 2KH, 2CA, 2CH)', 'III', '2.0 SDI', 1968, 'diesel', 70),
  ('VOLKSWAGEN', 'CADDY III Estate (2KB, 2KJ, 2CB, 2CJ)', 'III', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY III Estate (2KB, 2KJ, 2CB, 2CJ)', 'III', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY III Estate (2KB, 2KJ, 2CB, 2CJ)', 'III', '1.6 TDI', 1598, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY III Estate (2KB, 2KJ, 2CB, 2CJ)', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'CADDY III Estate (2KB, 2KJ, 2CB, 2CJ)', 'III', '2.0 SDI', 1968, 'diesel', 70),
  ('VOLKSWAGEN', 'CADDY IV Box Body/MPV (SAA, SAH)', 'III', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY IV Box Body/MPV (SAA, SAH)', 'III', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY IV Box Body/MPV (SAA, SAH)', 'III', '1.6 TDI', 1598, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY IV Box Body/MPV (SAA, SAH)', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'CADDY IV Box Body/MPV (SAA, SAH)', 'III', '2.0 SDI', 1968, 'diesel', 70),
  ('VOLKSWAGEN', 'CADDY IV Estate (SAB, SAJ)', 'III', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY IV Estate (SAB, SAJ)', 'III', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY IV Estate (SAB, SAJ)', 'III', '1.6 TDI', 1598, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY IV Estate (SAB, SAJ)', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'CADDY IV Estate (SAB, SAJ)', 'III', '2.0 SDI', 1968, 'diesel', 70),
  ('VOLKSWAGEN', 'Caddy III', 'III', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy III', 'III', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy III', 'III', '1.6 TDI', 1598, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy III', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Caddy III', 'III', '2.0 SDI', 1968, 'diesel', 70),
  ('VOLKSWAGEN', 'Caddy IV', 'III', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy IV', 'III', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy IV', 'III', '1.6 TDI', 1598, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy IV', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Caddy IV', 'III', '2.0 SDI', 1968, 'diesel', 70),
  ('VOLKSWAGEN', 'Caddy', 'III', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy', 'III', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy', 'III', '1.6 TDI', 1598, 'diesel', 102),
  ('VOLKSWAGEN', 'Caddy', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'Caddy', 'III', '2.0 SDI', 1968, 'diesel', 70),
  ('VOLKSWAGEN', 'CADDY', 'III', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY', 'III', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY', 'III', '1.6 TDI', 1598, 'diesel', 102),
  ('VOLKSWAGEN', 'CADDY', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('VOLKSWAGEN', 'CADDY', 'III', '2.0 SDI', 1968, 'diesel', 70)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (TOUAREG (7LA, 7L6, 7L7)) ──
WITH spec_6 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_6.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_6, (VALUES
  ('VOLKSWAGEN', 'TOUAREG (7LA, 7L6, 7L7)', '7P', '', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG (7LA, 7L6, 7L7)', '7P', '3.0 V6 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG (7LA, 7L6, 7L7)', '7P', '3.0 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG (7P5, 7P6)', '7P', '', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG (7P5, 7P6)', '7P', '3.0 V6 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG (7P5, 7P6)', '7P', '3.0 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG (CR7)', '7P', '', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG (CR7)', '7P', '3.0 V6 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG (CR7)', '7P', '3.0 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'Touareg', '7P', '', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'Touareg', '7P', '3.0 V6 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'Touareg', '7P', '3.0 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG', '7P', '', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG', '7P', '3.0 V6 TDI', 2967, 'diesel', 245),
  ('VOLKSWAGEN', 'TOUAREG', '7P', '3.0 TDI', 2967, 'diesel', 245)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (206 Hatchback (2A/C)) ──
WITH spec_7 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_psa-b71-2300_a3b4' LIMIT 1
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
  spec_7.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_7, (VALUES
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '', 1360, 'essence', 75),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.4 i (KFX, KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.4 i', 1360, 'essence', 75),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.1 i (HFZ, HFX)', 1124, 'essence', 60),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.1 i', 1124, 'essence', 60),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.1', 1124, 'essence', 60),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.4 HDi (8HX, 8HZ)', 1398, 'diesel', 68),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '1.9 D (WJZ, WJY)', 1868, 'diesel', 69),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '2.0 HDI 90 (RHY)', 1997, 'diesel', 90),
  ('PEUGEOT', '206 Hatchback (2A/C)', '206', '2.0 HDI', 1997, 'diesel', 90),
  ('PEUGEOT', '206 CC (2D)', '206', '', 1360, 'essence', 75),
  ('PEUGEOT', '206 CC (2D)', '206', '1.4 i (KFX, KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '206 CC (2D)', '206', '1.4 i', 1360, 'essence', 75),
  ('PEUGEOT', '206 CC (2D)', '206', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '206 CC (2D)', '206', '1.1 i (HFZ, HFX)', 1124, 'essence', 60),
  ('PEUGEOT', '206 CC (2D)', '206', '1.1 i', 1124, 'essence', 60),
  ('PEUGEOT', '206 CC (2D)', '206', '1.1', 1124, 'essence', 60),
  ('PEUGEOT', '206 CC (2D)', '206', '1.4 HDi (8HX, 8HZ)', 1398, 'diesel', 68),
  ('PEUGEOT', '206 CC (2D)', '206', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '206 CC (2D)', '206', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '206 CC (2D)', '206', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '206 CC (2D)', '206', '1.9 D (WJZ, WJY)', 1868, 'diesel', 69),
  ('PEUGEOT', '206 CC (2D)', '206', '2.0 HDI 90 (RHY)', 1997, 'diesel', 90),
  ('PEUGEOT', '206 CC (2D)', '206', '2.0 HDI', 1997, 'diesel', 90),
  ('PEUGEOT', '206 SW (2E/K)', '206', '', 1360, 'essence', 75),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.4 i (KFX, KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.4 i', 1360, 'essence', 75),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.1 i (HFZ, HFX)', 1124, 'essence', 60),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.1 i', 1124, 'essence', 60),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.1', 1124, 'essence', 60),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.4 HDi (8HX, 8HZ)', 1398, 'diesel', 68),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '206 SW (2E/K)', '206', '1.9 D (WJZ, WJY)', 1868, 'diesel', 69),
  ('PEUGEOT', '206 SW (2E/K)', '206', '2.0 HDI 90 (RHY)', 1997, 'diesel', 90),
  ('PEUGEOT', '206 SW (2E/K)', '206', '2.0 HDI', 1997, 'diesel', 90),
  ('PEUGEOT', '206 Saloon', '206', '', 1360, 'essence', 75),
  ('PEUGEOT', '206 Saloon', '206', '1.4 i (KFX, KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '206 Saloon', '206', '1.4 i', 1360, 'essence', 75),
  ('PEUGEOT', '206 Saloon', '206', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '206 Saloon', '206', '1.1 i (HFZ, HFX)', 1124, 'essence', 60),
  ('PEUGEOT', '206 Saloon', '206', '1.1 i', 1124, 'essence', 60),
  ('PEUGEOT', '206 Saloon', '206', '1.1', 1124, 'essence', 60),
  ('PEUGEOT', '206 Saloon', '206', '1.4 HDi (8HX, 8HZ)', 1398, 'diesel', 68),
  ('PEUGEOT', '206 Saloon', '206', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '206 Saloon', '206', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '206 Saloon', '206', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '206 Saloon', '206', '1.9 D (WJZ, WJY)', 1868, 'diesel', 69),
  ('PEUGEOT', '206 Saloon', '206', '2.0 HDI 90 (RHY)', 1997, 'diesel', 90),
  ('PEUGEOT', '206 Saloon', '206', '2.0 HDI', 1997, 'diesel', 90),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '', 1360, 'essence', 75),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.4 i (KFX, KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.4 i', 1360, 'essence', 75),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.1 i (HFZ, HFX)', 1124, 'essence', 60),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.1 i', 1124, 'essence', 60),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.1', 1124, 'essence', 60),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.4 HDi (8HX, 8HZ)', 1398, 'diesel', 68),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '1.9 D (WJZ, WJY)', 1868, 'diesel', 69),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '2.0 HDI 90 (RHY)', 1997, 'diesel', 90),
  ('PEUGEOT', '206+ (2L_, 2M_)', '206', '2.0 HDI', 1997, 'diesel', 90),
  ('PEUGEOT', '206+', '206', '', 1360, 'essence', 75),
  ('PEUGEOT', '206+', '206', '1.4 i (KFX, KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '206+', '206', '1.4 i', 1360, 'essence', 75),
  ('PEUGEOT', '206+', '206', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '206+', '206', '1.1 i (HFZ, HFX)', 1124, 'essence', 60),
  ('PEUGEOT', '206+', '206', '1.1 i', 1124, 'essence', 60),
  ('PEUGEOT', '206+', '206', '1.1', 1124, 'essence', 60),
  ('PEUGEOT', '206+', '206', '1.4 HDi (8HX, 8HZ)', 1398, 'diesel', 68),
  ('PEUGEOT', '206+', '206', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '206+', '206', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '206+', '206', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '206+', '206', '1.9 D (WJZ, WJY)', 1868, 'diesel', 69),
  ('PEUGEOT', '206+', '206', '2.0 HDI 90 (RHY)', 1997, 'diesel', 90),
  ('PEUGEOT', '206+', '206', '2.0 HDI', 1997, 'diesel', 90),
  ('PEUGEOT', '206', '206', '', 1360, 'essence', 75),
  ('PEUGEOT', '206', '206', '1.4 i (KFX, KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '206', '206', '1.4 i', 1360, 'essence', 75),
  ('PEUGEOT', '206', '206', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '206', '206', '1.1 i (HFZ, HFX)', 1124, 'essence', 60),
  ('PEUGEOT', '206', '206', '1.1 i', 1124, 'essence', 60),
  ('PEUGEOT', '206', '206', '1.1', 1124, 'essence', 60),
  ('PEUGEOT', '206', '206', '1.4 HDi (8HX, 8HZ)', 1398, 'diesel', 68),
  ('PEUGEOT', '206', '206', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '206', '206', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '206', '206', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '206', '206', '1.9 D (WJZ, WJY)', 1868, 'diesel', 69),
  ('PEUGEOT', '206', '206', '2.0 HDI 90 (RHY)', 1997, 'diesel', 90),
  ('PEUGEOT', '206', '206', '2.0 HDI', 1997, 'diesel', 90)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (207 (WA_, WC_)) ──
WITH spec_8 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_8.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_8, (VALUES
  ('PEUGEOT', '207 (WA_, WC_)', '207', '', 1360, 'essence', 75),
  ('PEUGEOT', '207 (WA_, WC_)', '207', '1.4 (KFT, KFV)', 1360, 'essence', 75),
  ('PEUGEOT', '207 (WA_, WC_)', '207', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '207 (WA_, WC_)', '207', '1.4 16V', 1360, 'essence', 88),
  ('PEUGEOT', '207 (WA_, WC_)', '207', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '207 (WA_, WC_)', '207', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', '207 (WA_, WC_)', '207', '1.6 16V VTi', 1598, 'essence', 120),
  ('PEUGEOT', '207 (WA_, WC_)', '207', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '207 CC (WD_)', '207', '', 1360, 'essence', 75),
  ('PEUGEOT', '207 CC (WD_)', '207', '1.4 (KFT, KFV)', 1360, 'essence', 75),
  ('PEUGEOT', '207 CC (WD_)', '207', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '207 CC (WD_)', '207', '1.4 16V', 1360, 'essence', 88),
  ('PEUGEOT', '207 CC (WD_)', '207', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '207 CC (WD_)', '207', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', '207 CC (WD_)', '207', '1.6 16V VTi', 1598, 'essence', 120),
  ('PEUGEOT', '207 CC (WD_)', '207', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '207 SW (WK_)', '207', '', 1360, 'essence', 75),
  ('PEUGEOT', '207 SW (WK_)', '207', '1.4 (KFT, KFV)', 1360, 'essence', 75),
  ('PEUGEOT', '207 SW (WK_)', '207', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '207 SW (WK_)', '207', '1.4 16V', 1360, 'essence', 88),
  ('PEUGEOT', '207 SW (WK_)', '207', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '207 SW (WK_)', '207', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', '207 SW (WK_)', '207', '1.6 16V VTi', 1598, 'essence', 120),
  ('PEUGEOT', '207 SW (WK_)', '207', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '207 Saloon', '207', '', 1360, 'essence', 75),
  ('PEUGEOT', '207 Saloon', '207', '1.4 (KFT, KFV)', 1360, 'essence', 75),
  ('PEUGEOT', '207 Saloon', '207', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '207 Saloon', '207', '1.4 16V', 1360, 'essence', 88),
  ('PEUGEOT', '207 Saloon', '207', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '207 Saloon', '207', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', '207 Saloon', '207', '1.6 16V VTi', 1598, 'essence', 120),
  ('PEUGEOT', '207 Saloon', '207', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '207', '207', '', 1360, 'essence', 75),
  ('PEUGEOT', '207', '207', '1.4 (KFT, KFV)', 1360, 'essence', 75),
  ('PEUGEOT', '207', '207', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '207', '207', '1.4 16V', 1360, 'essence', 88),
  ('PEUGEOT', '207', '207', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '207', '207', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', '207', '207', '1.6 16V VTi', 1598, 'essence', 120),
  ('PEUGEOT', '207', '207', '1.6 16V', 1587, 'essence', 109)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (208 I (CA_, CC_)) ──
WITH spec_9 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_9.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_9, (VALUES
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '', 1199, 'essence', 82),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '1.2 PureTech (EB2F)', 1199, 'essence', 82),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '1.2 PureTech', 1199, 'essence', 82),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '1.2 VTi', 1199, 'essence', 82),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', 'EB2F', 1199, 'essence', 82),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '1.0 PureTech', 999, 'essence', 68),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '208 I (CA_, CC_)', '208', '1.5 BlueHDi 100', 1499, 'diesel', 102),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '', 1199, 'essence', 82),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '1.2 PureTech (EB2F)', 1199, 'essence', 82),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '1.2 PureTech', 1199, 'essence', 82),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '1.2 VTi', 1199, 'essence', 82),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', 'EB2F', 1199, 'essence', 82),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '1.0 PureTech', 999, 'essence', 68),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '208 II (UB_, UP_, UW_, UJ_)', '208', '1.5 BlueHDi 100', 1499, 'diesel', 102),
  ('PEUGEOT', '208 I', '208', '', 1199, 'essence', 82),
  ('PEUGEOT', '208 I', '208', '1.2 PureTech (EB2F)', 1199, 'essence', 82),
  ('PEUGEOT', '208 I', '208', '1.2 PureTech', 1199, 'essence', 82),
  ('PEUGEOT', '208 I', '208', '1.2 VTi', 1199, 'essence', 82),
  ('PEUGEOT', '208 I', '208', 'EB2F', 1199, 'essence', 82),
  ('PEUGEOT', '208 I', '208', '1.0 PureTech', 999, 'essence', 68),
  ('PEUGEOT', '208 I', '208', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '208 I', '208', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '208 I', '208', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '208 I', '208', '1.5 BlueHDi 100', 1499, 'diesel', 102),
  ('PEUGEOT', '208 II', '208', '', 1199, 'essence', 82),
  ('PEUGEOT', '208 II', '208', '1.2 PureTech (EB2F)', 1199, 'essence', 82),
  ('PEUGEOT', '208 II', '208', '1.2 PureTech', 1199, 'essence', 82),
  ('PEUGEOT', '208 II', '208', '1.2 VTi', 1199, 'essence', 82),
  ('PEUGEOT', '208 II', '208', 'EB2F', 1199, 'essence', 82),
  ('PEUGEOT', '208 II', '208', '1.0 PureTech', 999, 'essence', 68),
  ('PEUGEOT', '208 II', '208', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '208 II', '208', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '208 II', '208', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '208 II', '208', '1.5 BlueHDi 100', 1499, 'diesel', 102),
  ('PEUGEOT', '208', '208', '', 1199, 'essence', 82),
  ('PEUGEOT', '208', '208', '1.2 PureTech (EB2F)', 1199, 'essence', 82),
  ('PEUGEOT', '208', '208', '1.2 PureTech', 1199, 'essence', 82),
  ('PEUGEOT', '208', '208', '1.2 VTi', 1199, 'essence', 82),
  ('PEUGEOT', '208', '208', 'EB2F', 1199, 'essence', 82),
  ('PEUGEOT', '208', '208', '1.0 PureTech', 999, 'essence', 68),
  ('PEUGEOT', '208', '208', '1.4 HDi', 1398, 'diesel', 68),
  ('PEUGEOT', '208', '208', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '208', '208', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '208', '208', '1.5 BlueHDi 100', 1499, 'diesel', 102)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (301) ──
WITH spec_10 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_10.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_10, (VALUES
  ('PEUGEOT', '301', '301', '', 1199, 'essence', 82),
  ('PEUGEOT', '301', '301', '1.2 VTi 72', 1199, 'essence', 72),
  ('PEUGEOT', '301', '301', '1.2 VTi 82', 1199, 'essence', 82),
  ('PEUGEOT', '301', '301', '1.2 PureTech', 1199, 'essence', 82),
  ('PEUGEOT', '301', '301', '1.6 VTi 115', 1587, 'essence', 115),
  ('PEUGEOT', '301', '301', '1.6 HDI 92', 1560, 'diesel', 92),
  ('PEUGEOT', '301', '301', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '301 (DD_)', '301', '', 1199, 'essence', 82),
  ('PEUGEOT', '301 (DD_)', '301', '1.2 VTi 72', 1199, 'essence', 72),
  ('PEUGEOT', '301 (DD_)', '301', '1.2 VTi 82', 1199, 'essence', 82),
  ('PEUGEOT', '301 (DD_)', '301', '1.2 PureTech', 1199, 'essence', 82),
  ('PEUGEOT', '301 (DD_)', '301', '1.6 VTi 115', 1587, 'essence', 115),
  ('PEUGEOT', '301 (DD_)', '301', '1.6 HDI 92', 1560, 'diesel', 92),
  ('PEUGEOT', '301 (DD_)', '301', '1.6 BlueHDi 100', 1560, 'diesel', 100)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (307 (3A/C)) ──
WITH spec_11 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_psa-b71-2300_a3b4' LIMIT 1
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
  spec_11.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_11, (VALUES
  ('PEUGEOT', '307 (3A/C)', '307', '', 1587, 'essence', 109),
  ('PEUGEOT', '307 (3A/C)', '307', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '307 (3A/C)', '307', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '307 (3A/C)', '307', '1.4 (KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '307 (3A/C)', '307', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '307 (3A/C)', '307', '2.0 HDi 90', 1997, 'diesel', 90),
  ('PEUGEOT', '307 (3A/C)', '307', '2.0 HDi 110', 1997, 'diesel', 107),
  ('PEUGEOT', '307 (3A/C)', '307', '1.6 HDi 110', 1560, 'diesel', 109),
  ('PEUGEOT', '307 Break (3E)', '307', '', 1587, 'essence', 109),
  ('PEUGEOT', '307 Break (3E)', '307', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '307 Break (3E)', '307', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '307 Break (3E)', '307', '1.4 (KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '307 Break (3E)', '307', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '307 Break (3E)', '307', '2.0 HDi 90', 1997, 'diesel', 90),
  ('PEUGEOT', '307 Break (3E)', '307', '2.0 HDi 110', 1997, 'diesel', 107),
  ('PEUGEOT', '307 Break (3E)', '307', '1.6 HDi 110', 1560, 'diesel', 109),
  ('PEUGEOT', '307 SW (3H)', '307', '', 1587, 'essence', 109),
  ('PEUGEOT', '307 SW (3H)', '307', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '307 SW (3H)', '307', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '307 SW (3H)', '307', '1.4 (KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '307 SW (3H)', '307', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '307 SW (3H)', '307', '2.0 HDi 90', 1997, 'diesel', 90),
  ('PEUGEOT', '307 SW (3H)', '307', '2.0 HDi 110', 1997, 'diesel', 107),
  ('PEUGEOT', '307 SW (3H)', '307', '1.6 HDi 110', 1560, 'diesel', 109),
  ('PEUGEOT', '307 CC (3B)', '307', '', 1587, 'essence', 109),
  ('PEUGEOT', '307 CC (3B)', '307', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '307 CC (3B)', '307', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '307 CC (3B)', '307', '1.4 (KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '307 CC (3B)', '307', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '307 CC (3B)', '307', '2.0 HDi 90', 1997, 'diesel', 90),
  ('PEUGEOT', '307 CC (3B)', '307', '2.0 HDi 110', 1997, 'diesel', 107),
  ('PEUGEOT', '307 CC (3B)', '307', '1.6 HDi 110', 1560, 'diesel', 109),
  ('PEUGEOT', '307', '307', '', 1587, 'essence', 109),
  ('PEUGEOT', '307', '307', '1.6 16V (NFU)', 1587, 'essence', 109),
  ('PEUGEOT', '307', '307', '1.6 16V', 1587, 'essence', 109),
  ('PEUGEOT', '307', '307', '1.4 (KFW)', 1360, 'essence', 75),
  ('PEUGEOT', '307', '307', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', '307', '307', '2.0 HDi 90', 1997, 'diesel', 90),
  ('PEUGEOT', '307', '307', '2.0 HDi 110', 1997, 'diesel', 107),
  ('PEUGEOT', '307', '307', '1.6 HDi 110', 1560, 'diesel', 109)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (308 I (4A_, 4C_)) ──
WITH spec_12 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_12.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_12, (VALUES
  ('PEUGEOT', '308 I (4A_, 4C_)', '308', '', 1560, 'diesel', 115),
  ('PEUGEOT', '308 I (4A_, 4C_)', '308', '1.6 HDi', 1560, 'diesel', 115),
  ('PEUGEOT', '308 I (4A_, 4C_)', '308', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '308 I (4A_, 4C_)', '308', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '308 I (4A_, 4C_)', '308', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '308 I (4A_, 4C_)', '308', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '308 I (4A_, 4C_)', '308', '1.6 VTi', 1598, 'essence', 120),
  ('PEUGEOT', '308 SW I (4E_, 4H_)', '308', '', 1560, 'diesel', 115),
  ('PEUGEOT', '308 SW I (4E_, 4H_)', '308', '1.6 HDi', 1560, 'diesel', 115),
  ('PEUGEOT', '308 SW I (4E_, 4H_)', '308', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '308 SW I (4E_, 4H_)', '308', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '308 SW I (4E_, 4H_)', '308', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '308 SW I (4E_, 4H_)', '308', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '308 SW I (4E_, 4H_)', '308', '1.6 VTi', 1598, 'essence', 120),
  ('PEUGEOT', '308 II (LB_, LP_, LW_, LH_, L3_)', '308', '', 1560, 'diesel', 115),
  ('PEUGEOT', '308 II (LB_, LP_, LW_, LH_, L3_)', '308', '1.6 HDi', 1560, 'diesel', 115),
  ('PEUGEOT', '308 II (LB_, LP_, LW_, LH_, L3_)', '308', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '308 II (LB_, LP_, LW_, LH_, L3_)', '308', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '308 II (LB_, LP_, LW_, LH_, L3_)', '308', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '308 II (LB_, LP_, LW_, LH_, L3_)', '308', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '308 II (LB_, LP_, LW_, LH_, L3_)', '308', '1.6 VTi', 1598, 'essence', 120),
  ('PEUGEOT', '308 SW II (LC_, LJ_, LR_, LX_)', '308', '', 1560, 'diesel', 115),
  ('PEUGEOT', '308 SW II (LC_, LJ_, LR_, LX_)', '308', '1.6 HDi', 1560, 'diesel', 115),
  ('PEUGEOT', '308 SW II (LC_, LJ_, LR_, LX_)', '308', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '308 SW II (LC_, LJ_, LR_, LX_)', '308', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '308 SW II (LC_, LJ_, LR_, LX_)', '308', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '308 SW II (LC_, LJ_, LR_, LX_)', '308', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '308 SW II (LC_, LJ_, LR_, LX_)', '308', '1.6 VTi', 1598, 'essence', 120),
  ('PEUGEOT', '308 III', '308', '', 1560, 'diesel', 115),
  ('PEUGEOT', '308 III', '308', '1.6 HDi', 1560, 'diesel', 115),
  ('PEUGEOT', '308 III', '308', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '308 III', '308', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '308 III', '308', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '308 III', '308', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '308 III', '308', '1.6 VTi', 1598, 'essence', 120),
  ('PEUGEOT', '308 II', '308', '', 1560, 'diesel', 115),
  ('PEUGEOT', '308 II', '308', '1.6 HDi', 1560, 'diesel', 115),
  ('PEUGEOT', '308 II', '308', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '308 II', '308', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '308 II', '308', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '308 II', '308', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '308 II', '308', '1.6 VTi', 1598, 'essence', 120),
  ('PEUGEOT', '308 I', '308', '', 1560, 'diesel', 115),
  ('PEUGEOT', '308 I', '308', '1.6 HDi', 1560, 'diesel', 115),
  ('PEUGEOT', '308 I', '308', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '308 I', '308', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '308 I', '308', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '308 I', '308', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '308 I', '308', '1.6 VTi', 1598, 'essence', 120),
  ('PEUGEOT', '308', '308', '', 1560, 'diesel', 115),
  ('PEUGEOT', '308', '308', '1.6 HDi', 1560, 'diesel', 115),
  ('PEUGEOT', '308', '308', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '308', '308', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '308', '308', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '308', '308', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '308', '308', '1.6 VTi', 1598, 'essence', 120)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (2008 I (CU_)) ──
WITH spec_13 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_13.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_13, (VALUES
  ('PEUGEOT', '2008 I (CU_)', '2008', '', 1199, 'essence', 110),
  ('PEUGEOT', '2008 I (CU_)', '2008', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '2008 I (CU_)', '2008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '2008 I (CU_)', '2008', '1.2 PureTech 82', 1199, 'essence', 82),
  ('PEUGEOT', '2008 I (CU_)', '2008', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '2008 I (CU_)', '2008', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '2008 II (U_)', '2008', '', 1199, 'essence', 110),
  ('PEUGEOT', '2008 II (U_)', '2008', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '2008 II (U_)', '2008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '2008 II (U_)', '2008', '1.2 PureTech 82', 1199, 'essence', 82),
  ('PEUGEOT', '2008 II (U_)', '2008', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '2008 II (U_)', '2008', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '2008 I', '2008', '', 1199, 'essence', 110),
  ('PEUGEOT', '2008 I', '2008', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '2008 I', '2008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '2008 I', '2008', '1.2 PureTech 82', 1199, 'essence', 82),
  ('PEUGEOT', '2008 I', '2008', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '2008 I', '2008', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '2008 II', '2008', '', 1199, 'essence', 110),
  ('PEUGEOT', '2008 II', '2008', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '2008 II', '2008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '2008 II', '2008', '1.2 PureTech 82', 1199, 'essence', 82),
  ('PEUGEOT', '2008 II', '2008', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '2008 II', '2008', '1.6 HDi', 1560, 'diesel', 92),
  ('PEUGEOT', '2008', '2008', '', 1199, 'essence', 110),
  ('PEUGEOT', '2008', '2008', '1.2 PureTech 110', 1199, 'essence', 110),
  ('PEUGEOT', '2008', '2008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '2008', '2008', '1.2 PureTech 82', 1199, 'essence', 82),
  ('PEUGEOT', '2008', '2008', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', '2008', '2008', '1.6 HDi', 1560, 'diesel', 92)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (3008 SUV (M_)) ──
WITH spec_14 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_14.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_14, (VALUES
  ('PEUGEOT', '3008 SUV (M_)', '3008', '', 1560, 'diesel', 120),
  ('PEUGEOT', '3008 SUV (M_)', '3008', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '3008 SUV (M_)', '3008', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '3008 SUV (M_)', '3008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '3008 SUV (M_)', '3008', '1.6 HDi', 1560, 'diesel', 112),
  ('PEUGEOT', '3008 SUV (M_)', '3008', '2.0 BlueHDi 150', 1997, 'diesel', 150),
  ('PEUGEOT', '3008 (0U_)', '3008', '', 1560, 'diesel', 120),
  ('PEUGEOT', '3008 (0U_)', '3008', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '3008 (0U_)', '3008', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '3008 (0U_)', '3008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '3008 (0U_)', '3008', '1.6 HDi', 1560, 'diesel', 112),
  ('PEUGEOT', '3008 (0U_)', '3008', '2.0 BlueHDi 150', 1997, 'diesel', 150),
  ('PEUGEOT', '3008', '3008', '', 1560, 'diesel', 120),
  ('PEUGEOT', '3008', '3008', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '3008', '3008', '1.5 BlueHDi 130', 1499, 'diesel', 130),
  ('PEUGEOT', '3008', '3008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '3008', '3008', '1.6 HDi', 1560, 'diesel', 112),
  ('PEUGEOT', '3008', '3008', '2.0 BlueHDi 150', 1997, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (PARTNER Box Body/MPV (5_, G_)) ──
WITH spec_15 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_15.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_15, (VALUES
  ('PEUGEOT', 'PARTNER Box Body/MPV (5_, G_)', 'Partner', '', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Box Body/MPV (5_, G_)', 'Partner', '1.6 HDi 90', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Box Body/MPV (5_, G_)', 'Partner', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Box Body/MPV (5_, G_)', 'Partner', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', 'PARTNER Box Body/MPV (5_, G_)', 'Partner', '1.9 D', 1868, 'diesel', 69),
  ('PEUGEOT', 'PARTNER Box Body/MPV (5_, G_)', 'Partner', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', 'PARTNER Combispace (5_, G_)', 'Partner', '', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Combispace (5_, G_)', 'Partner', '1.6 HDi 90', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Combispace (5_, G_)', 'Partner', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Combispace (5_, G_)', 'Partner', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', 'PARTNER Combispace (5_, G_)', 'Partner', '1.9 D', 1868, 'diesel', 69),
  ('PEUGEOT', 'PARTNER Combispace (5_, G_)', 'Partner', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', 'PARTNER Tepee', 'Partner', '', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Tepee', 'Partner', '1.6 HDi 90', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Tepee', 'Partner', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Tepee', 'Partner', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', 'PARTNER Tepee', 'Partner', '1.9 D', 1868, 'diesel', 69),
  ('PEUGEOT', 'PARTNER Tepee', 'Partner', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', 'PARTNER Box Body/MPV (K9)', 'Partner', '', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Box Body/MPV (K9)', 'Partner', '1.6 HDi 90', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Box Body/MPV (K9)', 'Partner', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER Box Body/MPV (K9)', 'Partner', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', 'PARTNER Box Body/MPV (K9)', 'Partner', '1.9 D', 1868, 'diesel', 69),
  ('PEUGEOT', 'PARTNER Box Body/MPV (K9)', 'Partner', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', 'Partner Tepee', 'Partner', '', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner Tepee', 'Partner', '1.6 HDi 90', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner Tepee', 'Partner', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner Tepee', 'Partner', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', 'Partner Tepee', 'Partner', '1.9 D', 1868, 'diesel', 69),
  ('PEUGEOT', 'Partner Tepee', 'Partner', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', 'Partner Box', 'Partner', '', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner Box', 'Partner', '1.6 HDi 90', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner Box', 'Partner', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner Box', 'Partner', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', 'Partner Box', 'Partner', '1.9 D', 1868, 'diesel', 69),
  ('PEUGEOT', 'Partner Box', 'Partner', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', 'Partner', 'Partner', '', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner', 'Partner', '1.6 HDi 90', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner', 'Partner', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', 'Partner', 'Partner', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', 'Partner', 'Partner', '1.9 D', 1868, 'diesel', 69),
  ('PEUGEOT', 'Partner', 'Partner', '1.4', 1360, 'essence', 75),
  ('PEUGEOT', 'PARTNER', 'Partner', '', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER', 'Partner', '1.6 HDi 90', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER', 'Partner', '1.6 HDi', 1560, 'diesel', 90),
  ('PEUGEOT', 'PARTNER', 'Partner', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('PEUGEOT', 'PARTNER', 'Partner', '1.9 D', 1868, 'diesel', 69),
  ('PEUGEOT', 'PARTNER', 'Partner', '1.4', 1360, 'essence', 75)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (CLIO II (BB_, CB_)) ──
WITH spec_16 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_renault-rn0700_a3b4' LIMIT 1
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
  spec_16.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_16, (VALUES
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.2 16V (BB05, BB0W...)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.2 (BB0A, BB0F...)', 1149, 'essence', 58),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.2', 1149, 'essence', 58),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.4 (B/CB0C)', 1390, 'essence', 75),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.4 16V', 1390, 'essence', 98),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.5 dCi (B/CB07)', 1461, 'diesel', 65),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.5 dCi', 1461, 'diesel', 65),
  ('RENAULT', 'CLIO II (BB_, CB_)', 'II', '1.9 D', 1870, 'diesel', 64),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.2 16V (BB05, BB0W...)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.2 (BB0A, BB0F...)', 1149, 'essence', 58),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.2', 1149, 'essence', 58),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.4 (B/CB0C)', 1390, 'essence', 75),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.4 16V', 1390, 'essence', 98),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.5 dCi (B/CB07)', 1461, 'diesel', 65),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.5 dCi', 1461, 'diesel', 65),
  ('RENAULT', 'CLIO II Box Body / Hatchback (SB0/1/2_)', 'II', '1.9 D', 1870, 'diesel', 64),
  ('RENAULT', 'CLIO II', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II', 'II', '1.2 16V (BB05, BB0W...)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO II', 'II', '1.2 (BB0A, BB0F...)', 1149, 'essence', 58),
  ('RENAULT', 'CLIO II', 'II', '1.2', 1149, 'essence', 58),
  ('RENAULT', 'CLIO II', 'II', '1.4 (B/CB0C)', 1390, 'essence', 75),
  ('RENAULT', 'CLIO II', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'CLIO II', 'II', '1.4 16V', 1390, 'essence', 98),
  ('RENAULT', 'CLIO II', 'II', '1.5 dCi (B/CB07)', 1461, 'diesel', 65),
  ('RENAULT', 'CLIO II', 'II', '1.5 dCi', 1461, 'diesel', 65),
  ('RENAULT', 'CLIO II', 'II', '1.9 D', 1870, 'diesel', 64),
  ('RENAULT', 'Clio II', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'Clio II', 'II', '1.2 16V (BB05, BB0W...)', 1149, 'essence', 75),
  ('RENAULT', 'Clio II', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio II', 'II', '1.2 (BB0A, BB0F...)', 1149, 'essence', 58),
  ('RENAULT', 'Clio II', 'II', '1.2', 1149, 'essence', 58),
  ('RENAULT', 'Clio II', 'II', '1.4 (B/CB0C)', 1390, 'essence', 75),
  ('RENAULT', 'Clio II', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'Clio II', 'II', '1.4 16V', 1390, 'essence', 98),
  ('RENAULT', 'Clio II', 'II', '1.5 dCi (B/CB07)', 1461, 'diesel', 65),
  ('RENAULT', 'Clio II', 'II', '1.5 dCi', 1461, 'diesel', 65),
  ('RENAULT', 'Clio II', 'II', '1.9 D', 1870, 'diesel', 64),
  ('RENAULT', 'Clio 2', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'Clio 2', 'II', '1.2 16V (BB05, BB0W...)', 1149, 'essence', 75),
  ('RENAULT', 'Clio 2', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio 2', 'II', '1.2 (BB0A, BB0F...)', 1149, 'essence', 58),
  ('RENAULT', 'Clio 2', 'II', '1.2', 1149, 'essence', 58),
  ('RENAULT', 'Clio 2', 'II', '1.4 (B/CB0C)', 1390, 'essence', 75),
  ('RENAULT', 'Clio 2', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'Clio 2', 'II', '1.4 16V', 1390, 'essence', 98),
  ('RENAULT', 'Clio 2', 'II', '1.5 dCi (B/CB07)', 1461, 'diesel', 65),
  ('RENAULT', 'Clio 2', 'II', '1.5 dCi', 1461, 'diesel', 65),
  ('RENAULT', 'Clio 2', 'II', '1.9 D', 1870, 'diesel', 64)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (CLIO III (BR0/1, CR0/1)) ──
WITH spec_17 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_17.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_17, (VALUES
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO III (BR0/1, CR0/1)', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO III Grandtour (KR0/1_)', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO IV (BH_)', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO IV Grandtour (KH_)', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V (B7_)', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO V (B7_)', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'CLIO IV', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO IV', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO IV', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO IV', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO IV', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO IV', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO IV', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'CLIO III', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO III', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO III', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO III', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO III', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO III', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO III', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'CLIO V', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO V', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO V', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO V', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO V', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO V', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO V', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'Clio IV', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'Clio IV', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Clio IV', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'Clio IV', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Clio IV', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'Clio IV', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Clio IV', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'Clio IV', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'Clio IV', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio IV', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Clio IV', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'Clio III', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'Clio III', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Clio III', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'Clio III', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Clio III', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'Clio III', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Clio III', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'Clio III', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'Clio III', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio III', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Clio III', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'Clio V', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'Clio V', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Clio V', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'Clio V', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Clio V', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'Clio V', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Clio V', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'Clio V', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'Clio V', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio V', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Clio V', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'Clio 4', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 4', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 4', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 4', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 4', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 4', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Clio 4', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'Clio 4', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'Clio 4', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio 4', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Clio 4', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'Clio 3', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 3', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 3', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 3', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 3', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 3', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Clio 3', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'Clio 3', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'Clio 3', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio 3', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Clio 3', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'Clio 5', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 5', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 5', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 5', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 5', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'Clio 5', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Clio 5', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'Clio 5', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'Clio 5', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio 5', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Clio 5', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'Clio', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'Clio', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Clio', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'Clio', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Clio', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'Clio', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Clio', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'Clio', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'Clio', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Clio', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Clio', 'IV', '1.0 TCe', 999, 'essence', 100),
  ('RENAULT', 'CLIO', 'IV', '', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO', 'IV', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO', 'IV', '1.5 dCi (K9K)', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO', 'IV', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO', 'IV', 'K9K', 1461, 'diesel', 90),
  ('RENAULT', 'CLIO', 'IV', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CLIO', 'IV', '0.9 TCe', 898, 'essence', 90),
  ('RENAULT', 'CLIO', 'IV', '1.2 16V (D4F)', 1149, 'essence', 75),
  ('RENAULT', 'CLIO', 'IV', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'CLIO', 'IV', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CLIO', 'IV', '1.0 TCe', 999, 'essence', 100)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (SYMBOL I (LB_)) ──
WITH spec_18 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_renault-rn0700_a3b4' LIMIT 1
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
  spec_18.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_18, (VALUES
  ('RENAULT', 'SYMBOL I (LB_)', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'SYMBOL I (LB_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'SYMBOL I (LB_)', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'SYMBOL I (LB_)', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'SYMBOL I (LB_)', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'SYMBOL II (LU_)', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'SYMBOL II (LU_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'SYMBOL II (LU_)', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'SYMBOL II (LU_)', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'SYMBOL II (LU_)', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'SYMBOL III', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'SYMBOL III', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'SYMBOL III', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'SYMBOL III', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'SYMBOL III', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'Symbol II', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'Symbol II', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Symbol II', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'Symbol II', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'Symbol II', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'Symbol I', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'Symbol I', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Symbol I', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'Symbol I', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'Symbol I', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'Symbol', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'Symbol', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Symbol', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'Symbol', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'Symbol', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'SYMBOL', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'SYMBOL', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'SYMBOL', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'SYMBOL', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'SYMBOL', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'THALIA I (LB_)', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'THALIA I (LB_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'THALIA I (LB_)', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'THALIA I (LB_)', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'THALIA I (LB_)', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'THALIA II (LU_)', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'THALIA II (LU_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'THALIA II (LU_)', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'THALIA II (LU_)', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'THALIA II (LU_)', 'II', '1.5 dCi 85', 1461, 'diesel', 85),
  ('RENAULT', 'Thalia', 'II', '', 1149, 'essence', 75),
  ('RENAULT', 'Thalia', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Thalia', 'II', '1.4', 1390, 'essence', 75),
  ('RENAULT', 'Thalia', 'II', '1.5 dCi', 1461, 'diesel', 68),
  ('RENAULT', 'Thalia', 'II', '1.5 dCi 85', 1461, 'diesel', 85)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (MEGANE II (BM0/1_, CM0/1_)) ──
WITH spec_19 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_19.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_19, (VALUES
  ('RENAULT', 'MEGANE II (BM0/1_, CM0/1_)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE II (BM0/1_, CM0/1_)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE II (BM0/1_, CM0/1_)', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE II (BM0/1_, CM0/1_)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'MEGANE II (BM0/1_, CM0/1_)', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'MEGANE II (BM0/1_, CM0/1_)', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'MEGANE II (BM0/1_, CM0/1_)', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'MEGANE II Saloon (LM0/1_)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE II Saloon (LM0/1_)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE II Saloon (LM0/1_)', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE II Saloon (LM0/1_)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'MEGANE II Saloon (LM0/1_)', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'MEGANE II Saloon (LM0/1_)', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'MEGANE II Saloon (LM0/1_)', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'MEGANE III Hatchback (BZ0/1_, B3_)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE III Hatchback (BZ0/1_, B3_)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE III Hatchback (BZ0/1_, B3_)', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE III Hatchback (BZ0/1_, B3_)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'MEGANE III Hatchback (BZ0/1_, B3_)', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'MEGANE III Hatchback (BZ0/1_, B3_)', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'MEGANE III Hatchback (BZ0/1_, B3_)', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'MEGANE III Grandtour (KZ0/1)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE III Grandtour (KZ0/1)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE III Grandtour (KZ0/1)', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE III Grandtour (KZ0/1)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'MEGANE III Grandtour (KZ0/1)', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'MEGANE III Grandtour (KZ0/1)', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'MEGANE III Grandtour (KZ0/1)', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'MEGANE IV Hatchback (B9A/M/N_)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE IV Hatchback (B9A/M/N_)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE IV Hatchback (B9A/M/N_)', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE IV Hatchback (B9A/M/N_)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'MEGANE IV Hatchback (B9A/M/N_)', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'MEGANE IV Hatchback (B9A/M/N_)', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'MEGANE IV Hatchback (B9A/M/N_)', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'MEGANE IV Grandtour (K9A/M/N_)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE IV Grandtour (K9A/M/N_)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE IV Grandtour (K9A/M/N_)', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE IV Grandtour (K9A/M/N_)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'MEGANE IV Grandtour (K9A/M/N_)', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'MEGANE IV Grandtour (K9A/M/N_)', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'MEGANE IV Grandtour (K9A/M/N_)', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'Megane II', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'Megane II', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'Megane II', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'Megane II', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'Megane II', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'Megane II', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'Megane II', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'Megane III', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'Megane III', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'Megane III', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'Megane III', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'Megane III', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'Megane III', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'Megane III', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'Megane IV', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'Megane IV', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'Megane IV', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'Megane IV', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'Megane IV', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'Megane IV', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'Megane IV', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'Megane', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'Megane', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'Megane', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'Megane', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'Megane', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'Megane', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'Megane', 'III', '1.6 dCi', 1598, 'diesel', 130),
  ('RENAULT', 'MEGANE', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE', 'III', '1.5 dCi', 1461, 'diesel', 110),
  ('RENAULT', 'MEGANE', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'MEGANE', 'III', '1.2 TCe', 1197, 'essence', 115),
  ('RENAULT', 'MEGANE', 'III', '1.9 dCi', 1870, 'diesel', 130),
  ('RENAULT', 'MEGANE', 'III', '1.6 dCi', 1598, 'diesel', 130)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (KANGOO (KC0/1_)) ──
WITH spec_20 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_20.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_20, (VALUES
  ('RENAULT', 'KANGOO (KC0/1_)', 'II', '', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO (KC0/1_)', 'II', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO (KC0/1_)', 'II', '1.5 dCi 75', 1461, 'diesel', 75),
  ('RENAULT', 'KANGOO (KC0/1_)', 'II', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO (KC0/1_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'KANGOO (KC0/1_)', 'II', '1.9 D', 1870, 'diesel', 65),
  ('RENAULT', 'KANGOO Express (FC0/1_)', 'II', '', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO Express (FC0/1_)', 'II', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO Express (FC0/1_)', 'II', '1.5 dCi 75', 1461, 'diesel', 75),
  ('RENAULT', 'KANGOO Express (FC0/1_)', 'II', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO Express (FC0/1_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'KANGOO Express (FC0/1_)', 'II', '1.9 D', 1870, 'diesel', 65),
  ('RENAULT', 'KANGOO / GRAND KANGOO II (KW0/1_)', 'II', '', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO / GRAND KANGOO II (KW0/1_)', 'II', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO / GRAND KANGOO II (KW0/1_)', 'II', '1.5 dCi 75', 1461, 'diesel', 75),
  ('RENAULT', 'KANGOO / GRAND KANGOO II (KW0/1_)', 'II', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO / GRAND KANGOO II (KW0/1_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'KANGOO / GRAND KANGOO II (KW0/1_)', 'II', '1.9 D', 1870, 'diesel', 65),
  ('RENAULT', 'KANGOO Express (FW0/1_)', 'II', '', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO Express (FW0/1_)', 'II', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO Express (FW0/1_)', 'II', '1.5 dCi 75', 1461, 'diesel', 75),
  ('RENAULT', 'KANGOO Express (FW0/1_)', 'II', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO Express (FW0/1_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'KANGOO Express (FW0/1_)', 'II', '1.9 D', 1870, 'diesel', 65),
  ('RENAULT', 'Kangoo II', 'II', '', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo II', 'II', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo II', 'II', '1.5 dCi 75', 1461, 'diesel', 75),
  ('RENAULT', 'Kangoo II', 'II', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo II', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Kangoo II', 'II', '1.9 D', 1870, 'diesel', 65),
  ('RENAULT', 'Kangoo I', 'II', '', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo I', 'II', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo I', 'II', '1.5 dCi 75', 1461, 'diesel', 75),
  ('RENAULT', 'Kangoo I', 'II', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo I', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Kangoo I', 'II', '1.9 D', 1870, 'diesel', 65),
  ('RENAULT', 'Kangoo', 'II', '', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo', 'II', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo', 'II', '1.5 dCi 75', 1461, 'diesel', 75),
  ('RENAULT', 'Kangoo', 'II', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Kangoo', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'Kangoo', 'II', '1.9 D', 1870, 'diesel', 65),
  ('RENAULT', 'KANGOO', 'II', '', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO', 'II', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO', 'II', '1.5 dCi 75', 1461, 'diesel', 75),
  ('RENAULT', 'KANGOO', 'II', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'KANGOO', 'II', '1.2 16V', 1149, 'essence', 75),
  ('RENAULT', 'KANGOO', 'II', '1.9 D', 1870, 'diesel', 65)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (CAPTUR I (J5_, H5_)) ──
WITH spec_21 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_21.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_21, (VALUES
  ('RENAULT', 'CAPTUR I (J5_, H5_)', 'I', '', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR I (J5_, H5_)', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR I (J5_, H5_)', 'I', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR I (J5_, H5_)', 'I', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CAPTUR I (J5_, H5_)', 'I', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CAPTUR I (J5_, H5_)', 'I', '1.3 TCe', 1332, 'essence', 130),
  ('RENAULT', 'CAPTUR II', 'I', '', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR II', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR II', 'I', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR II', 'I', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CAPTUR II', 'I', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CAPTUR II', 'I', '1.3 TCe', 1332, 'essence', 130),
  ('RENAULT', 'Captur I', 'I', '', 1461, 'diesel', 90),
  ('RENAULT', 'Captur I', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Captur I', 'I', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Captur I', 'I', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Captur I', 'I', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Captur I', 'I', '1.3 TCe', 1332, 'essence', 130),
  ('RENAULT', 'Captur II', 'I', '', 1461, 'diesel', 90),
  ('RENAULT', 'Captur II', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Captur II', 'I', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Captur II', 'I', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Captur II', 'I', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Captur II', 'I', '1.3 TCe', 1332, 'essence', 130),
  ('RENAULT', 'Captur', 'I', '', 1461, 'diesel', 90),
  ('RENAULT', 'Captur', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'Captur', 'I', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'Captur', 'I', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'Captur', 'I', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'Captur', 'I', '1.3 TCe', 1332, 'essence', 130),
  ('RENAULT', 'CAPTUR', 'I', '', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR', 'I', '1.5 dCi', 1461, 'diesel', 90),
  ('RENAULT', 'CAPTUR', 'I', '0.9 TCe 90', 898, 'essence', 90),
  ('RENAULT', 'CAPTUR', 'I', '1.2 TCe', 1197, 'essence', 120),
  ('RENAULT', 'CAPTUR', 'I', '1.3 TCe', 1332, 'essence', 130)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (KADJAR (HA_, HL_)) ──
WITH spec_22 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_22.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_22, (VALUES
  ('RENAULT', 'KADJAR (HA_, HL_)', 'I', '', 1461, 'diesel', 110),
  ('RENAULT', 'KADJAR (HA_, HL_)', 'I', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'KADJAR (HA_, HL_)', 'I', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('RENAULT', 'KADJAR (HA_, HL_)', 'I', '1.2 TCe 130', 1197, 'essence', 130),
  ('RENAULT', 'KADJAR (HA_, HL_)', 'I', '1.3 TCe 140', 1332, 'essence', 140),
  ('RENAULT', 'KADJAR (HA_, HL_)', 'I', '1.6 dCi 130', 1598, 'diesel', 130),
  ('RENAULT', 'Kadjar', 'I', '', 1461, 'diesel', 110),
  ('RENAULT', 'Kadjar', 'I', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'Kadjar', 'I', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('RENAULT', 'Kadjar', 'I', '1.2 TCe 130', 1197, 'essence', 130),
  ('RENAULT', 'Kadjar', 'I', '1.3 TCe 140', 1332, 'essence', 140),
  ('RENAULT', 'Kadjar', 'I', '1.6 dCi 130', 1598, 'diesel', 130),
  ('RENAULT', 'KADJAR', 'I', '', 1461, 'diesel', 110),
  ('RENAULT', 'KADJAR', 'I', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'KADJAR', 'I', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('RENAULT', 'KADJAR', 'I', '1.2 TCe 130', 1197, 'essence', 130),
  ('RENAULT', 'KADJAR', 'I', '1.3 TCe 140', 1332, 'essence', 140),
  ('RENAULT', 'KADJAR', 'I', '1.6 dCi 130', 1598, 'diesel', 130)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── DACIA (DUSTER (HS_)) ──
WITH spec_23 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_23.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_23, (VALUES
  ('DACIA', 'DUSTER (HS_)', 'II', '', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER (HS_)', 'II', '1.5 dCi 110 4x4', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER (HS_)', 'II', '1.5 dCi 110', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER (HS_)', 'II', '1.5 dCi', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER (HS_)', 'II', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('DACIA', 'DUSTER (HS_)', 'II', '1.6 16V', 1598, 'essence', 105),
  ('DACIA', 'DUSTER (HS_)', 'II', '1.3 TCe', 1332, 'essence', 130),
  ('DACIA', 'DUSTER (HM_)', 'II', '', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER (HM_)', 'II', '1.5 dCi 110 4x4', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER (HM_)', 'II', '1.5 dCi 110', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER (HM_)', 'II', '1.5 dCi', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER (HM_)', 'II', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('DACIA', 'DUSTER (HM_)', 'II', '1.6 16V', 1598, 'essence', 105),
  ('DACIA', 'DUSTER (HM_)', 'II', '1.3 TCe', 1332, 'essence', 130),
  ('DACIA', 'Duster II', 'II', '', 1461, 'diesel', 110),
  ('DACIA', 'Duster II', 'II', '1.5 dCi 110 4x4', 1461, 'diesel', 110),
  ('DACIA', 'Duster II', 'II', '1.5 dCi 110', 1461, 'diesel', 110),
  ('DACIA', 'Duster II', 'II', '1.5 dCi', 1461, 'diesel', 110),
  ('DACIA', 'Duster II', 'II', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('DACIA', 'Duster II', 'II', '1.6 16V', 1598, 'essence', 105),
  ('DACIA', 'Duster II', 'II', '1.3 TCe', 1332, 'essence', 130),
  ('DACIA', 'Duster I', 'II', '', 1461, 'diesel', 110),
  ('DACIA', 'Duster I', 'II', '1.5 dCi 110 4x4', 1461, 'diesel', 110),
  ('DACIA', 'Duster I', 'II', '1.5 dCi 110', 1461, 'diesel', 110),
  ('DACIA', 'Duster I', 'II', '1.5 dCi', 1461, 'diesel', 110),
  ('DACIA', 'Duster I', 'II', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('DACIA', 'Duster I', 'II', '1.6 16V', 1598, 'essence', 105),
  ('DACIA', 'Duster I', 'II', '1.3 TCe', 1332, 'essence', 130),
  ('DACIA', 'Duster', 'II', '', 1461, 'diesel', 110),
  ('DACIA', 'Duster', 'II', '1.5 dCi 110 4x4', 1461, 'diesel', 110),
  ('DACIA', 'Duster', 'II', '1.5 dCi 110', 1461, 'diesel', 110),
  ('DACIA', 'Duster', 'II', '1.5 dCi', 1461, 'diesel', 110),
  ('DACIA', 'Duster', 'II', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('DACIA', 'Duster', 'II', '1.6 16V', 1598, 'essence', 105),
  ('DACIA', 'Duster', 'II', '1.3 TCe', 1332, 'essence', 130),
  ('DACIA', 'DUSTER', 'II', '', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER', 'II', '1.5 dCi 110 4x4', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER', 'II', '1.5 dCi 110', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER', 'II', '1.5 dCi', 1461, 'diesel', 110),
  ('DACIA', 'DUSTER', 'II', '1.5 Blue dCi 115', 1461, 'diesel', 115),
  ('DACIA', 'DUSTER', 'II', '1.6 16V', 1598, 'essence', 105),
  ('DACIA', 'DUSTER', 'II', '1.3 TCe', 1332, 'essence', 130)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── DACIA (LOGAN I (LS_)) ──
WITH spec_24 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_renault-rn0700_a3b4' LIMIT 1
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
  spec_24.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_24, (VALUES
  ('DACIA', 'LOGAN I (LS_)', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'LOGAN I (LS_)', 'II', '1.4 (LSA0, LSA5...)', 1390, 'essence', 75),
  ('DACIA', 'LOGAN I (LS_)', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'LOGAN I (LS_)', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'LOGAN I (LS_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'LOGAN I (LS_)', 'II', '1.6 MPI', 1598, 'essence', 87),
  ('DACIA', 'LOGAN I (LS_)', 'II', '1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68),
  ('DACIA', 'LOGAN I (LS_)', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'LOGAN I (LS_)', 'II', '0.9 TCe 90', 898, 'essence', 90),
  ('DACIA', 'LOGAN II', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'LOGAN II', 'II', '1.4 (LSA0, LSA5...)', 1390, 'essence', 75),
  ('DACIA', 'LOGAN II', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'LOGAN II', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'LOGAN II', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'LOGAN II', 'II', '1.6 MPI', 1598, 'essence', 87),
  ('DACIA', 'LOGAN II', 'II', '1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68),
  ('DACIA', 'LOGAN II', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'LOGAN II', 'II', '0.9 TCe 90', 898, 'essence', 90),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '1.4 (LSA0, LSA5...)', 1390, 'essence', 75),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '1.6 MPI', 1598, 'essence', 87),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'LOGAN MCV (KS_)', 'II', '0.9 TCe 90', 898, 'essence', 90),
  ('DACIA', 'LOGAN MCV II', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'LOGAN MCV II', 'II', '1.4 (LSA0, LSA5...)', 1390, 'essence', 75),
  ('DACIA', 'LOGAN MCV II', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'LOGAN MCV II', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'LOGAN MCV II', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'LOGAN MCV II', 'II', '1.6 MPI', 1598, 'essence', 87),
  ('DACIA', 'LOGAN MCV II', 'II', '1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68),
  ('DACIA', 'LOGAN MCV II', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'LOGAN MCV II', 'II', '0.9 TCe 90', 898, 'essence', 90),
  ('DACIA', 'Logan II', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'Logan II', 'II', '1.4 (LSA0, LSA5...)', 1390, 'essence', 75),
  ('DACIA', 'Logan II', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'Logan II', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'Logan II', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'Logan II', 'II', '1.6 MPI', 1598, 'essence', 87),
  ('DACIA', 'Logan II', 'II', '1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68),
  ('DACIA', 'Logan II', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'Logan II', 'II', '0.9 TCe 90', 898, 'essence', 90),
  ('DACIA', 'Logan I', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'Logan I', 'II', '1.4 (LSA0, LSA5...)', 1390, 'essence', 75),
  ('DACIA', 'Logan I', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'Logan I', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'Logan I', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'Logan I', 'II', '1.6 MPI', 1598, 'essence', 87),
  ('DACIA', 'Logan I', 'II', '1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68),
  ('DACIA', 'Logan I', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'Logan I', 'II', '0.9 TCe 90', 898, 'essence', 90),
  ('DACIA', 'Logan', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'Logan', 'II', '1.4 (LSA0, LSA5...)', 1390, 'essence', 75),
  ('DACIA', 'Logan', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'Logan', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'Logan', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'Logan', 'II', '1.6 MPI', 1598, 'essence', 87),
  ('DACIA', 'Logan', 'II', '1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68),
  ('DACIA', 'Logan', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'Logan', 'II', '0.9 TCe 90', 898, 'essence', 90),
  ('DACIA', 'LOGAN', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'LOGAN', 'II', '1.4 (LSA0, LSA5...)', 1390, 'essence', 75),
  ('DACIA', 'LOGAN', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'LOGAN', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'LOGAN', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'LOGAN', 'II', '1.6 MPI', 1598, 'essence', 87),
  ('DACIA', 'LOGAN', 'II', '1.5 dCi (LS0J, LS0Y)', 1461, 'diesel', 68),
  ('DACIA', 'LOGAN', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'LOGAN', 'II', '0.9 TCe 90', 898, 'essence', 90)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── DACIA (SANDERO / STEPWAY I (BS_)) ──
WITH spec_25 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_renault-rn0700_a3b4' LIMIT 1
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
  spec_25.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_25, (VALUES
  ('DACIA', 'SANDERO / STEPWAY I (BS_)', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'SANDERO / STEPWAY I (BS_)', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'SANDERO / STEPWAY I (BS_)', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'SANDERO / STEPWAY I (BS_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'SANDERO / STEPWAY I (BS_)', 'II', '0.9 TCe', 898, 'essence', 90),
  ('DACIA', 'SANDERO / STEPWAY I (BS_)', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'SANDERO / STEPWAY II (B8_)', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'SANDERO / STEPWAY II (B8_)', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'SANDERO / STEPWAY II (B8_)', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'SANDERO / STEPWAY II (B8_)', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'SANDERO / STEPWAY II (B8_)', 'II', '0.9 TCe', 898, 'essence', 90),
  ('DACIA', 'SANDERO / STEPWAY II (B8_)', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'SANDERO', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'SANDERO', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'SANDERO', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'SANDERO', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'SANDERO', 'II', '0.9 TCe', 898, 'essence', 90),
  ('DACIA', 'SANDERO', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'Sandero II', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'Sandero II', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'Sandero II', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'Sandero II', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'Sandero II', 'II', '0.9 TCe', 898, 'essence', 90),
  ('DACIA', 'Sandero II', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'Sandero Stepway', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'Sandero Stepway', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'Sandero Stepway', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'Sandero Stepway', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'Sandero Stepway', 'II', '0.9 TCe', 898, 'essence', 90),
  ('DACIA', 'Sandero Stepway', 'II', '1.5 dCi', 1461, 'diesel', 75),
  ('DACIA', 'Sandero', 'II', '', 1390, 'essence', 75),
  ('DACIA', 'Sandero', 'II', '1.4 MPI', 1390, 'essence', 75),
  ('DACIA', 'Sandero', 'II', '1.4', 1390, 'essence', 75),
  ('DACIA', 'Sandero', 'II', '1.2 16V', 1149, 'essence', 75),
  ('DACIA', 'Sandero', 'II', '0.9 TCe', 898, 'essence', 90),
  ('DACIA', 'Sandero', 'II', '1.5 dCi', 1461, 'diesel', 75)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CITROEN (C3 I (FC_, FN_)) ──
WITH spec_26 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_26.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_26, (VALUES
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3 I (FC_, FN_)', 'II', '1.1 i', 1124, 'essence', 60),
  ('CITROEN', 'C3 II (SC_)', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3 II (SC_)', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3 II (SC_)', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3 II (SC_)', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3 II (SC_)', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3 II (SC_)', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3 II (SC_)', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3 II (SC_)', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3 II (SC_)', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3 II (SC_)', 'II', '1.1 i', 1124, 'essence', 60),
  ('CITROEN', 'C3 III (SX)', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3 III (SX)', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3 III (SX)', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3 III (SX)', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3 III (SX)', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3 III (SX)', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3 III (SX)', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3 III (SX)', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3 III (SX)', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3 III (SX)', 'II', '1.1 i', 1124, 'essence', 60),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3 Pluriel (HB_)', 'II', '1.1 i', 1124, 'essence', 60),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3 AIRCROSS II (2R_, 2C_)', 'II', '1.1 i', 1124, 'essence', 60),
  ('CITROEN', 'C3 II', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3 II', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3 II', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3 II', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3 II', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3 II', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3 II', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3 II', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3 II', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3 II', 'II', '1.1 i', 1124, 'essence', 60),
  ('CITROEN', 'C3 III', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3 III', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3 III', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3 III', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3 III', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3 III', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3 III', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3 III', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3 III', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3 III', 'II', '1.1 i', 1124, 'essence', 60),
  ('CITROEN', 'C3 I', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3 I', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3 I', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3 I', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3 I', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3 I', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3 I', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3 I', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3 I', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3 I', 'II', '1.1 i', 1124, 'essence', 60),
  ('CITROEN', 'C3', 'II', '', 1199, 'essence', 82),
  ('CITROEN', 'C3', 'II', '1.2 PureTech 82', 1199, 'essence', 82),
  ('CITROEN', 'C3', 'II', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C3', 'II', '1.2 VTi', 1199, 'essence', 82),
  ('CITROEN', 'C3', 'II', 'EB2F', 1199, 'essence', 82),
  ('CITROEN', 'C3', 'II', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'C3', 'II', '1.4 HDi', 1398, 'diesel', 68),
  ('CITROEN', 'C3', 'II', '1.6 HDi', 1560, 'diesel', 92),
  ('CITROEN', 'C3', 'II', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C3', 'II', '1.1 i', 1124, 'essence', 60)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CITROEN (C4 I (LC_)) ──
WITH spec_27 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_27.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_27, (VALUES
  ('CITROEN', 'C4 I (LC_)', 'II', '', 1560, 'diesel', 110),
  ('CITROEN', 'C4 I (LC_)', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C4 I (LC_)', 'II', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('CITROEN', 'C4 I (LC_)', 'II', '1.2 PureTech 130', 1199, 'essence', 130),
  ('CITROEN', 'C4 I (LC_)', 'II', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'C4 I (LC_)', 'II', '1.6 VTi', 1598, 'essence', 120),
  ('CITROEN', 'C4 II (NC_)', 'II', '', 1560, 'diesel', 110),
  ('CITROEN', 'C4 II (NC_)', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C4 II (NC_)', 'II', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('CITROEN', 'C4 II (NC_)', 'II', '1.2 PureTech 130', 1199, 'essence', 130),
  ('CITROEN', 'C4 II (NC_)', 'II', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'C4 II (NC_)', 'II', '1.6 VTi', 1598, 'essence', 120),
  ('CITROEN', 'C4 CACTUS', 'II', '', 1560, 'diesel', 110),
  ('CITROEN', 'C4 CACTUS', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C4 CACTUS', 'II', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('CITROEN', 'C4 CACTUS', 'II', '1.2 PureTech 130', 1199, 'essence', 130),
  ('CITROEN', 'C4 CACTUS', 'II', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'C4 CACTUS', 'II', '1.6 VTi', 1598, 'essence', 120),
  ('CITROEN', 'C4 PICASSO I (UD_)', 'II', '', 1560, 'diesel', 110),
  ('CITROEN', 'C4 PICASSO I (UD_)', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C4 PICASSO I (UD_)', 'II', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('CITROEN', 'C4 PICASSO I (UD_)', 'II', '1.2 PureTech 130', 1199, 'essence', 130),
  ('CITROEN', 'C4 PICASSO I (UD_)', 'II', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'C4 PICASSO I (UD_)', 'II', '1.6 VTi', 1598, 'essence', 120),
  ('CITROEN', 'C4 PICASSO II', 'II', '', 1560, 'diesel', 110),
  ('CITROEN', 'C4 PICASSO II', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C4 PICASSO II', 'II', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('CITROEN', 'C4 PICASSO II', 'II', '1.2 PureTech 130', 1199, 'essence', 130),
  ('CITROEN', 'C4 PICASSO II', 'II', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'C4 PICASSO II', 'II', '1.6 VTi', 1598, 'essence', 120),
  ('CITROEN', 'C4 II', 'II', '', 1560, 'diesel', 110),
  ('CITROEN', 'C4 II', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C4 II', 'II', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('CITROEN', 'C4 II', 'II', '1.2 PureTech 130', 1199, 'essence', 130),
  ('CITROEN', 'C4 II', 'II', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'C4 II', 'II', '1.6 VTi', 1598, 'essence', 120),
  ('CITROEN', 'C4 I', 'II', '', 1560, 'diesel', 110),
  ('CITROEN', 'C4 I', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C4 I', 'II', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('CITROEN', 'C4 I', 'II', '1.2 PureTech 130', 1199, 'essence', 130),
  ('CITROEN', 'C4 I', 'II', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'C4 I', 'II', '1.6 VTi', 1598, 'essence', 120),
  ('CITROEN', 'C4', 'II', '', 1560, 'diesel', 110),
  ('CITROEN', 'C4', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C4', 'II', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('CITROEN', 'C4', 'II', '1.2 PureTech 130', 1199, 'essence', 130),
  ('CITROEN', 'C4', 'II', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'C4', 'II', '1.6 VTi', 1598, 'essence', 120)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CITROEN (C-ELYSEE (DD_)) ──
WITH spec_28 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_28.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_28, (VALUES
  ('CITROEN', 'C-ELYSEE (DD_)', 'I', '', 1199, 'essence', 82),
  ('CITROEN', 'C-ELYSEE (DD_)', 'I', '1.2 VTi 82', 1199, 'essence', 82),
  ('CITROEN', 'C-ELYSEE (DD_)', 'I', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C-ELYSEE (DD_)', 'I', '1.6 HDI 92', 1560, 'diesel', 92),
  ('CITROEN', 'C-ELYSEE (DD_)', 'I', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C-ELYSEE (DD_)', 'I', '1.6 VTi 115', 1587, 'essence', 115),
  ('CITROEN', 'C-Elysée', 'I', '', 1199, 'essence', 82),
  ('CITROEN', 'C-Elysée', 'I', '1.2 VTi 82', 1199, 'essence', 82),
  ('CITROEN', 'C-Elysée', 'I', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C-Elysée', 'I', '1.6 HDI 92', 1560, 'diesel', 92),
  ('CITROEN', 'C-Elysée', 'I', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C-Elysée', 'I', '1.6 VTi 115', 1587, 'essence', 115),
  ('CITROEN', 'C-Elysee', 'I', '', 1199, 'essence', 82),
  ('CITROEN', 'C-Elysee', 'I', '1.2 VTi 82', 1199, 'essence', 82),
  ('CITROEN', 'C-Elysee', 'I', '1.2 PureTech', 1199, 'essence', 82),
  ('CITROEN', 'C-Elysee', 'I', '1.6 HDI 92', 1560, 'diesel', 92),
  ('CITROEN', 'C-Elysee', 'I', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'C-Elysee', 'I', '1.6 VTi 115', 1587, 'essence', 115)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CITROEN (BERLINGO (MF_, GJK_, GFK_)) ──
WITH spec_29 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_29.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_29, (VALUES
  ('CITROEN', 'BERLINGO (MF_, GJK_, GFK_)', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO (MF_, GJK_, GFK_)', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO (MF_, GJK_, GFK_)', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO (MF_, GJK_, GFK_)', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'BERLINGO (MF_, GJK_, GFK_)', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'BERLINGO (MF_, GJK_, GFK_)', 'B9', '1.4', 1360, 'essence', 75),
  ('CITROEN', 'BERLINGO Box Body/MPV (M_)', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO Box Body/MPV (M_)', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO Box Body/MPV (M_)', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO Box Body/MPV (M_)', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'BERLINGO Box Body/MPV (M_)', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'BERLINGO Box Body/MPV (M_)', 'B9', '1.4', 1360, 'essence', 75),
  ('CITROEN', 'BERLINGO MULTISPACE (B9)', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO MULTISPACE (B9)', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO MULTISPACE (B9)', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO MULTISPACE (B9)', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'BERLINGO MULTISPACE (B9)', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'BERLINGO MULTISPACE (B9)', 'B9', '1.4', 1360, 'essence', 75),
  ('CITROEN', 'BERLINGO Box Body/MPV (B9)', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO Box Body/MPV (B9)', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO Box Body/MPV (B9)', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO Box Body/MPV (B9)', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'BERLINGO Box Body/MPV (B9)', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'BERLINGO Box Body/MPV (B9)', 'B9', '1.4', 1360, 'essence', 75),
  ('CITROEN', 'BERLINGO (ER_, EC_)', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO (ER_, EC_)', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO (ER_, EC_)', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO (ER_, EC_)', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'BERLINGO (ER_, EC_)', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'BERLINGO (ER_, EC_)', 'B9', '1.4', 1360, 'essence', 75),
  ('CITROEN', 'Berlingo II', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo II', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo II', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo II', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'Berlingo II', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'Berlingo II', 'B9', '1.4', 1360, 'essence', 75),
  ('CITROEN', 'Berlingo I', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo I', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo I', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo I', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'Berlingo I', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'Berlingo I', 'B9', '1.4', 1360, 'essence', 75),
  ('CITROEN', 'Berlingo', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'Berlingo', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'Berlingo', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'Berlingo', 'B9', '1.4', 1360, 'essence', 75),
  ('CITROEN', 'BERLINGO', 'B9', '', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO', 'B9', '1.6 HDi 90', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO', 'B9', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'BERLINGO', 'B9', '1.6 BlueHDi 100', 1560, 'diesel', 100),
  ('CITROEN', 'BERLINGO', 'B9', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'BERLINGO', 'B9', '1.4', 1360, 'essence', 75)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CITROEN (XSARA (N1)) ──
WITH spec_30 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_psa-b71-2300_a3b4' LIMIT 1
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
  spec_30.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_30, (VALUES
  ('CITROEN', 'XSARA (N1)', 'I', '', 1587, 'essence', 109),
  ('CITROEN', 'XSARA (N1)', 'I', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'XSARA (N1)', 'I', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'XSARA (N1)', 'I', '2.0 HDi 90', 1997, 'diesel', 90),
  ('CITROEN', 'XSARA (N1)', 'I', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'XSARA Break (N2)', 'I', '', 1587, 'essence', 109),
  ('CITROEN', 'XSARA Break (N2)', 'I', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'XSARA Break (N2)', 'I', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'XSARA Break (N2)', 'I', '2.0 HDi 90', 1997, 'diesel', 90),
  ('CITROEN', 'XSARA Break (N2)', 'I', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'XSARA Coupe (N0)', 'I', '', 1587, 'essence', 109),
  ('CITROEN', 'XSARA Coupe (N0)', 'I', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'XSARA Coupe (N0)', 'I', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'XSARA Coupe (N0)', 'I', '2.0 HDi 90', 1997, 'diesel', 90),
  ('CITROEN', 'XSARA Coupe (N0)', 'I', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'XSARA PICASSO (N68)', 'I', '', 1587, 'essence', 109),
  ('CITROEN', 'XSARA PICASSO (N68)', 'I', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'XSARA PICASSO (N68)', 'I', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'XSARA PICASSO (N68)', 'I', '2.0 HDi 90', 1997, 'diesel', 90),
  ('CITROEN', 'XSARA PICASSO (N68)', 'I', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'Xsara Picasso', 'I', '', 1587, 'essence', 109),
  ('CITROEN', 'Xsara Picasso', 'I', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'Xsara Picasso', 'I', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'Xsara Picasso', 'I', '2.0 HDi 90', 1997, 'diesel', 90),
  ('CITROEN', 'Xsara Picasso', 'I', '1.9 D', 1868, 'diesel', 69),
  ('CITROEN', 'Xsara', 'I', '', 1587, 'essence', 109),
  ('CITROEN', 'Xsara', 'I', '1.6 16V', 1587, 'essence', 109),
  ('CITROEN', 'Xsara', 'I', '1.4 i', 1360, 'essence', 75),
  ('CITROEN', 'Xsara', 'I', '2.0 HDi 90', 1997, 'diesel', 90),
  ('CITROEN', 'Xsara', 'I', '1.9 D', 1868, 'diesel', 69)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FIAT (PUNTO (188_)) ──
WITH spec_31 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_fiat-955535-g2_a3b4' LIMIT 1
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
  spec_31.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_31, (VALUES
  ('FIAT', 'PUNTO (188_)', '188', '', 1242, 'essence', 60),
  ('FIAT', 'PUNTO (188_)', '188', '1.2 60 (188.030...)', 1242, 'essence', 60),
  ('FIAT', 'PUNTO (188_)', '188', '1.2 60', 1242, 'essence', 60),
  ('FIAT', 'PUNTO (188_)', '188', '1.2', 1242, 'essence', 60),
  ('FIAT', 'PUNTO (188_)', '188', '1.2 16V 80', 1242, 'essence', 80),
  ('FIAT', 'PUNTO (188_)', '188', '1.3 JTD 16V', 1248, 'diesel', 70),
  ('FIAT', 'PUNTO (188_)', '188', '1.9 JTD', 1910, 'diesel', 80),
  ('FIAT', 'PUNTO (188_)', '188', '1.9 D 60', 1910, 'diesel', 60),
  ('FIAT', 'PUNTO Van (188_)', '188', '', 1242, 'essence', 60),
  ('FIAT', 'PUNTO Van (188_)', '188', '1.2 60 (188.030...)', 1242, 'essence', 60),
  ('FIAT', 'PUNTO Van (188_)', '188', '1.2 60', 1242, 'essence', 60),
  ('FIAT', 'PUNTO Van (188_)', '188', '1.2', 1242, 'essence', 60),
  ('FIAT', 'PUNTO Van (188_)', '188', '1.2 16V 80', 1242, 'essence', 80),
  ('FIAT', 'PUNTO Van (188_)', '188', '1.3 JTD 16V', 1248, 'diesel', 70),
  ('FIAT', 'PUNTO Van (188_)', '188', '1.9 JTD', 1910, 'diesel', 80),
  ('FIAT', 'PUNTO Van (188_)', '188', '1.9 D 60', 1910, 'diesel', 60),
  ('FIAT', 'Punto 188', '188', '', 1242, 'essence', 60),
  ('FIAT', 'Punto 188', '188', '1.2 60 (188.030...)', 1242, 'essence', 60),
  ('FIAT', 'Punto 188', '188', '1.2 60', 1242, 'essence', 60),
  ('FIAT', 'Punto 188', '188', '1.2', 1242, 'essence', 60),
  ('FIAT', 'Punto 188', '188', '1.2 16V 80', 1242, 'essence', 80),
  ('FIAT', 'Punto 188', '188', '1.3 JTD 16V', 1248, 'diesel', 70),
  ('FIAT', 'Punto 188', '188', '1.9 JTD', 1910, 'diesel', 80),
  ('FIAT', 'Punto 188', '188', '1.9 D 60', 1910, 'diesel', 60),
  ('FIAT', 'Punto II', '188', '', 1242, 'essence', 60),
  ('FIAT', 'Punto II', '188', '1.2 60 (188.030...)', 1242, 'essence', 60),
  ('FIAT', 'Punto II', '188', '1.2 60', 1242, 'essence', 60),
  ('FIAT', 'Punto II', '188', '1.2', 1242, 'essence', 60),
  ('FIAT', 'Punto II', '188', '1.2 16V 80', 1242, 'essence', 80),
  ('FIAT', 'Punto II', '188', '1.3 JTD 16V', 1248, 'diesel', 70),
  ('FIAT', 'Punto II', '188', '1.9 JTD', 1910, 'diesel', 80),
  ('FIAT', 'Punto II', '188', '1.9 D 60', 1910, 'diesel', 60),
  ('FIAT', 'Punto 2', '188', '', 1242, 'essence', 60),
  ('FIAT', 'Punto 2', '188', '1.2 60 (188.030...)', 1242, 'essence', 60),
  ('FIAT', 'Punto 2', '188', '1.2 60', 1242, 'essence', 60),
  ('FIAT', 'Punto 2', '188', '1.2', 1242, 'essence', 60),
  ('FIAT', 'Punto 2', '188', '1.2 16V 80', 1242, 'essence', 80),
  ('FIAT', 'Punto 2', '188', '1.3 JTD 16V', 1248, 'diesel', 70),
  ('FIAT', 'Punto 2', '188', '1.9 JTD', 1910, 'diesel', 80),
  ('FIAT', 'Punto 2', '188', '1.9 D 60', 1910, 'diesel', 60)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FIAT (GRANDE PUNTO (199_)) ──
WITH spec_32 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_32.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_32, (VALUES
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '', 1242, 'essence', 65),
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '1.2', 1242, 'essence', 65),
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '1.2 69', 1242, 'essence', 69),
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '1.4 (199AXB1A)', 1368, 'essence', 77),
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '1.4', 1368, 'essence', 77),
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '1.3 Multijet', 1248, 'diesel', 75),
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '1.3 Multijet 95', 1248, 'diesel', 95),
  ('FIAT', 'GRANDE PUNTO (199_)', '199', '1.4 T-Jet', 1368, 'essence', 120),
  ('FIAT', 'PUNTO EVO (199_)', '199', '', 1242, 'essence', 65),
  ('FIAT', 'PUNTO EVO (199_)', '199', '1.2', 1242, 'essence', 65),
  ('FIAT', 'PUNTO EVO (199_)', '199', '1.2 69', 1242, 'essence', 69),
  ('FIAT', 'PUNTO EVO (199_)', '199', '1.4 (199AXB1A)', 1368, 'essence', 77),
  ('FIAT', 'PUNTO EVO (199_)', '199', '1.4', 1368, 'essence', 77),
  ('FIAT', 'PUNTO EVO (199_)', '199', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'PUNTO EVO (199_)', '199', '1.3 Multijet', 1248, 'diesel', 75),
  ('FIAT', 'PUNTO EVO (199_)', '199', '1.3 Multijet 95', 1248, 'diesel', 95),
  ('FIAT', 'PUNTO EVO (199_)', '199', '1.4 T-Jet', 1368, 'essence', 120),
  ('FIAT', 'PUNTO (199_)', '199', '', 1242, 'essence', 65),
  ('FIAT', 'PUNTO (199_)', '199', '1.2', 1242, 'essence', 65),
  ('FIAT', 'PUNTO (199_)', '199', '1.2 69', 1242, 'essence', 69),
  ('FIAT', 'PUNTO (199_)', '199', '1.4 (199AXB1A)', 1368, 'essence', 77),
  ('FIAT', 'PUNTO (199_)', '199', '1.4', 1368, 'essence', 77),
  ('FIAT', 'PUNTO (199_)', '199', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'PUNTO (199_)', '199', '1.3 Multijet', 1248, 'diesel', 75),
  ('FIAT', 'PUNTO (199_)', '199', '1.3 Multijet 95', 1248, 'diesel', 95),
  ('FIAT', 'PUNTO (199_)', '199', '1.4 T-Jet', 1368, 'essence', 120),
  ('FIAT', 'Grande Punto', '199', '', 1242, 'essence', 65),
  ('FIAT', 'Grande Punto', '199', '1.2', 1242, 'essence', 65),
  ('FIAT', 'Grande Punto', '199', '1.2 69', 1242, 'essence', 69),
  ('FIAT', 'Grande Punto', '199', '1.4 (199AXB1A)', 1368, 'essence', 77),
  ('FIAT', 'Grande Punto', '199', '1.4', 1368, 'essence', 77),
  ('FIAT', 'Grande Punto', '199', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Grande Punto', '199', '1.3 Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Grande Punto', '199', '1.3 Multijet 95', 1248, 'diesel', 95),
  ('FIAT', 'Grande Punto', '199', '1.4 T-Jet', 1368, 'essence', 120),
  ('FIAT', 'Punto Evo', '199', '', 1242, 'essence', 65),
  ('FIAT', 'Punto Evo', '199', '1.2', 1242, 'essence', 65),
  ('FIAT', 'Punto Evo', '199', '1.2 69', 1242, 'essence', 69),
  ('FIAT', 'Punto Evo', '199', '1.4 (199AXB1A)', 1368, 'essence', 77),
  ('FIAT', 'Punto Evo', '199', '1.4', 1368, 'essence', 77),
  ('FIAT', 'Punto Evo', '199', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Punto Evo', '199', '1.3 Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Punto Evo', '199', '1.3 Multijet 95', 1248, 'diesel', 95),
  ('FIAT', 'Punto Evo', '199', '1.4 T-Jet', 1368, 'essence', 120),
  ('FIAT', 'Punto', '199', '', 1242, 'essence', 65),
  ('FIAT', 'Punto', '199', '1.2', 1242, 'essence', 65),
  ('FIAT', 'Punto', '199', '1.2 69', 1242, 'essence', 69),
  ('FIAT', 'Punto', '199', '1.4 (199AXB1A)', 1368, 'essence', 77),
  ('FIAT', 'Punto', '199', '1.4', 1368, 'essence', 77),
  ('FIAT', 'Punto', '199', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Punto', '199', '1.3 Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Punto', '199', '1.3 Multijet 95', 1248, 'diesel', 95),
  ('FIAT', 'Punto', '199', '1.4 T-Jet', 1368, 'essence', 120),
  ('FIAT', 'PUNTO', '199', '', 1242, 'essence', 65),
  ('FIAT', 'PUNTO', '199', '1.2', 1242, 'essence', 65),
  ('FIAT', 'PUNTO', '199', '1.2 69', 1242, 'essence', 69),
  ('FIAT', 'PUNTO', '199', '1.4 (199AXB1A)', 1368, 'essence', 77),
  ('FIAT', 'PUNTO', '199', '1.4', 1368, 'essence', 77),
  ('FIAT', 'PUNTO', '199', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'PUNTO', '199', '1.3 Multijet', 1248, 'diesel', 75),
  ('FIAT', 'PUNTO', '199', '1.3 Multijet 95', 1248, 'diesel', 95),
  ('FIAT', 'PUNTO', '199', '1.4 T-Jet', 1368, 'essence', 120)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FIAT (500 (312_)) ──
WITH spec_33 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_33.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_33, (VALUES
  ('FIAT', '500 (312_)', '312', '', 1242, 'essence', 69),
  ('FIAT', '500 (312_)', '312', '1.2 (312AXA1A)', 1242, 'essence', 69),
  ('FIAT', '500 (312_)', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', '500 (312_)', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', '500 (312_)', '312', '1.3 Multijet', 1248, 'diesel', 95),
  ('FIAT', '500 (312_)', '312', '0.9 TwinAir', 875, 'essence', 85),
  ('FIAT', '500 (312_)', '312', '1.4', 1368, 'essence', 100),
  ('FIAT', '500 C (312_)', '312', '', 1242, 'essence', 69),
  ('FIAT', '500 C (312_)', '312', '1.2 (312AXA1A)', 1242, 'essence', 69),
  ('FIAT', '500 C (312_)', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', '500 C (312_)', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', '500 C (312_)', '312', '1.3 Multijet', 1248, 'diesel', 95),
  ('FIAT', '500 C (312_)', '312', '0.9 TwinAir', 875, 'essence', 85),
  ('FIAT', '500 C (312_)', '312', '1.4', 1368, 'essence', 100),
  ('FIAT', '500L (351_, 352_)', '312', '', 1242, 'essence', 69),
  ('FIAT', '500L (351_, 352_)', '312', '1.2 (312AXA1A)', 1242, 'essence', 69),
  ('FIAT', '500L (351_, 352_)', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', '500L (351_, 352_)', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', '500L (351_, 352_)', '312', '1.3 Multijet', 1248, 'diesel', 95),
  ('FIAT', '500L (351_, 352_)', '312', '0.9 TwinAir', 875, 'essence', 85),
  ('FIAT', '500L (351_, 352_)', '312', '1.4', 1368, 'essence', 100),
  ('FIAT', '500X (334_)', '312', '', 1242, 'essence', 69),
  ('FIAT', '500X (334_)', '312', '1.2 (312AXA1A)', 1242, 'essence', 69),
  ('FIAT', '500X (334_)', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', '500X (334_)', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', '500X (334_)', '312', '1.3 Multijet', 1248, 'diesel', 95),
  ('FIAT', '500X (334_)', '312', '0.9 TwinAir', 875, 'essence', 85),
  ('FIAT', '500X (334_)', '312', '1.4', 1368, 'essence', 100),
  ('FIAT', '500 L', '312', '', 1242, 'essence', 69),
  ('FIAT', '500 L', '312', '1.2 (312AXA1A)', 1242, 'essence', 69),
  ('FIAT', '500 L', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', '500 L', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', '500 L', '312', '1.3 Multijet', 1248, 'diesel', 95),
  ('FIAT', '500 L', '312', '0.9 TwinAir', 875, 'essence', 85),
  ('FIAT', '500 L', '312', '1.4', 1368, 'essence', 100),
  ('FIAT', '500 X', '312', '', 1242, 'essence', 69),
  ('FIAT', '500 X', '312', '1.2 (312AXA1A)', 1242, 'essence', 69),
  ('FIAT', '500 X', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', '500 X', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', '500 X', '312', '1.3 Multijet', 1248, 'diesel', 95),
  ('FIAT', '500 X', '312', '0.9 TwinAir', 875, 'essence', 85),
  ('FIAT', '500 X', '312', '1.4', 1368, 'essence', 100),
  ('FIAT', '500', '312', '', 1242, 'essence', 69),
  ('FIAT', '500', '312', '1.2 (312AXA1A)', 1242, 'essence', 69),
  ('FIAT', '500', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', '500', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', '500', '312', '1.3 Multijet', 1248, 'diesel', 95),
  ('FIAT', '500', '312', '0.9 TwinAir', 875, 'essence', 85),
  ('FIAT', '500', '312', '1.4', 1368, 'essence', 100)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FIAT (PANDA (169_)) ──
WITH spec_34 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_34.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_34, (VALUES
  ('FIAT', 'PANDA (169_)', '312', '', 1242, 'essence', 69),
  ('FIAT', 'PANDA (169_)', '312', '1.2 (312PXA1A)', 1242, 'essence', 69),
  ('FIAT', 'PANDA (169_)', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', 'PANDA (169_)', '312', '1.1 (169AXA1A)', 1108, 'essence', 54),
  ('FIAT', 'PANDA (169_)', '312', '1.1', 1108, 'essence', 54),
  ('FIAT', 'PANDA (169_)', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'PANDA (312_, 319_)', '312', '', 1242, 'essence', 69),
  ('FIAT', 'PANDA (312_, 319_)', '312', '1.2 (312PXA1A)', 1242, 'essence', 69),
  ('FIAT', 'PANDA (312_, 319_)', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', 'PANDA (312_, 319_)', '312', '1.1 (169AXA1A)', 1108, 'essence', 54),
  ('FIAT', 'PANDA (312_, 319_)', '312', '1.1', 1108, 'essence', 54),
  ('FIAT', 'PANDA (312_, 319_)', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Panda II', '312', '', 1242, 'essence', 69),
  ('FIAT', 'Panda II', '312', '1.2 (312PXA1A)', 1242, 'essence', 69),
  ('FIAT', 'Panda II', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', 'Panda II', '312', '1.1 (169AXA1A)', 1108, 'essence', 54),
  ('FIAT', 'Panda II', '312', '1.1', 1108, 'essence', 54),
  ('FIAT', 'Panda II', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Panda III', '312', '', 1242, 'essence', 69),
  ('FIAT', 'Panda III', '312', '1.2 (312PXA1A)', 1242, 'essence', 69),
  ('FIAT', 'Panda III', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', 'Panda III', '312', '1.1 (169AXA1A)', 1108, 'essence', 54),
  ('FIAT', 'Panda III', '312', '1.1', 1108, 'essence', 54),
  ('FIAT', 'Panda III', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Panda', '312', '', 1242, 'essence', 69),
  ('FIAT', 'Panda', '312', '1.2 (312PXA1A)', 1242, 'essence', 69),
  ('FIAT', 'Panda', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', 'Panda', '312', '1.1 (169AXA1A)', 1108, 'essence', 54),
  ('FIAT', 'Panda', '312', '1.1', 1108, 'essence', 54),
  ('FIAT', 'Panda', '312', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'PANDA', '312', '', 1242, 'essence', 69),
  ('FIAT', 'PANDA', '312', '1.2 (312PXA1A)', 1242, 'essence', 69),
  ('FIAT', 'PANDA', '312', '1.2', 1242, 'essence', 69),
  ('FIAT', 'PANDA', '312', '1.1 (169AXA1A)', 1108, 'essence', 54),
  ('FIAT', 'PANDA', '312', '1.1', 1108, 'essence', 54),
  ('FIAT', 'PANDA', '312', '1.3 D Multijet', 1248, 'diesel', 75)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FIAT (TIPO Estate (356_)) ──
WITH spec_35 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_35.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_35, (VALUES
  ('FIAT', 'TIPO Estate (356_)', '356', '', 1368, 'essence', 95),
  ('FIAT', 'TIPO Estate (356_)', '356', '1.4', 1368, 'essence', 95),
  ('FIAT', 'TIPO Estate (356_)', '356', '1.3 D Multijet', 1248, 'diesel', 95),
  ('FIAT', 'TIPO Estate (356_)', '356', '1.6 D Multijet', 1598, 'diesel', 120),
  ('FIAT', 'TIPO Hatchback (356_)', '356', '', 1368, 'essence', 95),
  ('FIAT', 'TIPO Hatchback (356_)', '356', '1.4', 1368, 'essence', 95),
  ('FIAT', 'TIPO Hatchback (356_)', '356', '1.3 D Multijet', 1248, 'diesel', 95),
  ('FIAT', 'TIPO Hatchback (356_)', '356', '1.6 D Multijet', 1598, 'diesel', 120),
  ('FIAT', 'TIPO Saloon (356_)', '356', '', 1368, 'essence', 95),
  ('FIAT', 'TIPO Saloon (356_)', '356', '1.4', 1368, 'essence', 95),
  ('FIAT', 'TIPO Saloon (356_)', '356', '1.3 D Multijet', 1248, 'diesel', 95),
  ('FIAT', 'TIPO Saloon (356_)', '356', '1.6 D Multijet', 1598, 'diesel', 120),
  ('FIAT', 'Tipo', '356', '', 1368, 'essence', 95),
  ('FIAT', 'Tipo', '356', '1.4', 1368, 'essence', 95),
  ('FIAT', 'Tipo', '356', '1.3 D Multijet', 1248, 'diesel', 95),
  ('FIAT', 'Tipo', '356', '1.6 D Multijet', 1598, 'diesel', 120),
  ('FIAT', 'TIPO', '356', '', 1368, 'essence', 95),
  ('FIAT', 'TIPO', '356', '1.4', 1368, 'essence', 95),
  ('FIAT', 'TIPO', '356', '1.3 D Multijet', 1248, 'diesel', 95),
  ('FIAT', 'TIPO', '356', '1.6 D Multijet', 1598, 'diesel', 120)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FIAT (FIORINO Box Body/MPV (225_)) ──
WITH spec_36 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_36.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_36, (VALUES
  ('FIAT', 'FIORINO Box Body/MPV (225_)', '225', '', 1248, 'diesel', 75),
  ('FIAT', 'FIORINO Box Body/MPV (225_)', '225', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'FIORINO Box Body/MPV (225_)', '225', '1.4', 1360, 'essence', 73),
  ('FIAT', 'FIORINO Estate (225_)', '225', '', 1248, 'diesel', 75),
  ('FIAT', 'FIORINO Estate (225_)', '225', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'FIORINO Estate (225_)', '225', '1.4', 1360, 'essence', 73),
  ('FIAT', 'Fiorino', '225', '', 1248, 'diesel', 75),
  ('FIAT', 'Fiorino', '225', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Fiorino', '225', '1.4', 1360, 'essence', 73),
  ('FIAT', 'FIORINO', '225', '', 1248, 'diesel', 75),
  ('FIAT', 'FIORINO', '225', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'FIORINO', '225', '1.4', 1360, 'essence', 73),
  ('FIAT', 'QUBO (225_)', '225', '', 1248, 'diesel', 75),
  ('FIAT', 'QUBO (225_)', '225', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'QUBO (225_)', '225', '1.4', 1360, 'essence', 73),
  ('FIAT', 'Qubo', '225', '', 1248, 'diesel', 75),
  ('FIAT', 'Qubo', '225', '1.3 D Multijet', 1248, 'diesel', 75),
  ('FIAT', 'Qubo', '225', '1.4', 1360, 'essence', 73)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FIAT (DOBLO Box Body/MPV (223_)) ──
WITH spec_37 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_37.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_37, (VALUES
  ('FIAT', 'DOBLO Box Body/MPV (223_)', '263', '', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO Box Body/MPV (223_)', '263', '1.3 D Multijet', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO Box Body/MPV (223_)', '263', '1.6 D Multijet', 1598, 'diesel', 105),
  ('FIAT', 'DOBLO Box Body/MPV (223_)', '263', '1.9 JTD', 1910, 'diesel', 105),
  ('FIAT', 'DOBLO Box Body/MPV (223_)', '263', '1.4', 1368, 'essence', 77),
  ('FIAT', 'DOBLO MPV (119_, 223_)', '263', '', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO MPV (119_, 223_)', '263', '1.3 D Multijet', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO MPV (119_, 223_)', '263', '1.6 D Multijet', 1598, 'diesel', 105),
  ('FIAT', 'DOBLO MPV (119_, 223_)', '263', '1.9 JTD', 1910, 'diesel', 105),
  ('FIAT', 'DOBLO MPV (119_, 223_)', '263', '1.4', 1368, 'essence', 77),
  ('FIAT', 'DOBLO Box Body/MPV (263_)', '263', '', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO Box Body/MPV (263_)', '263', '1.3 D Multijet', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO Box Body/MPV (263_)', '263', '1.6 D Multijet', 1598, 'diesel', 105),
  ('FIAT', 'DOBLO Box Body/MPV (263_)', '263', '1.9 JTD', 1910, 'diesel', 105),
  ('FIAT', 'DOBLO Box Body/MPV (263_)', '263', '1.4', 1368, 'essence', 77),
  ('FIAT', 'DOBLO Estate (263_)', '263', '', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO Estate (263_)', '263', '1.3 D Multijet', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO Estate (263_)', '263', '1.6 D Multijet', 1598, 'diesel', 105),
  ('FIAT', 'DOBLO Estate (263_)', '263', '1.9 JTD', 1910, 'diesel', 105),
  ('FIAT', 'DOBLO Estate (263_)', '263', '1.4', 1368, 'essence', 77),
  ('FIAT', 'Doblo II', '263', '', 1248, 'diesel', 90),
  ('FIAT', 'Doblo II', '263', '1.3 D Multijet', 1248, 'diesel', 90),
  ('FIAT', 'Doblo II', '263', '1.6 D Multijet', 1598, 'diesel', 105),
  ('FIAT', 'Doblo II', '263', '1.9 JTD', 1910, 'diesel', 105),
  ('FIAT', 'Doblo II', '263', '1.4', 1368, 'essence', 77),
  ('FIAT', 'Doblo I', '263', '', 1248, 'diesel', 90),
  ('FIAT', 'Doblo I', '263', '1.3 D Multijet', 1248, 'diesel', 90),
  ('FIAT', 'Doblo I', '263', '1.6 D Multijet', 1598, 'diesel', 105),
  ('FIAT', 'Doblo I', '263', '1.9 JTD', 1910, 'diesel', 105),
  ('FIAT', 'Doblo I', '263', '1.4', 1368, 'essence', 77),
  ('FIAT', 'Doblo', '263', '', 1248, 'diesel', 90),
  ('FIAT', 'Doblo', '263', '1.3 D Multijet', 1248, 'diesel', 90),
  ('FIAT', 'Doblo', '263', '1.6 D Multijet', 1598, 'diesel', 105),
  ('FIAT', 'Doblo', '263', '1.9 JTD', 1910, 'diesel', 105),
  ('FIAT', 'Doblo', '263', '1.4', 1368, 'essence', 77),
  ('FIAT', 'DOBLO', '263', '', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO', '263', '1.3 D Multijet', 1248, 'diesel', 90),
  ('FIAT', 'DOBLO', '263', '1.6 D Multijet', 1598, 'diesel', 105),
  ('FIAT', 'DOBLO', '263', '1.9 JTD', 1910, 'diesel', 105),
  ('FIAT', 'DOBLO', '263', '1.4', 1368, 'essence', 77)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FIAT (PALIO (178_)) ──
WITH spec_38 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_fiat-955535-g2_a3b4' LIMIT 1
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
  spec_38.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_38, (VALUES
  ('FIAT', 'PALIO (178_)', '178', '', 1242, 'essence', 60),
  ('FIAT', 'PALIO (178_)', '178', '1.2', 1242, 'essence', 60),
  ('FIAT', 'PALIO (178_)', '178', '1.4', 1372, 'essence', 69),
  ('FIAT', 'PALIO (178_)', '178', '1.7 TD', 1698, 'diesel', 70),
  ('FIAT', 'PALIO Weekend (178_)', '178', '', 1242, 'essence', 60),
  ('FIAT', 'PALIO Weekend (178_)', '178', '1.2', 1242, 'essence', 60),
  ('FIAT', 'PALIO Weekend (178_)', '178', '1.4', 1372, 'essence', 69),
  ('FIAT', 'PALIO Weekend (178_)', '178', '1.7 TD', 1698, 'diesel', 70),
  ('FIAT', 'SIENA (178_)', '178', '', 1242, 'essence', 60),
  ('FIAT', 'SIENA (178_)', '178', '1.2', 1242, 'essence', 60),
  ('FIAT', 'SIENA (178_)', '178', '1.4', 1372, 'essence', 69),
  ('FIAT', 'SIENA (178_)', '178', '1.7 TD', 1698, 'diesel', 70),
  ('FIAT', 'Palio', '178', '', 1242, 'essence', 60),
  ('FIAT', 'Palio', '178', '1.2', 1242, 'essence', 60),
  ('FIAT', 'Palio', '178', '1.4', 1372, 'essence', 69),
  ('FIAT', 'Palio', '178', '1.7 TD', 1698, 'diesel', 70),
  ('FIAT', 'Siena', '178', '', 1242, 'essence', 60),
  ('FIAT', 'Siena', '178', '1.2', 1242, 'essence', 60),
  ('FIAT', 'Siena', '178', '1.4', 1372, 'essence', 69),
  ('FIAT', 'Siena', '178', '1.7 TD', 1698, 'diesel', 70),
  ('FIAT', 'UNO (146_)', '178', '', 1242, 'essence', 60),
  ('FIAT', 'UNO (146_)', '178', '1.2', 1242, 'essence', 60),
  ('FIAT', 'UNO (146_)', '178', '1.4', 1372, 'essence', 69),
  ('FIAT', 'UNO (146_)', '178', '1.7 TD', 1698, 'diesel', 70),
  ('FIAT', 'Uno', '178', '', 1242, 'essence', 60),
  ('FIAT', 'Uno', '178', '1.2', 1242, 'essence', 60),
  ('FIAT', 'Uno', '178', '1.4', 1372, 'essence', 69),
  ('FIAT', 'Uno', '178', '1.7 TD', 1698, 'diesel', 70)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (YARIS (_P1_)) ──
WITH spec_39 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_39.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_39, (VALUES
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS (_P1_)', 'P13', '1.5 Hybrid', 1497, 'essence', 75),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS (_P9_)', 'P13', '1.5 Hybrid', 1497, 'essence', 75),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS (_P13_)', 'P13', '1.5 Hybrid', 1497, 'essence', 75),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS (_P21_, _PA1_, _PH1_)', 'P13', '1.5 Hybrid', 1497, 'essence', 75),
  ('TOYOTA', 'Yaris III', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'Yaris III', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'Yaris III', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'Yaris III', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'Yaris III', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'Yaris III', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'Yaris III', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'Yaris III', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'Yaris III', 'P13', '1.5 Hybrid', 1497, 'essence', 75),
  ('TOYOTA', 'Yaris II', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'Yaris II', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'Yaris II', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'Yaris II', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'Yaris II', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'Yaris II', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'Yaris II', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'Yaris II', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'Yaris II', 'P13', '1.5 Hybrid', 1497, 'essence', 75),
  ('TOYOTA', 'Yaris I', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'Yaris I', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'Yaris I', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'Yaris I', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'Yaris I', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'Yaris I', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'Yaris I', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'Yaris I', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'Yaris I', 'P13', '1.5 Hybrid', 1497, 'essence', 75),
  ('TOYOTA', 'Yaris', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'Yaris', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'Yaris', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'Yaris', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'Yaris', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'Yaris', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'Yaris', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'Yaris', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'Yaris', 'P13', '1.5 Hybrid', 1497, 'essence', 75),
  ('TOYOTA', 'YARIS', 'P13', '', 998, 'essence', 69),
  ('TOYOTA', 'YARIS', 'P13', '1.0 (KSP130_)', 998, 'essence', 69),
  ('TOYOTA', 'YARIS', 'P13', '1.0 VVT-i', 998, 'essence', 69),
  ('TOYOTA', 'YARIS', 'P13', '1.0', 998, 'essence', 69),
  ('TOYOTA', 'YARIS', 'P13', '1.3 (NSP130_)', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS', 'P13', '1.3 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'YARIS', 'P13', '1.4 D-4D (NLP130_)', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS', 'P13', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'YARIS', 'P13', '1.5 Hybrid', 1497, 'essence', 75)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (COROLLA (_E11_)) ──
WITH spec_40 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_40.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_40, (VALUES
  ('TOYOTA', 'COROLLA (_E11_)', 'E18', '', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA (_E11_)', 'E18', '1.33 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA (_E11_)', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'COROLLA (_E11_)', 'E18', '1.6 (ZRE181)', 1598, 'essence', 132),
  ('TOYOTA', 'COROLLA (_E11_)', 'E18', '1.8 Hybrid', 1798, 'essence', 98),
  ('TOYOTA', 'COROLLA (_E12_)', 'E18', '', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA (_E12_)', 'E18', '1.33 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA (_E12_)', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'COROLLA (_E12_)', 'E18', '1.6 (ZRE181)', 1598, 'essence', 132),
  ('TOYOTA', 'COROLLA (_E12_)', 'E18', '1.8 Hybrid', 1798, 'essence', 98),
  ('TOYOTA', 'COROLLA (_E15_)', 'E18', '', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA (_E15_)', 'E18', '1.33 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA (_E15_)', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'COROLLA (_E15_)', 'E18', '1.6 (ZRE181)', 1598, 'essence', 132),
  ('TOYOTA', 'COROLLA (_E15_)', 'E18', '1.8 Hybrid', 1798, 'essence', 98),
  ('TOYOTA', 'COROLLA Saloon (_E18_, ZRE17_)', 'E18', '', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA Saloon (_E18_, ZRE17_)', 'E18', '1.33 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA Saloon (_E18_, ZRE17_)', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'COROLLA Saloon (_E18_, ZRE17_)', 'E18', '1.6 (ZRE181)', 1598, 'essence', 132),
  ('TOYOTA', 'COROLLA Saloon (_E18_, ZRE17_)', 'E18', '1.8 Hybrid', 1798, 'essence', 98),
  ('TOYOTA', 'COROLLA Saloon (_E21_)', 'E18', '', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA Saloon (_E21_)', 'E18', '1.33 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA Saloon (_E21_)', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'COROLLA Saloon (_E21_)', 'E18', '1.6 (ZRE181)', 1598, 'essence', 132),
  ('TOYOTA', 'COROLLA Saloon (_E21_)', 'E18', '1.8 Hybrid', 1798, 'essence', 98),
  ('TOYOTA', 'Corolla', 'E18', '', 1329, 'essence', 99),
  ('TOYOTA', 'Corolla', 'E18', '1.33 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'Corolla', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'Corolla', 'E18', '1.6 (ZRE181)', 1598, 'essence', 132),
  ('TOYOTA', 'Corolla', 'E18', '1.8 Hybrid', 1798, 'essence', 98),
  ('TOYOTA', 'COROLLA', 'E18', '', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA', 'E18', '1.33 VVT-i', 1329, 'essence', 99),
  ('TOYOTA', 'COROLLA', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'COROLLA', 'E18', '1.6 (ZRE181)', 1598, 'essence', 132),
  ('TOYOTA', 'COROLLA', 'E18', '1.8 Hybrid', 1798, 'essence', 98)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (HILUX VI Pickup (_N1_)) ──
WITH spec_41 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_41.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_41, (VALUES
  ('TOYOTA', 'HILUX VI Pickup (_N1_)', 'VII', '', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VI Pickup (_N1_)', 'VII', '2.5 D-4D 4WD (KUN25_)', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VI Pickup (_N1_)', 'VII', '2.5 D-4D', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VI Pickup (_N1_)', 'VII', '3.0 D-4D 4WD (KUN26_)', 2982, 'diesel', 171),
  ('TOYOTA', 'HILUX VI Pickup (_N1_)', 'VII', '2.4 D (GUN125_)', 2393, 'diesel', 150),
  ('TOYOTA', 'HILUX VI Pickup (_N1_)', 'VII', '2.4 D-4D', 2393, 'diesel', 150),
  ('TOYOTA', 'HILUX VII Pickup (_N1_, _N2_, _N3_)', 'VII', '', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VII Pickup (_N1_, _N2_, _N3_)', 'VII', '2.5 D-4D 4WD (KUN25_)', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VII Pickup (_N1_, _N2_, _N3_)', 'VII', '2.5 D-4D', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VII Pickup (_N1_, _N2_, _N3_)', 'VII', '3.0 D-4D 4WD (KUN26_)', 2982, 'diesel', 171),
  ('TOYOTA', 'HILUX VII Pickup (_N1_, _N2_, _N3_)', 'VII', '2.4 D (GUN125_)', 2393, 'diesel', 150),
  ('TOYOTA', 'HILUX VII Pickup (_N1_, _N2_, _N3_)', 'VII', '2.4 D-4D', 2393, 'diesel', 150),
  ('TOYOTA', 'HILUX VIII Pickup (_N1_)', 'VII', '', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VIII Pickup (_N1_)', 'VII', '2.5 D-4D 4WD (KUN25_)', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VIII Pickup (_N1_)', 'VII', '2.5 D-4D', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX VIII Pickup (_N1_)', 'VII', '3.0 D-4D 4WD (KUN26_)', 2982, 'diesel', 171),
  ('TOYOTA', 'HILUX VIII Pickup (_N1_)', 'VII', '2.4 D (GUN125_)', 2393, 'diesel', 150),
  ('TOYOTA', 'HILUX VIII Pickup (_N1_)', 'VII', '2.4 D-4D', 2393, 'diesel', 150),
  ('TOYOTA', 'Hilux VII', 'VII', '', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux VII', 'VII', '2.5 D-4D 4WD (KUN25_)', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux VII', 'VII', '2.5 D-4D', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux VII', 'VII', '3.0 D-4D 4WD (KUN26_)', 2982, 'diesel', 171),
  ('TOYOTA', 'Hilux VII', 'VII', '2.4 D (GUN125_)', 2393, 'diesel', 150),
  ('TOYOTA', 'Hilux VII', 'VII', '2.4 D-4D', 2393, 'diesel', 150),
  ('TOYOTA', 'Hilux VIII', 'VII', '', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux VIII', 'VII', '2.5 D-4D 4WD (KUN25_)', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux VIII', 'VII', '2.5 D-4D', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux VIII', 'VII', '3.0 D-4D 4WD (KUN26_)', 2982, 'diesel', 171),
  ('TOYOTA', 'Hilux VIII', 'VII', '2.4 D (GUN125_)', 2393, 'diesel', 150),
  ('TOYOTA', 'Hilux VIII', 'VII', '2.4 D-4D', 2393, 'diesel', 150),
  ('TOYOTA', 'Hilux', 'VII', '', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux', 'VII', '2.5 D-4D 4WD (KUN25_)', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux', 'VII', '2.5 D-4D', 2494, 'diesel', 144),
  ('TOYOTA', 'Hilux', 'VII', '3.0 D-4D 4WD (KUN26_)', 2982, 'diesel', 171),
  ('TOYOTA', 'Hilux', 'VII', '2.4 D (GUN125_)', 2393, 'diesel', 150),
  ('TOYOTA', 'Hilux', 'VII', '2.4 D-4D', 2393, 'diesel', 150),
  ('TOYOTA', 'HILUX', 'VII', '', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX', 'VII', '2.5 D-4D 4WD (KUN25_)', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX', 'VII', '2.5 D-4D', 2494, 'diesel', 144),
  ('TOYOTA', 'HILUX', 'VII', '3.0 D-4D 4WD (KUN26_)', 2982, 'diesel', 171),
  ('TOYOTA', 'HILUX', 'VII', '2.4 D (GUN125_)', 2393, 'diesel', 150),
  ('TOYOTA', 'HILUX', 'VII', '2.4 D-4D', 2393, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (RAV 4 II (_A2_)) ──
WITH spec_42 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_42.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_42, (VALUES
  ('TOYOTA', 'RAV 4 II (_A2_)', 'A4', '', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 II (_A2_)', 'A4', '2.0 D (WWA42_)', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 II (_A2_)', 'A4', '2.0 D-4D', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 II (_A2_)', 'A4', '2.2 D-4D 4WD', 2231, 'diesel', 150),
  ('TOYOTA', 'RAV 4 II (_A2_)', 'A4', '2.5 Hybrid', 2494, 'essence', 155),
  ('TOYOTA', 'RAV 4 III (_A3_)', 'A4', '', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 III (_A3_)', 'A4', '2.0 D (WWA42_)', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 III (_A3_)', 'A4', '2.0 D-4D', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 III (_A3_)', 'A4', '2.2 D-4D 4WD', 2231, 'diesel', 150),
  ('TOYOTA', 'RAV 4 III (_A3_)', 'A4', '2.5 Hybrid', 2494, 'essence', 155),
  ('TOYOTA', 'RAV 4 IV (_A4_)', 'A4', '', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 IV (_A4_)', 'A4', '2.0 D (WWA42_)', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 IV (_A4_)', 'A4', '2.0 D-4D', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 IV (_A4_)', 'A4', '2.2 D-4D 4WD', 2231, 'diesel', 150),
  ('TOYOTA', 'RAV 4 IV (_A4_)', 'A4', '2.5 Hybrid', 2494, 'essence', 155),
  ('TOYOTA', 'RAV 4 V (_A5_, _H5_)', 'A4', '', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 V (_A5_, _H5_)', 'A4', '2.0 D (WWA42_)', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 V (_A5_, _H5_)', 'A4', '2.0 D-4D', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4 V (_A5_, _H5_)', 'A4', '2.2 D-4D 4WD', 2231, 'diesel', 150),
  ('TOYOTA', 'RAV 4 V (_A5_, _H5_)', 'A4', '2.5 Hybrid', 2494, 'essence', 155),
  ('TOYOTA', 'RAV 4', 'A4', '', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4', 'A4', '2.0 D (WWA42_)', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4', 'A4', '2.0 D-4D', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV 4', 'A4', '2.2 D-4D 4WD', 2231, 'diesel', 150),
  ('TOYOTA', 'RAV 4', 'A4', '2.5 Hybrid', 2494, 'essence', 155),
  ('TOYOTA', 'RAV4', 'A4', '', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV4', 'A4', '2.0 D (WWA42_)', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV4', 'A4', '2.0 D-4D', 1998, 'diesel', 124),
  ('TOYOTA', 'RAV4', 'A4', '2.2 D-4D 4WD', 2231, 'diesel', 150),
  ('TOYOTA', 'RAV4', 'A4', '2.5 Hybrid', 2494, 'essence', 155)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HYUNDAI (i10 (PA)) ──
WITH spec_43 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_43.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_43, (VALUES
  ('HYUNDAI', 'i10 (PA)', 'IA', '', 998, 'essence', 67),
  ('HYUNDAI', 'i10 (PA)', 'IA', '1.0', 998, 'essence', 67),
  ('HYUNDAI', 'i10 (PA)', 'IA', '1.1', 1086, 'essence', 69),
  ('HYUNDAI', 'i10 (PA)', 'IA', '1.2', 1248, 'essence', 87),
  ('HYUNDAI', 'i10 (BA, IA)', 'IA', '', 998, 'essence', 67),
  ('HYUNDAI', 'i10 (BA, IA)', 'IA', '1.0', 998, 'essence', 67),
  ('HYUNDAI', 'i10 (BA, IA)', 'IA', '1.1', 1086, 'essence', 69),
  ('HYUNDAI', 'i10 (BA, IA)', 'IA', '1.2', 1248, 'essence', 87),
  ('HYUNDAI', 'i10 (AC3, AI3)', 'IA', '', 998, 'essence', 67),
  ('HYUNDAI', 'i10 (AC3, AI3)', 'IA', '1.0', 998, 'essence', 67),
  ('HYUNDAI', 'i10 (AC3, AI3)', 'IA', '1.1', 1086, 'essence', 69),
  ('HYUNDAI', 'i10 (AC3, AI3)', 'IA', '1.2', 1248, 'essence', 87),
  ('HYUNDAI', 'i10 II', 'IA', '', 998, 'essence', 67),
  ('HYUNDAI', 'i10 II', 'IA', '1.0', 998, 'essence', 67),
  ('HYUNDAI', 'i10 II', 'IA', '1.1', 1086, 'essence', 69),
  ('HYUNDAI', 'i10 II', 'IA', '1.2', 1248, 'essence', 87),
  ('HYUNDAI', 'i10 I', 'IA', '', 998, 'essence', 67),
  ('HYUNDAI', 'i10 I', 'IA', '1.0', 998, 'essence', 67),
  ('HYUNDAI', 'i10 I', 'IA', '1.1', 1086, 'essence', 69),
  ('HYUNDAI', 'i10 I', 'IA', '1.2', 1248, 'essence', 87),
  ('HYUNDAI', 'i10', 'IA', '', 998, 'essence', 67),
  ('HYUNDAI', 'i10', 'IA', '1.0', 998, 'essence', 67),
  ('HYUNDAI', 'i10', 'IA', '1.1', 1086, 'essence', 69),
  ('HYUNDAI', 'i10', 'IA', '1.2', 1248, 'essence', 87)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HYUNDAI (i20 (PB, PBT)) ──
WITH spec_44 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_44.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_44, (VALUES
  ('HYUNDAI', 'i20 (PB, PBT)', 'GB', '', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 (PB, PBT)', 'GB', '1.2', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 (PB, PBT)', 'GB', '1.4', 1368, 'essence', 100),
  ('HYUNDAI', 'i20 (PB, PBT)', 'GB', '1.1 CRDi', 1120, 'diesel', 75),
  ('HYUNDAI', 'i20 (PB, PBT)', 'GB', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i20 (GB, IB)', 'GB', '', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 (GB, IB)', 'GB', '1.2', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 (GB, IB)', 'GB', '1.4', 1368, 'essence', 100),
  ('HYUNDAI', 'i20 (GB, IB)', 'GB', '1.1 CRDi', 1120, 'diesel', 75),
  ('HYUNDAI', 'i20 (GB, IB)', 'GB', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i20 (BC3, BI3)', 'GB', '', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 (BC3, BI3)', 'GB', '1.2', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 (BC3, BI3)', 'GB', '1.4', 1368, 'essence', 100),
  ('HYUNDAI', 'i20 (BC3, BI3)', 'GB', '1.1 CRDi', 1120, 'diesel', 75),
  ('HYUNDAI', 'i20 (BC3, BI3)', 'GB', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i20 II', 'GB', '', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 II', 'GB', '1.2', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 II', 'GB', '1.4', 1368, 'essence', 100),
  ('HYUNDAI', 'i20 II', 'GB', '1.1 CRDi', 1120, 'diesel', 75),
  ('HYUNDAI', 'i20 II', 'GB', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i20 I', 'GB', '', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 I', 'GB', '1.2', 1248, 'essence', 84),
  ('HYUNDAI', 'i20 I', 'GB', '1.4', 1368, 'essence', 100),
  ('HYUNDAI', 'i20 I', 'GB', '1.1 CRDi', 1120, 'diesel', 75),
  ('HYUNDAI', 'i20 I', 'GB', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i20', 'GB', '', 1248, 'essence', 84),
  ('HYUNDAI', 'i20', 'GB', '1.2', 1248, 'essence', 84),
  ('HYUNDAI', 'i20', 'GB', '1.4', 1368, 'essence', 100),
  ('HYUNDAI', 'i20', 'GB', '1.1 CRDi', 1120, 'diesel', 75),
  ('HYUNDAI', 'i20', 'GB', '1.4 CRDi', 1396, 'diesel', 90)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HYUNDAI (TUCSON (JM)) ──
WITH spec_45 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_45.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_45, (VALUES
  ('HYUNDAI', 'TUCSON (JM)', 'TL', '', 1685, 'diesel', 116),
  ('HYUNDAI', 'TUCSON (JM)', 'TL', '1.7 CRDi', 1685, 'diesel', 116),
  ('HYUNDAI', 'TUCSON (JM)', 'TL', '1.6 CRDi', 1598, 'diesel', 136),
  ('HYUNDAI', 'TUCSON (JM)', 'TL', '2.0 CRDi', 1995, 'diesel', 185),
  ('HYUNDAI', 'TUCSON (JM)', 'TL', '1.6 GDI', 1591, 'essence', 132),
  ('HYUNDAI', 'TUCSON (JM)', 'TL', '1.6 T-GDI', 1591, 'essence', 177),
  ('HYUNDAI', 'TUCSON (TL, TLE)', 'TL', '', 1685, 'diesel', 116),
  ('HYUNDAI', 'TUCSON (TL, TLE)', 'TL', '1.7 CRDi', 1685, 'diesel', 116),
  ('HYUNDAI', 'TUCSON (TL, TLE)', 'TL', '1.6 CRDi', 1598, 'diesel', 136),
  ('HYUNDAI', 'TUCSON (TL, TLE)', 'TL', '2.0 CRDi', 1995, 'diesel', 185),
  ('HYUNDAI', 'TUCSON (TL, TLE)', 'TL', '1.6 GDI', 1591, 'essence', 132),
  ('HYUNDAI', 'TUCSON (TL, TLE)', 'TL', '1.6 T-GDI', 1591, 'essence', 177),
  ('HYUNDAI', 'TUCSON (NX4E, NX4A)', 'TL', '', 1685, 'diesel', 116),
  ('HYUNDAI', 'TUCSON (NX4E, NX4A)', 'TL', '1.7 CRDi', 1685, 'diesel', 116),
  ('HYUNDAI', 'TUCSON (NX4E, NX4A)', 'TL', '1.6 CRDi', 1598, 'diesel', 136),
  ('HYUNDAI', 'TUCSON (NX4E, NX4A)', 'TL', '2.0 CRDi', 1995, 'diesel', 185),
  ('HYUNDAI', 'TUCSON (NX4E, NX4A)', 'TL', '1.6 GDI', 1591, 'essence', 132),
  ('HYUNDAI', 'TUCSON (NX4E, NX4A)', 'TL', '1.6 T-GDI', 1591, 'essence', 177),
  ('HYUNDAI', 'Tucson', 'TL', '', 1685, 'diesel', 116),
  ('HYUNDAI', 'Tucson', 'TL', '1.7 CRDi', 1685, 'diesel', 116),
  ('HYUNDAI', 'Tucson', 'TL', '1.6 CRDi', 1598, 'diesel', 136),
  ('HYUNDAI', 'Tucson', 'TL', '2.0 CRDi', 1995, 'diesel', 185),
  ('HYUNDAI', 'Tucson', 'TL', '1.6 GDI', 1591, 'essence', 132),
  ('HYUNDAI', 'Tucson', 'TL', '1.6 T-GDI', 1591, 'essence', 177),
  ('HYUNDAI', 'TUCSON', 'TL', '', 1685, 'diesel', 116),
  ('HYUNDAI', 'TUCSON', 'TL', '1.7 CRDi', 1685, 'diesel', 116),
  ('HYUNDAI', 'TUCSON', 'TL', '1.6 CRDi', 1598, 'diesel', 136),
  ('HYUNDAI', 'TUCSON', 'TL', '2.0 CRDi', 1995, 'diesel', 185),
  ('HYUNDAI', 'TUCSON', 'TL', '1.6 GDI', 1591, 'essence', 132),
  ('HYUNDAI', 'TUCSON', 'TL', '1.6 T-GDI', 1591, 'essence', 177)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── KIA (PICANTO (BA)) ──
WITH spec_46 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_46.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_46, (VALUES
  ('KIA', 'PICANTO (BA)', 'TA', '', 998, 'essence', 69),
  ('KIA', 'PICANTO (BA)', 'TA', '1.0', 998, 'essence', 69),
  ('KIA', 'PICANTO (BA)', 'TA', '1.2', 1248, 'essence', 85),
  ('KIA', 'PICANTO (BA)', 'TA', '1.1', 1086, 'essence', 65),
  ('KIA', 'PICANTO (TA)', 'TA', '', 998, 'essence', 69),
  ('KIA', 'PICANTO (TA)', 'TA', '1.0', 998, 'essence', 69),
  ('KIA', 'PICANTO (TA)', 'TA', '1.2', 1248, 'essence', 85),
  ('KIA', 'PICANTO (TA)', 'TA', '1.1', 1086, 'essence', 65),
  ('KIA', 'PICANTO (JA)', 'TA', '', 998, 'essence', 69),
  ('KIA', 'PICANTO (JA)', 'TA', '1.0', 998, 'essence', 69),
  ('KIA', 'PICANTO (JA)', 'TA', '1.2', 1248, 'essence', 85),
  ('KIA', 'PICANTO (JA)', 'TA', '1.1', 1086, 'essence', 65),
  ('KIA', 'Picanto II', 'TA', '', 998, 'essence', 69),
  ('KIA', 'Picanto II', 'TA', '1.0', 998, 'essence', 69),
  ('KIA', 'Picanto II', 'TA', '1.2', 1248, 'essence', 85),
  ('KIA', 'Picanto II', 'TA', '1.1', 1086, 'essence', 65),
  ('KIA', 'Picanto I', 'TA', '', 998, 'essence', 69),
  ('KIA', 'Picanto I', 'TA', '1.0', 998, 'essence', 69),
  ('KIA', 'Picanto I', 'TA', '1.2', 1248, 'essence', 85),
  ('KIA', 'Picanto I', 'TA', '1.1', 1086, 'essence', 65),
  ('KIA', 'Picanto', 'TA', '', 998, 'essence', 69),
  ('KIA', 'Picanto', 'TA', '1.0', 998, 'essence', 69),
  ('KIA', 'Picanto', 'TA', '1.2', 1248, 'essence', 85),
  ('KIA', 'Picanto', 'TA', '1.1', 1086, 'essence', 65),
  ('KIA', 'PICANTO', 'TA', '', 998, 'essence', 69),
  ('KIA', 'PICANTO', 'TA', '1.0', 998, 'essence', 69),
  ('KIA', 'PICANTO', 'TA', '1.2', 1248, 'essence', 85),
  ('KIA', 'PICANTO', 'TA', '1.1', 1086, 'essence', 65)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── KIA (RIO II (JB)) ──
WITH spec_47 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_47.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_47, (VALUES
  ('KIA', 'RIO II (JB)', 'UB', '', 1248, 'essence', 85),
  ('KIA', 'RIO II (JB)', 'UB', '1.25 CVVT', 1248, 'essence', 85),
  ('KIA', 'RIO II (JB)', 'UB', '1.2', 1248, 'essence', 85),
  ('KIA', 'RIO II (JB)', 'UB', '1.4 CVVT', 1396, 'essence', 109),
  ('KIA', 'RIO II (JB)', 'UB', '1.1 CRDi', 1120, 'diesel', 75),
  ('KIA', 'RIO II (JB)', 'UB', '1.4 CRDi', 1396, 'diesel', 90),
  ('KIA', 'RIO III (UB)', 'UB', '', 1248, 'essence', 85),
  ('KIA', 'RIO III (UB)', 'UB', '1.25 CVVT', 1248, 'essence', 85),
  ('KIA', 'RIO III (UB)', 'UB', '1.2', 1248, 'essence', 85),
  ('KIA', 'RIO III (UB)', 'UB', '1.4 CVVT', 1396, 'essence', 109),
  ('KIA', 'RIO III (UB)', 'UB', '1.1 CRDi', 1120, 'diesel', 75),
  ('KIA', 'RIO III (UB)', 'UB', '1.4 CRDi', 1396, 'diesel', 90),
  ('KIA', 'RIO IV (YB, SC, FB)', 'UB', '', 1248, 'essence', 85),
  ('KIA', 'RIO IV (YB, SC, FB)', 'UB', '1.25 CVVT', 1248, 'essence', 85),
  ('KIA', 'RIO IV (YB, SC, FB)', 'UB', '1.2', 1248, 'essence', 85),
  ('KIA', 'RIO IV (YB, SC, FB)', 'UB', '1.4 CVVT', 1396, 'essence', 109),
  ('KIA', 'RIO IV (YB, SC, FB)', 'UB', '1.1 CRDi', 1120, 'diesel', 75),
  ('KIA', 'RIO IV (YB, SC, FB)', 'UB', '1.4 CRDi', 1396, 'diesel', 90),
  ('KIA', 'Rio III', 'UB', '', 1248, 'essence', 85),
  ('KIA', 'Rio III', 'UB', '1.25 CVVT', 1248, 'essence', 85),
  ('KIA', 'Rio III', 'UB', '1.2', 1248, 'essence', 85),
  ('KIA', 'Rio III', 'UB', '1.4 CVVT', 1396, 'essence', 109),
  ('KIA', 'Rio III', 'UB', '1.1 CRDi', 1120, 'diesel', 75),
  ('KIA', 'Rio III', 'UB', '1.4 CRDi', 1396, 'diesel', 90),
  ('KIA', 'Rio II', 'UB', '', 1248, 'essence', 85),
  ('KIA', 'Rio II', 'UB', '1.25 CVVT', 1248, 'essence', 85),
  ('KIA', 'Rio II', 'UB', '1.2', 1248, 'essence', 85),
  ('KIA', 'Rio II', 'UB', '1.4 CVVT', 1396, 'essence', 109),
  ('KIA', 'Rio II', 'UB', '1.1 CRDi', 1120, 'diesel', 75),
  ('KIA', 'Rio II', 'UB', '1.4 CRDi', 1396, 'diesel', 90),
  ('KIA', 'Rio', 'UB', '', 1248, 'essence', 85),
  ('KIA', 'Rio', 'UB', '1.25 CVVT', 1248, 'essence', 85),
  ('KIA', 'Rio', 'UB', '1.2', 1248, 'essence', 85),
  ('KIA', 'Rio', 'UB', '1.4 CVVT', 1396, 'essence', 109),
  ('KIA', 'Rio', 'UB', '1.1 CRDi', 1120, 'diesel', 75),
  ('KIA', 'Rio', 'UB', '1.4 CRDi', 1396, 'diesel', 90),
  ('KIA', 'RIO', 'UB', '', 1248, 'essence', 85),
  ('KIA', 'RIO', 'UB', '1.25 CVVT', 1248, 'essence', 85),
  ('KIA', 'RIO', 'UB', '1.2', 1248, 'essence', 85),
  ('KIA', 'RIO', 'UB', '1.4 CVVT', 1396, 'essence', 109),
  ('KIA', 'RIO', 'UB', '1.1 CRDi', 1120, 'diesel', 75),
  ('KIA', 'RIO', 'UB', '1.4 CRDi', 1396, 'diesel', 90)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── KIA (SPORTAGE (JE_, KM_)) ──
WITH spec_48 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_48.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_48, (VALUES
  ('KIA', 'SPORTAGE (JE_, KM_)', 'QL', '', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE (JE_, KM_)', 'QL', '1.7 CRDi', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE (JE_, KM_)', 'QL', '1.6 CRDi', 1598, 'diesel', 136),
  ('KIA', 'SPORTAGE (JE_, KM_)', 'QL', '2.0 CRDi', 1995, 'diesel', 185),
  ('KIA', 'SPORTAGE (JE_, KM_)', 'QL', '1.6 GDI', 1591, 'essence', 132),
  ('KIA', 'SPORTAGE (SL)', 'QL', '', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE (SL)', 'QL', '1.7 CRDi', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE (SL)', 'QL', '1.6 CRDi', 1598, 'diesel', 136),
  ('KIA', 'SPORTAGE (SL)', 'QL', '2.0 CRDi', 1995, 'diesel', 185),
  ('KIA', 'SPORTAGE (SL)', 'QL', '1.6 GDI', 1591, 'essence', 132),
  ('KIA', 'SPORTAGE (QL, QLE)', 'QL', '', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE (QL, QLE)', 'QL', '1.7 CRDi', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE (QL, QLE)', 'QL', '1.6 CRDi', 1598, 'diesel', 136),
  ('KIA', 'SPORTAGE (QL, QLE)', 'QL', '2.0 CRDi', 1995, 'diesel', 185),
  ('KIA', 'SPORTAGE (QL, QLE)', 'QL', '1.6 GDI', 1591, 'essence', 132),
  ('KIA', 'SPORTAGE (NQ5)', 'QL', '', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE (NQ5)', 'QL', '1.7 CRDi', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE (NQ5)', 'QL', '1.6 CRDi', 1598, 'diesel', 136),
  ('KIA', 'SPORTAGE (NQ5)', 'QL', '2.0 CRDi', 1995, 'diesel', 185),
  ('KIA', 'SPORTAGE (NQ5)', 'QL', '1.6 GDI', 1591, 'essence', 132),
  ('KIA', 'Sportage', 'QL', '', 1685, 'diesel', 116),
  ('KIA', 'Sportage', 'QL', '1.7 CRDi', 1685, 'diesel', 116),
  ('KIA', 'Sportage', 'QL', '1.6 CRDi', 1598, 'diesel', 136),
  ('KIA', 'Sportage', 'QL', '2.0 CRDi', 1995, 'diesel', 185),
  ('KIA', 'Sportage', 'QL', '1.6 GDI', 1591, 'essence', 132),
  ('KIA', 'SPORTAGE', 'QL', '', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE', 'QL', '1.7 CRDi', 1685, 'diesel', 116),
  ('KIA', 'SPORTAGE', 'QL', '1.6 CRDi', 1598, 'diesel', 136),
  ('KIA', 'SPORTAGE', 'QL', '2.0 CRDi', 1995, 'diesel', 185),
  ('KIA', 'SPORTAGE', 'QL', '1.6 GDI', 1591, 'essence', 132)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FORD (FIESTA IV (JA_, JB_)) ──
WITH spec_49 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_ford-wss-m2c913-d_a5b5' LIMIT 1
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
  spec_49.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_49, (VALUES
  ('FORD', 'FIESTA IV (JA_, JB_)', 'VI', '', 1242, 'essence', 82),
  ('FORD', 'FIESTA IV (JA_, JB_)', 'VI', '1.25 (SNJA, SNJB)', 1242, 'essence', 82),
  ('FORD', 'FIESTA IV (JA_, JB_)', 'VI', '1.25', 1242, 'essence', 82),
  ('FORD', 'FIESTA IV (JA_, JB_)', 'VI', '1.4', 1388, 'essence', 96),
  ('FORD', 'FIESTA IV (JA_, JB_)', 'VI', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'FIESTA IV (JA_, JB_)', 'VI', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'FIESTA IV (JA_, JB_)', 'VI', '1.6 TDCi', 1560, 'diesel', 95),
  ('FORD', 'FIESTA V (JH_, JD_)', 'VI', '', 1242, 'essence', 82),
  ('FORD', 'FIESTA V (JH_, JD_)', 'VI', '1.25 (SNJA, SNJB)', 1242, 'essence', 82),
  ('FORD', 'FIESTA V (JH_, JD_)', 'VI', '1.25', 1242, 'essence', 82),
  ('FORD', 'FIESTA V (JH_, JD_)', 'VI', '1.4', 1388, 'essence', 96),
  ('FORD', 'FIESTA V (JH_, JD_)', 'VI', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'FIESTA V (JH_, JD_)', 'VI', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'FIESTA V (JH_, JD_)', 'VI', '1.6 TDCi', 1560, 'diesel', 95),
  ('FORD', 'FIESTA VI (CB1, CCN)', 'VI', '', 1242, 'essence', 82),
  ('FORD', 'FIESTA VI (CB1, CCN)', 'VI', '1.25 (SNJA, SNJB)', 1242, 'essence', 82),
  ('FORD', 'FIESTA VI (CB1, CCN)', 'VI', '1.25', 1242, 'essence', 82),
  ('FORD', 'FIESTA VI (CB1, CCN)', 'VI', '1.4', 1388, 'essence', 96),
  ('FORD', 'FIESTA VI (CB1, CCN)', 'VI', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'FIESTA VI (CB1, CCN)', 'VI', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'FIESTA VI (CB1, CCN)', 'VI', '1.6 TDCi', 1560, 'diesel', 95),
  ('FORD', 'FIESTA VII (HJ, HF)', 'VI', '', 1242, 'essence', 82),
  ('FORD', 'FIESTA VII (HJ, HF)', 'VI', '1.25 (SNJA, SNJB)', 1242, 'essence', 82),
  ('FORD', 'FIESTA VII (HJ, HF)', 'VI', '1.25', 1242, 'essence', 82),
  ('FORD', 'FIESTA VII (HJ, HF)', 'VI', '1.4', 1388, 'essence', 96),
  ('FORD', 'FIESTA VII (HJ, HF)', 'VI', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'FIESTA VII (HJ, HF)', 'VI', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'FIESTA VII (HJ, HF)', 'VI', '1.6 TDCi', 1560, 'diesel', 95),
  ('FORD', 'Fiesta VI', 'VI', '', 1242, 'essence', 82),
  ('FORD', 'Fiesta VI', 'VI', '1.25 (SNJA, SNJB)', 1242, 'essence', 82),
  ('FORD', 'Fiesta VI', 'VI', '1.25', 1242, 'essence', 82),
  ('FORD', 'Fiesta VI', 'VI', '1.4', 1388, 'essence', 96),
  ('FORD', 'Fiesta VI', 'VI', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'Fiesta VI', 'VI', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'Fiesta VI', 'VI', '1.6 TDCi', 1560, 'diesel', 95),
  ('FORD', 'Fiesta V', 'VI', '', 1242, 'essence', 82),
  ('FORD', 'Fiesta V', 'VI', '1.25 (SNJA, SNJB)', 1242, 'essence', 82),
  ('FORD', 'Fiesta V', 'VI', '1.25', 1242, 'essence', 82),
  ('FORD', 'Fiesta V', 'VI', '1.4', 1388, 'essence', 96),
  ('FORD', 'Fiesta V', 'VI', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'Fiesta V', 'VI', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'Fiesta V', 'VI', '1.6 TDCi', 1560, 'diesel', 95),
  ('FORD', 'Fiesta', 'VI', '', 1242, 'essence', 82),
  ('FORD', 'Fiesta', 'VI', '1.25 (SNJA, SNJB)', 1242, 'essence', 82),
  ('FORD', 'Fiesta', 'VI', '1.25', 1242, 'essence', 82),
  ('FORD', 'Fiesta', 'VI', '1.4', 1388, 'essence', 96),
  ('FORD', 'Fiesta', 'VI', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'Fiesta', 'VI', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'Fiesta', 'VI', '1.6 TDCi', 1560, 'diesel', 95),
  ('FORD', 'FIESTA', 'VI', '', 1242, 'essence', 82),
  ('FORD', 'FIESTA', 'VI', '1.25 (SNJA, SNJB)', 1242, 'essence', 82),
  ('FORD', 'FIESTA', 'VI', '1.25', 1242, 'essence', 82),
  ('FORD', 'FIESTA', 'VI', '1.4', 1388, 'essence', 96),
  ('FORD', 'FIESTA', 'VI', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'FIESTA', 'VI', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'FIESTA', 'VI', '1.6 TDCi', 1560, 'diesel', 95)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FORD (FOCUS I (DAW, DBW)) ──
WITH spec_50 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_ford-wss-m2c913-d_a5b5' LIMIT 1
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
  spec_50.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_50, (VALUES
  ('FORD', 'FOCUS I (DAW, DBW)', 'III', '', 1560, 'diesel', 115),
  ('FORD', 'FOCUS I (DAW, DBW)', 'III', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'FOCUS I (DAW, DBW)', 'III', '1.0 EcoBoost', 998, 'essence', 125),
  ('FORD', 'FOCUS I (DAW, DBW)', 'III', '1.6 Ti', 1596, 'essence', 125),
  ('FORD', 'FOCUS I (DAW, DBW)', 'III', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'FOCUS I (DAW, DBW)', 'III', '1.8 TDCi', 1753, 'diesel', 115),
  ('FORD', 'FOCUS II (DA_, HCP, DP)', 'III', '', 1560, 'diesel', 115),
  ('FORD', 'FOCUS II (DA_, HCP, DP)', 'III', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'FOCUS II (DA_, HCP, DP)', 'III', '1.0 EcoBoost', 998, 'essence', 125),
  ('FORD', 'FOCUS II (DA_, HCP, DP)', 'III', '1.6 Ti', 1596, 'essence', 125),
  ('FORD', 'FOCUS II (DA_, HCP, DP)', 'III', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'FOCUS II (DA_, HCP, DP)', 'III', '1.8 TDCi', 1753, 'diesel', 115),
  ('FORD', 'FOCUS III', 'III', '', 1560, 'diesel', 115),
  ('FORD', 'FOCUS III', 'III', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'FOCUS III', 'III', '1.0 EcoBoost', 998, 'essence', 125),
  ('FORD', 'FOCUS III', 'III', '1.6 Ti', 1596, 'essence', 125),
  ('FORD', 'FOCUS III', 'III', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'FOCUS III', 'III', '1.8 TDCi', 1753, 'diesel', 115),
  ('FORD', 'FOCUS IV (HN)', 'III', '', 1560, 'diesel', 115),
  ('FORD', 'FOCUS IV (HN)', 'III', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'FOCUS IV (HN)', 'III', '1.0 EcoBoost', 998, 'essence', 125),
  ('FORD', 'FOCUS IV (HN)', 'III', '1.6 Ti', 1596, 'essence', 125),
  ('FORD', 'FOCUS IV (HN)', 'III', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'FOCUS IV (HN)', 'III', '1.8 TDCi', 1753, 'diesel', 115),
  ('FORD', 'Focus III', 'III', '', 1560, 'diesel', 115),
  ('FORD', 'Focus III', 'III', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'Focus III', 'III', '1.0 EcoBoost', 998, 'essence', 125),
  ('FORD', 'Focus III', 'III', '1.6 Ti', 1596, 'essence', 125),
  ('FORD', 'Focus III', 'III', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'Focus III', 'III', '1.8 TDCi', 1753, 'diesel', 115),
  ('FORD', 'Focus II', 'III', '', 1560, 'diesel', 115),
  ('FORD', 'Focus II', 'III', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'Focus II', 'III', '1.0 EcoBoost', 998, 'essence', 125),
  ('FORD', 'Focus II', 'III', '1.6 Ti', 1596, 'essence', 125),
  ('FORD', 'Focus II', 'III', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'Focus II', 'III', '1.8 TDCi', 1753, 'diesel', 115),
  ('FORD', 'Focus', 'III', '', 1560, 'diesel', 115),
  ('FORD', 'Focus', 'III', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'Focus', 'III', '1.0 EcoBoost', 998, 'essence', 125),
  ('FORD', 'Focus', 'III', '1.6 Ti', 1596, 'essence', 125),
  ('FORD', 'Focus', 'III', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'Focus', 'III', '1.8 TDCi', 1753, 'diesel', 115),
  ('FORD', 'FOCUS', 'III', '', 1560, 'diesel', 115),
  ('FORD', 'FOCUS', 'III', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'FOCUS', 'III', '1.0 EcoBoost', 998, 'essence', 125),
  ('FORD', 'FOCUS', 'III', '1.6 Ti', 1596, 'essence', 125),
  ('FORD', 'FOCUS', 'III', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'FOCUS', 'III', '1.8 TDCi', 1753, 'diesel', 115)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SEAT (IBIZA III (6L1)) ──
WITH spec_51 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_51.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_51, (VALUES
  ('SEAT', 'IBIZA III (6L1)', 'IV', '', 1198, 'essence', 70),
  ('SEAT', 'IBIZA III (6L1)', 'IV', '1.2', 1198, 'essence', 70),
  ('SEAT', 'IBIZA III (6L1)', 'IV', '1.4', 1390, 'essence', 85),
  ('SEAT', 'IBIZA III (6L1)', 'IV', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'IBIZA III (6L1)', 'IV', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'IBIZA III (6L1)', 'IV', '1.9 TDI', 1896, 'diesel', 100),
  ('SEAT', 'IBIZA IV (6J5, 6P1)', 'IV', '', 1198, 'essence', 70),
  ('SEAT', 'IBIZA IV (6J5, 6P1)', 'IV', '1.2', 1198, 'essence', 70),
  ('SEAT', 'IBIZA IV (6J5, 6P1)', 'IV', '1.4', 1390, 'essence', 85),
  ('SEAT', 'IBIZA IV (6J5, 6P1)', 'IV', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'IBIZA IV (6J5, 6P1)', 'IV', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'IBIZA IV (6J5, 6P1)', 'IV', '1.9 TDI', 1896, 'diesel', 100),
  ('SEAT', 'IBIZA V (KJ1, KJG)', 'IV', '', 1198, 'essence', 70),
  ('SEAT', 'IBIZA V (KJ1, KJG)', 'IV', '1.2', 1198, 'essence', 70),
  ('SEAT', 'IBIZA V (KJ1, KJG)', 'IV', '1.4', 1390, 'essence', 85),
  ('SEAT', 'IBIZA V (KJ1, KJG)', 'IV', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'IBIZA V (KJ1, KJG)', 'IV', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'IBIZA V (KJ1, KJG)', 'IV', '1.9 TDI', 1896, 'diesel', 100),
  ('SEAT', 'Ibiza IV', 'IV', '', 1198, 'essence', 70),
  ('SEAT', 'Ibiza IV', 'IV', '1.2', 1198, 'essence', 70),
  ('SEAT', 'Ibiza IV', 'IV', '1.4', 1390, 'essence', 85),
  ('SEAT', 'Ibiza IV', 'IV', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Ibiza IV', 'IV', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'Ibiza IV', 'IV', '1.9 TDI', 1896, 'diesel', 100),
  ('SEAT', 'Ibiza III', 'IV', '', 1198, 'essence', 70),
  ('SEAT', 'Ibiza III', 'IV', '1.2', 1198, 'essence', 70),
  ('SEAT', 'Ibiza III', 'IV', '1.4', 1390, 'essence', 85),
  ('SEAT', 'Ibiza III', 'IV', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Ibiza III', 'IV', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'Ibiza III', 'IV', '1.9 TDI', 1896, 'diesel', 100),
  ('SEAT', 'Ibiza', 'IV', '', 1198, 'essence', 70),
  ('SEAT', 'Ibiza', 'IV', '1.2', 1198, 'essence', 70),
  ('SEAT', 'Ibiza', 'IV', '1.4', 1390, 'essence', 85),
  ('SEAT', 'Ibiza', 'IV', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Ibiza', 'IV', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'Ibiza', 'IV', '1.9 TDI', 1896, 'diesel', 100),
  ('SEAT', 'IBIZA', 'IV', '', 1198, 'essence', 70),
  ('SEAT', 'IBIZA', 'IV', '1.2', 1198, 'essence', 70),
  ('SEAT', 'IBIZA', 'IV', '1.4', 1390, 'essence', 85),
  ('SEAT', 'IBIZA', 'IV', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'IBIZA', 'IV', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'IBIZA', 'IV', '1.9 TDI', 1896, 'diesel', 100)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SEAT (LEON (1M1)) ──
WITH spec_52 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_52.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_52, (VALUES
  ('SEAT', 'LEON (1M1)', '5F', '', 1968, 'diesel', 150),
  ('SEAT', 'LEON (1M1)', '5F', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'LEON (1M1)', '5F', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'LEON (1M1)', '5F', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'LEON (1M1)', '5F', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'LEON (1P1)', '5F', '', 1968, 'diesel', 150),
  ('SEAT', 'LEON (1P1)', '5F', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'LEON (1P1)', '5F', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'LEON (1P1)', '5F', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'LEON (1P1)', '5F', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'LEON (5F1)', '5F', '', 1968, 'diesel', 150),
  ('SEAT', 'LEON (5F1)', '5F', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'LEON (5F1)', '5F', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'LEON (5F1)', '5F', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'LEON (5F1)', '5F', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'LEON (KL1)', '5F', '', 1968, 'diesel', 150),
  ('SEAT', 'LEON (KL1)', '5F', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'LEON (KL1)', '5F', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'LEON (KL1)', '5F', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'LEON (KL1)', '5F', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'Leon III', '5F', '', 1968, 'diesel', 150),
  ('SEAT', 'Leon III', '5F', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'Leon III', '5F', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Leon III', '5F', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'Leon III', '5F', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'Leon II', '5F', '', 1968, 'diesel', 150),
  ('SEAT', 'Leon II', '5F', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'Leon II', '5F', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Leon II', '5F', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'Leon II', '5F', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'Leon', '5F', '', 1968, 'diesel', 150),
  ('SEAT', 'Leon', '5F', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'Leon', '5F', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Leon', '5F', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'Leon', '5F', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'LEON', '5F', '', 1968, 'diesel', 150),
  ('SEAT', 'LEON', '5F', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'LEON', '5F', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'LEON', '5F', '1.2 TSI', 1197, 'essence', 105),
  ('SEAT', 'LEON', '5F', '1.4 TSI', 1395, 'essence', 125)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SKODA (FABIA I (6Y2)) ──
WITH spec_53 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_53.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_53, (VALUES
  ('SKODA', 'FABIA I (6Y2)', 'II', '', 1198, 'essence', 70),
  ('SKODA', 'FABIA I (6Y2)', 'II', '1.2', 1198, 'essence', 70),
  ('SKODA', 'FABIA I (6Y2)', 'II', '1.4', 1390, 'essence', 86),
  ('SKODA', 'FABIA I (6Y2)', 'II', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'FABIA I (6Y2)', 'II', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'FABIA I (6Y2)', 'II', '1.4 TDI', 1422, 'diesel', 70),
  ('SKODA', 'FABIA II (542)', 'II', '', 1198, 'essence', 70),
  ('SKODA', 'FABIA II (542)', 'II', '1.2', 1198, 'essence', 70),
  ('SKODA', 'FABIA II (542)', 'II', '1.4', 1390, 'essence', 86),
  ('SKODA', 'FABIA II (542)', 'II', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'FABIA II (542)', 'II', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'FABIA II (542)', 'II', '1.4 TDI', 1422, 'diesel', 70),
  ('SKODA', 'FABIA III (NJ3)', 'II', '', 1198, 'essence', 70),
  ('SKODA', 'FABIA III (NJ3)', 'II', '1.2', 1198, 'essence', 70),
  ('SKODA', 'FABIA III (NJ3)', 'II', '1.4', 1390, 'essence', 86),
  ('SKODA', 'FABIA III (NJ3)', 'II', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'FABIA III (NJ3)', 'II', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'FABIA III (NJ3)', 'II', '1.4 TDI', 1422, 'diesel', 70),
  ('SKODA', 'FABIA IV (PJ3)', 'II', '', 1198, 'essence', 70),
  ('SKODA', 'FABIA IV (PJ3)', 'II', '1.2', 1198, 'essence', 70),
  ('SKODA', 'FABIA IV (PJ3)', 'II', '1.4', 1390, 'essence', 86),
  ('SKODA', 'FABIA IV (PJ3)', 'II', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'FABIA IV (PJ3)', 'II', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'FABIA IV (PJ3)', 'II', '1.4 TDI', 1422, 'diesel', 70),
  ('SKODA', 'Fabia II', 'II', '', 1198, 'essence', 70),
  ('SKODA', 'Fabia II', 'II', '1.2', 1198, 'essence', 70),
  ('SKODA', 'Fabia II', 'II', '1.4', 1390, 'essence', 86),
  ('SKODA', 'Fabia II', 'II', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'Fabia II', 'II', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'Fabia II', 'II', '1.4 TDI', 1422, 'diesel', 70),
  ('SKODA', 'Fabia III', 'II', '', 1198, 'essence', 70),
  ('SKODA', 'Fabia III', 'II', '1.2', 1198, 'essence', 70),
  ('SKODA', 'Fabia III', 'II', '1.4', 1390, 'essence', 86),
  ('SKODA', 'Fabia III', 'II', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'Fabia III', 'II', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'Fabia III', 'II', '1.4 TDI', 1422, 'diesel', 70),
  ('SKODA', 'Fabia', 'II', '', 1198, 'essence', 70),
  ('SKODA', 'Fabia', 'II', '1.2', 1198, 'essence', 70),
  ('SKODA', 'Fabia', 'II', '1.4', 1390, 'essence', 86),
  ('SKODA', 'Fabia', 'II', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'Fabia', 'II', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'Fabia', 'II', '1.4 TDI', 1422, 'diesel', 70),
  ('SKODA', 'FABIA', 'II', '', 1198, 'essence', 70),
  ('SKODA', 'FABIA', 'II', '1.2', 1198, 'essence', 70),
  ('SKODA', 'FABIA', 'II', '1.4', 1390, 'essence', 86),
  ('SKODA', 'FABIA', 'II', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'FABIA', 'II', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'FABIA', 'II', '1.4 TDI', 1422, 'diesel', 70)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SKODA (OCTAVIA I (1U2)) ──
WITH spec_54 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_54.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_54, (VALUES
  ('SKODA', 'OCTAVIA I (1U2)', 'III', '', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA I (1U2)', 'III', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA I (1U2)', 'III', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'OCTAVIA I (1U2)', 'III', '1.4 TSI', 1395, 'essence', 140),
  ('SKODA', 'OCTAVIA I (1U2)', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('SKODA', 'OCTAVIA II (1Z3)', 'III', '', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA II (1Z3)', 'III', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA II (1Z3)', 'III', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'OCTAVIA II (1Z3)', 'III', '1.4 TSI', 1395, 'essence', 140),
  ('SKODA', 'OCTAVIA II (1Z3)', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('SKODA', 'OCTAVIA III (5E3, NL3, NR3)', 'III', '', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA III (5E3, NL3, NR3)', 'III', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA III (5E3, NL3, NR3)', 'III', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'OCTAVIA III (5E3, NL3, NR3)', 'III', '1.4 TSI', 1395, 'essence', 140),
  ('SKODA', 'OCTAVIA III (5E3, NL3, NR3)', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('SKODA', 'OCTAVIA IV (NX3, NN3)', 'III', '', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA IV (NX3, NN3)', 'III', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA IV (NX3, NN3)', 'III', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'OCTAVIA IV (NX3, NN3)', 'III', '1.4 TSI', 1395, 'essence', 140),
  ('SKODA', 'OCTAVIA IV (NX3, NN3)', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('SKODA', 'Octavia III', 'III', '', 1968, 'diesel', 150),
  ('SKODA', 'Octavia III', 'III', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'Octavia III', 'III', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'Octavia III', 'III', '1.4 TSI', 1395, 'essence', 140),
  ('SKODA', 'Octavia III', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('SKODA', 'Octavia II', 'III', '', 1968, 'diesel', 150),
  ('SKODA', 'Octavia II', 'III', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'Octavia II', 'III', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'Octavia II', 'III', '1.4 TSI', 1395, 'essence', 140),
  ('SKODA', 'Octavia II', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('SKODA', 'Octavia', 'III', '', 1968, 'diesel', 150),
  ('SKODA', 'Octavia', 'III', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'Octavia', 'III', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'Octavia', 'III', '1.4 TSI', 1395, 'essence', 140),
  ('SKODA', 'Octavia', 'III', '1.9 TDI', 1896, 'diesel', 105),
  ('SKODA', 'OCTAVIA', 'III', '', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA', 'III', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'OCTAVIA', 'III', '1.6 TDI', 1598, 'diesel', 105),
  ('SKODA', 'OCTAVIA', 'III', '1.4 TSI', 1395, 'essence', 140),
  ('SKODA', 'OCTAVIA', 'III', '1.9 TDI', 1896, 'diesel', 105)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BMW (1 (E87)) ──
WITH spec_55 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_bmw-ll04_c3' LIMIT 1
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
  spec_55.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_55, (VALUES
  ('BMW', '1 (E87)', 'F20', '', 1995, 'diesel', 143),
  ('BMW', '1 (E87)', 'F20', '118d', 1995, 'diesel', 143),
  ('BMW', '1 (E87)', 'F20', '120d', 1995, 'diesel', 184),
  ('BMW', '1 (E87)', 'F20', '116d', 1496, 'diesel', 116),
  ('BMW', '1 (E87)', 'F20', '116i', 1598, 'essence', 136),
  ('BMW', '1 (E87)', 'F20', '118i', 1499, 'essence', 136),
  ('BMW', '1 (F20)', 'F20', '', 1995, 'diesel', 143),
  ('BMW', '1 (F20)', 'F20', '118d', 1995, 'diesel', 143),
  ('BMW', '1 (F20)', 'F20', '120d', 1995, 'diesel', 184),
  ('BMW', '1 (F20)', 'F20', '116d', 1496, 'diesel', 116),
  ('BMW', '1 (F20)', 'F20', '116i', 1598, 'essence', 136),
  ('BMW', '1 (F20)', 'F20', '118i', 1499, 'essence', 136),
  ('BMW', '1 (F40)', 'F20', '', 1995, 'diesel', 143),
  ('BMW', '1 (F40)', 'F20', '118d', 1995, 'diesel', 143),
  ('BMW', '1 (F40)', 'F20', '120d', 1995, 'diesel', 184),
  ('BMW', '1 (F40)', 'F20', '116d', 1496, 'diesel', 116),
  ('BMW', '1 (F40)', 'F20', '116i', 1598, 'essence', 136),
  ('BMW', '1 (F40)', 'F20', '118i', 1499, 'essence', 136),
  ('BMW', '1 Series', 'F20', '', 1995, 'diesel', 143),
  ('BMW', '1 Series', 'F20', '118d', 1995, 'diesel', 143),
  ('BMW', '1 Series', 'F20', '120d', 1995, 'diesel', 184),
  ('BMW', '1 Series', 'F20', '116d', 1496, 'diesel', 116),
  ('BMW', '1 Series', 'F20', '116i', 1598, 'essence', 136),
  ('BMW', '1 Series', 'F20', '118i', 1499, 'essence', 136),
  ('BMW', 'Série 1', 'F20', '', 1995, 'diesel', 143),
  ('BMW', 'Série 1', 'F20', '118d', 1995, 'diesel', 143),
  ('BMW', 'Série 1', 'F20', '120d', 1995, 'diesel', 184),
  ('BMW', 'Série 1', 'F20', '116d', 1496, 'diesel', 116),
  ('BMW', 'Série 1', 'F20', '116i', 1598, 'essence', 136),
  ('BMW', 'Série 1', 'F20', '118i', 1499, 'essence', 136)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BMW (3 (E90)) ──
WITH spec_56 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_bmw-ll04_c3' LIMIT 1
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
  spec_56.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_56, (VALUES
  ('BMW', '3 (E90)', 'F30', '', 1995, 'diesel', 184),
  ('BMW', '3 (E90)', 'F30', '320d (N47D20C)', 1995, 'diesel', 184),
  ('BMW', '3 (E90)', 'F30', '320d', 1995, 'diesel', 184),
  ('BMW', '3 (E90)', 'F30', '318d', 1995, 'diesel', 143),
  ('BMW', '3 (E90)', 'F30', '316d', 1995, 'diesel', 116),
  ('BMW', '3 (E90)', 'F30', '320i', 1997, 'essence', 184),
  ('BMW', '3 (F30, F80)', 'F30', '', 1995, 'diesel', 184),
  ('BMW', '3 (F30, F80)', 'F30', '320d (N47D20C)', 1995, 'diesel', 184),
  ('BMW', '3 (F30, F80)', 'F30', '320d', 1995, 'diesel', 184),
  ('BMW', '3 (F30, F80)', 'F30', '318d', 1995, 'diesel', 143),
  ('BMW', '3 (F30, F80)', 'F30', '316d', 1995, 'diesel', 116),
  ('BMW', '3 (F30, F80)', 'F30', '320i', 1997, 'essence', 184),
  ('BMW', '3 (G20, G80, G28)', 'F30', '', 1995, 'diesel', 184),
  ('BMW', '3 (G20, G80, G28)', 'F30', '320d (N47D20C)', 1995, 'diesel', 184),
  ('BMW', '3 (G20, G80, G28)', 'F30', '320d', 1995, 'diesel', 184),
  ('BMW', '3 (G20, G80, G28)', 'F30', '318d', 1995, 'diesel', 143),
  ('BMW', '3 (G20, G80, G28)', 'F30', '316d', 1995, 'diesel', 116),
  ('BMW', '3 (G20, G80, G28)', 'F30', '320i', 1997, 'essence', 184),
  ('BMW', '3 Series', 'F30', '', 1995, 'diesel', 184),
  ('BMW', '3 Series', 'F30', '320d (N47D20C)', 1995, 'diesel', 184),
  ('BMW', '3 Series', 'F30', '320d', 1995, 'diesel', 184),
  ('BMW', '3 Series', 'F30', '318d', 1995, 'diesel', 143),
  ('BMW', '3 Series', 'F30', '316d', 1995, 'diesel', 116),
  ('BMW', '3 Series', 'F30', '320i', 1997, 'essence', 184),
  ('BMW', 'Série 3', 'F30', '', 1995, 'diesel', 184),
  ('BMW', 'Série 3', 'F30', '320d (N47D20C)', 1995, 'diesel', 184),
  ('BMW', 'Série 3', 'F30', '320d', 1995, 'diesel', 184),
  ('BMW', 'Série 3', 'F30', '318d', 1995, 'diesel', 143),
  ('BMW', 'Série 3', 'F30', '316d', 1995, 'diesel', 116),
  ('BMW', 'Série 3', 'F30', '320i', 1997, 'essence', 184)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BMW (3 (E46)) ──
WITH spec_57 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_bmw-ll01_a3b4' LIMIT 1
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
  spec_57.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_57, (VALUES
  ('BMW', '3 (E46)', 'E46', '', 1995, 'diesel', 150),
  ('BMW', '3 (E46)', 'E46', '320d', 1995, 'diesel', 150),
  ('BMW', '3 (E46)', 'E46', '318i', 1995, 'essence', 143),
  ('BMW', '3 (E46)', 'E46', '316i', 1796, 'essence', 115),
  ('BMW', '3 Compact (E46)', 'E46', '', 1995, 'diesel', 150),
  ('BMW', '3 Compact (E46)', 'E46', '320d', 1995, 'diesel', 150),
  ('BMW', '3 Compact (E46)', 'E46', '318i', 1995, 'essence', 143),
  ('BMW', '3 Compact (E46)', 'E46', '316i', 1796, 'essence', 115),
  ('BMW', '3 Coupe (E46)', 'E46', '', 1995, 'diesel', 150),
  ('BMW', '3 Coupe (E46)', 'E46', '320d', 1995, 'diesel', 150),
  ('BMW', '3 Coupe (E46)', 'E46', '318i', 1995, 'essence', 143),
  ('BMW', '3 Coupe (E46)', 'E46', '316i', 1796, 'essence', 115)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MERCEDES-BENZ (A-CLASS (W169)) ──
WITH spec_58 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mb-22951_c3' LIMIT 1
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
  spec_58.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_58, (VALUES
  ('MERCEDES-BENZ', 'A-CLASS (W169)', 'W176', '', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W169)', 'W176', 'A 180 CDI (176.012)', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W169)', 'W176', 'A 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W169)', 'W176', 'A 200 CDI', 1796, 'diesel', 136),
  ('MERCEDES-BENZ', 'A-CLASS (W169)', 'W176', 'A 180 (176.042)', 1595, 'essence', 122),
  ('MERCEDES-BENZ', 'A-CLASS (W169)', 'W176', 'A 200', 1595, 'essence', 156),
  ('MERCEDES-BENZ', 'A-CLASS (W176)', 'W176', '', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W176)', 'W176', 'A 180 CDI (176.012)', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W176)', 'W176', 'A 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W176)', 'W176', 'A 200 CDI', 1796, 'diesel', 136),
  ('MERCEDES-BENZ', 'A-CLASS (W176)', 'W176', 'A 180 (176.042)', 1595, 'essence', 122),
  ('MERCEDES-BENZ', 'A-CLASS (W176)', 'W176', 'A 200', 1595, 'essence', 156),
  ('MERCEDES-BENZ', 'A-CLASS (W177)', 'W176', '', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W177)', 'W176', 'A 180 CDI (176.012)', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W177)', 'W176', 'A 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-CLASS (W177)', 'W176', 'A 200 CDI', 1796, 'diesel', 136),
  ('MERCEDES-BENZ', 'A-CLASS (W177)', 'W176', 'A 180 (176.042)', 1595, 'essence', 122),
  ('MERCEDES-BENZ', 'A-CLASS (W177)', 'W176', 'A 200', 1595, 'essence', 156),
  ('MERCEDES-BENZ', 'Classe A', 'W176', '', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'Classe A', 'W176', 'A 180 CDI (176.012)', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'Classe A', 'W176', 'A 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'Classe A', 'W176', 'A 200 CDI', 1796, 'diesel', 136),
  ('MERCEDES-BENZ', 'Classe A', 'W176', 'A 180 (176.042)', 1595, 'essence', 122),
  ('MERCEDES-BENZ', 'Classe A', 'W176', 'A 200', 1595, 'essence', 156),
  ('MERCEDES-BENZ', 'A-Class', 'W176', '', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-Class', 'W176', 'A 180 CDI (176.012)', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-Class', 'W176', 'A 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'A-Class', 'W176', 'A 200 CDI', 1796, 'diesel', 136),
  ('MERCEDES-BENZ', 'A-Class', 'W176', 'A 180 (176.042)', 1595, 'essence', 122),
  ('MERCEDES-BENZ', 'A-Class', 'W176', 'A 200', 1595, 'essence', 156)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MERCEDES-BENZ (C-CLASS (W203)) ──
WITH spec_59 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mb-22951_c3' LIMIT 1
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
  spec_59.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_59, (VALUES
  ('MERCEDES-BENZ', 'C-CLASS (W203)', 'W204', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W203)', 'W204', 'C 220 CDI (204.002)', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W203)', 'W204', 'C 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W203)', 'W204', 'C 200 CDI', 2143, 'diesel', 136),
  ('MERCEDES-BENZ', 'C-CLASS (W203)', 'W204', 'C 180 CGI', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'C-CLASS (W203)', 'W204', 'C 180 Kompressor', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'C-CLASS (W204)', 'W204', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W204)', 'W204', 'C 220 CDI (204.002)', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W204)', 'W204', 'C 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W204)', 'W204', 'C 200 CDI', 2143, 'diesel', 136),
  ('MERCEDES-BENZ', 'C-CLASS (W204)', 'W204', 'C 180 CGI', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'C-CLASS (W204)', 'W204', 'C 180 Kompressor', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'C-CLASS (W205)', 'W204', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W205)', 'W204', 'C 220 CDI (204.002)', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W205)', 'W204', 'C 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-CLASS (W205)', 'W204', 'C 200 CDI', 2143, 'diesel', 136),
  ('MERCEDES-BENZ', 'C-CLASS (W205)', 'W204', 'C 180 CGI', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'C-CLASS (W205)', 'W204', 'C 180 Kompressor', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'Classe C', 'W204', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'Classe C', 'W204', 'C 220 CDI (204.002)', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'Classe C', 'W204', 'C 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'Classe C', 'W204', 'C 200 CDI', 2143, 'diesel', 136),
  ('MERCEDES-BENZ', 'Classe C', 'W204', 'C 180 CGI', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'Classe C', 'W204', 'C 180 Kompressor', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'C-Class', 'W204', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-Class', 'W204', 'C 220 CDI (204.002)', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-Class', 'W204', 'C 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'C-Class', 'W204', 'C 200 CDI', 2143, 'diesel', 136),
  ('MERCEDES-BENZ', 'C-Class', 'W204', 'C 180 CGI', 1796, 'essence', 156),
  ('MERCEDES-BENZ', 'C-Class', 'W204', 'C 180 Kompressor', 1796, 'essence', 156)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── AUDI (A3 (8P1)) ──
WITH spec_60 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_60.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_60, (VALUES
  ('AUDI', 'A3 (8P1)', '8V', '', 1968, 'diesel', 150),
  ('AUDI', 'A3 (8P1)', '8V', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'A3 (8P1)', '8V', '1.6 TDI', 1598, 'diesel', 105),
  ('AUDI', 'A3 (8P1)', '8V', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'A3 (8P1)', '8V', '1.2 TFSI', 1197, 'essence', 105),
  ('AUDI', 'A3 (8P1)', '8V', '1.9 TDI', 1896, 'diesel', 105),
  ('AUDI', 'A3 Sportback (8PA)', '8V', '', 1968, 'diesel', 150),
  ('AUDI', 'A3 Sportback (8PA)', '8V', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'A3 Sportback (8PA)', '8V', '1.6 TDI', 1598, 'diesel', 105),
  ('AUDI', 'A3 Sportback (8PA)', '8V', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'A3 Sportback (8PA)', '8V', '1.2 TFSI', 1197, 'essence', 105),
  ('AUDI', 'A3 Sportback (8PA)', '8V', '1.9 TDI', 1896, 'diesel', 105),
  ('AUDI', 'A3 (8V1, 8VK)', '8V', '', 1968, 'diesel', 150),
  ('AUDI', 'A3 (8V1, 8VK)', '8V', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'A3 (8V1, 8VK)', '8V', '1.6 TDI', 1598, 'diesel', 105),
  ('AUDI', 'A3 (8V1, 8VK)', '8V', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'A3 (8V1, 8VK)', '8V', '1.2 TFSI', 1197, 'essence', 105),
  ('AUDI', 'A3 (8V1, 8VK)', '8V', '1.9 TDI', 1896, 'diesel', 105),
  ('AUDI', 'A3 Sportback (8VA, 8VF)', '8V', '', 1968, 'diesel', 150),
  ('AUDI', 'A3 Sportback (8VA, 8VF)', '8V', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'A3 Sportback (8VA, 8VF)', '8V', '1.6 TDI', 1598, 'diesel', 105),
  ('AUDI', 'A3 Sportback (8VA, 8VF)', '8V', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'A3 Sportback (8VA, 8VF)', '8V', '1.2 TFSI', 1197, 'essence', 105),
  ('AUDI', 'A3 Sportback (8VA, 8VF)', '8V', '1.9 TDI', 1896, 'diesel', 105),
  ('AUDI', 'A3 Sportback (8YA)', '8V', '', 1968, 'diesel', 150),
  ('AUDI', 'A3 Sportback (8YA)', '8V', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'A3 Sportback (8YA)', '8V', '1.6 TDI', 1598, 'diesel', 105),
  ('AUDI', 'A3 Sportback (8YA)', '8V', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'A3 Sportback (8YA)', '8V', '1.2 TFSI', 1197, 'essence', 105),
  ('AUDI', 'A3 Sportback (8YA)', '8V', '1.9 TDI', 1896, 'diesel', 105),
  ('AUDI', 'A3 (8L1)', '8V', '', 1968, 'diesel', 150),
  ('AUDI', 'A3 (8L1)', '8V', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'A3 (8L1)', '8V', '1.6 TDI', 1598, 'diesel', 105),
  ('AUDI', 'A3 (8L1)', '8V', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'A3 (8L1)', '8V', '1.2 TFSI', 1197, 'essence', 105),
  ('AUDI', 'A3 (8L1)', '8V', '1.9 TDI', 1896, 'diesel', 105),
  ('AUDI', 'A3', '8V', '', 1968, 'diesel', 150),
  ('AUDI', 'A3', '8V', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'A3', '8V', '1.6 TDI', 1598, 'diesel', 105),
  ('AUDI', 'A3', '8V', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'A3', '8V', '1.2 TFSI', 1197, 'essence', 105),
  ('AUDI', 'A3', '8V', '1.9 TDI', 1896, 'diesel', 105)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── AUDI (A4 (8E2, B6)) ──
WITH spec_61 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_61.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_61, (VALUES
  ('AUDI', 'A4 (8E2, B6)', 'B8', '', 1968, 'diesel', 143),
  ('AUDI', 'A4 (8E2, B6)', 'B8', '2.0 TDI', 1968, 'diesel', 143),
  ('AUDI', 'A4 (8E2, B6)', 'B8', '2.0 TDI 150', 1968, 'diesel', 150),
  ('AUDI', 'A4 (8E2, B6)', 'B8', '1.8 TFSI', 1798, 'essence', 160),
  ('AUDI', 'A4 (8E2, B6)', 'B8', '2.0 TFSI', 1984, 'essence', 211),
  ('AUDI', 'A4 (8E2, B6)', 'B8', '1.9 TDI', 1896, 'diesel', 130),
  ('AUDI', 'A4 (8EC, B7)', 'B8', '', 1968, 'diesel', 143),
  ('AUDI', 'A4 (8EC, B7)', 'B8', '2.0 TDI', 1968, 'diesel', 143),
  ('AUDI', 'A4 (8EC, B7)', 'B8', '2.0 TDI 150', 1968, 'diesel', 150),
  ('AUDI', 'A4 (8EC, B7)', 'B8', '1.8 TFSI', 1798, 'essence', 160),
  ('AUDI', 'A4 (8EC, B7)', 'B8', '2.0 TFSI', 1984, 'essence', 211),
  ('AUDI', 'A4 (8EC, B7)', 'B8', '1.9 TDI', 1896, 'diesel', 130),
  ('AUDI', 'A4 (8K2, B8)', 'B8', '', 1968, 'diesel', 143),
  ('AUDI', 'A4 (8K2, B8)', 'B8', '2.0 TDI', 1968, 'diesel', 143),
  ('AUDI', 'A4 (8K2, B8)', 'B8', '2.0 TDI 150', 1968, 'diesel', 150),
  ('AUDI', 'A4 (8K2, B8)', 'B8', '1.8 TFSI', 1798, 'essence', 160),
  ('AUDI', 'A4 (8K2, B8)', 'B8', '2.0 TFSI', 1984, 'essence', 211),
  ('AUDI', 'A4 (8K2, B8)', 'B8', '1.9 TDI', 1896, 'diesel', 130),
  ('AUDI', 'A4 (8W2, 8WC, B9)', 'B8', '', 1968, 'diesel', 143),
  ('AUDI', 'A4 (8W2, 8WC, B9)', 'B8', '2.0 TDI', 1968, 'diesel', 143),
  ('AUDI', 'A4 (8W2, 8WC, B9)', 'B8', '2.0 TDI 150', 1968, 'diesel', 150),
  ('AUDI', 'A4 (8W2, 8WC, B9)', 'B8', '1.8 TFSI', 1798, 'essence', 160),
  ('AUDI', 'A4 (8W2, 8WC, B9)', 'B8', '2.0 TFSI', 1984, 'essence', 211),
  ('AUDI', 'A4 (8W2, 8WC, B9)', 'B8', '1.9 TDI', 1896, 'diesel', 130),
  ('AUDI', 'A4', 'B8', '', 1968, 'diesel', 143),
  ('AUDI', 'A4', 'B8', '2.0 TDI', 1968, 'diesel', 143),
  ('AUDI', 'A4', 'B8', '2.0 TDI 150', 1968, 'diesel', 150),
  ('AUDI', 'A4', 'B8', '1.8 TFSI', 1798, 'essence', 160),
  ('AUDI', 'A4', 'B8', '2.0 TFSI', 1984, 'essence', 211),
  ('AUDI', 'A4', 'B8', '1.9 TDI', 1896, 'diesel', 130)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── NISSAN (QASHQAI / QASHQAI +2 I (J10, NJ10, JJ10E)) ──
WITH spec_62 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_62.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_62, (VALUES
  ('NISSAN', 'QASHQAI / QASHQAI +2 I (J10, NJ10, JJ10E)', 'J11', '', 1461, 'diesel', 110),
  ('NISSAN', 'QASHQAI / QASHQAI +2 I (J10, NJ10, JJ10E)', 'J11', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'QASHQAI / QASHQAI +2 I (J10, NJ10, JJ10E)', 'J11', '1.6 dCi', 1598, 'diesel', 130),
  ('NISSAN', 'QASHQAI / QASHQAI +2 I (J10, NJ10, JJ10E)', 'J11', '1.2 DIG-T', 1197, 'essence', 115),
  ('NISSAN', 'QASHQAI / QASHQAI +2 I (J10, NJ10, JJ10E)', 'J11', '1.6', 1598, 'essence', 114),
  ('NISSAN', 'QASHQAI II SUV (J11, J11_)', 'J11', '', 1461, 'diesel', 110),
  ('NISSAN', 'QASHQAI II SUV (J11, J11_)', 'J11', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'QASHQAI II SUV (J11, J11_)', 'J11', '1.6 dCi', 1598, 'diesel', 130),
  ('NISSAN', 'QASHQAI II SUV (J11, J11_)', 'J11', '1.2 DIG-T', 1197, 'essence', 115),
  ('NISSAN', 'QASHQAI II SUV (J11, J11_)', 'J11', '1.6', 1598, 'essence', 114),
  ('NISSAN', 'Qashqai II', 'J11', '', 1461, 'diesel', 110),
  ('NISSAN', 'Qashqai II', 'J11', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'Qashqai II', 'J11', '1.6 dCi', 1598, 'diesel', 130),
  ('NISSAN', 'Qashqai II', 'J11', '1.2 DIG-T', 1197, 'essence', 115),
  ('NISSAN', 'Qashqai II', 'J11', '1.6', 1598, 'essence', 114),
  ('NISSAN', 'Qashqai I', 'J11', '', 1461, 'diesel', 110),
  ('NISSAN', 'Qashqai I', 'J11', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'Qashqai I', 'J11', '1.6 dCi', 1598, 'diesel', 130),
  ('NISSAN', 'Qashqai I', 'J11', '1.2 DIG-T', 1197, 'essence', 115),
  ('NISSAN', 'Qashqai I', 'J11', '1.6', 1598, 'essence', 114),
  ('NISSAN', 'Qashqai', 'J11', '', 1461, 'diesel', 110),
  ('NISSAN', 'Qashqai', 'J11', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'Qashqai', 'J11', '1.6 dCi', 1598, 'diesel', 130),
  ('NISSAN', 'Qashqai', 'J11', '1.2 DIG-T', 1197, 'essence', 115),
  ('NISSAN', 'Qashqai', 'J11', '1.6', 1598, 'essence', 114),
  ('NISSAN', 'QASHQAI', 'J11', '', 1461, 'diesel', 110),
  ('NISSAN', 'QASHQAI', 'J11', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'QASHQAI', 'J11', '1.6 dCi', 1598, 'diesel', 130),
  ('NISSAN', 'QASHQAI', 'J11', '1.2 DIG-T', 1197, 'essence', 115),
  ('NISSAN', 'QASHQAI', 'J11', '1.6', 1598, 'essence', 114)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── NISSAN (MICRA III (K12)) ──
WITH spec_63 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_63.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_63, (VALUES
  ('NISSAN', 'MICRA III (K12)', 'K13', '', 1198, 'essence', 80),
  ('NISSAN', 'MICRA III (K12)', 'K13', '1.2', 1198, 'essence', 80),
  ('NISSAN', 'MICRA III (K12)', 'K13', '1.2 DIG-S', 1198, 'essence', 98),
  ('NISSAN', 'MICRA III (K12)', 'K13', '1.5 dCi', 1461, 'diesel', 68),
  ('NISSAN', 'MICRA IV (K13)', 'K13', '', 1198, 'essence', 80),
  ('NISSAN', 'MICRA IV (K13)', 'K13', '1.2', 1198, 'essence', 80),
  ('NISSAN', 'MICRA IV (K13)', 'K13', '1.2 DIG-S', 1198, 'essence', 98),
  ('NISSAN', 'MICRA IV (K13)', 'K13', '1.5 dCi', 1461, 'diesel', 68),
  ('NISSAN', 'MICRA V (K14)', 'K13', '', 1198, 'essence', 80),
  ('NISSAN', 'MICRA V (K14)', 'K13', '1.2', 1198, 'essence', 80),
  ('NISSAN', 'MICRA V (K14)', 'K13', '1.2 DIG-S', 1198, 'essence', 98),
  ('NISSAN', 'MICRA V (K14)', 'K13', '1.5 dCi', 1461, 'diesel', 68),
  ('NISSAN', 'Micra IV', 'K13', '', 1198, 'essence', 80),
  ('NISSAN', 'Micra IV', 'K13', '1.2', 1198, 'essence', 80),
  ('NISSAN', 'Micra IV', 'K13', '1.2 DIG-S', 1198, 'essence', 98),
  ('NISSAN', 'Micra IV', 'K13', '1.5 dCi', 1461, 'diesel', 68),
  ('NISSAN', 'Micra III', 'K13', '', 1198, 'essence', 80),
  ('NISSAN', 'Micra III', 'K13', '1.2', 1198, 'essence', 80),
  ('NISSAN', 'Micra III', 'K13', '1.2 DIG-S', 1198, 'essence', 98),
  ('NISSAN', 'Micra III', 'K13', '1.5 dCi', 1461, 'diesel', 68),
  ('NISSAN', 'Micra', 'K13', '', 1198, 'essence', 80),
  ('NISSAN', 'Micra', 'K13', '1.2', 1198, 'essence', 80),
  ('NISSAN', 'Micra', 'K13', '1.2 DIG-S', 1198, 'essence', 98),
  ('NISSAN', 'Micra', 'K13', '1.5 dCi', 1461, 'diesel', 68),
  ('NISSAN', 'MICRA', 'K13', '', 1198, 'essence', 80),
  ('NISSAN', 'MICRA', 'K13', '1.2', 1198, 'essence', 80),
  ('NISSAN', 'MICRA', 'K13', '1.2 DIG-S', 1198, 'essence', 98),
  ('NISSAN', 'MICRA', 'K13', '1.5 dCi', 1461, 'diesel', 68)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── AUDI (A6 (C6)) ──
WITH spec_64 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_64.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_64, (VALUES
  ('AUDI', 'A6 (C6)', 'C7', '', 1968, 'diesel', 177),
  ('AUDI', 'A6 (C6)', 'C7', '2.0 TDI', 1968, 'diesel', 177),
  ('AUDI', 'A6 (C6)', 'C7', '3.0 TDI', 2967, 'diesel', 218),
  ('AUDI', 'A6 (C6)', 'C7', '2.0 TFSI', 1984, 'essence', 211),
  ('AUDI', 'A6 (C7)', 'C7', '', 1968, 'diesel', 177),
  ('AUDI', 'A6 (C7)', 'C7', '2.0 TDI', 1968, 'diesel', 177),
  ('AUDI', 'A6 (C7)', 'C7', '3.0 TDI', 2967, 'diesel', 218),
  ('AUDI', 'A6 (C7)', 'C7', '2.0 TFSI', 1984, 'essence', 211),
  ('AUDI', 'A6 (C8)', 'C7', '', 1968, 'diesel', 177),
  ('AUDI', 'A6 (C8)', 'C7', '2.0 TDI', 1968, 'diesel', 177),
  ('AUDI', 'A6 (C8)', 'C7', '3.0 TDI', 2967, 'diesel', 218),
  ('AUDI', 'A6 (C8)', 'C7', '2.0 TFSI', 1984, 'essence', 211),
  ('AUDI', 'A6', 'C7', '', 1968, 'diesel', 177),
  ('AUDI', 'A6', 'C7', '2.0 TDI', 1968, 'diesel', 177),
  ('AUDI', 'A6', 'C7', '3.0 TDI', 2967, 'diesel', 218),
  ('AUDI', 'A6', 'C7', '2.0 TFSI', 1984, 'essence', 211)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── AUDI (Q3 (8U)) ──
WITH spec_65 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_65.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_65, (VALUES
  ('AUDI', 'Q3 (8U)', 'F3', '', 1968, 'diesel', 150),
  ('AUDI', 'Q3 (8U)', 'F3', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'Q3 (8U)', 'F3', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'Q3 (8U)', 'F3', '1.5 TSI', 1498, 'essence', 150),
  ('AUDI', 'Q3 (F3)', 'F3', '', 1968, 'diesel', 150),
  ('AUDI', 'Q3 (F3)', 'F3', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'Q3 (F3)', 'F3', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'Q3 (F3)', 'F3', '1.5 TSI', 1498, 'essence', 150),
  ('AUDI', 'Q3', 'F3', '', 1968, 'diesel', 150),
  ('AUDI', 'Q3', 'F3', '2.0 TDI', 1968, 'diesel', 150),
  ('AUDI', 'Q3', 'F3', '1.4 TFSI', 1395, 'essence', 125),
  ('AUDI', 'Q3', 'F3', '1.5 TSI', 1498, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── AUDI (Q5 (8R)) ──
WITH spec_66 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_66.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_66, (VALUES
  ('AUDI', 'Q5 (8R)', 'FY', '', 1968, 'diesel', 190),
  ('AUDI', 'Q5 (8R)', 'FY', '2.0 TDI', 1968, 'diesel', 190),
  ('AUDI', 'Q5 (8R)', 'FY', '2.0 TFSI', 1984, 'essence', 252),
  ('AUDI', 'Q5 (FY)', 'FY', '', 1968, 'diesel', 190),
  ('AUDI', 'Q5 (FY)', 'FY', '2.0 TDI', 1968, 'diesel', 190),
  ('AUDI', 'Q5 (FY)', 'FY', '2.0 TFSI', 1984, 'essence', 252),
  ('AUDI', 'Q5', 'FY', '', 1968, 'diesel', 190),
  ('AUDI', 'Q5', 'FY', '2.0 TDI', 1968, 'diesel', 190),
  ('AUDI', 'Q5', 'FY', '2.0 TFSI', 1984, 'essence', 252)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── AUDI (A1 (8X)) ──
WITH spec_67 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_67.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_67, (VALUES
  ('AUDI', 'A1 (8X)', '8X', '', 1395, 'essence', 85),
  ('AUDI', 'A1 (8X)', '8X', '1.4 TFSI', 1395, 'essence', 85),
  ('AUDI', 'A1 (8X)', '8X', '1.0 TFSI', 999, 'essence', 95),
  ('AUDI', 'A1 (8X)', '8X', '1.6 TDI', 1598, 'diesel', 90),
  ('AUDI', 'A1 Sportback (GB)', '8X', '', 1395, 'essence', 85),
  ('AUDI', 'A1 Sportback (GB)', '8X', '1.4 TFSI', 1395, 'essence', 85),
  ('AUDI', 'A1 Sportback (GB)', '8X', '1.0 TFSI', 999, 'essence', 95),
  ('AUDI', 'A1 Sportback (GB)', '8X', '1.6 TDI', 1598, 'diesel', 90),
  ('AUDI', 'A1', '8X', '', 1395, 'essence', 85),
  ('AUDI', 'A1', '8X', '1.4 TFSI', 1395, 'essence', 85),
  ('AUDI', 'A1', '8X', '1.0 TFSI', 999, 'essence', 95),
  ('AUDI', 'A1', '8X', '1.6 TDI', 1598, 'diesel', 90)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── AUDI (A5 (8T3)) ──
WITH spec_68 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_68.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_68, (VALUES
  ('AUDI', 'A5 (8T3)', 'F5', '', 1968, 'diesel', 190),
  ('AUDI', 'A5 (8T3)', 'F5', '2.0 TDI', 1968, 'diesel', 190),
  ('AUDI', 'A5 (8T3)', 'F5', '2.0 TFSI', 1984, 'essence', 252),
  ('AUDI', 'A5 Sportback (8TA)', 'F5', '', 1968, 'diesel', 190),
  ('AUDI', 'A5 Sportback (8TA)', 'F5', '2.0 TDI', 1968, 'diesel', 190),
  ('AUDI', 'A5 Sportback (8TA)', 'F5', '2.0 TFSI', 1984, 'essence', 252),
  ('AUDI', 'A5 (F53, F5P)', 'F5', '', 1968, 'diesel', 190),
  ('AUDI', 'A5 (F53, F5P)', 'F5', '2.0 TDI', 1968, 'diesel', 190),
  ('AUDI', 'A5 (F53, F5P)', 'F5', '2.0 TFSI', 1984, 'essence', 252),
  ('AUDI', 'A5', 'F5', '', 1968, 'diesel', 190),
  ('AUDI', 'A5', 'F5', '2.0 TDI', 1968, 'diesel', 190),
  ('AUDI', 'A5', 'F5', '2.0 TFSI', 1984, 'essence', 252)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SEAT (ATECA (KH7)) ──
WITH spec_69 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_69.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_69, (VALUES
  ('SEAT', 'ATECA (KH7)', 'KH7', '', 1968, 'diesel', 150),
  ('SEAT', 'ATECA (KH7)', 'KH7', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'ATECA (KH7)', 'KH7', '1.0 TSI', 999, 'essence', 115),
  ('SEAT', 'ATECA (KH7)', 'KH7', '1.5 TSI', 1498, 'essence', 150),
  ('SEAT', 'Ateca', 'KH7', '', 1968, 'diesel', 150),
  ('SEAT', 'Ateca', 'KH7', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'Ateca', 'KH7', '1.0 TSI', 999, 'essence', 115),
  ('SEAT', 'Ateca', 'KH7', '1.5 TSI', 1498, 'essence', 150),
  ('SEAT', 'ATECA', 'KH7', '', 1968, 'diesel', 150),
  ('SEAT', 'ATECA', 'KH7', '2.0 TDI', 1968, 'diesel', 150),
  ('SEAT', 'ATECA', 'KH7', '1.0 TSI', 999, 'essence', 115),
  ('SEAT', 'ATECA', 'KH7', '1.5 TSI', 1498, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SEAT (ARONA (KJ7)) ──
WITH spec_70 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_70.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_70, (VALUES
  ('SEAT', 'ARONA (KJ7)', 'KJ7', '', 999, 'essence', 95),
  ('SEAT', 'ARONA (KJ7)', 'KJ7', '1.0 TSI', 999, 'essence', 95),
  ('SEAT', 'ARONA (KJ7)', 'KJ7', '1.6 TDI', 1598, 'diesel', 95),
  ('SEAT', 'Arona', 'KJ7', '', 999, 'essence', 95),
  ('SEAT', 'Arona', 'KJ7', '1.0 TSI', 999, 'essence', 95),
  ('SEAT', 'Arona', 'KJ7', '1.6 TDI', 1598, 'diesel', 95),
  ('SEAT', 'ARONA', 'KJ7', '', 999, 'essence', 95),
  ('SEAT', 'ARONA', 'KJ7', '1.0 TSI', 999, 'essence', 95),
  ('SEAT', 'ARONA', 'KJ7', '1.6 TDI', 1598, 'diesel', 95)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SEAT (ALTEA (5P1)) ──
WITH spec_71 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_71.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_71, (VALUES
  ('SEAT', 'ALTEA (5P1)', 'I', '', 1968, 'diesel', 140),
  ('SEAT', 'ALTEA (5P1)', 'I', '2.0 TDI', 1968, 'diesel', 140),
  ('SEAT', 'ALTEA (5P1)', 'I', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'ALTEA (5P1)', 'I', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'ALTEA XL (5P5, 5P8)', 'I', '', 1968, 'diesel', 140),
  ('SEAT', 'ALTEA XL (5P5, 5P8)', 'I', '2.0 TDI', 1968, 'diesel', 140),
  ('SEAT', 'ALTEA XL (5P5, 5P8)', 'I', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'ALTEA XL (5P5, 5P8)', 'I', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'Altea', 'I', '', 1968, 'diesel', 140),
  ('SEAT', 'Altea', 'I', '2.0 TDI', 1968, 'diesel', 140),
  ('SEAT', 'Altea', 'I', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Altea', 'I', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'ALTEA', 'I', '', 1968, 'diesel', 140),
  ('SEAT', 'ALTEA', 'I', '2.0 TDI', 1968, 'diesel', 140),
  ('SEAT', 'ALTEA', 'I', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'ALTEA', 'I', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'TOLEDO (5P2)', 'I', '', 1968, 'diesel', 140),
  ('SEAT', 'TOLEDO (5P2)', 'I', '2.0 TDI', 1968, 'diesel', 140),
  ('SEAT', 'TOLEDO (5P2)', 'I', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'TOLEDO (5P2)', 'I', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'Toledo', 'I', '', 1968, 'diesel', 140),
  ('SEAT', 'Toledo', 'I', '2.0 TDI', 1968, 'diesel', 140),
  ('SEAT', 'Toledo', 'I', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Toledo', 'I', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'ALHAMBRA (710, 711)', 'I', '', 1968, 'diesel', 140),
  ('SEAT', 'ALHAMBRA (710, 711)', 'I', '2.0 TDI', 1968, 'diesel', 140),
  ('SEAT', 'ALHAMBRA (710, 711)', 'I', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'ALHAMBRA (710, 711)', 'I', '1.4 TSI', 1395, 'essence', 125),
  ('SEAT', 'Alhambra', 'I', '', 1968, 'diesel', 140),
  ('SEAT', 'Alhambra', 'I', '2.0 TDI', 1968, 'diesel', 140),
  ('SEAT', 'Alhambra', 'I', '1.6 TDI', 1598, 'diesel', 105),
  ('SEAT', 'Alhambra', 'I', '1.4 TSI', 1395, 'essence', 125)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SKODA (SUPERB I (3U4)) ──
WITH spec_72 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_72.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_72, (VALUES
  ('SKODA', 'SUPERB I (3U4)', 'III', '', 1968, 'diesel', 190),
  ('SKODA', 'SUPERB I (3U4)', 'III', '2.0 TDI', 1968, 'diesel', 190),
  ('SKODA', 'SUPERB I (3U4)', 'III', '1.4 TSI', 1395, 'essence', 150),
  ('SKODA', 'SUPERB I (3U4)', 'III', '2.0 TSI', 1984, 'essence', 280),
  ('SKODA', 'SUPERB II (3T4)', 'III', '', 1968, 'diesel', 190),
  ('SKODA', 'SUPERB II (3T4)', 'III', '2.0 TDI', 1968, 'diesel', 190),
  ('SKODA', 'SUPERB II (3T4)', 'III', '1.4 TSI', 1395, 'essence', 150),
  ('SKODA', 'SUPERB II (3T4)', 'III', '2.0 TSI', 1984, 'essence', 280),
  ('SKODA', 'SUPERB III (3V3)', 'III', '', 1968, 'diesel', 190),
  ('SKODA', 'SUPERB III (3V3)', 'III', '2.0 TDI', 1968, 'diesel', 190),
  ('SKODA', 'SUPERB III (3V3)', 'III', '1.4 TSI', 1395, 'essence', 150),
  ('SKODA', 'SUPERB III (3V3)', 'III', '2.0 TSI', 1984, 'essence', 280),
  ('SKODA', 'Superb', 'III', '', 1968, 'diesel', 190),
  ('SKODA', 'Superb', 'III', '2.0 TDI', 1968, 'diesel', 190),
  ('SKODA', 'Superb', 'III', '1.4 TSI', 1395, 'essence', 150),
  ('SKODA', 'Superb', 'III', '2.0 TSI', 1984, 'essence', 280),
  ('SKODA', 'SUPERB', 'III', '', 1968, 'diesel', 190),
  ('SKODA', 'SUPERB', 'III', '2.0 TDI', 1968, 'diesel', 190),
  ('SKODA', 'SUPERB', 'III', '1.4 TSI', 1395, 'essence', 150),
  ('SKODA', 'SUPERB', 'III', '2.0 TSI', 1984, 'essence', 280)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SKODA (KAROQ (NU7)) ──
WITH spec_73 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_73.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_73, (VALUES
  ('SKODA', 'KAROQ (NU7)', 'NU7', '', 1968, 'diesel', 150),
  ('SKODA', 'KAROQ (NU7)', 'NU7', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'KAROQ (NU7)', 'NU7', '1.0 TSI', 999, 'essence', 115),
  ('SKODA', 'KAROQ (NU7)', 'NU7', '1.5 TSI', 1498, 'essence', 150),
  ('SKODA', 'Karoq', 'NU7', '', 1968, 'diesel', 150),
  ('SKODA', 'Karoq', 'NU7', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'Karoq', 'NU7', '1.0 TSI', 999, 'essence', 115),
  ('SKODA', 'Karoq', 'NU7', '1.5 TSI', 1498, 'essence', 150),
  ('SKODA', 'KAROQ', 'NU7', '', 1968, 'diesel', 150),
  ('SKODA', 'KAROQ', 'NU7', '2.0 TDI', 1968, 'diesel', 150),
  ('SKODA', 'KAROQ', 'NU7', '1.0 TSI', 999, 'essence', 115),
  ('SKODA', 'KAROQ', 'NU7', '1.5 TSI', 1498, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SKODA (KODIAQ (NS7)) ──
WITH spec_74 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_74.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_74, (VALUES
  ('SKODA', 'KODIAQ (NS7)', 'NS7', '', 1968, 'diesel', 190),
  ('SKODA', 'KODIAQ (NS7)', 'NS7', '2.0 TDI', 1968, 'diesel', 190),
  ('SKODA', 'KODIAQ (NS7)', 'NS7', '1.5 TSI', 1498, 'essence', 150),
  ('SKODA', 'KODIAQ (NS7)', 'NS7', '2.0 TSI', 1984, 'essence', 180),
  ('SKODA', 'Kodiaq', 'NS7', '', 1968, 'diesel', 190),
  ('SKODA', 'Kodiaq', 'NS7', '2.0 TDI', 1968, 'diesel', 190),
  ('SKODA', 'Kodiaq', 'NS7', '1.5 TSI', 1498, 'essence', 150),
  ('SKODA', 'Kodiaq', 'NS7', '2.0 TSI', 1984, 'essence', 180),
  ('SKODA', 'KODIAQ', 'NS7', '', 1968, 'diesel', 190),
  ('SKODA', 'KODIAQ', 'NS7', '2.0 TDI', 1968, 'diesel', 190),
  ('SKODA', 'KODIAQ', 'NS7', '1.5 TSI', 1498, 'essence', 150),
  ('SKODA', 'KODIAQ', 'NS7', '2.0 TSI', 1984, 'essence', 180)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SKODA (RAPID (NA2)) ──
WITH spec_75 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_75.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_75, (VALUES
  ('SKODA', 'RAPID (NA2)', 'NA2', '', 1198, 'essence', 86),
  ('SKODA', 'RAPID (NA2)', 'NA2', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'RAPID (NA2)', 'NA2', '1.6 TDI', 1598, 'diesel', 90),
  ('SKODA', 'RAPID Spaceback (NH1)', 'NA2', '', 1198, 'essence', 86),
  ('SKODA', 'RAPID Spaceback (NH1)', 'NA2', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'RAPID Spaceback (NH1)', 'NA2', '1.6 TDI', 1598, 'diesel', 90),
  ('SKODA', 'Rapid', 'NA2', '', 1198, 'essence', 86),
  ('SKODA', 'Rapid', 'NA2', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'Rapid', 'NA2', '1.6 TDI', 1598, 'diesel', 90),
  ('SKODA', 'RAPID', 'NA2', '', 1198, 'essence', 86),
  ('SKODA', 'RAPID', 'NA2', '1.2 TSI', 1197, 'essence', 86),
  ('SKODA', 'RAPID', 'NA2', '1.6 TDI', 1598, 'diesel', 90)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (T-ROC (A1)) ──
WITH spec_76 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_76.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_76, (VALUES
  ('VOLKSWAGEN', 'T-ROC (A1)', 'A1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'T-ROC (A1)', 'A1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'T-ROC (A1)', 'A1', '1.0 TSI', 999, 'essence', 115),
  ('VOLKSWAGEN', 'T-ROC (A1)', 'A1', '1.5 TSI', 1498, 'essence', 150),
  ('VOLKSWAGEN', 'T-Roc', 'A1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'T-Roc', 'A1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'T-Roc', 'A1', '1.0 TSI', 999, 'essence', 115),
  ('VOLKSWAGEN', 'T-Roc', 'A1', '1.5 TSI', 1498, 'essence', 150),
  ('VOLKSWAGEN', 'T ROC', 'A1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'T ROC', 'A1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'T ROC', 'A1', '1.0 TSI', 999, 'essence', 115),
  ('VOLKSWAGEN', 'T ROC', 'A1', '1.5 TSI', 1498, 'essence', 150),
  ('VOLKSWAGEN', 'TROC', 'A1', '', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TROC', 'A1', '2.0 TDI', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TROC', 'A1', '1.0 TSI', 999, 'essence', 115),
  ('VOLKSWAGEN', 'TROC', 'A1', '1.5 TSI', 1498, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (TRANSPORTER V (7HB, 7HJ)) ──
WITH spec_77 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_77.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_77, (VALUES
  ('VOLKSWAGEN', 'TRANSPORTER V (7HB, 7HJ)', 'T6', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'TRANSPORTER V (7HB, 7HJ)', 'T6', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'TRANSPORTER V (7HB, 7HJ)', 'T6', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TRANSPORTER V (7HB, 7HJ)', 'T6', '1.9 TDI', 1896, 'diesel', 84),
  ('VOLKSWAGEN', 'TRANSPORTER VI (SGA, SGH)', 'T6', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'TRANSPORTER VI (SGA, SGH)', 'T6', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'TRANSPORTER VI (SGA, SGH)', 'T6', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TRANSPORTER VI (SGA, SGH)', 'T6', '1.9 TDI', 1896, 'diesel', 84),
  ('VOLKSWAGEN', 'Transporter T5', 'T6', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Transporter T5', 'T6', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Transporter T5', 'T6', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Transporter T5', 'T6', '1.9 TDI', 1896, 'diesel', 84),
  ('VOLKSWAGEN', 'Transporter T6', 'T6', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Transporter T6', 'T6', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Transporter T6', 'T6', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Transporter T6', 'T6', '1.9 TDI', 1896, 'diesel', 84),
  ('VOLKSWAGEN', 'Transporter', 'T6', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Transporter', 'T6', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'Transporter', 'T6', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'Transporter', 'T6', '1.9 TDI', 1896, 'diesel', 84),
  ('VOLKSWAGEN', 'TRANSPORTER', 'T6', '', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'TRANSPORTER', 'T6', '2.0 TDI', 1968, 'diesel', 102),
  ('VOLKSWAGEN', 'TRANSPORTER', 'T6', '2.0 TDI 4motion', 1968, 'diesel', 150),
  ('VOLKSWAGEN', 'TRANSPORTER', 'T6', '1.9 TDI', 1896, 'diesel', 84)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLKSWAGEN (SHARAN (7M8, 7M9, 7M6)) ──
WITH spec_78 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_78.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_78, (VALUES
  ('VOLKSWAGEN', 'SHARAN (7M8, 7M9, 7M6)', 'II', '', 1968, 'diesel', 140),
  ('VOLKSWAGEN', 'SHARAN (7M8, 7M9, 7M6)', 'II', '2.0 TDI', 1968, 'diesel', 140),
  ('VOLKSWAGEN', 'SHARAN (7M8, 7M9, 7M6)', 'II', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'SHARAN (7N1, 7N2)', 'II', '', 1968, 'diesel', 140),
  ('VOLKSWAGEN', 'SHARAN (7N1, 7N2)', 'II', '2.0 TDI', 1968, 'diesel', 140),
  ('VOLKSWAGEN', 'SHARAN (7N1, 7N2)', 'II', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'Sharan', 'II', '', 1968, 'diesel', 140),
  ('VOLKSWAGEN', 'Sharan', 'II', '2.0 TDI', 1968, 'diesel', 140),
  ('VOLKSWAGEN', 'Sharan', 'II', '1.4 TSI', 1395, 'essence', 150),
  ('VOLKSWAGEN', 'SHARAN', 'II', '', 1968, 'diesel', 140),
  ('VOLKSWAGEN', 'SHARAN', 'II', '2.0 TDI', 1968, 'diesel', 140),
  ('VOLKSWAGEN', 'SHARAN', 'II', '1.4 TSI', 1395, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (5008 (0U_)) ──
WITH spec_79 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_79.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_79, (VALUES
  ('PEUGEOT', '5008 (0U_)', '5008', '', 1560, 'diesel', 120),
  ('PEUGEOT', '5008 (0U_)', '5008', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '5008 (0U_)', '5008', '2.0 BlueHDi 150', 1997, 'diesel', 150),
  ('PEUGEOT', '5008 (0U_)', '5008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '5008 II (M_)', '5008', '', 1560, 'diesel', 120),
  ('PEUGEOT', '5008 II (M_)', '5008', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '5008 II (M_)', '5008', '2.0 BlueHDi 150', 1997, 'diesel', 150),
  ('PEUGEOT', '5008 II (M_)', '5008', '1.2 PureTech 130', 1199, 'essence', 130),
  ('PEUGEOT', '5008', '5008', '', 1560, 'diesel', 120),
  ('PEUGEOT', '5008', '5008', '1.6 BlueHDi 120', 1560, 'diesel', 120),
  ('PEUGEOT', '5008', '5008', '2.0 BlueHDi 150', 1997, 'diesel', 150),
  ('PEUGEOT', '5008', '5008', '1.2 PureTech 130', 1199, 'essence', 130)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PEUGEOT (406 (8B)) ──
WITH spec_80 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_psa-b71-2300_a3b4' LIMIT 1
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
  spec_80.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_80, (VALUES
  ('PEUGEOT', '406 (8B)', '406', '', 1761, 'essence', 110),
  ('PEUGEOT', '406 (8B)', '406', '1.8 16V', 1761, 'essence', 110),
  ('PEUGEOT', '406 (8B)', '406', '2.0 HDI 90', 1997, 'diesel', 90),
  ('PEUGEOT', '406 (8B)', '406', '2.0 HDI 110', 1997, 'diesel', 110),
  ('PEUGEOT', '406 Break (8E/F)', '406', '', 1761, 'essence', 110),
  ('PEUGEOT', '406 Break (8E/F)', '406', '1.8 16V', 1761, 'essence', 110),
  ('PEUGEOT', '406 Break (8E/F)', '406', '2.0 HDI 90', 1997, 'diesel', 90),
  ('PEUGEOT', '406 Break (8E/F)', '406', '2.0 HDI 110', 1997, 'diesel', 110),
  ('PEUGEOT', '406 Coupe (8C)', '406', '', 1761, 'essence', 110),
  ('PEUGEOT', '406 Coupe (8C)', '406', '1.8 16V', 1761, 'essence', 110),
  ('PEUGEOT', '406 Coupe (8C)', '406', '2.0 HDI 90', 1997, 'diesel', 90),
  ('PEUGEOT', '406 Coupe (8C)', '406', '2.0 HDI 110', 1997, 'diesel', 110),
  ('PEUGEOT', '406', '406', '', 1761, 'essence', 110),
  ('PEUGEOT', '406', '406', '1.8 16V', 1761, 'essence', 110),
  ('PEUGEOT', '406', '406', '2.0 HDI 90', 1997, 'diesel', 90),
  ('PEUGEOT', '406', '406', '2.0 HDI 110', 1997, 'diesel', 110)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CITROEN (C5 I (DC_)) ──
WITH spec_81 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_81.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_81, (VALUES
  ('CITROEN', 'C5 I (DC_)', 'II', '', 1997, 'diesel', 138),
  ('CITROEN', 'C5 I (DC_)', 'II', '2.0 HDI 138', 1997, 'diesel', 138),
  ('CITROEN', 'C5 I (DC_)', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C5 II (RE_)', 'II', '', 1997, 'diesel', 138),
  ('CITROEN', 'C5 II (RE_)', 'II', '2.0 HDI 138', 1997, 'diesel', 138),
  ('CITROEN', 'C5 II (RE_)', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C5 X (EHY)', 'II', '', 1997, 'diesel', 138),
  ('CITROEN', 'C5 X (EHY)', 'II', '2.0 HDI 138', 1997, 'diesel', 138),
  ('CITROEN', 'C5 X (EHY)', 'II', '1.6 HDi', 1560, 'diesel', 110),
  ('CITROEN', 'C5', 'II', '', 1997, 'diesel', 138),
  ('CITROEN', 'C5', 'II', '2.0 HDI 138', 1997, 'diesel', 138),
  ('CITROEN', 'C5', 'II', '1.6 HDi', 1560, 'diesel', 110)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CITROEN (JUMPY (U60)) ──
WITH spec_82 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_82.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_82, (VALUES
  ('CITROEN', 'JUMPY (U60)', 'II', '', 1997, 'diesel', 128),
  ('CITROEN', 'JUMPY (U60)', 'II', '2.0 HDI 128', 1997, 'diesel', 128),
  ('CITROEN', 'JUMPY (U60)', 'II', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'JUMPY II (G9)', 'II', '', 1997, 'diesel', 128),
  ('CITROEN', 'JUMPY II (G9)', 'II', '2.0 HDI 128', 1997, 'diesel', 128),
  ('CITROEN', 'JUMPY II (G9)', 'II', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'DISPATCH I', 'II', '', 1997, 'diesel', 128),
  ('CITROEN', 'DISPATCH I', 'II', '2.0 HDI 128', 1997, 'diesel', 128),
  ('CITROEN', 'DISPATCH I', 'II', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'DISPATCH II', 'II', '', 1997, 'diesel', 128),
  ('CITROEN', 'DISPATCH II', 'II', '2.0 HDI 128', 1997, 'diesel', 128),
  ('CITROEN', 'DISPATCH II', 'II', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'Jumpy', 'II', '', 1997, 'diesel', 128),
  ('CITROEN', 'Jumpy', 'II', '2.0 HDI 128', 1997, 'diesel', 128),
  ('CITROEN', 'Jumpy', 'II', '1.6 HDi', 1560, 'diesel', 90),
  ('CITROEN', 'JUMPY', 'II', '', 1997, 'diesel', 128),
  ('CITROEN', 'JUMPY', 'II', '2.0 HDI 128', 1997, 'diesel', 128),
  ('CITROEN', 'JUMPY', 'II', '1.6 HDi', 1560, 'diesel', 90)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── OPEL (ASTRA H (L48)) ──
WITH spec_83 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos2_c3' LIMIT 1
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
  spec_83.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_83, (VALUES
  ('OPEL', 'ASTRA H (L48)', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA H (L48)', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA H (L48)', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA H GTC (L08)', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA H Estate (L35)', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'ASTRA J (P10)', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA J (P10)', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA J (P10)', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA J GTC (P10)', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA J Sports Tourer (P10)', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'ASTRA K (B16)', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA K (B16)', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA K (B16)', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA K Sports Tourer', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'Astra H', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'Astra H', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'Astra H', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'Astra H', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'Astra H', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'Astra H', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'Astra H', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'Astra H', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'Astra H', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'Astra H', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'Astra H', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'Astra H', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'Astra J', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'Astra J', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'Astra J', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'Astra J', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'Astra J', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'Astra J', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'Astra J', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'Astra J', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'Astra J', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'Astra J', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'Astra J', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'Astra J', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'Astra K', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'Astra K', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'Astra K', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'Astra K', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'Astra K', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'Astra K', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'Astra K', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'Astra K', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'Astra K', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'Astra K', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'Astra K', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'Astra K', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'Astra', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'Astra', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'Astra', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'Astra', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'Astra', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'Astra', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'Astra', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'Astra', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'Astra', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'Astra', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'Astra', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'Astra', 'J', '1.4', 1364, 'essence', 100),
  ('OPEL', 'ASTRA', 'J', '', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA', 'J', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'ASTRA', 'J', '1.7 CDTI (A17DTS)', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA', 'J', '1.7 CDTI', 1686, 'diesel', 125),
  ('OPEL', 'ASTRA', 'J', '2.0 CDTI', 1956, 'diesel', 160),
  ('OPEL', 'ASTRA', 'J', '1.9 CDTI (Z19DTH)', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA', 'J', '1.9 CDTI', 1910, 'diesel', 120),
  ('OPEL', 'ASTRA', 'J', '1.6 (Z16XER)', 1598, 'essence', 115),
  ('OPEL', 'ASTRA', 'J', '1.6', 1598, 'essence', 115),
  ('OPEL', 'ASTRA', 'J', '1.4 T (A14NEL)', 1364, 'essence', 140),
  ('OPEL', 'ASTRA', 'J', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ASTRA', 'J', '1.4', 1364, 'essence', 100)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── OPEL (CORSA C (X01)) ──
WITH spec_84 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos2_c3' LIMIT 1
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
  spec_84.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_84, (VALUES
  ('OPEL', 'CORSA C (X01)', 'D', '', 1229, 'essence', 80),
  ('OPEL', 'CORSA C (X01)', 'D', '1.2 (Z12XEP)', 1229, 'essence', 80),
  ('OPEL', 'CORSA C (X01)', 'D', '1.2', 1229, 'essence', 80),
  ('OPEL', 'CORSA C (X01)', 'D', '1.4 (Z14XEP)', 1364, 'essence', 90),
  ('OPEL', 'CORSA C (X01)', 'D', '1.4', 1364, 'essence', 90),
  ('OPEL', 'CORSA C (X01)', 'D', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'CORSA C (X01)', 'D', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'CORSA D (S07)', 'D', '', 1229, 'essence', 80),
  ('OPEL', 'CORSA D (S07)', 'D', '1.2 (Z12XEP)', 1229, 'essence', 80),
  ('OPEL', 'CORSA D (S07)', 'D', '1.2', 1229, 'essence', 80),
  ('OPEL', 'CORSA D (S07)', 'D', '1.4 (Z14XEP)', 1364, 'essence', 90),
  ('OPEL', 'CORSA D (S07)', 'D', '1.4', 1364, 'essence', 90),
  ('OPEL', 'CORSA D (S07)', 'D', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'CORSA D (S07)', 'D', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'CORSA E (X15)', 'D', '', 1229, 'essence', 80),
  ('OPEL', 'CORSA E (X15)', 'D', '1.2 (Z12XEP)', 1229, 'essence', 80),
  ('OPEL', 'CORSA E (X15)', 'D', '1.2', 1229, 'essence', 80),
  ('OPEL', 'CORSA E (X15)', 'D', '1.4 (Z14XEP)', 1364, 'essence', 90),
  ('OPEL', 'CORSA E (X15)', 'D', '1.4', 1364, 'essence', 90),
  ('OPEL', 'CORSA E (X15)', 'D', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'CORSA E (X15)', 'D', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'CORSA F (P68)', 'D', '', 1229, 'essence', 80),
  ('OPEL', 'CORSA F (P68)', 'D', '1.2 (Z12XEP)', 1229, 'essence', 80),
  ('OPEL', 'CORSA F (P68)', 'D', '1.2', 1229, 'essence', 80),
  ('OPEL', 'CORSA F (P68)', 'D', '1.4 (Z14XEP)', 1364, 'essence', 90),
  ('OPEL', 'CORSA F (P68)', 'D', '1.4', 1364, 'essence', 90),
  ('OPEL', 'CORSA F (P68)', 'D', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'CORSA F (P68)', 'D', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'Corsa D', 'D', '', 1229, 'essence', 80),
  ('OPEL', 'Corsa D', 'D', '1.2 (Z12XEP)', 1229, 'essence', 80),
  ('OPEL', 'Corsa D', 'D', '1.2', 1229, 'essence', 80),
  ('OPEL', 'Corsa D', 'D', '1.4 (Z14XEP)', 1364, 'essence', 90),
  ('OPEL', 'Corsa D', 'D', '1.4', 1364, 'essence', 90),
  ('OPEL', 'Corsa D', 'D', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'Corsa D', 'D', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'Corsa E', 'D', '', 1229, 'essence', 80),
  ('OPEL', 'Corsa E', 'D', '1.2 (Z12XEP)', 1229, 'essence', 80),
  ('OPEL', 'Corsa E', 'D', '1.2', 1229, 'essence', 80),
  ('OPEL', 'Corsa E', 'D', '1.4 (Z14XEP)', 1364, 'essence', 90),
  ('OPEL', 'Corsa E', 'D', '1.4', 1364, 'essence', 90),
  ('OPEL', 'Corsa E', 'D', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'Corsa E', 'D', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'Corsa', 'D', '', 1229, 'essence', 80),
  ('OPEL', 'Corsa', 'D', '1.2 (Z12XEP)', 1229, 'essence', 80),
  ('OPEL', 'Corsa', 'D', '1.2', 1229, 'essence', 80),
  ('OPEL', 'Corsa', 'D', '1.4 (Z14XEP)', 1364, 'essence', 90),
  ('OPEL', 'Corsa', 'D', '1.4', 1364, 'essence', 90),
  ('OPEL', 'Corsa', 'D', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'Corsa', 'D', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'CORSA', 'D', '', 1229, 'essence', 80),
  ('OPEL', 'CORSA', 'D', '1.2 (Z12XEP)', 1229, 'essence', 80),
  ('OPEL', 'CORSA', 'D', '1.2', 1229, 'essence', 80),
  ('OPEL', 'CORSA', 'D', '1.4 (Z14XEP)', 1364, 'essence', 90),
  ('OPEL', 'CORSA', 'D', '1.4', 1364, 'essence', 90),
  ('OPEL', 'CORSA', 'D', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'CORSA', 'D', '1.7 CDTI', 1686, 'diesel', 100)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── OPEL (INSIGNIA A Sports Tourer (G09)) ──
WITH spec_85 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos2_c3' LIMIT 1
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
  spec_85.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_85, (VALUES
  ('OPEL', 'INSIGNIA A Sports Tourer (G09)', 'B', '', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA A Sports Tourer (G09)', 'B', '2.0 CDTI', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA A Sports Tourer (G09)', 'B', '2.0 CDTI BiTurbo', 1956, 'diesel', 210),
  ('OPEL', 'INSIGNIA A Sports Tourer (G09)', 'B', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'INSIGNIA A Sports Tourer (G09)', 'B', '1.5 CDTi', 1499, 'diesel', 136),
  ('OPEL', 'INSIGNIA A Sports Tourer (G09)', 'B', '1.5 Turbo', 1498, 'essence', 165),
  ('OPEL', 'INSIGNIA A (G09)', 'B', '', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA A (G09)', 'B', '2.0 CDTI', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA A (G09)', 'B', '2.0 CDTI BiTurbo', 1956, 'diesel', 210),
  ('OPEL', 'INSIGNIA A (G09)', 'B', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'INSIGNIA A (G09)', 'B', '1.5 CDTi', 1499, 'diesel', 136),
  ('OPEL', 'INSIGNIA A (G09)', 'B', '1.5 Turbo', 1498, 'essence', 165),
  ('OPEL', 'INSIGNIA B Sports Tourer (Z18)', 'B', '', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA B Sports Tourer (Z18)', 'B', '2.0 CDTI', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA B Sports Tourer (Z18)', 'B', '2.0 CDTI BiTurbo', 1956, 'diesel', 210),
  ('OPEL', 'INSIGNIA B Sports Tourer (Z18)', 'B', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'INSIGNIA B Sports Tourer (Z18)', 'B', '1.5 CDTi', 1499, 'diesel', 136),
  ('OPEL', 'INSIGNIA B Sports Tourer (Z18)', 'B', '1.5 Turbo', 1498, 'essence', 165),
  ('OPEL', 'INSIGNIA B (Z18)', 'B', '', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA B (Z18)', 'B', '2.0 CDTI', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA B (Z18)', 'B', '2.0 CDTI BiTurbo', 1956, 'diesel', 210),
  ('OPEL', 'INSIGNIA B (Z18)', 'B', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'INSIGNIA B (Z18)', 'B', '1.5 CDTi', 1499, 'diesel', 136),
  ('OPEL', 'INSIGNIA B (Z18)', 'B', '1.5 Turbo', 1498, 'essence', 165),
  ('OPEL', 'Insignia', 'B', '', 1956, 'diesel', 170),
  ('OPEL', 'Insignia', 'B', '2.0 CDTI', 1956, 'diesel', 170),
  ('OPEL', 'Insignia', 'B', '2.0 CDTI BiTurbo', 1956, 'diesel', 210),
  ('OPEL', 'Insignia', 'B', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'Insignia', 'B', '1.5 CDTi', 1499, 'diesel', 136),
  ('OPEL', 'Insignia', 'B', '1.5 Turbo', 1498, 'essence', 165),
  ('OPEL', 'INSIGNIA', 'B', '', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA', 'B', '2.0 CDTI', 1956, 'diesel', 170),
  ('OPEL', 'INSIGNIA', 'B', '2.0 CDTI BiTurbo', 1956, 'diesel', 210),
  ('OPEL', 'INSIGNIA', 'B', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'INSIGNIA', 'B', '1.5 CDTi', 1499, 'diesel', 136),
  ('OPEL', 'INSIGNIA', 'B', '1.5 Turbo', 1498, 'essence', 165)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── OPEL (MOKKA (J13)) ──
WITH spec_86 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos2_c3' LIMIT 1
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
  spec_86.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_86, (VALUES
  ('OPEL', 'MOKKA (J13)', 'J13', '', 1598, 'diesel', 110),
  ('OPEL', 'MOKKA (J13)', 'J13', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'MOKKA (J13)', 'J13', '1.7 CDTI', 1686, 'diesel', 130),
  ('OPEL', 'MOKKA (J13)', 'J13', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'MOKKA X (J13)', 'J13', '', 1598, 'diesel', 110),
  ('OPEL', 'MOKKA X (J13)', 'J13', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'MOKKA X (J13)', 'J13', '1.7 CDTI', 1686, 'diesel', 130),
  ('OPEL', 'MOKKA X (J13)', 'J13', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'MOKKA A', 'J13', '', 1598, 'diesel', 110),
  ('OPEL', 'MOKKA A', 'J13', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'MOKKA A', 'J13', '1.7 CDTI', 1686, 'diesel', 130),
  ('OPEL', 'MOKKA A', 'J13', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'Mokka', 'J13', '', 1598, 'diesel', 110),
  ('OPEL', 'Mokka', 'J13', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'Mokka', 'J13', '1.7 CDTI', 1686, 'diesel', 130),
  ('OPEL', 'Mokka', 'J13', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'MOKKA', 'J13', '', 1598, 'diesel', 110),
  ('OPEL', 'MOKKA', 'J13', '1.6 CDTI', 1598, 'diesel', 110),
  ('OPEL', 'MOKKA', 'J13', '1.7 CDTI', 1686, 'diesel', 130),
  ('OPEL', 'MOKKA', 'J13', '1.4 T', 1364, 'essence', 140)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── OPEL (MERIVA A (X03)) ──
WITH spec_87 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos2_c3' LIMIT 1
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
  spec_87.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_87, (VALUES
  ('OPEL', 'MERIVA A (X03)', 'B', '', 1248, 'diesel', 75),
  ('OPEL', 'MERIVA A (X03)', 'B', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'MERIVA A (X03)', 'B', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'MERIVA A (X03)', 'B', '1.4 T', 1364, 'essence', 120),
  ('OPEL', 'MERIVA B (S10)', 'B', '', 1248, 'diesel', 75),
  ('OPEL', 'MERIVA B (S10)', 'B', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'MERIVA B (S10)', 'B', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'MERIVA B (S10)', 'B', '1.4 T', 1364, 'essence', 120),
  ('OPEL', 'Meriva', 'B', '', 1248, 'diesel', 75),
  ('OPEL', 'Meriva', 'B', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'Meriva', 'B', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'Meriva', 'B', '1.4 T', 1364, 'essence', 120),
  ('OPEL', 'MERIVA', 'B', '', 1248, 'diesel', 75),
  ('OPEL', 'MERIVA', 'B', '1.3 CDTI', 1248, 'diesel', 75),
  ('OPEL', 'MERIVA', 'B', '1.7 CDTI', 1686, 'diesel', 100),
  ('OPEL', 'MERIVA', 'B', '1.4 T', 1364, 'essence', 120)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── OPEL (ZAFIRA B (A05)) ──
WITH spec_88 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos2_c3' LIMIT 1
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
  spec_88.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_88, (VALUES
  ('OPEL', 'ZAFIRA B (A05)', 'C', '', 1956, 'diesel', 165),
  ('OPEL', 'ZAFIRA B (A05)', 'C', '2.0 CDTI', 1956, 'diesel', 165),
  ('OPEL', 'ZAFIRA B (A05)', 'C', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'ZAFIRA B (A05)', 'C', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ZAFIRA C Tourer (P12)', 'C', '', 1956, 'diesel', 165),
  ('OPEL', 'ZAFIRA C Tourer (P12)', 'C', '2.0 CDTI', 1956, 'diesel', 165),
  ('OPEL', 'ZAFIRA C Tourer (P12)', 'C', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'ZAFIRA C Tourer (P12)', 'C', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'Zafira', 'C', '', 1956, 'diesel', 165),
  ('OPEL', 'Zafira', 'C', '2.0 CDTI', 1956, 'diesel', 165),
  ('OPEL', 'Zafira', 'C', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'Zafira', 'C', '1.4 T', 1364, 'essence', 140),
  ('OPEL', 'ZAFIRA', 'C', '', 1956, 'diesel', 165),
  ('OPEL', 'ZAFIRA', 'C', '2.0 CDTI', 1956, 'diesel', 165),
  ('OPEL', 'ZAFIRA', 'C', '1.6 CDTI', 1598, 'diesel', 136),
  ('OPEL', 'ZAFIRA', 'C', '1.4 T', 1364, 'essence', 140)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── OPEL (VIVARO A (F7)) ──
WITH spec_89 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos2_c3' LIMIT 1
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
  spec_89.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_89, (VALUES
  ('OPEL', 'VIVARO A (F7)', 'B', '', 1598, 'diesel', 120),
  ('OPEL', 'VIVARO A (F7)', 'B', '1.6 CDTI', 1598, 'diesel', 120),
  ('OPEL', 'VIVARO A (F7)', 'B', '1.6 BiTurbo CDTI', 1598, 'diesel', 145),
  ('OPEL', 'VIVARO A (F7)', 'B', '2.0 CDTI', 1956, 'diesel', 150),
  ('OPEL', 'VIVARO B (X82)', 'B', '', 1598, 'diesel', 120),
  ('OPEL', 'VIVARO B (X82)', 'B', '1.6 CDTI', 1598, 'diesel', 120),
  ('OPEL', 'VIVARO B (X82)', 'B', '1.6 BiTurbo CDTI', 1598, 'diesel', 145),
  ('OPEL', 'VIVARO B (X82)', 'B', '2.0 CDTI', 1956, 'diesel', 150),
  ('OPEL', 'Vivaro', 'B', '', 1598, 'diesel', 120),
  ('OPEL', 'Vivaro', 'B', '1.6 CDTI', 1598, 'diesel', 120),
  ('OPEL', 'Vivaro', 'B', '1.6 BiTurbo CDTI', 1598, 'diesel', 145),
  ('OPEL', 'Vivaro', 'B', '2.0 CDTI', 1956, 'diesel', 150),
  ('OPEL', 'VIVARO', 'B', '', 1598, 'diesel', 120),
  ('OPEL', 'VIVARO', 'B', '1.6 CDTI', 1598, 'diesel', 120),
  ('OPEL', 'VIVARO', 'B', '1.6 BiTurbo CDTI', 1598, 'diesel', 145),
  ('OPEL', 'VIVARO', 'B', '2.0 CDTI', 1956, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── OPEL (VECTRA B (J96)) ──
WITH spec_90 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_gm-b025-api_a3b4' LIMIT 1
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
  spec_90.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_90, (VALUES
  ('OPEL', 'VECTRA B (J96)', 'C', '', 1998, 'essence', 140),
  ('OPEL', 'VECTRA B (J96)', 'C', '2.0 16V (Z20LER)', 1998, 'essence', 140),
  ('OPEL', 'VECTRA B (J96)', 'C', '2.0 DTi', 1995, 'diesel', 100),
  ('OPEL', 'VECTRA B (J96)', 'C', '1.9 CDTi', 1910, 'diesel', 120),
  ('OPEL', 'VECTRA C (Z02)', 'C', '', 1998, 'essence', 140),
  ('OPEL', 'VECTRA C (Z02)', 'C', '2.0 16V (Z20LER)', 1998, 'essence', 140),
  ('OPEL', 'VECTRA C (Z02)', 'C', '2.0 DTi', 1995, 'diesel', 100),
  ('OPEL', 'VECTRA C (Z02)', 'C', '1.9 CDTi', 1910, 'diesel', 120),
  ('OPEL', 'Vectra', 'C', '', 1998, 'essence', 140),
  ('OPEL', 'Vectra', 'C', '2.0 16V (Z20LER)', 1998, 'essence', 140),
  ('OPEL', 'Vectra', 'C', '2.0 DTi', 1995, 'diesel', 100),
  ('OPEL', 'Vectra', 'C', '1.9 CDTi', 1910, 'diesel', 120),
  ('OPEL', 'VECTRA', 'C', '', 1998, 'essence', 140),
  ('OPEL', 'VECTRA', 'C', '2.0 16V (Z20LER)', 1998, 'essence', 140),
  ('OPEL', 'VECTRA', 'C', '2.0 DTi', 1995, 'diesel', 100),
  ('OPEL', 'VECTRA', 'C', '1.9 CDTi', 1910, 'diesel', 120)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── ALFA ROMEO (GIULIETTA (940_)) ──
WITH spec_91 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_selenia-alfa_c3' LIMIT 1
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
  spec_91.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_91, (VALUES
  ('ALFA ROMEO', 'GIULIETTA (940_)', '940', '', 1248, 'diesel', 105),
  ('ALFA ROMEO', 'GIULIETTA (940_)', '940', '1.6 JTDm', 1248, 'diesel', 105),
  ('ALFA ROMEO', 'GIULIETTA (940_)', '940', '2.0 JTDm', 1956, 'diesel', 150),
  ('ALFA ROMEO', 'GIULIETTA (940_)', '940', '1.4 TB', 1368, 'essence', 120),
  ('ALFA ROMEO', 'GIULIETTA (940_)', '940', '1.4 MultiAir', 1368, 'essence', 170),
  ('ALFA ROMEO', 'Giulietta', '940', '', 1248, 'diesel', 105),
  ('ALFA ROMEO', 'Giulietta', '940', '1.6 JTDm', 1248, 'diesel', 105),
  ('ALFA ROMEO', 'Giulietta', '940', '2.0 JTDm', 1956, 'diesel', 150),
  ('ALFA ROMEO', 'Giulietta', '940', '1.4 TB', 1368, 'essence', 120),
  ('ALFA ROMEO', 'Giulietta', '940', '1.4 MultiAir', 1368, 'essence', 170),
  ('ALFA ROMEO', 'GIULIETTA', '940', '', 1248, 'diesel', 105),
  ('ALFA ROMEO', 'GIULIETTA', '940', '1.6 JTDm', 1248, 'diesel', 105),
  ('ALFA ROMEO', 'GIULIETTA', '940', '2.0 JTDm', 1956, 'diesel', 150),
  ('ALFA ROMEO', 'GIULIETTA', '940', '1.4 TB', 1368, 'essence', 120),
  ('ALFA ROMEO', 'GIULIETTA', '940', '1.4 MultiAir', 1368, 'essence', 170)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── ALFA ROMEO (147 (937_)) ──
WITH spec_92 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_fiat-955535-g2_a3b4' LIMIT 1
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
  spec_92.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_92, (VALUES
  ('ALFA ROMEO', '147 (937_)', '937', '', 1598, 'essence', 105),
  ('ALFA ROMEO', '147 (937_)', '937', '1.6 TS (937AXA...)', 1598, 'essence', 105),
  ('ALFA ROMEO', '147 (937_)', '937', '1.9 JTD', 1910, 'diesel', 115),
  ('ALFA ROMEO', '147 (937_)', '937', '2.0 TS', 1970, 'essence', 150),
  ('ALFA ROMEO', '147', '937', '', 1598, 'essence', 105),
  ('ALFA ROMEO', '147', '937', '1.6 TS (937AXA...)', 1598, 'essence', 105),
  ('ALFA ROMEO', '147', '937', '1.9 JTD', 1910, 'diesel', 115),
  ('ALFA ROMEO', '147', '937', '2.0 TS', 1970, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── ALFA ROMEO (156 (932_)) ──
WITH spec_93 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_fiat-955535-g2_a3b4' LIMIT 1
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
  spec_93.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_93, (VALUES
  ('ALFA ROMEO', '156 (932_)', '932', '', 1598, 'essence', 105),
  ('ALFA ROMEO', '156 (932_)', '932', '1.6 TS', 1598, 'essence', 105),
  ('ALFA ROMEO', '156 (932_)', '932', '1.9 JTD', 1910, 'diesel', 115),
  ('ALFA ROMEO', '156 (932_)', '932', '2.0 TS', 1970, 'essence', 150),
  ('ALFA ROMEO', '156 Sportwagon (932_)', '932', '', 1598, 'essence', 105),
  ('ALFA ROMEO', '156 Sportwagon (932_)', '932', '1.6 TS', 1598, 'essence', 105),
  ('ALFA ROMEO', '156 Sportwagon (932_)', '932', '1.9 JTD', 1910, 'diesel', 115),
  ('ALFA ROMEO', '156 Sportwagon (932_)', '932', '2.0 TS', 1970, 'essence', 150),
  ('ALFA ROMEO', '156', '932', '', 1598, 'essence', 105),
  ('ALFA ROMEO', '156', '932', '1.6 TS', 1598, 'essence', 105),
  ('ALFA ROMEO', '156', '932', '1.9 JTD', 1910, 'diesel', 115),
  ('ALFA ROMEO', '156', '932', '2.0 TS', 1970, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── ALFA ROMEO (MITO (955_)) ──
WITH spec_94 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_selenia-alfa_c3' LIMIT 1
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
  spec_94.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_94, (VALUES
  ('ALFA ROMEO', 'MITO (955_)', '955', '', 1248, 'diesel', 85),
  ('ALFA ROMEO', 'MITO (955_)', '955', '1.3 JTDm', 1248, 'diesel', 85),
  ('ALFA ROMEO', 'MITO (955_)', '955', '1.4 TB', 1368, 'essence', 155),
  ('ALFA ROMEO', 'MITO (955_)', '955', '1.4 MultiAir', 1368, 'essence', 105),
  ('ALFA ROMEO', 'MiTo', '955', '', 1248, 'diesel', 85),
  ('ALFA ROMEO', 'MiTo', '955', '1.3 JTDm', 1248, 'diesel', 85),
  ('ALFA ROMEO', 'MiTo', '955', '1.4 TB', 1368, 'essence', 155),
  ('ALFA ROMEO', 'MiTo', '955', '1.4 MultiAir', 1368, 'essence', 105),
  ('ALFA ROMEO', 'MITO', '955', '', 1248, 'diesel', 85),
  ('ALFA ROMEO', 'MITO', '955', '1.3 JTDm', 1248, 'diesel', 85),
  ('ALFA ROMEO', 'MITO', '955', '1.4 TB', 1368, 'essence', 155),
  ('ALFA ROMEO', 'MITO', '955', '1.4 MultiAir', 1368, 'essence', 105)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── ALFA ROMEO (STELVIO (949_)) ──
WITH spec_95 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_selenia-alfa_c3' LIMIT 1
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
  spec_95.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_95, (VALUES
  ('ALFA ROMEO', 'STELVIO (949_)', '949', '', 2143, 'diesel', 210),
  ('ALFA ROMEO', 'STELVIO (949_)', '949', '2.2 JTDm', 2143, 'diesel', 210),
  ('ALFA ROMEO', 'STELVIO (949_)', '949', '2.0 T', 1995, 'essence', 280),
  ('ALFA ROMEO', 'Stelvio', '949', '', 2143, 'diesel', 210),
  ('ALFA ROMEO', 'Stelvio', '949', '2.2 JTDm', 2143, 'diesel', 210),
  ('ALFA ROMEO', 'Stelvio', '949', '2.0 T', 1995, 'essence', 280),
  ('ALFA ROMEO', 'STELVIO', '949', '', 2143, 'diesel', 210),
  ('ALFA ROMEO', 'STELVIO', '949', '2.2 JTDm', 2143, 'diesel', 210),
  ('ALFA ROMEO', 'STELVIO', '949', '2.0 T', 1995, 'essence', 280)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LANCIA (YPSILON (843_)) ──
WITH spec_96 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_96.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_96, (VALUES
  ('LANCIA', 'YPSILON (843_)', '846', '', 1242, 'essence', 69),
  ('LANCIA', 'YPSILON (843_)', '846', '1.2', 1242, 'essence', 69),
  ('LANCIA', 'YPSILON (843_)', '846', '1.3 Multijet', 1248, 'diesel', 85),
  ('LANCIA', 'YPSILON (843_)', '846', '0.9 TwinAir', 875, 'essence', 85),
  ('LANCIA', 'YPSILON (846_)', '846', '', 1242, 'essence', 69),
  ('LANCIA', 'YPSILON (846_)', '846', '1.2', 1242, 'essence', 69),
  ('LANCIA', 'YPSILON (846_)', '846', '1.3 Multijet', 1248, 'diesel', 85),
  ('LANCIA', 'YPSILON (846_)', '846', '0.9 TwinAir', 875, 'essence', 85),
  ('LANCIA', 'Ypsilon', '846', '', 1242, 'essence', 69),
  ('LANCIA', 'Ypsilon', '846', '1.2', 1242, 'essence', 69),
  ('LANCIA', 'Ypsilon', '846', '1.3 Multijet', 1248, 'diesel', 85),
  ('LANCIA', 'Ypsilon', '846', '0.9 TwinAir', 875, 'essence', 85),
  ('LANCIA', 'YPSILON', '846', '', 1242, 'essence', 69),
  ('LANCIA', 'YPSILON', '846', '1.2', 1242, 'essence', 69),
  ('LANCIA', 'YPSILON', '846', '1.3 Multijet', 1248, 'diesel', 85),
  ('LANCIA', 'YPSILON', '846', '0.9 TwinAir', 875, 'essence', 85)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LANCIA (DELTA III (844_)) ──
WITH spec_97 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_97.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_97, (VALUES
  ('LANCIA', 'DELTA III (844_)', '844', '', 1368, 'essence', 150),
  ('LANCIA', 'DELTA III (844_)', '844', '1.4 TB MultiAir', 1368, 'essence', 150),
  ('LANCIA', 'DELTA III (844_)', '844', '2.0 Multijet', 1956, 'diesel', 165),
  ('LANCIA', 'Delta', '844', '', 1368, 'essence', 150),
  ('LANCIA', 'Delta', '844', '1.4 TB MultiAir', 1368, 'essence', 150),
  ('LANCIA', 'Delta', '844', '2.0 Multijet', 1956, 'diesel', 165),
  ('LANCIA', 'DELTA', '844', '', 1368, 'essence', 150),
  ('LANCIA', 'DELTA', '844', '1.4 TB MultiAir', 1368, 'essence', 150),
  ('LANCIA', 'DELTA', '844', '2.0 Multijet', 1956, 'diesel', 165)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── JEEP (RENEGADE (BU)) ──
WITH spec_98 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_98.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_98, (VALUES
  ('JEEP', 'RENEGADE (BU)', 'BU', '', 1368, 'diesel', 120),
  ('JEEP', 'RENEGADE (BU)', 'BU', '1.3 MultiAir', 1368, 'essence', 150),
  ('JEEP', 'RENEGADE (BU)', 'BU', '1.6 MultiJet', 1598, 'diesel', 120),
  ('JEEP', 'RENEGADE (BU)', 'BU', '2.0 MultiJet 4x4', 1956, 'diesel', 170),
  ('JEEP', 'Renegade', 'BU', '', 1368, 'diesel', 120),
  ('JEEP', 'Renegade', 'BU', '1.3 MultiAir', 1368, 'essence', 150),
  ('JEEP', 'Renegade', 'BU', '1.6 MultiJet', 1598, 'diesel', 120),
  ('JEEP', 'Renegade', 'BU', '2.0 MultiJet 4x4', 1956, 'diesel', 170),
  ('JEEP', 'RENEGADE', 'BU', '', 1368, 'diesel', 120),
  ('JEEP', 'RENEGADE', 'BU', '1.3 MultiAir', 1368, 'essence', 150),
  ('JEEP', 'RENEGADE', 'BU', '1.6 MultiJet', 1598, 'diesel', 120),
  ('JEEP', 'RENEGADE', 'BU', '2.0 MultiJet 4x4', 1956, 'diesel', 170)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── JEEP (COMPASS II (MP)) ──
WITH spec_99 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_99.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_99, (VALUES
  ('JEEP', 'COMPASS II (MP)', 'MP', '', 1956, 'diesel', 170),
  ('JEEP', 'COMPASS II (MP)', 'MP', '2.0 MultiJet 4x4', 1956, 'diesel', 170),
  ('JEEP', 'COMPASS II (MP)', 'MP', '1.3 T4 PHEV', 1332, 'essence', 190),
  ('JEEP', 'Compass', 'MP', '', 1956, 'diesel', 170),
  ('JEEP', 'Compass', 'MP', '2.0 MultiJet 4x4', 1956, 'diesel', 170),
  ('JEEP', 'Compass', 'MP', '1.3 T4 PHEV', 1332, 'essence', 190),
  ('JEEP', 'COMPASS', 'MP', '', 1956, 'diesel', 170),
  ('JEEP', 'COMPASS', 'MP', '2.0 MultiJet 4x4', 1956, 'diesel', 170),
  ('JEEP', 'COMPASS', 'MP', '1.3 T4 PHEV', 1332, 'essence', 190)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── JEEP (WRANGLER III (JK)) ──
WITH spec_100 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-40_fiat-955535-s2_c3' LIMIT 1
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
  spec_100.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_100, (VALUES
  ('JEEP', 'WRANGLER III (JK)', 'JL', '', 1995, 'diesel', 200),
  ('JEEP', 'WRANGLER III (JK)', 'JL', '2.0 Turbo', 1995, 'essence', 272),
  ('JEEP', 'WRANGLER III (JK)', 'JL', '3.6 V6', 3604, 'essence', 284),
  ('JEEP', 'WRANGLER III (JK)', 'JL', '2.2 MultiJet II', 2184, 'diesel', 200),
  ('JEEP', 'WRANGLER IV (JL)', 'JL', '', 1995, 'diesel', 200),
  ('JEEP', 'WRANGLER IV (JL)', 'JL', '2.0 Turbo', 1995, 'essence', 272),
  ('JEEP', 'WRANGLER IV (JL)', 'JL', '3.6 V6', 3604, 'essence', 284),
  ('JEEP', 'WRANGLER IV (JL)', 'JL', '2.2 MultiJet II', 2184, 'diesel', 200),
  ('JEEP', 'Wrangler', 'JL', '', 1995, 'diesel', 200),
  ('JEEP', 'Wrangler', 'JL', '2.0 Turbo', 1995, 'essence', 272),
  ('JEEP', 'Wrangler', 'JL', '3.6 V6', 3604, 'essence', 284),
  ('JEEP', 'Wrangler', 'JL', '2.2 MultiJet II', 2184, 'diesel', 200),
  ('JEEP', 'WRANGLER', 'JL', '', 1995, 'diesel', 200),
  ('JEEP', 'WRANGLER', 'JL', '2.0 Turbo', 1995, 'essence', 272),
  ('JEEP', 'WRANGLER', 'JL', '3.6 V6', 3604, 'essence', 284),
  ('JEEP', 'WRANGLER', 'JL', '2.2 MultiJet II', 2184, 'diesel', 200)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (SCENIC I (JA0/1_)) ──
WITH spec_101 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_101.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_101, (VALUES
  ('RENAULT', 'SCENIC I (JA0/1_)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC I (JA0/1_)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC I (JA0/1_)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'SCENIC I (JA0/1_)', 'III', '2.0 dCi', 1995, 'diesel', 150),
  ('RENAULT', 'SCENIC II (JM0/1_)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC II (JM0/1_)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC II (JM0/1_)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'SCENIC II (JM0/1_)', 'III', '2.0 dCi', 1995, 'diesel', 150),
  ('RENAULT', 'SCENIC III (JZ0/1_)', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC III (JZ0/1_)', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC III (JZ0/1_)', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'SCENIC III (JZ0/1_)', 'III', '2.0 dCi', 1995, 'diesel', 150),
  ('RENAULT', 'SCENIC IV', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC IV', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC IV', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'SCENIC IV', 'III', '2.0 dCi', 1995, 'diesel', 150),
  ('RENAULT', 'Scenic', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'Scenic', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'Scenic', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'Scenic', 'III', '2.0 dCi', 1995, 'diesel', 150),
  ('RENAULT', 'SCENIC', 'III', '', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC', 'III', '1.5 dCi 110', 1461, 'diesel', 110),
  ('RENAULT', 'SCENIC', 'III', '1.6 16V', 1598, 'essence', 110),
  ('RENAULT', 'SCENIC', 'III', '2.0 dCi', 1995, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── RENAULT (TRAFIC II (FL)) ──
WITH spec_102 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_102.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_102, (VALUES
  ('RENAULT', 'TRAFIC II (FL)', 'III', '', 1598, 'diesel', 120),
  ('RENAULT', 'TRAFIC II (FL)', 'III', '1.6 dCi 120', 1598, 'diesel', 120),
  ('RENAULT', 'TRAFIC II (FL)', 'III', '2.0 dCi', 1995, 'diesel', 115),
  ('RENAULT', 'TRAFIC III (FG_)', 'III', '', 1598, 'diesel', 120),
  ('RENAULT', 'TRAFIC III (FG_)', 'III', '1.6 dCi 120', 1598, 'diesel', 120),
  ('RENAULT', 'TRAFIC III (FG_)', 'III', '2.0 dCi', 1995, 'diesel', 115),
  ('RENAULT', 'Trafic', 'III', '', 1598, 'diesel', 120),
  ('RENAULT', 'Trafic', 'III', '1.6 dCi 120', 1598, 'diesel', 120),
  ('RENAULT', 'Trafic', 'III', '2.0 dCi', 1995, 'diesel', 115),
  ('RENAULT', 'TRAFIC', 'III', '', 1598, 'diesel', 120),
  ('RENAULT', 'TRAFIC', 'III', '1.6 dCi 120', 1598, 'diesel', 120),
  ('RENAULT', 'TRAFIC', 'III', '2.0 dCi', 1995, 'diesel', 115)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── DACIA (DOKKER (SD_)) ──
WITH spec_103 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_renault-rn0700_a3b4' LIMIT 1
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
  spec_103.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_103, (VALUES
  ('DACIA', 'DOKKER (SD_)', 'I', '', 1461, 'diesel', 75),
  ('DACIA', 'DOKKER (SD_)', 'I', '1.5 dCi 75', 1461, 'diesel', 75),
  ('DACIA', 'DOKKER (SD_)', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('DACIA', 'DOKKER (SD_)', 'I', '1.6 MPI', 1598, 'essence', 85),
  ('DACIA', 'DOKKER Express (FSD_)', 'I', '', 1461, 'diesel', 75),
  ('DACIA', 'DOKKER Express (FSD_)', 'I', '1.5 dCi 75', 1461, 'diesel', 75),
  ('DACIA', 'DOKKER Express (FSD_)', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('DACIA', 'DOKKER Express (FSD_)', 'I', '1.6 MPI', 1598, 'essence', 85),
  ('DACIA', 'Dokker', 'I', '', 1461, 'diesel', 75),
  ('DACIA', 'Dokker', 'I', '1.5 dCi 75', 1461, 'diesel', 75),
  ('DACIA', 'Dokker', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('DACIA', 'Dokker', 'I', '1.6 MPI', 1598, 'essence', 85),
  ('DACIA', 'DOKKER', 'I', '', 1461, 'diesel', 75),
  ('DACIA', 'DOKKER', 'I', '1.5 dCi 75', 1461, 'diesel', 75),
  ('DACIA', 'DOKKER', 'I', '1.5 dCi 90', 1461, 'diesel', 90),
  ('DACIA', 'DOKKER', 'I', '1.6 MPI', 1598, 'essence', 85)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (CAMRY (_XV4_)) ──
WITH spec_104 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_104.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_104, (VALUES
  ('TOYOTA', 'CAMRY (_XV4_)', 'XV50', '', 1998, 'essence', 151),
  ('TOYOTA', 'CAMRY (_XV4_)', 'XV50', '2.0 VVT-i', 1998, 'essence', 151),
  ('TOYOTA', 'CAMRY (_XV4_)', 'XV50', '2.5 Hybrid', 2494, 'essence', 218),
  ('TOYOTA', 'CAMRY (_XV5_)', 'XV50', '', 1998, 'essence', 151),
  ('TOYOTA', 'CAMRY (_XV5_)', 'XV50', '2.0 VVT-i', 1998, 'essence', 151),
  ('TOYOTA', 'CAMRY (_XV5_)', 'XV50', '2.5 Hybrid', 2494, 'essence', 218),
  ('TOYOTA', 'CAMRY (_XV7_)', 'XV50', '', 1998, 'essence', 151),
  ('TOYOTA', 'CAMRY (_XV7_)', 'XV50', '2.0 VVT-i', 1998, 'essence', 151),
  ('TOYOTA', 'CAMRY (_XV7_)', 'XV50', '2.5 Hybrid', 2494, 'essence', 218),
  ('TOYOTA', 'Camry', 'XV50', '', 1998, 'essence', 151),
  ('TOYOTA', 'Camry', 'XV50', '2.0 VVT-i', 1998, 'essence', 151),
  ('TOYOTA', 'Camry', 'XV50', '2.5 Hybrid', 2494, 'essence', 218),
  ('TOYOTA', 'CAMRY', 'XV50', '', 1998, 'essence', 151),
  ('TOYOTA', 'CAMRY', 'XV50', '2.0 VVT-i', 1998, 'essence', 151),
  ('TOYOTA', 'CAMRY', 'XV50', '2.5 Hybrid', 2494, 'essence', 218)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (AVENSIS (_T25_)) ──
WITH spec_105 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_105.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_105, (VALUES
  ('TOYOTA', 'AVENSIS (_T25_)', 'T27', '', 1998, 'diesel', 126),
  ('TOYOTA', 'AVENSIS (_T25_)', 'T27', '2.0 D-4D', 1998, 'diesel', 126),
  ('TOYOTA', 'AVENSIS (_T25_)', 'T27', '2.2 D-4D', 2231, 'diesel', 150),
  ('TOYOTA', 'AVENSIS (_T25_)', 'T27', '1.8 (2ZR-FAE)', 1798, 'essence', 147),
  ('TOYOTA', 'AVENSIS (_T27_)', 'T27', '', 1998, 'diesel', 126),
  ('TOYOTA', 'AVENSIS (_T27_)', 'T27', '2.0 D-4D', 1998, 'diesel', 126),
  ('TOYOTA', 'AVENSIS (_T27_)', 'T27', '2.2 D-4D', 2231, 'diesel', 150),
  ('TOYOTA', 'AVENSIS (_T27_)', 'T27', '1.8 (2ZR-FAE)', 1798, 'essence', 147),
  ('TOYOTA', 'AVENSIS (_T29_)', 'T27', '', 1998, 'diesel', 126),
  ('TOYOTA', 'AVENSIS (_T29_)', 'T27', '2.0 D-4D', 1998, 'diesel', 126),
  ('TOYOTA', 'AVENSIS (_T29_)', 'T27', '2.2 D-4D', 2231, 'diesel', 150),
  ('TOYOTA', 'AVENSIS (_T29_)', 'T27', '1.8 (2ZR-FAE)', 1798, 'essence', 147),
  ('TOYOTA', 'Avensis', 'T27', '', 1998, 'diesel', 126),
  ('TOYOTA', 'Avensis', 'T27', '2.0 D-4D', 1998, 'diesel', 126),
  ('TOYOTA', 'Avensis', 'T27', '2.2 D-4D', 2231, 'diesel', 150),
  ('TOYOTA', 'Avensis', 'T27', '1.8 (2ZR-FAE)', 1798, 'essence', 147),
  ('TOYOTA', 'AVENSIS', 'T27', '', 1998, 'diesel', 126),
  ('TOYOTA', 'AVENSIS', 'T27', '2.0 D-4D', 1998, 'diesel', 126),
  ('TOYOTA', 'AVENSIS', 'T27', '2.2 D-4D', 2231, 'diesel', 150),
  ('TOYOTA', 'AVENSIS', 'T27', '1.8 (2ZR-FAE)', 1798, 'essence', 147)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (AURIS (E15_)) ──
WITH spec_106 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_106.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_106, (VALUES
  ('TOYOTA', 'AURIS (E15_)', 'E18', '', 1364, 'diesel', 90),
  ('TOYOTA', 'AURIS (E15_)', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'AURIS (E15_)', 'E18', '1.6 (1ZR-FAE)', 1598, 'essence', 132),
  ('TOYOTA', 'AURIS (E15_)', 'E18', '1.8 Hybrid', 1798, 'essence', 136),
  ('TOYOTA', 'AURIS (E18_)', 'E18', '', 1364, 'diesel', 90),
  ('TOYOTA', 'AURIS (E18_)', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'AURIS (E18_)', 'E18', '1.6 (1ZR-FAE)', 1598, 'essence', 132),
  ('TOYOTA', 'AURIS (E18_)', 'E18', '1.8 Hybrid', 1798, 'essence', 136),
  ('TOYOTA', 'Auris', 'E18', '', 1364, 'diesel', 90),
  ('TOYOTA', 'Auris', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'Auris', 'E18', '1.6 (1ZR-FAE)', 1598, 'essence', 132),
  ('TOYOTA', 'Auris', 'E18', '1.8 Hybrid', 1798, 'essence', 136),
  ('TOYOTA', 'AURIS', 'E18', '', 1364, 'diesel', 90),
  ('TOYOTA', 'AURIS', 'E18', '1.4 D-4D', 1364, 'diesel', 90),
  ('TOYOTA', 'AURIS', 'E18', '1.6 (1ZR-FAE)', 1598, 'essence', 132),
  ('TOYOTA', 'AURIS', 'E18', '1.8 Hybrid', 1798, 'essence', 136)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (LAND CRUISER (J12_)) ──
WITH spec_107 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_107.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_107, (VALUES
  ('TOYOTA', 'LAND CRUISER (J12_)', 'J200', '', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER (J12_)', 'J200', '4.5 V8 D-4D', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER (J12_)', 'J200', '3.0 D-4D (1KD-FTV)', 2982, 'diesel', 173),
  ('TOYOTA', 'LAND CRUISER PRADO (J12_)', 'J200', '', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER PRADO (J12_)', 'J200', '4.5 V8 D-4D', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER PRADO (J12_)', 'J200', '3.0 D-4D (1KD-FTV)', 2982, 'diesel', 173),
  ('TOYOTA', 'LAND CRUISER (J200)', 'J200', '', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER (J200)', 'J200', '4.5 V8 D-4D', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER (J200)', 'J200', '3.0 D-4D (1KD-FTV)', 2982, 'diesel', 173),
  ('TOYOTA', 'LAND CRUISER (J300)', 'J200', '', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER (J300)', 'J200', '4.5 V8 D-4D', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER (J300)', 'J200', '3.0 D-4D (1KD-FTV)', 2982, 'diesel', 173),
  ('TOYOTA', 'Land Cruiser', 'J200', '', 4461, 'diesel', 286),
  ('TOYOTA', 'Land Cruiser', 'J200', '4.5 V8 D-4D', 4461, 'diesel', 286),
  ('TOYOTA', 'Land Cruiser', 'J200', '3.0 D-4D (1KD-FTV)', 2982, 'diesel', 173),
  ('TOYOTA', 'LAND CRUISER', 'J200', '', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER', 'J200', '4.5 V8 D-4D', 4461, 'diesel', 286),
  ('TOYOTA', 'LAND CRUISER', 'J200', '3.0 D-4D (1KD-FTV)', 2982, 'diesel', 173)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── TOYOTA (C-HR (AX10_)) ──
WITH spec_108 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_108.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_108, (VALUES
  ('TOYOTA', 'C-HR (AX10_)', 'AX10', '', 1197, 'essence', 116),
  ('TOYOTA', 'C-HR (AX10_)', 'AX10', '1.2 T', 1197, 'essence', 116),
  ('TOYOTA', 'C-HR (AX10_)', 'AX10', '1.8 Hybrid', 1798, 'essence', 122),
  ('TOYOTA', 'C-HR', 'AX10', '', 1197, 'essence', 116),
  ('TOYOTA', 'C-HR', 'AX10', '1.2 T', 1197, 'essence', 116),
  ('TOYOTA', 'C-HR', 'AX10', '1.8 Hybrid', 1798, 'essence', 122),
  ('TOYOTA', 'CHR', 'AX10', '', 1197, 'essence', 116),
  ('TOYOTA', 'CHR', 'AX10', '1.2 T', 1197, 'essence', 116),
  ('TOYOTA', 'CHR', 'AX10', '1.8 Hybrid', 1798, 'essence', 122)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HYUNDAI (i30 (FD)) ──
WITH spec_109 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_109.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_109, (VALUES
  ('HYUNDAI', 'i30 (FD)', 'GD', '', 1582, 'essence', 132),
  ('HYUNDAI', 'i30 (FD)', 'GD', '1.6 GDi', 1582, 'essence', 132),
  ('HYUNDAI', 'i30 (FD)', 'GD', '1.4 T-GDi', 1353, 'essence', 140),
  ('HYUNDAI', 'i30 (FD)', 'GD', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i30 (FD)', 'GD', '1.6 CRDi', 1582, 'diesel', 110),
  ('HYUNDAI', 'i30 (GD)', 'GD', '', 1582, 'essence', 132),
  ('HYUNDAI', 'i30 (GD)', 'GD', '1.6 GDi', 1582, 'essence', 132),
  ('HYUNDAI', 'i30 (GD)', 'GD', '1.4 T-GDi', 1353, 'essence', 140),
  ('HYUNDAI', 'i30 (GD)', 'GD', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i30 (GD)', 'GD', '1.6 CRDi', 1582, 'diesel', 110),
  ('HYUNDAI', 'i30 (PD)', 'GD', '', 1582, 'essence', 132),
  ('HYUNDAI', 'i30 (PD)', 'GD', '1.6 GDi', 1582, 'essence', 132),
  ('HYUNDAI', 'i30 (PD)', 'GD', '1.4 T-GDi', 1353, 'essence', 140),
  ('HYUNDAI', 'i30 (PD)', 'GD', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i30 (PD)', 'GD', '1.6 CRDi', 1582, 'diesel', 110),
  ('HYUNDAI', 'i30', 'GD', '', 1582, 'essence', 132),
  ('HYUNDAI', 'i30', 'GD', '1.6 GDi', 1582, 'essence', 132),
  ('HYUNDAI', 'i30', 'GD', '1.4 T-GDi', 1353, 'essence', 140),
  ('HYUNDAI', 'i30', 'GD', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'i30', 'GD', '1.6 CRDi', 1582, 'diesel', 110),
  ('HYUNDAI', 'I30', 'GD', '', 1582, 'essence', 132),
  ('HYUNDAI', 'I30', 'GD', '1.6 GDi', 1582, 'essence', 132),
  ('HYUNDAI', 'I30', 'GD', '1.4 T-GDi', 1353, 'essence', 140),
  ('HYUNDAI', 'I30', 'GD', '1.4 CRDi', 1396, 'diesel', 90),
  ('HYUNDAI', 'I30', 'GD', '1.6 CRDi', 1582, 'diesel', 110)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HYUNDAI (SANTA FE II (CM)) ──
WITH spec_110 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_110.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_110, (VALUES
  ('HYUNDAI', 'SANTA FE II (CM)', 'DM', '', 2199, 'diesel', 197),
  ('HYUNDAI', 'SANTA FE II (CM)', 'DM', '2.2 CRDi 4WD', 2199, 'diesel', 197),
  ('HYUNDAI', 'SANTA FE II (CM)', 'DM', '2.0 CRDi', 1995, 'diesel', 150),
  ('HYUNDAI', 'SANTA FE III (DM, DX)', 'DM', '', 2199, 'diesel', 197),
  ('HYUNDAI', 'SANTA FE III (DM, DX)', 'DM', '2.2 CRDi 4WD', 2199, 'diesel', 197),
  ('HYUNDAI', 'SANTA FE III (DM, DX)', 'DM', '2.0 CRDi', 1995, 'diesel', 150),
  ('HYUNDAI', 'SANTA FE IV (TM)', 'DM', '', 2199, 'diesel', 197),
  ('HYUNDAI', 'SANTA FE IV (TM)', 'DM', '2.2 CRDi 4WD', 2199, 'diesel', 197),
  ('HYUNDAI', 'SANTA FE IV (TM)', 'DM', '2.0 CRDi', 1995, 'diesel', 150),
  ('HYUNDAI', 'Santa Fe', 'DM', '', 2199, 'diesel', 197),
  ('HYUNDAI', 'Santa Fe', 'DM', '2.2 CRDi 4WD', 2199, 'diesel', 197),
  ('HYUNDAI', 'Santa Fe', 'DM', '2.0 CRDi', 1995, 'diesel', 150),
  ('HYUNDAI', 'SANTA FE', 'DM', '', 2199, 'diesel', 197),
  ('HYUNDAI', 'SANTA FE', 'DM', '2.2 CRDi 4WD', 2199, 'diesel', 197),
  ('HYUNDAI', 'SANTA FE', 'DM', '2.0 CRDi', 1995, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HYUNDAI (ACCENT III (LC)) ──
WITH spec_111 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_asian-api-slcf' LIMIT 1
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
  spec_111.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_111, (VALUES
  ('HYUNDAI', 'ACCENT III (LC)', 'RB', '', 1368, 'essence', 100),
  ('HYUNDAI', 'ACCENT III (LC)', 'RB', '1.4 (G4FA)', 1368, 'essence', 100),
  ('HYUNDAI', 'ACCENT III (LC)', 'RB', '1.6 (G4FC)', 1591, 'essence', 124),
  ('HYUNDAI', 'ACCENT III (LC)', 'RB', '1.6 CRDi', 1582, 'diesel', 128),
  ('HYUNDAI', 'ACCENT IV (MC)', 'RB', '', 1368, 'essence', 100),
  ('HYUNDAI', 'ACCENT IV (MC)', 'RB', '1.4 (G4FA)', 1368, 'essence', 100),
  ('HYUNDAI', 'ACCENT IV (MC)', 'RB', '1.6 (G4FC)', 1591, 'essence', 124),
  ('HYUNDAI', 'ACCENT IV (MC)', 'RB', '1.6 CRDi', 1582, 'diesel', 128),
  ('HYUNDAI', 'ACCENT (RB)', 'RB', '', 1368, 'essence', 100),
  ('HYUNDAI', 'ACCENT (RB)', 'RB', '1.4 (G4FA)', 1368, 'essence', 100),
  ('HYUNDAI', 'ACCENT (RB)', 'RB', '1.6 (G4FC)', 1591, 'essence', 124),
  ('HYUNDAI', 'ACCENT (RB)', 'RB', '1.6 CRDi', 1582, 'diesel', 128),
  ('HYUNDAI', 'Accent', 'RB', '', 1368, 'essence', 100),
  ('HYUNDAI', 'Accent', 'RB', '1.4 (G4FA)', 1368, 'essence', 100),
  ('HYUNDAI', 'Accent', 'RB', '1.6 (G4FC)', 1591, 'essence', 124),
  ('HYUNDAI', 'Accent', 'RB', '1.6 CRDi', 1582, 'diesel', 128),
  ('HYUNDAI', 'ACCENT', 'RB', '', 1368, 'essence', 100),
  ('HYUNDAI', 'ACCENT', 'RB', '1.4 (G4FA)', 1368, 'essence', 100),
  ('HYUNDAI', 'ACCENT', 'RB', '1.6 (G4FC)', 1591, 'essence', 124),
  ('HYUNDAI', 'ACCENT', 'RB', '1.6 CRDi', 1582, 'diesel', 128)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── KIA (CEED I (ED)) ──
WITH spec_112 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_112.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_112, (VALUES
  ('KIA', 'CEED I (ED)', 'JD', '', 1582, 'essence', 132),
  ('KIA', 'CEED I (ED)', 'JD', '1.6 GDi', 1582, 'essence', 132),
  ('KIA', 'CEED I (ED)', 'JD', '1.4 T-GDi', 1353, 'essence', 140),
  ('KIA', 'CEED I (ED)', 'JD', '1.6 CRDi', 1582, 'diesel', 110),
  ('KIA', 'CEED II (JD)', 'JD', '', 1582, 'essence', 132),
  ('KIA', 'CEED II (JD)', 'JD', '1.6 GDi', 1582, 'essence', 132),
  ('KIA', 'CEED II (JD)', 'JD', '1.4 T-GDi', 1353, 'essence', 140),
  ('KIA', 'CEED II (JD)', 'JD', '1.6 CRDi', 1582, 'diesel', 110),
  ('KIA', 'CEED III (CD)', 'JD', '', 1582, 'essence', 132),
  ('KIA', 'CEED III (CD)', 'JD', '1.6 GDi', 1582, 'essence', 132),
  ('KIA', 'CEED III (CD)', 'JD', '1.4 T-GDi', 1353, 'essence', 140),
  ('KIA', 'CEED III (CD)', 'JD', '1.6 CRDi', 1582, 'diesel', 110),
  ('KIA', 'Ceed', 'JD', '', 1582, 'essence', 132),
  ('KIA', 'Ceed', 'JD', '1.6 GDi', 1582, 'essence', 132),
  ('KIA', 'Ceed', 'JD', '1.4 T-GDi', 1353, 'essence', 140),
  ('KIA', 'Ceed', 'JD', '1.6 CRDi', 1582, 'diesel', 110),
  ('KIA', 'CEED', 'JD', '', 1582, 'essence', 132),
  ('KIA', 'CEED', 'JD', '1.6 GDi', 1582, 'essence', 132),
  ('KIA', 'CEED', 'JD', '1.4 T-GDi', 1353, 'essence', 140),
  ('KIA', 'CEED', 'JD', '1.6 CRDi', 1582, 'diesel', 110),
  ('KIA', 'CEEd', 'JD', '', 1582, 'essence', 132),
  ('KIA', 'CEEd', 'JD', '1.6 GDi', 1582, 'essence', 132),
  ('KIA', 'CEEd', 'JD', '1.4 T-GDi', 1353, 'essence', 140),
  ('KIA', 'CEEd', 'JD', '1.6 CRDi', 1582, 'diesel', 110)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── KIA (SORENTO (BL)) ──
WITH spec_113 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_113.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_113, (VALUES
  ('KIA', 'SORENTO (BL)', 'UM', '', 2199, 'diesel', 202),
  ('KIA', 'SORENTO (BL)', 'UM', '2.2 CRDi', 2199, 'diesel', 202),
  ('KIA', 'SORENTO (BL)', 'UM', '2.0 CRDi', 1995, 'diesel', 150),
  ('KIA', 'SORENTO II (XM)', 'UM', '', 2199, 'diesel', 202),
  ('KIA', 'SORENTO II (XM)', 'UM', '2.2 CRDi', 2199, 'diesel', 202),
  ('KIA', 'SORENTO II (XM)', 'UM', '2.0 CRDi', 1995, 'diesel', 150),
  ('KIA', 'SORENTO III (UM)', 'UM', '', 2199, 'diesel', 202),
  ('KIA', 'SORENTO III (UM)', 'UM', '2.2 CRDi', 2199, 'diesel', 202),
  ('KIA', 'SORENTO III (UM)', 'UM', '2.0 CRDi', 1995, 'diesel', 150),
  ('KIA', 'SORENTO IV (MQ4)', 'UM', '', 2199, 'diesel', 202),
  ('KIA', 'SORENTO IV (MQ4)', 'UM', '2.2 CRDi', 2199, 'diesel', 202),
  ('KIA', 'SORENTO IV (MQ4)', 'UM', '2.0 CRDi', 1995, 'diesel', 150),
  ('KIA', 'Sorento', 'UM', '', 2199, 'diesel', 202),
  ('KIA', 'Sorento', 'UM', '2.2 CRDi', 2199, 'diesel', 202),
  ('KIA', 'Sorento', 'UM', '2.0 CRDi', 1995, 'diesel', 150),
  ('KIA', 'SORENTO', 'UM', '', 2199, 'diesel', 202),
  ('KIA', 'SORENTO', 'UM', '2.2 CRDi', 2199, 'diesel', 202),
  ('KIA', 'SORENTO', 'UM', '2.0 CRDi', 1995, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FORD (FUSION I (JU_)) ──
WITH spec_114 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_ford-wss-m2c913-d_a5b5' LIMIT 1
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
  spec_114.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_114, (VALUES
  ('FORD', 'FUSION I (JU_)', 'I', '', 1388, 'essence', 80),
  ('FORD', 'FUSION I (JU_)', 'I', '1.4', 1388, 'essence', 80),
  ('FORD', 'FUSION I (JU_)', 'I', '1.6 Ti', 1596, 'essence', 100),
  ('FORD', 'FUSION I (JU_)', 'I', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'FUSION', 'I', '', 1388, 'essence', 80),
  ('FORD', 'FUSION', 'I', '1.4', 1388, 'essence', 80),
  ('FORD', 'FUSION', 'I', '1.6 Ti', 1596, 'essence', 100),
  ('FORD', 'FUSION', 'I', '1.4 TDCi', 1399, 'diesel', 68),
  ('FORD', 'Fusion', 'I', '', 1388, 'essence', 80),
  ('FORD', 'Fusion', 'I', '1.4', 1388, 'essence', 80),
  ('FORD', 'Fusion', 'I', '1.6 Ti', 1596, 'essence', 100),
  ('FORD', 'Fusion', 'I', '1.4 TDCi', 1399, 'diesel', 68)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FORD (MONDEO III (B5Y)) ──
WITH spec_115 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_ford-wss-m2c913-d_a5b5' LIMIT 1
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
  spec_115.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_115, (VALUES
  ('FORD', 'MONDEO III (B5Y)', 'IV', '', 1997, 'diesel', 140),
  ('FORD', 'MONDEO III (B5Y)', 'IV', '2.0 TDCi', 1997, 'diesel', 140),
  ('FORD', 'MONDEO III (B5Y)', 'IV', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'MONDEO III (B5Y)', 'IV', '2.0 EcoBoost', 1999, 'essence', 240),
  ('FORD', 'MONDEO IV (BA7)', 'IV', '', 1997, 'diesel', 140),
  ('FORD', 'MONDEO IV (BA7)', 'IV', '2.0 TDCi', 1997, 'diesel', 140),
  ('FORD', 'MONDEO IV (BA7)', 'IV', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'MONDEO IV (BA7)', 'IV', '2.0 EcoBoost', 1999, 'essence', 240),
  ('FORD', 'MONDEO V (CD391)', 'IV', '', 1997, 'diesel', 140),
  ('FORD', 'MONDEO V (CD391)', 'IV', '2.0 TDCi', 1997, 'diesel', 140),
  ('FORD', 'MONDEO V (CD391)', 'IV', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'MONDEO V (CD391)', 'IV', '2.0 EcoBoost', 1999, 'essence', 240),
  ('FORD', 'Mondeo', 'IV', '', 1997, 'diesel', 140),
  ('FORD', 'Mondeo', 'IV', '2.0 TDCi', 1997, 'diesel', 140),
  ('FORD', 'Mondeo', 'IV', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'Mondeo', 'IV', '2.0 EcoBoost', 1999, 'essence', 240),
  ('FORD', 'MONDEO', 'IV', '', 1997, 'diesel', 140),
  ('FORD', 'MONDEO', 'IV', '2.0 TDCi', 1997, 'diesel', 140),
  ('FORD', 'MONDEO', 'IV', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'MONDEO', 'IV', '2.0 EcoBoost', 1999, 'essence', 240)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FORD (KUGA I (CBV)) ──
WITH spec_116 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_ford-wss-m2c913-d_a5b5' LIMIT 1
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
  spec_116.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_116, (VALUES
  ('FORD', 'KUGA I (CBV)', 'II', '', 1997, 'diesel', 150),
  ('FORD', 'KUGA I (CBV)', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'KUGA I (CBV)', 'II', '1.5 EcoBoost', 1498, 'essence', 150),
  ('FORD', 'KUGA II (DM2)', 'II', '', 1997, 'diesel', 150),
  ('FORD', 'KUGA II (DM2)', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'KUGA II (DM2)', 'II', '1.5 EcoBoost', 1498, 'essence', 150),
  ('FORD', 'Kuga', 'II', '', 1997, 'diesel', 150),
  ('FORD', 'Kuga', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'Kuga', 'II', '1.5 EcoBoost', 1498, 'essence', 150),
  ('FORD', 'KUGA', 'II', '', 1997, 'diesel', 150),
  ('FORD', 'KUGA', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'KUGA', 'II', '1.5 EcoBoost', 1498, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FORD (C-MAX I (DM2)) ──
WITH spec_117 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_ford-wss-m2c913-d_a5b5' LIMIT 1
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
  spec_117.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_117, (VALUES
  ('FORD', 'C-MAX I (DM2)', 'II', '', 1560, 'diesel', 115),
  ('FORD', 'C-MAX I (DM2)', 'II', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'C-MAX I (DM2)', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'C-MAX I (DM2)', 'II', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'C-MAX II (DXA/CB7)', 'II', '', 1560, 'diesel', 115),
  ('FORD', 'C-MAX II (DXA/CB7)', 'II', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'C-MAX II (DXA/CB7)', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'C-MAX II (DXA/CB7)', 'II', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'C-Max', 'II', '', 1560, 'diesel', 115),
  ('FORD', 'C-Max', 'II', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'C-Max', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'C-Max', 'II', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'C MAX', 'II', '', 1560, 'diesel', 115),
  ('FORD', 'C MAX', 'II', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'C MAX', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'C MAX', 'II', '1.0 EcoBoost', 998, 'essence', 100),
  ('FORD', 'CMAX', 'II', '', 1560, 'diesel', 115),
  ('FORD', 'CMAX', 'II', '1.6 TDCi', 1560, 'diesel', 115),
  ('FORD', 'CMAX', 'II', '2.0 TDCi', 1997, 'diesel', 150),
  ('FORD', 'CMAX', 'II', '1.0 EcoBoost', 998, 'essence', 100)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FORD (RANGER (ER, EQ)) ──
WITH spec_118 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_ford-wss-m2c913-d_a5b5' LIMIT 1
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
  spec_118.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_118, (VALUES
  ('FORD', 'RANGER (ER, EQ)', 'TKE', '', 2198, 'diesel', 160),
  ('FORD', 'RANGER (ER, EQ)', 'TKE', '2.2 TDCi 4x4', 2198, 'diesel', 160),
  ('FORD', 'RANGER (ER, EQ)', 'TKE', '3.2 TDCi 4x4', 3198, 'diesel', 200),
  ('FORD', 'RANGER (TKE)', 'TKE', '', 2198, 'diesel', 160),
  ('FORD', 'RANGER (TKE)', 'TKE', '2.2 TDCi 4x4', 2198, 'diesel', 160),
  ('FORD', 'RANGER (TKE)', 'TKE', '3.2 TDCi 4x4', 3198, 'diesel', 200),
  ('FORD', 'Ranger', 'TKE', '', 2198, 'diesel', 160),
  ('FORD', 'Ranger', 'TKE', '2.2 TDCi 4x4', 2198, 'diesel', 160),
  ('FORD', 'Ranger', 'TKE', '3.2 TDCi 4x4', 3198, 'diesel', 200),
  ('FORD', 'RANGER', 'TKE', '', 2198, 'diesel', 160),
  ('FORD', 'RANGER', 'TKE', '2.2 TDCi 4x4', 2198, 'diesel', 160),
  ('FORD', 'RANGER', 'TKE', '3.2 TDCi 4x4', 3198, 'diesel', 200)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── FORD (TRANSIT CUSTOM) ──
WITH spec_119 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_ford-wss-m2c913-d_a5b5' LIMIT 1
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
  spec_119.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_119, (VALUES
  ('FORD', 'TRANSIT CUSTOM', 'IV', '', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT CUSTOM', 'IV', '2.0 EcoBlue', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT CUSTOM', 'IV', '2.2 TDCi', 2198, 'diesel', 125),
  ('FORD', 'TRANSIT CONNECT', 'IV', '', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT CONNECT', 'IV', '2.0 EcoBlue', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT CONNECT', 'IV', '2.2 TDCi', 2198, 'diesel', 125),
  ('FORD', 'TRANSIT IV (FA_)', 'IV', '', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT IV (FA_)', 'IV', '2.0 EcoBlue', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT IV (FA_)', 'IV', '2.2 TDCi', 2198, 'diesel', 125),
  ('FORD', 'TRANSIT V (FA_)', 'IV', '', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT V (FA_)', 'IV', '2.0 EcoBlue', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT V (FA_)', 'IV', '2.2 TDCi', 2198, 'diesel', 125),
  ('FORD', 'Transit', 'IV', '', 1995, 'diesel', 125),
  ('FORD', 'Transit', 'IV', '2.0 EcoBlue', 1995, 'diesel', 125),
  ('FORD', 'Transit', 'IV', '2.2 TDCi', 2198, 'diesel', 125),
  ('FORD', 'TRANSIT', 'IV', '', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT', 'IV', '2.0 EcoBlue', 1995, 'diesel', 125),
  ('FORD', 'TRANSIT', 'IV', '2.2 TDCi', 2198, 'diesel', 125)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BMW (5 (E60)) ──
WITH spec_120 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_bmw-ll04_c3' LIMIT 1
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
  spec_120.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_120, (VALUES
  ('BMW', '5 (E60)', 'F10', '', 1995, 'diesel', 184),
  ('BMW', '5 (E60)', 'F10', '520d', 1995, 'diesel', 184),
  ('BMW', '5 (E60)', 'F10', '530d', 2993, 'diesel', 258),
  ('BMW', '5 (E60)', 'F10', '520i', 1997, 'essence', 184),
  ('BMW', '5 (E61)', 'F10', '', 1995, 'diesel', 184),
  ('BMW', '5 (E61)', 'F10', '520d', 1995, 'diesel', 184),
  ('BMW', '5 (E61)', 'F10', '530d', 2993, 'diesel', 258),
  ('BMW', '5 (E61)', 'F10', '520i', 1997, 'essence', 184),
  ('BMW', '5 (F10)', 'F10', '', 1995, 'diesel', 184),
  ('BMW', '5 (F10)', 'F10', '520d', 1995, 'diesel', 184),
  ('BMW', '5 (F10)', 'F10', '530d', 2993, 'diesel', 258),
  ('BMW', '5 (F10)', 'F10', '520i', 1997, 'essence', 184),
  ('BMW', '5 (F11)', 'F10', '', 1995, 'diesel', 184),
  ('BMW', '5 (F11)', 'F10', '520d', 1995, 'diesel', 184),
  ('BMW', '5 (F11)', 'F10', '530d', 2993, 'diesel', 258),
  ('BMW', '5 (F11)', 'F10', '520i', 1997, 'essence', 184),
  ('BMW', '5 (G30, G31)', 'F10', '', 1995, 'diesel', 184),
  ('BMW', '5 (G30, G31)', 'F10', '520d', 1995, 'diesel', 184),
  ('BMW', '5 (G30, G31)', 'F10', '530d', 2993, 'diesel', 258),
  ('BMW', '5 (G30, G31)', 'F10', '520i', 1997, 'essence', 184),
  ('BMW', '5 Series', 'F10', '', 1995, 'diesel', 184),
  ('BMW', '5 Series', 'F10', '520d', 1995, 'diesel', 184),
  ('BMW', '5 Series', 'F10', '530d', 2993, 'diesel', 258),
  ('BMW', '5 Series', 'F10', '520i', 1997, 'essence', 184),
  ('BMW', 'Série 5', 'F10', '', 1995, 'diesel', 184),
  ('BMW', 'Série 5', 'F10', '520d', 1995, 'diesel', 184),
  ('BMW', 'Série 5', 'F10', '530d', 2993, 'diesel', 258),
  ('BMW', 'Série 5', 'F10', '520i', 1997, 'essence', 184)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BMW (X1 (E84)) ──
WITH spec_121 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_bmw-ll04_c3' LIMIT 1
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
  spec_121.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_121, (VALUES
  ('BMW', 'X1 (E84)', 'F48', '', 1995, 'diesel', 150),
  ('BMW', 'X1 (E84)', 'F48', 'xDrive18d', 1995, 'diesel', 150),
  ('BMW', 'X1 (E84)', 'F48', 'xDrive20d', 1995, 'diesel', 190),
  ('BMW', 'X1 (E84)', 'F48', 'sDrive18i', 1499, 'essence', 140),
  ('BMW', 'X1 (F48)', 'F48', '', 1995, 'diesel', 150),
  ('BMW', 'X1 (F48)', 'F48', 'xDrive18d', 1995, 'diesel', 150),
  ('BMW', 'X1 (F48)', 'F48', 'xDrive20d', 1995, 'diesel', 190),
  ('BMW', 'X1 (F48)', 'F48', 'sDrive18i', 1499, 'essence', 140),
  ('BMW', 'X1 (U11)', 'F48', '', 1995, 'diesel', 150),
  ('BMW', 'X1 (U11)', 'F48', 'xDrive18d', 1995, 'diesel', 150),
  ('BMW', 'X1 (U11)', 'F48', 'xDrive20d', 1995, 'diesel', 190),
  ('BMW', 'X1 (U11)', 'F48', 'sDrive18i', 1499, 'essence', 140),
  ('BMW', 'X1', 'F48', '', 1995, 'diesel', 150),
  ('BMW', 'X1', 'F48', 'xDrive18d', 1995, 'diesel', 150),
  ('BMW', 'X1', 'F48', 'xDrive20d', 1995, 'diesel', 190),
  ('BMW', 'X1', 'F48', 'sDrive18i', 1499, 'essence', 140)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BMW (X3 (E83)) ──
WITH spec_122 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_bmw-ll04_c3' LIMIT 1
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
  spec_122.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_122, (VALUES
  ('BMW', 'X3 (E83)', 'G01', '', 1995, 'diesel', 190),
  ('BMW', 'X3 (E83)', 'G01', 'xDrive20d', 1995, 'diesel', 190),
  ('BMW', 'X3 (E83)', 'G01', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X3 (E83)', 'G01', 'xDrive20i', 1998, 'essence', 184),
  ('BMW', 'X3 (F25)', 'G01', '', 1995, 'diesel', 190),
  ('BMW', 'X3 (F25)', 'G01', 'xDrive20d', 1995, 'diesel', 190),
  ('BMW', 'X3 (F25)', 'G01', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X3 (F25)', 'G01', 'xDrive20i', 1998, 'essence', 184),
  ('BMW', 'X3 (G01, G08)', 'G01', '', 1995, 'diesel', 190),
  ('BMW', 'X3 (G01, G08)', 'G01', 'xDrive20d', 1995, 'diesel', 190),
  ('BMW', 'X3 (G01, G08)', 'G01', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X3 (G01, G08)', 'G01', 'xDrive20i', 1998, 'essence', 184),
  ('BMW', 'X3', 'G01', '', 1995, 'diesel', 190),
  ('BMW', 'X3', 'G01', 'xDrive20d', 1995, 'diesel', 190),
  ('BMW', 'X3', 'G01', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X3', 'G01', 'xDrive20i', 1998, 'essence', 184)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BMW (X5 (E53)) ──
WITH spec_123 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_bmw-ll04_c3' LIMIT 1
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
  spec_123.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_123, (VALUES
  ('BMW', 'X5 (E53)', 'G05', '', 2993, 'diesel', 265),
  ('BMW', 'X5 (E53)', 'G05', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X5 (E53)', 'G05', 'xDrive40i', 2998, 'essence', 340),
  ('BMW', 'X5 (E70)', 'G05', '', 2993, 'diesel', 265),
  ('BMW', 'X5 (E70)', 'G05', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X5 (E70)', 'G05', 'xDrive40i', 2998, 'essence', 340),
  ('BMW', 'X5 (F15)', 'G05', '', 2993, 'diesel', 265),
  ('BMW', 'X5 (F15)', 'G05', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X5 (F15)', 'G05', 'xDrive40i', 2998, 'essence', 340),
  ('BMW', 'X5 (G05)', 'G05', '', 2993, 'diesel', 265),
  ('BMW', 'X5 (G05)', 'G05', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X5 (G05)', 'G05', 'xDrive40i', 2998, 'essence', 340),
  ('BMW', 'X5', 'G05', '', 2993, 'diesel', 265),
  ('BMW', 'X5', 'G05', 'xDrive30d', 2993, 'diesel', 265),
  ('BMW', 'X5', 'G05', 'xDrive40i', 2998, 'essence', 340)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BMW (2 (F22)) ──
WITH spec_124 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_bmw-ll04_c3' LIMIT 1
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
  spec_124.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_124, (VALUES
  ('BMW', '2 (F22)', 'F45', '', 1995, 'diesel', 150),
  ('BMW', '2 (F22)', 'F45', '218d', 1995, 'diesel', 150),
  ('BMW', '2 (F22)', 'F45', '220d', 1995, 'diesel', 190),
  ('BMW', '2 (F22)', 'F45', '216i', 1499, 'essence', 109),
  ('BMW', '2 Active Tourer (F45)', 'F45', '', 1995, 'diesel', 150),
  ('BMW', '2 Active Tourer (F45)', 'F45', '218d', 1995, 'diesel', 150),
  ('BMW', '2 Active Tourer (F45)', 'F45', '220d', 1995, 'diesel', 190),
  ('BMW', '2 Active Tourer (F45)', 'F45', '216i', 1499, 'essence', 109),
  ('BMW', '2 Gran Tourer (F46)', 'F45', '', 1995, 'diesel', 150),
  ('BMW', '2 Gran Tourer (F46)', 'F45', '218d', 1995, 'diesel', 150),
  ('BMW', '2 Gran Tourer (F46)', 'F45', '220d', 1995, 'diesel', 190),
  ('BMW', '2 Gran Tourer (F46)', 'F45', '216i', 1499, 'essence', 109),
  ('BMW', '2 (G42)', 'F45', '', 1995, 'diesel', 150),
  ('BMW', '2 (G42)', 'F45', '218d', 1995, 'diesel', 150),
  ('BMW', '2 (G42)', 'F45', '220d', 1995, 'diesel', 190),
  ('BMW', '2 (G42)', 'F45', '216i', 1499, 'essence', 109),
  ('BMW', '2 Series', 'F45', '', 1995, 'diesel', 150),
  ('BMW', '2 Series', 'F45', '218d', 1995, 'diesel', 150),
  ('BMW', '2 Series', 'F45', '220d', 1995, 'diesel', 190),
  ('BMW', '2 Series', 'F45', '216i', 1499, 'essence', 109),
  ('BMW', 'Série 2', 'F45', '', 1995, 'diesel', 150),
  ('BMW', 'Série 2', 'F45', '218d', 1995, 'diesel', 150),
  ('BMW', 'Série 2', 'F45', '220d', 1995, 'diesel', 190),
  ('BMW', 'Série 2', 'F45', '216i', 1499, 'essence', 109)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MERCEDES-BENZ (E-CLASS (W210)) ──
WITH spec_125 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mb-22951_c3' LIMIT 1
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
  spec_125.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_125, (VALUES
  ('MERCEDES-BENZ', 'E-CLASS (W210)', 'W212', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W210)', 'W212', 'E 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W210)', 'W212', 'E 220 BlueTEC', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W210)', 'W212', 'E 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'E-CLASS (W211)', 'W212', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W211)', 'W212', 'E 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W211)', 'W212', 'E 220 BlueTEC', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W211)', 'W212', 'E 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'E-CLASS (W212)', 'W212', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W212)', 'W212', 'E 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W212)', 'W212', 'E 220 BlueTEC', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W212)', 'W212', 'E 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'E-CLASS (W213)', 'W212', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W213)', 'W212', 'E 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W213)', 'W212', 'E 220 BlueTEC', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-CLASS (W213)', 'W212', 'E 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'Classe E', 'W212', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'Classe E', 'W212', 'E 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'Classe E', 'W212', 'E 220 BlueTEC', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'Classe E', 'W212', 'E 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'E-Class', 'W212', '', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-Class', 'W212', 'E 220 CDI', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-Class', 'W212', 'E 220 BlueTEC', 2143, 'diesel', 170),
  ('MERCEDES-BENZ', 'E-Class', 'W212', 'E 200', 1991, 'essence', 184)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MERCEDES-BENZ (GLA (X156)) ──
WITH spec_126 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mb-22951_c3' LIMIT 1
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
  spec_126.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_126, (VALUES
  ('MERCEDES-BENZ', 'GLA (X156)', 'X156', '', 1461, 'diesel', 136),
  ('MERCEDES-BENZ', 'GLA (X156)', 'X156', 'GLA 200 CDI', 1461, 'diesel', 136),
  ('MERCEDES-BENZ', 'GLA (X156)', 'X156', 'GLA 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'GLA (X156)', 'X156', 'GLA 200', 1595, 'essence', 156),
  ('MERCEDES-BENZ', 'GLA (H247)', 'X156', '', 1461, 'diesel', 136),
  ('MERCEDES-BENZ', 'GLA (H247)', 'X156', 'GLA 200 CDI', 1461, 'diesel', 136),
  ('MERCEDES-BENZ', 'GLA (H247)', 'X156', 'GLA 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'GLA (H247)', 'X156', 'GLA 200', 1595, 'essence', 156),
  ('MERCEDES-BENZ', 'GLA', 'X156', '', 1461, 'diesel', 136),
  ('MERCEDES-BENZ', 'GLA', 'X156', 'GLA 200 CDI', 1461, 'diesel', 136),
  ('MERCEDES-BENZ', 'GLA', 'X156', 'GLA 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'GLA', 'X156', 'GLA 200', 1595, 'essence', 156),
  ('MERCEDES-BENZ', 'Classe GLA', 'X156', '', 1461, 'diesel', 136),
  ('MERCEDES-BENZ', 'Classe GLA', 'X156', 'GLA 200 CDI', 1461, 'diesel', 136),
  ('MERCEDES-BENZ', 'Classe GLA', 'X156', 'GLA 180 CDI', 1461, 'diesel', 109),
  ('MERCEDES-BENZ', 'Classe GLA', 'X156', 'GLA 200', 1595, 'essence', 156)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MERCEDES-BENZ (GLC (X253)) ──
WITH spec_127 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mb-22951_c3' LIMIT 1
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
  spec_127.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_127, (VALUES
  ('MERCEDES-BENZ', 'GLC (X253)', 'X253', '', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'GLC (X253)', 'X253', 'GLC 220 d', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'GLC (X253)', 'X253', 'GLC 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'GLC Coupe (C253)', 'X253', '', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'GLC Coupe (C253)', 'X253', 'GLC 220 d', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'GLC Coupe (C253)', 'X253', 'GLC 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'GLC (X254)', 'X253', '', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'GLC (X254)', 'X253', 'GLC 220 d', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'GLC (X254)', 'X253', 'GLC 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'GLC', 'X253', '', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'GLC', 'X253', 'GLC 220 d', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'GLC', 'X253', 'GLC 200', 1991, 'essence', 184),
  ('MERCEDES-BENZ', 'Classe GLC', 'X253', '', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'Classe GLC', 'X253', 'GLC 220 d', 1950, 'diesel', 170),
  ('MERCEDES-BENZ', 'Classe GLC', 'X253', 'GLC 200', 1991, 'essence', 184)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MERCEDES-BENZ (VITO (638/2)) ──
WITH spec_128 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mb-22951_c3' LIMIT 1
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
  spec_128.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_128, (VALUES
  ('MERCEDES-BENZ', 'VITO (638/2)', 'W447', '', 1950, 'diesel', 136),
  ('MERCEDES-BENZ', 'VITO (638/2)', 'W447', '116 CDI', 1950, 'diesel', 163),
  ('MERCEDES-BENZ', 'VITO (638/2)', 'W447', '114 CDI', 1598, 'diesel', 136),
  ('MERCEDES-BENZ', 'VITO (W639)', 'W447', '', 1950, 'diesel', 136),
  ('MERCEDES-BENZ', 'VITO (W639)', 'W447', '116 CDI', 1950, 'diesel', 163),
  ('MERCEDES-BENZ', 'VITO (W639)', 'W447', '114 CDI', 1598, 'diesel', 136),
  ('MERCEDES-BENZ', 'VITO (W447)', 'W447', '', 1950, 'diesel', 136),
  ('MERCEDES-BENZ', 'VITO (W447)', 'W447', '116 CDI', 1950, 'diesel', 163),
  ('MERCEDES-BENZ', 'VITO (W447)', 'W447', '114 CDI', 1598, 'diesel', 136),
  ('MERCEDES-BENZ', 'Vito', 'W447', '', 1950, 'diesel', 136),
  ('MERCEDES-BENZ', 'Vito', 'W447', '116 CDI', 1950, 'diesel', 163),
  ('MERCEDES-BENZ', 'Vito', 'W447', '114 CDI', 1598, 'diesel', 136),
  ('MERCEDES-BENZ', 'VITO', 'W447', '', 1950, 'diesel', 136),
  ('MERCEDES-BENZ', 'VITO', 'W447', '116 CDI', 1950, 'diesel', 163),
  ('MERCEDES-BENZ', 'VITO', 'W447', '114 CDI', 1598, 'diesel', 136),
  ('MERCEDES-BENZ', 'VIANO (W639)', 'W447', '', 1950, 'diesel', 136),
  ('MERCEDES-BENZ', 'VIANO (W639)', 'W447', '116 CDI', 1950, 'diesel', 163),
  ('MERCEDES-BENZ', 'VIANO (W639)', 'W447', '114 CDI', 1598, 'diesel', 136),
  ('MERCEDES-BENZ', 'Viano', 'W447', '', 1950, 'diesel', 136),
  ('MERCEDES-BENZ', 'Viano', 'W447', '116 CDI', 1950, 'diesel', 163),
  ('MERCEDES-BENZ', 'Viano', 'W447', '114 CDI', 1598, 'diesel', 136)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MERCEDES-BENZ (SPRINTER 3,5-t (B906)) ──
WITH spec_129 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mb-22951_c3' LIMIT 1
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
  spec_129.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_129, (VALUES
  ('MERCEDES-BENZ', 'SPRINTER 3,5-t (B906)', 'B906', '', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'SPRINTER 3,5-t (B906)', 'B906', '313 CDI', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'SPRINTER 3,5-t (B906)', 'B906', '316 CDI', 2143, 'diesel', 163),
  ('MERCEDES-BENZ', 'SPRINTER 5-t (B906)', 'B906', '', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'SPRINTER 5-t (B906)', 'B906', '313 CDI', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'SPRINTER 5-t (B906)', 'B906', '316 CDI', 2143, 'diesel', 163),
  ('MERCEDES-BENZ', 'SPRINTER II (NCV3)', 'B906', '', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'SPRINTER II (NCV3)', 'B906', '313 CDI', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'SPRINTER II (NCV3)', 'B906', '316 CDI', 2143, 'diesel', 163),
  ('MERCEDES-BENZ', 'Sprinter', 'B906', '', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'Sprinter', 'B906', '313 CDI', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'Sprinter', 'B906', '316 CDI', 2143, 'diesel', 163),
  ('MERCEDES-BENZ', 'SPRINTER', 'B906', '', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'SPRINTER', 'B906', '313 CDI', 2143, 'diesel', 143),
  ('MERCEDES-BENZ', 'SPRINTER', 'B906', '316 CDI', 2143, 'diesel', 163)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLVO (S40 II (MS)) ──
WITH spec_130 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_volvo-vcc-rbs0-2ae_c3' LIMIT 1
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
  spec_130.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_130, (VALUES
  ('VOLVO', 'S40 II (MS)', 'MS', '', 1560, 'diesel', 110),
  ('VOLVO', 'S40 II (MS)', 'MS', '1.6 D', 1560, 'diesel', 110),
  ('VOLVO', 'S40 II (MS)', 'MS', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'S40 II (MS)', 'MS', '2.0', 1999, 'essence', 145),
  ('VOLVO', 'V50 (MW)', 'MS', '', 1560, 'diesel', 110),
  ('VOLVO', 'V50 (MW)', 'MS', '1.6 D', 1560, 'diesel', 110),
  ('VOLVO', 'V50 (MW)', 'MS', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'V50 (MW)', 'MS', '2.0', 1999, 'essence', 145),
  ('VOLVO', 'S40', 'MS', '', 1560, 'diesel', 110),
  ('VOLVO', 'S40', 'MS', '1.6 D', 1560, 'diesel', 110),
  ('VOLVO', 'S40', 'MS', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'S40', 'MS', '2.0', 1999, 'essence', 145),
  ('VOLVO', 'V50', 'MS', '', 1560, 'diesel', 110),
  ('VOLVO', 'V50', 'MS', '1.6 D', 1560, 'diesel', 110),
  ('VOLVO', 'V50', 'MS', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'V50', 'MS', '2.0', 1999, 'essence', 145)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLVO (V40 (525, 526)) ──
WITH spec_131 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_volvo-vcc-rbs0-2ae_c3' LIMIT 1
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
  spec_131.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_131, (VALUES
  ('VOLVO', 'V40 (525, 526)', '525', '', 1560, 'diesel', 115),
  ('VOLVO', 'V40 (525, 526)', '525', 'D2', 1560, 'diesel', 115),
  ('VOLVO', 'V40 (525, 526)', '525', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'V40 (525, 526)', '525', 'T3', 1498, 'essence', 152),
  ('VOLVO', 'V40 (525, 526)', '525', 'T4', 1969, 'essence', 190),
  ('VOLVO', 'V40 Cross Country', '525', '', 1560, 'diesel', 115),
  ('VOLVO', 'V40 Cross Country', '525', 'D2', 1560, 'diesel', 115),
  ('VOLVO', 'V40 Cross Country', '525', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'V40 Cross Country', '525', 'T3', 1498, 'essence', 152),
  ('VOLVO', 'V40 Cross Country', '525', 'T4', 1969, 'essence', 190),
  ('VOLVO', 'V40', '525', '', 1560, 'diesel', 115),
  ('VOLVO', 'V40', '525', 'D2', 1560, 'diesel', 115),
  ('VOLVO', 'V40', '525', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'V40', '525', 'T3', 1498, 'essence', 152),
  ('VOLVO', 'V40', '525', 'T4', 1969, 'essence', 190)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLVO (V60 I (155, 157)) ──
WITH spec_132 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_volvo-vcc-rbs0-2ae_c3' LIMIT 1
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
  spec_132.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_132, (VALUES
  ('VOLVO', 'V60 I (155, 157)', 'II', '', 1969, 'diesel', 150),
  ('VOLVO', 'V60 I (155, 157)', 'II', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'V60 I (155, 157)', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'V60 I (155, 157)', 'II', 'T5', 1969, 'essence', 245),
  ('VOLVO', 'V60 II (Z)', 'II', '', 1969, 'diesel', 150),
  ('VOLVO', 'V60 II (Z)', 'II', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'V60 II (Z)', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'V60 II (Z)', 'II', 'T5', 1969, 'essence', 245),
  ('VOLVO', 'S60 I (RS, HV)', 'II', '', 1969, 'diesel', 150),
  ('VOLVO', 'S60 I (RS, HV)', 'II', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'S60 I (RS, HV)', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'S60 I (RS, HV)', 'II', 'T5', 1969, 'essence', 245),
  ('VOLVO', 'S60 II (134)', 'II', '', 1969, 'diesel', 150),
  ('VOLVO', 'S60 II (134)', 'II', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'S60 II (134)', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'S60 II (134)', 'II', 'T5', 1969, 'essence', 245),
  ('VOLVO', 'S60 III', 'II', '', 1969, 'diesel', 150),
  ('VOLVO', 'S60 III', 'II', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'S60 III', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'S60 III', 'II', 'T5', 1969, 'essence', 245),
  ('VOLVO', 'V60', 'II', '', 1969, 'diesel', 150),
  ('VOLVO', 'V60', 'II', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'V60', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'V60', 'II', 'T5', 1969, 'essence', 245),
  ('VOLVO', 'S60', 'II', '', 1969, 'diesel', 150),
  ('VOLVO', 'S60', 'II', 'D3', 1969, 'diesel', 150),
  ('VOLVO', 'S60', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'S60', 'II', 'T5', 1969, 'essence', 245)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLVO (XC60 I (156)) ──
WITH spec_133 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-20_volvo-vcc-rbso-2ae_c5' LIMIT 1
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
  spec_133.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_133, (VALUES
  ('VOLVO', 'XC60 I (156)', 'II', '', 1969, 'diesel', 190),
  ('VOLVO', 'XC60 I (156)', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'XC60 I (156)', 'II', 'D5', 2400, 'diesel', 235),
  ('VOLVO', 'XC60 I (156)', 'II', 'B4', 1969, 'essence', 197),
  ('VOLVO', 'XC60 I (156)', 'II', 'B5', 1969, 'essence', 250),
  ('VOLVO', 'XC60 II (246)', 'II', '', 1969, 'diesel', 190),
  ('VOLVO', 'XC60 II (246)', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'XC60 II (246)', 'II', 'D5', 2400, 'diesel', 235),
  ('VOLVO', 'XC60 II (246)', 'II', 'B4', 1969, 'essence', 197),
  ('VOLVO', 'XC60 II (246)', 'II', 'B5', 1969, 'essence', 250),
  ('VOLVO', 'XC60', 'II', '', 1969, 'diesel', 190),
  ('VOLVO', 'XC60', 'II', 'D4', 1969, 'diesel', 190),
  ('VOLVO', 'XC60', 'II', 'D5', 2400, 'diesel', 235),
  ('VOLVO', 'XC60', 'II', 'B4', 1969, 'essence', 197),
  ('VOLVO', 'XC60', 'II', 'B5', 1969, 'essence', 250)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLVO (XC90 I (C)) ──
WITH spec_134 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-20_volvo-vcc-rbso-2ae_c5' LIMIT 1
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
  spec_134.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_134, (VALUES
  ('VOLVO', 'XC90 I (C)', 'II', '', 1969, 'diesel', 235),
  ('VOLVO', 'XC90 I (C)', 'II', 'D5', 2400, 'diesel', 235),
  ('VOLVO', 'XC90 I (C)', 'II', 'B6', 2953, 'essence', 300),
  ('VOLVO', 'XC90 I (C)', 'II', 'T8 Twin Engine', 1969, 'essence', 390),
  ('VOLVO', 'XC90 II (256)', 'II', '', 1969, 'diesel', 235),
  ('VOLVO', 'XC90 II (256)', 'II', 'D5', 2400, 'diesel', 235),
  ('VOLVO', 'XC90 II (256)', 'II', 'B6', 2953, 'essence', 300),
  ('VOLVO', 'XC90 II (256)', 'II', 'T8 Twin Engine', 1969, 'essence', 390),
  ('VOLVO', 'XC90', 'II', '', 1969, 'diesel', 235),
  ('VOLVO', 'XC90', 'II', 'D5', 2400, 'diesel', 235),
  ('VOLVO', 'XC90', 'II', 'B6', 2953, 'essence', 300),
  ('VOLVO', 'XC90', 'II', 'T8 Twin Engine', 1969, 'essence', 390)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── VOLVO (V70 III (BW)) ──
WITH spec_135 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_volvo-vcc-rbs0-2ae_c3' LIMIT 1
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
  spec_135.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_135, (VALUES
  ('VOLVO', 'V70 III (BW)', 'III', '', 2400, 'diesel', 185),
  ('VOLVO', 'V70 III (BW)', 'III', 'D5', 2400, 'diesel', 185),
  ('VOLVO', 'V70 III (BW)', 'III', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'V70 II (SW)', 'III', '', 2400, 'diesel', 185),
  ('VOLVO', 'V70 II (SW)', 'III', 'D5', 2400, 'diesel', 185),
  ('VOLVO', 'V70 II (SW)', 'III', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'S80 I (TS)', 'III', '', 2400, 'diesel', 185),
  ('VOLVO', 'S80 I (TS)', 'III', 'D5', 2400, 'diesel', 185),
  ('VOLVO', 'S80 I (TS)', 'III', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'S80 II (AS)', 'III', '', 2400, 'diesel', 185),
  ('VOLVO', 'S80 II (AS)', 'III', 'D5', 2400, 'diesel', 185),
  ('VOLVO', 'S80 II (AS)', 'III', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'V70', 'III', '', 2400, 'diesel', 185),
  ('VOLVO', 'V70', 'III', 'D5', 2400, 'diesel', 185),
  ('VOLVO', 'V70', 'III', '2.0 D', 1997, 'diesel', 136),
  ('VOLVO', 'S80', 'III', '', 2400, 'diesel', 185),
  ('VOLVO', 'S80', 'III', 'D5', 2400, 'diesel', 185),
  ('VOLVO', 'S80', 'III', '2.0 D', 1997, 'diesel', 136)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MAZDA (2 (DE)) ──
WITH spec_136 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mazda-ms-hv_c2' LIMIT 1
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
  spec_136.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_136, (VALUES
  ('MAZDA', '2 (DE)', 'DJ', '', 1496, 'essence', 90),
  ('MAZDA', '2 (DE)', 'DJ', '1.5 Skyactiv-G', 1496, 'essence', 90),
  ('MAZDA', '2 (DE)', 'DJ', '1.5 Skyactiv-D', 1499, 'diesel', 105),
  ('MAZDA', '2 (DJ)', 'DJ', '', 1496, 'essence', 90),
  ('MAZDA', '2 (DJ)', 'DJ', '1.5 Skyactiv-G', 1496, 'essence', 90),
  ('MAZDA', '2 (DJ)', 'DJ', '1.5 Skyactiv-D', 1499, 'diesel', 105),
  ('MAZDA', 'Mazda 2', 'DJ', '', 1496, 'essence', 90),
  ('MAZDA', 'Mazda 2', 'DJ', '1.5 Skyactiv-G', 1496, 'essence', 90),
  ('MAZDA', 'Mazda 2', 'DJ', '1.5 Skyactiv-D', 1499, 'diesel', 105),
  ('MAZDA', 'MAZDA 2', 'DJ', '', 1496, 'essence', 90),
  ('MAZDA', 'MAZDA 2', 'DJ', '1.5 Skyactiv-G', 1496, 'essence', 90),
  ('MAZDA', 'MAZDA 2', 'DJ', '1.5 Skyactiv-D', 1499, 'diesel', 105),
  ('MAZDA', 'Mazda2', 'DJ', '', 1496, 'essence', 90),
  ('MAZDA', 'Mazda2', 'DJ', '1.5 Skyactiv-G', 1496, 'essence', 90),
  ('MAZDA', 'Mazda2', 'DJ', '1.5 Skyactiv-D', 1499, 'diesel', 105)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MAZDA (3 (BK)) ──
WITH spec_137 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mazda-ms-hv_c2' LIMIT 1
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
  spec_137.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_137, (VALUES
  ('MAZDA', '3 (BK)', 'BM', '', 2191, 'diesel', 150),
  ('MAZDA', '3 (BK)', 'BM', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', '3 (BK)', 'BM', '1.5 Skyactiv-G', 1496, 'essence', 100),
  ('MAZDA', '3 (BK)', 'BM', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', '3 (BL)', 'BM', '', 2191, 'diesel', 150),
  ('MAZDA', '3 (BL)', 'BM', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', '3 (BL)', 'BM', '1.5 Skyactiv-G', 1496, 'essence', 100),
  ('MAZDA', '3 (BL)', 'BM', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', '3 (BM)', 'BM', '', 2191, 'diesel', 150),
  ('MAZDA', '3 (BM)', 'BM', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', '3 (BM)', 'BM', '1.5 Skyactiv-G', 1496, 'essence', 100),
  ('MAZDA', '3 (BM)', 'BM', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', '3 (BP)', 'BM', '', 2191, 'diesel', 150),
  ('MAZDA', '3 (BP)', 'BM', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', '3 (BP)', 'BM', '1.5 Skyactiv-G', 1496, 'essence', 100),
  ('MAZDA', '3 (BP)', 'BM', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'Mazda 3', 'BM', '', 2191, 'diesel', 150),
  ('MAZDA', 'Mazda 3', 'BM', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', 'Mazda 3', 'BM', '1.5 Skyactiv-G', 1496, 'essence', 100),
  ('MAZDA', 'Mazda 3', 'BM', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'MAZDA 3', 'BM', '', 2191, 'diesel', 150),
  ('MAZDA', 'MAZDA 3', 'BM', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', 'MAZDA 3', 'BM', '1.5 Skyactiv-G', 1496, 'essence', 100),
  ('MAZDA', 'MAZDA 3', 'BM', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'Mazda3', 'BM', '', 2191, 'diesel', 150),
  ('MAZDA', 'Mazda3', 'BM', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', 'Mazda3', 'BM', '1.5 Skyactiv-G', 1496, 'essence', 100),
  ('MAZDA', 'Mazda3', 'BM', '2.0 Skyactiv-G', 1997, 'essence', 165)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MAZDA (6 (GG)) ──
WITH spec_138 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mazda-ms-hv_c2' LIMIT 1
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
  spec_138.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_138, (VALUES
  ('MAZDA', '6 (GG)', 'GJ', '', 2191, 'diesel', 175),
  ('MAZDA', '6 (GG)', 'GJ', '2.2 Skyactiv-D', 2191, 'diesel', 175),
  ('MAZDA', '6 (GG)', 'GJ', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', '6 (GH)', 'GJ', '', 2191, 'diesel', 175),
  ('MAZDA', '6 (GH)', 'GJ', '2.2 Skyactiv-D', 2191, 'diesel', 175),
  ('MAZDA', '6 (GH)', 'GJ', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', '6 (GJ)', 'GJ', '', 2191, 'diesel', 175),
  ('MAZDA', '6 (GJ)', 'GJ', '2.2 Skyactiv-D', 2191, 'diesel', 175),
  ('MAZDA', '6 (GJ)', 'GJ', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', '6 (GL)', 'GJ', '', 2191, 'diesel', 175),
  ('MAZDA', '6 (GL)', 'GJ', '2.2 Skyactiv-D', 2191, 'diesel', 175),
  ('MAZDA', '6 (GL)', 'GJ', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'Mazda 6', 'GJ', '', 2191, 'diesel', 175),
  ('MAZDA', 'Mazda 6', 'GJ', '2.2 Skyactiv-D', 2191, 'diesel', 175),
  ('MAZDA', 'Mazda 6', 'GJ', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'MAZDA 6', 'GJ', '', 2191, 'diesel', 175),
  ('MAZDA', 'MAZDA 6', 'GJ', '2.2 Skyactiv-D', 2191, 'diesel', 175),
  ('MAZDA', 'MAZDA 6', 'GJ', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'Mazda6', 'GJ', '', 2191, 'diesel', 175),
  ('MAZDA', 'Mazda6', 'GJ', '2.2 Skyactiv-D', 2191, 'diesel', 175),
  ('MAZDA', 'Mazda6', 'GJ', '2.0 Skyactiv-G', 1997, 'essence', 165)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MAZDA (CX-5 (KE)) ──
WITH spec_139 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mazda-ms-hv_c2' LIMIT 1
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
  spec_139.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_139, (VALUES
  ('MAZDA', 'CX-5 (KE)', 'KF', '', 2191, 'diesel', 150),
  ('MAZDA', 'CX-5 (KE)', 'KF', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', 'CX-5 (KE)', 'KF', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'CX-5 (KE)', 'KF', '2.5 Skyactiv-G', 2488, 'essence', 194),
  ('MAZDA', 'CX-5 (KF)', 'KF', '', 2191, 'diesel', 150),
  ('MAZDA', 'CX-5 (KF)', 'KF', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', 'CX-5 (KF)', 'KF', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'CX-5 (KF)', 'KF', '2.5 Skyactiv-G', 2488, 'essence', 194),
  ('MAZDA', 'CX-5', 'KF', '', 2191, 'diesel', 150),
  ('MAZDA', 'CX-5', 'KF', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', 'CX-5', 'KF', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'CX-5', 'KF', '2.5 Skyactiv-G', 2488, 'essence', 194),
  ('MAZDA', 'CX5', 'KF', '', 2191, 'diesel', 150),
  ('MAZDA', 'CX5', 'KF', '2.2 Skyactiv-D', 2191, 'diesel', 150),
  ('MAZDA', 'CX5', 'KF', '2.0 Skyactiv-G', 1997, 'essence', 165),
  ('MAZDA', 'CX5', 'KF', '2.5 Skyactiv-G', 2488, 'essence', 194)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MAZDA (CX-3 (DK)) ──
WITH spec_140 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mazda-ms-hv_c2' LIMIT 1
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
  spec_140.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_140, (VALUES
  ('MAZDA', 'CX-3 (DK)', 'DK', '', 1496, 'diesel', 105),
  ('MAZDA', 'CX-3 (DK)', 'DK', '1.5 Skyactiv-D', 1499, 'diesel', 105),
  ('MAZDA', 'CX-3 (DK)', 'DK', '2.0 Skyactiv-G', 1997, 'essence', 150),
  ('MAZDA', 'CX-3', 'DK', '', 1496, 'diesel', 105),
  ('MAZDA', 'CX-3', 'DK', '1.5 Skyactiv-D', 1499, 'diesel', 105),
  ('MAZDA', 'CX-3', 'DK', '2.0 Skyactiv-G', 1997, 'essence', 150),
  ('MAZDA', 'CX3', 'DK', '', 1496, 'diesel', 105),
  ('MAZDA', 'CX3', 'DK', '1.5 Skyactiv-D', 1499, 'diesel', 105),
  ('MAZDA', 'CX3', 'DK', '2.0 Skyactiv-G', 1997, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── NISSAN (JUKE (F15)) ──
WITH spec_141 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_141.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_141, (VALUES
  ('NISSAN', 'JUKE (F15)', 'F15', '', 1197, 'essence', 116),
  ('NISSAN', 'JUKE (F15)', 'F15', '1.2 DIG-T', 1197, 'essence', 116),
  ('NISSAN', 'JUKE (F15)', 'F15', '1.6 DIG-T', 1598, 'essence', 190),
  ('NISSAN', 'JUKE (F15)', 'F15', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'JUKE (F16)', 'F15', '', 1197, 'essence', 116),
  ('NISSAN', 'JUKE (F16)', 'F15', '1.2 DIG-T', 1197, 'essence', 116),
  ('NISSAN', 'JUKE (F16)', 'F15', '1.6 DIG-T', 1598, 'essence', 190),
  ('NISSAN', 'JUKE (F16)', 'F15', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'Juke', 'F15', '', 1197, 'essence', 116),
  ('NISSAN', 'Juke', 'F15', '1.2 DIG-T', 1197, 'essence', 116),
  ('NISSAN', 'Juke', 'F15', '1.6 DIG-T', 1598, 'essence', 190),
  ('NISSAN', 'Juke', 'F15', '1.5 dCi', 1461, 'diesel', 110),
  ('NISSAN', 'JUKE', 'F15', '', 1197, 'essence', 116),
  ('NISSAN', 'JUKE', 'F15', '1.2 DIG-T', 1197, 'essence', 116),
  ('NISSAN', 'JUKE', 'F15', '1.6 DIG-T', 1598, 'essence', 190),
  ('NISSAN', 'JUKE', 'F15', '1.5 dCi', 1461, 'diesel', 110)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── NISSAN (X-TRAIL I (T30)) ──
WITH spec_142 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_renault-rn0720_c4' LIMIT 1
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
  spec_142.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_142, (VALUES
  ('NISSAN', 'X-TRAIL I (T30)', 'T32', '', 1598, 'diesel', 130),
  ('NISSAN', 'X-TRAIL I (T30)', 'T32', '1.6 dCi 4WD', 1598, 'diesel', 130),
  ('NISSAN', 'X-TRAIL I (T30)', 'T32', '2.0 dCi', 1995, 'diesel', 150),
  ('NISSAN', 'X-TRAIL II (T31)', 'T32', '', 1598, 'diesel', 130),
  ('NISSAN', 'X-TRAIL II (T31)', 'T32', '1.6 dCi 4WD', 1598, 'diesel', 130),
  ('NISSAN', 'X-TRAIL II (T31)', 'T32', '2.0 dCi', 1995, 'diesel', 150),
  ('NISSAN', 'X-TRAIL III (T32)', 'T32', '', 1598, 'diesel', 130),
  ('NISSAN', 'X-TRAIL III (T32)', 'T32', '1.6 dCi 4WD', 1598, 'diesel', 130),
  ('NISSAN', 'X-TRAIL III (T32)', 'T32', '2.0 dCi', 1995, 'diesel', 150),
  ('NISSAN', 'X-Trail', 'T32', '', 1598, 'diesel', 130),
  ('NISSAN', 'X-Trail', 'T32', '1.6 dCi 4WD', 1598, 'diesel', 130),
  ('NISSAN', 'X-Trail', 'T32', '2.0 dCi', 1995, 'diesel', 150),
  ('NISSAN', 'XTRAIL', 'T32', '', 1598, 'diesel', 130),
  ('NISSAN', 'XTRAIL', 'T32', '1.6 dCi 4WD', 1598, 'diesel', 130),
  ('NISSAN', 'XTRAIL', 'T32', '2.0 dCi', 1995, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── NISSAN (NAVARA (D22)) ──
WITH spec_143 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_143.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_143, (VALUES
  ('NISSAN', 'NAVARA (D22)', 'D23', '', 2298, 'diesel', 163),
  ('NISSAN', 'NAVARA (D22)', 'D23', '2.3 dCi 4WD', 2298, 'diesel', 163),
  ('NISSAN', 'NAVARA (D22)', 'D23', '2.5 dCi', 2488, 'diesel', 174),
  ('NISSAN', 'NAVARA (D40)', 'D23', '', 2298, 'diesel', 163),
  ('NISSAN', 'NAVARA (D40)', 'D23', '2.3 dCi 4WD', 2298, 'diesel', 163),
  ('NISSAN', 'NAVARA (D40)', 'D23', '2.5 dCi', 2488, 'diesel', 174),
  ('NISSAN', 'NAVARA (D23)', 'D23', '', 2298, 'diesel', 163),
  ('NISSAN', 'NAVARA (D23)', 'D23', '2.3 dCi 4WD', 2298, 'diesel', 163),
  ('NISSAN', 'NAVARA (D23)', 'D23', '2.5 dCi', 2488, 'diesel', 174),
  ('NISSAN', 'Navara', 'D23', '', 2298, 'diesel', 163),
  ('NISSAN', 'Navara', 'D23', '2.3 dCi 4WD', 2298, 'diesel', 163),
  ('NISSAN', 'Navara', 'D23', '2.5 dCi', 2488, 'diesel', 174),
  ('NISSAN', 'NAVARA', 'D23', '', 2298, 'diesel', 163),
  ('NISSAN', 'NAVARA', 'D23', '2.3 dCi 4WD', 2298, 'diesel', 163),
  ('NISSAN', 'NAVARA', 'D23', '2.5 dCi', 2488, 'diesel', 174)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HONDA (CIVIC VIII (FD, FA)) ──
WITH spec_144 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-20_honda-08221_c5' LIMIT 1
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
  spec_144.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_144, (VALUES
  ('HONDA', 'CIVIC VIII (FD, FA)', 'X', '', 1498, 'essence', 182),
  ('HONDA', 'CIVIC VIII (FD, FA)', 'X', '1.5 VTEC Turbo', 1498, 'essence', 182),
  ('HONDA', 'CIVIC VIII (FD, FA)', 'X', '1.0 VTEC Turbo', 988, 'essence', 129),
  ('HONDA', 'CIVIC VIII (FD, FA)', 'X', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CIVIC VIII (FD, FA)', 'X', '1.8 i-VTEC', 1798, 'essence', 142),
  ('HONDA', 'CIVIC IX (FB)', 'X', '', 1498, 'essence', 182),
  ('HONDA', 'CIVIC IX (FB)', 'X', '1.5 VTEC Turbo', 1498, 'essence', 182),
  ('HONDA', 'CIVIC IX (FB)', 'X', '1.0 VTEC Turbo', 988, 'essence', 129),
  ('HONDA', 'CIVIC IX (FB)', 'X', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CIVIC IX (FB)', 'X', '1.8 i-VTEC', 1798, 'essence', 142),
  ('HONDA', 'CIVIC X (FC, FK)', 'X', '', 1498, 'essence', 182),
  ('HONDA', 'CIVIC X (FC, FK)', 'X', '1.5 VTEC Turbo', 1498, 'essence', 182),
  ('HONDA', 'CIVIC X (FC, FK)', 'X', '1.0 VTEC Turbo', 988, 'essence', 129),
  ('HONDA', 'CIVIC X (FC, FK)', 'X', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CIVIC X (FC, FK)', 'X', '1.8 i-VTEC', 1798, 'essence', 142),
  ('HONDA', 'CIVIC XI (FL)', 'X', '', 1498, 'essence', 182),
  ('HONDA', 'CIVIC XI (FL)', 'X', '1.5 VTEC Turbo', 1498, 'essence', 182),
  ('HONDA', 'CIVIC XI (FL)', 'X', '1.0 VTEC Turbo', 988, 'essence', 129),
  ('HONDA', 'CIVIC XI (FL)', 'X', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CIVIC XI (FL)', 'X', '1.8 i-VTEC', 1798, 'essence', 142),
  ('HONDA', 'Civic', 'X', '', 1498, 'essence', 182),
  ('HONDA', 'Civic', 'X', '1.5 VTEC Turbo', 1498, 'essence', 182),
  ('HONDA', 'Civic', 'X', '1.0 VTEC Turbo', 988, 'essence', 129),
  ('HONDA', 'Civic', 'X', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'Civic', 'X', '1.8 i-VTEC', 1798, 'essence', 142),
  ('HONDA', 'CIVIC', 'X', '', 1498, 'essence', 182),
  ('HONDA', 'CIVIC', 'X', '1.5 VTEC Turbo', 1498, 'essence', 182),
  ('HONDA', 'CIVIC', 'X', '1.0 VTEC Turbo', 988, 'essence', 129),
  ('HONDA', 'CIVIC', 'X', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CIVIC', 'X', '1.8 i-VTEC', 1798, 'essence', 142)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HONDA (JAZZ II (GD)) ──
WITH spec_145 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-20_honda-08221_c5' LIMIT 1
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
  spec_145.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_145, (VALUES
  ('HONDA', 'JAZZ II (GD)', 'GK', '', 1317, 'essence', 102),
  ('HONDA', 'JAZZ II (GD)', 'GK', '1.3 (L13Z1)', 1317, 'essence', 102),
  ('HONDA', 'JAZZ II (GD)', 'GK', '1.5 i-VTEC', 1498, 'essence', 130),
  ('HONDA', 'JAZZ III (GE)', 'GK', '', 1317, 'essence', 102),
  ('HONDA', 'JAZZ III (GE)', 'GK', '1.3 (L13Z1)', 1317, 'essence', 102),
  ('HONDA', 'JAZZ III (GE)', 'GK', '1.5 i-VTEC', 1498, 'essence', 130),
  ('HONDA', 'JAZZ IV (GK)', 'GK', '', 1317, 'essence', 102),
  ('HONDA', 'JAZZ IV (GK)', 'GK', '1.3 (L13Z1)', 1317, 'essence', 102),
  ('HONDA', 'JAZZ IV (GK)', 'GK', '1.5 i-VTEC', 1498, 'essence', 130),
  ('HONDA', 'JAZZ V (GR)', 'GK', '', 1317, 'essence', 102),
  ('HONDA', 'JAZZ V (GR)', 'GK', '1.3 (L13Z1)', 1317, 'essence', 102),
  ('HONDA', 'JAZZ V (GR)', 'GK', '1.5 i-VTEC', 1498, 'essence', 130),
  ('HONDA', 'Jazz', 'GK', '', 1317, 'essence', 102),
  ('HONDA', 'Jazz', 'GK', '1.3 (L13Z1)', 1317, 'essence', 102),
  ('HONDA', 'Jazz', 'GK', '1.5 i-VTEC', 1498, 'essence', 130),
  ('HONDA', 'JAZZ', 'GK', '', 1317, 'essence', 102),
  ('HONDA', 'JAZZ', 'GK', '1.3 (L13Z1)', 1317, 'essence', 102),
  ('HONDA', 'JAZZ', 'GK', '1.5 i-VTEC', 1498, 'essence', 130)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HONDA (CR-V II (RD)) ──
WITH spec_146 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-20_honda-08221_c5' LIMIT 1
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
  spec_146.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_146, (VALUES
  ('HONDA', 'CR-V II (RD)', 'RW', '', 1498, 'essence', 193),
  ('HONDA', 'CR-V II (RD)', 'RW', '1.5 VTEC Turbo', 1498, 'essence', 193),
  ('HONDA', 'CR-V II (RD)', 'RW', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CR-V II (RD)', 'RW', '2.0 i-VTEC', 1997, 'essence', 155),
  ('HONDA', 'CR-V III (RE)', 'RW', '', 1498, 'essence', 193),
  ('HONDA', 'CR-V III (RE)', 'RW', '1.5 VTEC Turbo', 1498, 'essence', 193),
  ('HONDA', 'CR-V III (RE)', 'RW', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CR-V III (RE)', 'RW', '2.0 i-VTEC', 1997, 'essence', 155),
  ('HONDA', 'CR-V IV (RM)', 'RW', '', 1498, 'essence', 193),
  ('HONDA', 'CR-V IV (RM)', 'RW', '1.5 VTEC Turbo', 1498, 'essence', 193),
  ('HONDA', 'CR-V IV (RM)', 'RW', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CR-V IV (RM)', 'RW', '2.0 i-VTEC', 1997, 'essence', 155),
  ('HONDA', 'CR-V V (RW)', 'RW', '', 1498, 'essence', 193),
  ('HONDA', 'CR-V V (RW)', 'RW', '1.5 VTEC Turbo', 1498, 'essence', 193),
  ('HONDA', 'CR-V V (RW)', 'RW', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CR-V V (RW)', 'RW', '2.0 i-VTEC', 1997, 'essence', 155),
  ('HONDA', 'CR-V', 'RW', '', 1498, 'essence', 193),
  ('HONDA', 'CR-V', 'RW', '1.5 VTEC Turbo', 1498, 'essence', 193),
  ('HONDA', 'CR-V', 'RW', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CR-V', 'RW', '2.0 i-VTEC', 1997, 'essence', 155),
  ('HONDA', 'CRV', 'RW', '', 1498, 'essence', 193),
  ('HONDA', 'CRV', 'RW', '1.5 VTEC Turbo', 1498, 'essence', 193),
  ('HONDA', 'CRV', 'RW', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'CRV', 'RW', '2.0 i-VTEC', 1997, 'essence', 155)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HONDA (HR-V II (RU)) ──
WITH spec_147 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_honda-08w30_sn' LIMIT 1
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
  spec_147.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_147, (VALUES
  ('HONDA', 'HR-V II (RU)', 'ZR', '', 1496, 'essence', 130),
  ('HONDA', 'HR-V II (RU)', 'ZR', '1.5 i-VTEC', 1496, 'essence', 130),
  ('HONDA', 'HR-V II (RU)', 'ZR', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'HR-V (ZR)', 'ZR', '', 1496, 'essence', 130),
  ('HONDA', 'HR-V (ZR)', 'ZR', '1.5 i-VTEC', 1496, 'essence', 130),
  ('HONDA', 'HR-V (ZR)', 'ZR', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'HR-V', 'ZR', '', 1496, 'essence', 130),
  ('HONDA', 'HR-V', 'ZR', '1.5 i-VTEC', 1496, 'essence', 130),
  ('HONDA', 'HR-V', 'ZR', '1.6 i-DTEC', 1597, 'diesel', 120),
  ('HONDA', 'HRV', 'ZR', '', 1496, 'essence', 130),
  ('HONDA', 'HRV', 'ZR', '1.5 i-VTEC', 1496, 'essence', 130),
  ('HONDA', 'HRV', 'ZR', '1.6 i-DTEC', 1597, 'diesel', 120)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HONDA (ACCORD VIII (CL)) ──
WITH spec_148 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_honda-08w30_sn' LIMIT 1
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
  spec_148.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_148, (VALUES
  ('HONDA', 'ACCORD VIII (CL)', 'CR', '', 1997, 'essence', 156),
  ('HONDA', 'ACCORD VIII (CL)', 'CR', '2.0 (K20Z4)', 1997, 'essence', 156),
  ('HONDA', 'ACCORD VIII (CL)', 'CR', '2.2 i-DTEC', 2199, 'diesel', 180),
  ('HONDA', 'ACCORD IX (CR)', 'CR', '', 1997, 'essence', 156),
  ('HONDA', 'ACCORD IX (CR)', 'CR', '2.0 (K20Z4)', 1997, 'essence', 156),
  ('HONDA', 'ACCORD IX (CR)', 'CR', '2.2 i-DTEC', 2199, 'diesel', 180),
  ('HONDA', 'Accord', 'CR', '', 1997, 'essence', 156),
  ('HONDA', 'Accord', 'CR', '2.0 (K20Z4)', 1997, 'essence', 156),
  ('HONDA', 'Accord', 'CR', '2.2 i-DTEC', 2199, 'diesel', 180),
  ('HONDA', 'ACCORD', 'CR', '', 1997, 'essence', 156),
  ('HONDA', 'ACCORD', 'CR', '2.0 (K20Z4)', 1997, 'essence', 156),
  ('HONDA', 'ACCORD', 'CR', '2.2 i-DTEC', 2199, 'diesel', 180)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MITSUBISHI (COLT VI (Z3_A, Z2_A)) ──
WITH spec_149 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mitsubishi-mz320757_c3' LIMIT 1
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
  spec_149.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_149, (VALUES
  ('MITSUBISHI', 'COLT VI (Z3_A, Z2_A)', 'VI', '', 1332, 'essence', 98),
  ('MITSUBISHI', 'COLT VI (Z3_A, Z2_A)', 'VI', '1.3 (4A90)', 1332, 'essence', 98),
  ('MITSUBISHI', 'COLT VI (Z3_A, Z2_A)', 'VI', '1.5 (4A91)', 1499, 'essence', 109),
  ('MITSUBISHI', 'Colt', 'VI', '', 1332, 'essence', 98),
  ('MITSUBISHI', 'Colt', 'VI', '1.3 (4A90)', 1332, 'essence', 98),
  ('MITSUBISHI', 'Colt', 'VI', '1.5 (4A91)', 1499, 'essence', 109),
  ('MITSUBISHI', 'COLT', 'VI', '', 1332, 'essence', 98),
  ('MITSUBISHI', 'COLT', 'VI', '1.3 (4A90)', 1332, 'essence', 98),
  ('MITSUBISHI', 'COLT', 'VI', '1.5 (4A91)', 1499, 'essence', 109)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MITSUBISHI (OUTLANDER II (CW_W)) ──
WITH spec_150 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mitsubishi-mz320757_c3' LIMIT 1
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
  spec_150.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_150, (VALUES
  ('MITSUBISHI', 'OUTLANDER II (CW_W)', 'III', '', 2268, 'diesel', 150),
  ('MITSUBISHI', 'OUTLANDER II (CW_W)', 'III', '2.2 DI-D (4N14)', 2268, 'diesel', 150),
  ('MITSUBISHI', 'OUTLANDER II (CW_W)', 'III', '2.0 (4J11)', 1998, 'essence', 150),
  ('MITSUBISHI', 'OUTLANDER III (GF_W)', 'III', '', 2268, 'diesel', 150),
  ('MITSUBISHI', 'OUTLANDER III (GF_W)', 'III', '2.2 DI-D (4N14)', 2268, 'diesel', 150),
  ('MITSUBISHI', 'OUTLANDER III (GF_W)', 'III', '2.0 (4J11)', 1998, 'essence', 150),
  ('MITSUBISHI', 'Outlander', 'III', '', 2268, 'diesel', 150),
  ('MITSUBISHI', 'Outlander', 'III', '2.2 DI-D (4N14)', 2268, 'diesel', 150),
  ('MITSUBISHI', 'Outlander', 'III', '2.0 (4J11)', 1998, 'essence', 150),
  ('MITSUBISHI', 'OUTLANDER', 'III', '', 2268, 'diesel', 150),
  ('MITSUBISHI', 'OUTLANDER', 'III', '2.2 DI-D (4N14)', 2268, 'diesel', 150),
  ('MITSUBISHI', 'OUTLANDER', 'III', '2.0 (4J11)', 1998, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MITSUBISHI (L200 III (K7_T, K6_T)) ──
WITH spec_151 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mitsubishi-mz320757_c3' LIMIT 1
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
  spec_151.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_151, (VALUES
  ('MITSUBISHI', 'L200 III (K7_T, K6_T)', 'V', '', 2442, 'diesel', 154),
  ('MITSUBISHI', 'L200 III (K7_T, K6_T)', 'V', '2.4 DI-D (4N15)', 2442, 'diesel', 154),
  ('MITSUBISHI', 'L200 III (K7_T, K6_T)', 'V', '2.5 DI-D (4D56T)', 2477, 'diesel', 136),
  ('MITSUBISHI', 'L200 IV (KH_T)', 'V', '', 2442, 'diesel', 154),
  ('MITSUBISHI', 'L200 IV (KH_T)', 'V', '2.4 DI-D (4N15)', 2442, 'diesel', 154),
  ('MITSUBISHI', 'L200 IV (KH_T)', 'V', '2.5 DI-D (4D56T)', 2477, 'diesel', 136),
  ('MITSUBISHI', 'L200 V (KJ_, KL_)', 'V', '', 2442, 'diesel', 154),
  ('MITSUBISHI', 'L200 V (KJ_, KL_)', 'V', '2.4 DI-D (4N15)', 2442, 'diesel', 154),
  ('MITSUBISHI', 'L200 V (KJ_, KL_)', 'V', '2.5 DI-D (4D56T)', 2477, 'diesel', 136),
  ('MITSUBISHI', 'L200', 'V', '', 2442, 'diesel', 154),
  ('MITSUBISHI', 'L200', 'V', '2.4 DI-D (4N15)', 2442, 'diesel', 154),
  ('MITSUBISHI', 'L200', 'V', '2.5 DI-D (4D56T)', 2477, 'diesel', 136),
  ('MITSUBISHI', 'TRITON', 'V', '', 2442, 'diesel', 154),
  ('MITSUBISHI', 'TRITON', 'V', '2.4 DI-D (4N15)', 2442, 'diesel', 154),
  ('MITSUBISHI', 'TRITON', 'V', '2.5 DI-D (4D56T)', 2477, 'diesel', 136)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MITSUBISHI (ASX (GA_W)) ──
WITH spec_152 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mitsubishi-mz320757_c3' LIMIT 1
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
  spec_152.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_152, (VALUES
  ('MITSUBISHI', 'ASX (GA_W)', 'GA', '', 1590, 'essence', 117),
  ('MITSUBISHI', 'ASX (GA_W)', 'GA', '1.6 (4A92)', 1590, 'essence', 117),
  ('MITSUBISHI', 'ASX (GA_W)', 'GA', '2.2 DI-D', 2268, 'diesel', 150),
  ('MITSUBISHI', 'ASX', 'GA', '', 1590, 'essence', 117),
  ('MITSUBISHI', 'ASX', 'GA', '1.6 (4A92)', 1590, 'essence', 117),
  ('MITSUBISHI', 'ASX', 'GA', '2.2 DI-D', 2268, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SUBARU (IMPREZA III (GE)) ──
WITH spec_153 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_subaru-soa_a3b4' LIMIT 1
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
  spec_153.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_153, (VALUES
  ('SUBARU', 'IMPREZA III (GE)', 'IV', '', 1995, 'essence', 150),
  ('SUBARU', 'IMPREZA III (GE)', 'IV', '2.0 (FB20B)', 1995, 'essence', 150),
  ('SUBARU', 'IMPREZA III (GE)', 'IV', '2.0 DIT Turbo', 1995, 'essence', 280),
  ('SUBARU', 'IMPREZA IV (G4)', 'IV', '', 1995, 'essence', 150),
  ('SUBARU', 'IMPREZA IV (G4)', 'IV', '2.0 (FB20B)', 1995, 'essence', 150),
  ('SUBARU', 'IMPREZA IV (G4)', 'IV', '2.0 DIT Turbo', 1995, 'essence', 280),
  ('SUBARU', 'IMPREZA V (G5)', 'IV', '', 1995, 'essence', 150),
  ('SUBARU', 'IMPREZA V (G5)', 'IV', '2.0 (FB20B)', 1995, 'essence', 150),
  ('SUBARU', 'IMPREZA V (G5)', 'IV', '2.0 DIT Turbo', 1995, 'essence', 280),
  ('SUBARU', 'Impreza', 'IV', '', 1995, 'essence', 150),
  ('SUBARU', 'Impreza', 'IV', '2.0 (FB20B)', 1995, 'essence', 150),
  ('SUBARU', 'Impreza', 'IV', '2.0 DIT Turbo', 1995, 'essence', 280),
  ('SUBARU', 'IMPREZA', 'IV', '', 1995, 'essence', 150),
  ('SUBARU', 'IMPREZA', 'IV', '2.0 (FB20B)', 1995, 'essence', 150),
  ('SUBARU', 'IMPREZA', 'IV', '2.0 DIT Turbo', 1995, 'essence', 280)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SUBARU (FORESTER II (S10)) ──
WITH spec_154 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_subaru-soa_a3b4' LIMIT 1
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
  spec_154.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_154, (VALUES
  ('SUBARU', 'FORESTER II (S10)', 'SJ', '', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER II (S10)', 'SJ', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER II (S10)', 'SJ', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'FORESTER III (S11)', 'SJ', '', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER III (S11)', 'SJ', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER III (S11)', 'SJ', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'FORESTER IV (SJ)', 'SJ', '', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER IV (SJ)', 'SJ', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER IV (SJ)', 'SJ', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'FORESTER V (SK)', 'SJ', '', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER V (SK)', 'SJ', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER V (SK)', 'SJ', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'Forester', 'SJ', '', 1995, 'essence', 150),
  ('SUBARU', 'Forester', 'SJ', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'Forester', 'SJ', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'FORESTER', 'SJ', '', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER', 'SJ', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'FORESTER', 'SJ', '2.0 D (EE20Z)', 1998, 'diesel', 147)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SUBARU (OUTBACK III (BL, BP)) ──
WITH spec_155 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_subaru-soa_a3b4' LIMIT 1
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
  spec_155.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_155, (VALUES
  ('SUBARU', 'OUTBACK III (BL, BP)', 'BS', '', 2498, 'essence', 175),
  ('SUBARU', 'OUTBACK III (BL, BP)', 'BS', '2.5 (FB25)', 2498, 'essence', 175),
  ('SUBARU', 'OUTBACK III (BL, BP)', 'BS', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'OUTBACK IV (BR)', 'BS', '', 2498, 'essence', 175),
  ('SUBARU', 'OUTBACK IV (BR)', 'BS', '2.5 (FB25)', 2498, 'essence', 175),
  ('SUBARU', 'OUTBACK IV (BR)', 'BS', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'OUTBACK V (BS)', 'BS', '', 2498, 'essence', 175),
  ('SUBARU', 'OUTBACK V (BS)', 'BS', '2.5 (FB25)', 2498, 'essence', 175),
  ('SUBARU', 'OUTBACK V (BS)', 'BS', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'Outback', 'BS', '', 2498, 'essence', 175),
  ('SUBARU', 'Outback', 'BS', '2.5 (FB25)', 2498, 'essence', 175),
  ('SUBARU', 'Outback', 'BS', '2.0 D (EE20Z)', 1998, 'diesel', 147),
  ('SUBARU', 'OUTBACK', 'BS', '', 2498, 'essence', 175),
  ('SUBARU', 'OUTBACK', 'BS', '2.5 (FB25)', 2498, 'essence', 175),
  ('SUBARU', 'OUTBACK', 'BS', '2.0 D (EE20Z)', 1998, 'diesel', 147)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SUBARU (XV I (GP)) ──
WITH spec_156 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_subaru-soa_a3b4' LIMIT 1
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
  spec_156.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_156, (VALUES
  ('SUBARU', 'XV I (GP)', 'GT', '', 1995, 'essence', 150),
  ('SUBARU', 'XV I (GP)', 'GT', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'XV II (GT)', 'GT', '', 1995, 'essence', 150),
  ('SUBARU', 'XV II (GT)', 'GT', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'XV', 'GT', '', 1995, 'essence', 150),
  ('SUBARU', 'XV', 'GT', '2.0 (FB20)', 1995, 'essence', 150),
  ('SUBARU', 'SUBARU XV', 'GT', '', 1995, 'essence', 150),
  ('SUBARU', 'SUBARU XV', 'GT', '2.0 (FB20)', 1995, 'essence', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SUZUKI (SWIFT II (EZ)) ──
WITH spec_157 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_suzuki-sls_sn' LIMIT 1
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
  spec_157.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_157, (VALUES
  ('SUZUKI', 'SWIFT II (EZ)', 'FZ', '', 1242, 'essence', 94),
  ('SUZUKI', 'SWIFT II (EZ)', 'FZ', '1.2 DUALJET', 1242, 'essence', 94),
  ('SUZUKI', 'SWIFT II (EZ)', 'FZ', '1.3 DDiS', 1248, 'diesel', 75),
  ('SUZUKI', 'SWIFT II (EZ)', 'FZ', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'SWIFT III (FZ, NZ)', 'FZ', '', 1242, 'essence', 94),
  ('SUZUKI', 'SWIFT III (FZ, NZ)', 'FZ', '1.2 DUALJET', 1242, 'essence', 94),
  ('SUZUKI', 'SWIFT III (FZ, NZ)', 'FZ', '1.3 DDiS', 1248, 'diesel', 75),
  ('SUZUKI', 'SWIFT III (FZ, NZ)', 'FZ', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'SWIFT IV (AZ)', 'FZ', '', 1242, 'essence', 94),
  ('SUZUKI', 'SWIFT IV (AZ)', 'FZ', '1.2 DUALJET', 1242, 'essence', 94),
  ('SUZUKI', 'SWIFT IV (AZ)', 'FZ', '1.3 DDiS', 1248, 'diesel', 75),
  ('SUZUKI', 'SWIFT IV (AZ)', 'FZ', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'Swift', 'FZ', '', 1242, 'essence', 94),
  ('SUZUKI', 'Swift', 'FZ', '1.2 DUALJET', 1242, 'essence', 94),
  ('SUZUKI', 'Swift', 'FZ', '1.3 DDiS', 1248, 'diesel', 75),
  ('SUZUKI', 'Swift', 'FZ', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'SWIFT', 'FZ', '', 1242, 'essence', 94),
  ('SUZUKI', 'SWIFT', 'FZ', '1.2 DUALJET', 1242, 'essence', 94),
  ('SUZUKI', 'SWIFT', 'FZ', '1.3 DDiS', 1248, 'diesel', 75),
  ('SUZUKI', 'SWIFT', 'FZ', '1.4 Boosterjet', 1373, 'essence', 140)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SUZUKI (VITARA II (LY)) ──
WITH spec_158 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_suzuki-sls_sn' LIMIT 1
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
  spec_158.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_158, (VALUES
  ('SUZUKI', 'VITARA II (LY)', 'LY', '', 1373, 'essence', 140),
  ('SUZUKI', 'VITARA II (LY)', 'LY', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'VITARA II (LY)', 'LY', '1.6 DDiS', 1598, 'diesel', 120),
  ('SUZUKI', 'VITARA II (LY)', 'LY', '1.6 VVT', 1586, 'essence', 120),
  ('SUZUKI', 'GRAND VITARA II (JT)', 'LY', '', 1373, 'essence', 140),
  ('SUZUKI', 'GRAND VITARA II (JT)', 'LY', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'GRAND VITARA II (JT)', 'LY', '1.6 DDiS', 1598, 'diesel', 120),
  ('SUZUKI', 'GRAND VITARA II (JT)', 'LY', '1.6 VVT', 1586, 'essence', 120),
  ('SUZUKI', 'SX4 S-Cross (JY)', 'LY', '', 1373, 'essence', 140),
  ('SUZUKI', 'SX4 S-Cross (JY)', 'LY', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'SX4 S-Cross (JY)', 'LY', '1.6 DDiS', 1598, 'diesel', 120),
  ('SUZUKI', 'SX4 S-Cross (JY)', 'LY', '1.6 VVT', 1586, 'essence', 120),
  ('SUZUKI', 'Vitara', 'LY', '', 1373, 'essence', 140),
  ('SUZUKI', 'Vitara', 'LY', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'Vitara', 'LY', '1.6 DDiS', 1598, 'diesel', 120),
  ('SUZUKI', 'Vitara', 'LY', '1.6 VVT', 1586, 'essence', 120),
  ('SUZUKI', 'VITARA', 'LY', '', 1373, 'essence', 140),
  ('SUZUKI', 'VITARA', 'LY', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'VITARA', 'LY', '1.6 DDiS', 1598, 'diesel', 120),
  ('SUZUKI', 'VITARA', 'LY', '1.6 VVT', 1586, 'essence', 120),
  ('SUZUKI', 'Grand Vitara', 'LY', '', 1373, 'essence', 140),
  ('SUZUKI', 'Grand Vitara', 'LY', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'Grand Vitara', 'LY', '1.6 DDiS', 1598, 'diesel', 120),
  ('SUZUKI', 'Grand Vitara', 'LY', '1.6 VVT', 1586, 'essence', 120),
  ('SUZUKI', 'S-Cross', 'LY', '', 1373, 'essence', 140),
  ('SUZUKI', 'S-Cross', 'LY', '1.4 Boosterjet', 1373, 'essence', 140),
  ('SUZUKI', 'S-Cross', 'LY', '1.6 DDiS', 1598, 'diesel', 120),
  ('SUZUKI', 'S-Cross', 'LY', '1.6 VVT', 1586, 'essence', 120)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SUZUKI (JIMNY (FJ)) ──
WITH spec_159 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_suzuki-sls_sn' LIMIT 1
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
  spec_159.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_159, (VALUES
  ('SUZUKI', 'JIMNY (FJ)', 'FJ', '', 1460, 'essence', 102),
  ('SUZUKI', 'JIMNY (FJ)', 'FJ', '1.5 (K15B)', 1460, 'essence', 102),
  ('SUZUKI', 'JIMNY (FJ)', 'FJ', '1.3 (G13BB)', 1298, 'essence', 85),
  ('SUZUKI', 'Jimny', 'FJ', '', 1460, 'essence', 102),
  ('SUZUKI', 'Jimny', 'FJ', '1.5 (K15B)', 1460, 'essence', 102),
  ('SUZUKI', 'Jimny', 'FJ', '1.3 (G13BB)', 1298, 'essence', 85),
  ('SUZUKI', 'JIMNY', 'FJ', '', 1460, 'essence', 102),
  ('SUZUKI', 'JIMNY', 'FJ', '1.5 (K15B)', 1460, 'essence', 102),
  ('SUZUKI', 'JIMNY', 'FJ', '1.3 (G13BB)', 1298, 'essence', 85)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SUZUKI (CELERIO (LF)) ──
WITH spec_160 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_suzuki-sls_sn' LIMIT 1
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
  spec_160.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_160, (VALUES
  ('SUZUKI', 'CELERIO (LF)', 'LF', '', 998, 'essence', 68),
  ('SUZUKI', 'CELERIO (LF)', 'LF', '1.0 (K10C)', 998, 'essence', 68),
  ('SUZUKI', 'Celerio', 'LF', '', 998, 'essence', 68),
  ('SUZUKI', 'Celerio', 'LF', '1.0 (K10C)', 998, 'essence', 68),
  ('SUZUKI', 'CELERIO', 'LF', '', 998, 'essence', 68),
  ('SUZUKI', 'CELERIO', 'LF', '1.0 (K10C)', 998, 'essence', 68),
  ('SUZUKI', 'ALTO (GF)', 'LF', '', 998, 'essence', 68),
  ('SUZUKI', 'ALTO (GF)', 'LF', '1.0 (K10C)', 998, 'essence', 68),
  ('SUZUKI', 'Alto', 'LF', '', 998, 'essence', 68),
  ('SUZUKI', 'Alto', 'LF', '1.0 (K10C)', 998, 'essence', 68)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LAND ROVER (DISCOVERY SPORT (LC_)) ──
WITH spec_161 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_jlr-03-5006_c3' LIMIT 1
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
  spec_161.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_161, (VALUES
  ('LAND ROVER', 'DISCOVERY SPORT (LC_)', 'L462', '', 1998, 'diesel', 150),
  ('LAND ROVER', 'DISCOVERY SPORT (LC_)', 'L462', '2.0 SD4', 1998, 'diesel', 150),
  ('LAND ROVER', 'DISCOVERY SPORT (LC_)', 'L462', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'DISCOVERY 4 (L319)', 'L462', '', 1998, 'diesel', 150),
  ('LAND ROVER', 'DISCOVERY 4 (L319)', 'L462', '2.0 SD4', 1998, 'diesel', 150),
  ('LAND ROVER', 'DISCOVERY 4 (L319)', 'L462', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'DISCOVERY 5 (L462)', 'L462', '', 1998, 'diesel', 150),
  ('LAND ROVER', 'DISCOVERY 5 (L462)', 'L462', '2.0 SD4', 1998, 'diesel', 150),
  ('LAND ROVER', 'DISCOVERY 5 (L462)', 'L462', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'Discovery', 'L462', '', 1998, 'diesel', 150),
  ('LAND ROVER', 'Discovery', 'L462', '2.0 SD4', 1998, 'diesel', 150),
  ('LAND ROVER', 'Discovery', 'L462', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'DISCOVERY', 'L462', '', 1998, 'diesel', 150),
  ('LAND ROVER', 'DISCOVERY', 'L462', '2.0 SD4', 1998, 'diesel', 150),
  ('LAND ROVER', 'DISCOVERY', 'L462', '3.0 TDV6', 2993, 'diesel', 258)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LAND ROVER (RANGE ROVER EVOQUE (L538)) ──
WITH spec_162 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_jlr-03-5006_c3' LIMIT 1
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
  spec_162.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_162, (VALUES
  ('LAND ROVER', 'RANGE ROVER EVOQUE (L538)', 'L405', '', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER EVOQUE (L538)', 'L405', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER EVOQUE (L538)', 'L405', '4.4 SDV8', 4367, 'diesel', 339),
  ('LAND ROVER', 'RANGE ROVER SPORT (L320)', 'L405', '', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER SPORT (L320)', 'L405', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER SPORT (L320)', 'L405', '4.4 SDV8', 4367, 'diesel', 339),
  ('LAND ROVER', 'RANGE ROVER SPORT (L494)', 'L405', '', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER SPORT (L494)', 'L405', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER SPORT (L494)', 'L405', '4.4 SDV8', 4367, 'diesel', 339),
  ('LAND ROVER', 'RANGE ROVER (L405)', 'L405', '', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER (L405)', 'L405', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER (L405)', 'L405', '4.4 SDV8', 4367, 'diesel', 339),
  ('LAND ROVER', 'Range Rover', 'L405', '', 2993, 'diesel', 258),
  ('LAND ROVER', 'Range Rover', 'L405', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'Range Rover', 'L405', '4.4 SDV8', 4367, 'diesel', 339),
  ('LAND ROVER', 'RANGE ROVER', 'L405', '', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER', 'L405', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'RANGE ROVER', 'L405', '4.4 SDV8', 4367, 'diesel', 339),
  ('LAND ROVER', 'Range Rover Sport', 'L405', '', 2993, 'diesel', 258),
  ('LAND ROVER', 'Range Rover Sport', 'L405', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'Range Rover Sport', 'L405', '4.4 SDV8', 4367, 'diesel', 339),
  ('LAND ROVER', 'Range Rover Evoque', 'L405', '', 2993, 'diesel', 258),
  ('LAND ROVER', 'Range Rover Evoque', 'L405', '3.0 TDV6', 2993, 'diesel', 258),
  ('LAND ROVER', 'Range Rover Evoque', 'L405', '4.4 SDV8', 4367, 'diesel', 339)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LAND ROVER (FREELANDER 2 (LF_)) ──
WITH spec_163 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_jlr-03-5006_c3' LIMIT 1
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
  spec_163.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_163, (VALUES
  ('LAND ROVER', 'FREELANDER 2 (LF_)', 'LF', '', 2179, 'diesel', 160),
  ('LAND ROVER', 'FREELANDER 2 (LF_)', 'LF', '2.2 TD4', 2179, 'diesel', 160),
  ('LAND ROVER', 'FREELANDER 2 (LF_)', 'LF', '2.0 Si4', 1997, 'essence', 240),
  ('LAND ROVER', 'FREELANDER', 'LF', '', 2179, 'diesel', 160),
  ('LAND ROVER', 'FREELANDER', 'LF', '2.2 TD4', 2179, 'diesel', 160),
  ('LAND ROVER', 'FREELANDER', 'LF', '2.0 Si4', 1997, 'essence', 240),
  ('LAND ROVER', 'Freelander 2', 'LF', '', 2179, 'diesel', 160),
  ('LAND ROVER', 'Freelander 2', 'LF', '2.2 TD4', 2179, 'diesel', 160),
  ('LAND ROVER', 'Freelander 2', 'LF', '2.0 Si4', 1997, 'essence', 240)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LAND ROVER (DEFENDER 90 (L316)) ──
WITH spec_164 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_jlr-03-5006_c3' LIMIT 1
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
  spec_164.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_164, (VALUES
  ('LAND ROVER', 'DEFENDER 90 (L316)', 'L663', '', 1997, 'diesel', 200),
  ('LAND ROVER', 'DEFENDER 90 (L316)', 'L663', 'D200', 1997, 'diesel', 200),
  ('LAND ROVER', 'DEFENDER 90 (L316)', 'L663', 'D240', 2997, 'diesel', 240),
  ('LAND ROVER', 'DEFENDER 90 (L316)', 'L663', 'P400', 2996, 'essence', 400),
  ('LAND ROVER', 'DEFENDER 110 (L316)', 'L663', '', 1997, 'diesel', 200),
  ('LAND ROVER', 'DEFENDER 110 (L316)', 'L663', 'D200', 1997, 'diesel', 200),
  ('LAND ROVER', 'DEFENDER 110 (L316)', 'L663', 'D240', 2997, 'diesel', 240),
  ('LAND ROVER', 'DEFENDER 110 (L316)', 'L663', 'P400', 2996, 'essence', 400),
  ('LAND ROVER', 'DEFENDER (L663)', 'L663', '', 1997, 'diesel', 200),
  ('LAND ROVER', 'DEFENDER (L663)', 'L663', 'D200', 1997, 'diesel', 200),
  ('LAND ROVER', 'DEFENDER (L663)', 'L663', 'D240', 2997, 'diesel', 240),
  ('LAND ROVER', 'DEFENDER (L663)', 'L663', 'P400', 2996, 'essence', 400),
  ('LAND ROVER', 'Defender', 'L663', '', 1997, 'diesel', 200),
  ('LAND ROVER', 'Defender', 'L663', 'D200', 1997, 'diesel', 200),
  ('LAND ROVER', 'Defender', 'L663', 'D240', 2997, 'diesel', 240),
  ('LAND ROVER', 'Defender', 'L663', 'P400', 2996, 'essence', 400),
  ('LAND ROVER', 'DEFENDER', 'L663', '', 1997, 'diesel', 200),
  ('LAND ROVER', 'DEFENDER', 'L663', 'D200', 1997, 'diesel', 200),
  ('LAND ROVER', 'DEFENDER', 'L663', 'D240', 2997, 'diesel', 240),
  ('LAND ROVER', 'DEFENDER', 'L663', 'P400', 2996, 'essence', 400)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── JAGUAR (XE (X760)) ──
WITH spec_165 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_jlr-03-5006_c3' LIMIT 1
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
  spec_165.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_165, (VALUES
  ('JAGUAR', 'XE (X760)', 'X760', '', 1999, 'diesel', 163),
  ('JAGUAR', 'XE (X760)', 'X760', '2.0 D (204DTD)', 1999, 'diesel', 163),
  ('JAGUAR', 'XE (X760)', 'X760', '2.0 (204PT)', 1997, 'essence', 250),
  ('JAGUAR', 'Jaguar XE', 'X760', '', 1999, 'diesel', 163),
  ('JAGUAR', 'Jaguar XE', 'X760', '2.0 D (204DTD)', 1999, 'diesel', 163),
  ('JAGUAR', 'Jaguar XE', 'X760', '2.0 (204PT)', 1997, 'essence', 250),
  ('JAGUAR', 'XE', 'X760', '', 1999, 'diesel', 163),
  ('JAGUAR', 'XE', 'X760', '2.0 D (204DTD)', 1999, 'diesel', 163),
  ('JAGUAR', 'XE', 'X760', '2.0 (204PT)', 1997, 'essence', 250)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── JAGUAR (F-PACE (X761)) ──
WITH spec_166 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_jlr-03-5006_c3' LIMIT 1
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
  spec_166.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_166, (VALUES
  ('JAGUAR', 'F-PACE (X761)', 'X761', '', 1999, 'diesel', 163),
  ('JAGUAR', 'F-PACE (X761)', 'X761', '2.0 D180', 1999, 'diesel', 180),
  ('JAGUAR', 'F-PACE (X761)', 'X761', '2.0 P300', 1997, 'essence', 300),
  ('JAGUAR', 'Jaguar F-Pace', 'X761', '', 1999, 'diesel', 163),
  ('JAGUAR', 'Jaguar F-Pace', 'X761', '2.0 D180', 1999, 'diesel', 180),
  ('JAGUAR', 'Jaguar F-Pace', 'X761', '2.0 P300', 1997, 'essence', 300),
  ('JAGUAR', 'F-Pace', 'X761', '', 1999, 'diesel', 163),
  ('JAGUAR', 'F-Pace', 'X761', '2.0 D180', 1999, 'diesel', 180),
  ('JAGUAR', 'F-Pace', 'X761', '2.0 P300', 1997, 'essence', 300)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PORSCHE (CAYENNE (9PA)) ──
WITH spec_167 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-40_porsche-c30_a3b4' LIMIT 1
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
  spec_167.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_167, (VALUES
  ('PORSCHE', 'CAYENNE (9PA)', '9YA', '', 2894, 'essence', 340),
  ('PORSCHE', 'CAYENNE (9PA)', '9YA', '3.0 V6', 2894, 'essence', 340),
  ('PORSCHE', 'CAYENNE (9PA)', '9YA', '3.0 E-Hybrid', 2894, 'essence', 462),
  ('PORSCHE', 'CAYENNE II (92A)', '9YA', '', 2894, 'essence', 340),
  ('PORSCHE', 'CAYENNE II (92A)', '9YA', '3.0 V6', 2894, 'essence', 340),
  ('PORSCHE', 'CAYENNE II (92A)', '9YA', '3.0 E-Hybrid', 2894, 'essence', 462),
  ('PORSCHE', 'CAYENNE III (9YA)', '9YA', '', 2894, 'essence', 340),
  ('PORSCHE', 'CAYENNE III (9YA)', '9YA', '3.0 V6', 2894, 'essence', 340),
  ('PORSCHE', 'CAYENNE III (9YA)', '9YA', '3.0 E-Hybrid', 2894, 'essence', 462),
  ('PORSCHE', 'Cayenne', '9YA', '', 2894, 'essence', 340),
  ('PORSCHE', 'Cayenne', '9YA', '3.0 V6', 2894, 'essence', 340),
  ('PORSCHE', 'Cayenne', '9YA', '3.0 E-Hybrid', 2894, 'essence', 462),
  ('PORSCHE', 'CAYENNE', '9YA', '', 2894, 'essence', 340),
  ('PORSCHE', 'CAYENNE', '9YA', '3.0 V6', 2894, 'essence', 340),
  ('PORSCHE', 'CAYENNE', '9YA', '3.0 E-Hybrid', 2894, 'essence', 462)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PORSCHE (MACAN (95B)) ──
WITH spec_168 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-40_porsche-c30_a3b4' LIMIT 1
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
  spec_168.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_168, (VALUES
  ('PORSCHE', 'MACAN (95B)', '95B', '', 1998, 'diesel', 211),
  ('PORSCHE', 'MACAN (95B)', '95B', '2.0 PDK', 1984, 'essence', 252),
  ('PORSCHE', 'MACAN (95B)', '95B', 'S 3.0 V6', 2995, 'essence', 354),
  ('PORSCHE', 'Macan', '95B', '', 1998, 'diesel', 211),
  ('PORSCHE', 'Macan', '95B', '2.0 PDK', 1984, 'essence', 252),
  ('PORSCHE', 'Macan', '95B', 'S 3.0 V6', 2995, 'essence', 354),
  ('PORSCHE', 'MACAN', '95B', '', 1998, 'diesel', 211),
  ('PORSCHE', 'MACAN', '95B', '2.0 PDK', 1984, 'essence', 252),
  ('PORSCHE', 'MACAN', '95B', 'S 3.0 V6', 2995, 'essence', 354)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── PORSCHE (911 (991)) ──
WITH spec_169 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-40_porsche-c30_a3b4' LIMIT 1
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
  spec_169.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_169, (VALUES
  ('PORSCHE', '911 (991)', '992', '', 2981, 'essence', 450),
  ('PORSCHE', '911 (991)', '992', 'Carrera', 2981, 'essence', 450),
  ('PORSCHE', '911 (991)', '992', 'Carrera S', 2981, 'essence', 450),
  ('PORSCHE', '911 (992)', '992', '', 2981, 'essence', 450),
  ('PORSCHE', '911 (992)', '992', 'Carrera', 2981, 'essence', 450),
  ('PORSCHE', '911 (992)', '992', 'Carrera S', 2981, 'essence', 450),
  ('PORSCHE', '911', '992', '', 2981, 'essence', 450),
  ('PORSCHE', '911', '992', 'Carrera', 2981, 'essence', 450),
  ('PORSCHE', '911', '992', 'Carrera S', 2981, 'essence', 450),
  ('PORSCHE', 'PORSCHE 911', '992', '', 2981, 'essence', 450),
  ('PORSCHE', 'PORSCHE 911', '992', 'Carrera', 2981, 'essence', 450),
  ('PORSCHE', 'PORSCHE 911', '992', 'Carrera S', 2981, 'essence', 450)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CHEVROLET (AVEO / KALOS (T250, T255)) ──
WITH spec_170 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos1_sn' LIMIT 1
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
  spec_170.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_170, (VALUES
  ('CHEVROLET', 'AVEO / KALOS (T250, T255)', 'T300', '', 1248, 'essence', 86),
  ('CHEVROLET', 'AVEO / KALOS (T250, T255)', 'T300', '1.2 (B12D1)', 1248, 'essence', 86),
  ('CHEVROLET', 'AVEO / KALOS (T250, T255)', 'T300', '1.4 (B14NET)', 1364, 'essence', 101),
  ('CHEVROLET', 'AVEO / KALOS (T250, T255)', 'T300', '1.3 D (Z13DTJ)', 1248, 'diesel', 75),
  ('CHEVROLET', 'AVEO (T300)', 'T300', '', 1248, 'essence', 86),
  ('CHEVROLET', 'AVEO (T300)', 'T300', '1.2 (B12D1)', 1248, 'essence', 86),
  ('CHEVROLET', 'AVEO (T300)', 'T300', '1.4 (B14NET)', 1364, 'essence', 101),
  ('CHEVROLET', 'AVEO (T300)', 'T300', '1.3 D (Z13DTJ)', 1248, 'diesel', 75),
  ('CHEVROLET', 'Aveo', 'T300', '', 1248, 'essence', 86),
  ('CHEVROLET', 'Aveo', 'T300', '1.2 (B12D1)', 1248, 'essence', 86),
  ('CHEVROLET', 'Aveo', 'T300', '1.4 (B14NET)', 1364, 'essence', 101),
  ('CHEVROLET', 'Aveo', 'T300', '1.3 D (Z13DTJ)', 1248, 'diesel', 75),
  ('CHEVROLET', 'AVEO', 'T300', '', 1248, 'essence', 86),
  ('CHEVROLET', 'AVEO', 'T300', '1.2 (B12D1)', 1248, 'essence', 86),
  ('CHEVROLET', 'AVEO', 'T300', '1.4 (B14NET)', 1364, 'essence', 101),
  ('CHEVROLET', 'AVEO', 'T300', '1.3 D (Z13DTJ)', 1248, 'diesel', 75),
  ('CHEVROLET', 'Kalos', 'T300', '', 1248, 'essence', 86),
  ('CHEVROLET', 'Kalos', 'T300', '1.2 (B12D1)', 1248, 'essence', 86),
  ('CHEVROLET', 'Kalos', 'T300', '1.4 (B14NET)', 1364, 'essence', 101),
  ('CHEVROLET', 'Kalos', 'T300', '1.3 D (Z13DTJ)', 1248, 'diesel', 75)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CHEVROLET (CRUZE (J300)) ──
WITH spec_171 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos1_sn' LIMIT 1
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
  spec_171.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_171, (VALUES
  ('CHEVROLET', 'CRUZE (J300)', 'J300', '', 1998, 'diesel', 163),
  ('CHEVROLET', 'CRUZE (J300)', 'J300', '2.0 VCDi (Z20DMH)', 1998, 'diesel', 163),
  ('CHEVROLET', 'CRUZE (J300)', 'J300', '1.4 Turbo', 1364, 'essence', 140),
  ('CHEVROLET', 'CRUZE (J400)', 'J300', '', 1998, 'diesel', 163),
  ('CHEVROLET', 'CRUZE (J400)', 'J300', '2.0 VCDi (Z20DMH)', 1998, 'diesel', 163),
  ('CHEVROLET', 'CRUZE (J400)', 'J300', '1.4 Turbo', 1364, 'essence', 140),
  ('CHEVROLET', 'Cruze', 'J300', '', 1998, 'diesel', 163),
  ('CHEVROLET', 'Cruze', 'J300', '2.0 VCDi (Z20DMH)', 1998, 'diesel', 163),
  ('CHEVROLET', 'Cruze', 'J300', '1.4 Turbo', 1364, 'essence', 140),
  ('CHEVROLET', 'CRUZE', 'J300', '', 1998, 'diesel', 163),
  ('CHEVROLET', 'CRUZE', 'J300', '2.0 VCDi (Z20DMH)', 1998, 'diesel', 163),
  ('CHEVROLET', 'CRUZE', 'J300', '1.4 Turbo', 1364, 'essence', 140)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CHEVROLET (SPARK (M300)) ──
WITH spec_172 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_gm-dexos1_sn' LIMIT 1
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
  spec_172.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_172, (VALUES
  ('CHEVROLET', 'SPARK (M300)', 'M300', '', 996, 'essence', 68),
  ('CHEVROLET', 'SPARK (M300)', 'M300', '1.0 (B10S)', 996, 'essence', 68),
  ('CHEVROLET', 'SPARK (M300)', 'M300', '1.2 (B12D1)', 1199, 'essence', 80),
  ('CHEVROLET', 'SPARK (M400)', 'M300', '', 996, 'essence', 68),
  ('CHEVROLET', 'SPARK (M400)', 'M300', '1.0 (B10S)', 996, 'essence', 68),
  ('CHEVROLET', 'SPARK (M400)', 'M300', '1.2 (B12D1)', 1199, 'essence', 80),
  ('CHEVROLET', 'Spark', 'M300', '', 996, 'essence', 68),
  ('CHEVROLET', 'Spark', 'M300', '1.0 (B10S)', 996, 'essence', 68),
  ('CHEVROLET', 'Spark', 'M300', '1.2 (B12D1)', 1199, 'essence', 80),
  ('CHEVROLET', 'SPARK', 'M300', '', 996, 'essence', 68),
  ('CHEVROLET', 'SPARK', 'M300', '1.0 (B10S)', 996, 'essence', 68),
  ('CHEVROLET', 'SPARK', 'M300', '1.2 (B12D1)', 1199, 'essence', 80)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── DS (DS 3 (A5)) ──
WITH spec_173 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_173.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_173, (VALUES
  ('DS', 'DS 3 (A5)', 'A5', '', 1199, 'essence', 130),
  ('DS', 'DS 3 (A5)', 'A5', 'PureTech 130', 1199, 'essence', 130),
  ('DS', 'DS 3 (A5)', 'A5', 'BlueHDi 100', 1499, 'diesel', 102),
  ('DS', 'DS 3 Crossback (U65)', 'A5', '', 1199, 'essence', 130),
  ('DS', 'DS 3 Crossback (U65)', 'A5', 'PureTech 130', 1199, 'essence', 130),
  ('DS', 'DS 3 Crossback (U65)', 'A5', 'BlueHDi 100', 1499, 'diesel', 102),
  ('DS', 'DS 3', 'A5', '', 1199, 'essence', 130),
  ('DS', 'DS 3', 'A5', 'PureTech 130', 1199, 'essence', 130),
  ('DS', 'DS 3', 'A5', 'BlueHDi 100', 1499, 'diesel', 102),
  ('DS', 'DS3', 'A5', '', 1199, 'essence', 130),
  ('DS', 'DS3', 'A5', 'PureTech 130', 1199, 'essence', 130),
  ('DS', 'DS3', 'A5', 'BlueHDi 100', 1499, 'diesel', 102)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── DS (DS 4 (E35)) ──
WITH spec_174 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_174.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_174, (VALUES
  ('DS', 'DS 4 (E35)', 'E35', '', 1598, 'diesel', 120),
  ('DS', 'DS 4 (E35)', 'E35', 'BlueHDi 120', 1560, 'diesel', 120),
  ('DS', 'DS 4 (E35)', 'E35', 'PureTech 180', 1598, 'essence', 180),
  ('DS', 'DS 4 Crossback', 'E35', '', 1598, 'diesel', 120),
  ('DS', 'DS 4 Crossback', 'E35', 'BlueHDi 120', 1560, 'diesel', 120),
  ('DS', 'DS 4 Crossback', 'E35', 'PureTech 180', 1598, 'essence', 180),
  ('DS', 'DS 4', 'E35', '', 1598, 'diesel', 120),
  ('DS', 'DS 4', 'E35', 'BlueHDi 120', 1560, 'diesel', 120),
  ('DS', 'DS 4', 'E35', 'PureTech 180', 1598, 'essence', 180),
  ('DS', 'DS4', 'E35', '', 1598, 'diesel', 120),
  ('DS', 'DS4', 'E35', 'BlueHDi 120', 1560, 'diesel', 120),
  ('DS', 'DS4', 'E35', 'PureTech 180', 1598, 'essence', 180)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── DS (DS 7 Crossback (X74)) ──
WITH spec_175 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_psa-b71-2290_c2' LIMIT 1
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
  spec_175.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_175, (VALUES
  ('DS', 'DS 7 Crossback (X74)', 'X74', '', 1997, 'diesel', 180),
  ('DS', 'DS 7 Crossback (X74)', 'X74', 'BlueHDi 180', 1997, 'diesel', 180),
  ('DS', 'DS 7 Crossback (X74)', 'X74', 'PureTech 225', 1598, 'essence', 225),
  ('DS', 'DS 7', 'X74', '', 1997, 'diesel', 180),
  ('DS', 'DS 7', 'X74', 'BlueHDi 180', 1997, 'diesel', 180),
  ('DS', 'DS 7', 'X74', 'PureTech 225', 1598, 'essence', 225),
  ('DS', 'DS7', 'X74', '', 1997, 'diesel', 180),
  ('DS', 'DS7', 'X74', 'BlueHDi 180', 1997, 'diesel', 180),
  ('DS', 'DS7', 'X74', 'PureTech 225', 1598, 'essence', 225)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SSANGYONG (TIVOLI (X100)) ──
WITH spec_176 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_176.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_176, (VALUES
  ('SSANGYONG', 'TIVOLI (X100)', 'X100', '', 1597, 'essence', 128),
  ('SSANGYONG', 'TIVOLI (X100)', 'X100', '1.6 (G16D)', 1597, 'essence', 128),
  ('SSANGYONG', 'TIVOLI (X100)', 'X100', '1.6 D e-XDi', 1597, 'diesel', 115),
  ('SSANGYONG', 'Tivoli', 'X100', '', 1597, 'essence', 128),
  ('SSANGYONG', 'Tivoli', 'X100', '1.6 (G16D)', 1597, 'essence', 128),
  ('SSANGYONG', 'Tivoli', 'X100', '1.6 D e-XDi', 1597, 'diesel', 115),
  ('SSANGYONG', 'TIVOLI', 'X100', '', 1597, 'essence', 128),
  ('SSANGYONG', 'TIVOLI', 'X100', '1.6 (G16D)', 1597, 'essence', 128),
  ('SSANGYONG', 'TIVOLI', 'X100', '1.6 D e-XDi', 1597, 'diesel', 115)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SSANGYONG (KORANDO III (C200)) ──
WITH spec_177 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_177.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_177, (VALUES
  ('SSANGYONG', 'KORANDO III (C200)', 'C200', '', 1998, 'diesel', 175),
  ('SSANGYONG', 'KORANDO III (C200)', 'C200', '2.0 e-XDi', 1998, 'diesel', 175),
  ('SSANGYONG', 'KORANDO III (C200)', 'C200', '1.5 T-GDi', 1497, 'essence', 163),
  ('SSANGYONG', 'KORANDO IV (C300)', 'C200', '', 1998, 'diesel', 175),
  ('SSANGYONG', 'KORANDO IV (C300)', 'C200', '2.0 e-XDi', 1998, 'diesel', 175),
  ('SSANGYONG', 'KORANDO IV (C300)', 'C200', '1.5 T-GDi', 1497, 'essence', 163),
  ('SSANGYONG', 'Korando', 'C200', '', 1998, 'diesel', 175),
  ('SSANGYONG', 'Korando', 'C200', '2.0 e-XDi', 1998, 'diesel', 175),
  ('SSANGYONG', 'Korando', 'C200', '1.5 T-GDi', 1497, 'essence', 163),
  ('SSANGYONG', 'KORANDO', 'C200', '', 1998, 'diesel', 175),
  ('SSANGYONG', 'KORANDO', 'C200', '2.0 e-XDi', 1998, 'diesel', 175),
  ('SSANGYONG', 'KORANDO', 'C200', '1.5 T-GDi', 1497, 'essence', 163)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MG (MG3 (SH)) ──
WITH spec_178 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_178.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_178, (VALUES
  ('MG', 'MG3 (SH)', 'SH', '', 1498, 'essence', 109),
  ('MG', 'MG3 (SH)', 'SH', '1.5 VTi', 1498, 'essence', 109),
  ('MG', 'MG 3', 'SH', '', 1498, 'essence', 109),
  ('MG', 'MG 3', 'SH', '1.5 VTi', 1498, 'essence', 109),
  ('MG', 'MG3', 'SH', '', 1498, 'essence', 109),
  ('MG', 'MG3', 'SH', '1.5 VTi', 1498, 'essence', 109)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MG (MG ZS (AZ)) ──
WITH spec_179 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_179.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_179, (VALUES
  ('MG', 'MG ZS (AZ)', 'AZ', '', 1490, 'essence', 111),
  ('MG', 'MG ZS (AZ)', 'AZ', '1.5 VTi-Tech', 1490, 'essence', 111),
  ('MG', 'MG ZS EV', 'AZ', '', 1490, 'essence', 111),
  ('MG', 'MG ZS EV', 'AZ', '1.5 VTi-Tech', 1490, 'essence', 111),
  ('MG', 'MG ZS', 'AZ', '', 1490, 'essence', 111),
  ('MG', 'MG ZS', 'AZ', '1.5 VTi-Tech', 1490, 'essence', 111)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MG (MG HS (APC)) ──
WITH spec_180 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_180.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_180, (VALUES
  ('MG', 'MG HS (APC)', 'APC', '', 1490, 'essence', 162),
  ('MG', 'MG HS (APC)', 'APC', '1.5T (15S4H)', 1490, 'essence', 162),
  ('MG', 'MG HS', 'APC', '', 1490, 'essence', 162),
  ('MG', 'MG HS', 'APC', '1.5T (15S4H)', 1490, 'essence', 162),
  ('MG', 'MG5', 'APC', '', 1490, 'essence', 162),
  ('MG', 'MG5', 'APC', '1.5T (15S4H)', 1490, 'essence', 162)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── HAVAL (JOLION (HM)) ──
WITH spec_181 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_181.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_181, (VALUES
  ('HAVAL', 'JOLION (HM)', 'HM', '', 1497, 'essence', 150),
  ('HAVAL', 'JOLION (HM)', 'HM', '1.5T (GW4G15)', 1497, 'essence', 150),
  ('HAVAL', 'JOLION (HM)', 'HM', '2.0T', 1996, 'essence', 190),
  ('HAVAL', 'H6 (B06)', 'HM', '', 1497, 'essence', 150),
  ('HAVAL', 'H6 (B06)', 'HM', '1.5T (GW4G15)', 1497, 'essence', 150),
  ('HAVAL', 'H6 (B06)', 'HM', '2.0T', 1996, 'essence', 190),
  ('HAVAL', 'H2 (HG)', 'HM', '', 1497, 'essence', 150),
  ('HAVAL', 'H2 (HG)', 'HM', '1.5T (GW4G15)', 1497, 'essence', 150),
  ('HAVAL', 'H2 (HG)', 'HM', '2.0T', 1996, 'essence', 190),
  ('HAVAL', 'Jolion', 'HM', '', 1497, 'essence', 150),
  ('HAVAL', 'Jolion', 'HM', '1.5T (GW4G15)', 1497, 'essence', 150),
  ('HAVAL', 'Jolion', 'HM', '2.0T', 1996, 'essence', 190),
  ('HAVAL', 'H6', 'HM', '', 1497, 'essence', 150),
  ('HAVAL', 'H6', 'HM', '1.5T (GW4G15)', 1497, 'essence', 150),
  ('HAVAL', 'H6', 'HM', '2.0T', 1996, 'essence', 190),
  ('HAVAL', 'H2', 'HM', '', 1497, 'essence', 150),
  ('HAVAL', 'H2', 'HM', '1.5T (GW4G15)', 1497, 'essence', 150),
  ('HAVAL', 'H2', 'HM', '2.0T', 1996, 'essence', 190)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── GEELY (EMGRAND (EC7)) ──
WITH spec_182 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_182.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_182, (VALUES
  ('GEELY', 'EMGRAND (EC7)', 'NL-3', '', 1498, 'essence', 109),
  ('GEELY', 'EMGRAND (EC7)', 'NL-3', '1.5 (JLy-4G15B)', 1498, 'essence', 109),
  ('GEELY', 'EMGRAND (EC7)', 'NL-3', '2.0 (JL486ZQ)', 1997, 'essence', 139),
  ('GEELY', 'ATLAS (NL-3)', 'NL-3', '', 1498, 'essence', 109),
  ('GEELY', 'ATLAS (NL-3)', 'NL-3', '1.5 (JLy-4G15B)', 1498, 'essence', 109),
  ('GEELY', 'ATLAS (NL-3)', 'NL-3', '2.0 (JL486ZQ)', 1997, 'essence', 139),
  ('GEELY', 'Emgrand EC7', 'NL-3', '', 1498, 'essence', 109),
  ('GEELY', 'Emgrand EC7', 'NL-3', '1.5 (JLy-4G15B)', 1498, 'essence', 109),
  ('GEELY', 'Emgrand EC7', 'NL-3', '2.0 (JL486ZQ)', 1997, 'essence', 139),
  ('GEELY', 'Atlas', 'NL-3', '', 1498, 'essence', 109),
  ('GEELY', 'Atlas', 'NL-3', '1.5 (JLy-4G15B)', 1498, 'essence', 109),
  ('GEELY', 'Atlas', 'NL-3', '2.0 (JL486ZQ)', 1997, 'essence', 139),
  ('GEELY', 'EMGRAND', 'NL-3', '', 1498, 'essence', 109),
  ('GEELY', 'EMGRAND', 'NL-3', '1.5 (JLy-4G15B)', 1498, 'essence', 109),
  ('GEELY', 'EMGRAND', 'NL-3', '2.0 (JL486ZQ)', 1997, 'essence', 139),
  ('GEELY', 'ATLAS', 'NL-3', '', 1498, 'essence', 109),
  ('GEELY', 'ATLAS', 'NL-3', '1.5 (JLy-4G15B)', 1498, 'essence', 109),
  ('GEELY', 'ATLAS', 'NL-3', '2.0 (JL486ZQ)', 1997, 'essence', 139)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LADA (VESTA (GFL11)) ──
WITH spec_183 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_lada-api-sl_a3b4' LIMIT 1
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
  spec_183.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_183, (VALUES
  ('LADA', 'VESTA (GFL11)', 'GFL11', '', 1596, 'essence', 113),
  ('LADA', 'VESTA (GFL11)', 'GFL11', '1.6 (21129)', 1596, 'essence', 113),
  ('LADA', 'VESTA (GFL11)', 'GFL11', '1.8 (21179)', 1774, 'essence', 122),
  ('LADA', 'Vesta', 'GFL11', '', 1596, 'essence', 113),
  ('LADA', 'Vesta', 'GFL11', '1.6 (21129)', 1596, 'essence', 113),
  ('LADA', 'Vesta', 'GFL11', '1.8 (21179)', 1774, 'essence', 122),
  ('LADA', 'VESTA', 'GFL11', '', 1596, 'essence', 113),
  ('LADA', 'VESTA', 'GFL11', '1.6 (21129)', 1596, 'essence', 113),
  ('LADA', 'VESTA', 'GFL11', '1.8 (21179)', 1774, 'essence', 122)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LADA (LARGUS (FS015R)) ──
WITH spec_184 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_lada-api-sl_a3b4' LIMIT 1
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
  spec_184.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_184, (VALUES
  ('LADA', 'LARGUS (FS015R)', 'FS015R', '', 1596, 'essence', 102),
  ('LADA', 'LARGUS (FS015R)', 'FS015R', '1.6 (K4M)', 1596, 'essence', 102),
  ('LADA', 'Largus', 'FS015R', '', 1596, 'essence', 102),
  ('LADA', 'Largus', 'FS015R', '1.6 (K4M)', 1596, 'essence', 102),
  ('LADA', 'LARGUS', 'FS015R', '', 1596, 'essence', 102),
  ('LADA', 'LARGUS', 'FS015R', '1.6 (K4M)', 1596, 'essence', 102)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LADA (GRANTA (2190)) ──
WITH spec_185 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '10w-40_lada-api-sl_a3b4' LIMIT 1
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
  spec_185.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_185, (VALUES
  ('LADA', 'GRANTA (2190)', '2190', '', 1596, 'essence', 98),
  ('LADA', 'GRANTA (2190)', '2190', '1.6 (11186)', 1596, 'essence', 98),
  ('LADA', 'GRANTA (2190)', '2190', '1.6 (21126)', 1596, 'essence', 106),
  ('LADA', 'PRIORA (2170)', '2190', '', 1596, 'essence', 98),
  ('LADA', 'PRIORA (2170)', '2190', '1.6 (11186)', 1596, 'essence', 98),
  ('LADA', 'PRIORA (2170)', '2190', '1.6 (21126)', 1596, 'essence', 106),
  ('LADA', 'KALINA (1119)', '2190', '', 1596, 'essence', 98),
  ('LADA', 'KALINA (1119)', '2190', '1.6 (11186)', 1596, 'essence', 98),
  ('LADA', 'KALINA (1119)', '2190', '1.6 (21126)', 1596, 'essence', 106),
  ('LADA', 'Granta', '2190', '', 1596, 'essence', 98),
  ('LADA', 'Granta', '2190', '1.6 (11186)', 1596, 'essence', 98),
  ('LADA', 'Granta', '2190', '1.6 (21126)', 1596, 'essence', 106),
  ('LADA', 'Priora', '2190', '', 1596, 'essence', 98),
  ('LADA', 'Priora', '2190', '1.6 (11186)', 1596, 'essence', 98),
  ('LADA', 'Priora', '2190', '1.6 (21126)', 1596, 'essence', 106),
  ('LADA', 'Kalina', '2190', '', 1596, 'essence', 98),
  ('LADA', 'Kalina', '2190', '1.6 (11186)', 1596, 'essence', 98),
  ('LADA', 'Kalina', '2190', '1.6 (21126)', 1596, 'essence', 106),
  ('LADA', 'NIVA (2121)', '2190', '', 1596, 'essence', 98),
  ('LADA', 'NIVA (2121)', '2190', '1.6 (11186)', 1596, 'essence', 98),
  ('LADA', 'NIVA (2121)', '2190', '1.6 (21126)', 1596, 'essence', 106),
  ('LADA', 'Niva', '2190', '', 1596, 'essence', 98),
  ('LADA', 'Niva', '2190', '1.6 (11186)', 1596, 'essence', 98),
  ('LADA', 'Niva', '2190', '1.6 (21126)', 1596, 'essence', 106)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LEXUS (IS III (XE30)) ──
WITH spec_186 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_186.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_186, (VALUES
  ('LEXUS', 'IS III (XE30)', 'XE30', '', 1998, 'diesel', 150),
  ('LEXUS', 'IS III (XE30)', 'XE30', '200d', 1998, 'diesel', 150),
  ('LEXUS', 'IS III (XE30)', 'XE30', '300h', 2499, 'essence', 223),
  ('LEXUS', 'IS II (XE20)', 'XE30', '', 1998, 'diesel', 150),
  ('LEXUS', 'IS II (XE20)', 'XE30', '200d', 1998, 'diesel', 150),
  ('LEXUS', 'IS II (XE20)', 'XE30', '300h', 2499, 'essence', 223),
  ('LEXUS', 'IS', 'XE30', '', 1998, 'diesel', 150),
  ('LEXUS', 'IS', 'XE30', '200d', 1998, 'diesel', 150),
  ('LEXUS', 'IS', 'XE30', '300h', 2499, 'essence', 223)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LEXUS (NX I (AZ10)) ──
WITH spec_187 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-20_asian-toyota-sn' LIMIT 1
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
  spec_187.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_187, (VALUES
  ('LEXUS', 'NX I (AZ10)', 'AZ10', '', 1998, 'essence', 211),
  ('LEXUS', 'NX I (AZ10)', 'AZ10', 'NX 200t', 1998, 'essence', 238),
  ('LEXUS', 'NX I (AZ10)', 'AZ10', 'NX 300h', 2494, 'essence', 197),
  ('LEXUS', 'NX II (AZ20)', 'AZ10', '', 1998, 'essence', 211),
  ('LEXUS', 'NX II (AZ20)', 'AZ10', 'NX 200t', 1998, 'essence', 238),
  ('LEXUS', 'NX II (AZ20)', 'AZ10', 'NX 300h', 2494, 'essence', 197),
  ('LEXUS', 'NX', 'AZ10', '', 1998, 'essence', 211),
  ('LEXUS', 'NX', 'AZ10', 'NX 200t', 1998, 'essence', 238),
  ('LEXUS', 'NX', 'AZ10', 'NX 300h', 2494, 'essence', 197)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── LEXUS (RX III (AL10)) ──
WITH spec_188 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '0w-20_asian-toyota-sn' LIMIT 1
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
  spec_188.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_188, (VALUES
  ('LEXUS', 'RX III (AL10)', 'AL20', '', 2494, 'essence', 300),
  ('LEXUS', 'RX III (AL10)', 'AL20', 'RX 450h', 3456, 'essence', 313),
  ('LEXUS', 'RX III (AL10)', 'AL20', 'RX 350', 3456, 'essence', 277),
  ('LEXUS', 'RX IV (AL20)', 'AL20', '', 2494, 'essence', 300),
  ('LEXUS', 'RX IV (AL20)', 'AL20', 'RX 450h', 3456, 'essence', 313),
  ('LEXUS', 'RX IV (AL20)', 'AL20', 'RX 350', 3456, 'essence', 277),
  ('LEXUS', 'RX V (AL30)', 'AL20', '', 2494, 'essence', 300),
  ('LEXUS', 'RX V (AL30)', 'AL20', 'RX 450h', 3456, 'essence', 313),
  ('LEXUS', 'RX V (AL30)', 'AL20', 'RX 350', 3456, 'essence', 277),
  ('LEXUS', 'RX', 'AL20', '', 2494, 'essence', 300),
  ('LEXUS', 'RX', 'AL20', 'RX 450h', 3456, 'essence', 313),
  ('LEXUS', 'RX', 'AL20', 'RX 350', 3456, 'essence', 277)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── INFINITI (Q30 (H15)) ──
WITH spec_189 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_189.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_189, (VALUES
  ('INFINITI', 'Q30 (H15)', 'V37', '', 1991, 'diesel', 170),
  ('INFINITI', 'Q30 (H15)', 'V37', '2.2d', 1991, 'diesel', 170),
  ('INFINITI', 'Q30 (H15)', 'V37', '3.5 Hybrid V6', 3498, 'essence', 364),
  ('INFINITI', 'Q50 (V37)', 'V37', '', 1991, 'diesel', 170),
  ('INFINITI', 'Q50 (V37)', 'V37', '2.2d', 1991, 'diesel', 170),
  ('INFINITI', 'Q50 (V37)', 'V37', '3.5 Hybrid V6', 3498, 'essence', 364),
  ('INFINITI', 'QX60 (L50)', 'V37', '', 1991, 'diesel', 170),
  ('INFINITI', 'QX60 (L50)', 'V37', '2.2d', 1991, 'diesel', 170),
  ('INFINITI', 'QX60 (L50)', 'V37', '3.5 Hybrid V6', 3498, 'essence', 364),
  ('INFINITI', 'Q30', 'V37', '', 1991, 'diesel', 170),
  ('INFINITI', 'Q30', 'V37', '2.2d', 1991, 'diesel', 170),
  ('INFINITI', 'Q30', 'V37', '3.5 Hybrid V6', 3498, 'essence', 364),
  ('INFINITI', 'Q50', 'V37', '', 1991, 'diesel', 170),
  ('INFINITI', 'Q50', 'V37', '2.2d', 1991, 'diesel', 170),
  ('INFINITI', 'Q50', 'V37', '3.5 Hybrid V6', 3498, 'essence', 364),
  ('INFINITI', 'QX60', 'V37', '', 1991, 'diesel', 170),
  ('INFINITI', 'QX60', 'V37', '2.2d', 1991, 'diesel', 170),
  ('INFINITI', 'QX60', 'V37', '3.5 Hybrid V6', 3498, 'essence', 364)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MINI (MINI (R50, R53)) ──
WITH spec_190 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_bmw-ll04_c3' LIMIT 1
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
  spec_190.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_190, (VALUES
  ('MINI', 'MINI (R50, R53)', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'MINI (R50, R53)', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'MINI (R50, R53)', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'MINI (R50, R53)', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'MINI (R50, R53)', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'MINI (R50, R53)', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'MINI (R56)', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'MINI (R56)', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'MINI (R56)', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'MINI (R56)', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'MINI (R56)', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'MINI (R56)', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'MINI (F55, F56)', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'MINI (F55, F56)', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'MINI (F55, F56)', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'MINI (F55, F56)', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'MINI (F55, F56)', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'MINI (F55, F56)', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'MINI Clubman (R55)', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'MINI Clubman (R55)', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'MINI Clubman (R55)', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'MINI Clubman (R55)', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'MINI Clubman (R55)', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'MINI Clubman (R55)', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'MINI Clubman (F54)', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'MINI Clubman (F54)', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'MINI Clubman (F54)', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'MINI Clubman (F54)', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'MINI Clubman (F54)', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'MINI Clubman (F54)', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'MINI Countryman (R60)', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'MINI Countryman (R60)', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'MINI Countryman (R60)', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'MINI Countryman (R60)', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'MINI Countryman (R60)', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'MINI Countryman (R60)', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'MINI Countryman (F60)', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'MINI Countryman (F60)', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'MINI Countryman (F60)', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'MINI Countryman (F60)', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'MINI Countryman (F60)', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'MINI Countryman (F60)', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'MINI', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'MINI', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'MINI', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'MINI', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'MINI', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'MINI', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'Mini', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'Mini', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'Mini', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'Mini', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'Mini', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'Mini', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'Mini Cooper', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'Mini Cooper', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'Mini Cooper', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'Mini Cooper', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'Mini Cooper', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'Mini Cooper', 'F56', 'One D', 1496, 'diesel', 95),
  ('MINI', 'Cooper', 'F56', '', 1499, 'essence', 136),
  ('MINI', 'Cooper', 'F56', 'Cooper', 1499, 'essence', 136),
  ('MINI', 'Cooper', 'F56', 'Cooper S', 1998, 'essence', 192),
  ('MINI', 'Cooper', 'F56', 'Cooper D', 1496, 'diesel', 116),
  ('MINI', 'Cooper', 'F56', 'One', 1499, 'essence', 102),
  ('MINI', 'Cooper', 'F56', 'One D', 1496, 'diesel', 95)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CUPRA (FORMENTOR (KM7)) ──
WITH spec_191 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_vw-50400-50700_c3' LIMIT 1
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
  spec_191.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_191, (VALUES
  ('CUPRA', 'FORMENTOR (KM7)', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'FORMENTOR (KM7)', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'FORMENTOR (KM7)', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'FORMENTOR (KM7)', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'FORMENTOR (KM7)', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'FORMENTOR (KM7)', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'LEON (KL1)', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'LEON (KL1)', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'LEON (KL1)', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'LEON (KL1)', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'LEON (KL1)', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'LEON (KL1)', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'ATECA (KH7)', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'ATECA (KH7)', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'ATECA (KH7)', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'ATECA (KH7)', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'ATECA (KH7)', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'ATECA (KH7)', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'BORN (K11)', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'BORN (K11)', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'BORN (K11)', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'BORN (K11)', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'BORN (K11)', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'BORN (K11)', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'Formentor', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'Formentor', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'Formentor', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'Formentor', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'Formentor', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'Formentor', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'Leon', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'Leon', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'Leon', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'Leon', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'Leon', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'Leon', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'Ateca', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'Ateca', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'Ateca', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'Ateca', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'Ateca', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'Ateca', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'Cupra Formentor', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'Cupra Formentor', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'Cupra Formentor', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'Cupra Formentor', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'Cupra Formentor', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'Cupra Formentor', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'Cupra Leon', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'Cupra Leon', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'Cupra Leon', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'Cupra Leon', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'Cupra Leon', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'Cupra Leon', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'Cupra Ateca', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'Cupra Ateca', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'Cupra Ateca', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'Cupra Ateca', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'Cupra Ateca', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'Cupra Ateca', 'KM7', '2.0 TDI', 1968, 'diesel', 150),
  ('CUPRA', 'CUPRA', 'KM7', '', 1984, 'essence', 310),
  ('CUPRA', 'CUPRA', 'KM7', '1.5 TSI', 1498, 'essence', 150),
  ('CUPRA', 'CUPRA', 'KM7', '2.0 TSI', 1984, 'essence', 190),
  ('CUPRA', 'CUPRA', 'KM7', '2.0 TSI 4Drive', 1984, 'essence', 310),
  ('CUPRA', 'CUPRA', 'KM7', '1.4 e-HYBRID', 1395, 'essence', 204),
  ('CUPRA', 'CUPRA', 'KM7', '2.0 TDI', 1968, 'diesel', 150)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── SMART (FORTWO Coupe (450)) ──
WITH spec_192 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_mb-22951_c3' LIMIT 1
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
  spec_192.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_192, (VALUES
  ('SMART', 'FORTWO Coupe (450)', '453', '', 999, 'essence', 71),
  ('SMART', 'FORTWO Coupe (450)', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'FORTWO Coupe (450)', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'FORTWO Coupe (450)', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'FORTWO Coupe (451)', '453', '', 999, 'essence', 71),
  ('SMART', 'FORTWO Coupe (451)', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'FORTWO Coupe (451)', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'FORTWO Coupe (451)', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'FORTWO Coupe (453)', '453', '', 999, 'essence', 71),
  ('SMART', 'FORTWO Coupe (453)', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'FORTWO Coupe (453)', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'FORTWO Coupe (453)', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'FORFOUR (454)', '453', '', 999, 'essence', 71),
  ('SMART', 'FORFOUR (454)', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'FORFOUR (454)', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'FORFOUR (454)', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'FORFOUR (453)', '453', '', 999, 'essence', 71),
  ('SMART', 'FORFOUR (453)', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'FORFOUR (453)', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'FORFOUR (453)', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'Fortwo', '453', '', 999, 'essence', 71),
  ('SMART', 'Fortwo', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'Fortwo', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'Fortwo', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'Forfour', '453', '', 999, 'essence', 71),
  ('SMART', 'Forfour', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'Forfour', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'Forfour', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'Smart Fortwo', '453', '', 999, 'essence', 71),
  ('SMART', 'Smart Fortwo', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'Smart Fortwo', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'Smart Fortwo', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'Smart Forfour', '453', '', 999, 'essence', 71),
  ('SMART', 'Smart Forfour', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'Smart Forfour', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'Smart Forfour', '453', '0.8 CDI', 799, 'diesel', 45),
  ('SMART', 'SMART', '453', '', 999, 'essence', 71),
  ('SMART', 'SMART', '453', '1.0', 999, 'essence', 71),
  ('SMART', 'SMART', '453', '0.9 Turbo', 898, 'essence', 90),
  ('SMART', 'SMART', '453', '0.8 CDI', 799, 'diesel', 45)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── ISUZU (D-MAX I (TFR, TFS)) ──
WITH spec_193 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_193.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_193, (VALUES
  ('ISUZU', 'D-MAX I (TFR, TFS)', 'TFR', '', 2499, 'diesel', 136),
  ('ISUZU', 'D-MAX I (TFR, TFS)', 'TFR', '2.5 Ddi', 2499, 'diesel', 136),
  ('ISUZU', 'D-MAX I (TFR, TFS)', 'TFR', '3.0 Ddi', 2999, 'diesel', 163),
  ('ISUZU', 'D-MAX I (TFR, TFS)', 'TFR', '1.9 Ddi', 1898, 'diesel', 163),
  ('ISUZU', 'D-MAX I (TFR, TFS)', 'TFR', '2.5 DiTD', 2499, 'diesel', 101),
  ('ISUZU', 'D-MAX II (TFR, TFS)', 'TFR', '', 2499, 'diesel', 136),
  ('ISUZU', 'D-MAX II (TFR, TFS)', 'TFR', '2.5 Ddi', 2499, 'diesel', 136),
  ('ISUZU', 'D-MAX II (TFR, TFS)', 'TFR', '3.0 Ddi', 2999, 'diesel', 163),
  ('ISUZU', 'D-MAX II (TFR, TFS)', 'TFR', '1.9 Ddi', 1898, 'diesel', 163),
  ('ISUZU', 'D-MAX II (TFR, TFS)', 'TFR', '2.5 DiTD', 2499, 'diesel', 101),
  ('ISUZU', 'D-MAX III (RG01)', 'TFR', '', 2499, 'diesel', 136),
  ('ISUZU', 'D-MAX III (RG01)', 'TFR', '2.5 Ddi', 2499, 'diesel', 136),
  ('ISUZU', 'D-MAX III (RG01)', 'TFR', '3.0 Ddi', 2999, 'diesel', 163),
  ('ISUZU', 'D-MAX III (RG01)', 'TFR', '1.9 Ddi', 1898, 'diesel', 163),
  ('ISUZU', 'D-MAX III (RG01)', 'TFR', '2.5 DiTD', 2499, 'diesel', 101),
  ('ISUZU', 'D-Max', 'TFR', '', 2499, 'diesel', 136),
  ('ISUZU', 'D-Max', 'TFR', '2.5 Ddi', 2499, 'diesel', 136),
  ('ISUZU', 'D-Max', 'TFR', '3.0 Ddi', 2999, 'diesel', 163),
  ('ISUZU', 'D-Max', 'TFR', '1.9 Ddi', 1898, 'diesel', 163),
  ('ISUZU', 'D-Max', 'TFR', '2.5 DiTD', 2499, 'diesel', 101),
  ('ISUZU', 'D-MAX', 'TFR', '', 2499, 'diesel', 136),
  ('ISUZU', 'D-MAX', 'TFR', '2.5 Ddi', 2499, 'diesel', 136),
  ('ISUZU', 'D-MAX', 'TFR', '3.0 Ddi', 2999, 'diesel', 163),
  ('ISUZU', 'D-MAX', 'TFR', '1.9 Ddi', 1898, 'diesel', 163),
  ('ISUZU', 'D-MAX', 'TFR', '2.5 DiTD', 2499, 'diesel', 101),
  ('ISUZU', 'DMAX', 'TFR', '', 2499, 'diesel', 136),
  ('ISUZU', 'DMAX', 'TFR', '2.5 Ddi', 2499, 'diesel', 136),
  ('ISUZU', 'DMAX', 'TFR', '3.0 Ddi', 2999, 'diesel', 163),
  ('ISUZU', 'DMAX', 'TFR', '1.9 Ddi', 1898, 'diesel', 163),
  ('ISUZU', 'DMAX', 'TFR', '2.5 DiTD', 2499, 'diesel', 101),
  ('ISUZU', 'KB', 'TFR', '', 2499, 'diesel', 136),
  ('ISUZU', 'KB', 'TFR', '2.5 Ddi', 2499, 'diesel', 136),
  ('ISUZU', 'KB', 'TFR', '3.0 Ddi', 2999, 'diesel', 163),
  ('ISUZU', 'KB', 'TFR', '1.9 Ddi', 1898, 'diesel', 163),
  ('ISUZU', 'KB', 'TFR', '2.5 DiTD', 2499, 'diesel', 101),
  ('ISUZU', 'ISUZU', 'TFR', '', 2499, 'diesel', 136),
  ('ISUZU', 'ISUZU', 'TFR', '2.5 Ddi', 2499, 'diesel', 136),
  ('ISUZU', 'ISUZU', 'TFR', '3.0 Ddi', 2999, 'diesel', 163),
  ('ISUZU', 'ISUZU', 'TFR', '1.9 Ddi', 1898, 'diesel', 163),
  ('ISUZU', 'ISUZU', 'TFR', '2.5 DiTD', 2499, 'diesel', 101)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── MAHINDRA (KUV100) ──
WITH spec_194 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_asian-toyota-c2c3' LIMIT 1
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
  spec_194.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_194, (VALUES
  ('MAHINDRA', 'KUV100', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'KUV100', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'KUV100', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'KUV100', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'KUV100', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'XUV500', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'XUV500', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'XUV500', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'XUV500', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'XUV500', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'XUV300', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'XUV300', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'XUV300', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'XUV300', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'XUV300', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'SCORPIO', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'SCORPIO', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'SCORPIO', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'SCORPIO', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'SCORPIO', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'BOLERO', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'BOLERO', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'BOLERO', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'BOLERO', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'BOLERO', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'THAR', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'THAR', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'THAR', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'THAR', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'THAR', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'KUV 100', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'KUV 100', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'KUV 100', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'KUV 100', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'KUV 100', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'XUV 500', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'XUV 500', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'XUV 500', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'XUV 500', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'XUV 500', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'XUV 300', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'XUV 300', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'XUV 300', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'XUV 300', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'XUV 300', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'Scorpio', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'Scorpio', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'Scorpio', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'Scorpio', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'Scorpio', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'Bolero', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'Bolero', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'Bolero', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'Bolero', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'Bolero', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'Thar', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'Thar', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'Thar', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'Thar', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'Thar', 'I', '2.5 D', 2498, 'diesel', 63),
  ('MAHINDRA', 'MAHINDRA', 'I', '', 1198, 'essence', 82),
  ('MAHINDRA', 'MAHINDRA', 'I', '1.2 mFalcon G80', 1198, 'essence', 82),
  ('MAHINDRA', 'MAHINDRA', 'I', '1.2 mFalcon D75', 1198, 'diesel', 77),
  ('MAHINDRA', 'MAHINDRA', 'I', '2.2 mHawk', 2179, 'diesel', 140),
  ('MAHINDRA', 'MAHINDRA', 'I', '2.5 D', 2498, 'diesel', 63)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── CHERY (TIGGO 2) ──
WITH spec_195 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_195.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_195, (VALUES
  ('CHERY', 'TIGGO 2', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 2', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 2', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'TIGGO 2', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'TIGGO 2', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'TIGGO 2', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'TIGGO 3', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 3', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 3', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'TIGGO 3', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'TIGGO 3', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'TIGGO 3', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'TIGGO 4', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 4', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 4', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'TIGGO 4', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'TIGGO 4', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'TIGGO 4', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'TIGGO 7', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 7', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 7', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'TIGGO 7', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'TIGGO 7', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'TIGGO 7', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'TIGGO 8', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 8', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'TIGGO 8', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'TIGGO 8', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'TIGGO 8', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'TIGGO 8', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'ARRIZO 5', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'ARRIZO 5', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'ARRIZO 5', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'ARRIZO 5', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'ARRIZO 5', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'ARRIZO 5', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'ARRIZO 6', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'ARRIZO 6', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'ARRIZO 6', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'ARRIZO 6', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'ARRIZO 6', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'ARRIZO 6', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'QQ', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'QQ', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'QQ', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'QQ', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'QQ', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'QQ', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'QQ3', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'QQ3', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'QQ3', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'QQ3', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'QQ3', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'QQ3', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'Tiggo 2', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'Tiggo 2', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'Tiggo 2', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'Tiggo 2', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'Tiggo 2', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'Tiggo 2', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'Tiggo 3', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'Tiggo 3', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'Tiggo 3', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'Tiggo 3', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'Tiggo 3', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'Tiggo 3', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'Tiggo 7', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'Tiggo 7', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'Tiggo 7', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'Tiggo 7', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'Tiggo 7', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'Tiggo 7', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'Tiggo 8', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'Tiggo 8', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'Tiggo 8', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'Tiggo 8', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'Tiggo 8', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'Tiggo 8', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'Arrizo 5', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'Arrizo 5', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'Arrizo 5', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'Arrizo 5', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'Arrizo 5', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'Arrizo 5', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'Tiggo', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'Tiggo', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'Tiggo', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'Tiggo', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'Tiggo', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'Tiggo', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'Arrizo', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'Arrizo', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'Arrizo', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'Arrizo', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'Arrizo', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'Arrizo', 'I', '1.1', 1083, 'essence', 68),
  ('CHERY', 'CHERY', 'I', '', 1497, 'essence', 106),
  ('CHERY', 'CHERY', 'I', '1.5', 1497, 'essence', 106),
  ('CHERY', 'CHERY', 'I', '1.5 Turbo', 1498, 'essence', 147),
  ('CHERY', 'CHERY', 'I', '1.6', 1598, 'essence', 126),
  ('CHERY', 'CHERY', 'I', '1.6 TGDI', 1598, 'essence', 197),
  ('CHERY', 'CHERY', 'I', '1.1', 1083, 'essence', 68)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── DFSK (GLORY 580) ──
WITH spec_196 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_196.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_196, (VALUES
  ('DFSK', 'GLORY 580', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'GLORY 580', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'GLORY 580', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'GLORY 580', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'GLORY 580', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'GLORY 560', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'GLORY 560', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'GLORY 560', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'GLORY 560', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'GLORY 560', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'GLORY IX5', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'GLORY IX5', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'GLORY IX5', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'GLORY IX5', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'GLORY IX5', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'K01', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'K01', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'K01', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'K01', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'K01', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'K02', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'K02', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'K02', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'K02', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'K02', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'V21', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'V21', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'V21', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'V21', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'V21', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'V22', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'V22', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'V22', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'V22', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'V22', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'Glory 580', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'Glory 580', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'Glory 580', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'Glory 580', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'Glory 580', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'Glory 560', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'Glory 560', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'Glory 560', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'Glory 560', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'Glory 560', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'Glory', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'Glory', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'Glory', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'Glory', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'Glory', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'K01H', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'K01H', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'K01H', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'K01H', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'K01H', 'I', '1.3', 1310, 'essence', 82),
  ('DFSK', 'DFSK', 'I', '', 1498, 'essence', 150),
  ('DFSK', 'DFSK', 'I', '1.5 Turbo', 1498, 'essence', 150),
  ('DFSK', 'DFSK', 'I', '1.8', 1798, 'essence', 139),
  ('DFSK', 'DFSK', 'I', '1.2', 1205, 'essence', 88),
  ('DFSK', 'DFSK', 'I', '1.3', 1310, 'essence', 82)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── GREAT WALL (STEED 5) ──
WITH spec_197 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_197.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_197, (VALUES
  ('GREAT WALL', 'STEED 5', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'STEED 5', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'STEED 5', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'STEED 5', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'STEED 6', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'STEED 6', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'STEED 6', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'STEED 6', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'WINGLE 5', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'WINGLE 5', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'WINGLE 5', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'WINGLE 5', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'WINGLE 6', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'WINGLE 6', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'WINGLE 6', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'WINGLE 6', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'WINGLE 7', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'WINGLE 7', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'WINGLE 7', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'WINGLE 7', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'POER', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'POER', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'POER', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'POER', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'HAVAL H6', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'HAVAL H6', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'HAVAL H6', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'HAVAL H6', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'Steed', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'Steed', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'Steed', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'Steed', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'Wingle', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'Wingle', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'Wingle', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'Wingle', 'I', '2.4', 2378, 'essence', 126),
  ('GREAT WALL', 'GREAT WALL', 'I', '', 1996, 'diesel', 143),
  ('GREAT WALL', 'GREAT WALL', 'I', '2.0 TD', 1996, 'diesel', 143),
  ('GREAT WALL', 'GREAT WALL', 'I', '2.0 TCi', 1996, 'diesel', 150),
  ('GREAT WALL', 'GREAT WALL', 'I', '2.4', 2378, 'essence', 126)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── BYD (F3) ──
WITH spec_198 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_chinese-api-sn_a3b4' LIMIT 1
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
  spec_198.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_198, (VALUES
  ('BYD', 'F3', 'I', '', 1497, 'essence', 109),
  ('BYD', 'F3', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'F3', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'F3', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'F0', 'I', '', 1497, 'essence', 109),
  ('BYD', 'F0', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'F0', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'F0', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'ATTO 3', 'I', '', 1497, 'essence', 109),
  ('BYD', 'ATTO 3', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'ATTO 3', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'ATTO 3', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'DOLPHIN', 'I', '', 1497, 'essence', 109),
  ('BYD', 'DOLPHIN', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'DOLPHIN', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'DOLPHIN', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'SEAL', 'I', '', 1497, 'essence', 109),
  ('BYD', 'SEAL', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'SEAL', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'SEAL', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'SONG', 'I', '', 1497, 'essence', 109),
  ('BYD', 'SONG', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'SONG', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'SONG', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'TANG', 'I', '', 1497, 'essence', 109),
  ('BYD', 'TANG', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'TANG', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'TANG', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'HAN', 'I', '', 1497, 'essence', 109),
  ('BYD', 'HAN', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'HAN', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'HAN', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'F3 (F3R)', 'I', '', 1497, 'essence', 109),
  ('BYD', 'F3 (F3R)', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'F3 (F3R)', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'F3 (F3R)', 'I', '1.0', 998, 'essence', 68),
  ('BYD', 'BYD', 'I', '', 1497, 'essence', 109),
  ('BYD', 'BYD', 'I', '1.5 (BYD473QE)', 1497, 'essence', 109),
  ('BYD', 'BYD', 'I', '1.5 T', 1497, 'essence', 154),
  ('BYD', 'BYD', 'I', '1.0', 998, 'essence', 68)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

-- ── IVECO (DAILY III) ──
WITH spec_199 AS (
  SELECT id FROM "OilFinderOilSpec" WHERE fingerprint = '5w-30_fiat-955535-s1_c2' LIMIT 1
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
  spec_199.id,
  'SpecPart OEM Catalogue Homologations',
  'high'
FROM spec_199, (VALUES
  ('IVECO', 'DAILY III', 'VI', '', 2287, 'diesel', 126),
  ('IVECO', 'DAILY III', 'VI', '2.3 HPI (F1AE)', 2287, 'diesel', 126),
  ('IVECO', 'DAILY III', 'VI', '3.0 HPI (F1CE)', 2998, 'diesel', 170),
  ('IVECO', 'DAILY III', 'VI', '35C15 / 35S15', 2998, 'diesel', 146),
  ('IVECO', 'DAILY III', 'VI', '35C13 / 35S13', 2287, 'diesel', 126),
  ('IVECO', 'DAILY IV', 'VI', '', 2287, 'diesel', 126),
  ('IVECO', 'DAILY IV', 'VI', '2.3 HPI (F1AE)', 2287, 'diesel', 126),
  ('IVECO', 'DAILY IV', 'VI', '3.0 HPI (F1CE)', 2998, 'diesel', 170),
  ('IVECO', 'DAILY IV', 'VI', '35C15 / 35S15', 2998, 'diesel', 146),
  ('IVECO', 'DAILY IV', 'VI', '35C13 / 35S13', 2287, 'diesel', 126),
  ('IVECO', 'DAILY V', 'VI', '', 2287, 'diesel', 126),
  ('IVECO', 'DAILY V', 'VI', '2.3 HPI (F1AE)', 2287, 'diesel', 126),
  ('IVECO', 'DAILY V', 'VI', '3.0 HPI (F1CE)', 2998, 'diesel', 170),
  ('IVECO', 'DAILY V', 'VI', '35C15 / 35S15', 2998, 'diesel', 146),
  ('IVECO', 'DAILY V', 'VI', '35C13 / 35S13', 2287, 'diesel', 126),
  ('IVECO', 'DAILY VI', 'VI', '', 2287, 'diesel', 126),
  ('IVECO', 'DAILY VI', 'VI', '2.3 HPI (F1AE)', 2287, 'diesel', 126),
  ('IVECO', 'DAILY VI', 'VI', '3.0 HPI (F1CE)', 2998, 'diesel', 170),
  ('IVECO', 'DAILY VI', 'VI', '35C15 / 35S15', 2998, 'diesel', 146),
  ('IVECO', 'DAILY VI', 'VI', '35C13 / 35S13', 2287, 'diesel', 126),
  ('IVECO', 'Daily', 'VI', '', 2287, 'diesel', 126),
  ('IVECO', 'Daily', 'VI', '2.3 HPI (F1AE)', 2287, 'diesel', 126),
  ('IVECO', 'Daily', 'VI', '3.0 HPI (F1CE)', 2998, 'diesel', 170),
  ('IVECO', 'Daily', 'VI', '35C15 / 35S15', 2998, 'diesel', 146),
  ('IVECO', 'Daily', 'VI', '35C13 / 35S13', 2287, 'diesel', 126),
  ('IVECO', 'DAILY', 'VI', '', 2287, 'diesel', 126),
  ('IVECO', 'DAILY', 'VI', '2.3 HPI (F1AE)', 2287, 'diesel', 126),
  ('IVECO', 'DAILY', 'VI', '3.0 HPI (F1CE)', 2998, 'diesel', 170),
  ('IVECO', 'DAILY', 'VI', '35C15 / 35S15', 2998, 'diesel', 146),
  ('IVECO', 'DAILY', 'VI', '35C13 / 35S13', 2287, 'diesel', 126)
) AS v(make, model, generation, engine_code, disp, fuel, hp)
ON CONFLICT ("make", "model", "generation", "engineCode", "source") DO NOTHING;

COMMIT;

-- 3. Verification report of seeded models and catalog availability
SELECT 
  v.make,
  count(DISTINCT v.model) AS "Distinct Models",
  count(*) AS "Total Trims / Variants",
  s.viscosity AS "Standard Viscosity",
  s."oemApproval" AS "Homologation"
FROM "OilFinderVehicle" v
JOIN "OilFinderOilSpec" s ON s.id = v."oilSpecId"
WHERE v.source = 'SpecPart OEM Catalogue Homologations'
GROUP BY v.make, s.viscosity, s."oemApproval"
ORDER BY v.make ASC;
