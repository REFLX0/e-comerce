-- ============================================================
-- ARRANGE WHOLE CATALOGUE TAXONOMY TO MATCH STOREFRONT NAV
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Ensure all 4 Primary Root Categories Exist (Automobile, Pièces de Rechange, Moto & Karting, Marine)
INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
VALUES
  (gen_random_uuid()::text, 'Automobile', 'automobile', 1, NULL, '/categories/auto.webp'),
  (gen_random_uuid()::text, 'Pièces de Rechange / D''origine', 'auto-pieces-rechange', 2, NULL, '/categories/pieces.webp'),
  (gen_random_uuid()::text, 'Moto & Karting', 'moto-karting', 3, NULL, '/categories/moto.webp'),
  (gen_random_uuid()::text, 'Marine', 'marine', 4, NULL, '/categories/marine.webp')
ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder";

-- 2. Create / Reparent All Subcategories under 'automobile'
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

-- 3. Create / Reparent Additives Subcategories under 'additifs'
DO $$
DECLARE additifs_id text;
BEGIN
  SELECT id INTO additifs_id FROM public."Category" WHERE slug = 'additifs';

  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Additif Essence', 'additif-essence', 1, additifs_id),
    (gen_random_uuid()::text, 'Additif Diesel', 'additif-diesel', 2, additifs_id),
    (gen_random_uuid()::text, 'Additif Huile & Graisse', 'additif-huile', 3, additifs_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = additifs_id, "sortOrder" = EXCLUDED."sortOrder";
END $$;

-- 4. Create / Reparent Subcategories under 'auto-pieces-rechange'
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

-- 5. Create / Reparent Subcategories under 'moto-karting'
DO $$
DECLARE moto_id text;
BEGIN
  SELECT id INTO moto_id FROM public."Category" WHERE slug = 'moto-karting';

  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huiles spécifiques Moto', 'moto-huiles', 1, moto_id),
    (gen_random_uuid()::text, 'Huile de boîte Moto', 'moto-huile-boite', 2, moto_id),
    (gen_random_uuid()::text, 'Huile de fourche', 'moto-huile-fourche', 3, moto_id),
    (gen_random_uuid()::text, 'Lubrifiants de chaîne & additifs', 'moto-lubrifiants-chaine', 4, moto_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = moto_id, "sortOrder" = EXCLUDED."sortOrder";
END $$;

-- 6. Create / Reparent Subcategories under 'marine'
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

-- 7. RE-ARRANGE AND ORGANIZE ALL PRODUCTS INTO THE CORRECT CATEGORIES

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
  moto_huiles_id text;
  moto_boite_id text;
  moto_fourche_id text;
  moto_chaine_id text;
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
  SELECT id INTO moto_huiles_id FROM public."Category" WHERE slug = 'moto-huiles';
  SELECT id INTO moto_boite_id FROM public."Category" WHERE slug = 'moto-huile-boite';
  SELECT id INTO moto_fourche_id FROM public."Category" WHERE slug = 'moto-huile-fourche';
  SELECT id INTO moto_chaine_id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine';
  SELECT id INTO marine_moteurs_id FROM public."Category" WHERE slug = 'marine-moteurs';
  SELECT id INTO marine_graisses_id FROM public."Category" WHERE slug = 'marine-graisses';

  -- A. MOTO & KARTING PRODUCTS
  -- Fork oils
  UPDATE public."Product"
  SET "categoryId" = moto_fourche_id
  WHERE "nameFr" ~* '(fourche|fork oil)'
     OR description ~* '(fourche|fork oil)';

  -- Chain lubes & sprays
  UPDATE public."Product"
  SET "categoryId" = moto_chaine_id
  WHERE "nameFr" ~* '(chaîne|chaine|chain lube|chain clean)'
     OR description ~* '(chaîne|chaine|chain lube|chain clean)';

  -- Moto gearbox oils
  UPDATE public."Product"
  SET "categoryId" = moto_boite_id
  WHERE ("nameFr" ~* '(transoil|gearbox 2t|gearbox 4t)'
     OR description ~* '(transoil|moto gearbox)')
    AND "categoryId" != moto_fourche_id;

  -- Moto engine oils (2T / 4T / JASO MA2 / Scooter Power / 7100 / 5100 / 300V FL)
  UPDATE public."Product"
  SET "categoryId" = moto_huiles_id
  WHERE ("nameFr" ~* '\b(2T|4T|moto|scooter|jaso|kart|racing 4t|motorbike)\b'
     OR description ~* '\b(moteur 2 temps|moteur 4 temps|jaso ma|jaso mb|motocycle)\b')
    AND "categoryId" NOT IN (moto_fourche_id, moto_chaine_id, moto_boite_id);

  -- B. MARINE PRODUCTS
  -- Marine engine oils (Outboard, Inboard, FC-W, TC-W3, Marine)
  UPDATE public."Product"
  SET "categoryId" = marine_moteurs_id
  WHERE ("nameFr" ~* '\b(marine|outboard|inboard|fc-w|tc-w3|nautic|bateau)\b'
     OR description ~* '\b(moteur marin|hors-bord|in-board|fc-w|tc-w3)\b');

  -- Marine grease
  UPDATE public."Product"
  SET "categoryId" = marine_graisses_id
  WHERE "nameFr" ~* '(marine grease|graisse marine)'
     OR description ~* '(marine grease|graisse marine)';

  -- C. TRANSMISSION & BOITE (AUTOMOBILE)
  UPDATE public."Product"
  SET "categoryId" = boite_id
  WHERE ("nameFr" ~* '\b(atf|dsg|dct|cvt|mtf|75w-80|75w-90|75w-85|80w-90|85w-140|hypoid|boîte|boite de vitesse|transmission fluid)\b'
     OR description ~* '\b(boîte automatique|boite manuelle|transmission automatique|pont arrière|différentiel)\b')
    AND "categoryId" NOT IN (moto_huiles_id, moto_boite_id, marine_moteurs_id);

  -- D. BRAKE FLUIDS (AUTOMOBILE)
  UPDATE public."Product"
  SET "categoryId" = frein_id
  WHERE ("nameFr" ~* '\b(dot 3|dot 4|dot 5\.1|liquide de frein|brake fluid)\b'
     OR description ~* '\b(liquide de frein|circuit de freinage)\b')
    AND "categoryId" NOT IN (moto_huiles_id, marine_moteurs_id);

  -- E. POWER STEERING & HYDRAULIC (AUTOMOBILE)
  UPDATE public."Product"
  SET "categoryId" = direction_id
  WHERE ("nameFr" ~* '\b(direction assistée|power steering|chf 11s|lhm|fluide hydraulique direction)\b'
     OR description ~* '\b(direction assistée|circuit hydraulique de direction)\b')
    AND "categoryId" NOT IN (moto_huiles_id, marine_moteurs_id);

  -- F. ADDITIVES (AUTOMOBILE)
  -- Additif Essence
  UPDATE public."Product"
  SET "categoryId" = additif_essence_id
  WHERE ("nameFr" ~* '(additif essence|injecteur essence|nettoyant essence|octane booster|valve cleaner)'
     OR description ~* '(additif essence|injection essence)')
    AND "categoryId" NOT IN (moto_huiles_id, marine_moteurs_id);

  -- Additif Diesel
  UPDATE public."Product"
  SET "categoryId" = additif_diesel_id
  WHERE ("nameFr" ~* '(additif diesel|injecteur diesel|nettoyant diesel|cétane|dpf cleaner|fap|anti-fumée diesel)'
     OR description ~* '(additif diesel|injection diesel|filtre à particules diesel)')
    AND "categoryId" NOT IN (moto_huiles_id, marine_moteurs_id);

  -- Additif Huile
  UPDATE public."Product"
  SET "categoryId" = additif_huile_id
  WHERE ("nameFr" ~* '(engine flush|rinçage moteur|stop fuite huile|oil treatment|mos2|ceratec|visco-stabil)'
     OR description ~* '(rinçage moteur|additif pour huile moteur)')
    AND "categoryId" NOT IN (moto_huiles_id, marine_moteurs_id);

  -- G. AUTOMOBILE ENGINE OILS (Everything with viscosity ratings not belonging to moto/marine)
  UPDATE public."Product"
  SET "categoryId" = huiles_id
  WHERE "categoryId" IS NULL 
     OR (
       "categoryId" NOT IN (
         moto_huiles_id, moto_boite_id, moto_fourche_id, moto_chaine_id,
         marine_moteurs_id, marine_graisses_id,
         boite_id, frein_id, direction_id,
         additifs_id, additif_essence_id, additif_diesel_id, additif_huile_id
       )
       AND (
         "nameFr" ~* '\b(0W-16|0W-20|0W-30|0W-40|5W-20|5W-30|5W-40|5W-50|10W-30|10W-40|10W-60|15W-40|15W-50|20W-50)\b'
         OR description ~* '\b(huile moteur|engine oil|lubrifiant moteur)\b'
       )
     );

END $$;

COMMIT;
