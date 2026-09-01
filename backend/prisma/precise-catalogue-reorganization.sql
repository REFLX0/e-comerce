-- ============================================================
-- FULL USER TAXONOMY REORGANIZATION & TITLE VOLUME NORMALIZATION
-- Applied across all 467 live products on SpecPart
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- 1. ROOT CATEGORIES (USER'S EXACT 4 ROOTS)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
VALUES
  (gen_random_uuid()::text, 'Automobile', 'automobile', 1, NULL, '/categories/auto.webp'),
  (gen_random_uuid()::text, 'Pièces de Rechange / D''origine', 'auto-pieces-rechange', 2, NULL, '/categories/pieces.webp'),
  (gen_random_uuid()::text, 'Moto & Karting', 'moto-karting', 3, NULL, '/categories/moto.webp'),
  (gen_random_uuid()::text, 'Marine', 'marine', 4, NULL, '/categories/marine.webp')
ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder";

-- ─────────────────────────────────────────────────────────────
-- 2. EXACT SUB-CATEGORIES PER USER SPECIFICATION
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  auto_id text;
  pieces_id text;
  moto_id text;
  marine_id text;
  additifs_id text;
  huiles_moteur_id text;
BEGIN
  SELECT id INTO auto_id FROM public."Category" WHERE slug = 'automobile';
  SELECT id INTO pieces_id FROM public."Category" WHERE slug = 'auto-pieces-rechange';
  SELECT id INTO moto_id FROM public."Category" WHERE slug = 'moto-karting';
  SELECT id INTO marine_id FROM public."Category" WHERE slug = 'marine';

  -- ── Automobile subcategories ──
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huile moteur', 'huiles-moteur', 1, auto_id),
    (gen_random_uuid()::text, 'Liquide de frein', 'liquide-de-frein', 2, auto_id),
    (gen_random_uuid()::text, 'Liquide de direction', 'direction-assistee', 3, auto_id),
    (gen_random_uuid()::text, 'Huile de boîte & transmission', 'huile-de-boite', 4, auto_id),
    (gen_random_uuid()::text, 'Additifs', 'additifs', 5, auto_id),
    (gen_random_uuid()::text, 'Liquides & Entretien', 'liquides-auto', 6, auto_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = auto_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Sub-syntheses under huiles-moteur
  SELECT id INTO huiles_moteur_id FROM public."Category" WHERE slug = 'huiles-moteur';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, '100% Synthèse', 'auto-synthese', 1, huiles_moteur_id),
    (gen_random_uuid()::text, 'Semi-Synthèse', 'auto-semi', 2, huiles_moteur_id),
    (gen_random_uuid()::text, 'Minérale', 'auto-minerale', 3, huiles_moteur_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = huiles_moteur_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Under Additifs
  SELECT id INTO additifs_id FROM public."Category" WHERE slug = 'additifs';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Additif Essence', 'additif-essence', 1, additifs_id),
    (gen_random_uuid()::text, 'Additif Diesel', 'additif-diesel', 2, additifs_id),
    (gen_random_uuid()::text, 'Additif Huile & Rinçage', 'additif-huile', 3, additifs_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = additifs_id, "sortOrder" = EXCLUDED."sortOrder";

  -- ── Pièces de Rechange subcategories ──
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
    (gen_random_uuid()::text, 'Échappement', 'auto-echappement', 9, pieces_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = pieces_id, "sortOrder" = EXCLUDED."sortOrder";

  -- ── Moto & Karting subcategories ──
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huiles spécifiques Moto', 'moto-huiles', 1, moto_id),
    (gen_random_uuid()::text, 'Huile de boîte Moto', 'moto-huile-boite', 2, moto_id),
    (gen_random_uuid()::text, 'Huile de fourche', 'moto-huile-fourche', 3, moto_id),
    (gen_random_uuid()::text, 'Lubrifiants de chaîne & additifs', 'moto-lubrifiants-chaine', 4, moto_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = moto_id, "sortOrder" = EXCLUDED."sortOrder";

  -- ── Marine subcategories ──
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huiles moteurs marins', 'marine-moteurs', 1, marine_id),
    (gen_random_uuid()::text, 'Hydraulique Marine', 'marine-hydraulique', 2, marine_id),
    (gen_random_uuid()::text, 'Graisses et additifs Marine', 'marine-graisses', 3, marine_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = marine_id, "sortOrder" = EXCLUDED."sortOrder";

END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. PRODUCT TITLE CLEANING & VOLUME NORMALIZATION
-- ─────────────────────────────────────────────────────────────
-- [liquides-auto] MAFRA Diamant Plast Dressing Pro
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MAFRA Diamant Plast Dressing Pro'
WHERE id = '2ed51e25-aee5-4e73-a97c-22c9036bf92b';
UPDATE public."ProductVariant" 
SET volume = '750ML'
WHERE "productId" = '2ed51e25-aee5-4e73-a97c-22c9036bf92b' AND (volume IS NULL OR volume = '');
-- [auto-filtres] Filtre habitacle MISFAT HB205 FIAT 500 / FORD KA
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'Filtre habitacle MISFAT HB205 FIAT 500 / FORD KA'
WHERE id = '501df26d-3285-4173-9bdc-1ca901a3e504';
-- [auto-electricite-eclairage] BOSCH – A 299 S – (3 397 007 299) Balai d’essuie-glace FIAT 500 / FORD KA
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'BOSCH – A 299 S – (3 397 007 299) Balai d’essuie-glace FIAT 500 / FORD KA'
WHERE id = '19821692-15f6-43a7-892b-ca8126f34341';
-- [auto-filtres] Filtre à Huile MISFAT Z438 FIAT / FORD
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'Filtre à Huile MISFAT Z438 FIAT / FORD'
WHERE id = '71c94547-c372-4d9f-893e-cebd0dbc5d99';
-- [auto-filtres] Filtre à air MISFAT P 301A FIAT / FORD
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'Filtre à air MISFAT P 301A FIAT / FORD'
WHERE id = '39d7dda7-488e-40f0-b45c-cd720f622e27';
-- [additif-diesel] MANNOL Additif ester diesel 9930
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'MANNOL Additif ester diesel 9930'
WHERE id = '36ed3b9b-6ad8-4c8d-bc94-a383e1b39338';
UPDATE public."ProductVariant" 
SET volume = '100ML'
WHERE "productId" = '36ed3b9b-6ad8-4c8d-bc94-a383e1b39338' AND (volume IS NULL OR volume = '');
-- [auto-electricite-eclairage] Balai d’Essuie-Glace Plat KRAWEHL MAX – 1 pc 60CM
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'Balai d’Essuie-Glace Plat KRAWEHL MAX – 1 pc 60CM'
WHERE id = '3f733ea6-6356-4788-89f9-dfa4917c6600';
-- [auto-electricite-eclairage] Balai d’Essuie-Glace Plat KRAWEHL MAX – 1 pc 40CM
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'Balai d’Essuie-Glace Plat KRAWEHL MAX – 1 pc 40CM'
WHERE id = '024de0e3-6173-4ff8-aba9-a86526545e46';
-- [auto-filtres] FILTRE A AIR MISFAT P460A RENAULT
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'FILTRE A AIR MISFAT P460A RENAULT'
WHERE id = '2ebe4d26-52e6-44ea-ac5d-9fe15be52a9a';
-- [auto-filtres] FILTRE A HUILE MISFAT Z692 RENAULT
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'FILTRE A HUILE MISFAT Z692 RENAULT'
WHERE id = '272b8394-6fe4-438d-b4a5-92b49ae754b0';
-- [auto-filtres] MANN-FILTER  Filtre à huile W 712/94 (WV)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER  Filtre à huile W 712/94 (WV)'
WHERE id = 'a7b89ff9-5988-48d0-9f4d-b9b911b40c31';
-- [auto-filtres] MANN-FILTER (CU 8430 ) Filtre d’habitacle
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER (CU 8430 ) Filtre d’habitacle'
WHERE id = '8c0ae67b-6de1-419b-b0cc-cb6bf0609740';
-- [huiles-moteur] Castrol Magnatec Professional E 5W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Castrol Magnatec Professional E 5W-20'
WHERE id = '7af154a9-2bc4-40af-99ab-0749ae25e1f6';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '7af154a9-2bc4-40af-99ab-0749ae25e1f6' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] CASTROL EDGE C3 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'CASTROL EDGE C3 5W-40'
WHERE id = '84c181e3-2d3f-4465-b199-15057def0099';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '84c181e3-2d3f-4465-b199-15057def0099' AND (volume IS NULL OR volume = '');
-- [auto-filtres] MANN-FILTER – (HU 815/2 x) Filtre à huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER – (HU 815/2 x) Filtre à huile'
WHERE id = 'c30dd6ad-3666-4ed6-bade-81ec686b11d7';
-- [liquides-auto] BOSCH 3 397 007 072 – A 072 S –
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'BOSCH 3 397 007 072 – A 072 S –'
WHERE id = '8ebcf9b5-53d1-4050-a121-7501e7d002b3';
-- [auto-electricite-eclairage] Balai d’Essuie-Glace- Arrière Universel – 1 pc (35cm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'Balai d’Essuie-Glace- Arrière Universel – 1 pc (35cm)'
WHERE id = 'a8bd4779-2bbb-44e5-9820-aa82c5ad767f';
-- [auto-filtres] MISFAT- Z413 FILTRE A HUILE FORD ECOBOOST
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MISFAT- Z413 FILTRE A HUILE FORD ECOBOOST'
WHERE id = 'b197487b-0625-4589-adbc-40feb9cbfe6f';
-- [additifs] MANNOL Additif Ester de Benzine  9950
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'MANNOL Additif Ester de Benzine  9950'
WHERE id = '1c02ef3d-73bd-4dc8-9439-ab3aac52dea3';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = '1c02ef3d-73bd-4dc8-9439-ab3aac52dea3' AND (volume IS NULL OR volume = '');
-- [auto-filtres] MISFAT – Z646 Filtre à huile vw
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MISFAT – Z646 Filtre à huile vw'
WHERE id = 'b5c96f1e-afa7-4ad2-89eb-16cf8940335d';
-- [additif-diesel] PRO TEC Systèmes Diesel Super Clean
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'PRO TEC Systèmes Diesel Super Clean'
WHERE id = 'd75884bf-6c44-4b18-b57f-77f8d3cbdde1';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = 'd75884bf-6c44-4b18-b57f-77f8d3cbdde1' AND (volume IS NULL OR volume = '');
-- [additif-diesel] MANNOL Nettoyant à jet diesel 9956
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'MANNOL Nettoyant à jet diesel 9956'
WHERE id = '2ef92b6b-58cd-459a-bf4e-9a135cebba0e';
-- [liquides-auto] MANNOL Nettoyant pour injecteurs 9957
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Nettoyant pour injecteurs 9957'
WHERE id = '143edb83-2900-4fe1-a7e7-99fa58c961f0';
-- [liquides-auto] Mannol Shampoing super concentré
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Shampoing super concentré'
WHERE id = 'da736a59-2726-4b69-9865-a523ee52b92b';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'da736a59-2726-4b69-9865-a523ee52b92b' AND (volume IS NULL OR volume = '');
-- [auto-filtres] WUNDER filtre à air OPEL CORSA D
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'WUNDER filtre à air OPEL CORSA D'
WHERE id = '757932ad-7341-404b-987d-b1f8eda78ea8';
-- [auto-filtres] MANN-FILTER – C14 130 Filtre à air
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER – C14 130 Filtre à air'
WHERE id = '36bc826c-7166-4d96-b3ba-cd73d60798d5';
-- [auto-filtres] MANN-FILTER – C 27 009 Filtre à air (golf 7 leon)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER – C 27 009 Filtre à air (golf 7 leon)'
WHERE id = '7ceaf4b7-0987-4994-bfb7-22fda688d67b';
-- [auto-filtres] MANN-FILTER Filtre à huile W 712/95 (VW)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER Filtre à huile W 712/95 (VW)'
WHERE id = '0d051d49-6514-4d86-8af2-b1aef617cab1';
-- [liquides-auto] FEBI AdBlue®
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'FEBI AdBlue®'
WHERE id = 'ed4d6f9a-f5c1-4e0f-8ad2-0e68c9effde9';
UPDATE public."ProductVariant" 
SET volume = '10L'
WHERE "productId" = 'ed4d6f9a-f5c1-4e0f-8ad2-0e68c9effde9' AND (volume IS NULL OR volume = '');
-- [auto-filtres] MISFAT Filtre à huile  – L064A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MISFAT Filtre à huile  – L064A'
WHERE id = '74d08a0e-dac1-4ee1-b0f1-51c6149a02f2';
-- [auto-electricite-eclairage] VARTA A9 SILVER DYNAMIC AGM XEV 12V 50AH 540A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA A9 SILVER DYNAMIC AGM XEV 12V 50AH 540A'
WHERE id = '49bef94b-a39e-468b-9d05-d093200ab266';
-- [auto-electricite-eclairage] VARTA – Silver Dynamic AGM A4 L6 105 Ah 950A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Silver Dynamic AGM A4 L6 105 Ah 950A'
WHERE id = '2a8dc928-314d-4d3e-a87f-6435291d7852';
-- [auto-electricite-eclairage] VARTA – Silver Dynamic AGM A5 L5 95 Ah 850A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Silver Dynamic AGM A5 L5 95 Ah 850A'
WHERE id = 'eef1ecb8-a90d-4215-9893-6168433d710d';
-- [auto-electricite-eclairage] VARTA silver dynamic A6 AGM 80ah 800A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA silver dynamic A6 AGM 80ah 800A'
WHERE id = '6e08b769-84c1-48f1-a331-534bc8a52243';
-- [auto-electricite-eclairage] VARTA – Silver Dynamic AGM A7 L3 70 Ah 760A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Silver Dynamic AGM A7 L3 70 Ah 760A'
WHERE id = '3e59308b-206f-4c7c-a5ad-e48f524c3c4e';
-- [auto-electricite-eclairage] VARTA – Silver Dynamic AGM A8 L2 60 Ah 680A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Silver Dynamic AGM A8 L2 60 Ah 680A'
WHERE id = '2282e4ca-4808-4e4b-8439-3de2dc076c95';
-- [auto-electricite-eclairage] VARTA – Silver Dynamic D21 L2B 61 Ah 600A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Silver Dynamic D21 L2B 61 Ah 600A'
WHERE id = 'd0f79fc8-c785-47ec-951a-8b6329656b62';
-- [auto-electricite-eclairage] VARTA Blue Dynamic G8 M11G 95ah 830A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA Blue Dynamic G8 M11G 95ah 830A'
WHERE id = '6ba479bc-726e-476f-b957-43c734dd06cc';
-- [auto-electricite-eclairage] VARTA – Blue Dynamic G7 M11 95 Ah 830A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Blue Dynamic G7 M11 95 Ah 830A'
WHERE id = 'e1e7eb9b-b4ce-41c5-b3da-e74e4cc5cfd5';
-- [auto-electricite-eclairage] VARTA – Blue Dynamic E24 M10G 70 Ah 630A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Blue Dynamic E24 M10G 70 Ah 630A'
WHERE id = '9aee82cf-79ca-4f41-ae0f-0ea82f049229';
-- [auto-electricite-eclairage] VARTA -Blue Dynamic E23 M10 70 Ah 630A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA -Blue Dynamic E23 M10 70 Ah 630A'
WHERE id = '3cb41255-5771-4978-ba4f-f0f7b6132d2f';
-- [liquides-auto] AREXONS Nettoyant tissus
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS Nettoyant tissus'
WHERE id = 'd6c81c91-c2ab-4c4c-95c2-50a7150610c6';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = 'd6c81c91-c2ab-4c4c-95c2-50a7150610c6' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AREXONS no insectes
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS no insectes'
WHERE id = '255cf1cd-be42-497d-adac-f5f6043f9a0c';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '255cf1cd-be42-497d-adac-f5f6043f9a0c' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AREXONS rénovateur pneus
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS rénovateur pneus'
WHERE id = '4d20a99c-525c-43f2-9ece-2d645fe4a5e7';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '4d20a99c-525c-43f2-9ece-2d645fe4a5e7' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AREXONS nettoyant jantes
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS nettoyant jantes'
WHERE id = 'f57ab44c-c5e6-43d1-99b1-1ade9b389854';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = 'f57ab44c-c5e6-43d1-99b1-1ade9b389854' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AREXONS nettoyant cuir
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS nettoyant cuir'
WHERE id = 'aabfa400-a402-425a-93d0-9cc5ab2f1893';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = 'aabfa400-a402-425a-93d0-9cc5ab2f1893' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AREXONS shampooing et cire
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS shampooing et cire'
WHERE id = 'cd56734d-d49f-415c-ab25-91524a0113e8';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'cd56734d-d49f-415c-ab25-91524a0113e8' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AREXONS Super shampooing
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS Super shampooing'
WHERE id = 'b5a3f6c3-c855-449f-ba2b-919d8d41a59b';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'b5a3f6c3-c855-449f-ba2b-919d8d41a59b' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AREXONS Protecteur cockpit mat
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS Protecteur cockpit mat'
WHERE id = '4c5b5df8-30f9-4b0a-bf56-9645b78094f5';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '4c5b5df8-30f9-4b0a-bf56-9645b78094f5' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Ready Mix RAF 11
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Ready Mix RAF 11'
WHERE id = '58266a6f-917d-4753-87ad-03c7afd04e0e';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '58266a6f-917d-4753-87ad-03c7afd04e0e' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Ready Mix RAF 12+
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Ready Mix RAF 12+'
WHERE id = '01671e12-829e-4442-8684-e749493ee89b';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '01671e12-829e-4442-8684-e749493ee89b' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AREXONS Nettoyant moteur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AREXONS Nettoyant moteur'
WHERE id = '79d0ded6-e3b0-43c1-949e-46e5a82a5786';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '79d0ded6-e3b0-43c1-949e-46e5a82a5786' AND (volume IS NULL OR volume = '');
-- [auto-filtres] BOSCH F 026 407 006 Filtre à huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'BOSCH F 026 407 006 Filtre à huile'
WHERE id = '1cea0117-6b5a-455a-a14c-537396e6ca7d';
-- [auto-electricite-eclairage] NOUR SMART L2 EFB 62AH 560A START & STOP
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NOUR SMART L2 EFB 62AH 560A START & STOP'
WHERE id = '09856d63-93d1-4c09-8e5e-c24408fd759f';
-- [auto-electricite-eclairage] VARTA Black Dynamic B20 L1G 45 Ah 400A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA Black Dynamic B20 L1G 45 Ah 400A'
WHERE id = 'fac3a808-0b39-4ab9-ac9b-b6bb4621db8a';
-- [auto-electricite-eclairage] NOUR SMART L5 100AH 850A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NOUR SMART L5 100AH 850A'
WHERE id = 'efde3f31-e74c-459a-9ab5-4e2f6368268d';
-- [auto-electricite-eclairage] NOUR SMART L1 52AH 500A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NOUR SMART L1 52AH 500A'
WHERE id = '6a35f470-ffad-4fbb-a759-373d15a6f59c';
-- [auto-electricite-eclairage] BATTERIE ASSAD 800A, 95AH, L5D
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'BATTERIE ASSAD 800A, 95AH, L5D'
WHERE id = '8186fffc-677e-4350-b045-2d064f97fa2a';
-- [auto-carrosserie-habitacle] Borsehung Bouton, lève-vitre (B11415)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-carrosserie-habitacle'),
    "nameFr" = 'Borsehung Bouton, lève-vitre (B11415)'
WHERE id = 'f368dcd0-2846-4cb6-a9a8-b1c4039576d6';
-- [auto-moteur-distribution] DOLZ KD004 (Kit de distribution + pompe à eau)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-moteur-distribution'),
    "nameFr" = 'DOLZ KD004 (Kit de distribution + pompe à eau)'
WHERE id = 'd3e2c994-2515-42d2-9593-ab549a1ddc13';
-- [auto-electricite-eclairage] VARTA – Blue Dynamic D47 D23 60 Ah 540A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Blue Dynamic D47 D23 60 Ah 540A'
WHERE id = '4d409bbf-85df-4e1d-a3d2-4309ca1ea0cf';
-- [auto-filtres] Filtre Habitacle BOSCH (1 987 432 057)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'Filtre Habitacle BOSCH (1 987 432 057)'
WHERE id = 'cd8c04e2-8386-4f81-8a7c-0d0e6d58ed97';
-- [auto-filtres] MANN FILTER CU 26 009 Filtre habitacle VW
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN FILTER CU 26 009 Filtre habitacle VW'
WHERE id = '36b80fdd-c182-449c-a7c0-8150ff5254fc';
-- [auto-filtres] MANN-FILTER Filtre Habitacle CU 2939
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER Filtre Habitacle CU 2939'
WHERE id = 'b630a6a2-acaa-426b-a0dc-c9f2bcc11b46';
-- [auto-electricite-eclairage] VARTA – Blue Dynamic D48 60 Ah 540A D
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Blue Dynamic D48 60 Ah 540A D'
WHERE id = 'c9995969-8d07-4a50-8bad-8af988c476b0';
UPDATE public."ProductVariant" 
SET volume = '23G'
WHERE "productId" = 'c9995969-8d07-4a50-8bad-8af988c476b0' AND (volume IS NULL OR volume = '');
-- [auto-electricite-eclairage] NEOLUX LED Intérieur  (6000 K) 26.8 mm W2.1×9.5d
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NEOLUX LED Intérieur  (6000 K) 26.8 mm W2.1×9.5d'
WHERE id = 'fc4d3772-e09c-4b06-8a04-0029308c1b75';
-- [additif-diesel] PRO TEC Nettoyant DPF/Catalyseur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'PRO TEC Nettoyant DPF/Catalyseur'
WHERE id = '019404ad-e469-4aa7-8d4a-d07c0379cb55';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '019404ad-e469-4aa7-8d4a-d07c0379cb55' AND (volume IS NULL OR volume = '');
-- [additif-diesel] Liqui Moly  Nettoyant pour système d’ad­mis­sion diesel Pro-Line
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'Liqui Moly  Nettoyant pour système d’ad­mis­sion diesel Pro-Line'
WHERE id = 'b127f230-6ff9-4817-b8e4-a0e5e5615359';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'b127f230-6ff9-4817-b8e4-a0e5e5615359' AND (volume IS NULL OR volume = '');
-- [additif-diesel] MANNOL Nettoyant mousse DPF 9694
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'MANNOL Nettoyant mousse DPF 9694'
WHERE id = '513066dd-12ee-47a0-9602-dd4d70044526';
-- [auto-electricite-eclairage] VARTA -Blue Dynamic E11 L3 74 Ah 680A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA -Blue Dynamic E11 L3 74 Ah 680A'
WHERE id = '9cea37f9-7684-40e0-b54b-a65bc864794b';
-- [auto-electricite-eclairage] VARTA – Blue Dynamic D43 L2G 60 Ah 540A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Blue Dynamic D43 L2G 60 Ah 540A'
WHERE id = 'de1c575e-931e-4fc5-866d-c4aba4a19728';
-- [auto-electricite-eclairage] VARTA – Blue Dynamic D59 L2 60 Ah 540A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Blue Dynamic D59 L2 60 Ah 540A'
WHERE id = 'af298551-6508-49db-b44e-213a93b7ba60';
-- [auto-electricite-eclairage] VARTA – Blue Dynamic B34 B24RS 45 Ah 330A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Blue Dynamic B34 B24RS 45 Ah 330A'
WHERE id = '6bd296cd-cc5e-404a-9485-8faea9ab29eb';
-- [auto-electricite-eclairage] VARTA – Blue Dynamic B32 B24RS 45 Ah 330A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Blue Dynamic B32 B24RS 45 Ah 330A'
WHERE id = '9ce1b5a0-1a97-488d-b8ae-7f977501fb47';
-- [auto-electricite-eclairage] VARTA -Blue Dynamic B18 L1B 44 Ah 440A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA -Blue Dynamic B18 L1B 44 Ah 440A'
WHERE id = '911fcae1-4e1c-40a7-98b2-5dcc5c167bec';
-- [auto-electricite-eclairage] VARTA – Black Dynamic F6 L5 90 Ah 720A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA – Black Dynamic F6 L5 90 Ah 720A'
WHERE id = '4b4e98c0-58f4-444a-9fba-f99d72740d3c';
-- [auto-electricite-eclairage] VARTA Black Dynamic E9 L3 70 Ah 640A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA Black Dynamic E9 L3 70 Ah 640A'
WHERE id = '2b3e5726-801e-421b-b7aa-e51cfd058b67';
-- [auto-filtres] BOSCH – F 026 407 006 Filtre à huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'BOSCH – F 026 407 006 Filtre à huile'
WHERE id = 'e5934a29-c32a-4658-95d4-5860e22465f8';
-- [auto-filtres] BOSCH – F 026 407 157 Filtre à huile (VW)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'BOSCH – F 026 407 157 Filtre à huile (VW)'
WHERE id = '06290c20-e8a4-499b-8106-377f12917417';
-- [auto-filtres] BOSCH – F 026 407 181 Filtre à huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'BOSCH – F 026 407 181 Filtre à huile'
WHERE id = '24d5fea7-142a-4b72-af06-e9733972a58f';
-- [auto-filtres] MANN-FILTER – HU 7008 z Filtre à huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER – HU 7008 z Filtre à huile'
WHERE id = '45b31746-a729-4af1-a348-5fdb42f50308';
-- [auto-electricite-eclairage] VARTA Black Dynamic C11 L2 53 Ah 500A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA Black Dynamic C11 L2 53 Ah 500A'
WHERE id = 'c7f21fce-aba6-4dad-b9be-303a3ce5dbb5';
-- [auto-electricite-eclairage] VARTA Black Dynamic B19 L1 45 Ah 400A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA Black Dynamic B19 L1 45 Ah 400A'
WHERE id = '39eac873-83a9-48bf-bb10-1a2daacfc59e';
-- [auto-electricite-eclairage] VARTA Blue Dynamic A14 40ah 330A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA Blue Dynamic A14 40ah 330A'
WHERE id = '6f7ad1a8-4a64-484a-a234-639383327fd3';
-- [auto-electricite-eclairage] VARTA Blue Dynamic A13 40ah 330A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'VARTA Blue Dynamic A13 40ah 330A'
WHERE id = 'c539b381-6f99-4b16-9179-b92bd59ce7e9';
-- [auto-electricite-eclairage] ASSAD MF3 D/G 74AH 660A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD MF3 D/G 74AH 660A'
WHERE id = '6e7d93fc-fbee-47ec-bac5-690c75485255';
-- [auto-electricite-eclairage] ASSAD MF2 D/G 62AH 560A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD MF2 D/G 62AH 560A'
WHERE id = '154b445a-4747-4d40-9aee-c563299632f1';
-- [auto-electricite-eclairage] ASSAD MF1 D/G 50AH 480A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD MF1 D/G 50AH 480A'
WHERE id = 'fdbf645c-ff35-41b0-a61d-3a2bf01582dd';
-- [auto-electricite-eclairage] ASSAD SUPER TURBO TRUCK MF11G  100AH, 760A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD SUPER TURBO TRUCK MF11G  100AH, 760A'
WHERE id = '4c4eac2c-2382-483d-926a-1221834bebf8';
-- [auto-electricite-eclairage] ASSAD M12P G/D 112AH 750A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD M12P G/D 112AH 750A'
WHERE id = '39141e0c-e257-4198-8880-04e283b709d1';
-- [auto-electricite-eclairage] BATTERIE ASSAD TURBO PRO D90G 90AH 680A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'BATTERIE ASSAD TURBO PRO D90G 90AH 680A'
WHERE id = '49648117-4c00-4305-8a8d-c583448579fe';
-- [auto-electricite-eclairage] BATTERIE ASSAD TURBO PRO M10G 65AH 510A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'BATTERIE ASSAD TURBO PRO M10G 65AH 510A'
WHERE id = '111eb99b-3541-4ebf-a164-2193b86ac395';
-- [auto-electricite-eclairage] ASSAD SUPER TURBO TRUCK MF10G  72AH, 620A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD SUPER TURBO TRUCK MF10G  72AH, 620A'
WHERE id = '31fa0fbe-19de-4943-b22a-4aaf82e4c02f';
-- [liquides-auto] BIDON DE VIDANGE D’HUILE
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'BIDON DE VIDANGE D’HUILE'
WHERE id = 'de42acd4-1c69-49b3-9ed7-4371b4782af4';
UPDATE public."ProductVariant" 
SET volume = '10L'
WHERE "productId" = 'de42acd4-1c69-49b3-9ed7-4371b4782af4' AND (volume IS NULL OR volume = '');
-- [auto-electricite-eclairage] NOUR SMART L3 75AH 700A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NOUR SMART L3 75AH 700A'
WHERE id = 'dc65d322-9639-4427-b727-20b737386b72';
-- [auto-electricite-eclairage] NOUR SMART L2 62AH 600A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NOUR SMART L2 62AH 600A'
WHERE id = '3d9ace08-8429-45bc-85cf-8c23bf91f511';
-- [moto-huiles] Motorbike 4T 5W-40 HC Street
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T 5W-40 HC Street'
WHERE id = 'f721febd-dbf8-4e83-8d44-feaf3add41e1';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'f721febd-dbf8-4e83-8d44-feaf3add41e1' AND (volume IS NULL OR volume = '');
-- [auto-filtres] BORSEHUNG Filtre à carburant (essence) B12822 VW TSI
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'BORSEHUNG Filtre à carburant (essence) B12822 VW TSI'
WHERE id = '10d67ba9-58c4-476f-92ef-94a8885a0e0d';
-- [moto-lubrifiants-chaine] MANNOL Pack entretien moto
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'MANNOL Pack entretien moto'
WHERE id = '95ad68fa-4d1d-4c58-8469-a8007005081c';
-- [moto-lubrifiants-chaine] Mannol Nettoyant pour chaîne
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'Mannol Nettoyant pour chaîne'
WHERE id = 'c7a66c67-796e-42e8-a530-b1a011c3221e';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'c7a66c67-796e-42e8-a530-b1a011c3221e' AND (volume IS NULL OR volume = '');
-- [auto-filtres] BORSEHUNG Filtre à carburant (essence) B12822 VW TSI
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'BORSEHUNG Filtre à carburant (essence) B12822 VW TSI'
WHERE id = '10d67ba9-58c4-476f-92ef-94a8885a0e0d';
-- [moto-lubrifiants-chaine] MANNOL Pack entretien moto
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'MANNOL Pack entretien moto'
WHERE id = '95ad68fa-4d1d-4c58-8469-a8007005081c';
-- [moto-lubrifiants-chaine] Mannol Nettoyant pour chaîne
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'Mannol Nettoyant pour chaîne'
WHERE id = 'c7a66c67-796e-42e8-a530-b1a011c3221e';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'c7a66c67-796e-42e8-a530-b1a011c3221e' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol Graisse blanche
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Graisse blanche'
WHERE id = 'ae9525d1-0095-48ff-9056-3c116363a6de';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = 'ae9525d1-0095-48ff-9056-3c116363a6de' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Lubrifiant M-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Lubrifiant M-40'
WHERE id = 'b9c324c7-20bd-4b17-8761-bcebad8888bf';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'b9c324c7-20bd-4b17-8761-bcebad8888bf' AND (volume IS NULL OR volume = '');
-- [liquides-auto] PRO TEC Nettoyant pour corps de papillon
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'PRO TEC Nettoyant pour corps de papillon'
WHERE id = '6ac600ad-5d68-4659-a73c-2d3a612f4032';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '6ac600ad-5d68-4659-a73c-2d3a612f4032' AND (volume IS NULL OR volume = '');
-- [additif-diesel] PRO TEC Diesel applicator spray
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'PRO TEC Diesel applicator spray'
WHERE id = 'ecd09da5-7c9e-4289-a652-ece1c0c6e7f8';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'ecd09da5-7c9e-4289-a652-ece1c0c6e7f8' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Liqui Moly Motorbike 2T Street
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Liqui Moly Motorbike 2T Street'
WHERE id = 'df087b0c-651f-4af3-81be-cb5d3d62363e';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'df087b0c-651f-4af3-81be-cb5d3d62363e' AND (volume IS NULL OR volume = '');
-- [moto-huiles] WOLF MOTO & SCOOTER 2T
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'WOLF MOTO & SCOOTER 2T'
WHERE id = 'ed0b324f-f08e-420a-b8b4-231fdf352104';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'ed0b324f-f08e-420a-b8b4-231fdf352104' AND (volume IS NULL OR volume = '');
-- [additif-huile] Additif pour huile ( MOS 2 )
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'Additif pour huile ( MOS 2 )'
WHERE id = '950d9c4e-f44a-4423-8c41-f1da769b8097';
-- [auto-electricite-eclairage] Balai d’essuie-glace BOSCH – A 979 S
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'Balai d’essuie-glace BOSCH – A 979 S'
WHERE id = '45a798ff-bd52-4483-a048-6053ddd8dbff';
-- [auto-electricite-eclairage] BOSCH Balai d’essuie-glace Arrière – A 282 H –
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'BOSCH Balai d’essuie-glace Arrière – A 282 H –'
WHERE id = 'cd9ded9a-03ba-4dff-92c0-3398ef4fc91e';
-- [auto-electricite-eclairage] BOSCH Balai d’essuie-glace Arrière – A 331 H –
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'BOSCH Balai d’essuie-glace Arrière – A 331 H –'
WHERE id = '67eb31b9-57de-4ea8-8c36-d97b09e1adba';
-- [huiles-moteur] MANNOL Toyota Lexus 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Toyota Lexus 5W-30'
WHERE id = '35cb911c-2a4b-4ebd-b65f-dc588a819d8d';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = '35cb911c-2a4b-4ebd-b65f-dc588a819d8d' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Molibden
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Molibden'
WHERE id = '1102d883-1beb-4b0b-b5fb-88e7ff5099ee';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = '1102d883-1beb-4b0b-b5fb-88e7ff5099ee' AND (volume IS NULL OR volume = '');
-- [liquides-auto] FAR-BER Polish Plus Aroma
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'FAR-BER Polish Plus Aroma'
WHERE id = 'd0b9754d-a542-4ebf-a3c2-971390a6cd7e';
UPDATE public."ProductVariant" 
SET volume = '750ML'
WHERE "productId" = 'd0b9754d-a542-4ebf-a3c2-971390a6cd7e' AND (volume IS NULL OR volume = '');
-- [auto-electricite-eclairage] BOSCH Balai d’essuie-glace – A 945 S –
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'BOSCH Balai d’essuie-glace – A 945 S –'
WHERE id = 'f24f62b1-c839-458e-811d-907503734d6a';
-- [auto-electricite-eclairage] JOTATE Balai d’Essuie-Glace Arrière Universel -1 pc (11″ 28cm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'JOTATE Balai d’Essuie-Glace Arrière Universel -1 pc (11″ 28cm)'
WHERE id = '0c66aa0c-873d-4783-b8b6-2454899c4602';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME – 1 pc (28″ 700mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (28″ 700mm)'
WHERE id = 'f287ea9f-2342-47a1-8a0f-9549354ef910';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME – 1 pc (26″ 650mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (26″ 650mm)'
WHERE id = '60408742-0cbe-4251-be31-a224aa80348c';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME – 1 pc (24″ 600mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (24″ 600mm)'
WHERE id = '873e705c-5b6d-47df-8b83-684a7ebed781';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME – 1 pc (22″ 550mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (22″ 550mm)'
WHERE id = '5bf09b17-ba1b-43a5-b2ff-81d5cd876c23';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME – 1 pc (21″ 530mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (21″ 530mm)'
WHERE id = 'e66ad84e-144b-4245-bc9b-2a8144f8530f';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME – 1 pc (20″ 510mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (20″ 510mm)'
WHERE id = 'f39333f0-65a5-4629-9772-d0b7e92a6f10';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME – 1 pc (19″ 480mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (19″ 480mm)'
WHERE id = '6a3dae08-2a69-42a6-b419-7bdcebbb22bd';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME-1 pc (18″ 450mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME-1 pc (18″ 450mm)'
WHERE id = 'd07d57e6-e9a0-4a01-bd1f-2ecc40eb456a';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME -1 pc  (350mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME -1 pc  (350mm)'
WHERE id = 'f5522070-ec38-4922-9943-4d4c545e2c7f';
-- [auto-electricite-eclairage] KRAWEHL Balais d’essuie-glace PRIME – 1 pc (16″ 410mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (16″ 410mm)'
WHERE id = 'daeeafd1-1888-4ce1-a41f-8c53ffa295da';
-- [auto-filtres] MANN-FILTER Filtre à huile HU 7008 z (vw)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER Filtre à huile HU 7008 z (vw)'
WHERE id = 'b7ce17f5-0c33-4afa-ad3d-d502bdcde845';
-- [auto-electricite-eclairage] JOTATE Balai d’Essuie-Glace Arrière Universel -1 pc (12″ 30cm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'JOTATE Balai d’Essuie-Glace Arrière Universel -1 pc (12″ 30cm)'
WHERE id = 'b929a363-8184-48b9-af36-aa136a58bb7e';
-- [liquides-auto] MAFRA KIT DE REGENERATION JANTES
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MAFRA KIT DE REGENERATION JANTES'
WHERE id = '1dccae2e-fe30-404c-b8d8-72e0fef25a1a';
-- [liquides-auto] MAFRA KIT DE REGENERATION DES PHARES
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MAFRA KIT DE REGENERATION DES PHARES'
WHERE id = 'c37d82de-8649-401c-b7a6-4ffddf1e6b9a';
-- [liquides-auto] MAFRA STOP RAYURES
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MAFRA STOP RAYURES'
WHERE id = 'bdf404f2-6120-4fb9-9fd8-7e04baa717d1';
UPDATE public."ProductVariant" 
SET volume = '100ML'
WHERE "productId" = 'bdf404f2-6120-4fb9-9fd8-7e04baa717d1' AND (volume IS NULL OR volume = '');
-- [auto-carrosserie-habitacle] MAFRA ENTRETIEN TABLEAU DE BORD BLUE
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-carrosserie-habitacle'),
    "nameFr" = 'MAFRA ENTRETIEN TABLEAU DE BORD BLUE'
WHERE id = 'f3dd82b5-a44d-422f-994a-57184fa7c030';
UPDATE public."ProductVariant" 
SET volume = '600ML'
WHERE "productId" = 'f3dd82b5-a44d-422f-994a-57184fa7c030' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MAFRA SHAMPOING AUTO
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MAFRA SHAMPOING AUTO'
WHERE id = 'f04412f7-ec50-4d0f-ab5b-5dbf804045be';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'f04412f7-ec50-4d0f-ab5b-5dbf804045be' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MAFRA PULIMAX
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MAFRA PULIMAX'
WHERE id = '352d8bc1-7e1f-40d9-ad43-4e53ad7dfe47';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '352d8bc1-7e1f-40d9-ad43-4e53ad7dfe47' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Diesel Extra 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Diesel Extra 10W-40'
WHERE id = 'f7e9f6f3-8c28-4bd9-8ceb-2e555562cc30';
UPDATE public."ProductVariant" 
SET volume = '10L'
WHERE "productId" = 'f7e9f6f3-8c28-4bd9-8ceb-2e555562cc30' AND (volume IS NULL OR volume = '');
-- [auto-electricite-eclairage] ASSAD TURBO VL L1 D/G 45AH 380A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD TURBO VL L1 D/G 45AH 380A'
WHERE id = 'ece534af-37e8-455e-af2b-4343319b1adb';
-- [auto-electricite-eclairage] ASSAD TURBO VL L2 D/G 57AH 500A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD TURBO VL L2 D/G 57AH 500A'
WHERE id = 'aba0e5db-ea0e-4f39-82f9-69dcde8619ef';
-- [auto-electricite-eclairage] ASSAD TURBO VL NS60  45AH 400A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD TURBO VL NS60  45AH 400A'
WHERE id = '85127659-f079-4a22-a254-a85fa646eec4';
-- [auto-electricite-eclairage] ASSAD TURBO VL NS40  40AH 330A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD TURBO VL NS40  40AH 330A'
WHERE id = 'c44a1f4e-5a99-450d-847d-03fe4e2c3afd';
-- [auto-electricite-eclairage] ASSAD TURBO VL L0 D 40AH 380A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD TURBO VL L0 D 40AH 380A'
WHERE id = '866a762b-972f-4597-9dc5-e805c4a3c6d3';
-- [auto-electricite-eclairage] ASSAD SUPER TURBO TRUCK MF5 100AH, 840A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD SUPER TURBO TRUCK MF5 100AH, 840A'
WHERE id = '2975101d-981b-43ba-b210-936c35d6b36f';
-- [auto-electricite-eclairage] ASSAD TURBO VL L3 D/G 70AH 620A
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'ASSAD TURBO VL L3 D/G 70AH 620A'
WHERE id = '1652d668-5143-43b9-b27c-4907b85f6888';
-- [auto-carrosserie-habitacle] BMW Pare-boue AV D E92/E93
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-carrosserie-habitacle'),
    "nameFr" = 'BMW Pare-boue AV D E92/E93'
WHERE id = '2956345a-1e19-4ad7-b1db-e3a0fc4fa5a1';
-- [auto-suspension-direction] TRW BIELLE DE SUSPENSION AV GOLF 6
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-suspension-direction'),
    "nameFr" = 'TRW BIELLE DE SUSPENSION AV GOLF 6'
WHERE id = 'ed603e92-85b3-4611-908f-ba8b8ac5226c';
-- [auto-freinage] PRO TEC Nettoyant pour freins
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-freinage'),
    "nameFr" = 'PRO TEC Nettoyant pour freins'
WHERE id = 'a9f6dfd9-729c-40b6-9d39-22382767f7e9';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'a9f6dfd9-729c-40b6-9d39-22382767f7e9' AND (volume IS NULL OR volume = '');
-- [auto-filtres] MANN-FILTER PU 825 X (Filtre à gasoil)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER PU 825 X (Filtre à gasoil)'
WHERE id = '6a241e0f-b0e7-4235-bf66-bc8e582fe455';
-- [auto-filtres] VALEO – 586142 Filtre à huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'VALEO – 586142 Filtre à huile'
WHERE id = '66fbecaa-570d-4d6e-aa2d-7e480fddbd95';
-- [auto-filtres] MANN-FILTER C35154 Filtre à air (VW GROUPE)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER C35154 Filtre à air (VW GROUPE)'
WHERE id = '4498a699-0dd5-4a0a-8937-15d2267ac31d';
-- [auto-filtres] MANN-FILTER – HU 710 x  Filtre à huile VW
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER – HU 710 x  Filtre à huile VW'
WHERE id = '45e588f6-8b84-4b9f-a353-f73d12e23a8c';
-- [auto-filtres] FEBI BILSTEIN Filtre à air VW POLO
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'FEBI BILSTEIN Filtre à air VW POLO'
WHERE id = '82afd84a-45d7-4c82-be83-173b8475ad47';
-- [additif-diesel] BARDAHL Décrassant 5 en 1 Diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'BARDAHL Décrassant 5 en 1 Diesel'
WHERE id = '932689c0-2e08-46a7-98f2-00dbe74245d5';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '932689c0-2e08-46a7-98f2-00dbe74245d5' AND (volume IS NULL OR volume = '');
-- [additif-diesel] PRO TEC Common rail diesel system cleaner
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'PRO TEC Common rail diesel system cleaner'
WHERE id = '0ee2f698-2547-4e0d-be39-e4a00b2f6788';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = '0ee2f698-2547-4e0d-be39-e4a00b2f6788' AND (volume IS NULL OR volume = '');
-- [liquides-auto] PRO TEC Nettoyant pour conduites de carburant
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'PRO TEC Nettoyant pour conduites de carburant'
WHERE id = 'b7456ab3-b854-47f6-8594-06219480133f';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = 'b7456ab3-b854-47f6-8594-06219480133f' AND (volume IS NULL OR volume = '');
-- [additifs] PRO TEC Radiateur anti fuite
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'PRO TEC Radiateur anti fuite'
WHERE id = 'a3655dd5-e131-4c2a-8a20-198412cbe9bc';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = 'a3655dd5-e131-4c2a-8a20-198412cbe9bc' AND (volume IS NULL OR volume = '');
-- [additifs] PRO TEC Radiateur Flush
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'PRO TEC Radiateur Flush'
WHERE id = '7a2b4268-36fa-46a3-a8a3-0a39270cd8dd';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = '7a2b4268-36fa-46a3-a8a3-0a39270cd8dd' AND (volume IS NULL OR volume = '');
-- [liquides-auto] PRO TEC ELECTRONIC SPRAY
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'PRO TEC ELECTRONIC SPRAY'
WHERE id = 'f3249c50-ee7c-4089-836f-febb1fdc087c';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'f3249c50-ee7c-4089-836f-febb1fdc087c' AND (volume IS NULL OR volume = '');
-- [liquides-auto] PRO TEC nettoyant poussoirs hydrauliques
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'PRO TEC nettoyant poussoirs hydrauliques'
WHERE id = '991c9915-8bf8-4e1e-9bcf-79174a66c5f5';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = '991c9915-8bf8-4e1e-9bcf-79174a66c5f5' AND (volume IS NULL OR volume = '');
-- [additif-huile] PRO TEC Oil stop smoke
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'PRO TEC Oil stop smoke'
WHERE id = 'ba28168f-2747-47f0-928b-42fd855fa3b2';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = 'ba28168f-2747-47f0-928b-42fd855fa3b2' AND (volume IS NULL OR volume = '');
-- [additif-diesel] PRO TEC FAP Super clean
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'PRO TEC FAP Super clean'
WHERE id = '8ddc1657-22b0-4606-9850-1b9b65d064a6';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = '8ddc1657-22b0-4606-9850-1b9b65d064a6' AND (volume IS NULL OR volume = '');
-- [liquides-auto] PRO TEC Nettoyant pour soupes et injections
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'PRO TEC Nettoyant pour soupes et injections'
WHERE id = 'ac0d0ac6-9231-490b-8527-100d40c3afa0';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = 'ac0d0ac6-9231-490b-8527-100d40c3afa0' AND (volume IS NULL OR volume = '');
-- [liquides-auto] PRO TEC Anti-fumée diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'PRO TEC Anti-fumée diesel'
WHERE id = '80f14c19-8a9d-4e25-9a8b-e274a984cef3';
UPDATE public."ProductVariant" 
SET volume = '150ML'
WHERE "productId" = '80f14c19-8a9d-4e25-9a8b-e274a984cef3' AND (volume IS NULL OR volume = '');
-- [additif-huile] OIL BOOSTER PROTECTED
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'OIL BOOSTER PROTECTED'
WHERE id = 'f61863d1-47de-497d-bc28-7bbdab5a4157';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = 'f61863d1-47de-497d-bc28-7bbdab5a4157' AND (volume IS NULL OR volume = '');
-- [liquides-auto] NANO ENGINE PROTECTED
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'NANO ENGINE PROTECTED'
WHERE id = '0b71f3bf-b658-47f7-98a0-1a0f74008dd7';
UPDATE public."ProductVariant" 
SET volume = '375ML'
WHERE "productId" = '0b71f3bf-b658-47f7-98a0-1a0f74008dd7' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] ROWE  RS LONGLIFE IV SAE 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'ROWE  RS LONGLIFE IV SAE 0W-20'
WHERE id = '22f8db81-1453-4fa1-b3be-21ede120e166';
-- [direction-assistee] ROWE HIGHTEC HUILE HYDRAULIQUE ZH-M SYNT
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'direction-assistee'),
    "nameFr" = 'ROWE HIGHTEC HUILE HYDRAULIQUE ZH-M SYNT'
WHERE id = '1ecaa96f-160f-4475-9754-622bfd2bc921';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '1ecaa96f-160f-4475-9754-622bfd2bc921' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] ROWE HIGHTEC MULTI SYNT DPF SAE 0W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'ROWE HIGHTEC MULTI SYNT DPF SAE 0W-30'
WHERE id = '870e793d-532f-41af-8de4-a04bc0cf2c40';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '870e793d-532f-41af-8de4-a04bc0cf2c40' AND (volume IS NULL OR volume = '');
-- [liquides-auto] ROWE ANTIGEL HIGHTEC AN 13
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'ROWE ANTIGEL HIGHTEC AN 13'
WHERE id = '9ee94432-fbf8-4ce7-87bb-dc6b2dde510d';
UPDATE public."ProductVariant" 
SET volume = '1.5L'
WHERE "productId" = '9ee94432-fbf8-4ce7-87bb-dc6b2dde510d' AND (volume IS NULL OR volume = '');
-- [liquides-auto] ROWE  ANTIGEL HIGHTEC AN-SF 12+
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'ROWE  ANTIGEL HIGHTEC AN-SF 12+'
WHERE id = '669d9b6e-a644-44d5-9bc7-48c0ba8bf829';
UPDATE public."ProductVariant" 
SET volume = '1.5L'
WHERE "productId" = '669d9b6e-a644-44d5-9bc7-48c0ba8bf829' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Dégraissant Tar remover
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Dégraissant Tar remover'
WHERE id = '1f4d2b0d-7b7e-48d0-bb7b-4c373efbb488';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = '1f4d2b0d-7b7e-48d0-bb7b-4c373efbb488' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Energy Premium 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Energy Premium 5W-30'
WHERE id = 'a3dac7f7-7c0d-4f67-9ae3-dce6f2fcfd19';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'a3dac7f7-7c0d-4f67-9ae3-dce6f2fcfd19' AND (volume IS NULL OR volume = '');
-- [direction-assistee] MANNOL Hydro ISO 68 Long life
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'direction-assistee'),
    "nameFr" = 'MANNOL Hydro ISO 68 Long life'
WHERE id = '56d72927-f07f-420b-bec2-5514567161b6';
UPDATE public."ProductVariant" 
SET volume = '20L'
WHERE "productId" = '56d72927-f07f-420b-bec2-5514567161b6' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Entretien intérieur voiture
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Entretien intérieur voiture'
WHERE id = '66f8c62c-a6eb-4e2b-aec1-14ff877b019d';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '66f8c62c-a6eb-4e2b-aec1-14ff877b019d' AND (volume IS NULL OR volume = '');
-- [auto-electricite-eclairage] NEOLUX H7 Lampe Power Light Bleue 80 W 12 V PX26d
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NEOLUX H7 Lampe Power Light Bleue 80 W 12 V PX26d'
WHERE id = 'c901862f-549e-4bde-b354-2bd0105a5dc4';
-- [huile-de-boite] ZF LifeGuardFluid 6 Huile pour boîte automatique
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ZF LifeGuardFluid 6 Huile pour boîte automatique'
WHERE id = 'b0026455-45f1-469b-a1eb-d49cd7da24fb';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'b0026455-45f1-469b-a1eb-d49cd7da24fb' AND (volume IS NULL OR volume = '');
-- [auto-electricite-eclairage] NEOLUX KIT H7 Power Light Bleue 80 W 12 V PX26d
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NEOLUX KIT H7 Power Light Bleue 80 W 12 V PX26d'
WHERE id = '619230fd-6074-4699-b5df-206de5b2a2d8';
-- [direction-assistee] MANNOL Hydro ISO 46 Longue life
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'direction-assistee'),
    "nameFr" = 'MANNOL Hydro ISO 46 Longue life'
WHERE id = '31b45c58-5b44-42ed-b7cd-1a13ab47148e';
UPDATE public."ProductVariant" 
SET volume = '20L'
WHERE "productId" = '31b45c58-5b44-42ed-b7cd-1a13ab47148e' AND (volume IS NULL OR volume = '');
-- [liquides-auto] RUPES Patin velcro 150mm 6+1 – 5/16 «
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'RUPES Patin velcro 150mm 6+1 – 5/16 «'
WHERE id = 'c2fce19f-1f37-4cef-81d8-bb196338277d';
-- [auto-electricite-eclairage] KAMOKA balais essuie glace  (650mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KAMOKA balais essuie glace  (650mm)'
WHERE id = '2f85bc6a-fa76-45d3-86e4-941a34d1e3b8';
-- [auto-electricite-eclairage] KAMOKA balais essuie glace  (400mm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KAMOKA balais essuie glace  (400mm)'
WHERE id = 'b2bf3e43-b0a4-4684-9b9d-03fb21990e9f';
-- [auto-electricite-eclairage] KAMOKA balais essuie glace arrière (Toyota)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'KAMOKA balais essuie glace arrière (Toyota)'
WHERE id = '1a450790-cf76-44cd-9ea6-d2f6f1678436';
-- [auto-electricite-eclairage] OSRAM COOL BLUE INTENSE (NEXT GEN) H7
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'OSRAM COOL BLUE INTENSE (NEXT GEN) H7'
WHERE id = '2f04a6e7-7ebb-4bf4-8a18-8fd92fc36cd7';
-- [additif-essence] BARDAHL Nettoyant injecteurs Essence
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'BARDAHL Nettoyant injecteurs Essence'
WHERE id = '56557eb8-53ff-414d-abcd-a7b142530208';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = '56557eb8-53ff-414d-abcd-a7b142530208' AND (volume IS NULL OR volume = '');
-- [additif-diesel] BARDAHL Nettoyant injecteurs Diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'BARDAHL Nettoyant injecteurs Diesel'
WHERE id = '08905879-cc5a-4f72-9137-25a2490bde19';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = '08905879-cc5a-4f72-9137-25a2490bde19' AND (volume IS NULL OR volume = '');
-- [additif-huile] BARDAHL Nettoyant prévidange
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'BARDAHL Nettoyant prévidange'
WHERE id = '7ea9acc9-a73a-4b03-9b72-734e5ebbbc50';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = '7ea9acc9-a73a-4b03-9b72-734e5ebbbc50' AND (volume IS NULL OR volume = '');
-- [auto-filtres] MANN-FILTER C 1370 Filtre à air
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER C 1370 Filtre à air'
WHERE id = '50949ea2-c278-48d8-94ad-1e2cc9acc50a';
-- [auto-filtres] MANN-FILTER C 1361 Filtre à air BMW
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER C 1361 Filtre à air BMW'
WHERE id = '84eca2a8-78d2-43e9-a574-c8698f9cc0fc';
-- [additif-essence] BARDAHL Décrassant 5 en 1 Essence
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'BARDAHL Décrassant 5 en 1 Essence'
WHERE id = 'a7ea52df-ce41-41cf-982d-a0d8baab0548';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = 'a7ea52df-ce41-41cf-982d-a0d8baab0548' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Eau Déminéralisée
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Eau Déminéralisée'
WHERE id = '81412a8b-7cde-4e1a-b6ec-a215be62b333';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '81412a8b-7cde-4e1a-b6ec-a215be62b333' AND (volume IS NULL OR volume = '');
-- [additifs] Nettoyant Radiateur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'Nettoyant Radiateur'
WHERE id = 'ffe9c521-be08-4925-af5a-b0b622a4eb45';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = 'ffe9c521-be08-4925-af5a-b0b622a4eb45' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Anti-fuites pour radia­teurs
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Anti-fuites pour radia­teurs'
WHERE id = '8a0e5a8c-3159-4298-a3d9-5b6fd3f11768';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = '8a0e5a8c-3159-4298-a3d9-5b6fd3f11768' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Antigel radiateur KFS 11
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Antigel radiateur KFS 11'
WHERE id = '5e1bd47b-ae3b-4abf-9dab-f7001459a8e5';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '5e1bd47b-ae3b-4abf-9dab-f7001459a8e5' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Antigel radiateur KFS 12+
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Antigel radiateur KFS 12+'
WHERE id = '43740bdb-b292-4135-a7c8-15cb32c4a2fd';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '43740bdb-b292-4135-a7c8-15cb32c4a2fd' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Antigel radiateur KFS 13
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Antigel radiateur KFS 13'
WHERE id = '183fa378-b726-4bca-970e-ee582d375278';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '183fa378-b726-4bca-970e-ee582d375278' AND (volume IS NULL OR volume = '');
-- [auto-filtres] MANN-FILTER C 14 006 Filtre à air
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'MANN-FILTER C 14 006 Filtre à air'
WHERE id = 'fb59835a-0666-4acd-bcfe-06841d5e1fab';
-- [moto-lubrifiants-chaine] Liqui Moly Motorbike 4T Bike-Additive
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'Liqui Moly Motorbike 4T Bike-Additive'
WHERE id = '729179b2-c915-4824-94f2-89d18d83371a';
UPDATE public."ProductVariant" 
SET volume = '125ML'
WHERE "productId" = '729179b2-c915-4824-94f2-89d18d83371a' AND (volume IS NULL OR volume = '');
-- [moto-lubrifiants-chaine] Liqui Moly Motorbike Graisse chaîne en aérosol, blanche
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'Liqui Moly Motorbike Graisse chaîne en aérosol, blanche'
WHERE id = '55b76345-c9d2-49cb-b2a5-5c861e11a5ce';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '55b76345-c9d2-49cb-b2a5-5c861e11a5ce' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Liqui Moly Motorbike Nettoyant pour chaînes et freins
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Liqui Moly Motorbike Nettoyant pour chaînes et freins'
WHERE id = '0fcd6454-c017-4b37-a429-6c1c8a9da3fb';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '0fcd6454-c017-4b37-a429-6c1c8a9da3fb' AND (volume IS NULL OR volume = '');
-- [moto-huile-fourche] Liqui Moly Motorbike Fork Oil 10W medium
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-fourche'),
    "nameFr" = 'Liqui Moly Motorbike Fork Oil 10W medium'
WHERE id = '01c32e3a-147e-4bc5-afb6-4639a03e93a3';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '01c32e3a-147e-4bc5-afb6-4639a03e93a3' AND (volume IS NULL OR volume = '');
-- [moto-huile-fourche] Liqui Moly Motorbike Fork Oil 10W medium
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-fourche'),
    "nameFr" = 'Liqui Moly Motorbike Fork Oil 10W medium'
WHERE id = '01c32e3a-147e-4bc5-afb6-4639a03e93a3';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '01c32e3a-147e-4bc5-afb6-4639a03e93a3' AND (volume IS NULL OR volume = '');
-- [moto-huile-fourche] Liqui Moly Motorbike Fork Oil 5W light
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-fourche'),
    "nameFr" = 'Liqui Moly Motorbike Fork Oil 5W light'
WHERE id = 'ba654110-227f-4939-a70c-3a341e27af10';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = 'ba654110-227f-4939-a70c-3a341e27af10' AND (volume IS NULL OR volume = '');
-- [moto-huile-boite] Liqui Moly Motorbike Gear Oil 10W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-boite'),
    "nameFr" = 'Liqui Moly Motorbike Gear Oil 10W-30'
WHERE id = '0a3495dd-a81e-4629-8c33-8d8bc2bb4f48';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '0a3495dd-a81e-4629-8c33-8d8bc2bb4f48' AND (volume IS NULL OR volume = '');
-- [moto-lubrifiants-chaine] Motorbike Engine Flush Shooter
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'Motorbike Engine Flush Shooter'
WHERE id = '4670d4d4-9fa6-4cb0-8f09-314c02c664f2';
UPDATE public."ProductVariant" 
SET volume = '80ML'
WHERE "productId" = '4670d4d4-9fa6-4cb0-8f09-314c02c664f2' AND (volume IS NULL OR volume = '');
-- [moto-lubrifiants-chaine] Liqui Moly Motorbike MoS2 Shooter
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'Liqui Moly Motorbike MoS2 Shooter'
WHERE id = 'be01e326-320b-4e6f-82fb-ffa74e578131';
UPDATE public."ProductVariant" 
SET volume = '20ML'
WHERE "productId" = 'be01e326-320b-4e6f-82fb-ffa74e578131' AND (volume IS NULL OR volume = '');
-- [moto-huile-boite] Liqui Moly Motorbike Gear Oil (GL4) 80W-90 Scooter
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-boite'),
    "nameFr" = 'Liqui Moly Motorbike Gear Oil (GL4) 80W-90 Scooter'
WHERE id = 'aee79b0a-3e11-4336-8307-11488dce849f';
UPDATE public."ProductVariant" 
SET volume = '150ML'
WHERE "productId" = 'aee79b0a-3e11-4336-8307-11488dce849f' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Graisse universelle multi-usages  MP2 Ester
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Graisse universelle multi-usages  MP2 Ester'
WHERE id = '49a973ae-87bc-4597-a485-23e937011958';
UPDATE public."ProductVariant" 
SET volume = '800G'
WHERE "productId" = '49a973ae-87bc-4597-a485-23e937011958' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Huile pour système hydrau­lique central
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Huile pour système hydrau­lique central'
WHERE id = '9b859c29-c0c5-4587-b7b9-0084ad848cce';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '9b859c29-c0c5-4587-b7b9-0084ad848cce' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Top Tec 6100 0W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 6100 0W-30'
WHERE id = 'e91f7961-c24e-45f2-97d1-6252183305b3';
-- [liquides-auto] MANNOL Pro Cool prêt à l’emploi
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Pro Cool prêt à l’emploi'
WHERE id = 'ac78a43b-d051-490d-9521-8096c90b986f';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'ac78a43b-d051-490d-9521-8096c90b986f' AND (volume IS NULL OR volume = '');
-- [moto-huile-fourche] MANNOL Huile de fourche 10W
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-fourche'),
    "nameFr" = 'MANNOL Huile de fourche 10W'
WHERE id = '9d56b6f0-ed4e-41f0-a129-c9d29a3cb1f8';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '9d56b6f0-ed4e-41f0-a129-c9d29a3cb1f8' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Motorbike 4T Synth 5W-40 Street Race
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T Synth 5W-40 Street Race'
WHERE id = '3c9c1d11-4652-460e-ade7-2d8039a07e01';
-- [moto-huiles] Motorbike HD Synth 20W-50 Street
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike HD Synth 20W-50 Street'
WHERE id = 'b35caca8-3f51-4e33-8589-9bdebc004d2a';
-- [moto-huiles] Motorbike 4T 20W-50 Basic Street
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T 20W-50 Basic Street'
WHERE id = '58aa5dc2-4a7f-472a-8243-599ef6d42987';
-- [moto-huiles] Motorbike 4T Synth 10W-50 Street Race
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T Synth 10W-50 Street Race'
WHERE id = 'd9f8b646-1a09-4e2c-ab33-6fce60c6eb4b';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'd9f8b646-1a09-4e2c-ab33-6fce60c6eb4b' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Motorbike 4T 10W-40 Scooter MB
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T 10W-40 Scooter MB'
WHERE id = '58b75dfd-b984-4ac8-a051-5ae3ce624c83';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '58b75dfd-b984-4ac8-a051-5ae3ce624c83' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Motorbike Molygen 4T 10W-40 Scooter
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike Molygen 4T 10W-40 Scooter'
WHERE id = 'e4ea7367-e605-4961-9d48-32d731d51b19';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'e4ea7367-e605-4961-9d48-32d731d51b19' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Motorbike 4T 10W-30 Street
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T 10W-30 Street'
WHERE id = 'b164f1fa-aba9-4afe-8724-3a9846036d0b';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'b164f1fa-aba9-4afe-8724-3a9846036d0b' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Motorbike 4T Synth 10W-60 Street Race
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T Synth 10W-60 Street Race'
WHERE id = '0837c0d8-127e-4c3f-9422-743591d1e2a2';
-- [moto-huiles] Motorbike 4T Synth 10W-40 Street Race
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T Synth 10W-40 Street Race'
WHERE id = 'c9a24c87-7586-40b5-8845-b5e1ed71da8e';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = 'c9a24c87-7586-40b5-8845-b5e1ed71da8e' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Motorbike 4T Synth 10W-40 Street Race
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T Synth 10W-40 Street Race'
WHERE id = '2adf23d2-1267-470d-91b2-2cd43d37d98e';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '2adf23d2-1267-470d-91b2-2cd43d37d98e' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Motorbike 4T 15W-50 Offroad
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 4T 15W-50 Offroad'
WHERE id = 'ae04e903-583e-4913-89ad-a961531948d0';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = 'ae04e903-583e-4913-89ad-a961531948d0' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Motorbike 2T Basic Scooter
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Motorbike 2T Basic Scooter'
WHERE id = '3ee47c99-0f2d-4308-9f2a-d009c189795f';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '3ee47c99-0f2d-4308-9f2a-d009c189795f' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Liqui Moly Motorbike 4T 10W-40 Street
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Liqui Moly Motorbike 4T 10W-40 Street'
WHERE id = '20217f17-4dda-40b7-9018-cbbb2870e4aa';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = '20217f17-4dda-40b7-9018-cbbb2870e4aa' AND (volume IS NULL OR volume = '');
-- [moto-huiles] Liqui Moly Motorbike 4T 10W-40 Street
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'Liqui Moly Motorbike 4T 10W-40 Street'
WHERE id = '28b0747b-3909-4415-ae5d-f47ff20b94f3';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '28b0747b-3909-4415-ae5d-f47ff20b94f3' AND (volume IS NULL OR volume = '');
-- [moto-huiles] MANNOL 2-Temps Plus
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'MANNOL 2-Temps Plus'
WHERE id = '347e5912-8bcc-4c13-808b-6c56ea8caeec';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = '347e5912-8bcc-4c13-808b-6c56ea8caeec' AND (volume IS NULL OR volume = '');
-- [moto-huiles] MANNOL 2-Temps Plus
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'MANNOL 2-Temps Plus'
WHERE id = 'ab199db2-c7e0-4b3c-aafe-9a6672ed0750';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'ab199db2-c7e0-4b3c-aafe-9a6672ed0750' AND (volume IS NULL OR volume = '');
-- [moto-huiles] MANNOL Moto 4 temps 10W-50
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'MANNOL Moto 4 temps 10W-50'
WHERE id = '938ad107-62e9-40cf-ae00-999f0ea643b0';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '938ad107-62e9-40cf-ae00-999f0ea643b0' AND (volume IS NULL OR volume = '');
-- [moto-huiles] MANNOL Moto 4 temps 10W-50
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'MANNOL Moto 4 temps 10W-50'
WHERE id = 'a5d55441-982d-4e5b-91f2-a4a766f310e9';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = 'a5d55441-982d-4e5b-91f2-a4a766f310e9' AND (volume IS NULL OR volume = '');
-- [moto-huiles] MANNOL Huile moteur 4 temps Powerbike 15W-50
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'MANNOL Huile moteur 4 temps Powerbike 15W-50'
WHERE id = 'c1065d8e-0e0d-40ca-929e-53c64d02532d';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = 'c1065d8e-0e0d-40ca-929e-53c64d02532d' AND (volume IS NULL OR volume = '');
-- [moto-huiles] MANNOL Huile moteur 4 temps Powerbike 15W-50
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'MANNOL Huile moteur 4 temps Powerbike 15W-50'
WHERE id = 'dc84d80b-cd72-4135-91e4-51a19e85acf9';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'dc84d80b-cd72-4135-91e4-51a19e85acf9' AND (volume IS NULL OR volume = '');
-- [moto-huiles] MANNOL 4 temps moto 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'MANNOL 4 temps moto 10W-40'
WHERE id = '796d9da8-61e2-4f20-a2bc-16d6f2819bd1';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = '796d9da8-61e2-4f20-a2bc-16d6f2819bd1' AND (volume IS NULL OR volume = '');
-- [moto-huiles] MANNOL 4 temps moto 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles'),
    "nameFr" = 'MANNOL 4 temps moto 10W-40'
WHERE id = '14be4a7d-2299-4e71-b614-8b1b502e1779';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '14be4a7d-2299-4e71-b614-8b1b502e1779' AND (volume IS NULL OR volume = '');
-- [additif-huile] MANNOL EP-2 Multi-MoS2 Ester
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'MANNOL EP-2 Multi-MoS2 Ester'
WHERE id = '8f7602df-1025-4624-b147-76b3576f5541';
UPDATE public."ProductVariant" 
SET volume = '800G'
WHERE "productId" = '8f7602df-1025-4624-b147-76b3576f5541' AND (volume IS NULL OR volume = '');
-- [additif-essence] MANNOL Octane Plus
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'MANNOL Octane Plus'
WHERE id = 'e83a9702-01b8-4615-a442-7bfe803e2d4c';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = 'e83a9702-01b8-4615-a442-7bfe803e2d4c' AND (volume IS NULL OR volume = '');
-- [additifs] MANNOL Additif boite de vitesse manuel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'MANNOL Additif boite de vitesse manuel'
WHERE id = 'b2d16fb9-5825-465e-ba60-019b5f32314b';
UPDATE public."ProductVariant" 
SET volume = '100ML'
WHERE "productId" = 'b2d16fb9-5825-465e-ba60-019b5f32314b' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] MANNOL SAE 90
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL SAE 90'
WHERE id = 'd7cba333-bc98-47e5-9457-c914837279c4';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = 'd7cba333-bc98-47e5-9457-c914837279c4' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] MANNOL CVT NS-3
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL CVT NS-3'
WHERE id = '299e4675-46b5-4703-8a6e-603291110252';
-- [liquides-auto] AdBlue®
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AdBlue®'
WHERE id = 'c9567fc4-1192-4562-89bd-31eb40050f9b';
UPDATE public."ProductVariant" 
SET volume = '20L'
WHERE "productId" = 'c9567fc4-1192-4562-89bd-31eb40050f9b' AND (volume IS NULL OR volume = '');
-- [liquides-auto] AdBlue®
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'AdBlue®'
WHERE id = '94ca1e75-1985-43f6-8d64-5e52265812c6';
UPDATE public."ProductVariant" 
SET volume = '10L'
WHERE "productId" = '94ca1e75-1985-43f6-8d64-5e52265812c6' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Antigel  AF12+ Longlife concentré
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Antigel  AF12+ Longlife concentré'
WHERE id = '886d0126-bb56-4e8b-8e16-e781c7602912';
UPDATE public."ProductVariant" 
SET volume = '10L'
WHERE "productId" = '886d0126-bb56-4e8b-8e16-e781c7602912' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] MANNOL AG55
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL AG55'
WHERE id = '6f53c240-5c6f-401f-ab8b-9f0410238d53';
-- [huile-de-boite] MANNOL AG52
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL AG52'
WHERE id = '034d4b34-8e35-40f3-b6a8-1118ed0a7164';
-- [huile-de-boite] MANNOL Dexron VI
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL Dexron VI'
WHERE id = '0bfc5684-1b96-4619-8215-c8b721926f8f';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '0bfc5684-1b96-4619-8215-c8b721926f8f' AND (volume IS NULL OR volume = '');
-- [additif-diesel] MANNOL Cétane Plus
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'MANNOL Cétane Plus'
WHERE id = 'e48aabe1-eca6-47b0-b6b6-a5aa0f6b3dd0';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = 'e48aabe1-eca6-47b0-b6b6-a5aa0f6b3dd0' AND (volume IS NULL OR volume = '');
-- [additif-huile] MANNOL Motor Doctor + Ester
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'MANNOL Motor Doctor + Ester'
WHERE id = '9211185d-87f2-447b-85b9-9186309d6463';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = '9211185d-87f2-447b-85b9-9186309d6463' AND (volume IS NULL OR volume = '');
-- [additif-essence] Mannol Burning Booster
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'Mannol Burning Booster'
WHERE id = '62082539-0135-4b2d-8ff1-6569e844943d';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = '62082539-0135-4b2d-8ff1-6569e844943d' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Anticor Noir
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Anticor Noir'
WHERE id = 'f36002a7-6862-4347-9212-773ba5b3804b';
UPDATE public."ProductVariant" 
SET volume = '650ML'
WHERE "productId" = 'f36002a7-6862-4347-9212-773ba5b3804b' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Lithium spray
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Lithium spray'
WHERE id = '803c719c-7ceb-4994-8f73-7478db463e51';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '803c719c-7ceb-4994-8f73-7478db463e51' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Mannol anti-fuite boite de vitesse
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Mannol anti-fuite boite de vitesse'
WHERE id = '1c3c6bd2-0bee-49f8-b390-8212956b5172';
-- [liquides-auto] Mannol Dissolvant antirouille
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Dissolvant antirouille'
WHERE id = '534c32ce-f21e-444e-8aa1-f45a4a53392c';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = '534c32ce-f21e-444e-8aa1-f45a4a53392c' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol Silicone Spray
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Silicone Spray'
WHERE id = 'cd00d1c9-4b80-4156-b420-f15ac187d772';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'cd00d1c9-4b80-4156-b420-f15ac187d772' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol Ester catalytique
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Ester catalytique'
WHERE id = 'b36a391f-5c07-49d6-a535-1665094d7b83';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = 'b36a391f-5c07-49d6-a535-1665094d7b83' AND (volume IS NULL OR volume = '');
-- [auto-filtres] Mannol Huile pour filtre à air
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'Mannol Huile pour filtre à air'
WHERE id = 'a4744295-e9c4-4614-b0a2-74d391edfea1';
UPDATE public."ProductVariant" 
SET volume = '200ML'
WHERE "productId" = 'a4744295-e9c4-4614-b0a2-74d391edfea1' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol Nettoyant pour montage
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Nettoyant pour montage'
WHERE id = '8c9aa5ce-8a7a-4167-98dd-a11c6770636a';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '8c9aa5ce-8a7a-4167-98dd-a11c6770636a' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol Nettoyant pour montage
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Nettoyant pour montage'
WHERE id = '5ab75ec7-62b1-4fc3-b470-e8c10ee48b97';
UPDATE public."ProductVariant" 
SET volume = '600ML'
WHERE "productId" = '5ab75ec7-62b1-4fc3-b470-e8c10ee48b97' AND (volume IS NULL OR volume = '');
-- [auto-freinage] Mannol Nettoyant pour freins
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-freinage'),
    "nameFr" = 'Mannol Nettoyant pour freins'
WHERE id = 'c9b65bf4-92f8-41e7-b624-1ca0200bcfd6';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = 'c9b65bf4-92f8-41e7-b624-1ca0200bcfd6' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Nettoyant pour radiateur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Nettoyant pour radiateur'
WHERE id = '4fa95b05-ab71-4508-9ab6-19ea9cba2663';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = '4fa95b05-ab71-4508-9ab6-19ea9cba2663' AND (volume IS NULL OR volume = '');
-- [direction-assistee] MANNOL Antifuite pour direction assistée
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'direction-assistee'),
    "nameFr" = 'MANNOL Antifuite pour direction assistée'
WHERE id = 'a9a90f3c-e8d1-4cf8-863a-02220cb07395';
-- [liquides-auto] MANNOL Joint Maker Noir
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Joint Maker Noir'
WHERE id = '4b9cd24c-9b0b-4db7-8468-bc672adee5c2';
UPDATE public."ProductVariant" 
SET volume = '85G'
WHERE "productId" = '4b9cd24c-9b0b-4db7-8468-bc672adee5c2' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Joint Maker gris
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Joint Maker gris'
WHERE id = 'ebe82ec7-3c27-48cb-a3f6-182d3c0efd15';
UPDATE public."ProductVariant" 
SET volume = '85G'
WHERE "productId" = 'ebe82ec7-3c27-48cb-a3f6-182d3c0efd15' AND (volume IS NULL OR volume = '');
-- [moto-lubrifiants-chaine] Lubrifiant pour chaîne (chain lube)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine'),
    "nameFr" = 'Lubrifiant pour chaîne (chain lube)'
WHERE id = '1b744b26-c514-4822-b390-bd98583e81b4';
UPDATE public."ProductVariant" 
SET volume = '200ML'
WHERE "productId" = '1b744b26-c514-4822-b390-bd98583e81b4' AND (volume IS NULL OR volume = '');
-- [additif-essence] Mannol Nettoyant pour carburateur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'Mannol Nettoyant pour carburateur'
WHERE id = 'fde4e204-e953-4735-a3d6-f54fdfe0fc75';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'fde4e204-e953-4735-a3d6-f54fdfe0fc75' AND (volume IS NULL OR volume = '');
-- [additif-essence] Mannol Nettoyant pour soupape d’admission
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'Mannol Nettoyant pour soupape d’admission'
WHERE id = '25aa6cfb-2f47-41a2-a8fb-4326e89e5945';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '25aa6cfb-2f47-41a2-a8fb-4326e89e5945' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol Nettoyant pour contacts
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Nettoyant pour contacts'
WHERE id = '65d07244-d2c4-4a29-a972-77c81b9e5e1b';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = '65d07244-d2c4-4a29-a972-77c81b9e5e1b' AND (volume IS NULL OR volume = '');
-- [additif-huile] MANNOL Anti-fuite d’huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'MANNOL Anti-fuite d’huile'
WHERE id = 'a50ac245-b2bb-4f8b-b909-ac7c6bb859b0';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = 'a50ac245-b2bb-4f8b-b909-ac7c6bb859b0' AND (volume IS NULL OR volume = '');
-- [liquides-auto] WOLF ANTIFREEZE EVO LL
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'WOLF ANTIFREEZE EVO LL'
WHERE id = '55ee5f24-0363-4a33-9d35-626a9f894575';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '55ee5f24-0363-4a33-9d35-626a9f894575' AND (volume IS NULL OR volume = '');
-- [additif-huile] WOLF OIL LEAK STOP
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'WOLF OIL LEAK STOP'
WHERE id = 'baeced6d-d361-4151-ad11-e28150bac067';
UPDATE public."ProductVariant" 
SET volume = '325ML'
WHERE "productId" = 'baeced6d-d361-4151-ad11-e28150bac067' AND (volume IS NULL OR volume = '');
-- [additif-essence] WOLF traitement essence
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'WOLF traitement essence'
WHERE id = '931dba02-37af-48eb-bf32-187742800efb';
UPDATE public."ProductVariant" 
SET volume = '325ML'
WHERE "productId" = '931dba02-37af-48eb-bf32-187742800efb' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol lave glace super concentré 1:100
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol lave glace super concentré 1:100'
WHERE id = 'babe2f59-f840-4501-8af7-19c8e3b5582f';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = 'babe2f59-f840-4501-8af7-19c8e3b5582f' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Anti rongeurs
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Anti rongeurs'
WHERE id = '35fa3705-2bec-40e5-9cb7-c57695ccda3c';
UPDATE public."ProductVariant" 
SET volume = '200ML'
WHERE "productId" = '35fa3705-2bec-40e5-9cb7-c57695ccda3c' AND (volume IS NULL OR volume = '');
-- [auto-moteur-distribution] Mannol entretien tendeur de courroie
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-moteur-distribution'),
    "nameFr" = 'Mannol entretien tendeur de courroie'
WHERE id = 'ce1803b1-1bc4-48a0-a05d-79f84ac43ebb';
UPDATE public."ProductVariant" 
SET volume = '200ML'
WHERE "productId" = 'ce1803b1-1bc4-48a0-a05d-79f84ac43ebb' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol nettoyant Moteur spray
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol nettoyant Moteur spray'
WHERE id = '5d694327-305d-4339-9723-e43e737ad6e8';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = '5d694327-305d-4339-9723-e43e737ad6e8' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Mannol Nettoyant pour cuir
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Mannol Nettoyant pour cuir'
WHERE id = '29210058-5e5e-45b0-a030-9de69b4dca74';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = '29210058-5e5e-45b0-a030-9de69b4dca74' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Nettoyeur papillon des gaz Pro-Line
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Nettoyeur papillon des gaz Pro-Line'
WHERE id = '4deaf6ab-a2ae-4bd6-ba64-c64ac37bc375';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '4deaf6ab-a2ae-4bd6-ba64-c64ac37bc375' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Anti-goudron
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Anti-goudron'
WHERE id = 'b5e1d8e8-6212-4b6c-b45b-67d6d0f85fd6';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'b5e1d8e8-6212-4b6c-b45b-67d6d0f85fd6' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Silicone spary Pro-Line
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Silicone spary Pro-Line'
WHERE id = 'd83bf549-b789-4036-ad03-ddcbc67534dd';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = 'd83bf549-b789-4036-ad03-ddcbc67534dd' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Nettoyant pour débit­mètre d’air
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Nettoyant pour débit­mètre d’air'
WHERE id = 'fa564df1-36b3-47a6-98f9-b99390880c9b';
UPDATE public."ProductVariant" 
SET volume = '200ML'
WHERE "productId" = 'fa564df1-36b3-47a6-98f9-b99390880c9b' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Aide au démarrage START FIX
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Aide au démarrage START FIX'
WHERE id = '073760b7-957b-453a-812e-594e0ec8934d';
UPDATE public."ProductVariant" 
SET volume = '200ML'
WHERE "productId" = '073760b7-957b-453a-812e-594e0ec8934d' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly élec­tro­nique spray
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly élec­tro­nique spray'
WHERE id = 'dec2aaf6-b9f3-4c96-8787-6ccf172cb493';
UPDATE public."ProductVariant" 
SET volume = '200ML'
WHERE "productId" = 'dec2aaf6-b9f3-4c96-8787-6ccf172cb493' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly LM 40 Spray Multi Fonc­tionnel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly LM 40 Spray Multi Fonc­tionnel'
WHERE id = '73dd1d0e-d1db-4d68-adef-ae4eb1d9cb2e';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '73dd1d0e-d1db-4d68-adef-ae4eb1d9cb2e' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Multi-Spray Plus 7
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Multi-Spray Plus 7'
WHERE id = 'dacc1b5e-8e6e-4893-ba4c-727bf54e3aea';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = 'dacc1b5e-8e6e-4893-ba4c-727bf54e3aea' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Nettoyeur rapide (Spray)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Nettoyeur rapide (Spray)'
WHERE id = '7e003d60-dec7-4f89-92dc-c4b9771c2551';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '7e003d60-dec7-4f89-92dc-c4b9771c2551' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Dégrip­pant rapide
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Dégrip­pant rapide'
WHERE id = '207f0bc0-8d8e-4abb-8b16-279e2eb94eee';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = '207f0bc0-8d8e-4abb-8b16-279e2eb94eee' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Nettoyant d’ex­té­rieur de carbu­ra­teur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Nettoyant d’ex­té­rieur de carbu­ra­teur'
WHERE id = '14d07f5a-5e29-419b-81bd-7a876c8ee4fd';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '14d07f5a-5e29-419b-81bd-7a876c8ee4fd' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Crème de polissage pour chrome
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Crème de polissage pour chrome'
WHERE id = 'baf3ab77-edce-4000-b0a2-ecdd84ce2ef4';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = 'baf3ab77-edce-4000-b0a2-ecdd84ce2ef4' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly auto Shampoo
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly auto Shampoo'
WHERE id = 'c74a69fe-5f50-47d6-b860-5eebc3f750c5';
-- [liquides-auto] Antigel MANNOL AG13+
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Antigel MANNOL AG13+'
WHERE id = '40e176c4-a3fb-480b-9fc8-7a5514d470cb';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '40e176c4-a3fb-480b-9fc8-7a5514d470cb' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Shampoing auto avec cire
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Shampoing auto avec cire'
WHERE id = 'e79604ce-e02e-4e4f-b820-1471d272a3ab';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'e79604ce-e02e-4e4f-b820-1471d272a3ab' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Nettoyant jantes spécial
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Nettoyant jantes spécial'
WHERE id = '30e5ef4d-60dd-4195-94f8-8a2afa223b78';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '30e5ef4d-60dd-4195-94f8-8a2afa223b78' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Entretien du cuir
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Entretien du cuir'
WHERE id = '687ba9c2-ea14-4452-ae49-67987dd131e4';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = '687ba9c2-ea14-4452-ae49-67987dd131e4' AND (volume IS NULL OR volume = '');
-- [auto-carrosserie-habitacle] Liqui MolyEntretien tableau de bord
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-carrosserie-habitacle'),
    "nameFr" = 'Liqui MolyEntretien tableau de bord'
WHERE id = 'c8dd2420-e417-4323-be9d-2024964d8a7c';
UPDATE public."ProductVariant" 
SET volume = '600ML'
WHERE "productId" = 'c8dd2420-e417-4323-be9d-2024964d8a7c' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Mousse textile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Mousse textile'
WHERE id = 'af692937-53ad-4843-9d8d-1eb0524a80d0';
UPDATE public."ProductVariant" 
SET volume = '650ML'
WHERE "productId" = 'af692937-53ad-4843-9d8d-1eb0524a80d0' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Étan­chéité moteur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Étan­chéité moteur'
WHERE id = '71662304-0ab7-463e-9117-0d53db02eded';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = '71662304-0ab7-463e-9117-0d53db02eded' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Liqui Moly Nettoyant compar­ti­ment moteur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Liqui Moly Nettoyant compar­ti­ment moteur'
WHERE id = '6166523f-956f-423e-ada0-d5c0720ca4df';
UPDATE public."ProductVariant" 
SET volume = '400ML'
WHERE "productId" = '6166523f-956f-423e-ada0-d5c0720ca4df' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Lave-glace super concentré aux agrumes
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Lave-glace super concentré aux agrumes'
WHERE id = '714b860d-af5d-43ed-8286-2e5fdb63f048';
UPDATE public."ProductVariant" 
SET volume = '50ML'
WHERE "productId" = '714b860d-af5d-43ed-8286-2e5fdb63f048' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Entretien des circuits de clima­ti­sa­tion (Spray)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Entretien des circuits de clima­ti­sa­tion (Spray)'
WHERE id = '85d837d7-bc9a-4754-afd8-16471cb1ff55';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = '85d837d7-bc9a-4754-afd8-16471cb1ff55' AND (volume IS NULL OR volume = '');
-- [auto-refroidissement-climatisation] Klima Refresh
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-refroidissement-climatisation'),
    "nameFr" = 'Klima Refresh'
WHERE id = '50f6cd94-60a0-45da-a6b6-7ca6deeda5b0';
UPDATE public."ProductVariant" 
SET volume = '75ML'
WHERE "productId" = '50f6cd94-60a0-45da-a6b6-7ca6deeda5b0' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Chamois synthétique (43×32 cm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Chamois synthétique (43×32 cm)'
WHERE id = 'c145574c-b156-4815-be52-fadaf6f4c0ab';
-- [liquides-auto] MANNOL Micro Fibre Polish  (33×36 cm)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Micro Fibre Polish  (33×36 cm)'
WHERE id = '62543e2f-ad9a-464e-8661-1441b2271b82';
-- [additifs] Pro-Line Nettoyant radiateur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'Pro-Line Nettoyant radiateur'
WHERE id = '1c490267-9cf7-4c7b-9a41-c223ec971f64';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '1c490267-9cf7-4c7b-9a41-c223ec971f64' AND (volume IS NULL OR volume = '');
-- [additif-diesel] Additif de Diesel anti-bactérien
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'Additif de Diesel anti-bactérien'
WHERE id = 'd892553b-7477-454b-858e-09dd07aadf76';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'd892553b-7477-454b-858e-09dd07aadf76' AND (volume IS NULL OR volume = '');
-- [additif-diesel] Rinçage Diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'Rinçage Diesel'
WHERE id = '4ba757fd-5bff-464c-8f30-71653ce7f97e';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '4ba757fd-5bff-464c-8f30-71653ce7f97e' AND (volume IS NULL OR volume = '');
-- [additif-diesel] Diesel stop smoke
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'Diesel stop smoke'
WHERE id = 'e4d3fdb4-ad7e-4797-9bba-b13aa5436ddf';
UPDATE public."ProductVariant" 
SET volume = '150ML'
WHERE "productId" = 'e4d3fdb4-ad7e-4797-9bba-b13aa5436ddf' AND (volume IS NULL OR volume = '');
-- [auto-filtres] Protec­tion du filtre à parti­cules diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-filtres'),
    "nameFr" = 'Protec­tion du filtre à parti­cules diesel'
WHERE id = '7067d83f-08f8-4851-9457-c810f7bdc1e6';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = '7067d83f-08f8-4851-9457-c810f7bdc1e6' AND (volume IS NULL OR volume = '');
-- [additif-diesel] Entretien du système diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'Entretien du système diesel'
WHERE id = 'b9cb34b5-f763-4949-b4df-8f8df096d8e1';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = 'b9cb34b5-f763-4949-b4df-8f8df096d8e1' AND (volume IS NULL OR volume = '');
-- [additif-diesel] Pro-Line JetClean Nettoyant pour système diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'Pro-Line JetClean Nettoyant pour système diesel'
WHERE id = '386b7364-dbb9-4e5c-b1b1-caf9b8c361c1';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '386b7364-dbb9-4e5c-b1b1-caf9b8c361c1' AND (volume IS NULL OR volume = '');
-- [additif-diesel] Pro-Line Nettoyant pour système diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'Pro-Line Nettoyant pour système diesel'
WHERE id = 'e767e359-446e-43b8-bf3f-afe5e99f5904';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = 'e767e359-446e-43b8-bf3f-afe5e99f5904' AND (volume IS NULL OR volume = '');
-- [additif-diesel] Super Additif Diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'Super Additif Diesel'
WHERE id = '57a5eec8-ef8a-4153-913c-e18f6f30f545';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = '57a5eec8-ef8a-4153-913c-e18f6f30f545' AND (volume IS NULL OR volume = '');
-- [additif-essence] nettoyant soupapes
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'nettoyant soupapes'
WHERE id = '1acd28da-d840-44a3-93c3-48172cbebe8e';
UPDATE public."ProductVariant" 
SET volume = '150ML'
WHERE "productId" = '1acd28da-d840-44a3-93c3-48172cbebe8e' AND (volume IS NULL OR volume = '');
-- [additif-essence] Octane Plus
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'Octane Plus'
WHERE id = '84fe76e6-9cb2-47ac-a8dd-8b45218420dc';
UPDATE public."ProductVariant" 
SET volume = '150ML'
WHERE "productId" = '84fe76e6-9cb2-47ac-a8dd-8b45218420dc' AND (volume IS NULL OR volume = '');
-- [additif-essence] Fuel Protect essence
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'Fuel Protect essence'
WHERE id = '8b6fee7f-3789-46a8-a34b-8103cabd7c9b';
-- [additif-essence] Pro-Line Nettoyant pour système essence
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'Pro-Line Nettoyant pour système essence'
WHERE id = '448e2d25-bfb7-45de-a2bb-2ace1fb37eb5';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '448e2d25-bfb7-45de-a2bb-2ace1fb37eb5' AND (volume IS NULL OR volume = '');
-- [additif-essence] Nettoyant pour systèmes d‘ injection
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence'),
    "nameFr" = 'Nettoyant pour systèmes d‘ injection'
WHERE id = '48da60bd-98d6-4146-a990-2d65ac00a023';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = '48da60bd-98d6-4146-a990-2d65ac00a023' AND (volume IS NULL OR volume = '');
-- [liquides-auto] Stop fuites d’huile pour engre­nages
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Stop fuites d’huile pour engre­nages'
WHERE id = '5d53c6e5-ac14-43a9-9c61-0f48cfdda647';
UPDATE public."ProductVariant" 
SET volume = '50ML'
WHERE "productId" = '5d53c6e5-ac14-43a9-9c61-0f48cfdda647' AND (volume IS NULL OR volume = '');
-- [direction-assistee] Anti-​fuite d’huile de direction assistée
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'direction-assistee'),
    "nameFr" = 'Anti-​fuite d’huile de direction assistée'
WHERE id = 'f591232e-86ac-4879-8565-f20e4f2bfe82';
UPDATE public."ProductVariant" 
SET volume = '35ML'
WHERE "productId" = 'f591232e-86ac-4879-8565-f20e4f2bfe82' AND (volume IS NULL OR volume = '');
-- [additif-huile] Additif poussoirs hydrau­liques
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'Additif poussoirs hydrau­liques'
WHERE id = 'b5f90cbd-eada-41fb-a51c-0e1681710755';
-- [additif-huile] Stop fumée d’huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'Stop fumée d’huile'
WHERE id = '99b225a9-db1d-40ff-b73b-9b8bd2c9f746';
-- [additif-huile] Rinçage boue d‘huile
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'Rinçage boue d‘huile'
WHERE id = '4172e86f-c42f-40c3-8cae-6ecab11563b7';
-- [liquides-auto] Cera Tec
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Cera Tec'
WHERE id = '1a09a35a-bfd8-471c-a7f9-04c9a07f2282';
-- [direction-assistee] Huile pour boîtier de direction 3100
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'direction-assistee'),
    "nameFr" = 'Huile pour boîtier de direction 3100'
WHERE id = 'a0593f50-3365-4f1f-b00c-3b05cc6246ea';
-- [liquides-auto] Huile pour système hydrau­lique central 2300
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Huile pour système hydrau­lique central 2300'
WHERE id = '4d59bc02-d1ec-44b6-a6ea-26c2ceadbc3e';
-- [huile-de-boite] Top Tec ATF 1950
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec ATF 1950'
WHERE id = 'bc5b4b9f-1ee9-408d-ac3b-b54801ac2d12';
-- [huiles-moteur] WOLF GUARDTECH 15W40 SL/CF
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'WOLF GUARDTECH 15W40 SL/CF'
WHERE id = '1d1b3498-3c2c-457e-b70b-50169c82c59a';
-- [huile-de-boite] WOLF ECOTECH CVT FLUID
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'WOLF ECOTECH CVT FLUID'
WHERE id = '18a897b3-3012-4b38-a231-ea0192eded5e';
-- [additif-diesel] MANNOL Nettoyant DPF 9958
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel'),
    "nameFr" = 'MANNOL Nettoyant DPF 9958'
WHERE id = 'b7e08df8-d4fd-43e1-99fe-6f1f804be60b';
-- [liquides-auto] Lubrifiant MANNOL M-40 9899
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'Lubrifiant MANNOL M-40 9899'
WHERE id = 'bc5728b5-bcb2-4b95-aed6-bb4be4d3c8e3';
-- [liquides-auto] MANNOL Liquide de refroidissement G11
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Liquide de refroidissement G11'
WHERE id = '28a4586f-01b4-428e-85b6-6ba64839808e';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '28a4586f-01b4-428e-85b6-6ba64839808e' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Liquide de refroidissement G12+
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Liquide de refroidissement G12+'
WHERE id = '9ffdb11a-4cfe-439c-afa9-dd94f22703d7';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '9ffdb11a-4cfe-439c-afa9-dd94f22703d7' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Antigel AF12+ Longlife 1L Concentré
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Antigel AF12+ Longlife 1L Concentré'
WHERE id = 'dd47c1ef-3483-47b1-8636-ba2a1c4c48af';
-- [liquides-auto] MANNOL Liquide de refroidissement G13
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Liquide de refroidissement G13'
WHERE id = '8b9c8379-ed62-4446-8198-beeceb9ffd77';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '8b9c8379-ed62-4446-8198-beeceb9ffd77' AND (volume IS NULL OR volume = '');
-- [liquides-auto] MANNOL Antigel AG13 1L Concentré
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'MANNOL Antigel AG13 1L Concentré'
WHERE id = '207dfd8b-d886-476e-9dd7-f54cd9d16392';
-- [additif-huile] MANNOL Motor Doctor + Ester
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'MANNOL Motor Doctor + Ester'
WHERE id = '5e0e2ff2-c2fe-431e-851b-d739d7978646';
-- [additif-huile] MANNOL Ceramo Ester
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'MANNOL Ceramo Ester'
WHERE id = '3270166e-664e-462a-a629-3e0ca610ee61';
-- [additif-huile] MANNOL Nettoyeur moteur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'MANNOL Nettoyeur moteur'
WHERE id = '13748ab9-ec69-4879-8bea-5bac224bc8d3';
-- [additif-huile] Engine Flush
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'Engine Flush'
WHERE id = '073bcea4-0057-4f1a-ab58-6293a3be7cd6';
-- [additifs] Pack Catalytic (nettoyage catalyseur) 7110+8931
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'Pack Catalytic (nettoyage catalyseur) 7110+8931'
WHERE id = 'e173948f-2948-4202-b740-23614394c207';
-- [additifs] Catalytic-​System Clean
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'Catalytic-​System Clean'
WHERE id = 'ca471583-3ac8-4f96-81c2-a28cbb7a9bbf';
-- [additifs] Catalytic-​​​​System Cleaner
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs'),
    "nameFr" = 'Catalytic-​​​​System Cleaner'
WHERE id = '3f337956-aaff-422a-ace6-7da3937a0eae';
-- [huiles-moteur] MANNOL Elite 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Elite 5W-40'
WHERE id = 'accf7dfc-6776-4eaf-8c2a-326c517266a7';
-- [huiles-moteur] MANNOL Energy Combi LL 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Energy Combi LL 5W-30'
WHERE id = '8a0b2053-f3c5-4bd4-af55-b73572f4e4f1';
-- [huiles-moteur] WOLF GUARDTECH 10W40 B4
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'WOLF GUARDTECH 10W40 B4'
WHERE id = 'b8718075-b712-4324-ae4a-854d5e2570ad';
-- [huiles-moteur] MANNOL Diesel Extra 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Diesel Extra 10W-40'
WHERE id = '3ac108f4-a05e-40b6-b1ed-45aa97ba232d';
-- [huiles-moteur] Castrol GTX 10W-40 5L A3/B4
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Castrol GTX 10W-40 5L A3/B4'
WHERE id = 'fa9162fb-abb4-458c-bb6e-67bfd842b638';
-- [huiles-moteur] CASTROL EDGE C3 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'CASTROL EDGE C3 5W-30'
WHERE id = 'f98caeec-45aa-44ae-a942-a8a0cbb22508';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'f98caeec-45aa-44ae-a942-a8a0cbb22508' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Huile Moteur XTeer G500 SL10W40 (HYUNDAI) –
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Huile Moteur XTeer G500 SL10W40 (HYUNDAI) –'
WHERE id = '6e6516ac-2d5e-438d-9143-9a613fa5a348';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = '6e6516ac-2d5e-438d-9143-9a613fa5a348' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Huile Moteur XTeer G500 5W30 (HYUNDAI) –
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Huile Moteur XTeer G500 5W30 (HYUNDAI) –'
WHERE id = '501931ee-03a3-4dd6-8c19-acf5c969077a';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = '501931ee-03a3-4dd6-8c19-acf5c969077a' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Extreme 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Extreme 5W-40'
WHERE id = '605051c3-9f3d-42b8-ae87-04c29f14acef';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '605051c3-9f3d-42b8-ae87-04c29f14acef' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] ROWE HIGHTEC SUPER LEICHTLAUF HC-O SAE 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'ROWE HIGHTEC SUPER LEICHTLAUF HC-O SAE 10W-40'
WHERE id = '4659d0a2-4d18-4054-96e9-fa27019702df';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '4659d0a2-4d18-4054-96e9-fa27019702df' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] ROWE MULTI FORMULA SAE 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'ROWE MULTI FORMULA SAE 5W-40'
WHERE id = 'a16950d0-d70f-4d42-93b4-8507df34e615';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'a16950d0-d70f-4d42-93b4-8507df34e615' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Molygen New Generation 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Molygen New Generation 10W-40'
WHERE id = 'db3f819d-ac48-4b82-98c5-0f007dbc1e22';
-- [huiles-moteur] MANNOL Classic 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Classic 10W-40'
WHERE id = '1ad3cd7d-6bc9-493c-b27f-c1c70148d692';
-- [huiles-moteur] MANNOL Defender 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Defender 10W-40'
WHERE id = '7e5b4bf7-c42b-4c49-8316-51411d2563b4';
-- [huiles-moteur] Wolf Vitaltech 5W40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Wolf Vitaltech 5W40'
WHERE id = 'b56d041f-4286-4a68-b1a6-f7bda1045ab2';
-- [huiles-moteur] Wolf Officialtech 5W30 C3 SP Extra
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Wolf Officialtech 5W30 C3 SP Extra'
WHERE id = '8ee9cd4b-299e-4c6d-b731-e51ba8c04702';
-- [huiles-moteur] ROWE HIGHTEC SYNT RSF 950 SAE 0W-30 (5L) FORD
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'ROWE HIGHTEC SYNT RSF 950 SAE 0W-30 (5L) FORD'
WHERE id = '900c6118-c462-484c-8405-8193a37ec482';
-- [huiles-moteur] ROWE HIGHTEC SYNT RS C5 SAE 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'ROWE HIGHTEC SYNT RS C5 SAE 0W-20'
WHERE id = '283efec2-c2bf-4a03-88fc-c4cf70e38509';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '283efec2-c2bf-4a03-88fc-c4cf70e38509' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Céramique 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Céramique 5W-30'
WHERE id = '857bcb1b-b4fe-48ad-8dcb-696d3b39b70c';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '857bcb1b-b4fe-48ad-8dcb-696d3b39b70c' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Top Tec 4300 5W-30  ( PSA )
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 4300 5W-30  ( PSA )'
WHERE id = '043ef3e2-a772-4e7f-a927-7f39065465a9';
-- [huiles-moteur] MANNOL Racing + Ester 10W-60
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Racing + Ester 10W-60'
WHERE id = '08e2a4f1-9a55-48d4-8670-ad54de39a4d3';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = '08e2a4f1-9a55-48d4-8670-ad54de39a4d3' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Extreme 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Extreme 5W-40'
WHERE id = '6a59dd78-b4d6-4579-b8d0-f7f6017197b5';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '6a59dd78-b4d6-4579-b8d0-f7f6017197b5' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Energy Premium 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Energy Premium 5W-30'
WHERE id = 'a331b8cf-98da-4905-9c6a-605aaeaaf08f';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'a331b8cf-98da-4905-9c6a-605aaeaaf08f' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Energy Formula FR 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Energy Formula FR 5W-30'
WHERE id = '05cf1ddc-3aba-4c00-98c6-1b27f0e01358';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '05cf1ddc-3aba-4c00-98c6-1b27f0e01358' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Légende 504/507 0W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Légende 504/507 0W-30'
WHERE id = 'efa1a3b9-ae93-4675-a658-3dcd446be67e';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'efa1a3b9-ae93-4675-a658-3dcd446be67e' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Longue life 508/509 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Longue life 508/509 0W-20'
WHERE id = 'bd1d98d5-7fb9-4bae-ab1c-9175feb5ce9b';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'bd1d98d5-7fb9-4bae-ab1c-9175feb5ce9b' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Légende Formule C5 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Légende Formule C5 0W-20'
WHERE id = '54e71720-6b2d-4be2-9d09-dcd10b919ca9';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '54e71720-6b2d-4be2-9d09-dcd10b919ca9' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Légende Ultra 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Légende Ultra 0W-20'
WHERE id = '5a99cefb-4009-4ba4-93cd-700642514a3d';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '5a99cefb-4009-4ba4-93cd-700642514a3d' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Top Tec 4310 0W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 4310 0W-30'
WHERE id = '0d000157-dc5b-467c-bd24-4551b9643f68';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '0d000157-dc5b-467c-bd24-4551b9643f68' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Top Tec 6200 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 6200 0W-20'
WHERE id = 'c04b8c16-ca7f-42a6-b60a-e0d1ddf6ba4b';
-- [huiles-moteur] Liqui Moly Super Leicht­lauf 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Super Leicht­lauf 10W-40'
WHERE id = '24e0dabd-9408-45c9-9aa1-5df5753cefec';
-- [additif-huile] Liqui Moly MoS2 Leicht­lauf 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'Liqui Moly MoS2 Leicht­lauf 10W-40'
WHERE id = '29cfa7d1-2fab-4796-8b75-21aba3d49bc3';
-- [huiles-moteur] Liqui Moly Special Tec AA 5W-40 Diesel
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec AA 5W-40 Diesel'
WHERE id = '9efaf408-90f5-42fe-a417-54bcb81bfe5f';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '9efaf408-90f5-42fe-a417-54bcb81bfe5f' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Special Tec AA 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec AA 5W-30'
WHERE id = 'd7447663-199b-4ca8-91e4-4926b7d6a604';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = 'd7447663-199b-4ca8-91e4-4926b7d6a604' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Special Tec AA 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec AA 0W-20'
WHERE id = 'd92b2350-718f-431a-b6a4-2563943645d3';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'd92b2350-718f-431a-b6a4-2563943645d3' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Special Tec AA 5W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec AA 5W-20'
WHERE id = 'e8d6cfdc-b534-4866-be21-550085c28970';
-- [huiles-moteur] Liqui Moly Synthoil Race Tech GT1 10W-60
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Synthoil Race Tech GT1 10W-60'
WHERE id = '684fe005-0405-4b63-8091-b1e50a99d73a';
-- [huiles-moteur] Liqui Moly Special Tec F ECO 5W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec F ECO 5W-20'
WHERE id = '49cbfafe-d6ce-43fe-8b8f-000d68822033';
-- [huiles-moteur] Liqui Moly Special Tec LR 5W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec LR 5W-20'
WHERE id = 'd21108e4-c1b5-49cf-8a2f-e1dd26e60b27';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'd21108e4-c1b5-49cf-8a2f-e1dd26e60b27' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Top Tec 6600 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 6600 0W-20'
WHERE id = '1926d8ca-1811-4449-b23e-87b55853e29e';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '1926d8ca-1811-4449-b23e-87b55853e29e' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Special Tec V 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec V 0W-20'
WHERE id = '36fe5c0e-7c9b-4dcc-87f9-6e2ee8e08240';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = '36fe5c0e-7c9b-4dcc-87f9-6e2ee8e08240' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Top Tec 4210 0W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 4210 0W-30'
WHERE id = 'f8a9485d-4789-420f-8198-8bc2a3f0128d';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'f8a9485d-4789-420f-8198-8bc2a3f0128d' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Top Tec 6300 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 6300 0W-20'
WHERE id = 'f34c86f5-aaa4-4cd9-aaf7-96e8e7475328';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'f34c86f5-aaa4-4cd9-aaf7-96e8e7475328' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Special Tec F 0W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec F 0W-30'
WHERE id = 'c8aeb6f5-d9e1-429e-900c-d4406a7b7c6b';
-- [huiles-moteur] Liqui Moly Special Tec AA 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec AA 5W-30'
WHERE id = 'c4511faf-87d0-46cd-b71e-50c89664b929';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'c4511faf-87d0-46cd-b71e-50c89664b929' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Special Tec F 5W-30  (FORD)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Special Tec F 5W-30  (FORD)'
WHERE id = '09d3b748-f863-498d-96e2-92bd3b4a7777';
-- [huiles-moteur] Liqui Moly Top Tec 4400 5W-30 (5L) RENAULT
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 4400 5W-30 (5L) RENAULT'
WHERE id = 'dc81f6ea-625f-40d6-ab5e-217ab22a4915';
-- [huiles-moteur] Liqui Moly Top Tec 4410 5W-30  5L ( RENAULT )
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 4410 5W-30  5L ( RENAULT )'
WHERE id = 'd0331796-6e3a-48fa-a18c-fbaab7f6be72';
-- [huiles-moteur] Top Tec 4200 5W-30 New Generation
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Top Tec 4200 5W-30 New Generation'
WHERE id = 'a133266e-9901-44de-95e6-bc6be417f1dd';
-- [huiles-moteur] Liqui Moly Top Tec 4600 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 4600 5W-30'
WHERE id = 'c9c30ff2-1d2e-414d-8d6b-ac71d9414dda';
-- [huiles-moteur] Liqui Moly Top Tec 4110 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 4110 5W-40'
WHERE id = 'd966b649-8ae3-4f76-8ec0-768e8c9aedcd';
-- [huiles-moteur] Liqui Moly Top Tec 4100 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Top Tec 4100 5W-40'
WHERE id = '3dc62370-8066-4f11-a30b-a19c0a8b8173';
-- [huiles-moteur] Leicht­lauf High Tech 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Leicht­lauf High Tech 5W-40'
WHERE id = '8e340d44-5b2d-41f7-b149-f6b2330de228';
-- [additif-huile] WOLF ENGINE FLUSH
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'WOLF ENGINE FLUSH'
WHERE id = '60701372-930f-4cf1-b5bd-653b5878ebcb';
UPDATE public."ProductVariant" 
SET volume = '325ML'
WHERE "productId" = '60701372-930f-4cf1-b5bd-653b5878ebcb' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL Légende Ultra 0W-20
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Légende Ultra 0W-20'
WHERE id = '0bc686c5-5314-4e96-b41f-6015ba479a48';
-- [additif-huile] Pro-Line Rinçage moteur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'Pro-Line Rinçage moteur'
WHERE id = 'd3f5af2e-5e0d-4d1b-b3d0-111bb98f8ffa';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'd3f5af2e-5e0d-4d1b-b3d0-111bb98f8ffa' AND (volume IS NULL OR volume = '');
-- [additif-huile] Pro-Line Rinçage moteur
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile'),
    "nameFr" = 'Pro-Line Rinçage moteur'
WHERE id = '9da0691e-95dc-4a86-bb89-07601674186c';
-- [huiles-moteur] MANNOL Molibden 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Molibden 10W-40'
WHERE id = '005a0c3e-313f-46bf-9dd4-2691df2b0aba';
-- [huiles-moteur] MANNOL Diesel Extra 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Diesel Extra 10W-40'
WHERE id = '28259376-d001-4f95-b18e-3968dcd233d4';
-- [huiles-moteur] MANNOL Classic 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Classic 10W-40'
WHERE id = '56c3574a-60c6-468c-882c-7a99a7ddd407';
-- [huiles-moteur] MANNOL Diesel Extra 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Diesel Extra 10W-40'
WHERE id = 'e7d2b294-3986-47bd-9386-02b67258c01e';
-- [huiles-moteur] MANNOL Classic 10W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Classic 10W-40'
WHERE id = '59e9d4bf-1d39-4ff3-ae11-4f50adf7c7ea';
-- [huiles-moteur] WOLF OFFICIALTECH 5W30 MS-Ford
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'WOLF OFFICIALTECH 5W30 MS-Ford'
WHERE id = '86b9dd81-4e22-4270-a5d9-37c0bd853e26';
-- [huiles-moteur] WOLF OFFICIALTECH 0W30 SP
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'WOLF OFFICIALTECH 0W30 SP'
WHERE id = 'c34555b4-9318-41bf-8843-c840cbff75de';
-- [huiles-moteur] MANNOL Formule énergétique PSA 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL Formule énergétique PSA 5W-30'
WHERE id = '6531da22-9518-4c4f-919a-a1a6be15b026';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = '6531da22-9518-4c4f-919a-a1a6be15b026' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] MANNOL pour voitures coréennes 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'MANNOL pour voitures coréennes 5W-30'
WHERE id = 'ec9962d9-df08-4caf-acb2-d0cebb996c1b';
UPDATE public."ProductVariant" 
SET volume = '4L'
WHERE "productId" = 'ec9962d9-df08-4caf-acb2-d0cebb996c1b' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Additif lubri­fiant pour huile de boîte (MOS 2)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Additif lubri­fiant pour huile de boîte (MOS 2)'
WHERE id = '718b27b1-c95f-415f-97da-ca1b599a07d1';
UPDATE public."ProductVariant" 
SET volume = '50G'
WHERE "productId" = '718b27b1-c95f-415f-97da-ca1b599a07d1' AND (volume IS NULL OR volume = '');
-- [moto-huile-boite] LIQUI MOLY Motorbike Gear Oil 75W-140 (GL5)
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-boite'),
    "nameFr" = 'LIQUI MOLY Motorbike Gear Oil 75W-140 (GL5)'
WHERE id = 'ef7bf3a0-2045-45b8-ae14-653b60b282e9';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = 'ef7bf3a0-2045-45b8-ae14-653b60b282e9' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HIGHTEC 75W-80 S
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HIGHTEC 75W-80 S'
WHERE id = 'df11be81-250d-43a6-bcdf-7950da820d39';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'df11be81-250d-43a6-bcdf-7950da820d39' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HIGHTEC HYPOID EP SAE 75W-140 S-LS
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HIGHTEC HYPOID EP SAE 75W-140 S-LS'
WHERE id = '5e1fc706-6442-488a-a266-c06412d32352';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '5e1fc706-6442-488a-a266-c06412d32352' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HIGHTEC ATF 9008
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HIGHTEC ATF 9008'
WHERE id = '0cb1f076-9771-4cd8-8f00-dadfb5334678';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '0cb1f076-9771-4cd8-8f00-dadfb5334678' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HIGHTEC ATF 9600
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HIGHTEC ATF 9600'
WHERE id = '5f485a14-ac97-4eef-a1e5-757fd07805c6';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '5f485a14-ac97-4eef-a1e5-757fd07805c6' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HIGHTEC ATF 9000
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HIGHTEC ATF 9000'
WHERE id = 'd17149d7-cb34-4b43-9e0d-4f57cf91c8b4';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'd17149d7-cb34-4b43-9e0d-4f57cf91c8b4' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HIGHTEC ATF 9004
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HIGHTEC ATF 9004'
WHERE id = 'ef10ab7f-45c0-4414-9093-f871a576e00c';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'ef10ab7f-45c0-4414-9093-f871a576e00c' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HUILE DE BOITE ATF DCG II
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HUILE DE BOITE ATF DCG II'
WHERE id = 'c6b51bc0-93e0-4816-9aed-266b468917d1';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'c6b51bc0-93e0-4816-9aed-266b468917d1' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HUILE DE BOITE ATF CVT
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HUILE DE BOITE ATF CVT'
WHERE id = '4295cf89-424d-4d91-9919-6c7bd1cf0598';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '4295cf89-424d-4d91-9919-6c7bd1cf0598' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HUILE DE BOITE ATF 9006
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HUILE DE BOITE ATF 9006'
WHERE id = '03084633-7bb0-4af0-88fe-f9af2244ad7f';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '03084633-7bb0-4af0-88fe-f9af2244ad7f' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ROWE HUILE DE BOITE ATF 9005
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ROWE HUILE DE BOITE ATF 9005'
WHERE id = '16ca2284-3ed7-4dec-afa4-43c361edcfc2';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '16ca2284-3ed7-4dec-afa4-43c361edcfc2' AND (volume IS NULL OR volume = '');
-- [moto-huile-boite] Liqui Moly Motorbike Gear Oil 75W-90
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-boite'),
    "nameFr" = 'Liqui Moly Motorbike Gear Oil 75W-90'
WHERE id = '4ef9eb01-76f1-4b55-b382-a9f1116eada6';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '4ef9eb01-76f1-4b55-b382-a9f1116eada6' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Huile de boîte de vitesses haute perfor­mance (GL3+) SAE 75W-80
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Huile de boîte de vitesses haute perfor­mance (GL3+) SAE 75W-80'
WHERE id = '97ac8d60-9a88-4ce2-9ff1-802e10665fe1';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '97ac8d60-9a88-4ce2-9ff1-802e10665fe1' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Top Tec MTF 5100 75W
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec MTF 5100 75W'
WHERE id = '7b4b0590-10bf-4307-9500-4ba9cd189fc7';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '7b4b0590-10bf-4307-9500-4ba9cd189fc7' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Top Tec MTF 5300 70W-75W
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec MTF 5300 70W-75W'
WHERE id = 'db90a9ee-b9f3-4cdc-b669-ac92815c8da9';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'db90a9ee-b9f3-4cdc-b669-ac92815c8da9' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Huile de boîte de vitesses haute perfor­mance (GL4+) SAE 75W-90
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Huile de boîte de vitesses haute perfor­mance (GL4+) SAE 75W-90'
WHERE id = 'a56b39f0-8818-438a-8c9c-a71d32196864';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'a56b39f0-8818-438a-8c9c-a71d32196864' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Huile hypoïde (GL4/5) TDL SAE 75W-90
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Huile hypoïde (GL4/5) TDL SAE 75W-90'
WHERE id = '0df28aa9-23f7-4830-abd7-8eb2d4f0dd0d';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '0df28aa9-23f7-4830-abd7-8eb2d4f0dd0d' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] MANNOL Hypoïde 80W-90 GL-4/GL-5 LS
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL Hypoïde 80W-90 GL-4/GL-5 LS'
WHERE id = 'bad35c6d-9b5c-4811-a067-bbbcaeaf2d50';
-- [huile-de-boite] MANNOL multivéhicule ATF JWS
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL multivéhicule ATF JWS'
WHERE id = '0415934f-b14c-45e3-9f01-81b67236972a';
-- [huile-de-boite] MANNOL ATF AG60
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL ATF AG60'
WHERE id = '8ca08745-29ae-4f5e-b312-4762666602a7';
-- [huile-de-boite] MANNOL ATF T-IV
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL ATF T-IV'
WHERE id = 'c4c29005-7e20-4119-bb2a-3cc922517cf0';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'c4c29005-7e20-4119-bb2a-3cc922517cf0' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] MANNOL ATF SP-IV
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL ATF SP-IV'
WHERE id = '8c6aa5f2-e1f7-4175-a8a8-3b3be4bfda25';
-- [huile-de-boite] Transmission à variation continue ATF  (CVT) MANNOL
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Transmission à variation continue ATF  (CVT) MANNOL'
WHERE id = '057b55d8-7d71-4db4-8299-21778ae0ebb8';
-- [huile-de-boite] MANNOL Automatique ATF Dexron III
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL Automatique ATF Dexron III'
WHERE id = 'f0ef71e3-0769-4211-8c5d-cc83cb8fd0d0';
-- [huile-de-boite] MANNOL ATF SP-III
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL ATF SP-III'
WHERE id = '300bc75a-f56d-4496-8fe9-988e20f40c4d';
-- [huile-de-boite] Mannol Automatique ATF Dexron II
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Mannol Automatique ATF Dexron II'
WHERE id = '2d979cb0-933d-4b77-9bd2-506234cb8827';
-- [huile-de-boite] Nettoyant boîte de vitesses
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Nettoyant boîte de vitesses'
WHERE id = 'a0825afd-64a2-4c1d-80a4-68a46e3196f9';
UPDATE public."ProductVariant" 
SET volume = '150ML'
WHERE "productId" = 'a0825afd-64a2-4c1d-80a4-68a46e3196f9' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Nettoyeur de boîtes de vitesses auto­ma­tiques
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Nettoyeur de boîtes de vitesses auto­ma­tiques'
WHERE id = 'c61e2af3-3d61-4d51-b60f-49ea1b7071a2';
UPDATE public."ProductVariant" 
SET volume = '300ML'
WHERE "productId" = 'c61e2af3-3d61-4d51-b60f-49ea1b7071a2' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] ATF Additive
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'ATF Additive'
WHERE id = '5e7416e2-6e8f-4170-97e3-20267ab295d3';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = '5e7416e2-6e8f-4170-97e3-20267ab295d3' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Top Tec ATF 1800
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec ATF 1800'
WHERE id = '2d1622d5-7d72-4fe2-b3bd-edf14ab8e656';
-- [huile-de-boite] WOLF ECOTECH DSG FLUID
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'WOLF ECOTECH DSG FLUID'
WHERE id = 'fe651589-4bd6-44f7-84d8-2b20dfd5eab5';
-- [huile-de-boite] MANNOL Unigear 75W-80 GL-4/GL-5
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL Unigear 75W-80 GL-4/GL-5'
WHERE id = '8e9a98de-2eb4-479d-aa3d-7047f731b563';
-- [huile-de-boite] MANNOL Maxpower 75W-140 GL-5  4*4
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'MANNOL Maxpower 75W-140 GL-5  4*4'
WHERE id = '3f281e82-54e9-4fd3-bd1e-f3a69d8b6928';
-- [huile-de-boite] Huile de boîte hypoïde entiè­re­ment synthé­tique (GL5) LS SAE 75W-140
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Huile de boîte hypoïde entiè­re­ment synthé­tique (GL5) LS SAE 75W-140'
WHERE id = 'a9e19758-3944-44ef-87f6-35d3dd5f680b';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = 'a9e19758-3944-44ef-87f6-35d3dd5f680b' AND (volume IS NULL OR volume = '');
-- [huile-de-boite] Top Tec MTF 5200 75W-80
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec MTF 5200 75W-80'
WHERE id = '832b4b6e-0665-4f9c-a66f-c527826c35fa';
-- [huile-de-boite] Huile de boîte de vitesses (GL5) 75W-80
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Huile de boîte de vitesses (GL5) 75W-80'
WHERE id = '3426899e-91d3-4da8-baf9-04c5e124e67c';
UPDATE public."ProductVariant" 
SET volume = '1L'
WHERE "productId" = '3426899e-91d3-4da8-baf9-04c5e124e67c' AND (volume IS NULL OR volume = '');
-- [transmission] Huile de boîte de vitesses à double embrayage 8100
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'transmission'),
    "nameFr" = 'Huile de boîte de vitesses à double embrayage 8100'
WHERE id = '2af6a40b-4bd7-4e16-b2ba-48a68fa1f827';
-- [huile-de-boite] Top Tec ATF 1900
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec ATF 1900'
WHERE id = 'b441a274-5012-4123-a8e7-bbcac2c737d8';
-- [huile-de-boite] Top Tec ATF 1800 R
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec ATF 1800 R'
WHERE id = 'da5f720a-bd98-4d0b-9d21-69f853b76a6c';
-- [huile-de-boite] Top Tec ATF 1600
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec ATF 1600'
WHERE id = '3e4052a1-d315-42fb-82e2-a68319b08322';
-- [huile-de-boite] Top Tec ATF 1400
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec ATF 1400'
WHERE id = 'fc085b28-f49b-4282-b95f-38d8234b45a4';
-- [huile-de-boite] Top Tec ATF 1200
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec ATF 1200'
WHERE id = '11461d30-d77c-418b-8221-803ed94e695b';
-- [huile-de-boite] Top Tec ATF 1100
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec ATF 1100'
WHERE id = '5204c798-0ced-4400-a5a9-010a7c2b7f48';
-- [huile-de-boite] Top Tec MTF 5100 75W
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Top Tec MTF 5100 75W'
WHERE id = '22d20565-a4a7-4873-b4d4-47545a0e27ef';
-- [huile-de-boite] Huile pour engrenages MANNOL Extra 75W-90 GL-4/GL-5 LS
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'Huile pour engrenages MANNOL Extra 75W-90 GL-4/GL-5 LS'
WHERE id = '7caf358a-3376-45e4-b2bf-8e7a6e306609';
-- [huile-de-boite] WOLF OFFICIALTECH 75W-85 GL 5
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite'),
    "nameFr" = 'WOLF OFFICIALTECH 75W-85 GL 5'
WHERE id = '6ef902f2-f9bc-4d69-ad30-0f5a94fdba28';
-- [liquides-auto] WOLF EXTENDTECH 80W90 LS GL 5
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'WOLF EXTENDTECH 80W90 LS GL 5'
WHERE id = 'cab0e35d-2866-4159-9976-06a729261b73';
-- [liquides-auto] WOLF EXTENDTECH 75W90 GL 5
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'WOLF EXTENDTECH 75W90 GL 5'
WHERE id = 'ea83e90b-982e-4a77-8004-feb69a7d81a4';
-- [liquide-de-frein] Liqui Moly Liquide de frein DOT 5.1
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquide-de-frein'),
    "nameFr" = 'Liqui Moly Liquide de frein DOT 5.1'
WHERE id = 'aaac1f29-a14f-4676-9a50-0f6e4e3c3a29';
UPDATE public."ProductVariant" 
SET volume = '250ML'
WHERE "productId" = 'aaac1f29-a14f-4676-9a50-0f6e4e3c3a29' AND (volume IS NULL OR volume = '');
-- [liquide-de-frein] Liqui Moly Liquide de frein DOT 3
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquide-de-frein'),
    "nameFr" = 'Liqui Moly Liquide de frein DOT 3'
WHERE id = '2da865e0-4862-444b-8147-5c0cb8379b73';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '2da865e0-4862-444b-8147-5c0cb8379b73' AND (volume IS NULL OR volume = '');
-- [liquide-de-frein] Liquide de frein DOT 4
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquide-de-frein'),
    "nameFr" = 'Liquide de frein DOT 4'
WHERE id = '0d8ac934-42ab-4dd5-ad4b-6cb0ea0ff0c6';
UPDATE public."ProductVariant" 
SET volume = '500ML'
WHERE "productId" = '0d8ac934-42ab-4dd5-ad4b-6cb0ea0ff0c6' AND (volume IS NULL OR volume = '');
-- [liquide-de-frein] Mannol Liquide de frein DOT-5.1
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquide-de-frein'),
    "nameFr" = 'Mannol Liquide de frein DOT-5.1'
WHERE id = '2915f0af-a7a2-4be7-b4e9-2de68787a80b';
-- [liquide-de-frein] Mannol Liquide de frein  DOT-3
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquide-de-frein'),
    "nameFr" = 'Mannol Liquide de frein  DOT-3'
WHERE id = '3770de7a-ed6b-4a54-b3bb-8747d4c1ab1d';
UPDATE public."ProductVariant" 
SET volume = '0.5L'
WHERE "productId" = '3770de7a-ed6b-4a54-b3bb-8747d4c1ab1d' AND (volume IS NULL OR volume = '');
-- [liquide-de-frein] Mannol Liquide de frein DOT-4
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquide-de-frein'),
    "nameFr" = 'Mannol Liquide de frein DOT-4'
WHERE id = '830cd9f3-d90a-4278-a1a9-2e6b10137a15';
UPDATE public."ProductVariant" 
SET volume = '450ML'
WHERE "productId" = '830cd9f3-d90a-4278-a1a9-2e6b10137a15' AND (volume IS NULL OR volume = '');
-- [huiles-moteur] Liqui Moly Molygen New Generation 5W-30
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Molygen New Generation 5W-30'
WHERE id = '9367657d-a003-4f09-aa60-dc2b188b026f';
-- [huiles-moteur] Liqui Moly Molygen New Generation 5W-40
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur'),
    "nameFr" = 'Liqui Moly Molygen New Generation 5W-40'
WHERE id = 'f293fb28-4a21-4f42-90f3-61888b6f2399';
-- [auto-electricite-eclairage] NEOLUX Led intérieur 26.8mm W2.1×9.5d
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage'),
    "nameFr" = 'NEOLUX Led intérieur 26.8mm W2.1×9.5d'
WHERE id = 'cmt0vm1jd00ohqc339l4se7e5';
-- [liquides-auto] LIQUI MOLY G11 prêt à l’emploi 50/50
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquides-auto'),
    "nameFr" = 'LIQUI MOLY G11 prêt à l’emploi 50/50'
WHERE id = 'cmt0vly91007xqc33xvztu700';
UPDATE public."ProductVariant" 
SET volume = '5L'
WHERE "productId" = 'cmt0vly91007xqc33xvztu700' AND (volume IS NULL OR volume = '');
-- [auto-moteur-distribution] Kit de courroie crantée KAMOKA 7001081
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-moteur-distribution'),
    "nameFr" = 'Kit de courroie crantée KAMOKA 7001081'
WHERE id = '9a3cfc6f-4526-4bdb-980e-5d285141f3dd';
-- [auto-moteur-distribution] Actuateur; arbre excentrique (levée variable) Ridex 3813A0002
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-moteur-distribution'),
    "nameFr" = 'Actuateur; arbre excentrique (levée variable) Ridex 3813A0002'
WHERE id = '7bc51d6b-03fd-4a7c-8bf8-165ae7cdd3f8';
-- [auto-moteur-distribution] Actuateur; arbre excentrique (levée variable) FEBI BILSTEIN 105904
UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-moteur-distribution'),
    "nameFr" = 'Actuateur; arbre excentrique (levée variable) FEBI BILSTEIN 105904'
WHERE id = '0340e477-1794-48ba-824e-8048c6c46222';

COMMIT;
