-- ============================================================
-- CONSOLIDATE DUPLICATE PRODUCTS & FIX CATEGORY TAXONOMY
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE "public"."ProductVariant" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- 1. Ensure all Canonical Root & Leaf Categories Exist
INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
VALUES
  (gen_random_uuid()::text, 'Automobile', 'automobile', 1, NULL, '/categories/auto.webp'),
  (gen_random_uuid()::text, 'Pièces de Rechange / D''origine', 'auto-pieces-rechange', 2, NULL, '/categories/pieces.webp'),
  (gen_random_uuid()::text, 'Moto & Karting', 'moto-karting', 3, NULL, '/categories/moto.webp'),
  (gen_random_uuid()::text, 'Marine', 'marine', 4, NULL, '/categories/marine.webp'),
  (gen_random_uuid()::text, 'Entretien & Accessoires', 'entretien-accessoires', 5, NULL, '/categories/entretien.webp')
ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder";

-- Subcategories under Automobile
DO $$
DECLARE auto_id text;
BEGIN
  SELECT id INTO auto_id FROM public."Category" WHERE slug = 'automobile';

  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huile Moteur', 'huiles-moteur', 1, auto_id),
    (gen_random_uuid()::text, 'Huiles Moteur Spécifiques', 'huiles-moteur-specifiques', 2, auto_id),
    (gen_random_uuid()::text, 'Huile de Boîte & Transmission', 'huile-de-boite', 3, auto_id),
    (gen_random_uuid()::text, 'Liquide de Frein', 'liquide-de-frein', 4, auto_id),
    (gen_random_uuid()::text, 'Direction Assistée', 'direction-assistee', 5, auto_id),
    (gen_random_uuid()::text, 'Additifs', 'additifs', 6, auto_id),
    (gen_random_uuid()::text, 'Liquides (Refroidissement & Antigel)', 'antigel-refroidissement', 7, auto_id),
    (gen_random_uuid()::text, 'Liquides (AdBlue)', 'adblue', 8, auto_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = auto_id;
END $$;

-- 2. Reparent all huiles-moteur-specifiques to huiles-moteur or automobile
DO $$
DECLARE huiles_id text;
BEGIN
  SELECT id INTO huiles_id FROM public."Category" WHERE slug = 'huiles-moteur';
  UPDATE public."Category" SET "parentId" = huiles_id WHERE slug = 'huiles-moteur-specifiques';
END $$;

-- 3. Fix categoryId of all Motor Oils incorrectly assigned to other categories
DO $$
DECLARE huiles_id text; boite_id text; frein_id text; additifs_id text;
BEGIN
  SELECT id INTO huiles_id FROM public."Category" WHERE slug = 'huiles-moteur';
  SELECT id INTO boite_id FROM public."Category" WHERE slug = 'huile-de-boite';
  SELECT id INTO frein_id FROM public."Category" WHERE slug = 'liquide-de-frein';
  SELECT id INTO additifs_id FROM public."Category" WHERE slug = 'additifs';

  -- Reassign engine oils to huiles-moteur
  UPDATE public."Product"
  SET "categoryId" = huiles_id
  WHERE "categoryId" IS NULL
     OR "categoryId" IN (SELECT id FROM public."Category" WHERE slug IN ('filtres-huile', 'pieces-rechange', 'automobile', 'huiles-moteur-auto', 'huiles-moteur-specifiques'))
    AND (
      "nameFr" ~* '(5W|0W|10W|15W|20W|Leichtlauf|Molygen|Top Tec|Synthoil|Guardtech|Vitaltech|Officialtech|Energy Combi|Diesel Extra|Classic 10W)'
      OR description ~* '(huile moteur|engine oil|viscosité)'
    );

  -- Reassign transmission oils to huile-de-boite
  UPDATE public."Product"
  SET "categoryId" = boite_id
  WHERE "nameFr" ~* '(ATF|DSG|DCT|75W|80W|85W|boîte|transmission|Hypoid)'
    AND "categoryId" != boite_id;

  -- Reassign brake fluids to liquide-de-frein
  UPDATE public."Product"
  SET "categoryId" = frein_id
  WHERE "nameFr" ~* '(DOT 3|DOT 4|DOT 5|liquide de frein|brake fluid)'
    AND "categoryId" != frein_id;
END $$;

-- 4. Deduplicate products: Merge products with the same base name into one product with variants
DO $$
DECLARE
  rec RECORD;
  canon_id text;
  clean_name text;
  clean_slug text;
BEGIN
  -- Identify duplicate products (e.g. ending with 1L, 4L, 5L, 7L, 20L)
  FOR rec IN (
    SELECT
      "brandId",
      REGEXP_REPLACE("nameFr", '\s+(1L|4L|5L|7L|10L|20L|60L|208L|500ml|400ml|250ml|300ml|750ml)\b.*$', '', 'i') AS base_name,
      ARRAY_AGG(id ORDER BY "createdAt" ASC) AS product_ids,
      COUNT(*) AS cnt
    FROM public."Product"
    WHERE "nameFr" ~* '\b(1L|4L|5L|7L|10L|20L)\b'
    GROUP BY "brandId", REGEXP_REPLACE("nameFr", '\s+(1L|4L|5L|7L|10L|20L|60L|208L|500ml|400ml|250ml|300ml|750ml)\b.*$', '', 'i')
    HAVING COUNT(*) > 1
  ) LOOP
    canon_id := rec.product_ids[1];
    clean_name := rec.base_name;
    clean_slug := LOWER(REGEXP_REPLACE(clean_name, '[^a-zA-Z0-9]+', '-', 'g'));
    clean_slug := TRIM(BOTH '-' FROM clean_slug);

    -- Update canonical product with clean name & slug
    UPDATE public."Product"
    SET "nameFr" = clean_name,
        slug = clean_slug
    WHERE id = canon_id;

    -- Re-link all variants from duplicate products to the canonical product
    FOR i IN 2..ARRAY_LENGTH(rec.product_ids, 1) LOOP
      UPDATE public."ProductVariant"
      SET "productId" = canon_id
      WHERE "productId" = rec.product_ids[i];

      UPDATE public."ProductImage"
      SET "productId" = canon_id
      WHERE "productId" = rec.product_ids[i];

      -- Delete specs, compatibilities, and the duplicate product itself
      DELETE FROM public."ProductSpecs" WHERE "productId" = rec.product_ids[i];
      DELETE FROM public."VehicleCompatibility" WHERE "productId" = rec.product_ids[i];
      DELETE FROM public."Product" WHERE id = rec.product_ids[i];
    END LOOP;
  END LOOP;
END $$;

-- 5. Re-run variant consolidation for exact xlsx products
DO $$
DECLARE
  v_prod_id text;
BEGIN
  -- Liqui Moly Leichtlauf High Tech 5W-40
  SELECT id INTO v_prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE '%leichtlauf high tech 5w-40%' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Leichtlauf High Tech 5W-40', slug = 'liqui-moly-leichtlauf-high-tech-5w-40' WHERE id = v_prod_id;
  END IF;

  -- Liqui Moly Molygen New Generation 5W-30
  SELECT id INTO v_prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE '%molygen%5w-30%' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Molygen New Generation 5W-30', slug = 'liqui-moly-molygen-new-generation-5w-30' WHERE id = v_prod_id;
  END IF;

  -- Liqui Moly Molygen New Generation 5W-40
  SELECT id INTO v_prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE '%molygen%5w-40%' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Molygen New Generation 5W-40', slug = 'liqui-moly-molygen-new-generation-5w-40' WHERE id = v_prod_id;
  END IF;

  -- Liqui Moly Molygen New Generation 10W-40
  SELECT id INTO v_prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE '%molygen%10w-40%' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    UPDATE public."Product" SET "nameFr" = 'Liqui Moly Molygen New Generation 10W-40', slug = 'liqui-moly-molygen-new-generation-10w-40' WHERE id = v_prod_id;
  END IF;

  -- MANNOL Classic 10W-40
  SELECT id INTO v_prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE '%mannol classic 10w-40%' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    UPDATE public."Product" SET "nameFr" = 'MANNOL Classic 10W-40', slug = 'mannol-classic-10w-40' WHERE id = v_prod_id;
  END IF;

  -- MANNOL Defender 10W-40
  SELECT id INTO v_prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE '%mannol defender 10w-40%' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    UPDATE public."Product" SET "nameFr" = 'MANNOL Defender 10W-40', slug = 'mannol-defender-10w-40' WHERE id = v_prod_id;
  END IF;

  -- Wolf Vitaltech 5W40
  SELECT id INTO v_prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE '%wolf vitaltech 5w40%' OR LOWER("nameFr") LIKE '%wolf vitaltech 5w-40%' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    UPDATE public."Product" SET "nameFr" = 'Wolf Vitaltech 5W40', slug = 'wolf-vitaltech-5w40' WHERE id = v_prod_id;
  END IF;

  -- Wolf Officialtech 5W30 C3 SP Extra
  SELECT id INTO v_prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE '%officialtech 5w30 c3%' OR LOWER("nameFr") LIKE '%officialtech 5w-30 c3%' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    UPDATE public."Product" SET "nameFr" = 'Wolf Officialtech 5W30 C3 SP Extra', slug = 'wolf-officialtech-5w30-c3-sp-extra' WHERE id = v_prod_id;
  END IF;
END $$;

COMMIT;
