-- ============================================================
-- COMPREHENSIVE CATALOGUE PRODUCT CONSOLIDATION & DEDUPLICATION
-- ============================================================
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE "public"."ProductVariant" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- 1. General catalogue cleanup: merge all duplicate products having volume suffixes in name
DO $$
DECLARE
  rec RECORD;
  canon_id text;
  clean_name text;
  clean_slug text;
  i integer;
BEGIN
  FOR rec IN (
    SELECT
      "brandId",
      TRIM(REGEXP_REPLACE("nameFr", '\s*[-–(]?\s*\b(1L|4L|5L|7L|10L|20L|60L|208L|500ml|400ml|250ml|300ml|750ml|1\s*L|4\s*L|5\s*L|7\s*L)\b[)]?\s*$', '', 'i')) AS base_name,
      ARRAY_AGG(id ORDER BY "createdAt" ASC) AS product_ids,
      COUNT(*) AS cnt
    FROM public."Product"
    GROUP BY "brandId", TRIM(REGEXP_REPLACE("nameFr", '\s*[-–(]?\s*\b(1L|4L|5L|7L|10L|20L|60L|208L|500ml|400ml|250ml|300ml|750ml|1\s*L|4\s*L|5\s*L|7\s*L)\b[)]?\s*$', '', 'i'))
    HAVING COUNT(*) > 1
  ) LOOP
    canon_id := rec.product_ids[1];
    clean_name := rec.base_name;
    clean_slug := LOWER(REGEXP_REPLACE(clean_name, '[^a-zA-Z0-9]+', '-', 'g'));
    clean_slug := TRIM(BOTH '-' FROM clean_slug);

    UPDATE public."Product"
    SET "nameFr" = clean_name,
        slug = clean_slug
    WHERE id = canon_id;

    FOR i IN 2..ARRAY_LENGTH(rec.product_ids, 1) LOOP
      UPDATE public."ProductVariant" SET "productId" = canon_id WHERE "productId" = rec.product_ids[i];
      UPDATE public."ProductImage" SET "productId" = canon_id WHERE "productId" = rec.product_ids[i];
      DELETE FROM public."ProductSpecs" WHERE "productId" = rec.product_ids[i];
      DELETE FROM public."VehicleCompatibility" WHERE "productId" = rec.product_ids[i];
      DELETE FROM public."Review" WHERE "productId" = rec.product_ids[i];
      DELETE FROM public."WishlistItem" WHERE "productId" = rec.product_ids[i];
      DELETE FROM public."OrderItem" WHERE "productId" = rec.product_ids[i];
      DELETE FROM public."Product" WHERE id = rec.product_ids[i];
    END LOOP;
  END LOOP;
END $$;

-- Product 1: Liqui Moly Huile de boîte de vitesses à double embrayage 8100
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Huile de boîte de vitesses à d%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-huile-de-boite%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Huile de boîte de vitesses à double embrayage 8100', slug = 'liqui-moly-huile-de-boite-de-vitesses-a-double-embrayage-8100' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 2: Liqui Moly Leichtlauf High Tech 5W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Leichtlauf High Tech 5W-40%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-leichtlauf-hig%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Leichtlauf High Tech 5W-40', slug = 'liqui-moly-leichtlauf-high-tech-5w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 3: Liqui Moly Molygen New Generation 10W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Molygen New Generation 10W-40%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-molygen-new-ge%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Molygen New Generation 10W-40', slug = 'liqui-moly-molygen-new-generation-10w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 4: Liqui Moly Molygen New Generation 5W-30
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Molygen New Generation 5W-30%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-molygen-new-ge%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Molygen New Generation 5W-30', slug = 'liqui-moly-molygen-new-generation-5w-30' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 5: Liqui Moly Molygen New Generation 5W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Molygen New Generation 5W-40%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-molygen-new-ge%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Molygen New Generation 5W-40', slug = 'liqui-moly-molygen-new-generation-5w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 6: Liqui Moly MoS2 Leichtlauf 10W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%MoS2 Leichtlauf 10W-40%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-mos2-leichtlau%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly MoS2 Leichtlauf 10W-40', slug = 'liqui-moly-mos2-leichtlauf-10w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 7: Liqui Moly Special Tec AA 5W-20
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Special Tec AA 5W-20%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-special-tec-aa%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Special Tec AA 5W-20', slug = 'liqui-moly-special-tec-aa-5w-20' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 8: Liqui Moly Special Tec F 0W-30
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Special Tec F 0W-30%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-special-tec-f-%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Special Tec F 0W-30', slug = 'liqui-moly-special-tec-f-0w-30' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 9: Liqui Moly Special Tec F 5W-30 (FORD)
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Special Tec F 5W-30 (FORD)%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-special-tec-f-%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Special Tec F 5W-30 (FORD)', slug = 'liqui-moly-special-tec-f-5w-30-ford' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 10: Liqui Moly Special Tec F ECO 5W-20
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Special Tec F ECO 5W-20%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-special-tec-f-%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Special Tec F ECO 5W-20', slug = 'liqui-moly-special-tec-f-eco-5w-20' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 11: Liqui Moly Super Leichtlauf 10W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Super Leichtlauf 10W-40%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-super-leichtla%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Super Leichtlauf 10W-40', slug = 'liqui-moly-super-leichtlauf-10w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 12: Liqui Moly Synthoil Race Tech GT1 10W-60
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Synthoil Race Tech GT1 10W-60%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-synthoil-race-%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Synthoil Race Tech GT1 10W-60', slug = 'liqui-moly-synthoil-race-tech-gt1-10w-60' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 13: Liqui Moly Top Tec 4100 5W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4100 5W-40%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-4100-5%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec 4100 5W-40', slug = 'liqui-moly-top-tec-4100-5w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 14: Liqui Moly Top Tec 4110 5W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4110 5W-40%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-4110-5%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec 4110 5W-40', slug = 'liqui-moly-top-tec-4110-5w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 15: Liqui Moly Top Tec 4200 5W-30 New Generation
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4200 5W-30 New Generat%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-4200-5%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec 4200 5W-30 New Generation', slug = 'liqui-moly-top-tec-4200-5w-30-new-generation' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 16: Liqui Moly Top Tec 4300 5W-30 (PSA)
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4300 5W-30 (PSA)%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-4300-5%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec 4300 5W-30 (PSA)', slug = 'liqui-moly-top-tec-4300-5w-30-psa' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 17: Liqui Moly Top Tec 4600 5W-30
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4600 5W-30%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-4600-5%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec 4600 5W-30', slug = 'liqui-moly-top-tec-4600-5w-30' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 18: Liqui Moly Top Tec 6100 0W-30
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 6100 0W-30%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-6100-0%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec 6100 0W-30', slug = 'liqui-moly-top-tec-6100-0w-30' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 19: Liqui Moly Top Tec 6200 0W-20
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 6200 0W-20%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-6200-0%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec 6200 0W-20', slug = 'liqui-moly-top-tec-6200-0w-20' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 20: Liqui Moly Top Tec ATF 1100
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec ATF 1100%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-atf-11%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec ATF 1100', slug = 'liqui-moly-top-tec-atf-1100' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 21: Liqui Moly Top Tec ATF 1200
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec ATF 1200%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-atf-12%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec ATF 1200', slug = 'liqui-moly-top-tec-atf-1200' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 22: Liqui Moly Top Tec ATF 1800
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec ATF 1800%')
     OR LOWER(slug) LIKE LOWER('%liqui-moly-top-tec-atf-18%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Top Tec ATF 1800', slug = 'liqui-moly-top-tec-atf-1800' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 23: Mannol Classic 10W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Classic 10W-40%')
     OR LOWER(slug) LIKE LOWER('%mannol-classic-10w-40%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Mannol Classic 10W-40', slug = 'mannol-classic-10w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 24: Mannol Defender 10W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Defender 10W-40%')
     OR LOWER(slug) LIKE LOWER('%mannol-defender-10w-40%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Mannol Defender 10W-40', slug = 'mannol-defender-10w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 25: Mannol Diesel Extra 10W-40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Diesel Extra 10W-40%')
     OR LOWER(slug) LIKE LOWER('%mannol-diesel-extra-10w-4%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Mannol Diesel Extra 10W-40', slug = 'mannol-diesel-extra-10w-40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 26: Mannol Energy Combi LL 5W-30
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Energy Combi LL 5W-30%')
     OR LOWER(slug) LIKE LOWER('%mannol-energy-combi-ll-5w%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Mannol Energy Combi LL 5W-30', slug = 'mannol-energy-combi-ll-5w-30' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 27: Wolf Guardtech 10W40 B4
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Guardtech 10W40 B4%')
     OR LOWER(slug) LIKE LOWER('%wolf-guardtech-10w40-b4%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Wolf Guardtech 10W40 B4', slug = 'wolf-guardtech-10w40-b4' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 28: Wolf Officialtech 5W30 C3 SP Extra
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Officialtech 5W30 C3 SP Extra%')
     OR LOWER(slug) LIKE LOWER('%wolf-officialtech-5w30-c3%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Wolf Officialtech 5W30 C3 SP Extra', slug = 'wolf-officialtech-5w30-c3-sp-extra' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 29: Wolf Officialtech 5W30 MS-Ford
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Officialtech 5W30 MS-Ford%')
     OR LOWER(slug) LIKE LOWER('%wolf-officialtech-5w30-ms%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Wolf Officialtech 5W30 MS-Ford', slug = 'wolf-officialtech-5w30-ms-ford' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Product 30: Wolf Vitaltech 5W40
DO $$
DECLARE
  p_id text;
  dup_ids text[];
  other_id text;
BEGIN
  -- Find all matching products in database
  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids
  FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Vitaltech 5W40%')
     OR LOWER(slug) LIKE LOWER('%wolf-vitaltech-5w40%');

  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN
    p_id := dup_ids[1];
    UPDATE public."Product" SET "nameFr" = 'Wolf Vitaltech 5W40', slug = 'wolf-vitaltech-5w40' WHERE id = p_id;

    -- Merge any duplicate entries into this single canonical product
    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN
      FOREACH other_id IN ARRAY dup_ids[2:] LOOP
        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;
        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;
        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;
        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;
        DELETE FROM public."Product" WHERE id = other_id;
      END LOOP;
    END IF;
  END IF;
END $$;

COMMIT;