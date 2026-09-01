-- ============================================================
-- TAXONOMY & CATEGORY STRUCTURE SYNC
-- ============================================================

BEGIN;

-- 1. Ensure Root Categories Exist with Exact Slugs
INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
VALUES
  (gen_random_uuid()::text, 'Automobile', 'automobile', 1, NULL, '/categories/auto.webp'),
  (gen_random_uuid()::text, 'Pièces de Rechange / D''origine', 'auto-pieces-rechange', 2, NULL, '/categories/pieces.webp'),
  (gen_random_uuid()::text, 'Moto & Karting', 'moto-karting', 3, NULL, '/categories/moto.webp'),
  (gen_random_uuid()::text, 'Marine', 'marine', 4, NULL, '/categories/marine.webp'),
  (gen_random_uuid()::text, 'Entretien & Accessoires', 'entretien-accessoires', 5, NULL, '/categories/entretien.webp')
ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder";

-- 2. Reparent Subcategories under 'automobile'
DO $$
DECLARE auto_id text;
BEGIN
  SELECT id INTO auto_id FROM public."Category" WHERE slug = 'automobile';

  UPDATE public."Category" SET "parentId" = auto_id
  WHERE slug IN (
    'huiles-moteur',
    'additifs',
    'additifs-carburant',
    'adblue',
    'liquide-de-frein',
    'direction-assistee',
    'huile-de-boite',
    'liquides-auto'
  );
END $$;

-- 3. Reparent Subcategories under 'auto-pieces-rechange'
DO $$
DECLARE pieces_id text;
BEGIN
  SELECT id INTO pieces_id FROM public."Category" WHERE slug = 'auto-pieces-rechange';

  -- Update old slug if exists
  UPDATE public."Category" SET "parentId" = pieces_id
  WHERE slug IN (
    'pieces-rechange',
    'auto-filtres',
    'filtres-huile',
    'filtres-air',
    'filtres-carburant',
    'filtres-habitacle',
    'auto-freinage',
    'auto-suspension-direction',
    'transmission',
    'auto-electricite-eclairage',
    'essuie-glaces',
    'batteries',
    'auto-moteur-distribution',
    'auto-refroidissement-climatisation',
    'auto-echappement',
    'auto-carrosserie-habitacle',
    'auto-autres-pieces'
  );
END $$;

-- 4. Reparent Subcategories under 'moto-karting'
DO $$
DECLARE moto_id text;
BEGIN
  SELECT id INTO moto_id FROM public."Category" WHERE slug = 'moto-karting';

  UPDATE public."Category" SET "parentId" = moto_id
  WHERE slug IN (
    'moto',
    'moto-huiles',
    'huiles-moto-2t-4t',
    'moto-huile-boite',
    'moto-huile-fourche',
    'moto-lubrifiants-chaine'
  );
END $$;

-- 5. Reparent Subcategories under 'entretien-accessoires'
DO $$
DECLARE entretien_id text;
BEGIN
  SELECT id INTO entretien_id FROM public."Category" WHERE slug = 'entretien-accessoires';

  UPDATE public."Category" SET "parentId" = entretien_id
  WHERE slug IN (
    'nettoyage-interieur',
    'nettoyage-exterieur',
    'accessoires'
  );
END $$;

COMMIT;
