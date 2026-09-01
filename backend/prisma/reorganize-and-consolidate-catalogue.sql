-- ============================================================
-- REORGANIZE & CONSOLIDATE SPEC-PART CATALOGUE
-- 1. Eliminate Duplicate Product Cards (Consolidate Volumes into Variants)
-- 2. Strictly Reclassify Products into Right Categories (No Contamination)
-- 3. Ensure Moto & Karting Oils, Marine, and Car Oils are Accurately Located
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- STEP 1: ENSURE ALL TAXONOMY CATEGORIES EXIST WITH PARENT LINKS
-- ─────────────────────────────────────────────────────────────

-- Roots
INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
VALUES
  (gen_random_uuid()::text, 'Automobile', 'automobile', 1, NULL, '/categories/auto.webp'),
  (gen_random_uuid()::text, 'Pièces de Rechange / D''origine', 'auto-pieces-rechange', 2, NULL, '/categories/pieces.webp'),
  (gen_random_uuid()::text, 'Moto & Karting', 'moto-karting', 3, NULL, '/categories/moto.webp'),
  (gen_random_uuid()::text, 'Marine', 'marine', 4, NULL, '/categories/marine.webp')
ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder";

-- Subcategories under Automobile
DO $$
DECLARE auto_id text;
BEGIN
  SELECT id INTO auto_id FROM public."Category" WHERE slug = 'automobile';

  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huile Moteur', 'huiles-moteur', 1, auto_id),
    (gen_random_uuid()::text, 'Liquide de Frein', 'liquide-de-frein', 2, auto_id),
    (gen_random_uuid()::text, 'Liquide de Direction', 'direction-assistee', 3, auto_id),
    (gen_random_uuid()::text, 'Huile de Boîte & Transmission', 'huile-de-boite', 4, auto_id),
    (gen_random_uuid()::text, 'Additifs', 'additifs', 5, auto_id),
    (gen_random_uuid()::text, 'Liquides & Entretien', 'liquides-auto', 6, auto_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = auto_id, "sortOrder" = EXCLUDED."sortOrder";
END $$;

-- Subcategories under Additifs
DO $$
DECLARE additifs_id text;
BEGIN
  SELECT id INTO additifs_id FROM public."Category" WHERE slug = 'additifs';

  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Additif Essence', 'additif-essence', 1, additifs_id),
    (gen_random_uuid()::text, 'Additif Diesel', 'additif-diesel', 2, additifs_id),
    (gen_random_uuid()::text, 'Additif Huile & Rinçage', 'additif-huile', 3, additifs_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = additifs_id, "sortOrder" = EXCLUDED."sortOrder";
END $$;

-- Subcategories under Pièces de Rechange
DO $$
DECLARE pieces_id text;
BEGIN
  SELECT id INTO pieces_id FROM public."Category" WHERE slug = 'auto-pieces-rechange';

  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Filtres', 'auto-filtres', 1, pieces_id),
    (gen_random_uuid()::text, 'Freinage', 'auto-freinage', 2, pieces_id),
    (gen_random_uuid()::text, 'Suspension & Direction', 'auto-suspension-direction', 3, pieces_id),
    (gen_random_uuid()::text, 'Boîte de Vitesse', 'transmission', 4, pieces_id),
    (gen_random_uuid()::text, 'Moteur & Distribution', 'auto-moteur-distribution', 5, pieces_id),
    (gen_random_uuid()::text, 'Refroidissement & Climatisation', 'auto-refroidissement-climatisation', 6, pieces_id),
    (gen_random_uuid()::text, 'Électricité & Éclairage', 'auto-electricite-eclairage', 7, pieces_id),
    (gen_random_uuid()::text, 'Carrosserie & Habitacle', 'auto-carrosserie-habitacle', 8, pieces_id),
    (gen_random_uuid()::text, 'Échappement', 'auto-echappement', 9, pieces_id),
    (gen_random_uuid()::text, 'Autres pièces auto', 'auto-autres-pieces', 10, pieces_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = pieces_id, "sortOrder" = EXCLUDED."sortOrder";
END $$;

-- Subcategories under Moto & Karting
DO $$
DECLARE moto_id text;
BEGIN
  SELECT id INTO moto_id FROM public."Category" WHERE slug = 'moto-karting';

  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huiles Moteur & Karting (2T / 4T)', 'moto-huiles', 1, moto_id),
    (gen_random_uuid()::text, 'Huiles Moteur Moto', 'moto-huile-moteur', 2, moto_id),
    (gen_random_uuid()::text, 'Huile de boîte Moto', 'moto-huile-boite', 3, moto_id),
    (gen_random_uuid()::text, 'Huile de fourche', 'moto-huile-fourche', 4, moto_id),
    (gen_random_uuid()::text, 'Chaîne & Additifs Moto', 'moto-lubrifiants-chaine', 5, moto_id),
    (gen_random_uuid()::text, 'Karting & Compétition 2T', 'karting-huiles', 6, moto_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = moto_id, "sortOrder" = EXCLUDED."sortOrder";
END $$;

-- Subcategories under Marine
DO $$
DECLARE marine_id text;
BEGIN
  SELECT id INTO marine_id FROM public."Category" WHERE slug = 'marine';

  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huiles moteurs marins', 'marine-moteurs', 1, marine_id),
    (gen_random_uuid()::text, 'Hydraulique Marine', 'marine-hydraulique', 2, marine_id),
    (gen_random_uuid()::text, 'Graisses et additifs Marine', 'marine-graisses', 3, marine_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = marine_id, "sortOrder" = EXCLUDED."sortOrder";
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEP 2: CONSOLIDATE REPEATED PRODUCT VARIANTS
-- Merges separate products like "Castrol Edge 5W-40 5L" and "Castrol Edge 5W-40 1L"
-- into ONE product with variants [ 1L ] [ 5L ]
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  rec RECORD;
  canon_id text;
  clean_name text;
  clean_slug text;
  dup_id text;
BEGIN
  FOR rec IN (
    SELECT
      "brandId",
      TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE("nameFr", '\s*[\(\[]?\s*(1L|4L|5L|7L|10L|20L|60L|208L|500ml|400ml|250ml|300ml|750ml|1l|4l|5l|7l|10l|20l|1 Litre|4 Litres|5 Litres)\s*[\)\]]?\s*$', '', 'i'),
        '\s+(1L|4L|5L|7L|10L|20L)\b', '', 'i'
      )) AS base_name,
      ARRAY_AGG(id ORDER BY (CASE WHEN slug NOT LIKE '%-1l' AND slug NOT LIKE '%-5l' AND slug NOT LIKE '%-4l' THEN 0 ELSE 1 END) ASC, "createdAt" ASC) AS product_ids,
      COUNT(*) AS cnt
    FROM public."Product"
    WHERE "nameFr" ~* '\b(1L|4L|5L|7L|10L|20L|500ml|400ml|250ml|300ml|750ml)\b'
    GROUP BY "brandId", TRIM(REGEXP_REPLACE(
      REGEXP_REPLACE("nameFr", '\s*[\(\[]?\s*(1L|4L|5L|7L|10L|20L|60L|208L|500ml|400ml|250ml|300ml|750ml|1l|4l|5l|7l|10l|20l|1 Litre|4 Litres|5 Litres)\s*[\)\]]?\s*$', '', 'i'),
      '\s+(1L|4L|5L|7L|10L|20L)\b', '', 'i'
    ))
    HAVING COUNT(*) > 1
  ) LOOP
    canon_id := rec.product_ids[1];
    clean_name := rec.base_name;
    clean_slug := LOWER(REGEXP_REPLACE(clean_name, '[^a-zA-Z0-9]+', '-', 'g'));
    clean_slug := TRIM(BOTH '-' FROM clean_slug);

    -- Ensure canonical product has clean name & slug
    UPDATE public."Product"
    SET "nameFr" = clean_name,
        slug = clean_slug
    WHERE id = canon_id;

    -- Move all variants, images, orders, wishlist, carts from duplicate products into canonical product
    FOREACH dup_id IN ARRAY rec.product_ids[2:] LOOP
      -- Relink variants
      UPDATE public."ProductVariant" SET "productId" = canon_id WHERE "productId" = dup_id;

      -- Relink images
      UPDATE public."ProductImage" SET "productId" = canon_id WHERE "productId" = dup_id;

      -- Relink reviews if any
      UPDATE public."Review" SET "productId" = canon_id WHERE "productId" = dup_id;

      -- Delete compatibility rows for dup_id
      DELETE FROM public."ProductCompatibility" WHERE "productId" = dup_id;

      -- Delete specs for dup_id
      DELETE FROM public."ProductSpec" WHERE "productId" = dup_id;

      -- Delete the duplicate product
      DELETE FROM public."Product" WHERE id = dup_id;
    END LOOP;
  END LOOP;
END $$;

-- Deduplicate any duplicate volume variants on the same product
DO $$
DECLARE
  vrec RECORD;
  best_vid text;
  other_vid text;
BEGIN
  FOR vrec IN (
    SELECT
      "productId",
      UPPER(TRIM(REGEXP_REPLACE(volume, '\s+', '', 'g'))) AS norm_vol,
      ARRAY_AGG(id ORDER BY (CASE WHEN price > 0 THEN 0 ELSE 1 END) ASC, "createdAt" ASC) AS vids,
      COUNT(*) as vcnt
    FROM public."ProductVariant"
    WHERE volume IS NOT NULL AND volume != ''
    GROUP BY "productId", UPPER(TRIM(REGEXP_REPLACE(volume, '\s+', '', 'g')))
    HAVING COUNT(*) > 1
  ) LOOP
    best_vid := vrec.vids[1];
    FOREACH other_vid IN ARRAY vrec.vids[2:] LOOP
      UPDATE public."OrderItem" SET "variantId" = best_vid WHERE "variantId" = other_vid;
      DELETE FROM public."ProductVariant" WHERE id = other_vid;
    END LOOP;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEP 3: STRICT RE-CLASSIFICATION (CLEANING HUILES MOTEUR)
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  huiles_id text;
  boite_id text;
  frein_id text;
  direction_id text;
  additif_essence_id text;
  additif_diesel_id text;
  additif_huile_id text;
  additifs_id text;
  filtres_id text;
  electricite_id text;
  autres_pieces_id text;
  moto_huiles_id text;
  moto_boite_id text;
  moto_fourche_id text;
  moto_chaine_id text;
  karting_huiles_id text;
  marine_moteurs_id text;
  marine_graisses_id text;
BEGIN
  SELECT id INTO huiles_id FROM public."Category" WHERE slug = 'huiles-moteur';
  SELECT id INTO boite_id FROM public."Category" WHERE slug = 'huile-de-boite';
  SELECT id INTO frein_id FROM public."Category" WHERE slug = 'liquide-de-frein';
  SELECT id INTO direction_id FROM public."Category" WHERE slug = 'direction-assistee';
  SELECT id INTO additifs_id FROM public."Category" WHERE slug = 'additifs';
  SELECT id INTO additif_essence_id FROM public."Category" WHERE slug = 'additif-essence';
  SELECT id INTO additif_diesel_id FROM public."Category" WHERE slug = 'additif-diesel';
  SELECT id INTO additif_huile_id FROM public."Category" WHERE slug = 'additif-huile';
  SELECT id INTO filtres_id FROM public."Category" WHERE slug = 'auto-filtres';
  SELECT id INTO electricite_id FROM public."Category" WHERE slug = 'auto-electricite-eclairage';
  SELECT id INTO autres_pieces_id FROM public."Category" WHERE slug = 'auto-autres-pieces';
  SELECT id INTO moto_huiles_id FROM public."Category" WHERE slug = 'moto-huiles';
  SELECT id INTO moto_boite_id FROM public."Category" WHERE slug = 'moto-huile-boite';
  SELECT id INTO moto_fourche_id FROM public."Category" WHERE slug = 'moto-huile-fourche';
  SELECT id INTO moto_chaine_id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine';
  SELECT id INTO karting_huiles_id FROM public."Category" WHERE slug = 'karting-huiles';
  SELECT id INTO marine_moteurs_id FROM public."Category" WHERE slug = 'marine-moteurs';
  SELECT id INTO marine_graisses_id FROM public."Category" WHERE slug = 'marine-graisses';

  -- 1. LIGHTING & ELECTRICAL (OSRAM, COOL BLUE, BULBS) -> auto-electricite-eclairage
  UPDATE public."Product"
  SET "categoryId" = electricite_id
  WHERE "nameFr" ~* '\b(H1|H4|H7|H11|ampoule|lampe|osram|cool blue|lumière|lumiere|halogène|xenon|led)\b'
     OR description ~* '\b(ampoule halogène|feux de jour|flux lumineux|lumière blanche|culot)\b';

  -- 2. FILTERS (BOSCH, MANN-FILTER...) -> auto-filtres
  UPDATE public."Product"
  SET "categoryId" = filtres_id
  WHERE "nameFr" ~* '\b(filtre à huile|filtre a huile|filtre à air|filtre a air|filtre carburant|filtre habitacle|f 026 407)\b'
     OR description ~* '\b(filtre à huile|cartouche filtrante)\b';

  -- 3. TOOLS & WORKSHOP -> auto-autres-pieces
  UPDATE public."Product"
  SET "categoryId" = autres_pieces_id
  WHERE "nameFr" ~* '\b(bidon de vidange|entonnoir|clé à filtre|cle a filtre)\b';

  -- 4. HYDRAULIC & STEERING FLUIDS (ROWE ZH M SYNT, LIQUI MOLY HYDRAULIQUE...) -> direction-assistee
  UPDATE public."Product"
  SET "categoryId" = direction_id
  WHERE "nameFr" ~* '\b(huile hydraulique|système hydraulique|direction assistée|power steering|chf 11s|lhm|zh m synt)\b'
     OR description ~* '\b(système hydraulique central|direction assistée|chf 11s)\b';

  -- 5. GEARBOX / TRANSMISSION OILS & ADDITIVES -> huile-de-boite
  UPDATE public."Product"
  SET "categoryId" = boite_id
  WHERE ("nameFr" ~* '\b(additif boite|boite de vitesse|boîte de vitesse|transmission fluid|atf|dsg|dct|cvt|75w-80|75w-90|75w-85|80w-90|85w-140|hypoid|gear oil)\b'
     OR description ~* '\b(boîte automatique|transmission automatique|pont arrière|différentiel)\b')
    AND "nameFr" !~* '\b(fourche|fork|transoil)\b';

  -- 6. BRAKE FLUIDS -> liquide-de-frein
  UPDATE public."Product"
  SET "categoryId" = frein_id
  WHERE "nameFr" ~* '\b(dot 3|dot 4|dot 5\.1|liquide de frein|brake fluid)\b'
     OR description ~* '\b(liquide de frein|circuit de freinage)\b';

  -- 7. OIL ADDITIVES & BOOSTERS -> additif-huile
  UPDATE public."Product"
  SET "categoryId" = additif_huile_id
  WHERE "nameFr" ~* '\b(oil booster|booster protected|engine flush|rinçage moteur|stop fuite huile|oil treatment|mos2 shooter|ceratec|visco-stabil|hydro-stößel)\b'
     OR description ~* '\b(rinçage moteur|additif pour huile moteur|protecteur d''huile)\b';

  -- 8. FUEL ADDITIVES (DIESEL / ESSENCE)
  UPDATE public."Product"
  SET "categoryId" = additif_diesel_id
  WHERE "nameFr" ~* '\b(additif diesel|injecteur diesel|nettoyant diesel|cétane|dpf cleaner|fap|anti-fumée diesel|super diesel additiv)\b'
     OR description ~* '\b(injection diesel|système d''injection diesel)\b';

  UPDATE public."Product"
  SET "categoryId" = additif_essence_id
  WHERE "nameFr" ~* '\b(additif essence|injecteur essence|nettoyant essence|octane booster|valve cleaner|speed benzin)\b'
     OR description ~* '\b(injection essence|carburateur essence)\b';

  -- 9. MOTO & KARTING PRODUCTS
  -- Fork Oil
  UPDATE public."Product"
  SET "categoryId" = moto_fourche_id
  WHERE "nameFr" ~* '\b(fourche|fork oil)\b';

  -- Chain Lube
  UPDATE public."Product"
  SET "categoryId" = moto_chaine_id
  WHERE "nameFr" ~* '\b(chaîne|chaine|chain lube|chain clean)\b';

  -- Moto Gearbox
  UPDATE public."Product"
  SET "categoryId" = moto_boite_id
  WHERE "nameFr" ~* '\b(transoil|gearbox 2t|gearbox 4t|gear oil moto)\b';

  -- Karting & Racing 2T
  UPDATE public."Product"
  SET "categoryId" = karting_huiles_id
  WHERE "nameFr" ~* '\b(kart|karting|racing 2t|power 1 2t|power1 2t|300v 2t)\b'
     OR description ~* '\b(karting|kart)\b';

  -- Moto Engine Oils (2T, 4T, JASO, Scooter, 7100, 5100, 300V FL)
  UPDATE public."Product"
  SET "categoryId" = moto_huiles_id
  WHERE ("nameFr" ~* '\b(2T|4T|moto|scooter|jaso|motorbike|300v 4t|7100|5100|scooter power)\b'
     OR description ~* '\b(moteur 2 temps|moteur 4 temps|jaso ma|jaso mb|motocycle)\b')
    AND "categoryId" NOT IN (moto_fourche_id, moto_chaine_id, moto_boite_id, karting_huiles_id);

  -- 10. MARINE PRODUCTS (Outboard 4T FC-W, 2T TC-W3, Inboard)
  UPDATE public."Product"
  SET "categoryId" = marine_moteurs_id
  WHERE "nameFr" ~* '\b(marine|outboard|inboard|fc-w|tc-w3|nautic|bateau)\b'
     OR description ~* '\b(moteur marin|hors-bord|in-board|fc-w|tc-w3)\b';

  UPDATE public."Product"
  SET "categoryId" = marine_graisses_id
  WHERE "nameFr" ~* '(marine grease|graisse marine)';

  -- 11. AUTOMOBILE ENGINE OILS
  -- All remaining oils with viscosities that do NOT belong to moto, marine, bulbs, or additives
  UPDATE public."Product"
  SET "categoryId" = huiles_id
  WHERE "categoryId" NOT IN (
    electricite_id, filtres_id, autres_pieces_id,
    direction_id, boite_id, frein_id,
    additifs_id, additif_essence_id, additif_diesel_id, additif_huile_id,
    moto_huiles_id, moto_boite_id, moto_fourche_id, moto_chaine_id, karting_huiles_id,
    marine_moteurs_id, marine_graisses_id
  )
  AND (
    "nameFr" ~* '\b(0W-16|0W-20|0W-30|0W-40|5W-20|5W-30|5W-40|5W-50|10W-30|10W-40|10W-60|15W-40|15W-50|20W-50)\b'
    OR description ~* '\b(huile moteur|engine oil|lubrifiant moteur)\b'
  );

  -- Also reparent any legacy 'moto-huile-moteur' to 'moto-huiles'
  UPDATE public."Product"
  SET "categoryId" = moto_huiles_id
  WHERE "categoryId" IN (SELECT id FROM public."Category" WHERE slug = 'moto-huile-moteur');

END $$;

COMMIT;
