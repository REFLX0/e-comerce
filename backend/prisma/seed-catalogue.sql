-- ============================================================
-- SPECPART CATALOGUE SEED - Auto-generated from xlsx
-- ============================================================

BEGIN;

-- Enable pgcrypto if not already
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Parent categories
INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
VALUES
  (gen_random_uuid()::text, 'Pièces de Rechange / D''origine', 'pieces-rechange', 1, NULL, NULL),
  (gen_random_uuid()::text, 'Huiles & Lubrifiants Moteur', 'huiles-moteur', 2, NULL, NULL),
  (gen_random_uuid()::text, 'Additifs', 'additifs', 3, NULL, NULL),
  (gen_random_uuid()::text, 'Moto', 'moto', 4, NULL, NULL),
  (gen_random_uuid()::text, 'Entretien & Accessoires', 'entretien-accessoires', 5, NULL, NULL)
ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder";

-- Sub-categories
DO $$
DECLARE parent_id text;
BEGIN
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'pieces-rechange';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Filtres (Filtres à huile)', 'filtres-huile', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'entretien-accessoires';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Nettoyage & Entretien Intérieur', 'nettoyage-interieur', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'pieces-rechange';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Filtres (Filtres à air)', 'filtres-air', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'pieces-rechange';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Électricité & Éclairage (Essuie-glaces)', 'essuie-glaces', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'additifs';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Additifs Carburant & Injection', 'additifs-carburant', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'pieces-rechange';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Filtres (Filtres carburant)', 'filtres-carburant', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'moto';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Huiles moteur 2T & 4T', 'huiles-moto-2t-4t', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'huiles-moteur';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Liquides (AdBlue)', 'adblue', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'pieces-rechange';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Électricité & Éclairage (Batteries)', 'batteries', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'additifs';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Additifs Huile & Moteur', 'additifs-huile', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'entretien-accessoires';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Lavage, Carrosserie & Detailing', 'lavage-carrosserie', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'huiles-moteur';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Liquides (Refroidissement & Antigel)', 'antigel-refroidissement', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'moto';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Entretien & Graissage chaîne', 'entretien-chaine', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'entretien-accessoires';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Produits divers & Maintenance', 'produits-divers', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'pieces-rechange';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Filtres (Filtres habitacle)', 'filtres-habitacle', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'huiles-moteur';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Huiles de boîte & Transmission', 'huiles-boite-transmission', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'moto';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Additifs moto', 'additifs-moto', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'huiles-moteur';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Huiles moteur', 'huiles-moteur-auto', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'moto';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Huiles de fourche', 'huiles-fourche', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'huiles-moteur';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Liquides (Liquide de frein)', 'liquide-frein', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
  SELECT id INTO parent_id FROM public."Category" WHERE slug = 'pieces-rechange';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
  VALUES (gen_random_uuid()::text, 'Filtres', 'filtres', 0, parent_id, NULL)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId";
END $$;

-- Brands
INSERT INTO public."Brand" (id, name, slug, "logoUrl")
VALUES
  (gen_random_uuid()::text, 'JOTATE', 'jotate', NULL),
  (gen_random_uuid()::text, 'KIT H7 BLUE', 'kit-h7-blue', NULL),
  (gen_random_uuid()::text, 'KAMOKA', 'kamoka', NULL),
  (gen_random_uuid()::text, 'bleu light', 'bleu-light', NULL),
  (gen_random_uuid()::text, 'RUPES', 'rupes', NULL),
  (gen_random_uuid()::text, 'NEOLUX', 'neolux', NULL),
  (gen_random_uuid()::text, 'filtre à huile mann', 'filtre-a-huile-mann', NULL),
  (gen_random_uuid()::text, 'FEBI BILSTEIN', 'febi-bilstein', NULL),
  (gen_random_uuid()::text, 'VARTA', 'varta', NULL),
  (gen_random_uuid()::text, 'MANNOL', 'mannol', NULL),
  (gen_random_uuid()::text, 'bardahl décrassant', 'bardahl-decrassant', NULL),
  (gen_random_uuid()::text, 'API GL5', 'api-gl5', NULL),
  (gen_random_uuid()::text, 'WOLF', 'wolf', NULL),
  (gen_random_uuid()::text, 'filtre habiltacle', 'filtre-habiltacle', NULL),
  (gen_random_uuid()::text, 'Générique', 'generique', NULL),
  (gen_random_uuid()::text, 'bardahl', 'bardahl', NULL),
  (gen_random_uuid()::text, 'LIQUI MOLY', 'liqui-moly', NULL),
  (gen_random_uuid()::text, 'HYUNDAI XTeer', 'hyundai-xteer', NULL),
  (gen_random_uuid()::text, 'ROWE', 'rowe', NULL),
  (gen_random_uuid()::text, 'AREXONS', 'arexons', NULL),
  (gen_random_uuid()::text, 'MANN-FILTER - HU 710 x Filtre à huile VW', 'mann-filter-hu-710-x-filtre-a-huile-vw', NULL),
  (gen_random_uuid()::text, 'c14130', 'c14130', NULL),
  (gen_random_uuid()::text, 'BOSCH', 'bosch', NULL),
  (gen_random_uuid()::text, 'CASTROL', 'castrol', NULL),
  (gen_random_uuid()::text, 'bardahl injecteur diesel', 'bardahl-injecteur-diesel', NULL),
  (gen_random_uuid()::text, 'ASSAD', 'assad', NULL),
  (gen_random_uuid()::text, 'KRAWEHL', 'krawehl', NULL),
  (gen_random_uuid()::text, 'PRO-TEC', 'pro-tec', NULL),
  (gen_random_uuid()::text, 'BMW', 'bmw', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Products, variants, images, specs
DO $$
DECLARE
  prod_id text;
  cat_id text;
  brand_id text;
  var_sku text;
BEGIN

  -- Product: TSC-00001 - Liqui Moly Molygen New Gene­ra­tion 10W-40 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00001', 'Liqui Moly Molygen New Gene­ra­tion 10W-40 (5L)', 'liqui-moly-molygen-new-generation-10w-40-5l', 'Description




excellente propreté du moteur
excellent comportement aux températures élevées et basses
excellente protection anti-usure
grande stabilité au cisaillement
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
réduit les frottements et l’usure
alimentation en huile rapide à basses températures
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 5, 'TSC-00001-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 5, 'TSC-00001-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SL', 'ACEA B4,', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; VW 501 01; VW 502 00; VW 505 00; Renault RN 0700; Renault RN 0710; Peugeot Citroen (PSA) B71 2300; Fiat 9.55535-G2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00002 - Liqui Moly Molygen New Gene­ra­tion 5W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00002', 'Liqui Moly Molygen New Gene­ra­tion 5W-40', 'liqui-moly-molygen-new-generation-5w-40', 'Description




excellente propreté du moteur
excellent comportement aux températures élevées et basses
excellente protection anti-usure
excellente sécurité de lubrification
grande stabilité au cisaillement
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
réduit les frottements et l’usure
alimentation en huile rapide à basses températures
compatible avec turbocompresseur et catalyseur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 45.0, 5, 'TSC-00002-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 5, 'TSC-00002-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN', 'ACEA B4,', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.5; VW 502 00; VW 505 00; Renault RN 0700; Renault RN 0710; Porsche A40; Fiat 9.55535-H2; Fiat 9.55535-N2; Fiat 9.55535-Z2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: H 1155 - MAFRA Diamant Plast Dressing Pro 750 ML
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'H 1155', 'MAFRA Diamant Plast Dressing Pro 750 ML', 'mafra-diamant-plast-dressing-pro-750-ml', 'Description

Mafra Diamant Plast Shine 
😉Brillance intense. Réparation en profondeur. Protection longue durée.
😉Mafra Diamant Plast Shine est un produit de lustrage de qualité professionnelle
😉revitalise et protége les plastiques extérieurs et intérieurs,
😉les garnitures en caoutchouc et les composants du compartiment moteur .
😊IL offre des propriétés antistatiques et anti-UV pour prolonger la durée de vie et préserver la beauté des matériaux traités.
Caractéristiques principales :
👌Finition brillante : Restaure et rehausse l’aspect noir profond des surfaces en plastique et en caoutchouc
👌Protection contre les UV et les intempéries :
👌Protège les surfaces contre la décoloration, les fissures et l’oxydation causées par l’exposition au soleil et les contaminants environnementaux.
👌Formule antistatique : Repousse la poussière et la saleté pour conserver un aspect propre plus longtemps.
👌Utilisation polyvalente : Idéal pour les pare-chocs, les garnitures, les compartiments moteur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '750 ML', 27.0, 10, 'H 1155-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7501 - MANNOL Classic 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7501', 'MANNOL Classic 10W-40', 'mannol-classic-10w-40', 'Description

Propriétés du produit :
– La technologie Ester associée à la base HC avec une gamme élargie de propriétés viscosité-température assure un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode urbain et sur autoroute, sous charge accrue (conduite tout-terrain et en montée, remorquage, conduite avec charge maximale) et à des températures ambiantes élevées ;
– Idéal pour la conduite active. Ne perd pas sa fonctionnalité lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de l’indice de base total (TBN) élevé ;
– Préserve les paramètres de puissance et la fonctionnalité du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants en ester associés à un ensemble d’additifs modernes et uniques offrent d’excellentes propriétés anti-usure et anti-friction grâce à la durabilité exceptionnelle du film d’huile, qui, combinées à une bonne pompabilité, augme', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 21.0, 10, '7501-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN/CH-4', 'ACEA A3/B4', 'JASO MA2', FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'MB 229.1; RENAULT RN0700; RENAULT RN0710; PSA B71 2296')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: MANNOL Defender 10W-40 7507 - MANNOL Defender 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANNOL Defender 10W-40 7507', 'MANNOL Defender 10W-40', 'mannol-defender-10w-40', 'Description

Propriétés du produit :
Technologie ester et la base hydrosynthétique de dernière génération
Démarrage à froid, cycle urbain, cycle autoroutier, ainsi que sous forte charge (tout-terrain, montée, remorquage, charge maximale)
– Idéale pour une conduite sportive, elle conserve ses propriétés même avec un carburant de qualité variable (jusqu’à 500 ppm de soufre) grâce à un indice de basicité (TBN) élevé.
Grâce à sa technologie unique de réduction de l’usure et à ses composants esters, cette huile offre d’excellentes propriétés anti-usure et antifriction. 
Elle est conçue pour les moteurs essence et diesel d’une large gamme de véhicules (voitures particulières, SUV légers, minibus et camionnettes) de marques européennes et autres.
 recommandée pour les moteurs des véhicules Daimler et VW qui ont des exigences spécifiques en matière d’huile moteur (conformément aux spécifications ci-dessus).
Cette huile n’est pas adaptée aux poids lourds et véhicules similaires.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 100.0, 5, 'MANNOL Defender 10W-40 7507-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '7L', 100.0, 5, 'MANNOL Defender 10W-40 7507-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SP', 'ACEA A3/B4', 'JASO MA', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; MB 229.1; RENAULT RN0700; RENAULT RN0710; PSA B71 2294')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: Filtre habitacle MISFAT HB205 FIAT 500 / FORD KA - Filtre habitacle MISFAT HB205 FIAT 500 / FORD KA
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Filtre habitacle MISFAT HB205 FIAT 500 / FORD KA', 'Filtre habitacle MISFAT HB205 FIAT 500 / FORD KA', 'filtre-habitacle-misfat-hb205-fiat-500-ford-ka', 'Description

Dimensions



Type de filtre
Filtre de pollens


Longueur [mm]
202


Largeur [mm]
176


Hauteur [mm]
17


Clé de desserrage



Commentaires', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 24.0, 10, 'Filtre habitacle MISFAT HB205 FIAT 500 / FORD KA-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: BOSCH - A 299 S - (3 397 007 299) Balai d'essuie-glace FIAT 500 / FORD KA - BOSCH – A 299 S – (3 397 007 299) Balai d’essuie-g
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BOSCH - A 299 S - (3 397 007 299) Balai d''essuie-glace FIAT 500 / FORD KA', 'BOSCH – A 299 S – (3 397 007 299) Balai d’essuie-glace FIAT 500 / FORD KA', 'bosch-a-299-s-3-397-007-299-balai-dessuie-glace', 'Description


À savoir :


Type :Plat
Quantité :2
Avec spoiler :Oui




Gamme équipementier :Aerotwin


Vendu avec :




Balai d’essuie-glace
Longueur :600 mm




Balai d’essuie-glace
Longueur :340 mm', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 65.0, 10, 'BOSCH - A 299 S - (3 397 007 299) Balai d''essuie-glace FIAT 500 / FORD KA-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: Filtre à Huile MISFAT Z438 FIAT / FORD - Filtre à Huile MISFAT Z438 FIAT / FORD
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Filtre à Huile MISFAT Z438 FIAT / FORD', 'Filtre à Huile MISFAT Z438 FIAT / FORD', 'filtre-a-huile-misfat-z438-fiat-ford', 'Description

Caractéristiques :

Type de filtre : Filtre vissé
Diamètre extérieur [mm] : 69.5
Taraudage 1 [mm] : D2= M20x1.5
Diamètre 3 [mm] : 55
Diamètre 4 [mm] : 63
Hauteur [mm] : 86', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 14.0, 10, 'Filtre à Huile MISFAT Z438 FIAT / FORD-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: Filtre à air MISFAT P 301A FIAT / FORD - Filtre à air MISFAT P 301A FIAT / FORD
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Filtre à air MISFAT P 301A FIAT / FORD', 'Filtre à air MISFAT P 301A FIAT / FORD', 'filtre-a-air-misfat-p-301a-fiat-ford', 'Description

Caractéristiques :

Type de filtre : Cartouche filtrante
Longueur [mm] : 279
Largeur [mm] : 97
Hauteur [mm] : 60
Hauteur 1 [mm] : 49
Article complémentaire / Info complémentaire 2 : avec préfiltre', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 15.0, 10, 'Filtre à air MISFAT P 301A FIAT / FORD-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANNOL Additif ester diesel 9930 (250ml) - MANNOL Additif ester diesel 9930 (100ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANNOL Additif ester diesel 9930 (250ml)', 'MANNOL Additif ester diesel 9930 (100ml)', 'mannol-additif-ester-diesel-9930-250ml', 'Description

Propriétés du produit :
– Forme un film lubrifiant estéro-huileux stable et résistant, avec un fort pouvoir d’adsorption sur les composants du système d’alimentation, réduisant ainsi significativement le coefficient de frottement et l’usure des surfaces en contact. Cet effet est particulièrement visible sur les pompes à injection haute pression (piston-manchon, injecteurs et pompe-injecteur), prolongeant considérablement la durée de vie de ces équipements coûteux. Pour les pompes à injection haute pression, ce produit élimine la principale cause d’usure des pistons : un gazole sec de mauvaise qualité.
– Forme un complexe lubrifiant stable et résistant, un film estéro-huileux à forte adsorption, dans la chambre de combustion, au niveau de la chemise et du siège de soupape, lors de deux cycles sur quatre à partir de l’injection du mélange air-carburant. Ce film réduit significativement le coefficient de frottement et l’usure de la chemise, des segments de compression et des', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '100ml', 18.0, 10, 'MANNOL Additif ester diesel 9930 (250ml)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: Balai d'Essuie-Glace Plat KRAWEHL MAX - 1 pc 60CM - Balai d’Essuie-Glace Plat KRAWEHL MAX – 1 pc 60CM
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Balai d''Essuie-Glace Plat KRAWEHL MAX - 1 pc 60CM', 'Balai d’Essuie-Glace Plat KRAWEHL MAX – 1 pc 60CM', 'balai-dessuie-glace-plat-krawehl-max-1-pc-60cm', 'Description

Structure flexible grâce à sa fine lame flexible d’acier inoxydable qui assure l’élasticité du balai à tout moment. Excellente relation qualité/prix. Comprend un jeu complet d’adaptateurs, facilement interchangeables.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 25.0, 10, 'Balai d''Essuie-Glace Plat KRAWEHL MAX - 1 pc 60CM-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: Balai d'Essuie-Glace Plat KRAWEHL MAX - 1 pc 40CM - Balai d’Essuie-Glace Plat KRAWEHL MAX – 1 pc 40CM
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Balai d''Essuie-Glace Plat KRAWEHL MAX - 1 pc 40CM', 'Balai d’Essuie-Glace Plat KRAWEHL MAX – 1 pc 40CM', 'balai-dessuie-glace-plat-krawehl-max-1-pc-40cm', 'Description

Structure flexible grâce à sa fine lame flexible d’acier inoxydable qui assure l’élasticité du balai à tout moment. Excellente relation qualité/prix. Comprend un jeu complet d’adaptateurs, facilement interchangeables.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 25.0, 10, 'Balai d''Essuie-Glace Plat KRAWEHL MAX - 1 pc 40CM-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: FILTRE A AIR MISFAT P460A RENAULT - FILTRE A AIR MISFAT P460A RENAULT
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'FILTRE A AIR MISFAT P460A RENAULT', 'FILTRE A AIR MISFAT P460A RENAULT', 'filtre-a-air-misfat-p460a-renault', 'Description

Caractéristiques :

Article complémentaire / Info complémentaire 2 : avec préfiltre
Longueur [mm] : 248
Largeur 1 [mm] : 135
Largeur 2 [mm] : 192
Hauteur 1 [mm] : 59
Hauteur 2 [mm] : 69', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 26.0, 10, 'FILTRE A AIR MISFAT P460A RENAULT-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: FILTRE A HUILE MISFAT Z692 RENAULT - FILTRE A HUILE MISFAT Z692 RENAULT
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'FILTRE A HUILE MISFAT Z692 RENAULT', 'FILTRE A HUILE MISFAT Z692 RENAULT', 'filtre-a-huile-misfat-z692-renault', 'Description

Caractéristiques :

Type de filtre : Filtre vissé
Type de filtre : de haute performance
Diamètre extérieur [mm] : 78.3
Taraudage 1 [mm] : D2= M20x1.5
Diamètre 3 [mm] : 62
Diamètre 4 [mm] : 72
Hauteur [mm] : 65', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 15.0, 10, 'FILTRE A HUILE MISFAT Z692 RENAULT-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANN-FILTER W 712/94 (WV) - MANN-FILTER  Filtre à huile W 712/94 (WV)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN-FILTER W 712/94 (WV)', 'MANN-FILTER  Filtre à huile W 712/94 (WV)', 'mann-filter-filtre-a-huile-w-712-94-wv', 'Description

Équivalent à ces références constructeurs :

SEAT :03C115561H , 03C115561D
SKODA :03C115561D , 03C115561H 
VAG : 03C115561D , 03C115561H
VW : 03C115561D , 03C115561H

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182122
BOSCH : F026407183, P7116, F026407116
EUROREPAR : 1643608880
FEBI BILSTEIN : 49666
FILTRON : OP6412
HENGST FILTER : H314W, H314W01
HERTH+BUSS JAKOPARTS : J1310826
MAHLE : OC1778, OC5933
MAHLE FILTER : OC5934
MISFAT : Z140
PURFLUX : LS391A
UFI : 2357300
VAICO : V102102
WIX FILTERS : WL7494', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 40.0, 10, 'MANN-FILTER W 712/94 (WV)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: Castrol Magnatec Professional E 5W-20 5L - Castrol Magnatec Professional E 5W-20 5L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'castrol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Castrol Magnatec Professional E 5W-20 5L', 'Castrol Magnatec Professional E 5W-20 5L', 'castrol-magnatec-professional-e-5w-20-5l', 'Description

L’ Huile Moteur Castrol Ford Magnatec 5W20 , est une huile 100% synthétique formulée pour les moteurs essence des véhicules Ford. Elle apporte une protection dès le démarrage et offre une protection continue quelles que soient les températures, les conditions et les styles de conduites. Ses molécules adhèrent au moteur comme des aimants formant ainsi une couche de protection très résistante réduisant ainsi considérablement l’usure du moteur.
Cette huile remplace la Castrol Magnatec 5W20  et la Castrol Magnatec Stop Start 5W20 .
 
SPÉCIFICATIONS :
SAE 5W20, Ford WSS-M2C948-B.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 160.0, 10, 'Castrol Magnatec Professional E 5W-20 5L-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W20', NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Ford WSS-M2C948-B')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: CASTROL EDGE C3 5W-40 5L - CASTROL EDGE C3 5W-40 5L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'castrol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'CASTROL EDGE C3 5W-40 5L', 'CASTROL EDGE C3 5W-40 5L', 'castrol-edge-c3-5w-40-5l', 'Description

Spécifications

ACEA C3
API SN/CF
Opel OV 040 1547 – D40
MB-Approval 226.5/ 229.31/ 229.51
Renault RN0700 / RN0710
VW 505 00/ 505 01
Fiat 9.55535-S2
Ford WSS-M2C917-A

Type
100 % synthétique', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 150.0, 10, 'CASTROL EDGE C3 5W-40 5L-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN/CF', 'ACEA C3', NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'VW 505 00; Renault RN0700; Ford WSS-M2C917-A; Fiat 9.55535-S2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: MANN-FILTER (CU 8430 ) Filtre d'habitacle - MANN-FILTER (CU 8430 ) Filtre d’habitacle
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN-FILTER (CU 8430 ) Filtre d''habitacle', 'MANN-FILTER (CU 8430 ) Filtre d’habitacle', 'mann-filter-cu-8430-filtre-dhabitacle', 'Description

Équivalent à ces références équipementiers :

3F QUALITY : 1602
ACDelco : PU1157E
ALCO FILTER : MS6305
AMC Filter : FCA10126
ARMAFILT : K83515825
ASHIKA : 21BYBY00
BIG FILTER : GB9811
BLUE PRINT : ADB112506
BOSCH : M2124, 1987432124, 1987432124KL9
CHAMPION : CCF0118
CLEAN FILTERS : NC2314
COMLINE : EKF107
CORTECO : MP195, 80000063, CP1154
CoopersFiaam : PC8172
DELPHI : TSP0325184
DENSO : DCF096P
Dr!ve+ : DP1110120049
EUROREPAR : 1686236980, E146122
FEBI BILSTEIN : 23684
FIL FILTER : HC7121
FILTRON : K1169
FRAM : CF10207
GUD FILTERS : AC76
HENGST FILTER : E1959LI
HERTH+BUSS JAKOPARTS : J1340866
HIFI FILTER : SC5091
HOFFER : 8300394F
JAPANPARTS : FAABY00
KOLBENSCHMIDT : 769AC, 50013769
LAUTRETTE : ELR7151
MAGNETI MARELLI : 350203062080, BCF208
MAHLE : LA248, LA1065
MAHLE FILTER : LA248
MANN-FILTER : CUK8430, FP8430
MAPCO : 67618, 65618
MEAT & DORIA : 17394F
MECAFILTER : ELR7151
MEYLE : 3123200015, 3123190015
MFILTER : K9033
MICRONAIR : MP195
MISFAT : HB316
MOTAQUIP : VCF355', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 90.0, 10, 'MANN-FILTER (CU 8430 ) Filtre d''habitacle-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANN-FILTER - (HU 815/2 x) Filtre à huile - MANN-FILTER – (HU 815/2 x) Filtre à huile
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN-FILTER - (HU 815/2 x) Filtre à huile', 'MANN-FILTER – (HU 815/2 x) Filtre à huile', 'mann-filter-hu-815-2-x-filtre-a-huile', 'Description



Équivalent à ces références constructeurs :

BMW : 11427501676, 11427508969, 11427619232, 11427619319

Équivalent à ces références équipementiers :

A.L. FILTER : ALO8156
A.L. Group : ALO8156
ACDelco : AC6280E
ALCO FILTER : MD455
AMC Filter : FOF10143
ARMAFILT : OB72790
ASAS : AS1571
ASHIKA : FOE079JM, 10ECO079
AVS AUTOPARTS : L028
BLUE PRINT : ADB112106
BOSCH : 09864B7018, 1457429262, 1457429258, 0986AF1507, 0986AF0256, 0986AF1503, P9262
CHAMPION : XE544606, CX11701O01, XE544, COF100544E
CLEAN FILTERS : ML1729
COMLINE : EOF169
COOPERS : G1549
CROSLAND FILTERS : 2290
CoopersFiaam : FA5641ECO
Dr!ve+ : DP1110110082
EUROREPAR : 1643612780, E149121, 1682281780
FEBI BILSTEIN : 26705, 221902
FIL FILTER : MLE1533
FILMAR : EF1088
FILTRON : OE6496
FRAD : 17331510
FRAM : CH9547ECO
GIF : LI122
GUD FILTERS : M47
HENGST FILTER : E29HD89
HERTH+BUSS JAKOPARTS : J1310845
HIFI FILTER : SO7136
JAPANPARTS : FOECO079, FOE079JM
K&N Filters : HP7054
KOLBENSCHMIDT : 50013661, 661OX
LAUTRETTE :', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 38.0, 10, 'MANN-FILTER - (HU 815/2 x) Filtre à huile-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: BOSCH 3 397 007 072 Balai d'essuie-glace - BOSCH 3 397 007 072 – A 072 S –
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BOSCH 3 397 007 072 Balai d''essuie-glace', 'BOSCH 3 397 007 072 – A 072 S –', 'bosch-3-397-007-072-a-072-s', 'Description


À savoir :


Type :Plat
Quantité :2
Avec spoiler :Oui




Gamme équipementier :Aerotwin


Vendu avec :




Balai d’essuie-glace
Longueur :600 mm




Balai d’essuie-glace
Longueur :475 mm', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 100.0, 10, 'BOSCH 3 397 007 072 Balai d''essuie-glace-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: Balai d'Essuie-Glace- Arrière Universel - 1 pc (35cm) NER 7031 - Balai d’Essuie-Glace- Arrière Universel – 1 pc (35
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'jotate';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Balai d''Essuie-Glace- Arrière Universel - 1 pc (35cm) NER 7031', 'Balai d’Essuie-Glace- Arrière Universel – 1 pc (35cm)', 'balai-dessuie-glace-arriere-universel-1-pc-35cm', 'Description

ALFA ROMEO
GIULIETTA (5p) 12.2011 – 02.2020
MITO 12.2013 – 10.2018
BMW
X3 (5p) 03.2004 – 08.2011
CITROËN
BERLINGO (5p) 04.2008 –
BERLINGO MULTISPACE (5p) 04.2008 –
C3 I (5p) 02.2002 –
C4 GRAND PICASSO I (5p) 07.2008 – 08.2013
C4 GRAND PICASSO II (5p) 09.2013 –
C4 PICASSO II VAN 02.2013 –
C4 PICASSO II VAN 02.2013 –
C4 PICASSO II VAN 10.2006 – 08.2013
C4 SPACETOURER (5p) 04.2018 –
C8 (5p) 07.2002 –
JUMPY (5p) 01.2007 – 03.2016
SAXO (3/5p) 11.1996 – 06.2003
XANTIA BREAK (5p) 01.1998 – 04.2003
DACIA
DUSTER (5p) 10.2010 – 01.2008
LOGAN MCV 02.2007 –
FIAT
SCUDO 01.2007 –
STILO MULTI WAGON (5p) 09.2003 – 08.2008
ULYSSE (5p) 08.2002 – 06.2011
FORD
GALAXY II (5p) 09.2007 – 06.2015
GRAND/TOURNEO CONNECT 11.2013 –
TRANSIT CONNECT (5p) 02.2013 –
TRANSIT COURIER (3p) 02.2014 –
FORS FOCUS II (3/5p) 07.2004 – 09.2012
HONDA
CR-V III (5p) 10.2006 – 06.2012
JAZZ II (5p) 03.2002 – 10.2008
JAZZ III (5p) 07.2008 – 03.2014
JAZZ IV (5p) 09.2015 –
HYUNDAI
IONIQ ELECTRIC (5p) 03.2016 –
SANTA FE I', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 20.0, 10, 'Balai d''Essuie-Glace- Arrière Universel - 1 pc (35cm) NER 7031-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MISFAT- Z413 FILTRE A HUILE FORD ECOBOOST - MISFAT- Z413 FILTRE A HUILE FORD ECOBOOST
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MISFAT- Z413 FILTRE A HUILE FORD ECOBOOST', 'MISFAT- Z413 FILTRE A HUILE FORD ECOBOOST', 'misfat-z413-filtre-a-huile-ford-ecoboost', 'Description




FORD
ECOSPORT (1.0 EcoBoost) (04/2020 – …)


FORD
ECOSPORT (1.0 EcoBoost) (04/2018 – …)


FORD
ECOSPORT (1.0 EcoBoost) (10/2013 – …)


FORD
ECOSPORT (1.0 EcoBoost) (03/2016 – …)






FORD
FOCUS II (DA_, HCP, DP) (1.8) (03/2006 – 09/2012)


FORD
FOCUS II (DA_, HCP, DP) (1.8 Flexifuel) (01/2006 – 09/2012)


FORD
FOCUS II (DA_, HCP, DP) (2.0) (07/2004 – 09/2012)


FORD
FOCUS II (DA_, HCP, DP) (2.0 LPG) (06/2008 – 07/2011)


FORD
FOCUS II (DA_, HCP, DP) (2.0 CNG) (04/2009 – 07/2011)


FORD
FOCUS II Turnier (DA_, FFS, DS) (1.8) (03/2006 – 09/2012)


FORD
FOCUS II Turnier (DA_, FFS, DS) (1.8 Flexifuel) (01/2006 – 09/2012)


FORD
FOCUS II Turnier (DA_, FFS, DS) (2.0) (07/2004 – 09/2012)


FORD
FOCUS II Turnier (DA_, FFS, DS) (2.0 LPG) (06/2008 – 07/2011)


FORD
FOCUS II A trois volumes (DB_, FCH, DH) (1.8) (03/2006 – 09/2012)


FORD
FOCUS II A trois volumes (DB_, FCH, DH) (1.8 Flexifuel) (06/2006 – 07/2011)


FORD
FOCUS II A trois volumes (DB_, FCH, DH) (2.0) (04/2005 – 07/20', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 14.0, 10, 'MISFAT- Z413 FILTRE A HUILE FORD ECOBOOST-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANNOL Additif Ester de Benzine 9950 (250ml) - MANNOL Additif Ester de Benzine  9950 (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANNOL Additif Ester de Benzine 9950 (250ml)', 'MANNOL Additif Ester de Benzine  9950 (250ml)', 'mannol-additif-ester-de-benzine-9950-250ml', 'Description

Dernière innovation : un additif lubrifiant pour essence. Il est destiné à tous les types de systèmes d’alimentation des moteurs essence, et notamment aux moteurs à injection directe. Ce système a été introduit plus tôt sur les moteurs diesel et a démontré son efficacité, mais a également révélé des problèmes liés à une lubrification insuffisante des pièces métalliques mobiles du système d’alimentation, en particulier de la pompe à injection haute pression. Nous présentons un complexe multifonctionnel pour essence. Cet ensemble équilibré d’additifs répond aux exigences les plus modernes, est compatible avec tous les types d’essence, se mélange facilement et se dissout complètement. Il garantit l’amélioration de tous les carburants commerciaux, même ceux contenant de l’éthanol, en leur conférant des propriétés optimales et en les hissant au rang de carburant de marque. Lors de tests de lubrification sur l’essence commerciale AI-95, une réduction de plus de moitié du diamètr', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 18.0, 10, 'MANNOL Additif Ester de Benzine 9950 (250ml)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MISFAT - Z646 Filtre à huile vw - MISFAT – Z646 Filtre à huile vw
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MISFAT - Z646 Filtre à huile vw', 'MISFAT – Z646 Filtre à huile vw', 'misfat-z646-filtre-a-huile-vw', 'Description

Équivalent à ces références équipementiers :


BLUE PRINT : ADV182118
BOSCH : F026407143, P7143
EUROREPAR : 1619270580
FILTRON : OP6163
MAHLE FILTER : OC9771
MANN-FILTER : W71295, W71292
MECAFILTER : ELH4442
MISFAT : Z646
VALEO : 728738, 586142
WIX FILTERS : WL7503', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 17.0, 10, 'MISFAT - Z646 Filtre à huile vw-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7903 - MANNOL Elite 5W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7903', 'MANNOL Elite 5W-40', 'mannol-elite-5w-40', 'Description

Caractéristiques du produit :
– La technologie ester et une base synthétique avec une plage élargie de propriétés visco-température garantissent un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode urbain, en mode autoroute, ainsi que sous charge accrue (lors de la conduite sur des routes impraticables, en montée, en déplacement avec une remorque, charge maximale) et à des températures ambiantes élevées :
– Idéale pour la conduite active et ne perd pas ses propriétés lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de la grande réserve d’indice alcalin (TBN) ;
– La base synthétique contenant des esters associée à un ensemble d’additifs moderne préserve les paramètres de puissance du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants de l’huile ester offrent d’excellentes propriétés anti-usure et antifriction grâce à la résistance e', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 137.0, 10, '7903-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN/CH-4', 'ACEA A3/B4', 'JASO MA2', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; BMW LL-01; BMW LL-98; RENAULT RN0710; RENAULT RN0700; PSA B71 2296; PORSCHE A40; FIAT 9.55535-H2; FIAT 9.55535-Z2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7907 - MANNOL Energy Combi LL 5W-30
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7907', 'MANNOL Energy Combi LL 5W-30', 'mannol-energy-combi-ll-5w-30-2', 'Description

Caractéristiques du produit :
– Grâce aux composants esters contenus, elle possède d’excellentes propriétés antigrippantes, anti-usure et antifriction, ce qui garantit un fonctionnement long et sans problème du système pompe-buse ;
– Grâce à ses excellentes propriétés de lavage et de dispersion et à la plus haute stabilité à l’oxydation thermique, elle lutte efficacement contre tous les types de dépôts et maintient les pièces du moteur propres pendant tout l’intervalle entre les remplacements ;
– Économise du carburant grâce à des propriétés antifriction optimales ;
– Les composants esters en combinaison avec une base bi-synthétique garantissent un démarrage facile du moteur à basse température grâce à des indicateurs exceptionnels de démarrage et de pompabilité, ce qui réduit considérablement l’usure au démarrage du moteur.
– Elle possède une viscosité optimale dans une large plage de températures, ce qui garantit un fonctionnement stable dans tous les modes de fonctionne', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 5, '7907-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 5, '7907-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SN', 'ACEA C3', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.51; BMW LL-04; PORSCHE C30')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: P1241DSSC - PRO TEC Systèmes Diesel Super Clean (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P1241DSSC', 'PRO TEC Systèmes Diesel Super Clean (375ml)', 'pro-tec-systemes-diesel-super-clean-375ml-pro-tec-systemes-diesel-super-clean-375ml', 'Description

Avantages :
– combustion propre et puissante (performance moteur optimale et consommation de carburant remarquablement réduite)
– réduction considérable des émissions de fumées et de suites
– lubrification améliorée lors des démarrages à froid
– durée de vie prolongée des unités d’injection et des catalyseurs
– des émissions d’échappement.

À utiliser dans les moteurs diesel. Recommandé pour les moteurs avec filtre à particules, turbo et pot catalytique

Directement connecté au réservoir de diesel ou utilisé avec un équipement de filet spécial.
375 ml de jus pour 80 litres de diesel. Rapport de mélange : 1:200

pendentif que le moteur tourne', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 33.0, 10, 'P1241DSSC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00028 - MANNOL Nettoyant à jet diesel 9956
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00028', 'MANNOL Nettoyant à jet diesel 9956', 'mannol-nettoyant-a-jet-diesel-9956', 'Description

Un nettoyant de buse puissant à action rapide pour tous les types de moteurs diesel (turbo et atmosphériques, avec et sans systèmes de post-traitement des gaz d’échappement) à action complexe. Particulièrement recommandé pour les moteurs ayant des problèmes de démarrage et des performances irrégulières.
Propriétés du produit :
– Nettoie rapidement et efficacement les buses en éliminant le goudron, le carbone et autres dépôts des buses. Élimine le grippage des aiguilles ;
– Augmente l’indice de cétane, assure une combustion calme, douce et complète du carburant ;
– Facilite le démarrage, élimine les à-coups et la mauvaise réponse de l’accélérateur du moteur, stabilise le régime de ralenti et augmente la puissance du moteur en améliorant l’atomisation du carburant. Réduit la toxicité des gaz d’échappement ;
– Économise du carburant, toutes choses égales par ailleurs ;
– Fournit une lubrification supplémentaire des composants clés du système de carburant (pompe à carburant ha', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 18.0, 10, 'TSC-00028-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00029 - MANNOL Nettoyant pour injecteurs 9957
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00029', 'MANNOL Nettoyant pour injecteurs 9957', 'mannol-nettoyant-pour-injecteurs-9957', 'Description

Propriétés du produit :
– Nettoie rapidement et efficacement les buses, en éliminant les dépôts de carbone, de goudron et autres dépôts des aiguilles et des buses ;
– Élimine les dépôts de carbone et autres dépôts des soupapes d’admission, des soupapes et des chambres de combustion ;
– Stabilise le processus de combustion de l’essence, assure une combustion calme, douce et complète du carburant ;
– Facilite le démarrage, élimine les à-coups et la mauvaise réponse de l’accélérateur du moteur, stabilise le régime de ralenti et augmente la puissance du moteur en améliorant l’atomisation du carburant. Réduit la toxicité des gaz d’échappement ;
– Économise du carburant, toutes choses égales par ailleurs ;
– Fournit une lubrification supplémentaire des composants clés du système de carburant (pompe à carburant et injecteurs) et des pièces du groupe cylindre-piston, évitant ainsi des réparations coûteuses, prolongeant leur durée de vie et la durée de vie du moteur ;
– Protège le', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 18.0, 10, 'TSC-00029-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9808 - Mannol Shampoing super concentré (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9808', 'Mannol Shampoing super concentré (1L)', 'mannol-shampoing-super-concentre-1l-mannol-shampoing-super-concentre-1l', 'Description

Propriétés :
– Un mélange spécial de substances actives-agents moussants crée une mousse active très riche et nettoie en profondeur la voiture ;
– Les détergents actifs éliminent efficacement tous les types de taches et de saletés : poussière, carburant, huile, graisse, suie, résidus d’insectes, etc. grâce à leurs excellentes propriétés de fractionnement ;
– Convient pour le lavage des vitres ;
– Se lave facilement à l’eau sans laisser de taches, de traces, de taches et d’autres traces ;
– Protège la carrosserie après le lavage et lui donne une excellente brillance, particulièrement recommandé pour une utilisation avant de mettre la voiture en remisage (stationnement de longue durée) ;
– Se dissout rapidement dans l’eau chaude (tiède) et froide. Efficace même en cas d’utilisation d’eau dure ;
– A une agréable odeur d’agrumes ;
– Sans phosphate, biodégradable.
Compatibilité : sans danger pour les surfaces peintes, les plastiques et les produits techniques en caoutchouc.
App', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 22.5, 10, '9808-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 23127 - WOLF GUARDTECH 10W40 B4
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '23127', 'WOLF GUARDTECH 10W40 B4', 'wolf-guardtech-10w40-b4', 'Description

Description
Il s’agit d’un lubrifiant semi-synthétique composé d’huiles de base hautement raffinées et soigneusement sélectionnées. Cette huile moteur de pointe a été spécialement élaborée pour répondre aux exigences ACEA A3/B4 et aux normes Euro 4. Elle a été conçue pour la lubrification de moteurs essence et diesel à 4 temps, y compris les moteurs diesel à injection directe, tels que common rail, HDI, CDI, etc. Ses caractéristiques principales incluent notamment une faible teneur en cendres et une résistance élevée au vieillissement.
Applications
Idéal pour la plupart des moteurs à essence et diesel normalement alimentés en air et suralimentés. Particulièrement recommandé pour les moteurs diesel à injection directe, à rampe commune, HDI, CDI, etc. Peut servir toute l’année en raison de son indice de viscosité optimal.
Performances
Les additifs soigneusement sélectionnés contribuent à la propreté et la durabilité des moteurs et fournissent une protection exceptionnelle co', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 20.0, 3, '23127-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 20.0, 3, '23127-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 20.0, 3, '23127-U-3')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', NULL, 'ACEA A3/B4 et aux normes Euro 4.', NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: WUNDER filtre à air OPEL CORSA D - WUNDER filtre à air OPEL CORSA D
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'WUNDER filtre à air OPEL CORSA D', 'WUNDER filtre à air OPEL CORSA D', 'wunder-filtre-a-air-opel-corsa-d', 'Description

Équivalent à ces références constructeurs :

GENERAL MOTORS 
OPEL 
VAUXHALL  

Équivalent à ces références équipementiers :

BOSCH : F026400049, S0049
DENCKERMANN : A140865
FILTRON : AP0722
KAMOKA : F222101
MANN-FILTER : C201061
PURFLUX : A1239
SCT – MANNOL : SB2243
UFI : 3029700
VALEO : 585199
WIX FILTERS : WA9527', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 20.0, 10, 'WUNDER filtre à air OPEL CORSA D-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANN-FILTER - c 14 130 - MANN-FILTER – C14 130 Filtre à air
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'c14130';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN-FILTER - c 14 130', 'MANN-FILTER – C14 130 Filtre à air', 'mann-filter-c14-130-filtre-a-air', 'Description

Équivalent à ces références constructeurs :

SEAT : 3C0129620, 1F0129620
SKODA : 3C0129620, 1F0129620
VAG : 1F0129620, 3C0129620
VW : 3C0129620, 1F0129620

Équivalent à ces références équipementiers :

ASHIKA : FA0916JM
BLUE PRINT : ADV182202
BOSCH : 0986AF2901, S9405, 1987429405000, 1987429405
EUROREPAR : 1672352180, 1680331480, E147308
FEBI BILSTEIN : 31386588, 31386
FILTRON : AK3704, AK370
GIF : GA892
HENGST FILTER : E482L
JAPANPARTS : FA0916JM
MAHLE : LX3784, LX1566
MAHLE FILTER : LX1566, LX3784
MISFAT : R433B, R433
PURFLUX : A1168
QUINTON HAZELL : QFA0312, QFA0947
SWAG : 30931386
TECNOCAR : A2120
UFI : 2740100
VAICO : V100619, 100619
WIX FILTERS : WA9756, WA9445', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 50.0, 10, 'MANN-FILTER - c 14 130-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: C 27 009 - MANN-FILTER – C 27 009 Filtre à air (golf 7 leon)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'C 27 009', 'MANN-FILTER – C 27 009 Filtre à air (golf 7 leon)', 'mann-filter-c-27-009-filtre-a-air-golf-7-leon-mann-filter-c-27-009-filtre-a-air-golf-7-leon', 'Description


À savoir :


Longueur :269 mm
Largeur :191 mm
Épaisseur :24 mm
Avantage produit :Sans préfiltre
Forme :Plat
Type :Cartouche



Équivalent à ces références constructeurs :

SKODA : 04E129620
VAG : 04E129620
VW :04E129620

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182281, ADV182221
BOSCH : 0986B02539, F026400342
CHAMPION : CU41003, CU43101A01, CAF101067P
EUROREPAR : 1680349280, 1672352480, 1616268680
FEBI BILSTEIN : 104798
FILTRON : AP0621
MAHLE : LX3807, LX3525, LX4037
MISFAT : P255
PURFLUX : A1567
SCT – MANNOL : SB2319
UFI : 3054900
VAICO : V103137
VALEO : 585431
WIX FILTERS : WA9766', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 50.0, 10, 'C 27 009-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: w 712/95 - MANN-FILTER Filtre à huile W 712/95 (VW)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'filtre-a-huile-mann';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'w 712/95', 'MANN-FILTER Filtre à huile W 712/95 (VW)', 'mann-filter-filtre-a-huile-w-712-95-vw', 'Description

Équivalent à ces références constructeurs :

FORD :2621215
SEAT : 04E115561B , 04E115561H
SKODA : 04E115561B , 04E115561H 
VAG :04E115561AC ,04E115561 ,04E115561H ,04E115561T ,04E115561B ,04E115561D 
VW : 04E115561H ,04E115561B 
VW (FAW) :L04E115561S
VW (SVW) :L04E115561S

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182118
BOSCH : F026407143
EUROREPAR : 1619270580, 1682280380
FEBI BILSTEIN : 108330
FILTRON : OP6163
GIF : GL342
HENGST FILTER : H317W, H317W01
HERTH+BUSS JAKOPARTS : J1310842
MAHLE : OC11961, OC9771, OC1779
MISFAT : Z646
SCT – MANNOL : SM836L
UFI : 2357500
VAICO : V102599
WIX FILTERS : WL7503', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 30.0, 10, 'w 712/95-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: FEBI AdBlue® 10L - FEBI AdBlue® 10L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'adblue';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'FEBI AdBlue® 10L', 'FEBI AdBlue® 10L', 'febi-adblue-10l-touring-studio-car', 'Description






Réparation de véhicules. Nous avons tout ce qu’il vous faut!
L’AdBlue® est une solution aqueuse composée de 32,5% d’urée synthétique et de 67,5% d’eau déminéralisée. Ce n’est pas une substance dangereuse, car elle est biodégradable, non toxique, incolore et soluble dans l’eau.
L’AdBlue® est utilisé en combinaison avec un système SCR pour le traitement des gaz d’échappement des véhicules commerciaux et des voitures à moteur diesel, en faisant réagir la solution à base d’urée avec les gaz d’échappement chauds dans un catalyseur SCR. Les oxydes d’azote toxiques sont transformés en azote inoffensif et en vapeur d’eau afin de répondre aux normes d’émission Euro 5 et Euro 6.




Qualité
La pureté de l’AdBlue® est un facteur déterminant pour la qualité. febi propose exclusivement de l’AdBlue® d’une pureté contrôlée selon les normes ISO 22241, DIN 70070 et AUS32 afin d’éviter tout dommage au système SCR et au catalyseur et de garantir un fonctionnement fiable du système.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '10L', 65.0, 10, 'FEBI AdBlue® 10L-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MISFAT Filtre à huile - L064A - MISFAT Filtre à huile  – L064A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MISFAT Filtre à huile - L064A', 'MISFAT Filtre à huile  – L064A', 'misfat-filtre-a-huile-l064a', 'Description


Équivalent à ces références constructeurs :
CHEVROLET AVEO
OPEL : ASTRA H  CORSA D …
VAUXHALL 
BOSCH : P7006, F026407006, 09864B7009, 0986627555
EUROREPAR : E149247
FILTRON : OE6486
MECAFILTER : ELH4368
MISFAT : L064A
VALEO : 586531
WE PARTS : 14107
WIX FILTERS : WL7422', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 15.0, 10, 'MISFAT Filtre à huile - L064A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA A9 SILVER DYNAMIC AGM XEV 12V 50AH 540A - VARTA A9 SILVER DYNAMIC AGM XEV 12V 50AH 540A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA A9 SILVER DYNAMIC AGM XEV 12V 50AH 540A', 'VARTA A9 SILVER DYNAMIC AGM XEV 12V 50AH 540A', 'varta-a9-silver-dynamic-agm-xev-12v-50ah-540a', 'Description

Tension de batterie :            12 V
*Capacité Ah  :                      50 Ah
*Puissance au démarrage : 540 A
*Type de Bornes :                 EUROPÉENNE
*Polarité Borne   :                 positive à droite
*Listeaux :                             B13
*Dimensions :                       207 x 175 x 190 mm
*Poids :                                 14 Kg
*Garantie :                            18MOIS
*Critère :                               PERFORMANCE / HAUT DE GAMME
*Type de véhicule :              Auto, véhicules hybrides
*Type de batterie :               Start-Stop AGM
*Application Démarrage:    START AND STOP
*Référence marque  :          550901054', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '50AH', 670.0, 10, 'VARTA A9 SILVER DYNAMIC AGM XEV 12V 50AH 540A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA - Silver Dynamic AGM A4 L6 105 Ah 950A - VARTA – Silver Dynamic AGM A4 L6 105 Ah 950A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA - Silver Dynamic AGM A4 L6 105 Ah 950A', 'VARTA – Silver Dynamic AGM A4 L6 105 Ah 950A', 'varta-silver-dynamic-agm-a4-l6-105-ah-950a-performance-indispensable', 'Description

Caractéristiques :

Hauteur : 190
Largeur : 175
Longueur : 393
Capacité en (Ah) : 105
Puissance de démarrage en (A) : 950
Voltage (V) : 12
Type : L6
START & STOP AGM', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '105 Ah', 1.22, 10, 'VARTA - Silver Dynamic AGM A4 L6 105 Ah 950A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA - Silver Dynamic AGM A5 L5 95 Ah 850A - VARTA – Silver Dynamic AGM A5 L5 95 Ah 850A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA - Silver Dynamic AGM A5 L5 95 Ah 850A', 'VARTA – Silver Dynamic AGM A5 L5 95 Ah 850A', 'varta-silver-dynamic-agm-a5-l5-95-ah-850a-experience-captivante-touring-varta-silver-dynamic-agm-a5-l5-95-ah-850a', 'Description

Caractéristiques :

Hauteur : 190
Largeur : 175
Longueur : 353
Capacité en (Ah) : 95
Puissance de démarrage en (A) : 850
Voltage (V) : 12
Type : L5
START & STOP AGM', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '95 Ah', 1.1, 10, 'VARTA - Silver Dynamic AGM A5 L5 95 Ah 850A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA silver dynamic A6 AGM 80ah 800A - VARTA silver dynamic A6 AGM 80ah 800A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA silver dynamic A6 AGM 80ah 800A', 'VARTA silver dynamic A6 AGM 80ah 800A', 'varta-silver-dynamic-a6-agm-80ah-800a', 'Description

Caractéristiques :

Hauteur : 190
Largeur : 175
Longueur : 278
Capacité en (Ah) : 80
Puissance de démarrage en (A) : 800
Voltage (V) : 12
Type : L4
START & STOP AGM', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '80ah', 900.0, 10, 'VARTA silver dynamic A6 AGM 80ah 800A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA - Silver Dynamic AGM A7 L3 70 Ah 760A - VARTA – Silver Dynamic AGM A7 L3 70 Ah 760A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA - Silver Dynamic AGM A7 L3 70 Ah 760A', 'VARTA – Silver Dynamic AGM A7 L3 70 Ah 760A', 'varta-silver-dynamic-agm-a7-l3-70-ah-760a', 'Description

Caractéristiques :

Hauteur : 190
Largeur : 175
Longueur : 278
Capacité en (Ah) : 70
Puissance de démarrage en (A) : 760
Voltage (V) : 12
Type : L3 (START & STOP) AGM', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '70 Ah', 790.0, 10, 'VARTA - Silver Dynamic AGM A7 L3 70 Ah 760A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA - Silver Dynamic AGM A8 L2 60 Ah 680A - VARTA – Silver Dynamic AGM A8 L2 60 Ah 680A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA - Silver Dynamic AGM A8 L2 60 Ah 680A', 'VARTA – Silver Dynamic AGM A8 L2 60 Ah 680A', 'varta-silver-dynamic-agm-a8-l2-60-ah-680a-experience-prodigieuse-touring-studio-car-varta-silver-dynamic-agm-a8-l2-60-ah-680a', 'Description

Caractéristiques :

Hauteur : 190
Largeur : 175
Longueur : 242
Capacité en (Ah) : 60
Puissance de démarrage en (A) : 680
Voltage (V) : 12
Type : L2 (START & STOP) AGM', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '60 Ah', 690.0, 10, 'VARTA - Silver Dynamic AGM A8 L2 60 Ah 680A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA - Silver Dynamic D21 L2B 61 Ah 600A - VARTA – Silver Dynamic D21 L2B 61 Ah 600A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA - Silver Dynamic D21 L2B 61 Ah 600A', 'VARTA – Silver Dynamic D21 L2B 61 Ah 600A', 'varta-silver-dynamic-d21-l2b-61-ah-600a', 'Description

Caractéristiques :

Hauteur : 175
Largeur : 175
Longueur : 242
Capacité en (Ah) : 61
Puissance de démarrage en (A) : 600
Voltage (V) : 12
Type : L2', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '61 Ah', 400.0, 10, 'VARTA - Silver Dynamic D21 L2B 61 Ah 600A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA Blue Dynamic G8 M11G 95ah 830A - VARTA Blue Dynamic G8 M11G 95ah 830A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA Blue Dynamic G8 M11G 95ah 830A', 'VARTA Blue Dynamic G8 M11G 95ah 830A', 'varta-blue-dynamic-g8-m11g-95ah-830a', 'Description

Caractéristiques :

Hauteur : 225
Largeur : 173
Longueur : 306
Capacité en (Ah) : 95
Puissance de démarrage en (A) : 830
Voltage (V) : 12
Type : M11G', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '95ah', 580.0, 10, 'VARTA Blue Dynamic G8 M11G 95ah 830A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA - Blue Dynamic G7 M11 95 Ah 830A - VARTA – Blue Dynamic G7 M11 95 Ah 830A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA - Blue Dynamic G7 M11 95 Ah 830A', 'VARTA – Blue Dynamic G7 M11 95 Ah 830A', 'varta-blue-dynamic-g7-m11-95-ah-830a', 'Description

Caractéristiques :

Hauteur : 225
Largeur : 173
Longueur : 306
Capacité en (Ah) : 95
Puissance de démarrage en (A) : 830
Voltage (V) : 12
Type : M11', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '95 Ah', 580.0, 10, 'VARTA - Blue Dynamic G7 M11 95 Ah 830A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA - Blue Dynamic E24 M10G 70 Ah 630A - VARTA – Blue Dynamic E24 M10G 70 Ah 630A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA - Blue Dynamic E24 M10G 70 Ah 630A', 'VARTA – Blue Dynamic E24 M10G 70 Ah 630A', 'varta-blue-dynamic-e24-m10g-70ah-630a', 'Description

Caractéristiques :

Hauteur : 220
Largeur : 175
Longueur : 261
Capacité en (Ah) : 70
Puissance de démarrage en (A) : 630
Voltage (V) : 12
Type : M10G', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '70 Ah', 425.0, 10, 'VARTA - Blue Dynamic E24 M10G 70 Ah 630A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA -Blue Dynamic E23 M10 70 Ah 630A - VARTA -Blue Dynamic E23 M10 70 Ah 630A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA -Blue Dynamic E23 M10 70 Ah 630A', 'VARTA -Blue Dynamic E23 M10 70 Ah 630A', 'varta-blue-dynamic-e23-m10-70-ah-630a', 'Description

Caractéristiques :

Hauteur : 220
Largeur : 175
Longueur : 261
Capacité en (Ah) : 70
Puissance de démarrage en (A) : 630
Voltage (V) : 12
Type : M10
une batterie puissante avec des caractéristiques optimales pour des performances exceptionnelles.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '70 Ah', 425.0, 10, 'VARTA -Blue Dynamic E23 M10 70 Ah 630A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 31008-AREXONS Nettoyant tissus (500ML) - AREXONS Nettoyant tissus (500ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'arexons';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '31008-AREXONS Nettoyant tissus (500ML)', 'AREXONS Nettoyant tissus (500ML)', 'arexons-nettoyant-tissus-500ml', 'Description

Ce produit nettoie en profondeur et en douceur, restituant les couleurs d’origine de toutes les surfaces en tissu, en tissu et en velours de votre voiture, comme les sièges, les moquettes, les panneaux de porte et les tapis de sol. Il contient des substances actives qui pénètrent dans les fibres et neutralisent les odeurs de fumée ou d’animaux. l’AREXONS Nettoyant tissus (500ML) pour garantir la propreté de vos surfaces en tissu  .', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ML', 30.0, 10, '31008-AREXONS Nettoyant tissus (500ML)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 34019-AREXONS no insectes (500ML) - AREXONS no insectes (500ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'arexons';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '34019-AREXONS no insectes (500ML)', 'AREXONS no insectes (500ML)', 'arexons-no-insectes-500ml', 'Description

Le décapant résine et insectes est idéal pour éliminer les dépôts de résine, légers ou étendus, de la carrosserie et de toutes les surfaces automobiles (vitres, métal, planches de bord, etc.). Il contient également des substances spéciales qui ramollissent et dissolvent les débris organiques laissés par les insectes et les mouches, facilitant ainsi leur élimination. Sa formule gel spéciale crée une mousse active, offrant d’excellents résultats, même sur les surfaces verticales.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ML', 25.0, 10, '34019-AREXONS no insectes (500ML)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 31021-AREXONS rénovateur pneus (500ML) - AREXONS rénovateur pneus (500ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'arexons';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '31021-AREXONS rénovateur pneus (500ML)', 'AREXONS rénovateur pneus (500ML)', 'arexons-renovateur-pneus-500ml', 'Description

Spécialement conçu pour polir, nettoyer, rénover et protéger les pneus, ce produit restaure leur couleur d’origine. Sa formule spéciale exerce une action anti-âge qui restaure l’élasticité du pneu, le protégeant ainsi du durcissement et des fissures dues au rayonnement solaire. Parfait pour les pneus, il peut également être utilisé sur les joints de portières, les tapis de sol et toute autre pièce en caoutchouc. Il n’endommage pas les surfaces peintes ou en plastique. Utilisez l’AREXONS rénovateur pneus (500ML) pour garantir une protection optimale pour vos pneus .', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ML', 28.0, 10, '31021-AREXONS rénovateur pneus (500ML)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 31022-AREXONS Nettoyant jantes (500ML) - AREXONS nettoyant jantes (500ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'arexons';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '31022-AREXONS Nettoyant jantes (500ML)', 'AREXONS nettoyant jantes (500ML)', 'arexons-nettoyant-jantes-500ml', 'Description

Ce gel innovant crée une mousse active qui confère au détergent une meilleure adhérence sur les surfaces verticales, améliorant ainsi l’efficacité du nettoyage. Il élimine sans effort les résidus de plaquettes de frein et la saleté incrustée sur les jantes. Prêt à l’emploi, il nettoie tous types de jantes, en alliage, en acier et en plastique. Il est particulièrement recommandé pour les jantes chromées, laissant les surfaces brillantes. Sans acide, il est compatible avec le caoutchouc, la peinture et le plastique. Utilisez l’AREXONS nettoyant jantes pour garantir une protection optimale pour vos jantes .', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ML', 28.0, 10, '31022-AREXONS Nettoyant jantes (500ML)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 31001-AREXONS nettoyant cuir (500ML) - AREXONS nettoyant cuir (500ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'arexons';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '31001-AREXONS nettoyant cuir (500ML)', 'AREXONS nettoyant cuir (500ML)', 'arexons-nettoyant-cuir-500ml', 'Description

Spécialement conçu pour nettoyer, polir et protéger les sièges de voiture et les selleries en cuir. L’association de détergents et d’émollients à base de glycérine et de cire naturelle nourrit, soigne et préserve durablement la douceur, les couleurs et l’aspect d’origine du cuir, tout en prévenant les craquelures. Agréablement parfumé, il laisse une agréable sensation de propreté. Sans solvants ni silicone. Utilisez l’AREXONS nettoyant cuir pour garantir une protection optimale pour votre cuir.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ML', 40.0, 10, '31001-AREXONS nettoyant cuir (500ML)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 31013-AREXONS shampooing et cire (1L) - AREXONS shampooing et cire (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'arexons';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '31013-AREXONS shampooing et cire (1L)', 'AREXONS shampooing et cire (1L)', 'touring-studio-car-arexons-shampooing-et-cire-1l', 'Description

Shampoing-cire auto-séchant pour le nettoyage de la carrosserie, qui laisse un film protecteur contre la poussière et la pluie. Grâce à son effet auto-séchant, les gouttes d’eau glissent facilement sur la carrosserie. Idéal pour tous types de peinture et pour le nettoyage des pièces en caoutchouc et en plastique. Utilisez l’AREXONS shampooing et cire (1L) pour garantir une protection optimale pour votre carrosserie.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 27.0, 10, '31013-AREXONS shampooing et cire (1L)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 31012-AREXONS Super shampooing (1L) - AREXONS Super shampooing (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'arexons';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '31012-AREXONS Super shampooing (1L)', 'AREXONS Super shampooing (1L)', 'arexons-super-shampooing-1l-touring-studio-car', 'Description

Super Shampoo nettoie la carrosserie en profondeur, élimine efficacement tous les types de saletés et laisse les surfaces traitées éclatantes de propreté et de brillance. Sa formule synergique spéciale à base neutre le rend adapté à tous les types de peinture, y compris les finitions métallisées. Utilisez l’AREXONS Super shampooing (1L) pour garantir une protection optimale pour votre carrosserie.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 20.0, 10, '31012-AREXONS Super shampooing (1L)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 31003-AREXONS Protecteur cockpit mat 400ml - AREXONS Protecteur cockpit mat (400ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '31003-AREXONS Protecteur cockpit mat 400ml', 'AREXONS Protecteur cockpit mat (400ML)', 'arexons-protecteur-cockpit-mat-400ml', 'Description

Nettoie, restaure et protège les tableaux de bord et toutes les surfaces en plastique, cuir, similicuir, caoutchouc et bois de votre voiture. Ce spray spécial, sans gaz, neutre et sans solvant, forme un film protecteur antistatique qui repousse la poussière, prévient la formation de traces de doigts et repousse l’eau et la saleté. Ce film protecteur laisse sur la surface traitée un fini délicat et soyeux, et un parfum qui rend l’intérieur frais et agréable. Utilisez l’AREXONS Protecteur cockpit mat (400ML) pour garantir une protection optimale.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ML', 26.0, 10, '31003-AREXONS Protecteur cockpit mat 400ml-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00057 - MANNOL Diesel Extra 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00057', 'MANNOL Diesel Extra 10W-40', 'mannol-diesel-extra-10w-40', 'Description

Huile moteur universelle innovante à base d’ester à base hydrosynthétique pour moteurs diesel, nouvelles et « anciennes » marques et à kilométrage élevé. Spécialement conçu pour les moteurs turbocompressés.
Propriétés du produit :
– La technologie Ester et une base hydrosynthétique avec une gamme étendue de propriétés visqueuses-températures assurent un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode ville, en mode autoroute, ainsi que sous charge accrue (lors de la conduite sur routes impraticables, en montée, en déplacement avec remorque, charge maximale) et à températures ambiantes élevées :
– Idéal pour la conduite active et ne perd pas ses propriétés lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) grâce à la grande réserve d’indice alcalin (TBN);
– La base hydrosynthétique contenant des esters combinée à un ensemble d’additifs modernes préserve les paramètre', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 23.0, 5, 'TSC-00057-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 23.0, 5, 'TSC-00057-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: Castrol GTX 10W-40 5L A3/B4 - Castrol GTX 10W-40 5L A3/B4
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'castrol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Castrol GTX 10W-40 5L A3/B4', 'Castrol GTX 10W-40 5L A3/B4', 'castrol-gtx-10w-40-5l-a3-b4', 'Description

ACEA A3/B4
API SP
Meets Fiat 9.55535-D2 / 9.55535-G2
MB-Approval 226.5/ 229.3
Renault RN 0700 / RN 0', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 85.0, 10, 'Castrol GTX 10W-40 5L A3/B4-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SP', 'ACEA A3/B4', NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Renault RN 0700; Fiat 9.55535-D2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: CASTROL EDGE C3 5W-30 5L - CASTROL EDGE C3 5W-30 5L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'castrol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'CASTROL EDGE C3 5W-30 5L', 'CASTROL EDGE C3 5W-30 5L', 'castrol-edge-c3-5w-30-5l', 'Description


ACEA C3
API SN/CF
MB-Approval 229.31/ 229.51
OPEL OV 040 1547 – D30
Renault RN 0700 / RN 0710
 VW 505 00/ 505 01', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 180.0, 10, 'CASTROL EDGE C3 5W-30 5L-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SN/CF', 'ACEA C3', NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'VW 505 00; Renault RN 0700')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21150 Liqui Moly Ready Mix RAF 11 (5L) - Liqui Moly Ready Mix RAF 11 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21150 Liqui Moly Ready Mix RAF 11 (5L)', 'Liqui Moly Ready Mix RAF 11 (5L)', 'liqui-moly-ready-mix-raf-11-5l-liqui-moly-ready-mix-raf-11-5l', 'Description

Appli­ca­tion
Nettoyer le système de refroidissement avec le nettoyant radiateur de LIQUI MOLY (réf. 3320). Ensuite, purger et rincer abondamment à l’eau. Remplir avec l’antigel radiateur KFS 11 et de l’eau, conformément au tableau des mélanges et aux consignes du fabricant. Pour ce faire, nous recommandons l’utilisation d’eau distillée. Selon la dureté de l’eau et la qualité, une dilution avec de l’eau du robinet est possible. Élimination conforme aux règlements locaux. Intervalle de vidange selon les prescriptions du fabricant. Stocker uniquement à l’état non dilué. Se mélange avec des liquides de refroidissement à base d’éthylène glycol.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 48.0, 10, '21150 Liqui Moly Ready Mix RAF 11 (5L)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8810 Liqui Moly Ready Mix RAF 12+ (5L) - Liqui Moly Ready Mix RAF 12+ (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8810 Liqui Moly Ready Mix RAF 12+ (5L)', 'Liqui Moly Ready Mix RAF 12+ (5L)', 'liqui-moly-ready-mix-raf-12-5l-touring-studio-car-liqui-moly-ready-mix-raf-12-5l', 'Description

Appli­ca­tion
Nettoyer le système de refroidissement avec le nettoyant radiateur de LIQUI MOLY (réf. 3320). Ensuite, purger, rincer abondamment à l’eau et remplir de Coolant Ready Mix RAF 12+ prêt à l’emploi. Élimination conforme aux règlements locaux. Intervalle de vidange selon les prescriptions du fabricant. Coolant Ready Mix RAF 12+ peut être mélangé avec des produits antigel pour radiateurs exempts de silicate de qualité désignation VW G12+ norme VW TL 774-D/F (antigel radiateur KFS 12+ de LIQUI MOLY) ou avec des produits antigel silicatés pour radiateurs d’origine conformes à la norme VW TL 774-C (antigel radiateur KFS 11 et Coolant Ready Mix RAF 11 de LIQUI MOLY).', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 48.0, 10, '8810 Liqui Moly Ready Mix RAF 12+ (5L)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 31017 - AREXONS Nettoyant moteur (400ML) - AREXONS Nettoyant moteur (400ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'arexons';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '31017 - AREXONS Nettoyant moteur (400ML)', 'AREXONS Nettoyant moteur (400ML)', 'arexons-nettoyant-moteur-400ml', 'Description

Sa formule spéciale, inspirée des pratiques professionnelles des stations de lavage et des ateliers de réparation, est extrêmement efficace pour éliminer l’huile, la graisse, les taches et la saleté générale de tout type de moteur. Il n’attaque pas la peinture, le caoutchouc ou le plastique au contact et convient également aux motos et aux scooters. Son utilisation est extrêmement simple et ses résultats sont rapides.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ML', 23.0, 10, '31017 - AREXONS Nettoyant moteur (400ML)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: BOSCH F 026 407 006 Filtre à huile - BOSCH F 026 407 006 Filtre à huile
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BOSCH F 026 407 006 Filtre à huile', 'BOSCH F 026 407 006 Filtre à huile', 'bosch-f-026-407-006-filtre-a-huile-2', 'Description

Équivalent à ces références constructeurs :

ALFA ROMEO : 159 
CHEVROLET : AVEO / CRUZE 
OPEL : ASTRA G / ASTRA H / ASTRA J /CORSA C / CORSA D /CORSA E

Équivalent à ces références équipementiers :

BLUE PRINT : ADG02147
BOSCH : F026408893
EUROREPAR : E149247
FILTRON : OE6486
MAHLE FILTER : OX401D
MANN-FILTER : HU6122X
MECAFILTER : ELH4368
PURFLUX : L387
UFI : 2506400
VALEO : 586531
WIX FILTERS : WL7422', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 25.0, 10, 'BOSCH F 026 407 006 Filtre à huile-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: NOUR SMART L2 EFB 62AH 560A START & STOP - NOUR SMART L2 EFB 62AH 560A START & STOP
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'NOUR SMART L2 EFB 62AH 560A START & STOP', 'NOUR SMART L2 EFB 62AH 560A START & STOP', 'nour-smart-l2-efb-62ah-560a-start-stop', 'Description

Batterie à grande capacité


Couvercle étanche sans entretien avec système de labyrinthe intégré (SMF).


Grille perforée, technologie “full frame” pour des performances améliorées


+30% de puissance de démarrage par rapport à la gamme conventionnelle.


Elle est idéale pour les voitures à équipement électrique élevé.


MAGIC EYE – Indicateur du niveau de charge.


Elle est conçue spécialement pour endurer des conditions climatiques extrêmes.


Sécurité renforcée, résistante aux fuites et aux déversements.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '62AH', 420.0, 10, 'NOUR SMART L2 EFB 62AH 560A START & STOP-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA B20 L1G 45 Ah 400A - VARTA Black Dynamic B20 L1G 45 Ah 400A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA B20 L1G 45 Ah 400A', 'VARTA Black Dynamic B20 L1G 45 Ah 400A', 'varta-black-dynamic-b20-l1g-45-ah-400a', 'Description


Hauteur : 190
Largeur : 175
Longueur : 207
Capacité en (Ah) : 45
Puissance de démarrage en (A) : 400
Voltage (V) : 12
Type : L1G', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '45 Ah', 250.0, 10, 'VARTA B20 L1G 45 Ah 400A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: NOUR SMART L5 100AH 850A - NOUR SMART L5 100AH 850A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'NOUR SMART L5 100AH 850A', 'NOUR SMART L5 100AH 850A', 'nour-smart-l5-100ah-850a', 'Description

Batterie à grande capacité


Couvercle étanche sans entretien avec système de labyrinthe intégré (SMF).


Grille perforée, technologie “full frame” pour des performances améliorées


+30% de puissance de démarrage par rapport à la gamme conventionnelle.


Elle est idéale pour les voitures à équipement électrique élevé.


MAGIC EYE – Indicateur du niveau de charge.


Elle est conçue spécialement pour endurer des conditions climatiques extrêmes.


Sécurité renforcée, résistante aux fuites et aux déversements.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '100AH', 400.0, 10, 'NOUR SMART L5 100AH 850A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: NOUR SMART L1 52AH 500A - NOUR SMART L1 52AH 500A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'NOUR SMART L1 52AH 500A', 'NOUR SMART L1 52AH 500A', 'nour-smart-l1-52ah-500a', 'Description

Batterie à grande capacité


Couvercle étanche sans entretien avec système de labyrinthe intégré (SMF).


Grille perforée, technologie “full frame” pour des performances améliorées


+30% de puissance de démarrage par rapport à la gamme conventionnelle.


Elle est idéale pour les voitures à équipement électrique élevé.


MAGIC EYE – Indicateur du niveau de charge.


Elle est conçue spécialement pour endurer des conditions climatiques extrêmes.


Sécurité renforcée, résistante aux fuites et aux déversements.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '52AH', 205.0, 10, 'NOUR SMART L1 52AH 500A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: BATTERIE ASSAD 800A, 95AH, L5D - BATTERIE ASSAD 800A, 95AH, L5D
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BATTERIE ASSAD 800A, 95AH, L5D', 'BATTERIE ASSAD 800A, 95AH, L5D', 'batterie-assad-800a-95ah-l5d', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 95

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 800', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '95AH', 435.0, 10, 'BATTERIE ASSAD 800A, 95AH, L5D-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: XTeer G500 SL10W40 (HYUNDAI) - 4L - Huile Moteur XTeer G500 SL10W40 (HYUNDAI) – 4L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'hyundai-xteer';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'XTeer G500 SL10W40 (HYUNDAI) - 4L', 'Huile Moteur XTeer G500 SL10W40 (HYUNDAI) – 4L', 'huile-moteur-xteer-g500-sl10w40-hyundai-4l', 'Description

XTeer G500 SL 10W40 est une huile moteur haute performance conçue pour prolonger la durée de vie et maintenir la propreté des moteurs à essence Hyundai. Sa formule avancée, conforme à la norme SL, offre une excellente protection contre les dépôts et l’usure, même dans les situations de forte circulation ou de longs arrêts. Ce bidon de 4L est idéal pour les conducteurs Hyundai qui recherchent une huile fiable pour une conduite quotidienne, assurant un fonctionnement fluide du moteur et une réduction des frottements.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 100.0, 10, 'XTeer G500 SL10W40 (HYUNDAI) - 4L-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: XTeer G500 5W30 (HYUNDAI) - 4L - Huile Moteur XTeer G500 5W30 (HYUNDAI) – 4L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'hyundai-xteer';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'XTeer G500 5W30 (HYUNDAI) - 4L', 'Huile Moteur XTeer G500 5W30 (HYUNDAI) – 4L', 'huile-moteur-xteer-g500-5w30-hyundai-4l', 'Description

Conçue pour les moteurs à essence Hyundai, XTeer G500 5W30 est une huile moteur fiable qui offre une protection solide contre l’usure et les dépôts. Sa formulation équilibrée permet un fonctionnement fluide, même à des températures extrêmes, et améliore l’efficacité énergétique. Ce bidon de 4L est idéal pour les modèles Hyundai, assurant des performances propres et efficaces du moteur avec un faible impact environnemental.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 155.0, 10, 'XTeer G500 5W30 (HYUNDAI) - 4L-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: Borsehung Bouton, lève-vitre (B11415) - Borsehung Bouton, lève-vitre (B11415)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'produits-divers';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Borsehung Bouton, lève-vitre (B11415)', 'Borsehung Bouton, lève-vitre (B11415)', 'borsehung-interrupteur-leve-vitre-b11415', 'Description

Équivalent à VW 
AMAROK (2HA, 2HB, S1B, S6B, S7A, S7B, AGD)
CADDY III Camionnette/Monospace (2KA, 2KH, 2CA, 2CH)/CADDY III  (2KB, 2KJ, 2CB, 2CJ)
CADDY IV Camionnette/Monospace (SAA, SAH)
EOS (1F7, 1F8)
GOLF PLUS V (5M1, 521)
GOLF V Variant (1K5) | VENTO | JETTA | BORA / JETTA
GOLF VI (5K1)
JETTA III (1K2) | BORA | VENTO
MULTIVAN T6
PASSAT B6 (3C2) /PASSAT B7 /PASSAT CC B6
POLO V (6R1, 6C1)
SCIROCCO III (137, 138)
TIGUAN (5N)
TOUAREG (7LA, 7L6, 7L7)/TOUAREG (7P5, 7P6)
TOURAN (1T1, 1T2, 1T3)
TRANSPORTER T6
Équivalent à SEAT 
ALTEA (5P1)/ALTEA XL (5P5, 5P8)
IBIZA IV (6J5, 6P1)/IBIZA IV SC (6J1, 6P5)
LEON (1P1)', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 30.0, 10, 'Borsehung Bouton, lève-vitre (B11415)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: DOLZ KD 004 kit chaine 1.5 DCI - DOLZ KD004 (Kit de distribution + pompe à eau)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'produits-divers';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'DOLZ KD 004 kit chaine 1.5 DCI', 'DOLZ KD004 (Kit de distribution + pompe à eau)', 'dolz-kd004-kit-de-distribution-pompe-a-eau', 'Description

Description & Avantages Clés :
Le kit DOLZ KD004 comprend une pompe à eau et une courroie de distribution originales et de qualité. Solide et durable, ce kit d’entretien automobile est fabriqué par DOLZ, un équipementier fiable. Il est parfait pour les conducteurs souhaitant économiser tout en garantissant la qualité et la performance de leur véhicule.

Pompe à eau en métal pour une robustesse assurée
Courroie de distribution à 123 dents pour une performance optimale
Fiabilité de l’équipementier DOLZ
Economies sur l’entretien du véhicule

Spécifications techniques

Pompe à eau : Fabriquée en métal robuste et durable, la pompe à eau présente dans ce kit a un poids de 0,69 kg et un diamètre de la roue à aubes de 74 mm. Ces caractéristiques assurent une durabilité et une performance optimale
Courroie de distribution : La courroie de distribution incluse dans le kit a 123 dents et une largeur de 27 mm. Ces spécifications techniques permettent une performance optimale et une co', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 320.0, 10, 'DOLZ KD 004 kit chaine 1.5 DCI-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA D47 D23 60 Ah 540A - VARTA – Blue Dynamic D47 D23 60 Ah 540A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA D47 D23 60 Ah 540A', 'VARTA – Blue Dynamic D47 D23 60 Ah 540A', 'varta-blue-dynamic-d47-d23-60-ah-540a', 'Description


Hauteur : 225
Largeur : 173
Longueur : 232
Capacité en (Ah) : 60
Puissance de démarrage en (A) : 540
Voltage (V) : 12
Type :D23', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '60 Ah', 370.0, 10, 'VARTA D47 D23 60 Ah 540A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1 987 432 057 - Filtre Habitacle BOSCH (1 987 432 057)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-habitacle';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1 987 432 057', 'Filtre Habitacle BOSCH (1 987 432 057)', 'filtre-habitacle-bosch-1-987-432-057', 'Description

Équivalent à ces références équipementiers :
BOSCH Filtre habitacle (1 987 432 057)



BLUE PRINT : ADV182503
BOSCH : 1987432057, 0986628504, 1987431057, 1987432357, 0986TF0113, 0986628604
FEBI BILSTEIN : 19590
FILTRON : K1079A, K1079
HENGST FILTER : E961LI
KOLBENSCHMIDT : 50013702, 702AC
MAHLE FILTER : LA120
MANN-FILTER : PF054, CU2545
MECAFILTER : ELR7076
MISFAT : HB151
PURFLUX : AH191
UFI : 5303100
VALEO : 708685, 698852, 698685
WIX FILTERS : WP9036', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 35.0, 10, '1 987 432 057-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: CU 26 009 - MANN FILTER CU 26 009 Filtre habitacle VW
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-habitacle';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'filtre-habiltacle';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'CU 26 009', 'MANN FILTER CU 26 009 Filtre habitacle VW', 'mann-filter-cu-26-009-filtre-habitacle-vw', 'Description

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182526
BOSCH : 1987435021, 1987432540
EUROREPAR : 1640542280
FEBI BILSTEIN : 48465
FILTRON : K1311
MAHLE : LA2046, LA1184
MANN-FILTER : CUK26009, FP26009
MISFAT : HB252
PURFLUX : AH392, AHA392
SCT – MANNOL : SA1304
UFI : 5329800
VALEO : T1019913H, 715806
WIX FILTERS : WP2088', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 45.0, 10, 'CU 26 009-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANN FILTER CU 2939 - MANN-FILTER Filtre Habitacle CU 2939
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-habitacle';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN FILTER CU 2939', 'MANN-FILTER Filtre Habitacle CU 2939', 'mann-filter-filtre-habitacle-cu-2939', 'Description

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182504, ADV182533
BOSCH : M2097, 1987431097, 0986AF5431, 1987432097
EUROREPAR : 1640541480, 1686253080, 1610581580
FEBI BILSTEIN : 21312, 105790
FILTRON : K1111
HENGST FILTER : E998LI
KOLBENSCHMIDT : 50013749, 749AC
MAHLE : LA621, LA1064, LA181
MAHLE FILTER : LA181
MANN-FILTER : FP2939, CUK2939
MISFAT : HB166
PURFLUX : AH202, AH378
SCT – MANNOL : SA1166, SAB166
SWAG : 30921312, 30105790
UFI : 5314800
VAICO : V103010031
VALEO : 698800, 983051G, 708800, 815281, 815282, 715800
WIX FILTERS : WP9146', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 32.0, 10, 'MANN FILTER CU 2939-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA D48 60 Ah 540A D23G - VARTA – Blue Dynamic D48 60 Ah 540A D23G
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA D48 60 Ah 540A D23G', 'VARTA – Blue Dynamic D48 60 Ah 540A D23G', 'varta-blue-dynamic-d48-60-ah-540a-d23g', 'Description


Hauteur : 225
Largeur : 173
Longueur : 232
Capacité en (Ah) : 60
Puissance de démarrage en (A) : 540
Voltage (V) : 12
Type :D23 G', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '60 Ah', 370.0, 10, 'VARTA D48 60 Ah 540A D23G-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: NT1061CW-02B - NEOLUX LED Intérieur  (6000 K) 26.8 mm W2.1×9.5d
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'neolux';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'NT1061CW-02B', 'NEOLUX LED Intérieur  (6000 K) 26.8 mm W2.1×9.5d', 'neolux-led-interieur-6000-k-26-8-mm-w2-1x9-5d', 'Description

Caractéristiques produit

Couleur blanc froid actuelle, avec une température de couleur de 6 000 K
Haute luminosité
Répartition homogène de la lumière
Adaptation parfaite grâce aux dimensions réduites
Grande durée de vie

Avantages produits

Changez pour la dernière technologie LED
Style actuel
Meilleure visibilité
Éclairage homogène grâce à un diffuseur moderne
Intervalles de remplacement plus longs

Domaines d’application

Éclairage intérieur

Informations légales

Ces produits n’ont pas reçu d’homologation ECE. Cela signifie qu’ils ne peuvent pas être utilisés sur la voie publique pour les applications externes. L’utilisation sur les routes publiques peut aboutir à l’annulation du certificat d’immatriculation et à la perte de la couverture d’assurance. Plusie

Information produit



Application (Catégorie et produit spécifique)
Application principale pour clignotants




Type de produit(hors route vs sur route)
Off-road



Données électriques



Puissance
0,78 W




Ten', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '26.8 mm', 25.0, 10, 'NT1061CW-02B-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P2985DCC - PRO TEC Nettoyant DPF/Catalyseur (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P2985DCC', 'PRO TEC Nettoyant DPF/Catalyseur (400ml)', 'pro-tec-nettoyant-dpf-catalyseur-400ml', 'Description


Démontez le capteur de température, de pression ou le port d’accès du DPF/catalyseur et insérez la sonde à travers l’ouverture. Pulvérisez le nettoyant avec la sonde insérée dans le filtre à particules/catalyseur à intervalles de 5 secondes jusqu’à ce que le DPF/catalyseur soit correctement rempli de mousse. Fermez l’ouverture après application. Une fois le nettoyant appliqué, les dépôts sont libérés et dispersés dans le filtre à particules/catalyseur. Pendant le fonctionnement normal de l’entraînement, les particules de saleté microfines brûlent. Redémarrez le processus de régénération via un testeur d’atelier. Enfin, supprimez l’entrée de mémoire défectueuse ou supprimez les erreurs existantes. Effectuez ensuite un essai routier d’une durée d’environ 20 minutes.
DPF/Catalyst Cleaner est utilisable pour tous les systèmes de filtre à particules fermés. Vérifiez le niveau d’huile avant le nettoyage. Une vidange d’huile est nécessaire si la dilution de l’huile est effectuée', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 55.0, 10, 'P2985DCC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2388 - Liqui Moly  Nettoyant pour système d’ad­mis­sion d
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2388', 'Liqui Moly  Nettoyant pour système d’ad­mis­sion diesel Pro-Line (400ml)', 'liqui-moly-nettoyant-pour-systeme-dadmission-diesel-pro-line-400ml', 'Description

Appli­ca­tion
Ménager un accès au système d’admission. Celui-ci doit se situer aussi près que possible du moteur et en aval du débitmètre massique. Démarrer le moteur pour commencer le nettoyage.
Si le moteur ne maintient pas le régime quand la tubulure d’admission est retirée ou s’il ne démarre pas, débrancher le connecteur du débitmètre massique lorsque le contact est coupé. Dans ce cas, le défaut détecté doit être supprimé du calculateur moteur après le nettoyage, au moyen d’un appareil de diagnostic approprié, et le débitmètre d’air massique doit être reprogrammé le cas échéant.
Pulvériser le nettoyant pour système d’admission diesel à intervalles brefs de 2 à 3 secondes dans le système d’admission à un régime d’au moins 2 000 tours. Ce faisant, bouger la sonde d’avant en arrière afin de nettoyer l’intégralité du système d’admission.
Si, lors de l’application, une augmentation du régime supérieure à 1 000 tours est constatée, il est important d’interrompre immédiatemen', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 75.0, 10, '2388-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2510 - Additif lubri­fiant pour huile de boîte (MOS 2) ( 
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2510', 'Additif lubri­fiant pour huile de boîte (MOS 2) ( 50g )', 'additif-lubrifiant-pour-huile-de-boite-mos-2-50g', 'Description

Contient du MoS2 (disulfure de molybdène) fortement concentré pour réduire l’usure de boîtes de vitesses mécaniques et de différentiels manuels, de transmissions sans blocage de différentiel intégré à bain d’huile, ainsi que de systèmes de direction mécaniques. Le MoS2 réduit les pics de température, rend la marche plus silencieuse et facilite le passage des rapports. La boîte de vitesses s’échauffe moins, regagne en puissance et retrouve sa souplesse de marche grâce au profil plus lisse des dents.
Appli­ca­tion
Ajouter le produit à l’huile de boîte de vitesses. Le mélange s’effectue automatiquement pendant le service. Convient aussi bien aux huiles de boîte de vitesses minérales que synthétiques. Une quantité de 20 g traite jusqu’à 1 l d’huile de boîte de vitesses, une quantité de 50 g jusqu’à 2,5 l d’huile de boîte de vitesses.



résistant aux sollicitations et aux vibrations
augmente la sécurité du fonctionnement
excellentes propriétés de fonctionnement en cas d’urgenc', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '50g', 40.0, 10, '2510-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9694 - MANNOL Nettoyant mousse DPF 9694
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9694', 'MANNOL Nettoyant mousse DPF 9694', 'mannol-nettoyant-mousse-dpf-9694', 'Description

DPF Foam Cleaner est un outil professionnel permettant de nettoyer et de restaurer
l’efficacité des filtres à particules diesel (DPF) sans les démonter. Convient à tous les moteurs diesel, atmosphériques et turbocompressés, équipés de ces filtres. Applicable aux moteurs diesel équipés et non équipés de systèmes de régénération automatique des filtres à particules diesel. Convient à tous les âges.
Propriétés :
– Démarre le processus de régénération du filtre à particules. Favorise la combustion complète de la suie accumulée, en la relâchant et en agissant comme catalyseur de combustion ;
– Particulièrement efficace pour les véhicules fonctionnant en mode urbain et pendant la saison froide ;
– Restaure la pleine capacité du filtre à particules ;
– Restaure la puissance d’origine du moteur en réduisant la résistance hydrodynamique du filtre. Économise du carburant ;
– Formule neutre à faible teneur en cendres. Il s’évapore sans laisser de trace et est retiré du filtre.
– Prol', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 30.0, 10, '9694-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA E11 L3 74 Ah 680A - VARTA -Blue Dynamic E11 L3 74 Ah 680A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA E11 L3 74 Ah 680A', 'VARTA -Blue Dynamic E11 L3 74 Ah 680A', 'varta-blue-dynamic-e11-l3-74-ah-680a', 'Description


Hauteur : 190
Largeur : 175
Longueur : 278
Capacité en (Ah) : 74
Puissance de démarrage en (A) : 680
Voltage (V) : 12
Type : L3', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '74 Ah', 450.0, 10, 'VARTA E11 L3 74 Ah 680A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA D43 L2G 60 Ah 540A - VARTA – Blue Dynamic D43 L2G 60 Ah 540A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA D43 L2G 60 Ah 540A', 'VARTA – Blue Dynamic D43 L2G 60 Ah 540A', 'varta-blue-dynamic-d43-l2g-60-ah-540a', 'Description


Hauteur : 190
Largeur : 175
Longueur : 242
Capacité en (Ah) : 60
Puissance de démarrage en (A) : 540
Voltage (V) : 12
Type :L2 G', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '60 Ah', 370.0, 10, 'VARTA D43 L2G 60 Ah 540A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA D59 L2 60 Ah 540A - VARTA – Blue Dynamic D59 L2 60 Ah 540A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA D59 L2 60 Ah 540A', 'VARTA – Blue Dynamic D59 L2 60 Ah 540A', 'varta-blue-dynamic-d59-l2-60-ah-540a', 'Description


Hauteur : 175
Largeur : 175
Longueur : 242
Capacité en (Ah) : 60
Puissance de démarrage en (A) : 540
Voltage (V) : 12
Type : L2', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '60 Ah', 370.0, 10, 'VARTA D59 L2 60 Ah 540A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA B34 B24RS 45 Ah 330A - VARTA – Blue Dynamic B34 B24RS 45 Ah 330A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA B34 B24RS 45 Ah 330A', 'VARTA – Blue Dynamic B34 B24RS 45 Ah 330A', 'varta-blue-dynamic-b34-b24rs-45-ah-330a', 'Description


Hauteur : 227
Largeur : 129
Longueur : 138
Capacité en (Ah) : 45
Puissance de démarrage en (A) : 330
Voltage (V) : 12
Type :B24RS', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '45 Ah', 275.0, 10, 'VARTA B34 B24RS 45 Ah 330A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA B32 B24RS 45 Ah 330A - VARTA – Blue Dynamic B32 B24RS 45 Ah 330A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA B32 B24RS 45 Ah 330A', 'VARTA – Blue Dynamic B32 B24RS 45 Ah 330A', 'varta-blue-dynamic-b32-b24rs-45-ah-330a', 'Description


Hauteur : 227
Largeur : 129
Longueur : 138
Capacité en (Ah) : 45
Puissance de démarrage en (A) : 330
Voltage (V) : 12
Type :B24RS', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '45 Ah', 275.0, 10, 'VARTA B32 B24RS 45 Ah 330A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA B18 L1B 44 Ah 440A - VARTA -Blue Dynamic B18 L1B 44 Ah 440A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA B18 L1B 44 Ah 440A', 'VARTA -Blue Dynamic B18 L1B 44 Ah 440A', 'varta-blue-dynamic-b18-l1b-44-ah-440a', 'Description


Hauteur : 175
Largeur : 175
Longueur : 207
Capacité en (Ah) : 44
Puissance de démarrage en (A) : 440
Voltage (V) : 12
Type : L1', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '44 Ah', 265.0, 10, 'VARTA B18 L1B 44 Ah 440A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA F6 90 Ah 720A - VARTA – Black Dynamic F6 L5 90 Ah 720A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA F6 90 Ah 720A', 'VARTA – Black Dynamic F6 L5 90 Ah 720A', 'varta-black-dynamic-f6-l5-90-ah-720a', 'Description


Hauteur : 190
Largeur : 175
Longueur : 353
Capacité en (Ah) : 90
Puissance de démarrage en (A) : 720
Tension (V) : 12
Type : L5', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '90 Ah', 500.0, 10, 'VARTA F6 90 Ah 720A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA E9 70 Ah 640A - VARTA Black Dynamic E9 L3 70 Ah 640A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA E9 70 Ah 640A', 'VARTA Black Dynamic E9 L3 70 Ah 640A', 'varta-black-dynamic-e9-l3-70-ah-640a', 'Description


Hauteur : 175
Largeur : 175
Longueur : 278
Capacité en (Ah) : 70
Puissance de démarrage en (A) : 640
Voltage (V) : 12
Type : L3', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '70 Ah', 400.0, 10, 'VARTA E9 70 Ah 640A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: BOSCH - F 026 407 006 - BOSCH – F 026 407 006 Filtre à huile
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BOSCH - F 026 407 006', 'BOSCH – F 026 407 006 Filtre à huile', 'bosch-f-026-407-006-filtre-a-huile', 'Description


BOSCH : P 7006

Équivalent à ces références constructeurs :

ALFA ROMEO : 71744410 ,55594651
BUICK : 93185674
CHEVROLET : 55594652,55595651 ,93185674,  J93745801, 55594651, 55560748
DAEWOO : 93185674
FIAT : 733504179 , 55594651, 71744410, 95526685
GMC : 55576499, 95526685, 93185674, 55353324, 55594651, 93190129, 650172, 55560748, 650173, 55584685
OPEL :55594651, 55594652, 5650359 , 650155 ,650173 , 55353324 , 650172 ,93185674
SAAB : 55594651, 93185674
VAUXHALL : 

Équivalent à ces références équipementiers :

A.L. FILTER : ALO817110, ALO81713
ACDelco : 55594651
AMC Filter : DO708
BLUE PRINT : ADG02147
BOSCH : F026408893
CHAMPION : COF100559E
CLEAN FILTERS : ML4502
COMLINE : EOF201
CoopersFiaam : FA5784ECO
EUROREPAR : E149247
FILTRON : OE6486
FRAM : CH10246ECO
GUD FILTERS : M71
HENGST FILTER : E611HD442, E611HD122
HERTH+BUSS ELPARTS : J1310904
KNECHT : OX978D, OX401D
MAHLE FILTER : OX401D
MANN-FILTER : HU6122X
MECAFILTER : ELH4368
METAL LEVE : OX401D, OX978D
PBR : AC8091
P', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 27.0, 10, 'BOSCH - F 026 407 006-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: BOSCH - F 026 407 157 - BOSCH – F 026 407 157 Filtre à huile (VW)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BOSCH - F 026 407 157', 'BOSCH – F 026 407 157 Filtre à huile (VW)', 'bosch-f-026-407-157-filtre-a-huile', 'Description

Autres références du produit :

BOSCH : P 7157

Équivalent à ces références constructeurs :

AUDI :03N115562B , 03N115562
MAN :65055046002 , 65055046000 
SEAT :03N115562B ,03N115562
SKODA :03N115562B ,03N115562
VW :03N115566 ,03N115562B ,03N115562

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182125
FILTRON : OE6883
KNECHT : OX787D
MAHLE FILTER : OX787D
MANN-FILTER : HU7020Z
MECAFILTER : ELH4438
MISFAT : L137
PURFLUX : L991
WIX FILTERS : WL7514', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 35.0, 10, 'BOSCH - F 026 407 157-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: BOSCH - F 026 407 181 1.2TSI - BOSCH – F 026 407 181 Filtre à huile
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BOSCH - F 026 407 181 1.2TSI', 'BOSCH – F 026 407 181 Filtre à huile', 'bosch-f-026-407-181-filtre-a-huile', 'Description

Équivalent à ces références constructeurs :

SEAT :03C115561H , 03C115561D
SKODA :03C115561D , 03C115561H 
VAG : 03C115561D , 03C115561H
VW : 03C115561D , 03C115561H

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182122
BOSCH : F026407183, P7116, F026407116
EUROREPAR : 1643608880
FEBI BILSTEIN : 49666
FILTRON : OP6412
HENGST FILTER : H314W, H314W01
HERTH+BUSS JAKOPARTS : J1310826
MAHLE : OC1778, OC5933
MAHLE FILTER : OC5934
MISFAT : Z140
PURFLUX : LS391A
UFI : 2357300
VAICO : V102102
WIX FILTERS : WL7494', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 38.0, 10, 'BOSCH - F 026 407 181 1.2TSI-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANN-FILTER - HU 7008z - MANN-FILTER – HU 7008 z Filtre à huile
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN-FILTER - HU 7008z', 'MANN-FILTER – HU 7008 z Filtre à huile', 'mann-filter-hu-7008-z-filtre-a-huile', 'Description

Équivalent à ces références constructeurs :
        VW :03L 115 562, 03l 115 566
Équivalent à ces références équipementiers :

ASHIKA : 10ECO098, FO038JM
BLUE PRINT : ADV182110
BOSCH : F026407023, P7023
CHAMPION : XE580606, COF100580E
EUROREPAR : 1682274680, 1611660780, 1643610580
FEBI BILSTEIN : 36634
FILTRON : OE688
HENGST FILTER : E115H01D208, E115HD208, E115H
K&N Filters : HP7047
MAGNETI MARELLI : 71760502, 153071760502
MAHLE : OX388DECO, OX388D, OX388, OX1129
MAHLE FILTER : OX388D, OX388, OX388DECO
MISFAT : L120
SCT – MANNOL : SH4049P
VAICO : V108553
VALEO : 586590
WIX FILTERS : WL7476', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 28.0, 10, 'MANN-FILTER - HU 7008z-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA C11 L2 53 Ah 500A - VARTA Black Dynamic C11 L2 53 Ah 500A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA C11 L2 53 Ah 500A', 'VARTA Black Dynamic C11 L2 53 Ah 500A', 'varta-black-dynamic-c11-l2-53-ah-500a', 'Description


Hauteur : 175
Largeur : 175
Longueur : 242
Capacité en (Ah) : 53
Puissance de démarrage en (A) : 500
Voltage (V) : 12
Type : L2', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '53 Ah', 310.0, 10, 'VARTA C11 L2 53 Ah 500A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA B19 L1 45 Ah 400A - VARTA Black Dynamic B19 L1 45 Ah 400A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA B19 L1 45 Ah 400A', 'VARTA Black Dynamic B19 L1 45 Ah 400A', 'varta-black-dynamic-b19-l1-45-ah-400a', 'Description


Hauteur : 190
Largeur : 175
Longueur : 207
Capacité en (Ah) : 45
Puissance de démarrage en (A) : 400
Voltage (V) : 12
Type : L1', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '45 Ah', 250.0, 10, 'VARTA B19 L1 45 Ah 400A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA A14 40ah 330A - VARTA Blue Dynamic A14 40ah 330A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA A14 40ah 330A', 'VARTA Blue Dynamic A14 40ah 330A', 'varta-blue-dynamic-a14-40ah-330a', 'Description


Hauteur : 227
Largeur : 127
Longueur : 187
Capacité en (Ah) : 40
Puissance de démarrage en (A) : 330
Voltage (V) : 12', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '40ah', 245.0, 10, 'VARTA A14 40ah 330A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VARTA A13 40ah 330A - VARTA Blue Dynamic A13 40ah 330A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'varta';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VARTA A13 40ah 330A', 'VARTA Blue Dynamic A13 40ah 330A', 'varta-blue-dynamic-a13-40ah-330a', 'Description

Caractéristiques :

Hauteur : 227
Largeur : 127
Longueur : 187
Capacité en (Ah) : 40
Puissance de démarrage en (A) : 330
Voltage (V) : 12', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '40ah', 245.0, 10, 'VARTA A13 40ah 330A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MF3 D/G 74AH 660A - ASSAD MF3 D/G 74AH 660A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MF3 D/G 74AH 660A', 'ASSAD MF3 D/G 74AH 660A', 'assad-mf3-d-g-74ah-660a', 'Description


Capacité de batterie [Ah] : 74
Hauteur [mm] : 190
Largeur [mm] : 175
Longueur [mm] : 276
Puissance de démarrage, PD [A] : 660', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '74AH', 360.0, 10, 'MF3 D/G 74AH 660A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MF2 D/G 62AH 560A - ASSAD MF2 D/G 62AH 560A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MF2 D/G 62AH 560A', 'ASSAD MF2 D/G 62AH 560A', 'assad-mf2-d-g-62ah-560a', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 62

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 560', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '62AH', 315.0, 10, 'MF2 D/G 62AH 560A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MF1 D/G 50AH 480A - ASSAD MF1 D/G 50AH 480A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MF1 D/G 50AH 480A', 'ASSAD MF1 D/G 50AH 480A', 'assad-mf1-d-g-50ah-480a', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 50

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 480', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '50AH', 260.0, 10, 'MF1 D/G 50AH 480A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD MF11D/G 100AH 760A - ASSAD SUPER TURBO TRUCK MF11G  100AH, 760A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD MF11D/G 100AH 760A', 'ASSAD SUPER TURBO TRUCK MF11G  100AH, 760A', 'assad-super-turbo-truck-mf11g-100ah-760a', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 100

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 760', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '100AH', 460.0, 10, 'ASSAD MF11D/G 100AH 760A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD M12P G/D 112AH 750A - ASSAD M12P G/D 112AH 750A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD M12P G/D 112AH 750A', 'ASSAD M12P G/D 112AH 750A', 'assad-m12p-g-d-112ah-750a', 'Description

 Voltage [V]: 12
Capacité de batterie [Ah]: 112

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 750', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '112AH', 470.0, 10, 'ASSAD M12P G/D 112AH 750A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD D90G 90AH 680A - BATTERIE ASSAD TURBO PRO D90G 90AH 680A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD D90G 90AH 680A', 'BATTERIE ASSAD TURBO PRO D90G 90AH 680A', 'batterie-assad-turbo-pro-d90g-90ah-680a', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 90

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 680', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '90AH', 425.0, 10, 'ASSAD D90G 90AH 680A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD M10G 65AH 510A - BATTERIE ASSAD TURBO PRO M10G 65AH 510A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD M10G 65AH 510A', 'BATTERIE ASSAD TURBO PRO M10G 65AH 510A', 'batterie-assad-turbo-pro-m10g-65ah-510a', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 65

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 510', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '65AH', 320.0, 10, 'ASSAD M10G 65AH 510A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD MF10G 72AH 620A - ASSAD SUPER TURBO TRUCK MF10G  72AH, 620A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD MF10G 72AH 620A', 'ASSAD SUPER TURBO TRUCK MF10G  72AH, 620A', 'assad-super-turbo-truck-mf10g-72ah-620a', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 72

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 620', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '72AH', 340.0, 10, 'ASSAD MF10G 72AH 620A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7055 - BIDON DE VIDANGE D’HUILE  10L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7055', 'BIDON DE VIDANGE D’HUILE  10L', 'bidon-de-vidange-dhuile-10l', 'Description


Appli­ca­tion
Avant la vidange d’huile, dévisser les deux vis papillons du bidon de vidange d’huile et le placer avec le creux sous le bouchon de vidange. Le refermer pour le transport et le stockage.
 

Les autres infor­ma­tions
Avant l’écoulement de l’huile usagée, dévisser les deux vis papillons du bidon de vidange d’huile. Sinon, la cuve risque de déborder.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '10L', 60.0, 10, '7055-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: NOUR SMART L3 75AH 700A - NOUR SMART L3 75AH 700A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'NOUR SMART L3 75AH 700A', 'NOUR SMART L3 75AH 700A', 'nour-smart-l3-75ah-700a', 'Description

Batterie à grande capacité


Couvercle étanche sans entretien avec système de labyrinthe intégré (SMF).


Grille perforée, technologie “full frame” pour des performances améliorées


+30% de puissance de démarrage par rapport à la gamme conventionnelle.


Elle est idéale pour les voitures à équipement électrique élevé.


MAGIC EYE – Indicateur du niveau de charge.


Elle est conçue spécialement pour endurer des conditions climatiques extrêmes.


Sécurité renforcée, résistante aux fuites et aux déversements.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '75AH', 300.0, 10, 'NOUR SMART L3 75AH 700A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: NOUR SMART L1 62AH 600A - NOUR SMART L2 62AH 600A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'NOUR SMART L1 62AH 600A', 'NOUR SMART L2 62AH 600A', 'nour-smart-l2-62ah-600a', 'Description

Batterie à grande capacité


Couvercle étanche sans entretien avec système de labyrinthe intégré (SMF).


Grille perforée, technologie “full frame” pour des performances améliorées


+30% de puissance de démarrage par rapport à la gamme conventionnelle.


Elle est idéale pour les voitures à équipement électrique élevé.


MAGIC EYE – Indicateur du niveau de charge.


Elle est conçue spécialement pour endurer des conditions climatiques extrêmes.


Sécurité renforcée, résistante aux fuites et aux déversements.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '62AH', 260.0, 10, 'NOUR SMART L1 62AH 600A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 20750 - Motorbike 4T 5W-40 HC Street  (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20750', 'Motorbike 4T 5W-40 HC Street  (1L)', 'motorbike-4t-5w-40-hc-street-1l', 'Description




excellente propreté du moteur
assure une moindre consommation d’huile
convient parfaitement aux embrayages à bain d’huile
grande stabilité au cisaillement
protection anti-usure élevée
compatible avec catalyseur
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, '20750-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN', NULL, 'JASO MA2', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: BORSEHUNG Filtre essence B12822 VW TSI - BORSEHUNG Filtre à carburant (essence) B12822 VW T
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BORSEHUNG Filtre essence B12822 VW TSI', 'BORSEHUNG Filtre à carburant (essence) B12822 VW TSI', 'borsehung-filtre-a-carburant-essence-b12822-vw-tsi', 'Description

Équivalent à ces références équipementiers :

BOSCH : 0450905959, F5959, 0986AF8261
DELPHI : EFP248
FEBI BILSTEIN : 221273, 26343
FILTRON : PP8362
MAHLE : KL572, KL759
MAHLE FILTER : KL572
MISFAT : E103
SWAG : 32926343
UFI : 3184000
VAICO : V100658
VALEO : 587030
WIX FILTERS : 33814, WF8386', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 70.0, 10, 'BORSEHUNG Filtre essence B12822 VW TSI-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8121, 9692, 7904, 9892 - MANNOL Pack entretien moto
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8121, 9692, 7904, 9892', 'MANNOL Pack entretien moto', 'mannol-pack-entretien-moto', 'Description

MANNOL Graisse blanche  (8121)
MANNOL Nettoyant pour chaîne  (7904)
MANNOL Nettoyant pour freins  (9692)
MANNOL Lubrifiant  M-40 9892 (400ml)', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 70.0, 10, '8121, 9692, 7904, 9892-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7904 - Mannol Nettoyant pour chaîne (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7904', 'Mannol Nettoyant pour chaîne (400ml)', 'mannol-nettoyant-pour-chaine-400ml', 'Description

Propriétés :
– Grâce à sa teneur élevée en substances actives, il nettoie et dégraisse rapidement, efficacement et en douceur les chaînes de la vieille graisse, de la saleté, de la poussière, du sable et d’autres contaminants de la route ;
– Des solvants spécialement sélectionnés dissolvent et nettoient efficacement les anciens résidus séchés et durcis de produits pétroliers sous forme de résine et de vernis ;
– Possède d’excellentes propriétés solvantes et pénètre facilement dans tous les interstices de la chaîne ;
– S’évapore rapidement et complètement sans endommager les joints d’étanchéité ;
– Il est recommandé de l’utiliser avant d’appliquer le lubrifiant pour chaînes 7901 MANNOL neuf.
Application : 
Placez un chiffon ou un carton sous les pièces à nettoyer. Agiter le ballon et pulvériser généreusement le produit plusieurs fois et laisser égoutter. Après évaporation (environ 10 minutes), la chaîne devient propre et sans graisse, préparée pour l’application du lubrifia', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 17.0, 10, '7904-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8121 - Mannol Graisse blanche (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8121', 'Mannol Graisse blanche (450ml)', 'mannol-graisse-blanche-450ml', 'Description



Propriétés du produit :
– Pénètre rapidement et en profondeur sans laisser de film collant ;
– Crée une couche protectrice dense. Assure une lubrification fiable des pièces métalliques. Les inhibiteurs de corrosion inclus dans la composition protègent de manière fiable les surfaces traitées contre l’oxydation et l’usure ;
– La couche protectrice dense résiste aux frottements, à la pression, aux vibrations ;
– Il a une viscosité élevée, alors qu’il ne contient pas de silicones et de solvants ;
– Il a de l’élasticité. Protège bien la surface du matériau flexible, l’enveloppant complètement, y compris toutes les bosses ;
– Facilité d’utilisation, rapidité, consommation économique.
La graisse est idéale pour une utilisation dans les automobiles, les installations hydrauliques, les équipements agricoles et de jardin, l’industrie, les appareils ménagers, etc. Elle est utilisée pour lubrifier et protéger les pièces du système de freinage, les bornes de batterie, les serrures et', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 23.0, 10, '8121-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9892 - MANNOL Lubrifiant M-40 (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9892', 'MANNOL Lubrifiant M-40 (400ml)', 'mannol-lubrifiant-m-40-400ml', 'Description

Propriétés :
– Excellentes propriétés nettoyantes. Nettoie et élimine facilement la graisse, la saleté, les taches de bitume, les résidus de colle, etc. de la plupart des surfaces, formant une couche protectrice ;
– Couvre la surface, empêchant l’apparition d’humidité, même dans les micro-rugosités du métal ;
– Bonnes propriétés lubrifiantes, réduisant les frottements, assurant le bon fonctionnement des articulations et autres pièces mobiles des mécanismes, sans laisser de traces grasses ni collantes ;
– Excellentes propriétés hydrofuges et déshydratantes. Repousse l’humidité et forme une barrière protectrice contre l’humidité. Protège les joints en caoutchouc, les revêtements en plastique, les bouchons et autres surfaces de contact du gel.
– Possède d’excellentes propriétés pénétrantes, pénétrant dans les joints et mécanismes bloqués, rouillés ou gelés, les libérant et facilitant le démontage des éléments rouillés.
– Excellente protection contre la corrosion et l’oxydatio', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 20.0, 10, '9892-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3072 - LIQUI MOLY Motorbike Gear Oil 75W-140 (GL5) (500ml
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3072', 'LIQUI MOLY Motorbike Gear Oil 75W-140 (GL5) (500ml)', 'liqui-moly-motorbike-gear-oil-75w-140-gl5-500ml', 'Description


excellente protection anti-usure
excellente protection anticorrosion
réduit les bruits de la boîte de vitesses
vaste plage de viscosité

Appli­ca­tion
Respecter les prescriptions des fabricants de boîtes de vitesses. Se mélange à toutes les huiles de boîte de vitesses de marque. L’efficacité optimale n’est possible que si le produit est utilisé pur.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 65.0, 10, '3072-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W140', 'API GL-5', NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: P2803 - PRO TEC Nettoyant pour corps de papillon (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P2803', 'PRO TEC Nettoyant pour corps de papillon (400ml)', 'pro-tec-nettoyant-pour-corps-de-papillon-400ml', 'Description


Système d’admission d’air


Bien agiter le bidon avant emploi. Vaporiser généreusement sur les pièces à nettoyer. Laissez le produit être vaporisé ou confectionné en utilisant les pièces avec un chiffon propre. Répéter les étapes 1 à 3 sont nécessaires.


Cela dépendait de la contamination', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 30.0, 10, 'P2803-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P1911 - PRO TEC Diesel applicator spray (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P1911', 'PRO TEC Diesel applicator spray (400ml)', 'pro-tec-diesel-applicator-spray-400ml', 'Description




Production de composants pour moteurs diesel. Recommandé pour l’équipement moteur avec filtres à particules, turbo et pot catalytique.

Il n’y a rien dans le réservoir d’essence. Pulvérisateur suspendu qui fait tourner le moteur dans le système d’admission d’air du moteur diesel. Si le moteur est en tournée, le produit sera pulvérisé en continu dans le système d’admission d’air, dans les cas où le fonctionnement du moteur est irrégulier, pour les petits rafales.
400 ml suffisent pour 1 à 2 applications

 


 











					

Production de composants pour moteurs diesel. Recommandé pour l’équipement moteur avec filtres à particules, turbo et pot catalytique.

Il n’y a rien dans le réservoir d’essence. Pulvérisateur suspendu qui fait tourner le moteur dans le système d’admission d’air du moteur diesel. Si le moteur est en tournée, le produit sera pulvérisé en continu dans le système d’admission d’air, dans les cas où le fonctionnement du moteur est irrégulier, pour les', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 35.0, 10, 'P1911-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1504 - Liqui Moly Motorbike 2T Street (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1504', 'Liqui Moly Motorbike 2T Street (1L)', 'liqui-moly-motorbike-2t-street-1l', 'Description




garantit la propreté des bougies d’allumage
bonne protection anticorrosion
protection anti-usure élevée
combustion sans résidus
automiscible
brûle sans cendres

Appli­ca­tion
En cas de graissage par mélange, verser le contenu dans le réservoir de carburant et faire l’appoint de carburant en respectant le rapport de mélange. Le mélange s’effectue automatiquement. En cas de graissage séparé, verser le contenu dans le réservoir d’huile. L’huile sera mélangée au carburant par le système de dosage.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, '1504-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API TC', NULL, 'JASO FC', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1931 - WOLF MOTO & SCOOTER 2T (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1931', 'WOLF MOTO & SCOOTER 2T (1L)', 'wolf-moto-scooter-2t-1l', 'Description

Description
Cette huile semi-synthétique moteur pour scooter à deux temps avec ensemble d’additifs avancé assure une conduite souple et stable. Sa formule équilibrée est conçue pour s’adapter parfaitement aux besoins des passionnés de scooter à la recherche d’un confort de conduite optimal.
Applications
Ce lubrifiant est spécialement développé pour les moteurs de scooter 2 temps. Veuillez suivre les recommandations de dosage de l’équipementier.
Performances
Ce lubrifiant vous permet de prolonger la durée de vie d’une large gamme de différents scooters en offrant une excellente protection à tous leurs composants.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 27.0, 10, '1931-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8364 - Additif pour huile ( MOS 2 )
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8364', 'Additif pour huile ( MOS 2 )', 'additif-pour-huile-mos-2', 'Description

Le lubrifiant antifriction MoS2 contenu forme une pellicule lubrifiante extrêmement résistante sur toutes les surfaces métalliques de frottement et de glissement. Il réduit le frottement et garantit un fonctionnement plus fluide des organes. Il en résulte une nette économie de carburant et d’huile, une réduction de l’usure attestée par des études scientifiques, une haute sécurité de fonctionnement et des caractéristiques de fonctionnement de secours fiables.
 
Pour toutes les huiles moteur courantes destinées aux moteurs essence et diesel avec ou sans filtre à particules diesel (DPF). Compatible avec catalyseur et turbocompresseur. Convient aux courroies dentées à bain d’huile. Dosage recommandé : ajouter 3-5 % à l’huile moteur. Pour les motos à embrayage à bain d’huile, le dosage maxi est de 2 % de la quantité d’huile.
 

Appli­ca­tion
Agiter avant l’emploi. Ajouter 5 % (50 ml par litre d’huile), dans les motos avec embrayage à bain d’huile, 2 % (20 ml par litre d’huile)', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 30.0, 10, '8364-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3 397 118 979 - Balai d’essuie-glace BOSCH – A 979 S
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3 397 118 979', 'Balai d’essuie-glace BOSCH – A 979 S', 'balai-dessuie-glace-bosch-a-979-s', 'Description

Tout savoir sur la pièce




Pour véhicule avec :


Position :Avant


À savoir :


Type :Plat
Largeur de la fixation :19 mm
Quantité :2
Avec spoiler :Oui




Gamme équipementier :Aerotwin


Vendu avec :




Balai d’essuie-glace
Longueur :600 mm




Balai d’essuie-glace
Longueur :475 mm', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 65.0, 10, '3 397 118 979-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3 397 008 634 - BOSCH Balai d’essuie-glace Arrière – A 282 H –
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3 397 008 634', 'BOSCH Balai d’essuie-glace Arrière – A 282 H –', 'bosch-balai-dessuie-glace-arriere-a-282-h', 'Description


Pour véhicule avec :


Position :Arrière


À savoir :


Type :Plat
Longueur :280 mm
Quantité :1
Avec spoiler :Non
Position :Arrière', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 25.0, 10, '3 397 008 634-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3 397 008 713 - BOSCH Balai d’essuie-glace Arrière – A 331 H –
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3 397 008 713', 'BOSCH Balai d’essuie-glace Arrière – A 331 H –', 'bosch-balai-dessuie-glace-a-331-h', 'Description


Pour véhicule avec :


Position :Arrière
Date du véhicule :Jusque 12/2018


À savoir :


Type :Plat
Avec spoiler :Oui
Longueur :330 mm
Quantité :1




Position :Arrière', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 30.0, 10, '3 397 008 713-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00125 - MANNOL Toyota Lexus 5W-30 (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00125', 'MANNOL Toyota Lexus 5W-30 (4L)', 'mannol-toyota-lexus-5w-30-4l', 'Description

Caractéristiques du produit :
– Les composants esters garantissent d’excellentes qualités anti-usure et anti-friction grâce à la durabilité exceptionnelle du film d’huile, qui, combinée à une excellente pompabilité, augmente considérablement la durée de vie du moteur, même pour les moteurs avec systèmes Start-Stop ;
– Économies de carburant significatives grâce à la viscosité à haute température réduite (HTHS) et aux propriétés anti-friction uniques ;
– Assure un démarrage à froid facile grâce à une excellente pompabilité, ce qui réduit considérablement l’usure du moteur au démarrage ;
– Une base entièrement synthétique offre une faible volatilité et une faible consommation d’huile pour les déchets ;
– D’excellentes propriétés de lavage et de dispersion et une stabilité thermo-oxydative maximale préviennent efficacement tous les types de dépôts et maintiennent les pièces du moteur exceptionnellement propres pendant tout l’intervalle de vidange ;
– Résiste efficacement au v', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 108.0, 10, 'TSC-00125-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SN', 'ACEA A5/B5', NULL, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, 'RENAULT RN0700; FORD WSS-M2C913-D; FORD WSS-M2C913-C; FORD WSS-M2C913-A; FORD WSS-M2C913-B; FIAT 9.55535-G1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7915 - MANNOL Extreme 5W-40 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7915', 'MANNOL Extreme 5W-40 (5L)', 'mannol-extreme-5w-40', 'Description



Caractéristiques du produit :
– La technologie ester et une base synthétique avec une gamme élargie de propriétés visco-température garantissent un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode urbain, en mode autoroute, ainsi que sous charge accrue (lors de la conduite sur des routes impraticables, en montée, en déplacement avec une remorque, charge maximale) et à des températures ambiantes élevées ;
– Idéale pour la conduite active et ne perd pas ses propriétés lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de la grande réserve d’indice alcalin (TBN) ;
– La base synthétique contenant des esters associée à un ensemble d’additifs moderne préserve les paramètres de puissance du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants de l’huile ester offrent d’excellentes propriétés anti-usure et anti-friction grâce à la résistanc', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 130.0, 10, '7915-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN/CH-4', 'ACEA A3/B4', 'JASO MA2', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; BMW LL-01; BMW LL-98; RENAULT RN0710; RENAULT RN0700; PSA B71 2296; PORSCHE A40; FIAT 9.55535-H2; FIAT 9.55535-Z2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9991 - MANNOL Molibden 300ml
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9991', 'MANNOL Molibden 300ml', 'mannol-molibden-300ml', 'Description

Caractéristiques du produit :
– Réduit efficacement le coefficient de frottement, diminuant ainsi le couple et, par conséquent, les pertes d’énergie, ce qui permet de réaliser des économies de carburant significatives ;
– Réduit l’usure et prévient le grippage même à des pressions et charges élevées, prolongeant ainsi considérablement la durée de vie du moteur et/ou des composants de la transmission mécanique ;
– Possède une stabilité thermique élevée, résiste aux températures élevées – jusqu’à 350 °C ;
– Ne forme pas de dépôts ni de sédiments ;
– Compatible avec tous les filtres (n’obstrue pas leurs pores) et joints ;
– Se mélange à tous les types d’huiles (minérales, synthétiques, etc.) et convient à tous les moteurs essence et diesel quatre temps (atmosphériques ou turbocompressés), avec ou sans système de traitement des gaz d’échappement ;
– Empêche les dommages au moteur et/ou à la transmission résultant de circonstances extrêmes (fuites d’huile, charges très élevées,', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 17.0, 10, '9991-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 74903 - FAR-BER Polish Plus Aroma 750ML
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '74903', 'FAR-BER Polish Plus Aroma 750ML', 'far-ber-polish-plus-aroma-750ml', 'Description

MODE D’EMPLOI
Ce format est prêt à l’emploi.

Vaporiser uniformément sur la surface à une distance de 20 cm.
Ètaler le produit uniformément à l’aide d’un chiffon en microfibre.
Essuyer avec un chiffon sec.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '750ML', 27.0, 10, '74903-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3 397 007 945 - BOSCH Balai d’essuie-glace – A 945 S –
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bosch';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3 397 007 945', 'BOSCH Balai d’essuie-glace – A 945 S –', 'bosch-balai-dessuie-glace-a-945-s', 'Description




Position :Avant
Date du véhicule :Jusque 12/2018


À savoir :


Type :Plat
Quantité :2
Avec spoiler :Oui




Gamme équipementier :Aerotwin


Vendu avec :




Balai d’essuie-glace
Longueur :650 mm




Balai d’essuie-glace
Longueur :400 mm', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 65.0, 10, '3 397 007 945-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7033 - JOTATE Balai d’Essuie-Glace Arrière Universel -1 p
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'jotate';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7033', 'JOTATE Balai d’Essuie-Glace Arrière Universel -1 pc (11″ 28cm)', 'jotate-balai-dessuie-glace-arriere-universel-1-pc-11-28cm', 'Description

Balai d’essuie-glace arrière universel composé d’une structure en plastique résistant et d’un caoutchouc recouvert de politetrafluoroéthylène.
Une fine lame flexible d’acier inoxydable assure l’élasticité du balais à tout moment. Balayage optimum et silencieux. Comprend un jeu complet d’adaptateurs, facilement interchangeables.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 25.0, 10, '7033-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72700 - KRAWEHL Balais d’essuie-glace PRIME – 1 pc (28″ 70
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72700', 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (28″ 700mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-28-700mm', 'Description

Côté montage : avant
Longueur [mm] 700
Quantité 1
[pouces] 28″', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 25.0, 10, '72700-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72650 - KRAWEHL Balais d’essuie-glace PRIME – 1 pc (26″ 65
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72650', 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (26″ 650mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-26-650mm', 'Description

Côté montage : avant
Longueur [mm] 650
Quantité 1
[pouces] 26″', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 20.0, 10, '72650-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72600 - KRAWEHL Balais d’essuie-glace PRIME – 1 pc (24″ 60
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72600', 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (24″ 600mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-24-600mm', 'Description

Côté montage : avant
Longueur [mm] 600
Quantité 1
[pouces] 24″', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 15.0, 10, '72600-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72550 - KRAWEHL Balais d’essuie-glace PRIME – 1 pc (22″ 55
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72550', 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (22″ 550mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-22-550mm', 'Description

Côté montage : avant
Longueur [mm] 550
Quantité 1
[pouces] 22″', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 15.0, 10, '72550-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72530 - KRAWEHL Balais d’essuie-glace PRIME – 1 pc (21″ 53
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72530', 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (21″ 530mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-21-530mm', 'Description

Côté montage : avant
Longueur [mm] 530
Quantité 1
[pouces] 21″', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 15.0, 10, '72530-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72500 - KRAWEHL Balais d’essuie-glace PRIME – 1 pc (20″ 51
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72500', 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (20″ 510mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-20-510mm', 'Description

Côté montage : avant
Longueur [mm] 510
Quantité 1
[pouces] 20″', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 15.0, 10, '72500-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00137 - KRAWEHL Balais d’essuie-glace PRIME – 1 pc (19″ 48
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00137', 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (19″ 480mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-19-480mm', 'Description

Côté montage : avant
Longueur [mm] 480
Quantité 1
[pouces] 19″', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 15.0, 10, 'TSC-00137-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72450 - KRAWEHL Balais d’essuie-glace PRIME-1 pc (18″ 450m
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72450', 'KRAWEHL Balais d’essuie-glace PRIME-1 pc (18″ 450mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-18-450mm', 'Description

Côté montage : avant
Longueur [mm] 450
Quantité 1
[pouces] 18', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 14.0, 10, '72450-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72350 - KRAWEHL Balais d’essuie-glace PRIME -1 pc  (350mm)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72350', 'KRAWEHL Balais d’essuie-glace PRIME -1 pc  (350mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-350mm', 'Description

Côté montage : avant
Longueur [mm] 350

Quantité 1

 [pouces] 14', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 10.0, 10, '72350-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 72410 - KRAWEHL Balais d’essuie-glace PRIME – 1 pc (16″ 41
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'krawehl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '72410', 'KRAWEHL Balais d’essuie-glace PRIME – 1 pc (16″ 410mm)', 'krawehl-balais-dessuie-glace-prime-1-pc-16-410mm', 'Description

Côté montage : avant
Longueur [mm] 350
Quantité 1
[pouces] 16', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 10.0, 10, '72410-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: HU 7008 z - MANN-FILTER Filtre à huile HU 7008 z (vw)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'filtre-a-huile-mann';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'HU 7008 z', 'MANN-FILTER Filtre à huile HU 7008 z (vw)', 'mann-filter-filtre-a-huile-hu-7008-z-vw', 'Description

Équivalent à ces références constructeurs :

VAG : 03L115466 , 03L115562
VW : 03L115562

Équivalent à ces références équipementiers :

ASHIKA : 10ECO098
BLUE PRINT : ADV182110
BOSCH : F026407023, P7023
EUROREPAR : 1643610580, 1682274680, 1611660780
FEBI BILSTEIN : 36634
FILTRON : OE688
GIF : LI119
HENGST FILTER : E115H, E115HD208, E115H01D208
HERTH+BUSS JAKOPARTS : J1310808
JAPANPARTS : FOECO098
K&N Filters : HP7047
MAHLE : OX388DECO, OX388, OX388D, OX1129
MAHLE FILTER : OX388, OX388D, OX388DECO
MISFAT : L120
PURFLUX : L418
SCT – MANNOL : SH4049P
SWAG : 30936634
UFI : 2510600
VAICO : V108553
WIX FILTERS : WL7476', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 22.0, 10, 'HU 7008 z-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7030 - JOTATE Balai d’Essuie-Glace Arrière Universel -1 p
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'jotate';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7030', 'JOTATE Balai d’Essuie-Glace Arrière Universel -1 pc (12″ 30cm)', 'jotate-balai-dessuie-glace-arriere-universel', 'Description

Balai d’essuie-glace arrière universel composé d’une structure en plastique résistant et d’un caoutchouc recouvert de politetrafluoroéthylène.
Une fine lame flexible d’acier inoxydable assure l’élasticité du balais à tout moment. Balayage optimum et silencieux. Comprend un jeu complet d’adaptateurs, facilement interchangeables.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 pc', 25.0, 10, '7030-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: H1003 - MAFRA KIT DE REGENERATION JANTES
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'H1003', 'MAFRA KIT DE REGENERATION JANTES', 'mafra-kit-de-regeneration-jantes', 'Description

Les jantes en alliage constituent l’une des pièces les plus appréciées de la voiture, mais combien de fois, après un nettoyage approfondi, ne parvenez-vous pas à obtenir le résultat escompté ?
Certaines impuretés telles que la poussière de frein et les résidus ferreux qui ont pénétré dans la peinture de la jante sont impossibles à éliminer avec les méthodes de nettoyage classiques, ce qui entraîne un vieillissement prématuré des jantes, qui sont tachées et altérées par des taches noires plus ou moins évidentes.
Pour éliminer complètement ces contaminations, il faut appliquer un traitement spécifique. C’est pourquoi Mafra est intervenu dans le Kit Regénera Cerchi.
Composé de :

Fallout Iron Remover 500ml, un produit sans acide très efficace, est idéal pour dissoudre et éliminer la poussière de frein et les résidus ferreux sur tous les types de jantes en acier, en alliage léger et même en chrome. Grâce à sa formule spéciale, pulvérisé sur la surface contaminée, il convertit', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 65.0, 10, 'H1003-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: H0590 - MAFRA KIT DE REGENERATION DES PHARES
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'H0590', 'MAFRA KIT DE REGENERATION DES PHARES', 'mafra-kit-de-regeneration-des-phares', 'Description

À partir des années 1990, les constructeurs automobiles ont commencé à fabriquer des cabochons de phares en polycarbonate, moins cher et plus léger, plus résistant aux chocs et, surtout, offrant aux concepteurs davantage de possibilités créatives. Mais le polycarbonate souffre des rayons UV et a tendance à jaunir et à se ternir. Le Kit Regénera Fari de Mafra permet de restaurer la transparence d’origine des phares et d’améliorer l’efficacité des feux de manière simple, en garantissant des résultats professionnels : Headlight Sealant Polisher 16 papiers abrasifs en 3 niveaux d’abrasivité extra fine, 1500, 2500 et 400 Support de polissage en polyuréthane pour la restauration des phares ternes.

Conseils:
– Travailler sur une surface fraîche et non directement exposée au soleil.
– Avant la phase de ponçage, modeler convenablement le périmètre du phare à l’aide de ruban de masquage, en insistant sur les bords intérieurs et les joints éventuels.
– Si, après l’application du ver', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 85.0, 10, 'H0590-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: H0526 - MAFRA STOP RAYURES (100ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'H0526', 'MAFRA STOP RAYURES (100ML)', 'mafra-stop-rayures-100ml', 'Description

RIMUOVI GRAFFI SPECIAL KIT est le produit MA-FRA pour l’élimination des rayures sur la voiture : éliminer les rayures de la poignée de porte et les micro-rayures de la portière, ou les rayures légères et les petites rayures de la peinture de la carrosserie, ne sera plus un problème.
Le produit convient à toutes les carrosseries et ne présente aucun danger pour la peinture : il élimine les rayures légères et superficielles et atténue les rayures plus profondes.
GRAFFI REMOVERS SPECIAL KIT de MA-FRA est en format de 100 ml.
Découvrez notre professionnalisme : nous sommes le meilleur fabricant et fournisseur de produits de lavage et de nettoyage pour voitures.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '100ML', 30.0, 10, 'H0526-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: H0045 - MAFRA ENTRETIEN TABLEAU DE BORD BLUE (600ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'H0045', 'MAFRA ENTRETIEN TABLEAU DE BORD BLUE (600ML)', 'mafra-entretien-tableau-de-bord-blue-600ml', 'Description

Scic Blu de Mafra est le produit conçu pour éclaircir et raviver la surface de tous les types de tableaux de bord de voitures.
Scic Blu, grâce à sa formule éclaircissante, donne un merveilleux effet moyennement brillant au tableau de bord, sans créer d’effet gras et sans provoquer ces reflets gênants dans le pare-brise pendant la conduite.
Scic Blu élimine la poussière, en donnant aux parties traitées brillance et douceur, votre tableau de bord brillera à nouveau comme neuf et sans l’effet « gras » désagréable, mais avec l’agréable sensation d’un toucher propre et soyeux.
Scic Blu de Mafra est disponible en format de 600 ml.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '600ML', 21.0, 10, 'H0045-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: H0779 - MAFRA SHAMPOING AUTO  (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'H0779', 'MAFRA SHAMPOING AUTO  (1L)', 'mafra-shampoing-auto-1l', 'Description

Lorsque l’on veut laver sa voiture, il faut toujours utiliser les bons produits pour ne pas abîmer la carrosserie. De nombreuses personnes utilisent des produits pour la vaisselle ou le linge, sans savoir que ces types de shampooings sont très agressifs pour la peinture et laissent souvent des traces ou des auréoles sur la carrosserie.
Shampoo Power est un shampooing pour voiture très moussant et facile à rincer qui non seulement économise l’eau, mais ne laisse pas de résidus ou d’auréoles après le rinçage. Une seule ampoule de produit suffit pour 30 lavages.
Extrêmement rapide et facile à utiliser, il suffit de diluer un bouchon de produit dans 1L d’eau ou 5 bouchons par seau de 5L d’eau et votre solution de lavage est prête ! Shampoo Power est sans danger pour toutes les pièces traitées, même les plus délicates comme les profilés en aluminium, les roues émaillées, les peintures mates et satinées et les films d’habillage.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 21.0, 10, 'H0779-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MAFH0841 - MAFRA PULIMAX (500ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MAFH0841', 'MAFRA PULIMAX (500ML)', 'mafra-pulimax-500ml', 'Description










Produit purifiant de Mafra adapté au nettoyage de l’intérieur de votre voiture : efficace, en particulier, sur les intérieurs en plastique. Sa formule unique détache la saleté et toute trace de nicotine du tissu et élimine toutes les mauvaises odeurs, même les plus tenaces, garantissant ainsi un nettoyage hygiénique complet.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ML', 18.5, 10, 'MAFH0841-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7504-10 - MANNOL Diesel Extra 10W-40 (10L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7504-10', 'MANNOL Diesel Extra 10W-40 (10L)', 'mannol-diesel-extra-10w-40-10l', 'Description

Caractéristiques du produit :
– La technologie ester et une base hydrosynthétique avec une plage étendue de propriétés visco-température garantissent un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode ville, en mode autoroute, ainsi que sous charge accrue (lors de la conduite sur des routes impraticables, en montée, en déplacement avec une remorque, charge maximale) et à des températures ambiantes élevées :
– Idéale pour la conduite active et ne perd pas ses propriétés lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de la grande réserve d’indice alcalin (TBN) ;
– La base hydrosynthétique contenant des esters associée à un ensemble d’additifs moderne préserve les paramètres de puissance du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants de l’huile ester en combinaison avec un ensemble d’additifs modernes uniques offrent d’exce', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '10L', 160.0, 10, '7504-10-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API CH-4/SN', 'ACEA A3/B4', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; MB 229.1; RENAULT RN0700; RENAULT RN0710; PSA B71 2296')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00150 - ASSAD TURBO VL L1 D/G 45AH 380A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00150', 'ASSAD TURBO VL L1 D/G 45AH 380A', 'assad-turbo-vl-l1-d-g-45ah-380a', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 45

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 380', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '45AH', 216.0, 10, 'TSC-00150-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD TURBO VL L2 D/G 57AH 500A - ASSAD TURBO VL L2 D/G 57AH 500A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD TURBO VL L2 D/G 57AH 500A', 'ASSAD TURBO VL L2 D/G 57AH 500A', 'assad-turbo-vl-l2-d-g-57ah-500a', 'Description

Hauteur : 189
Largeur : 175
Longueur : 245
Capacité en (Ah) : 57
Puissance de démarrage en (A) : 500
Voltage (V) : 12
Type : L2', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '57AH', 278.0, 10, 'ASSAD TURBO VL L2 D/G 57AH 500A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 20058-0050-99 - ROWE HIGHTEC SUPER LEICHTLAUF HC-O SAE 10W-40 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moteur-auto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20058-0050-99', 'ROWE HIGHTEC SUPER LEICHTLAUF HC-O SAE 10W-40 (5L)', 'rowe-hightec-super-leichtlauf-hc-o-sae-10w-40-5l', 'Description




Gamme de produits:
HIGHTEC


Série:
SUPER LEICHTLAUF, HC-O


Nombre SAE:
10w-40


Capacité [litres]:
5


Huile:
Huile de synthèse HC (Hydro-Cracked)


Spécification:
ACEA A3/B4, API SN


Autorisation du fabricant:
MB 229.3, VW 501 01/505 00 ,
MB 226.5, PSA B71 2300, Renault RN 0700/0710, Fiat 9.55535-G2/D2, MB 229.1', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 105.0, 10, '20058-0050-99-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN', 'ACEA A3/B4,', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; MB 226.5; MB 229.1; VW 501 01; Renault RN 0700; PSA B71 2300; Fiat 9.55535-G2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: ASSAD TURBO VL NS60 45AH 400A - ASSAD TURBO VL NS60  45AH 400A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD TURBO VL NS60 45AH 400A', 'ASSAD TURBO VL NS60  45AH 400A', 'assad-turbo-vl-ns60-45ah-400a', 'Description


Capacité de batterie [Ah] : 45
Hauteur [mm] : 223
Largeur [mm] : 130
Longeur [mm] : 238
Puissance de démarrage, PD [A] : 400
Rebord de fixation : B0
Voltage [V] : 12', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '45AH', 260.0, 10, 'ASSAD TURBO VL NS60 45AH 400A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD TURBO VL NS40 40AH 330A - ASSAD TURBO VL NS40  40AH 330A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD TURBO VL NS40 40AH 330A', 'ASSAD TURBO VL NS40  40AH 330A', 'assad-turbo-vl-ns40-40ah-330a', 'Description


Capacité de batterie [Ah] : 35
Hauteur [mm] : 189
Largeur [mm] : 175
Longeur [mm] : 245
Puissance de démarrage, PD [A] : 325
Rebord de fixation : B0
Voltage [V] : 12', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '40AH', 250.0, 10, 'ASSAD TURBO VL NS40 40AH 330A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD TURBO VL L0 D 40AH 380A - ASSAD TURBO VL L0 D 40AH 380A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD TURBO VL L0 D 40AH 380A', 'ASSAD TURBO VL L0 D 40AH 380A', 'assad-turbo-vl-l0-d-40ah-380a', 'Description

Capacité de batterie [Ah] : 45
Hauteur [mm] : 210
Largeur [mm] : 175
Longueur [mm] :175
Puissance de démarrage, PD [A] : 380
Rebord de fixation : B3
Type de borne : 1
Voltage [V] : 12', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '40AH', 228.0, 10, 'ASSAD TURBO VL L0 D 40AH 380A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: ASSAD MF5 100AH 840A - ASSAD SUPER TURBO TRUCK MF5 100AH, 840A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'ASSAD MF5 100AH 840A', 'ASSAD SUPER TURBO TRUCK MF5 100AH, 840A', 'assad-super-turbo-truck-mf5-100ah-840a', 'Description

Voltage [V]: 12
Capacité de batterie [Ah]: 100

Batterie/Pile: Batterie au plomb

Courant d’essai à froid, NE [A]: 840', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '100AH', 450.0, 10, 'ASSAD MF5 100AH 840A-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00157 - ASSAD TURBO VL L3 D/G 70AH 620A
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'assad';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00157', 'ASSAD TURBO VL L3 D/G 70AH 620A', 'assad-turbo-vl-l3-d-g-70ah-620a', 'Description

DESCRIPTION
BATTERIE ASSAD L3 D/G
Voltage [V]: 12
Capacité de batterie [Ah]: 70
Batterie/Pile: Batterie au plomb
Courant d’essai à froid, NE [A]: 620', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '70AH', 330.0, 10, 'TSC-00157-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: BMW : 51717154416 - BMW Pare-boue AV D E92/E93
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'produits-divers';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'BMW : 51717154416', 'BMW Pare-boue AV D E92/E93', 'bmw-pare-boue-av-d-e92-e93', 'Description

3 Coupé (E92)







Info




Type












Année de fabrication












kW












HP












cc












Code(s) du moteur












Numéro KBA (Allemagne)















320 d
09.2006 – 02.2010
130
177
1995

N47 D20 A N47 D20 C


0005AJP




320 d
03.2010 – 06.2013
135
184
1995

N47 D20 C


0005AUZ




320 d xDrive
09.2008 – 02.2010
130
177
1995

N47 D20 C


0005ANG




320 d xDrive
03.2010 – 06.2013
135
184
1995

N47 D20 C


0005AVO




320 i
03.2007 – 06.2013
125
170
1995

N43 B20 A


0005AVC 0005AHQ




325 d
02.2007 – 02.2010
145
197
2993

M57 D30 (306D3)


0005AJQ




325 d
09.2009 – 06.2013
150
204
2993

N57 D30 A


0005AVE




325 i
06.2006 – 02.2010
160
218
2497

N52 B25 BF N52 B25 AF N52 B25 A


0005895 0005AVF 0005AFM




325 i
09.2007 – 06.2013
160
218
2996

N53 B30 A


0005AKU 0005AVH




325 i xDrive
09.2008 – 12.2013
160
218
2996

N53 B30 A


0005AVQ




325 xi
09.2006 – 02.2010
160
218
2497

N52 B25 A


0005AVP 0005AFQ




330 d
03.200', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 170.0, 10, 'BMW : 51717154416-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: JTS483 - TRW BIELLE DE SUSPENSION AV GOLF 6
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'produits-divers';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'JTS483', 'TRW BIELLE DE SUSPENSION AV GOLF 6', 'trw-bielle-de-suspension-av-golf-6', 'Description

Équivalent à ces références équipementiers :

BENDIX : 042453B
BLUE PRINT : ADV188502
BORG & BECK : BDL6732
DELPHI : TC1315
DITAS : A25481, DSR1045
FEBI BILSTEIN : 24122, 03222057
FIRST LINE : FDL6732
LEMFÖRDER : 26774, 2677401
MAPCO : 51825, 51825HPS
METZGER : 6522, 83007618, 53007618
MEYLE : 1160600020HD, 1160600046, 1160600020
MGA : SA5266
MONROE : L29621
MOOG : VOLS1870
NK : 5114723
OCAP : 0504283
OPTIMAL : G71018
PEX : 1205547
QUINTON HAZELL : QLS3328S
RTS : 9705337
RUVILLE : 925437
SIDEM : 63563
SPIDAN : 57028
SWAG : 32924122
TALOSA : 5009746
TRISCAN : 850029621
TRUCKTEC AUTOMOTIVE : 0730138', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 50.0, 10, 'JTS483-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P6111BC - PRO TEC Nettoyant pour freins (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P6111BC', 'PRO TEC Nettoyant pour freins (400ml)', 'pro-tec-nettoyant-pour-freins-400ml', 'Description


Application universelle en studio et dans le domaine industriel.

Bien agiter le bidon avant emploi !

Vaporiser généreusement sur les pièces à nettoyer. Laissez le produit se vaporiser et confectionnez les pièces avec un chiffon propre. Toujours tester soigneusement les freins après le nettoyage.


Cela dépendait de la contamination', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 18.0, 10, 'P6111BC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANN-FILTER PU (825 X) (Filtre à gasoil) - MANN-FILTER PU 825 X (Filtre à gasoil)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN-FILTER PU (825 X) (Filtre à gasoil)', 'MANN-FILTER PU 825 X (Filtre à gasoil)', 'mann-filter-pu-825-x-filtre-a-gasoil', 'Description

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182301
BOSCH : N0008, 1457070008, F026402006
EUROREPAR : E148152
FEBI BILSTEIN : 26341
MAHLE : KX220, KX220D, KX220DECO
MAHLE FILTER : KX220, KX220D
MISFAT : F007
PURFLUX : C515
SCT – MANNOL : SC7047, SC7047P
SWAG : 32926341
UFI : 2600700
VALEO : 587904
WIX FILTERS : WF8388', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 55.0, 10, 'MANN-FILTER PU (825 X) (Filtre à gasoil)-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: VALEO - 586142 - VALEO – 586142 Filtre à huile
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'VALEO - 586142', 'VALEO – 586142 Filtre à huile', 'valeo-586142-filtre-a-huile', 'Description

Équivalent à ces références équipementiers :

BOSCH : F026407143, P7143, 451103318, OFVW3P3318, 0451103318, OFVW15P7143, P3318
FILTRON : OP6163
FRAM : PH11457
KNECHT : OC9771
MAHLE : OC9771, OC11961, OC1196
MANN-FILTER : W71289, W71292, W71295
MISFAT : Z646
PURFLUX : LS969', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 28.0, 10, 'VALEO - 586142-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANN-FILTER C35154 - MANN-FILTER C35154 Filtre à air (VW GROUPE)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN-FILTER C35154', 'MANN-FILTER C35154 Filtre à air (VW GROUPE)', 'mann-filter-c35154-filtre-a-air-vw-groupe', 'Description

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182204
BOSCH : 0986AF2438, 1987429404, S9404, F026401705, 0986626826
EUROREPAR : 1672351580, E147246, 1680354080
FEBI BILSTEIN : 22552
FILTRON : AP1392
MAHLE : LX12111, LX1211, LX2717, LX3797
MAHLE FILTER : LX12111, LX1211, LX3797
MISFAT : P419
PURFLUX : A1160
SCT – MANNOL : SB2117
SWAG : 30922552
UFI : 3018700
VALEO : 585001
WIX FILTERS : WA6781, 613130A, 49020', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 35.0, 10, 'MANN-FILTER C35154-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: MANN-FILTER - HU 710 x - MANN-FILTER – HU 710 x  Filtre à huile VW
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mann-filter-hu-710-x-filtre-a-huile-vw';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'MANN-FILTER - HU 710 x', 'MANN-FILTER – HU 710 x  Filtre à huile VW', 'mann-filter-hu-710-x-filtre-a-huile-vw', 'Description

Équivalent à ces références équipementiers :

BLUE PRINT : ADV182101
BOSCH : P9194, 1457429194, F026408705
EUROREPAR : 1682281680, E149189
FEBI BILSTEIN : 23468
FILTRON : OE671
MAHLE : OX360D, OX360DECO
MAHLE FILTER : OX360DECO, OX360D
MISFAT : L100
PURFLUX : L339
SCT – MANNOL : SH4790P
UFI : 2502900
VALEO : 586536
WIX FILTERS : WL7318', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 25.0, 10, 'MANN-FILTER - HU 710 x-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 24394 polo - FEBI BILSTEIN Filtre à air VW POLO
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'febi-bilstein';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '24394 polo', 'FEBI BILSTEIN Filtre à air VW POLO', 'febi-bilstein-filtre-a-air', 'Description

Équivalent à ces références constructeurs :

SEAT : 5JF129620A , 6Y0129620 ,5Z0129620, 5JF129620
SKODA : 5JF129620, 6Y0129620 , 5Z0129620, 5JF129620A
VW :6Y0129620 , 5JF129620, 5Z0129620 , 5JF129620A
Équivalent à ces références équipementiers :

Borsehung : B12359
FILTRON : AP189
KAMOKA : F205101
MAHLE : LX4995, LX998
MAHLE FILTER : LX998, 08556466
MANN-FILTER : C22952
MECAFILTER : ELP3918
MISFAT : P132
UFI : 3013200
VALEO : 585136
WIX FILTERS : WA6687', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 25.0, 10, '24394 polo-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 20138-5 - ROWE MULTI FORMULA SAE 5W-40 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20138-5', 'ROWE MULTI FORMULA SAE 5W-40 (5L)', 'rowe-multi-formula-sae-5w-40-5l-2', 'Description

Avantages
sorte de rationalisation de qualité supérieure avec usages multifonctions dans les moteurs diesel et à essence de différents constructeurs répond aux exigences de VW de la spécification d’injecteur pompe VW 505 01 peu de cendres sulfatées, la faible teneur en phosphate et en soufre ménage le filtre à particules diesel et les catalyseurs
empêche les dépôts dans le moteur.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 145.0, 10, '20138-5-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN', 'ACEA C3', NULL, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, 'MB 226.5; VW 505 00; VW 505 01; Renault RN 0700; Porsche A40; Ford WSS-M2C917-A; Fiat 9.55535-T2; Fiat 9.55535-S2; GM dexos2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9365 - BARDAHL Décrassant 5 en 1 Diesel (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bardahl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9365', 'BARDAHL Décrassant 5 en 1 Diesel (500ml)', 'bardahl-decrassant-5-en-1-diesel-500ml', 'Description

Le Décrassant moteur 5 en 1 agit sur chaque organe du moteur de manière efficace et sans danger.

Evite la surconsommation d’huile et de carburant
Réduit les bruits et l’usure moteur
Stoppe les fuites d’huile
Réduit les fumées noires à l’échappement
Nettoie et protège l’ensemble du système d’injection
Rétablit le débit des injecteurs
Supprime trous à l’accélération et ralenti instable
Limite les émissions de CO2 et facilite le passage au contrôle technique antipollution
Compatible avec le carburant diesel additivé en station-service.
Simple d’utilisation : A ajouter dans votre réservoir lors de votre plein de carburant', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 50.0, 10, '9365-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00168 - ROWE MULTI FORMULA SAE 5W-40 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00168', 'ROWE MULTI FORMULA SAE 5W-40 (5L)', 'rowe-multi-formula-sae-5w-40-5l', 'Description

Avantages
sorte de rationalisation de qualité supérieure avec usages multifonctions dans les moteurs diesel et à essence de différents constructeurs répond aux exigences de VW de la spécification d’injecteur pompe VW 505 01
peu de cendres sulfatées, la faible teneur en phosphate et en soufre ménage le filtre à particules diesel et les catalyseurs empêche les dépôts dans le moteur.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 0.0, 10, 'TSC-00168-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN', 'ACEA C3', NULL, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, 'MB 226.5; VW 505 00; VW 505 01; Renault RN 0700; Porsche A40; Ford WSS-M2C917-A; Fiat 9.55535-S2; GM dexos2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: P2101CRDSC - PRO TEC Common rail diesel system cleaner (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P2101CRDSC', 'PRO TEC Common rail diesel system cleaner (375ml)', 'pro-tec-common-rail-diesel-system-cleaner-375ml', 'Description


Une utilité dans les moteurs diesel équipés de systèmes avec rampe ou pompe à injecteur. Recommandé pour l’équipement moteur avec filtres à particules, turbo et pot catalytique.


Remplissez directement dans le réservoir de gasoil.


375 ml de jus pour 80 litres de diesel. Rapport de mélange : 1:200', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 35.0, 10, 'P2101CRDSC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P1101FLC - PRO TEC Nettoyant pour conduites de carburant (375
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P1101FLC', 'PRO TEC Nettoyant pour conduites de carburant (375ml)', 'pro-tec-nettoyant-pour-conduites-de-carburant-375ml', 'Description


Pratique pour tous les moteurs à essence. Véhicules à moteur, motos et autres moteurs à hautes performances (par exemple, bateaux, karts, moteurs de course, tondeuses à gazon, etc.)


Rejoignez le système de carburateur avant le salon. Utiliser à chaque entretien aux intervalles recommandés par le fabricant. Pour obtenir les meilleurs résultats, utilisez la machine Clear Flow comme indiqué. Aucune garantie pour les résultats du FLC n’est utilisée avec un équipement d’injection de filet d’injection autre que non. Pas pour la vente au détail. Le produit est destiné à un usage professionnel unique. Traité jusqu’à 80 L d’essence. Rapport de mélange 1:200


375 ml suffisent pour seulement 80 litres de carburant. Rapport de mélange 1:200', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 28.0, 10, 'P1101FLC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P1601 - PRO TEC Radiateur anti fuite (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P1601', 'PRO TEC Radiateur anti fuite (375ml)', 'pro-tec-radiateur-anti-fuite-375ml', 'Description


Utilisation dans toutes les unités et systèmes avec circuit de refroidissement par eau fermée


Transférez le liquide de refroidissement PRO-TEC Heater Stop Leak vers le radiateur et régulez la chaleur sur la chaleur. Vérifiez le niveau de réfrigération du liquide. Il contient également une substance toxique ou irritante

375 ml suffisent pour 5 à 10 litres d’eau de refroidissement. Rapport de mélange 1:20', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 22.0, 10, 'P1601-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API GL5', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: P1501RF - PRO TEC Radiateur Flush (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P1501RF', 'PRO TEC Radiateur Flush (375ml)', 'pro-tec-radiateur-flush-375ml', 'Description

À utiliser dans tous les circuits d’eau de refroidissement des moteurs essence, diesel ou des équipements industriels
Avant chaque changement de liquide de refroidissement, administrez PRO-TEC Radiateur Flush au liquide de refroidissement utilisé. Faites tourner le système de refroidissement ou le moteur au ralenti (selon la taille du système) pendant env. 15 à 40 minutes. Après égouttage, rincer à l’eau douce. Effectuez ensuite le changement du liquide de refroidissement selon les instructions du fabricant. Nous recommandons l’utilisation préventive du conditionneur de radiateur PRO-TEC après avoir changé le liquide de refroidissement.
375 ml suffisent pour 5 à 10 litres d’eau de refroidissement. Rapport de mélange 1:20
Temps de traitement:
15 à 40 minutes, selon la taille du système', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 24.0, 10, 'P1501RF-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API GL5', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: P2901 - PRO TEC ELECTRONIC SPRAY (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P2901', 'PRO TEC ELECTRONIC SPRAY (400ml)', 'pro-tec-electronic-spray-400ml', 'Description


Pour l’entretien et la maintenance de divers équipements électroniques, appareils et même de composants mécaniques fins.

Poudrer le produit uniformément sur les parties à une distance de 30 cm de l’environnement et laisser pénétrer. Si vous devez éliminer les impuretés et les dommages sur la nouvelle surface.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 25.0, 10, 'P2901-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API GL5', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: P2131HLC - PRO TEC nettoyant poussoirs hydrauliques (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P2131HLC', 'PRO TEC nettoyant poussoirs hydrauliques (375ml)', 'pro-tec-nettoyant-poussoirs-hydrauliques-375ml', 'Description


Verser une utilisation dans tous les moteurs essence et diesel 4 temps.


Ajouter de l’huile neuve après chaque vidange. Respectez au maximum le volume de l’huile pour le constructeur.


375 ml suffisent pour 5 litres d’huile. Rapport de mélange : 1:15', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 38.0, 10, 'P2131HLC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P2111QAS - PRO TEC Oil stop smoke (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P2111QAS', 'PRO TEC Oil stop smoke (375ml)', 'pro-tec-oil-stop-smoke-375ml', 'Description


À utiliser dans tous les moteurs à 4 temps, diesel et GPL. Le produit est compatible avec tous les matériaux disponibles dans le commerce.


Ajouter au système d’huile. Nous recommandons un nettoyage du système d’huile avec Engine Flush avant d’utiliser ce produit. Le volume total de l’huile est conforme aux spécifications du fabricant.


375 ml suffisent pour 5 litres d’huile. Rapport de mélange : 1:15', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 30.0, 10, 'P2111QAS-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P6171DPFSC - PRO TEC FAP Super clean (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P6171DPFSC', 'PRO TEC FAP Super clean (375ml)', 'pro-tec-fap-super-clean-375ml', 'Description


Avantages:
• pas de montage ni de démontage, pas de temps de repos
• réduit la température d’inflammation des suies recueillies dans le filtre à particules diesel
• pas de formation d’émissions secondaires


Convient à tous les moteurs diesel équipés de filtres à particules, ce mélange dispose également de carburateurs diesel

Merci de respecter les instructions de dosage ! Ajoutez le produit au réservoir de gazole avant de faire le plein.
375 ml suffisent pour 40 à 80 litres de diesel', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 35.0, 10, 'P6171DPFSC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P2233VIC - PRO TEC Nettoyant pour soupes et injections (375ml
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P2233VIC', 'PRO TEC Nettoyant pour soupes et injections (375ml)', 'pro-tec-nettoyant-pour-soupes-et-injections-375ml', 'Description


Caractéristiques du produit :
• améliorer les performances du moteur
• éliminer les dépôts de carbone sur les soupapes, la zone d’admission et dans toute la zone de la chambre de combustion
• éliminer les dépôts dans tout le système d’injection de carburant
• assurer une combustion propre et puissante
• optimiser les valeurs d’émission
• garantir un dosage d’injection et une vaporisation de carburateur optimisés
• assurer une protection optimale du moteur, augmenter la durée de vie du moteur, assurer une fonction de souple et réguler le moteur



Versez tous les moteurs essence à carburateur, injection, injection directe (FSI, GDI, …) et pots catalytiques.

Vous pouvez parcourir entre 3000 et 4000 km avec le système à carburateur avant d’obtenir l’essence. Traitez 80 litres de carburant.
375 ml suffisent pour seulement 80 litres de carburant. 1% du volume du réservoir pour les réservoirs plus grands.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 28.0, 10, 'P2233VIC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P2151 DAS - PRO TEC Anti-fumée diesel (150ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P2151 DAS', 'PRO TEC Anti-fumée diesel (150ml)', 'protec-anti-fumee-diesel-150ml', 'Description


À utiliser dans les moteurs diesel. Recommandé pour les moteurs équipés de filtres à particules, turbo et catalyseurs.


Remplissez directement dans le réservoir de diesel. Respectez le rapport de mélange !


150 ml suffisent pour 60 litres de diesel. Rapport de mélange : 1:400


Temps de traitement pendant que le moteur tourne.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '150ml', 25.0, 10, 'P2151 DAS-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P1301 - OIL BOOSTER PROTECTED (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P1301', 'OIL BOOSTER PROTECTED (375ml)', 'oil-booster-protected-375ml', 'Description


Utilisation dans la circulation de l’huile et du lubrifiant des moteurs 4 temps et diesel, des boîtes de vitesse manuelles, des différents engrenages et équipements bruyants, ainsi que des moteurs marins ou des générateurs de deuxième génération, qui sont les rouleaux de la bande transporteuse. Idéal pour les véhicules dans les sources d’huile végétale, on utilise l’ester d’huile végétale (RME) ou l’ester d’huile végétale (PME).


Ajouter au système d’huile. Nous recommandons un nettoyage du système d’huile avec Engine Flush avant d’utiliser ce produit. La capacité totale de l’huile dépend des spécifications du fabricant et est respectée. Pour une utilisation dans des véhicules avec emballage humidifié, les instructions du fabricant doivent être respectées. Remplacer dans les transmissions, les différences ou les systèmes avec 10% de la quantité d’huile avec Oil Booster.


375 ml suffisent pour 8 litres d’huile. Rapport de mélange : 1:20', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 33.0, 10, 'P1301-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: P9201 - NANO ENGINE PROTECTED (375ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'pro-tec';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'P9201', 'NANO ENGINE PROTECTED (375ml)', 'nano-engine-protected', 'Description


Produit d’entretien à utiliser dans système d’huile des moteurs essence et diesel 4 temps. Peut être utilisé pour les systèmes d’injection avec une rampe et une pompe d’injection communes et est recommandé pour les moteurs avec turbocompresseur, pot catalytique et filtres DPF. Compatible avec toutes les huiles moteur.


Ajouter au système d’huile après chaque vidange. Nous recommandons de nettoyer le système d’huile avec PRO-TEC Engine Flush avant utilisation. Respectez la quantité maximale d’eau ! Dans les systèmes de direction assistée, les boîtes de vitesses manuelles et les différentiels, utilisez un rapport de 1:10.
Remarque : En cas d’utilisation dans des véhicules avec emballage humidifié, respecter les instructions du constructeur !


375 ml suffisent pour 5 litres d’huile. Rapport de mélange : 1:15.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '375ml', 40.0, 10, 'P9201-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00181 - ROWE  RS LONGLIFE IV SAE 0W-20
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00181', 'ROWE  RS LONGLIFE IV SAE 0W-20', 'rowe-rs-longlife-iv-sae-0w-20-5l', 'Description

HIGHTEC SYNT RS LONGLIFE IV SAE 0W-20 a été spécialement conçue pour la norme actuelle Volkswagen VW 508 00 / 509 00.
Elle convient donc parfaitement à tous les véhicules qui requièrent une des spécifications mentionnées dans la classe de viscosité SAE 0W-20.
HIGHTEC SYNT RS LONGLIFE IV SAE 0W-20 garantit la plus haute protection longue durée contre l’usure du
moteur pour une économie de carburant optimisée et une propreté constante du moteur.
HIGHTEC SYNT RS LONGLIFE IV SAE 0W20 dépasse ainsi les rigoureuses exige', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 45.0, 5, 'TSC-00181-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 5, 'TSC-00181-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', NULL, 'ACEA C5', NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'VW 508 00; Porsche C20; Ford WSS-M2C956-A1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20112-5 - ROWE HIGHTEC MULTI SYNT DPF SAE 0W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20112-5', 'ROWE HIGHTEC MULTI SYNT DPF SAE 0W-30 (5L)', 'rowe-hightec-multi-synt-dpf-sae-0w-30-5l', 'Huile moteur multigrade fluide synthétique haut de gamme. Convient parfaitement aux moteurs essence et diesel de voitures avec et sans turbo, y compris filtre à particules.
ACEA C3
BMW Longlife-04
MB-Freigabe 229.52
VW 504 00/507 00
Porsche C30
Ce produit est par ailleurs également recommandé quandles spécifications de remplissage suivantes sont
prescrites
VW 503 00/506', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 220.0, 10, '20112-5-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W30', NULL, 'ACEA C3', NULL, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, 'VW 504 00; VW 503 00; Porsche C30')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20150-5 - ROWE HIGHTEC SYNT RSF 950 SAE 0W-30 (5L) FORD
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20150-5', 'ROWE HIGHTEC SYNT RSF 950 SAE 0W-30 (5L) FORD', 'rowe-hightec-synt-rsf-950-sae-0w-30-5l-ford', 'Huile multigrade de synthèse HC de haut de gamme pour moteurs à essence et moteurs Diesel de voitures avec et sans turbocompresseur. Convient parfaitement pour l´utilisation dans les véhicules dotés de systèmes de filtres à particules Diesel conformément aux spécifications du fabricant.
ACEA C2
VWC 530 35
Ford WSS-M2C950-A
Jaguar Land Rover STJLR.03.5007', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 200.0, 10, '20150-5-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W30', NULL, 'ACEA C2', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C950-A')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20379-5 - ROWE HIGHTEC SYNT RS C5 SAE 0W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20379-5', 'ROWE HIGHTEC SYNT RS C5 SAE 0W-20 (5L)', 'rowe-hightec-synt-rs-c5-sae-0w-20-5l', 'Description

BMW Longlife-17 FE+
Jaguar Land Rover STJLR 03.5006
MB-Freigabe 229.71/229.72
Opel/Vauxhall OV 040 1547-A20
De qualité équivalente conformément au droit de l’Union européenne :
ACEA A1/B1,C5,C6
API SQ/SP RC/SN PLUS RC (Resource Conserving)
ILSAC GF-7A
Ford WSS-M2C947-B1/M2C954-A1/M2C962-A1
GM dexosD
Volvo VCC RBS0-2AE
Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
Chrysler MS-12145
Fiat 9.55535-GSX/DSX
Ford WSS-M2C947-A', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 180.0, 10, '20379-5-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', 'API SQ/SP', 'ACEA A1/B1,', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C947-B1; Ford WSS-M2C947-A; FORD WSS-M2C947-B1; Ford WSS-M2C954-A1; Ford WSS-M2C962-A1; Fiat 9.55535-GSX')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 30509 - ROWE HIGHTEC HUILE HYDRAULIQUE ZH-M SYNT (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '30509', 'ROWE HIGHTEC HUILE HYDRAULIQUE ZH-M SYNT (1L)', 'rowe-hightec-huile-hydraulique-zh-m-synt-1l', 'Description

DIN 51524 Teil 3
ISO 7308
Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
BMW
Chrysler/Dodge/Jeep MS-11655
DTFR 31B120 (ex. MB 345.0)
MAN M 3289
Ford WSS-M2C204-A/A2
Hyundai/Kia PSF-4
Opel 19 40 715/766
Porsche 000.043.203.33/000.043.206.56
Volvo 1161529/30741424
VW TL 52 146 (G002 000/G004 000)
ZF TE-ML 02K', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 10, '30509-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 345.0; Porsche 000; Ford WSS-M2C204-A')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25066 - ROWE HIGHTEC 75W-80 S (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25066', 'ROWE HIGHTEC 75W-80 S (1L)', 'rowe-hightec-75w-80-s-1l', 'Description

API GL-4/-5
Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
BMW MTF LT-1/-2/-3/-4
Fiat 9.55550-MZ2
Ford WSS-M2C200-D2
MB 235.10
PSA 9730 A2/A8/B 71 2330
Toyota JWS 227
VW G009 317/G052 171/G52 178/G052 512/G052 532/G052
527/G052 726/G052 798/G055 726', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 55.0, 10, '25066-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W80', 'API GL-4/-5', NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 235.10; Ford WSS-M2C200-D2; Fiat 9.55550-MZ2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25029 - ROWE HIGHTEC HYPOID EP SAE 75W-140 S-LS (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25029', 'ROWE HIGHTEC HYPOID EP SAE 75W-140 S-LS (1L)', 'rowe-hightec-hypoid-ep-sae-75w-140-s-ls-1l', 'Description

De qualité équivalente conformément au droit de l’Union européenne :
API GL-5/GL-5 LS (Limited Slip)
MIL-L 2105D
Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
BMW (Hinterachsgetriebeöl MSP/A)
Ford M2C187-A/192-A/192-A+M2C118-A
GM 12346140/1942386
MB 235.61', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 10, '25029-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W140', 'API GL-5/GL-5', NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 235.61')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25063 - ROWE HIGHTEC ATF 9008 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25063', 'ROWE HIGHTEC ATF 9008 (1L)', 'rowe-hightec-atf-9008-1l', 'Description

Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
Allison C3
BMW 81 22 9 400 272/275/83 22 2 152 426/83 22 2 305 397
(BMW L12108)/83 22 2 289 720 (ATF3+)/ATF 4
Chrysler MS 7176 (ATF +)/MS 7176D (ATF +2)/MS 7176E (ATF
+3)/MS 9602 (ATF +4)/68157995AA
DSIH 5M-66 (DSIH 6p805)
Fiat 9.55550-AV1/-AV4/-AV5
Ford XT-2-QDX/XT-2-QSM/XT-5-QM/XT-5-QSM/XT-8-QAW/XT9-QMM5
GM 1940767/1940771/9985010
Honda ATF-Type 3.1
Isuzu ATF III
Jaguar 02JDE 26444
Land Rover ATF N402/LR023288
Mazda M-III
Mitsubishi Dia Queen ATF J2/SP/SP-III/MS991156
Nissan N402
Porsche 000 043 204 63/000 043 204 41
Saab JWS 3309
Subaru ATF HP/K0140Y0700/SOA635040
Suzuki ATF 3314/3317
Toyota Type T/T-II
Volvo 97340/AT100
VW G 060 162/G 055 540/G 052 540
ZF S671 090 310/ZF S671 090 311/ZF S671 090 312/ZF S671
090 313', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 70.0, 10, '25063-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Porsche 000; Fiat 9.55550-AV1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25036 - ROWE HIGHTEC ATF 9600 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25036', 'ROWE HIGHTEC ATF 9600 (1L)', 'rowe-hightec-atf-9600-1l', 'Description

De qualité équivalente conformément au droit de l’Union européenne :
DEXRON VI
Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
MERCON SP
Aisin Warner AW-1
BMW ETL 7045 E/ETL 8072 B/83 22 0 142 516 (BMW
1375.4)/83 22 2 305 396 (BMW ATF 2)/83 22 2 355 599 (BMW
ATF 6)
Honda DW-1
Hyundai SP-IV
Jaguar Fluid 8432
Land Rover TYK500050
Mazda FZ
MB 236.41
Nissan Matic S
Toyota Type WS (JWS 3324)
VW G 055 005
ZF S671 090 255', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 47.0, 10, '25036-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'MB 236.41')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25020 - ROWE HIGHTEC ATF 9000 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25020', 'ROWE HIGHTEC ATF 9000 (1L)', 'rowe-hightec-atf-9000-1l', 'Description

Autorisations
DTFR 13C170 (ex. MB 236.9)
MAN 339 Type V1/Z11/Z2
Voith 55.6335.xx (G607)
ZF TE-ML 04D, 14B, 20B, 25B (ZF registration No. ZF001937) 
De qualité équivalente conformément au droit de l’Union européenne :
DEXRON IIIH
MERCON/MERCON V
Allison C-4
MB 236.6
ZF TE-ML 16L, 16R, 17C
Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont prescrites :
Aisin Warner JWS 3309/3314
Allison TES 295/TES 389
BMW LA-2634/LT-71141/ETL 7045 E
Chrysler ATF+3/+4
DTFR 13C110 (ex. MB 236.11)/DTFR 13C150 (ex. MB
236.8)/DTFR 13C180 (ex. MB 236.91)
Ford M2C195-A/202-B/922-A1/WSS-M2C924-A/938-A
GM 9986195
Honda Z1
Hyundai/Kia/Mitsubishi SP-II/-III
MAN 339 Type V2/Z3
MB 235.71/236.10
Nissan Matic-D/J/K
Toyota T-IV/JWS 3309
Voith H55.6336.xx (G1363)
Volvo 97341/Volvo 5-Speed (1161540)
VW 50 160/TL 52 162/G 052 990/G 055 025
ZF TE-ML 02F, 11B, 14C', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 50.0, 10, '25020-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'MB 236.9; MB 236.6; MB 236.11; MB
236.8; MB 236.91; MB 235.71')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25050 - ROWE HIGHTEC ATF 9004 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25050', 'ROWE HIGHTEC ATF 9004 (1L)', 'rowe-hightec-atf-9004-1l', 'Description

Description
Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
Hyundai/Kia Red-1K
MB 236.12/236.14
SSANG YONG', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 50.0, 10, '25050-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'MB 236.12')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25067 - ROWE HUILE DE BOITE ATF DCG II (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25067', 'ROWE HUILE DE BOITE ATF DCG II (1L)', 'rowe-huile-de-boite-atf-dcg-ii-1l', 'Description

Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
BMW DCTF-1/DCTF-1+/DCTF-2(83 22 2 433 157)/FFL-4/MTF
LT-5
BYD DCTs, Q/BYD-A1909.0058-2013
Changan DCTF
Chrysler 68044345EA/GA
DTFR 13C130 (ex. MB 236.21)
Dodge BOT 341
Eaton PS-278
Ferrari TF DCT-F3
Fiat 9.55550-MZ6
Ford WSS-M2C200-D2/218-A1/936-A
MB 236.22/236.24/236.25/239.21/239.22
Mitsubishi DiaQueen SSTF-I (MZ320065)
Porsche 999.917.080.01/999.917.080.00/FFL-3
PSA 9734.S2
Renault EDC-6/-7/BOT 450/DC4/77 11 785 243 (DW5)
Volvo 1161838/1161839/BOT 341
VW G 052 182 (DQ250/DQ500)/G 052 512/G 052 529/G 055
529 (DL 501)/G 052 536/G 055 536', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 55.0, 10, '25067-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'MB 236.21; MB 236.22; Porsche 999; Ford WSS-M2C200-D2; Fiat 9.55550-MZ6')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25055 - ROWE HUILE DE BOITE ATF CVT  (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25055', 'ROWE HUILE DE BOITE ATF CVT  (1L)', 'rowe-huile-de-boite-atf-cvt-1l', 'Description

Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
VW TL 52 180 (G 052 180)/TL 52 516 (G052 516)
BMW EZL799/EZL799A/8322 0 136 376/8322 0 429 154
Daihatsu Ammix CVTF-DC/-DFE/-DFC/-TC
Dodge/Jeep NS-2/CVTF+4/MOPAR CVT 4
Ford CFT23/WSS-M2C928-A/CFT30/WSS-M2C933-
A/Motorcraft XT-7-QCFT/MERCON C
GM/SATURN DEX-CVT/CVTF I-Green2
Honda HMMF/HCF-2
Hyundai/Kia SP-CVT 1
Mazda CVTF 3320
MB CVT 28/236.20
Mini EZL799/EZL799A/ZF CVT V1
Mitsubishi DiaQueen CVT Fluid J1/J4/J4+/SP-III (nur/only CVT)
Nissan NS-1/-2/-3
Punch EZL 799/EZL 799A/CVTF-EX1
Renault ELFMATIC CVT
Toyota/Lexus CVT TC/FE
Subaru NS-2/Lineatronic CVTF/CVT II/High Torque (HT) CVT/iCVTF/K0425Y 0710/CV-30/e-CVTF
Suzuki CVTF 3320/TC/NS-2/CVTF Green-1/-2', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 53.0, 10, '25055-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25051 - ROWE HUILE DE BOITE ATF 9006 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25051', 'ROWE HUILE DE BOITE ATF 9006 (1L)', 'rowe-huile-de-boite-atf-9006-1l', 'Description

Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont
prescrites :
Aisin Warner AW-1
BMW 83 22 0 142 516 (BMW 1375.4)/83 22 2 305 396 (BMW
ATF 2)/83 22 2 355 599 (BMW ATF 6)
Dexron HP
Ford WSS-M2C938-A/XT-6-QSP/XT-10-QLV
GM 1940773
Honda/Acura ATF Type 3.0/08200-9016-A
Honda DW-1
Hyundai/Kia Red-1K/SP-IV/SP-IV-M/SP-IV-RR/040000C90SG
Isuzu SCS/WSI
Jaguar Fluid 8432
Land Rover TYK500050
Mazda FZ
MB 236.12/236.14
MERCON SP/LV
Mitsubishi Dia Queen ATF-PA/4030401/ATF-MA1/MZ320775
Nissan Matic R/S
SSANG YONG
Toyota Type WS (JWS 3324)
Volvo 6 speed MY 2011-2013 (P/N 31256774/31256675)
VW G 055 005
ZF S671 090 255 / ZF S671 090 281', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 50.0, 10, '25051-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.12; Ford WSS-M2C938-A')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 25060 - ROWE HUILE DE BOITE ATF 9005 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '25060', 'ROWE HUILE DE BOITE ATF 9005 (1L)', 'rowe-huile-de-boite-atf-9005-1l', 'Description

Ce produit est par ailleurs également recommandé quand les spécifications de remplissage suivantes sont prescrites :
Aisin Warner AW-2
BMW 83 22 2 413 477 (ATF7)
DEXRON ULV
Ford M2C949-A/XT-12-ULV
Mazda ATF A7
MB 236.15
Nissan Matic P
PSA 16 350 560 80
Volvo 31 492 172/31 492 173
VW G 053 001
VW G 060 540', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 52.0, 10, '25060-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.15')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21062 - ROWE ANTIGEL HIGHTEC AN 13 (1.5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21062', 'ROWE ANTIGEL HIGHTEC AN 13 (1.5L)', 'rowe-antigel-hightec-an-13-1-5l', 'Description


Gamme de produits: HIGHTEC
Autorisation du fabricant:
SAE J1034, ASTM D3306, ASTM D4985, BS 6580, VW TL 774-J
Capacité [litres]: 1.5L
Série : ANTIFREEZE AN 13
Spécification: G13
Couleur: violet
Propriétés: Concentré
Recommandation du fabricant de réfrigérant : G13
Type d’emballage : Bouteille
Rapport de mélange : 50/50 (-36°C)
Propriété chimique: sans nitrite, sans amine, sans phosphates', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1.5L', 33.0, 10, '21062-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 21014 - ROWE  ANTIGEL HIGHTEC AN-SF 12+ (1.5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rowe';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21014', 'ROWE  ANTIGEL HIGHTEC AN-SF 12+ (1.5L)', 'rowe-antigel-hightec-an-sf-12-1-5l', 'Description


Gamme de produits: HIGHTEC
Autorisation du fabricant:
VW TL-774 F, MAN 324 SNF, SAE J1034, ASTM D3306, ASTM D4985, AFNOR NF R 15-601, BS 6580, MTU MTL 5048, DQC CB-14, Ford WSS-M 97B44-D, GM 6277M, GM B 040 1065, MB 325.3, VW TL-774 D
Capacité [litres]: 1,5
Série: ANTIFREEZE AN-SF 12+
Spécification: G12+
Couleur : violet
Propriétés: Concentré
Recommandation du fabricant de réfrigérant:G12, G12+
Type d’emballage: Bouteille
Propriété chimique: sans nitrite, sans amine, sans phosphates, sans silicate
Rapport de mélange: 50/50 (-37°C)', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1.5L', 30.0, 10, '21014-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 325.3; Ford WSS-M')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: S671.090.255 - ZF LifeGuardFluid 6 Huile pour boîte automatique 1
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'S671.090.255', 'ZF LifeGuardFluid 6 Huile pour boîte automatique 1L', 'zf-lifeguardfluid-6-huile-pour-boite-automatique-1l', 'Description

Références OE comparables



ASTON MARTIN

4G4319A509/AA/S



AUDI

G 055005A2



BENTLEY

PY112995PA



BMW

83 22 2 305 396



JAGUAR

Jaguar Fluid 8432



LAND ROVER

TYK500050



MASERATI

# 219549', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 90.0, 10, 'S671.090.255-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9668 - MANNOL Dégraissant Tar remover   (450 ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9668', 'MANNOL Dégraissant Tar remover   (450 ml)', 'mannol-degraissant-tar-remover-450-ml', 'Description

Propriétés :
– Élimine le bitume (goudron), les éclats d’asphalte, les taches séchées d’huiles et autres liquides techniques, les taches et traces d’insectes, les fientes d’oiseaux, les revêtements de peinture oxydés et dégradés sans endommager les surfaces ;
– Améliore la brillance et la couleur de la surface traitée ;
– Les solvants inclus dans le nettoyant lui permettent de pénétrer facilement et rapidement dans les pores et les microfissures de la surface, offrant un nettoyage en profondeur et complet ;
– Ne laisse aucune tache, aucune trace, aucune trace.
Application :
vaporiser 9668 MANNOL Tar Remover sur la surface à nettoyer et laisser agir un certain temps (3-5 minutes). Essuyer avec un chiffon doux ou une éponge.
Attention : avant d’utiliser le produit sur des plastiques en polycarbonate et du verre acrylique, vérifier la compatibilité du produit avec ces matériaux sur une petite zone invisible de la surface.
Durée de conservation : 5 ans à compter de la date de', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450 ml', 25.0, 10, '9668-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00200 - MANNOL Energy Premium 5W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00200', 'MANNOL Energy Premium 5W-30 (5L)', 'mannol-energy-premium-5w-30-5l', 'Description

Caractéristiques du produit :
– Rendement énergétique élevé grâce à des propriétés antifriction optimales ;
– Un ensemble d’additifs très efficaces et une base synthétique assurent un démarrage à froid sûr dans toutes les conditions, réduisant ainsi considérablement l’usure au démarrage du moteur ;
– Grâce à ses excellentes propriétés de lavage et de dispersion et à sa plus grande stabilité à l’oxydation thermique, elle lutte efficacement contre tous les types de dépôts et maintient les pièces du moteur propres pendant tout l’intervalle entre les remplacements ;
– La présence de composants esters en combinaison avec des caractéristiques viscosité-température optimales garantit la plus grande résistance du film d’huile, ce qui offre d’excellentes propriétés anti-usure qui, combinées à une excellente pompabilité, augmentent considérablement la durée de vie du moteur même dans les conditions de fonctionnement les plus sévères ;
– Compatible avec tous les systèmes de post-trai', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 140.0, 10, 'TSC-00200-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', 'ACEA C2', NULL, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.31; BMW LL-04; RENAULT RN0700; RENAULT RN0710; FIAT 9.55535-S3; GM Dexos1; GM Dexos2; GM dexos1; GM dexos2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7720 - MANNOL Céramique 5W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moteur-auto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7720', 'MANNOL Céramique 5W-30 (5L)', 'mannol-ceramique-5w-30-5l', 'Description

Les molécules d’éther sont « magnétisées » sur les surfaces métalliques grâce à leur polarité intense et créent un film d’huile dense et très résistant, tandis que les microparticules de céramique lissent les irrégularités des surfaces de friction et dissipent efficacement la chaleur. Cela évite le contact direct entre les surfaces métalliques et l’usure des pièces détachées, même dans les conditions de fonctionnement les plus extrêmes. Le frottement à sec est éliminé lors des démarrages à froid (en particulier à des températures extrêmement basses) et du manque d’huile, minimisant ainsi l’usure du moteur au démarrage.
La couche limite formée pendant le fonctionnement présente les propriétés suivantes :
– résistance extrême à la pression – permettant au moteur de fonctionner sous des charges accrues sans effets indésirables ;
– excellentes propriétés anti-usure, anti-grippage et anti-friction, ce qui augmente considérablement la durée de vie du moteur et économise considér', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 160.0, 10, '7720-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SN', 'ACEA C3', NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 229.31; BMW LL-04; PSA B71 2290; PORSCHE C30; FIAT 9.55535-S3; GM dexos2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 2103-20 - MANNOL Hydro ISO 68 Long life (20L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2103-20', 'MANNOL Hydro ISO 68 Long life (20L)', 'mannol-hydro-iso-68-long-life-20l', 'Description

Caractéristiques du produit :
– Contient des additifs anti-usure, antioxydants, anticorrosion et antimousse.
– Possède de bonnes propriétés anti-usure qui minimisent l’usure des pièces liées aux pompes hydrauliques, garantissant ainsi leur longue durée de vie ;
– Des additifs nettoyants-dispersants modernes assurent une propreté idéale des pièces du système hydraulique, protégeant ainsi également les paires de précision de l’usure et prolongeant la durée de vie de l’équipement ;
– Une stabilité thermo-oxydante et thermique élevée réduit la formation de tous types de dépôts et de substances corrosives qui augmentent la fiabilité de l’opérabilité des sous-systèmes (vannes, distributeurs hydrauliques, etc.) et se distingue simultanément par une excellente capacité de filtration ;
– Grâce à de bonnes propriétés anticorrosion, elle protège les surfaces de tous les métaux et alliages utilisés contre l’effet corrosif des acides et de l’eau, ce qui réduit considérablement les coût', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '20L', 310.0, 10, '2103-20-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1368 - Liqui Moly Entretien intérieur voiture (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1368', 'Liqui Moly Entretien intérieur voiture (500ml)', 'liqui-moly-entretien-interieur-voiture-500ml', 'Description

Appli­ca­tion
1. Pulvériser le produit d’entretien intérieur voiture sur les pièces et surfaces à traiter.
2. Laisser agir en fonction du degré d’encrassement, mais sans attendre que cela sèche.
3. Passer ensuite sur la surface avec un chiffon humide propre et essuyer jusqu’à ce que cela soit sec. Si les salissures sont extrêmement coriaces, répéter l’opération jusqu’à ce que le résultat souhaité soit obtenu.
Remarque :
ne pas appliquer sur des surfaces échauffées ni en plein soleil !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 25.0, 10, '1368-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: N499HC - NEOLUX H7 Lampe Power Light Bleue 80 W 12 V PX26d
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bleu-light';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'N499HC', 'NEOLUX H7 Lampe Power Light Bleue 80 W 12 V PX26d', 'neolux-lampe-power-light-bleue-80-w-12-v-px26d', 'Description

Caractéristiques de la famille de produits

Température de couleur élevée avec une lumière blanche bleutée élégante
Lampe tout-terrain haute performance
Température de couleur : 5 000 K
Plus de puissance
Robuste et polyvalent

Avantages de la famille de produits

Aspect élégant et contraste élevé
Sur les terrains tout-terrain les plus difficiles
Meilleure visibilité
Un éclairage remarquable
Fabricant fiable

Conseils juridiques

Ces produits ne sont pas homologués ECE. Cela signifie qu’ils ne doivent pas être utilisés sur la voie publique dans le cadre d’une application extérieure. L’utilisation sur la voie publique entraîne l’annulation du permis d’exploitation et la perte de la couverture d’assurance. Plusieurs pays n’autorisent pas la vente et l’utilisation de ces produits. Veuillez contacter votre revendeur local.

Informations sur le produit



Type de produit (tout-terrain ou sur route)
Hors route




Application (Catégorie et produit spécifiques)
Lampe de phare halo', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 23.0, 10, 'N499HC-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: N499HC-2SCB - NEOLUX KIT H7 Power Light Bleue 80 W 12 V PX26d
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'kit-h7-blue';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'N499HC-2SCB', 'NEOLUX KIT H7 Power Light Bleue 80 W 12 V PX26d', 'neolux-kit-power-light-bleue-80-w-12-v-px26d', 'Description

Caractéristiques de la famille de produits

Température de couleur élevée avec une lumière blanche bleutée élégante
Lampe tout-terrain haute performance
Température de couleur : 5 000 K
Plus de puissance
Robuste et polyvalent

Avantages de la famille de produits

Aspect élégant et contraste élevé
Sur les terrains tout-terrain les plus difficiles
Meilleure visibilité
Un éclairage remarquable
Fabricant fiable

Conseils juridiques

Ces produits ne sont pas homologués ECE. Cela signifie qu’ils ne doivent pas être utilisés sur la voie publique dans le cadre d’une application extérieure. L’utilisation sur la voie publique entraîne l’annulation du permis d’exploitation et la perte de la couverture d’assurance. Plusieurs pays n’autorisent pas la vente et l’utilisation de ces produits. Veuillez contacter votre revendeur local.

Informations sur le produit



Type de produit (tout-terrain ou sur route)
Hors route




Application (Catégorie et produit spécifiques)
Lampe de phare halo', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 45.0, 10, 'N499HC-2SCB-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2102 - MANNOL Hydro ISO 46 Longue life (20L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2102', 'MANNOL Hydro ISO 46 Longue life (20L)', 'mannol-hydro-iso-46-longue-life-20l', 'Description



Caractéristiques du produit :
– Contient des additifs anti-usure, antioxydants, anticorrosion et antimousse.
– Possède de bonnes propriétés anti-usure qui minimisent l’usure des pièces liées aux pompes hydrauliques, garantissant ainsi leur longue durée de vie ;
– Des additifs nettoyants-dispersants modernes assurent une propreté idéale des pièces du système hydraulique, protégeant ainsi également les paires de précision de l’usure et prolongeant la durée de vie de l’équipement ;
– Une stabilité thermo-oxydante et thermique élevée réduit la formation de tous types de dépôts et de substances corrosives qui augmentent la fiabilité de l’opérabilité des sous-systèmes (vannes, distributeurs hydrauliques, etc.) et se distingue simultanément par une excellente capacité de filtration ;
– Grâce à de bonnes propriétés anticorrosion, elle protège les surfaces de tous les métaux et alliages utilisés contre l’effet corrosif des acides et de l’eau, ce qui réduit considérablement les co', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '20L', 310.0, 10, '2102-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: rupes 981.253 - RUPES Patin velcro 150mm 6+1 – 5/16 «
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'rupes';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'rupes 981.253', 'RUPES Patin velcro 150mm 6+1 – 5/16 «', 'rupes-patin-velcro-150mm-61-5-16', 'Ø mm : 150
Interface : velcro 
Perforations : 6+1
 Dureté : dur 
Outil : BR-TA 
Montage : 5-16″-M
Unité : 1
Réf.  : 981.253', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '150mm', 83.0, 10, 'rupes 981.253-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: kamoka 27M650 - KAMOKA balais essuie glace  (650mm)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'kamoka';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'kamoka 27M650', 'KAMOKA balais essuie glace  (650mm)', 'kamoka-balais-essuie-glace-650mm', 'Caractéristiques :

Côté d’assemblage : avant
Version de balai d’essuie-glace : Balai d’essuie-glace plat
Styling : avec spoiler
Longueur [mm] : 650', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '650mm', 20.0, 10, 'kamoka 27M650-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: kamoka 27M400 - KAMOKA balais essuie glace  (400mm)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'kamoka';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'kamoka 27M400', 'KAMOKA balais essuie glace  (400mm)', 'kamoka-balais-essuie-glace-400mm', 'Caractéristiques :

Côté d’assemblage : avant
Version de balai d’essuie-glace : Balai d’essuie-glace plat
Styling : avec spoiler
Longueur [mm] : 400', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400mm', 20.0, 10, 'kamoka 27M400-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: Kamoka 29004 - KAMOKA balais essuie glace arrière (Toyota)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'essuie-glaces';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'kamoka';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'Kamoka 29004', 'KAMOKA balais essuie glace arrière (Toyota)', 'kamoka-balais-essuie-glace-arriere-toyota-chr', 'Caractéristiques :

Côté d’assemblage : arrière
Longueur [mm] : 350
fabricant  : KAMOKA', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 20.0, 10, 'Kamoka 29004-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 64210CBN -HCB - OSRAM COOL BLUE INTENSE (NEXT GEN) H7
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moteur-auto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '64210CBN -HCB', 'OSRAM COOL BLUE INTENSE (NEXT GEN) H7', 'osram-cool-blue-intense-next-gen-h7', 'Description

Données techniques
Feux de jour halogène
Informations générales sur le produit
Référence de commande : 64210CBN
Données électriques
Puissance : 58 W
Tension nominale : 12.0 V
Puissance nominale : 55 W
Tension d’essai : 13,2 V
Données photométriques
Flux lumineux : 1500 lm
Flux lumineux tolérant : ±10 %
Temp. de couleur : up to 5000 K
Physical Attributes & Dimensions
Diamètre : 12.0 mm
Poids du produit : 12.20 g
Culot (désignation standard) : PX26d
Longueur : 59.0 mm
Durée de vie
Durée de vie B3 : 100 hr
Durée de vie Tc : 200 hr
Technologie : Lampe halogène
Catégorie ECE  : H7
Labels et agréments : Homologué E1', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 50.0, 10, '64210CBN -HCB-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2101 - BARDAHL Nettoyant injecteurs Essence (300ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2101', 'BARDAHL Nettoyant injecteurs Essence (300ml)', 'bardahl-nettoyant-injecteurs-essence-300ml', 'Description


Nettoie et protège l’ensemble du système d’injection.
Rétablit le débit des injecteurs.
Supprime trous à l’accélération et ralenti instable.
Evite la surconsommation de carburant.
Limite les émissions polluantes à l’échappement.
Simple d’utilisation : A ajouter dans votre réservoir lors de votre plein de carburant', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 30.0, 10, '2101-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1185 - BARDAHL Nettoyant injecteurs Diesel (300ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bardahl-injecteur-diesel';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1185', 'BARDAHL Nettoyant injecteurs Diesel (300ml)', 'bardahl-nettoyant-injecteurs-diesel-300ml', 'Description

Nettoie et protège l’ensemble du système d’injection.
Rétablit le débit des injecteurs.
Supprime trous à l’accélération et ralenti instable.
Evite la surconsommation de carburant.
Limite les émissions polluantes à l’échappement.
Simple d’utilisation : A ajouter dans votre réservoir lors de votre plein de carburant.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 30.0, 10, '1185-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1032 - BARDAHL Nettoyant prévidange (300ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bardahl';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1032', 'BARDAHL Nettoyant prévidange (300ml)', 'bardahl-nettoyant-previdange-300ml', 'Description


Dissout, décolle et maintient en suspension tout type de dépôts.
Nettoie l’ensemble du circuit moteur.
Evite l’usure prématurée du moteur.
Pour tout type d’huile et tout type de motorisation.
Simple d’utilisation : A ajouter dans votre huile avant votre vidange.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 20.0, 10, '1032-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: c 1370 - MANN-FILTER C 1370 Filtre à air
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bmw';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'c 1370', 'MANN-FILTER C 1370 Filtre à air', 'mann-filter-c-1370-filtre-a-air', 'Description




116i (E81/E87)
Filtre à air
N43 B16A
1596
90
122
09/07 → 02/09


116i (E81/E87)

 


 



Filtre à air
N45 B16, N45N B16
1596
85
115
09/04 → 11/11



 



316i (E90/E92)

 


 



Filtre à air
N45 B16/B16A, N45N B16A
1596
85
116
02/06 → 10/11


316i (E90/E92)
Filtre à air
N43 B16A
1596
90
122
09/07 → 06/13', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 50.0, 10, 'c 1370-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: c 1361 - MANN-FILTER C 1361 Filtre à air BMW
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'c 1361', 'MANN-FILTER C 1361 Filtre à air BMW', 'mann-filter-c-1361-filtre-a-air-bmw', 'Description




116i (E81/E87)

 









Filtre à air
N45 B16, N45N B16
1596
85
115
09/04 → 11/11


116i (E81/E87)
Filtre à air
N43 B20A
1995
90
122
02/09 → 09/12


118i (E81/E87)
Filtre à air
N46 B20
1995
95
129
12/04 → 09/12


118i (E81/E87/E88)
Filtre à air
N43 B20A
1995
105
143
03/07 → 09/12


118i (2.0 16V Gasolina)
Filtre à air
N 43 B 20 A
1995
100
136
05/07 → 06/11


118i (E88)
Filtre à air
N46 B20B
1995
100
136
09/08 → 12/13


120i (E81/E87)
Filtre à air
N46 B20, N42 B20 A
1995
110
150
09/04 → 02/07


120i (E81/E82/E87/E88)
Filtre à air
N46N B20, N43 B20 A
1995
125
170
03/07 → 09/12


120i (E81/E82/E87/E88)
Filtre à air
N43 B20 A
1995
120
163
03/07 → 06/11


120i (E81/E82/E87/E88)
Filtre à air

1995
115
156
03/07 → 09/12



 



316i (E90/E92)

 









Filtre à air
N45 B16/B16A, N45N B16A
1596
85
116
02/06 → 10/11


316i (E90/E92)
Filtre à air
N45N B16A
1596
95
129
03/07 →


318i (E90/E91)
Filtre à air
N46 B20
1995
95
129
09/05 → 08/07


318i (E90/E91)
Filtre à air
N43 B20', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 45.0, 10, 'c 1361-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1325 - BARDAHL Décrassant 5 en 1 Essence (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'bardahl-decrassant';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1325', 'BARDAHL Décrassant 5 en 1 Essence (500ml)', 'bardahl-decrassant-5-en-1-essence-500ml', 'Description

Le Décrassant moteur 5 en 1 (essence) est le fruit de nos dernières recherches. Sa composition aux multiples propriétés lui permet d’agir sur chaque organe du moteur de manière efficace et sans danger.
Simple et rapide d’utilisation.

Décrasse sans démontage : le turbo, la vanne EGR, le filtre à particules, les soupapes d’échappement et le pot catalytique.
Nettoie et protège le système d’injection, et rétablit le débit des injecteurs.
Limite les émissions polluantes et multiplie vos chances de réussite aux tests antipollution du contrôle technique.
Évite la surconsommation de carburant, la perte de puissance et le remplacement de pièces coûteuses.
Compatible avec tous les véhicules hybrides
Simple d’utilisation : A ajouter dans votre réservoir lors de votre plein de carburant.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 50.0, 10, '1325-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00218 - Eau Déminéralisée (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00218', 'Eau Déminéralisée (5L)', 'eau-demineralisee-5l', 'Eau Déminéralisée (5L)', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 5.0, 10, 'TSC-00218-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8369 - Nettoyant Radiateur (300ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8369', 'Nettoyant Radiateur (300ml)', 'nettoyant-radiateur-300ml', 'Description

Les dépôts s’amoncelant dans les systèmes de refroidissement et de chauffage entravent les échanges de chaleur et obturent les vannes thermostatiques et mécanismes de régulation. Des températures trop hautes dans le moteur entraînent un fonctionnement inefficace de ce dernier, une forte usure ainsi que des risques d’endommagement élevés. Le nettoyant radiateur LIQUI MOLY élimine les boues d’huile et dépôts calcaires. Il veille, en outre, à une température moteur et une sécurité de fonctionnement optimales. Ne contient pas d’acides ou de lessives alcalines agressives.
 

Appli­ca­tion
Ajouter le contenu à l’eau de refroidissement. Mettre ensuite le chauffage en route et, selon le degré d’encrassement, faire tourner le moteur à l’état chaud pendant 10 à 30 min. Évacuer à la fin du nettoyage le mélange nettoyant eau de refroidissement, rincer le système de refroidissement minutieusement à l’eau, puis le remplir de nouveau conformément aux consignes du fabricant. Le contenu (3', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 21.0, 10, '8369-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8370 - Anti-fuites pour radia­teurs (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8370', 'Anti-fuites pour radia­teurs (250ml)', 'anti-fuites-pour-radiateurs-250ml', 'Description

Pour tous les systèmes d’eau de refroidissement et de chauffage, avec et sans filtre à eau (à l’exception des liquides réfrigérants « low conductivity »). Également adapté aux radiateurs en aluminium et en matière plastique. 250 ml traitent jusqu’à 10 l de liquide réfrigérant.

étanche durablement et sûrement les fissures capillaires et les petites fuites
convient aux radiateurs en aluminium
pour une utilisation préventive
aucun effet indésirable sur la pompe à eau ou le circuit de chauffage
compatible avec les additifs pour liquide de refroidissement et antigels courants', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 19.0, 10, '8370-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1380 - Liqui Moly Antigel radiateur KFS 11 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1380', 'Liqui Moly Antigel radiateur KFS 11 (1L)', 'liqui-moly-antigel-radiateur-kfs-11-1l', 'Description


excellente protection anticorrosion
excellente protection contre les surchauffes
empêche le système de refroidissement de geler
empêche les dysfonctionnements
Appli­ca­tion
Nettoyer le système de refroidissement avec le nettoyant radiateur de LIQUI MOLY (réf. 3320). Ensuite, purger et rincer abondamment à l’eau. Remplir avec l’antigel radiateur KFS 11 et de l’eau, conformément au tableau des mélanges et aux consignes du fabricant. Pour ce faire, nous recommandons l’utilisation d’eau distillée. Selon la dureté de l’eau et la qualité, une dilution avec de l’eau du robinet est possible. Élimination conforme aux règlements locaux. Intervalle de vidange selon les prescriptions du fabricant. Stocker uniquement à l’état non dilué. Se mélange avec des liquides de refroidissement à base d’éthylène glycol.
TABLEAU DES MÉLANGES
Antigel     Eau     Protection jusqu’à
1 part                 2 parts       -20 °C
1 part                 1 part         -40 °C
2 parts               1 part', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 27.0, 10, '1380-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 325.0; MB 325.2; Porsche TL-774')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1381 - Liqui Moly Antigel radiateur KFS 12+ (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1381', 'Liqui Moly Antigel radiateur KFS 12+ (1L)', 'liqui-moly-antigel-radiateur-kfs-12-1l', 'Description




excellent effet nettoyant
excellente protection anticorrosion
convient parfaitement aux moteurs haute performance en aluminium
excellente protection contre les surchauffes
empêche le système de refroidissement de geler
empêche les dysfonctionnements
Exempt d’amines, de borates, de nitrites, de phosphates et de silicates





Appli­ca­tion
Nettoyer le système de refroidissement avec le nettoyant radiateur de LIQUI MOLY (réf. 3320). Ensuite, purger et rincer abondamment à l’eau. Remplir avec l’antigel radiateur KFS 12+ et de l’eau, conformément au tableau des mélanges et aux consignes du fabricant. Pour ce faire, nous recommandons l’utilisation d’eau distillée. Selon la dureté de l’eau et la qualité, une dilution avec de l’eau du robinet est possible. Élimination conforme aux règlements locaux. Intervalle de vidange selon les prescriptions du fabricant. Stocker uniquement à l’état non dilué. Se mélange avec des liquides de refroidissement à base d’éthylène glycol.
 
TABLE', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 27.0, 10, '1381-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 21139 - Liqui Moly Antigel radiateur KFS 13 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21139', 'Liqui Moly Antigel radiateur KFS 13 (1L)', 'liqui-moly-antigel-radiateur-kfs-13-1l', 'Description


excellente protection anticorrosion
excellente protection contre les surchauffes
non polluant
Exempt d’amines, de borates, de nitrites et de phosphates


Appli­ca­tion
Nettoyer le système de refroidissement avec le nettoyant radiateur de LIQUI MOLY (réf. 3320). Ensuite, purger et rincer abondamment à l’eau. Remplir avec l’antigel radiateur KFS 13 et de l’eau, conformément au tableau des mélanges et aux consignes du fabricant. Pour ce faire, nous recommandons l’utilisation d’eau distillée. Selon la dureté de l’eau et la qualité, une dilution avec de l’eau du robinet est possible. Élimination conforme aux règlements locaux. Intervalle de vidange selon les prescriptions du fabricant. Stocker uniquement à l’état non dilué. Se mélange avec des liquides de refroidissement à base d’éthylène glycol.
 
TABLEAU DES MÉLANGES
Antigel     Eau     Protection jusqu’à
1 part                 2 parts       -20 °C
1 part                 1 part         -35 °C
2 parts               1 part', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 27.0, 10, '21139-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: c 14 006 - MANN-FILTER C 14 006 Filtre à air
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'c 14 006', 'MANN-FILTER C 14 006 Filtre à air', 'mann-filter-c-14-006-filtre-a-air', 'Description




C 180 1.6 BlueEFFICIENCY (204.031/231/331)
Filtre à air
M 274.910
1595
115
156
08/12 → 12/14


C 180 K BlueEFFICIENCY (204.044/045/245)
Filtre à air
M 271.910
1597
115
156
04/08 → 12/09



 



E 180 (212.040)
Filtre à air
M 274.910 (1.6)
1595
115
156
03/13 → 12/15


E 200 (212)
Filtre à air
M 274.920
1991
135
184
02/13 → 12/16


E 250 (212)
Filtre à air
M 274.920
1991
155
211
02/13 → 12/16



 



E 200 (207)
Filtre à air
M 274.920
1991
135
184
04/13 → 12/16


E 250 (207)
Filtre à air
M 274.920
1991
155
211
04/13 → 12/16



 



GLC 200 Mild-Hybrid (253)
Filtre à air
M 274.920
1991
145
197
05/22 →


GLC 250 (253)
Filtre à air
M 274.920
1991
155
211
08/15 → 04/19


GLC 300 Mild-Hybrid (253)
Filtre à air
M 274.920
1991
190
258
05/22 →


GLC 350 e PLUG-IN HYBRID (253)
Filtre à air
M 274.920
1991
235
320
11/15 → 04/19



 



GLK 200 (204.934)
Filtre à air
M274.920
1991
135
184
09/13 → 08/15


GLK 250 (204.936/937)
Filtre à air
M274.920
1991
155
211
05/13 → 08/15', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 120.0, 10, 'c 14 006-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1581 - Liqui Moly Motorbike 4T Bike-Additive (125ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1581', 'Liqui Moly Motorbike 4T Bike-Additive (125ml)', 'liqui-moly-motorbike-4t-bike-additive-125ml', 'Description






élimine les résidus
augmente la sécurité du fonctionnement
pour les moteurs à carburateur et les moteurs à injection
rentabilité élevée
compatible avec catalyseur
optimise la puissance du moteur
empêche la corrosion dans le système de carburant
sans danger pour l’environnement
réduit le risque de cliquetis de combustion
normalise la consommation d’essence et les valeurs des gaz d’échappement
Appli­ca­tion
125 ml est adapté à 15 à 20 l de carburant. Ajouter à chaque plein de carburant.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '125ml', 23.0, 10, '1581-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 5981 - Liqui Moly Motorbike Graisse chaîne en aérosol, bl
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5981', 'Liqui Moly Motorbike Graisse chaîne en aérosol, blanche (400ml)', 'liqui-moly-motorbike-graisse-chaine-en-aerosol-blanche-400ml', 'Description




excellent pouvoir pénétrant
excellente adhérence
excellente résistance à l’eau froide, chaude et aux projections d’eau
excellente protection anticorrosion
capacité d’absorption de pression maximale
réduit les frottements et l’usure
stable à la centrifugation
réduit l’allongement de la chaîne
Appli­ca­tion
Avant l’utilisation, nous recommandons de nettoyer la chaîne avec Motorbike Nettoyant pour freins et chaînes (réf. 1602). Bien agiter avant l’emploi. Pulvériser ensuite sur la chaîne. Une fois que le solvant s’est évaporé, le lubrifiant acquiert sa consistance et son adhérence définitives.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 40.0, 10, '5981-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00227 - Liqui Moly Motorbike Nettoyant pour chaînes et fre
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00227', 'Liqui Moly Motorbike Nettoyant pour chaînes et freins (500ml)', 'liqui-moly-motorbike-nettoyant-pour-chaines-et-freins-500ml', 'Description




100 % sans chlore
élimine les taches d’huile et de graisse
faible tension superficielle
ne laisse pas de résidus
proportion élevée de principes actifs
évaporation contrôlée et sans résidus
détache les résidus de résine et de goudron
pouvoir de pénétration optimal
optimise l’application rentable

Appli­ca­tion
Placer un carton ou un chiffon sous les pièces à nettoyer. Pulvériser du nettoyant pour chaînes et freins Motorbike sur les chaînes sales et le laisser s’écouler. Après l’évaporation des solvants (env. 10 min.), la chaîne est propre, exempte de graisse et peut être traitée avec Motorbike Chain Lube (réf. 1508) ou Motorbike Lubrifiant chaîne moto blanc (réf. 1591). Ne pas vaporiser sur les matières plastiques.　Attention : vérifier avant l’application la compatibilité avec les étriers de frein et les composants laqués ainsi que les matières plastiques à un endroit caché.


Les autres infor­ma­tions
Ne pas mettre les pièces en caoutchouc à nettoyer dans des récipients', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 20.0, 10, 'TSC-00227-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7817 - Liqui Moly Motorbike Speed Shooter (80ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7817', 'Liqui Moly Motorbike Speed Shooter (80ml)', 'liqui-moly-motorbike-speed-shooter-80ml', 'Description




élimine les dépôts dans l’ensemble du système d’alimentation en carburant
assure une combustion optimale
bonne protection anticorrosion
rentabilité élevée
combustion sans résidus
améliore l’accélération
empêche le givrage du carburateur
exploitation élevée de la puissance du moteur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '80ml', 17.0, 10, '7817-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 5962 - Liqui Moly Motorbike Graisse pour chaînes (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5962', 'Liqui Moly Motorbike Graisse pour chaînes (250ml)', 'liqui-moly-motorbike-graisse-pour-chaines-250ml', 'Description




excellent pouvoir pénétrant
excellente adhérence
excellente résistance à l’eau froide, chaude et aux projections d’eau
excellente protection anticorrosion
capacité d’absorption de pression maximale
réduit les frottements et l’usure
stable à la centrifugation
réduit l’allongement de la chaîne
Appli­ca­tion
Avant l’utilisation, nous recommandons de nettoyer la chaîne avec le nettoyant de freins et de chaîne moto (réf. 1602). Pulvériser ensuite le produit Motorbike Chain Lube sur la chaîne. Une fois que le solvant s’est évaporé, le lubrifiant acquiert sa consistance et son adhérence définitives.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 32.0, 10, '5962-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00230 - Liqui Moly Top Tec 4300 5W-30  ( PSA )
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00230', 'Liqui Moly Top Tec 4300 5W-30  ( PSA )', 'liqui-moly-top-tec-4300-5w-30-psa', 'Description




excellente propreté du moteur
excellente protection anti-usure
grande stabilité au cisaillement
grande sécurité de lubrification
longue durée de vie du moteur
meilleur fonctionnement du moteur
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
réduit les émissions de gaz polluants
alimentation en huile rapide à basses températures
réduit la consommation de carburant
compatible avec turbocompresseur et catalyseur
l’efficacité maximale est obtenue si le produit est utilisé pur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 43.0, 5, 'TSC-00230-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 43.0, 5, 'TSC-00230-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', 'ACEA C2,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'MB 229.31; MB 229.51; Renault RN 0700; Renault RN 0710; Peugeot Citroen (PSA) B71 2290')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1580 - Liqui Moly Motorbike Oil Additive MOS2 (125ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1580', 'Liqui Moly Motorbike Oil Additive MOS2 (125ml)', 'liqui-moly-motorbike-oil-additive-mos2-125ml', 'Description




excellente filtrabilité
filtrable dans les filtres fins
convient aux embrayages à bain d’huile
rentabilité élevée
compatible avec catalyseur
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
réduit l’usure en rodage et en service
réduit la consommation d’huile et de carburant
Appli­ca­tion
Recommandation de dosage à chaque vidange d’huile ou, pour les moteurs à 2 temps, à chaque passage à la pompe.
Moteurs à 4 temps : 30 ml par litre d’huile moteur, ou 20 ml avec un embrayage à bain d’huile.
Moteurs à 2 temps :
-avec graissage séparé : 20 ml par litre d’huile 2 temps
-avec graissage par mélange : 10 ml pour 10 l de mélange.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '125ml', 35.0, 10, '1580-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 5929 - Liqui Moly Motorbike Gear Oil (GL4) 80W-90 Scooter
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5929', 'Liqui Moly Motorbike Gear Oil (GL4) 80W-90 Scooter (150ml)', 'liqui-moly-motorbike-gear-oil-gl4-80w-90-scooter-150ml', 'Description




excellente résistance au vieillissement
pouvoir d’absorption de pression élevé
réduit les bruits de roulement
minimise l’usure
n’attaque pas les matériaux d’étanchéité courants
bon comportement viscosité-température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '150ml', 20.0, 10, '5929-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '80W90', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 5952 - Liqui Moly Motorbike Fork Oil 10W medium (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-fourche';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5952', 'Liqui Moly Motorbike Fork Oil 10W medium (500ml)', 'liqui-moly-motorbike-fork-oil-10w-medium-500ml', 'Description


bonne protection anticorrosion
protection anti-usure élevée
empêche le gonflement des joints
empêche la formation de mousse
propriétés de conduite améliorées', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 40.0, 10, '5952-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 5950 - Liqui Moly Motorbike Fork Oil 5W light (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-fourche';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5950', 'Liqui Moly Motorbike Fork Oil 5W light (500ml)', 'liqui-moly-motorbike-fork-oil-5w-light-500ml', 'Description




protection anticorrosion durable
augmente la sécurité de conduite
protection anti-usure élevée
empêche le gonflement des joints
empêche la formation de mousse
réaction très sensible
utilisable pour des exigences d’huile de fourche allant jusqu’à SAE 2,5W au niveau de la viscosité et des caractéristiques correspondantes', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 40.0, 10, '5950-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, 'SAE 2', NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 5927 - Liqui Moly Motorbike Gear Oil 10W-30 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5927', 'Liqui Moly Motorbike Gear Oil 10W-30 (1L)', 'liqui-moly-motorbike-gear-oil-10w-30-1l', 'Description




excellente résistance au vieillissement
pouvoir d’absorption de pression élevé
réduit les bruits de roulement
minimise l’usure
très bonne compatibilité avec les joints
bon comportement viscosité-température




Appli­ca­tion
Respecter les prescriptions des fabricants de boîtes de vitesses. Se mélange à toutes les huiles de boîte de vitesses de marque. L’efficacité optimale n’est possible que si le produit est utilisé pur.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 10, '5927-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W30', 'API GL-4', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1516 - Liqui Moly Motorbike Gear Oil 75W-90 (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1516', 'Liqui Moly Motorbike Gear Oil 75W-90 (500ml)', 'liqui-moly-motorbike-gear-oil-75w-90-500ml', 'Description




excellente protection anti-usure
assure un passage facile des rapports
assure une moindre consommation de carburant
bonne protection anticorrosion
rendement élevé
réduit les bruits de la boîte de vitesses
vaste plage de viscosité
Appli­ca­tion
Respecter les prescriptions des fabricants de boîtes de vitesses. Se mélange à toutes les huiles de boîte de vitesses de marque. L’efficacité optimale n’est possible que si le produit est utilisé pur.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 40.0, 10, '1516-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W90', 'API GL-5', NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00237 - Motorbike Engine Flush Shooter (80ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00237', 'Motorbike Engine Flush Shooter (80ml)', 'motorbike-engine-flush-shooter-80ml', 'Description




utilisation simple
rentabilité élevée
compatible avec catalyseur
longue durée de vie du moteur
n’attaque pas les matériaux d’étanchéité courants
redonne au moteur sa puissance initiale
nettoyage et entretien
Appli­ca­tion
80 ml (1 bouteille) suffisent pour une quantité d’huile de 0,8 à 2 l. Ajouter à l’huile moteur chaude avant la vidange d’huile. Laisser ensuite tourner le moteur au ralenti pendant env. 10 min. En présence de boîtes de vitesses mécaniques, actionner pendant ce temps plusieurs fois le levier d’embrayage et le maintenir respectivement dans l’état tiré pendant quelques secondes. Ensuite, vidanger l’huile et remplacer le filtre.Compatible avec les huiles moteur du commerce. Convient aux motos avec embrayage à bain d’huile.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '80ml', 15.0, 10, 'TSC-00237-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3444 - Liqui Moly Motorbike MoS2 Shooter (20ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3444', 'Liqui Moly Motorbike MoS2 Shooter (20ml)', 'liqui-moly-motorbike-mos2-shooter-20ml', 'Description




augmente la régularité de marche
compatible avec catalyseur
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
miscible avec les huiles de boîte de vitesses courantes
réduit la consommation d’huile et de carburant
réduit l’usure
empêche les dysfonctionnements
minimise le frottement
Appli­ca­tion
Mélanger à chaque vidange d’huile pour les moteurs à 4 temps et lors de l’appoint d’huile ou de carburant pour les moteurs à 2 temps. Bien agiter avant usage ! Dosage : dans les moteurs à 4 temps ou dans la boîte de vitesses : 20 ml (1 tube) suffisent pour 1 l d’huile moteur. Pour les moteurs à 2 temps (lubrification par mélange) : 10 ml pour 10 l de mélange de carburant ou en cas de lubrification séparée 20 ml pour 1 l d’huile 2 temps.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '20ml', 15.0, 10, '3444-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7902 - MANNOL Racing + Ester 10W-60 (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7902', 'MANNOL Racing + Ester 10W-60 (4L)', 'mannol-racing-ester-10w-60-4l', 'Description

Caractéristiques du produit :
– La plage maximale de propriétés visco-température garantit les pleines performances du moteur à des charges thermiques très élevées, dans des conditions extrêmes d’événements sportifs et lors de surcharges ;
– Les composants de l’huile ester créent un film d’huile exceptionnellement résistant, qui offre la plus grande résistance à l’usure et des propriétés antifriction inégalées dans des conditions de fonctionnement extrêmes du moteur, y compris à la chaleur ;
– En raison de la présence de composants esters, l’huile acquiert la plus haute stabilité thermo-oxydative qui, combinée à d’excellentes propriétés de lavage et de dispersion, assure une propreté exceptionnelle des pièces du moteur pendant toute la période d’utilisation de l’huile ;
– Recommandée pour une utilisation dans les voitures de sport et de course ;
– Elle peut être utilisée pour les véhicules à kilométrage élevé ;
– Possède une résistance accrue au carburant de qualité variab', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 140.0, 10, '7902-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W60', 'API SN/CH-4', 'ACEA A3/B4', NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 229.1; PSA B71 2300; FIAT 9.55535-H3')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00240 - MANNOL Extreme 5W-40 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00240', 'MANNOL Extreme 5W-40 (5L)', 'mannol-extreme-5w-40-5l', 'Description

Caractéristiques du produit :
– La technologie ester et une base synthétique avec une gamme élargie de propriétés visco-température garantissent un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode urbain, en mode autoroute, ainsi que sous charge accrue (lors de la conduite sur des routes impraticables, en montée, en déplacement avec une remorque, charge maximale) et à des températures ambiantes élevées ;
– Idéale pour la conduite active et ne perd pas ses propriétés lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de la grande réserve d’indice alcalin (TBN) ;
– La base synthétique contenant des esters associée à un ensemble d’additifs moderne préserve les paramètres de puissance du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants de l’huile ester offrent d’excellentes propriétés anti-usure et antifriction grâce à la résistance e', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 125.0, 10, 'TSC-00240-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN/CH-4', 'ACEA A3/B4', 'JASO MA2', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; BMW LL-01; BMW LL-98; RENAULT RN0710; RENAULT RN0700; PSA B71 2296; PORSCHE A40; Porsche A40')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7908 - MANNOL Energy Premium 5W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7908', 'MANNOL Energy Premium 5W-30 (5L)', 'huile-moteur-mannol-energy-premium-5w-30-5l', 'Description

Caractéristiques du produit :
– Rendement énergétique élevé grâce à des propriétés antifriction optimales ;
– Un ensemble d’additifs très efficaces et une base synthétique assurent un démarrage à froid sûr dans toutes les conditions, réduisant ainsi considérablement l’usure au démarrage du moteur ;
– Grâce à ses excellentes propriétés de lavage et de dispersion et à sa plus grande stabilité à l’oxydation thermique, elle lutte efficacement contre tous les types de dépôts et maintient les pièces du moteur propres pendant tout l’intervalle entre les remplacements ;
– La présence de composants esters en combinaison avec des caractéristiques viscosité-température optimales garantit la plus grande résistance du film d’huile, ce qui offre d’excellentes propriétés anti-usure qui, combinées à une excellente pompabilité, augmentent considérablement la durée de vie du moteur même dans les conditions de fonctionnement les plus sévères ;
– Compatible avec tous les systèmes de post-trai', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 155.0, 10, '7908-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', 'ACEA C2', NULL, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.31; BMW LL-04; RENAULT RN0700; RENAULT RN0710; FIAT 9.55535-S3; GM Dexos1; GM Dexos2; GM dexos1; GM dexos2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7707 - MANNOL Energy Formula FR 5W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7707', 'MANNOL Energy Formula FR 5W-30 (5L)', 'mannol-energy-formula-fr-5w-30-5l', 'Description

Caractéristiques du produit :
– Les composants esters offrent d’excellentes propriétés anti-usure et anti-friction grâce à la durabilité exceptionnelle du film d’huile, qui, combinée à une excellente pompabilité, augmente considérablement la durée de vie du moteur même en mode « start-stop » ;
– Économise considérablement du carburant grâce à la viscosité à haute température réduite (HTHS) et aux excellentes propriétés anti-friction ;
– Protège efficacement la courroie de distribution contre l’usure, offre un indice de base total (TBN) accru et une excellente compatibilité avec les matériaux d’étanchéité, conformément aux exigences supplémentaires de FORD ;
– Permet un démarrage facile du moteur à basse température grâce à son excellente pompabilité et en particulier à sa maniabilité, ce qui réduit considérablement l’usure au démarrage du moteur ;
– Protège efficacement la courroie de distribution contre l’usure, offre un indice de base total (TBN) accru et une excellente', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 120.0, 10, '7707-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SN', 'ACEA A5/B5.', NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'FORD WSS-M2C913-D; FORD WSS-M2C913-C; FORD WSS-M2C913-B; FORD WSS-M2C913-A; Ford WSS-M2C913-C; FIAT 9.55535-G1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7730 - MANNOL Légende 504/507 0W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7730', 'MANNOL Légende 504/507 0W-30 (5L)', 'mannol-legende-504-507-0w-30-5l', 'Description

Propriétés :
– Grâce à sa base bi-synthétique et à son ensemble d’additifs spéciaux, elle possède d’excellentes propriétés anti-éraflures, anti-usure et antifriction, ce qui garantit un fonctionnement long et sans problème du système d’injecteurs-pompes ;
– Les composants esters de l’huile assurent une résistance exceptionnelle du film d’huile, qui, combinée à une excellente pompabilité, augmente considérablement la durée de vie du moteur même dans des conditions de conduite start-stop ;
– Grâce à ses excellentes propriétés détergentes-dispersantes et à sa stabilité thermo-oxydative la plus élevée, elle combat efficacement tous les types de dépôts et maintient les pièces du moteur propres pendant tout l’intervalle de remplacement ;
– Économise du carburant grâce à des propriétés anti-friction optimales et à une viscosité à haute température réduite à un taux de cisaillement élevé HTHS ;
– Une base bi-synthétique à faible viscosité (PAO+esters) et un ensemble d’additifs hau', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 205.0, 10, '7730-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W30', NULL, 'ACEA C3', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.31; PORSCHE C30Approbation')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7722 - MANNOL Longue life 508/509 0W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7722', 'MANNOL Longue life 508/509 0W-20 (5L)', 'mannol-longue-life-508-509-0w-20-5l', 'Description

Caractéristiques du produit :
– Grâce à la base synthétique et à un ensemble d’additifs spécial, elle possède d’excellentes propriétés anti-usure, anti-friction et extrême pression, ce qui garantit un fonctionnement long et sans problème de tous les systèmes du moteur, y compris les unités à turbine ;
– Grâce à ses excellentes propriétés de dispersion des détergents et à sa stabilité thermo-oxydative la plus élevée, elle combat efficacement tous les types de dépôts et maintient les pièces du moteur propres pendant tout l’intervalle de remplacement ;
– Permet d’économiser du carburant grâce à ses excellentes propriétés anti-friction ;
– La base entièrement synthétique à faible viscosité et l’ensemble d’additifs de dernière génération garantissent un démarrage facile du moteur à basse température grâce à des performances de démarrage et de pompage exceptionnelles, ce qui réduit considérablement l’usure au démarrage du moteur ;
– Il a une viscosité optimale sur une large plag', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 200.0, 10, '7722-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', 'API SP', 'ACEA C5-21', NULL, TRUE, FALSE, FALSE, TRUE, TRUE, FALSE, 'PORSCHE C20; Porsche C20')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7921 - MANNOL Légende Formule C5 0W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7921', 'MANNOL Légende Formule C5 0W-20 (5L)', 'mannol-legende-formule-c5-0w-20-5l', 'Description

Caractéristiques du produit :
– Grâce à la base bi-synthétique unique et aux esters qu’elle contient, elle possède d’excellentes propriétés anti-usure, antifriction et extrême pression, ce qui garantit un fonctionnement long et sans problème de tous les systèmes du moteur, y compris les unités turbo. Protège efficacement la chaîne de distribution de l’usure ;
– Élimine l’allumage prématuré incontrôlé du mélange air-carburant dans les moteurs à injection directe (Low Speed ​​Pre Ignition ou LSPI) ;
– Surpasse les huiles similaires de la catégorie SN en termes de propriétés détergentes et dispersantes et de stabilité thermo-oxydative, combat efficacement tous les types de dépôts et maintient les pièces du moteur propres pendant tout l’intervalle de vidange. Protège efficacement contre les dépôts à haute température sur le piston et le turbocompresseur, combat efficacement la formation de boues et de vernis ;
– Surpasse les huiles SN similaires en termes d’efficacité énergéti', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 140.0, 10, '7921-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', 'API SP', 'ACEA C5', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'FORD WSS-M2C947-A; FORD WSS-M2C947-B1; GM dexos; GM Dexos')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8106 - MANNOL Graisse universelle multi-usages  MP2 Ester
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8106', 'MANNOL Graisse universelle multi-usages  MP2 Ester (800g)', 'mannol-graisse-universelle-multi-usages-mp2-ester-800g', 'Description


Propriétés :
– La présence d’esters synthétiques augmente considérablement les propriétés anti-usure, anti-grippage et anti-friction de la graisse ;
– Conserve ses propriétés de performance de -30 °C à +120 °C, ce qui augmente la durée de vie des roulements ;
– Possède une bonne résistance à l’eau ;
– Protège de manière fiable contre la corrosion dans les environnements sales pendant de longues périodes de fonctionnement ;
– Excellente stabilité mécanique et à l’oxydation ;
– La consistance de la graisse reste constante pendant le stockage à long terme. Durée de conservation 5 ans à compter de la date de production.Application :
– Roulements à glissement et à rouleaux à grande vitesse ;
– Roulements de moteurs électriques et de générateurs électriques, pompes, etc. ;
– Unités de roulements fermées avec lubrification à vie ;
– Développé pour une utilisation dans tous les types de machines mobiles ainsi que pour les applications industrielles générales.
Respectez les instru', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '800g', 40.0, 10, '8106-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00247 - MANNOL Légende Ultra 0W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00247', 'MANNOL Légende Ultra 0W-20 (5L)', 'mannol-legende-ultra-0w-20-5l', 'Description

Caractéristiques du produit :
– Économie de carburant exceptionnelle grâce à une viscosité à haute température HTHS réduite et à des propriétés antifriction optimales ;
– Un ensemble d’additifs très efficaces et une base bi-synthétique à faible viscosité assurent un démarrage à froid fiable dans les conditions les plus sévères, réduisant ainsi considérablement l’usure au démarrage du moteur ;
– Grâce à ses excellentes propriétés de lavage et de dispersion et à la plus haute stabilité à l’oxydation thermique, elle lutte efficacement contre tous les types de dépôts et maintient les pièces du moteur propres pendant tout l’intervalle entre les remplacements ;
– Les composants de l’huile ester offrent d’excellentes propriétés anti-usure grâce à la résistance exceptionnelle du film d’huile, qui, combinée à une excellente pompabilité, augmente considérablement la durée de vie du moteur même en modes de conduite « start-stop » ;
– Pour les moteurs turbocompressés à injection direc', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 135.0, 10, 'TSC-00247-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', 'API SP', NULL, NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'FORD WSS-M2C947-A; FORD WSS-M2C947-B1; GM dexos')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1134 - Huile de boîte de vitesses haute perfor­mance (GL3
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1134', 'Huile de boîte de vitesses haute perfor­mance (GL3+) SAE 75W-80 (1L)', 'huile-de-boite-de-vitesses-haute-performance-gl3-sae-75w-80-1l', 'Description




excellente protection anti-usure
pour des intervalles de vidange d’huile extrêmement longs
excellente protection anticorrosion
pouvoir d’absorption de pression élevé
réduit les forces de passage des rapports
très bonne compatibilité avec les joints
réduit les bruits de la boîte de vitesses
bon comportement viscosité-température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 63.0, 10, '1134-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W80', 'API GL3', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9524 - Huile pour système hydrau­lique central (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9524', 'Huile pour système hydrau­lique central (1L)', 'huile-pour-systeme-hydraulique-central-1l', 'Description


excellent comportement aux températures basses
excellente protection anticorrosion
stabilité thermique maximale
stabilité au vieillissement optimale
bon comportement viscosité-température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 47.0, 10, '9524-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 345.0; Ford WSS-M2C; Fiat 9.55550-AG3')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 4421 - Huile de boîte hypoïde entiè­re­ment synthé­tique 
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'api-gl5';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4421', 'Huile de boîte hypoïde entiè­re­ment synthé­tique (GL5) LS SAE 75W-140 (1L)', 'huile-de-boite-hypoide-entierement-synthetique-gl5-ls-sae-75w-140-1l', 'Description




excellente protection anti-usure
excellente résistance au vieillissement
pour des intervalles de vidange d’huile allongés
excellente protection anticorrosion
pouvoir d’absorption de pression élevé
réduit les bruits de roulement
très bonne compatibilité avec les joints
bon comportement viscosité-température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 115.0, 10, '4421-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W140', 'API GL5', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00251 - Top Tec MTF 5200 75W-80
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00251', 'Top Tec MTF 5200 75W-80', '2185', 'Description






excellentes propriétés haute pression et de protection anti-usure
excellente stabilité à l’oxydation
stabilité au vieillissement optimale
réduit les forces de passage des rapports
permet de réaliser des économies de carburant et de réduire les émissions
comportement synchrone remarquable', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 50.0, 10, 'TSC-00251-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W80', 'API GL4', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Peugeot Citroen (PSA) B71 2330')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00252 - Top Tec MTF 5100 75W (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00252', 'Top Tec MTF 5100 75W (1L)', 'top-tec-mtf-5100-75w-1l', 'Description




excellente protection anti-usure
excellente stabilité au cisaillement
assure une moindre consommation de carburant
excellente stabilité à l’oxydation
excellente protection anticorrosion
bon comportement viscosité-température
excellent passage des rapports dans toutes les conditions de service
comportement synchrone remarquable', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 48.0, 10, 'TSC-00252-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API GL4', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Ford WSS-M2C; Fiat 9.55550-MZ6')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21359 - Top Tec MTF 5300 70W-75W (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21359', 'Top Tec MTF 5300 70W-75W (1L)', 'top-tec-mtf-5300-70w-75w-1l', 'Description




excellente protection anti-usure
excellente stabilité au cisaillement
assure une moindre consommation de carburant
excellente stabilité à l’oxydation
excellente protection anticorrosion
bon comportement viscosité-température
excellent passage des rapports dans toutes les conditions de service
comportement synchrone remarquable', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 70.0, 10, '21359-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API GL4', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3658 - Huile de boîte de vitesses (GL5) 75W-80 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3658', 'Huile de boîte de vitesses (GL5) 75W-80 (1L)', 'huile-de-boite-de-vitesses-gl5-75w-80-1l', 'Description




excellente protection anti-usure
excellente stabilité à l’oxydation
excellente protection anticorrosion
excellent comportement en friction
stabilité au vieillissement optimale
pour éliminer les problèmes de passage des rapports
bon comportement viscosité-température
très bonnes propriétés à basse température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 43.0, 10, '3658-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W80', 'API GL5', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Peugeot Citroen (PSA) B71 2330; Peugeot Citroen (PSA) B71 2315')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 2362 - Liqui Moly Top Tec 4310 0W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2362', 'Liqui Moly Top Tec 4310 0W-30 (5L)', 'liqui-moly-top-tec-4310-0w-30-5l', 'Description




excellente propreté du moteur
convient aux filtres à particules diesel
importante économie de carburant
excellentes propriétés haute pression et de protection anti-usure
excellente stabilité au cisaillement
excellente protection anticorrosion
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
lubrification rapide', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 225.0, 10, '2362-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W30', NULL, 'ACEA C2,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'Peugeot Citroen (PSA) B71 2312; Fiat 9.55535-GS1; Fiat 9.55535-DS1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00256 - Liqui Moly Top Tec 6200 0W-20
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00256', 'Liqui Moly Top Tec 6200 0W-20', 'liqui-moly-top-tec-6200-0w-20', 'Description




excellente protection anti-usure
augmente la sécurité du fonctionnement
excellent comportement au démarrage à froid
excellente stabilité à l’oxydation
économie de carburant maximale
compatible avec turbocompresseur et catalyseur
Réduit le temps de démarrage
Protection optimale en cas d’utilisation de carburant E10', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 60.0, 5, 'TSC-00256-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 5, 'TSC-00256-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', NULL, 'ACEA C5,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'VW 508 00; VW 509 00; Porsche C20; Ford WSS-M2C')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 4434 - Huile de boîte de vitesses haute perfor­mance (GL4
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4434', 'Huile de boîte de vitesses haute perfor­mance (GL4+) SAE 75W-90 (1L)', 'huile-de-boite-de-vitesses-haute-performance-gl4-sae-75w-90-1l', 'Description




excellente protection anti-usure
excellente résistance au vieillissement
excellente protection anticorrosion
excellente compatibilité avec les joints
pouvoir d’absorption de pression élevé
réduit les forces de passage des rapports
réduit les bruits de la boîte de vitesses
bon comportement viscosité-température
vaste plage de viscosité', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 58.0, 10, '4434-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W90', 'API GL4', NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'VW 501 50')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1407 - Huile hypoïde (GL4/5) TDL SAE 75W-90 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1407', 'Huile hypoïde (GL4/5) TDL SAE 75W-90 (1L)', 'huile-hypoide-gl4-5-tdl-sae-75w-90-1l', 'Description




augmente le pouvoir lubrifiant
excellente stabilité de la viscosité
réduit les pertes par frottement
assure le passage optimal des rapports
utilisation universelle
économie de carburant', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 10, '1407-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W90', 'API GL4', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3092 - Liqui Moly Liquide de frein DOT 5.1 (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3092', 'Liqui Moly Liquide de frein DOT 5.1 (250ml)', 'liqui-moly-liquide-de-frein-dot-5-1-250ml', 'Description




excellente compatibilité aux élastomères
excellent comportement aux températures basses
points d’ébullition sec et humide extrêmement élevés
excellente protection contre les bouchons de vapeur
miscible et compatible avec les liquides de frein synthétiques de grande qualitéassure un bon pouvoir lubrifiant de tous les composants mobiles du circuit de freinage hydraulique
haute stabilité thermique
bon comportement viscosité-température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 15.0, 10, '3092-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3089 - Liqui Moly Liquide de frein DOT 3 (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3089', 'Liqui Moly Liquide de frein DOT 3 (500ml)', 'liqui-moly-liquide-de-frein-dot-3-500ml', 'Description




excellente compatibilité aux élastomères
excellent comportement aux températures basses
points d’ébullition sec et humide extrêmement élevés
excellent pouvoir lubrifiant
stabilité thermique maximale
miscible et compatible avec les liquides de frein synthétiques de grande qualité
bon comportement viscosité-température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 17.0, 10, '3089-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3093 - Liquide de frein DOT 4 (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3093', 'Liquide de frein DOT 4 (500ml)', 'liquide-de-frein-dot-4-500ml', 'Description




excellente compatibilité aux élastomères
excellent comportement aux températures basses
points d’ébullition sec et humide extrêmement élevés
excellente protection contre les bouchons de vapeur
stabilité thermique maximale
miscible et compatible avec les liquides de frein synthétiques de grande qualité
assure un bon pouvoir lubrifiant de tous les composants mobiles du circuit de freinage hydraulique
bon comportement viscosité-température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 18.0, 10, '3093-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00262 - Mannol Liquide de frein DOT-5.1
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00262', 'Mannol Liquide de frein DOT-5.1', 'mannol-liquide-de-frein-dot-5-1', 'Description

Propriétés :
– La combinaison d’additifs spéciaux et d’une base synthétique résistante à la chaleur avec des propriétés élevées à basse température garantit des performances précises et un fonctionnement en douceur des systèmes de freinage et des systèmes de sécurité ;
– Assure un fonctionnement fiable du système de freinage à toutes les températures ambiantes en raison du point d’ébullition élevé (> 260 °C) et d’excellentes propriétés à basse température (-40 °C et moins), garantit la sécurité potentielle des unités du véhicule remplies de liquide DOT 5.1 à basse température ;
– Il a une viscosité réduite, par rapport au DOT 4, ce qui assure une vitesse de fonctionnement élevée des systèmes de freinage
– Stabilité chimique et thermique la plus élevée ;
– Excellentes propriétés viscosité-température et pouvoir lubrifiant ;
– Neutralise la condensation de l’eau et la formation de bulles de vapeur ;
– Compatible avec les élastomères ;
– Complètement neutre par rapport aux dé', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 15.0, 10, 'TSC-00262-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3003 - Mannol Liquide de frein  DOT-3 (0.5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3003', 'Mannol Liquide de frein  DOT-3 (0.5L)', 'mannol-liquide-de-frein-dot-3-0-5l', 'Description

– Assure un fonctionnement fiable du système de freinage à toutes les températures ambiantes grâce au point d’ébullition élevé (> 215 °C) et aux excellentes propriétés à basse température (jusqu’à -40 °C) ;
– Stabilité chimique et thermique élevée ;
– Bonne capacité de lubrification ;
– Bonnes propriétés viscosité-température ;
– Neutralise la formation de bulles de vapeur ;
– Neutralise efficacement la condensation d’eau ;
– Compatible avec les élastomères ;
– Totalement neutre par rapport aux différentes pièces du système de freinage.
Il est agressif envers les revêtements de peinture et de vernis.
Respectez les instructions du fabricant dans le mode d’emploi !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '0.5L', 11.0, 10, '3003-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3002 - Mannol Liquide de frein DOT-4 (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3002', 'Mannol Liquide de frein DOT-4 (450ml)', 'mannol-liquide-de-frein-dot-4-450ml', 'Description

Caractéristiques du produit :
– Contient de l’acide borique, qui neutralise complètement la condensation d’eau ;
– Assure un fonctionnement fiable du système de freinage à n’importe quelle température ambiante grâce au point d’ébullition élevé (> 245 °C) et aux excellentes propriétés à basse température (jusqu’à -40 °C) ;
– Possède la plus grande stabilité chimique et thermique ;
– Offre d’excellentes propriétés de lubrification et de viscosité-température ;
– Neutralise la formation de bulles de vapeur ;
– Compatible avec les élastomères ;
– Totalement inactif pour les pièces du système de freinage.
Agressif pour la peinture.
Suivez les instructions du fabricant dans le manuel d’instructions !
Couleur : incolore / marron clair.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 11.0, 10, '3002-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00265 - Liqui Moly Molygen New Gene­ra­tion 5W-30
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00265', 'Liqui Moly Molygen New Gene­ra­tion 5W-30', 'liqui-moly-molygen-new-generation-5w-30', 'Description




excellente propreté du moteur
excellente protection anti-usure
excellent comportement aux températures élevées et basses
excellente résistance au cisaillement
excellente sécurité de lubrification
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
réduit les frottements et l’usure
alimentation en huile rapide à basses températures
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 42.0, 5, 'TSC-00265-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 42.0, 5, 'TSC-00265-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', NULL, NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C; Fiat 9.55535-CR1; GM dexos1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00266 - Liqui Moly Super Leicht­lauf 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00266', 'Liqui Moly Super Leicht­lauf 10W-40', 'liqui-moly-super-leichtlauf-10w-40', 'Description




excellente propreté du moteur
excellente protection anti-usure
convient parfaitement aux véhicules ayant un kilométrage de plus de 100 000 km
grande stabilité au cisaillement
grande sécurité de lubrification
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
entretient les joints
régénère les joints
alimentation en huile rapide à basses températures
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 28.0, 3, 'TSC-00266-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 28.0, 3, 'TSC-00266-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 28.0, 3, 'TSC-00266-U-3')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN', 'ACEA A3,', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'MB 229.1; VW 501 01; VW 505 00; Renault RN 0700; Renault RN 0710; Peugeot Citroen (PSA) B71 2300; Fiat 9.55535-G2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00267 - Liqui Moly MoS2 Leicht­lauf 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00267', 'Liqui Moly MoS2 Leicht­lauf 10W-40', 'mos2-leichtlauf-10w-40', 'Description






excellente propreté du moteur
excellente protection anti-usure
convient à tous les moteurs à essence et diesel, avec et sans suralimentation par turbocompresseur (ATL)
bon comportement au démarrage à froid
excellentes propriétés de fonctionnement en cas d’urgence
aucune influence néfaste sur les catalyseurs
alimentation en huile rapide à basses températures
résiste au vieillissement, non sensible à la viscosité', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 35.0, 3, 'TSC-00267-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 35.0, 3, 'TSC-00267-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 3, 'TSC-00267-U-3')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SL', 'ACEA B4,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21332 - Liqui Moly Special Tec AA 5W-40 Diesel (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21332', 'Liqui Moly Special Tec AA 5W-40 Diesel (5L)', 'liqui-moly-special-tec-aa-5w-40-diesel-5l', 'Description




excellente protection anti-usure
excellent comportement aux températures élevées et basses
convient aux filtres à particules diesel
grande propreté du moteur
grande sécurité de lubrification
longue durée de vie du moteur
stabilité au vieillissement optimale
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 188.0, 10, '21332-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API CK-4', 'ACEA E9,', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'MB 228.31; Ford WSS-M2C')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7616 - Liqui Moly Special Tec AA 5W-30 (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7616', 'Liqui Moly Special Tec AA 5W-30 (4L)', 'liqui-moly-special-tec-aa-5w-30-4l', 'Description




excellente propreté du moteur
excellent comportement aux températures basses
assure une longue durée de vie
excellente sécurité de lubrification
grande stabilité au cisaillement
longue durée de vie du moteur
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
réduit les émissions de gaz polluants
alimentation en huile rapide à basses températures
réduit la consommation de carburant
compatible avec turbocompresseur et catalyseur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 137.0, 10, '7616-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', NULL, NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C; Fiat 9.55535-CR1; GM dexos1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 6739 - Liqui Moly Special Tec AA 0W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '6739', 'Liqui Moly Special Tec AA 0W-20 (5L)', 'liqui-moly-special-tec-aa-0w-20-5l', 'Description




excellente propreté du moteur
excellente protection anti-usure
excellent comportement aux températures élevées et basses
grande stabilité au cisaillement
grande sécurité de lubrification
longue durée de vie du moteur
meilleur fonctionnement du moteur
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
alimentation en huile rapide à basses températures
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 190.0, 10, '6739-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', 'API SP', NULL, NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C; Fiat 9.55535-CR1; GM dexos1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00271 - Liqui Moly Special Tec AA 5W-20
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00271', 'Liqui Moly Special Tec AA 5W-20', 'liqui-moly-special-tec-aa-5w-20', 'Description




excellente propreté du moteur
excellente protection anti-usure
excellent comportement aux températures basses
grande sécurité de lubrification
longue durée de vie du moteur
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
réduit les émissions de gaz polluants
alimentation en huile rapide à basses températures
réduit la consommation de carburant
compatible avec turbocompresseur et catalyseur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 42.0, 5, 'TSC-00271-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 42.0, 5, 'TSC-00271-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W20', 'API SP', NULL, NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C; Fiat 9.55535-CR1; GM dexos1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00272 - Liqui Moly Synthoil Race Tech GT1 10W-60
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00272', 'Liqui Moly Synthoil Race Tech GT1 10W-60', 'liqui-moly-synthoil-race-tech-gt1-10w-60', 'Description




excellente propreté du moteur
consommation d’huile extrêmement faible
perte par évaporation extrêmement faible
grande sécurité de lubrification
compatible avec catalyseur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
lubrification optimale dans des conditions d’utilisation extrêmes
alimentation en huile rapide à basses températures', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 55.0, 5, 'TSC-00272-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 55.0, 5, 'TSC-00272-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W60', 'API SN', 'ACEA A3,', NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00273 - Liqui Moly Special Tec F ECO 5W-20
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00273', 'Liqui Moly Special Tec F ECO 5W-20', 'liqui-moly-special-tec-f-eco-5w-20', 'Description




excellente propreté du moteur
excellente sécurité de lubrification
économie de carburant maximale
grande résistance au vieillissement
compatible avec catalyseur
stable à l’oxydation
alimentation en huile rapide à basses températures', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 5, 'TSC-00273-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 5, 'TSC-00273-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W20', 'API SN', 'ACEA C5,', NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Ford WSS-M2C913-C; Ford WSS-M2C')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8460 - Liqui Moly Special Tec LR 5W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8460', 'Liqui Moly Special Tec LR 5W-20 (5L)', 'liqui-moly-special-tec-lr-5w-20-5l', 'Description




excellente propreté du moteur
excellente protection anti-usure
excellent comportement aux températures élevées et basses
grande stabilité au cisaillement
grande sécurité de lubrification
longue durée de vie du moteur
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 166.0, 10, '8460-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W20', 'API SL', 'ACEA A1,', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21411 - Liqui Moly Top Tec 6600 0W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21411', 'Liqui Moly Top Tec 6600 0W-20 (5L)', 'liqui-moly-top-tec-6600-0w-20-5l', 'Description




excellente propreté du moteur
excellent comportement aux températures élevées et basses
excellente protection anti-usure
grande stabilité au cisaillement
grande sécurité de lubrification
longue durée de vie du moteur
meilleur fonctionnement du moteur
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 180.0, 10, '21411-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', 'API SP', 'ACEA C5,', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C; Fiat 9.55535-GSX')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20632 - Liqui Moly Special Tec V 0W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20632', 'Liqui Moly Special Tec V 0W-20 (5L)', 'liqui-moly-special-tec-v-0w-20-5l', 'Description




excellente propreté du moteur
excellente résistance au vieillissement
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions
assure une puissance maximale du moteur
minimise le frottement', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 240.0, 10, '20632-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', 'API SP', 'ACEA C5,', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00277 - Liqui Moly Top Tec 4210 0W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00277', 'Liqui Moly Top Tec 4210 0W-30 (5L)', 'liqui-moly-top-tec-4210-0w-30-5l', 'Description




excellente propreté du moteur
augmente la durée de vie
excellentes propriétés haute pression et de protection anti-usure
économie de carburant maximale
lubrification optimale dans toutes les conditions de service
compatible avec filtre à particules et catalyseur
réduit les émissions de gaz polluants
alimentation en huile rapide à basses températures
compatible avec turbocompresseur
minimise le frottement', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 230.0, 10, 'TSC-00277-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W30', NULL, 'ACEA C3,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'VW 504 00; VW 507 00; Porsche et; Porsche C30')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21217 - Liqui Moly Top Tec 6300 0W-20 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21217', 'Liqui Moly Top Tec 6300 0W-20 (5L)', 'liqui-moly-top-tec-6300-0w-20-5l', 'Description




excellente propreté du moteur
excellent comportement aux températures élevées et basses
excellente protection anti-usure
grande stabilité au cisaillement
grande sécurité de lubrification
longue durée de vie du moteur
meilleur fonctionnement du moteur
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 225.0, 10, '21217-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', 'API SN', 'ACEA C5,', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00279 - Liqui Moly Top Tec 6100 0W-30
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00279', 'Liqui Moly Top Tec 6100 0W-30', 'liqui-moly-top-tec-6100-0w-30', 'Description




excellente protection anti-usure
consommation d’huile extrêmement faible
excellent comportement au démarrage à froid
économie de carburant maximale
grande propreté du moteur
compatible avec turbocompresseur et catalyseur
assure une puissance maximale du moteur
Très bonne stabilité thermique
Contient une proportion nettement réduite de substances formant des cendres
les composants du moteur restent propres et bénéficient d’une excellente protection
Assure une longue durée de vie du moteur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 46.0, 5, 'TSC-00279-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 46.0, 5, 'TSC-00279-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W30', 'API SP', 'ACEA C2,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00280 - Liqui Moly Special Tec F 0W-30
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00280', 'Liqui Moly Special Tec F 0W-30', 'liqui-moly-special-tec-f-0w-30', 'Description




excellente propreté du moteur
excellente protection anti-usure
convient aux filtres à particules diesel
excellent comportement au démarrage à froid
économie de carburant maximale
grande résistance au vieillissement
alimentation en huile rapide à basses températures
compatible avec turbocompresseur et catalyseur
optimale pour les systèmes de démarrage-arrêt automatiques', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 57.0, 5, 'TSC-00280-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 57.0, 5, 'TSC-00280-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W30', 'API SN', 'ACEA C2,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'Ford WSS-M2C')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7530 - Liqui Moly Special Tec AA 5W-30 (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7530', 'Liqui Moly Special Tec AA 5W-30 (5L)', 'liqui-moly-special-tec-aa-5w-30-5l', 'Description




excellente propreté du moteur
excellent comportement aux températures basses
assure une longue durée de vie
excellente sécurité de lubrification
grande stabilité au cisaillement
longue durée de vie du moteur
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
réduit les émissions de gaz polluants
alimentation en huile rapide à basses températures
réduit la consommation de carburant
compatible avec turbocompresseur et catalyseur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 145.0, 10, '7530-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', NULL, NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C; Fiat 9.55535-CR1; GM dexos1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00282 - Liqui Moly Special Tec F 5W-30  (FORD)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00282', 'Liqui Moly Special Tec F 5W-30  (FORD)', 'liqui-moly-special-tec-f-5w-30-ford', 'Description




grande propreté du moteur
grande stabilité au cisaillement
grande sécurité de lubrification
stabilité au vieillissement optimale
alimentation en huile rapide à basses températures
compatible avec turbocompresseur et catalyseur
permet de réaliser des économies de carburant et de réduire les émissions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 45.0, 5, 'TSC-00282-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 5, 'TSC-00282-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SL', 'ACEA A5,', NULL, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Ford WSS-M2C')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 2322 - Liqui Moly Top Tec 4400 5W-30 (5L) RENAULT
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2322', 'Liqui Moly Top Tec 4400 5W-30 (5L) RENAULT', 'liqui-moly-top-tec-4400-5w-30-5l-renault', 'Description




excellente propreté du moteur
excellente protection anti-usure
assure une longue durée de vie
grande stabilité au cisaillement
longue durée de vie du moteur
meilleur fonctionnement du moteur
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
alimentation en huile rapide à basses températures
réduit la consommation d’huile et de carburant
compatible avec turbocompresseur et catalyseur
l’efficacité maximale est obtenue si le produit est utilisé pur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 190.0, 10, '2322-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', NULL, 'ACEA C4,', NULL, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, 'MB 226.51; MB 229.51; Renault RN 0720')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21404 - Liqui Moly Top Tec 4410 5W-30  5L ( RENAULT )
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21404', 'Liqui Moly Top Tec 4410 5W-30  5L ( RENAULT )', 'liqui-moly-top-tec-4410-5w-30-5l-renault', 'Description




excellente propreté du moteur
excellentes propriétés haute pression et de protection anti-usure
assure une moindre consommation de carburant
excellente sécurité de lubrification
stabilité au vieillissement optimale
lubrification rapide
compatible avec turbocompresseur et catalyseur
empêche la formation de dépôts', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 150.0, 10, '21404-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', NULL, 'ACEA C3,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'Renault RN 0710')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00285 - Top Tec 4200 5W-30 New Generation
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00285', 'Top Tec 4200 5W-30 New Generation', 'top-tec-4200-5w-30-new-generation', 'Description

Huile moteur légère haute technologie à base de technologie de synthèse. Offre une excellente protection contre l’usure, réduit la consommation d’huile et de carburant, et assure une lubrification intégrale rapide du moteur. Selon les prescriptions du constructeur, des intervalles jusqu’à 30 000 ou 50 000 km sont possibles ou jusqu’à 2 ans, si le nombre de kilomètres parcourus est réduit.

Pour moteurs essence et diesel remplissant les normes antipollution Euro 4, Euro 5 et Euro 6 (y compris la technologie FSI, common rail, injecteur-pompe). Convient tout particulièrement aux véhicules fonctionnant au gaz (GNV/GPL) et aux véhicules avec filtre à particules diesel (DPF), également en cas de postéquipement. Exception : moteurs TDI R5 et V10 avant l’année de construction 06.2006. Compatible avec catalyseur et turbocompresseur.

Spécifications / Homologations
ACEA C3, API SP, BMW Longlife-04, MB-Approval 229.31, MB-Approval 229.51, MB-Approval 229.52, Opel OV 040 1547 – G30 /', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 46.0, 5, 'TSC-00285-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 46.0, 5, 'TSC-00285-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', 'ACEA C3,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'VW 504 00; VW 507 00; Porsche C30')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00286 - Liqui Moly Top Tec 4600 5W-30
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00286', 'Liqui Moly Top Tec 4600 5W-30', 'liqui-moly-top-tec-4600-5w-30', 'Description




excellente propreté du moteur
convient particulièrement aux véhicules avec filtre à particules diesel
excellente protection anti-usure
grande stabilité au cisaillement
grande sécurité de lubrification
longue durée de vie du moteur
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale
pression d’huile optimale dans toutes les conditions de service
réduit les émissions de gaz polluants
alimentation en huile rapide à basses températures
réduit la consommation de carburant
compatible avec turbocompresseur et catalyseur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 5, 'TSC-00286-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 5, 'TSC-00286-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', 'ACEA C2,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'VW 505 00; VW 505 01; Ford WSS-M2C; GM dexos2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00287 - Liqui Moly Top Tec 4110 5W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00287', 'Liqui Moly Top Tec 4110 5W-40', 'liqui-moly-top-tec-4110-5w-40', 'Description




excellente propreté du moteur
excellentes propriétés haute pression et de protection anti-usure
excellente sécurité de lubrification
stabilité au vieillissement optimale
lubrification rapide
réduit la consommation de carburant
compatible avec turbocompresseur et catalyseur
empêche la formation de dépôts', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 36.0, 5, 'TSC-00287-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 36.0, 5, 'TSC-00287-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN', 'ACEA C3,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'MB 226.5; VW 511 00; Renault RN 0700; Renault RN 0710; Porsche C40')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00288 - Liqui Moly Top Tec 4100 5W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00288', 'Liqui Moly Top Tec 4100 5W-40', 'liqui-moly-top-tec-4100-5w-40', 'Description




excellente propreté du moteur
grande stabilité au cisaillement
grande sécurité de lubrification
longue durée de vie du moteur
meilleur fonctionnement du moteur
miscible avec les huiles moteur courantes
pression d’huile optimale dans toutes les conditions de service
alimentation en huile rapide à basses températures
compatible avec turbocompresseur et catalyseur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 37.0, 5, 'TSC-00288-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 37.0, 5, 'TSC-00288-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SN', 'ACEA C3,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'VW 505 00; VW 505 01; Renault RN 0700; Renault RN 0710; Porsche A40; Ford WSS-M2C; Fiat 9.55535-H2; Fiat 9.55535-M2; Fiat 9.55535-S2; GM dexos2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00289 - Leicht­lauf High Tech 5W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00289', 'Leicht­lauf High Tech 5W-40', 'leichtlauf-high-tech-5w-40', 'Description

Utilisable pour les véhicules à essence et véhicules diesel sans filtre à particules diesel. Huile moteur antifriction moderne de haut de gamme pour moteurs essence et diesel sans filtre à particules diesel. Cette huile moteur issue de la combinaison d’huiles de base non conventionnelles, provenant d’une technologie de synthèse, et d’additifs ultramodernes réduit la consommation d’huile et de carburant, et assure une lubrification rapide et intégrale du moteur. Suivant les directives du constructeur, il est possible d’obtenir des intervalles de vidange d’huile allant jusqu’à 40 000 km.
 
Huile toutes saisons pour les moteurs essence et diesel modernes avec technique multi-soupapes et suralimentation par turbocompresseur ainsi qu’avec et sans refroidissement par air de suralimentation (LLK). Convient spécialement à de longs intervalles de vidange d’huile et aux moteurs fortement sollicités. Compatible avec turbo et catalyseur.



Spécifications / Homologations
ACEA A3, ACEA', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 35.0, 3, 'TSC-00289-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 35.0, 3, 'TSC-00289-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 3, 'TSC-00289-U-3')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SP', 'ACEA A3,', NULL, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, 'VW 502 00; VW 505 00; Renault RN 0700; Renault RN 0710; Peugeot Citroen (PSA) B71 2296; Peugeot Citroen (PSA) B71 2294; Porsche A40; Fiat 9.55535-H2; Fiat 9.55535-M2; Fiat 9.55535-N2; Fiat 9.55535-Z2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 4414 - MANNOL Pro Cool prêt à l’emploi (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4414', 'MANNOL Pro Cool prêt à l’emploi (1L)', 'mannol-pro-cool-pret-a-lemploi-1l', 'Description

Caractéristiques du produit :
– Il assure une protection renforcée et stable des métaux et alliages (laiton, cuivre, acier allié traité, fonte, aluminium et ses alliages) contre toutes les formes de corrosion et empêche la corrosion à haute température des surfaces en aluminium des moteurs modernes pendant toute la durée de vie de la solution ;
– Le paquet d’additifs non organiques protège immédiatement la surface et la partie organique commence à agir uniquement lorsque des sources de corrosion apparaissent, ce qui permet d’obtenir une protection maximale dès le début de l’utilisation et de prolonger la durée de vie du moteur ;
– Il a une bonne stabilité thermique. Il protège contre la formation de dépôts ;
– Il a une excellente conductivité thermique et une résistance à la formation de mousse et à la cavitation, qui est stable pendant toute la durée de vie de la solution ;
– Il est neutre pour les inserts et les tuyaux, compatible avec tous les types de pièces en caoutch', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 0.0, 10, '4414-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8303 - MANNOL Huile de fourche 10W (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-fourche';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8303', 'MANNOL Huile de fourche 10W (1L)', 'mannol-huile-de-fourche-10w-1l', 'Description

Propriétés :
– Réduit efficacement les vibrations fourche-ressort, empêchant le véhicule de basculer, garantissant le meilleur comportement de conduite possible du véhicule ;
– Le package d’additifs spécial et la base synthétique assurent un faible coefficient de frottement, ce qui facilite le glissement facile et fluide des composants de la fourche et réduit les interférences avec leur mouvement mutuel ;
– La base synthétique à indice de viscosité élevé assure un effet d’amortissement constant sur une large plage de températures et dans toutes les conditions de fonctionnement ;
– Possède d’excellentes propriétés lubrifiantes et anti-usure, qui réduisent l’usure des composants de la fourche, prolongeant ainsi leur durée de vie ;
– Neutre pour les matériaux d’étanchéité, empêche à la fois le gonflement et le durcissement ;
– Possède d’excellentes propriétés anti-mousse ;
– Des inhibiteurs très efficaces offrent d’excellentes propriétés anticorrosion.
Destiné à être utilisé', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 37.0, 10, '8303-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00292 - Motorbike 4T Synth 5W-40 Street Race
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00292', 'Motorbike 4T Synth 5W-40 Street Race', 'motorbike-4t-synth-5w-40-street-race', 'Description




excellente protection anti-usure
excellente stabilité au cisaillement
assure une moindre consommation d’huile
convient parfaitement aux embrayages à bain d’huile
grande propreté du moteur
compatible avec catalyseur
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 50.0, 5, 'TSC-00292-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 50.0, 5, 'TSC-00292-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', 'API SP', NULL, 'JASO MA2', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00293 - Motorbike HD Synth 20W-50 Street
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00293', 'Motorbike HD Synth 20W-50 Street', 'motorbike-hd-synth-20w-50-street', 'Description


excellente protection anti-usure
excellente protection anticorrosion
grande propreté du moteur
résiste au vieillissement, non sensible à la viscosité
résistance extrême aux températures élevées', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 40.0, 5, 'TSC-00293-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 5, 'TSC-00293-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '20W50', 'API SP', NULL, 'JASO MA2', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00294 - Motorbike 4T 20W-50 Basic Street
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00294', 'Motorbike 4T 20W-50 Basic Street', 'motorbike-4t-20w-50-basic-street', 'Description




assure une moindre consommation d’huile
convient parfaitement aux embrayages à bain d’huile
grande propreté du moteur
grande sécurité de lubrification
protection anti-usure élevée
compatible avec catalyseur
miscible avec les huiles de boîte de vitesses courantes', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 29.0, 5, 'TSC-00294-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 29.0, 5, 'TSC-00294-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '20W50', 'API SP', NULL, 'JASO MA2', FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1502 - Motorbike 4T Synth 10W-50 Street Race (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1502', 'Motorbike 4T Synth 10W-50 Street Race (1L)', 'motorbike-4t-synth-10w-50-street-race-1l', 'Description




excellente protection anti-usure
assure une moindre consommation d’huile
convient parfaitement aux embrayages à bain d’huile
grande stabilité au cisaillement
compatible avec catalyseur
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 48.0, 10, '1502-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W50', 'API SP', NULL, 'JASO MA2', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20832 - Motorbike 4T 10W-40 Scooter MB (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20832', 'Motorbike 4T 10W-40 Scooter MB (1L)', 'motorbike-4t-10w-40-scooter-mb-1l', 'Description


assure une moindre consommation d’huile
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service
réduit les frottements et l’usure
assure une puissance maximale du moteur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 28.0, 10, '20832-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SP', NULL, 'JASO MB', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21719 - Motorbike Molygen 4T 10W-40 Scooter (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21719', 'Motorbike Molygen 4T 10W-40 Scooter (1L)', 'motorbike-molygen-4t-10w-40-scooter-1l', 'Description




excellente propreté du moteur
excellente protection anti-usure
assure une moindre consommation d’huile
compatible avec catalyseur
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service
assure une puissance maximale du moteur', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, '21719-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN', NULL, 'JASO MB', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 2526 - Motorbike 4T 10W-30 Street (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2526', 'Motorbike 4T 10W-30 Street (1L)', 'motorbike-4t-10w-30-street-1l', 'Description




excellente propreté du moteur
excellente stabilité au cisaillement
assure une moindre consommation d’huile
convient parfaitement aux embrayages à bain d’huile
protection anti-usure élevée
compatible avec catalyseur
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, '2526-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W30', 'API SP', NULL, 'JASO MA2', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00299 - Motorbike 4T Synth 10W-60 Street Race
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00299', 'Motorbike 4T Synth 10W-60 Street Race', 'motorbike-4t-synth-10w-60-street-race', 'Description




excellente propreté du moteur
augmente le pouvoir lubrifiant
excellente protection anti-usure
convient aux embrayages à bain d’huile
faible perte par évaporation
assure une moindre consommation d’huile
compatible avec catalyseur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 50.0, 5, 'TSC-00299-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 50.0, 5, 'TSC-00299-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W60', 'API SP', NULL, 'JASO MA2', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20754 - Motorbike 4T Synth 10W-40 Street Race (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20754', 'Motorbike 4T Synth 10W-40 Street Race (4L)', 'motorbike-4t-synth-10w-40-street-race-4l', 'Description




excellente propreté du moteur
augmente le pouvoir lubrifiant
excellente protection anti-usure
convient aux embrayages à bain d’huile
faible perte par évaporation
assure une moindre consommation d’huile
compatible avec catalyseur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 160.0, 10, '20754-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SP', NULL, 'JASO MA2', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20753 - Motorbike 4T Synth 10W-40 Street Race (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20753', 'Motorbike 4T Synth 10W-40 Street Race (1L)', 'motorbike-4t-synth-10w-40-street-race-1l', 'Description




excellente propreté du moteur
augmente le pouvoir lubrifiant
excellente protection anti-usure
convient aux embrayages à bain d’huile
faible perte par évaporation
assure une moindre consommation d’huile
compatible avec catalyseur
miscible avec les huiles moteur courantes
stabilité au vieillissement optimale', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 10, '20753-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SP', NULL, 'JASO MA2', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3058 - Motorbike 4T 15W-50 Offroad (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3058', 'Motorbike 4T 15W-50 Offroad (4L)', 'motorbike-4t-15w-50-offroad-4l', 'Description




excellente propreté du moteur
assure une moindre consommation d’huile
convient parfaitement aux embrayages à bain d’huile
grande stabilité au cisaillement
protection anti-usure élevée
compatible avec catalyseur
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 105.0, 10, '3058-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '15W50', 'API SP', NULL, 'JASO MA2', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1619 - Motorbike 2T Basic Scooter (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1619', 'Motorbike 2T Basic Scooter (1L)', 'motorbike-2t-basic-scooter-1l', 'Description


garantit la propreté des bougies d’allumage
bonne protection anticorrosion
protection anti-usure élevée
automiscible
empêche la formation de dépôts', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 28.0, 10, '1619-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API TC', NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 1243 - Liqui Moly Motorbike 4T 10W-40 Street (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1243', 'Liqui Moly Motorbike 4T 10W-40 Street (4L)', 'liqui-moly-motorbike-4t-10w-40-street-4l', 'Description




excellente propreté du moteur
assure une moindre consommation d’huile
convient parfaitement aux embrayages à bain d’huile
grande stabilité au cisaillement
protection anti-usure élevée
compatible avec catalyseur
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 120.0, 10, '1243-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SP', NULL, 'JASO MA2', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00305 - Liqui Moly Motorbike 4T 10W-40 Street (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00305', 'Liqui Moly Motorbike 4T 10W-40 Street (1L)', 'liqui-moly-motorbike-4t-10w-40-street-1l', 'Description




excellente propreté du moteur
assure une moindre consommation d’huile
convient parfaitement aux embrayages à bain d’huile
grande stabilité au cisaillement
protection anti-usure élevée
compatible avec catalyseur
stabilité au vieillissement optimale
lubrification optimale dans toutes les conditions de service', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 32.0, 10, 'TSC-00305-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SP', NULL, 'JASO MA2', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7204-4 - MANNOL 2-Temps Plus (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7204-4', 'MANNOL 2-Temps Plus (4L)', 'mannol-2-temps-plus-4l', 'Description

Caractéristiques du produit :
– Un ensemble d’additifs moderne et une base synthétique assurent un fonctionnement stable du moteur dans toutes les conditions de fonctionnement, y compris les températures et les charges élevées, empêchent la formation de dépôts de carbone, de laque et de suie sur les parois de la chambre de combustion, les pistons, les bouchons, les soupapes, le collecteur d’échappement et le tuyau d’échappement, empêchent les segments de piston de coller et de s’encrasser, prolongeant ainsi la durée de vie du moteur ;
– Une formule d’huile spéciale assure une combustion complète et sans fumée et empêche le pré-allumage ;
– Des additifs détergents spéciaux sans cendres maintiennent les pièces du moteur propres ;
– Elle forme instantanément un mélange très stable avec tous les types de carburant même à basse température ;
– Elle possède d’excellentes propriétés anticorrosion, anti-usure et antifriction, empêche l’usure et le grippage des parois des cylindres', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 90.0, 10, '7204-4-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7204-1 - MANNOL 2-Temps Plus (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7204-1', 'MANNOL 2-Temps Plus (1L)', 'mannol-2-temps-plus-1l', 'Description

Caractéristiques du produit :
– Un ensemble d’additifs moderne et une base synthétique assurent un fonctionnement stable du moteur dans toutes les conditions de fonctionnement, y compris les températures et les charges élevées, empêchent la formation de dépôts de carbone, de laque et de suie sur les parois de la chambre de combustion, les pistons, les bouchons, les soupapes, le collecteur d’échappement et le tuyau d’échappement, empêchent les segments de piston de coller et de s’encrasser, prolongeant ainsi la durée de vie du moteur ;
– Une formule d’huile spéciale assure une combustion complète et sans fumée et empêche le pré-allumage ;
– Des additifs détergents spéciaux sans cendres maintiennent les pièces du moteur propres ;
– Elle forme instantanément un mélange très stable avec tous les types de carburant même à basse température ;
– Elle possède d’excellentes propriétés anticorrosion, anti-usure et antifriction, empêche l’usure et le grippage des parois des cylindres', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 25.0, 10, '7204-1-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API TC', NULL, 'JASO FD', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7814-1 - MANNOL Moto 4 temps 10W-50 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7814-1', 'MANNOL Moto 4 temps 10W-50 (1L)', 'mannol-moto-4-temps-10w-50-1l', 'Description



Caractéristiques du produit :
– Un ensemble d’additifs spéciaux et une base synthétique assurent un coefficient de traction élevé dans les éléments de friction qui permettent d’éviter leur usure en raison de la prévention du dérapage et assurent un fonctionnement précis et fluide de l’embrayage lors du démarrage, de l’accélération et de la conduite à vitesse constante, permettant ainsi un changement de vitesse facile ;
– Grâce à sa base contenant des esters, elle possède des propriétés lubrifiantes, anti-usure et anti-éraflures supérieures qui réduisent la consommation de carburant, améliorent la puissance et la durée de vie du moteur. Elle assure une protection maximale contre l’usure du groupe cylindre-piston et de la commande des soupapes ;
– Créé à partir d’une base synthétique contenant des esters exceptionnellement stables et conçu pour des conditions de fonctionnement extrêmes, il présente une stabilité thermo-oxydative supérieure et une résistance aux température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, '7814-1-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W50', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00309 - MANNOL Moto 4 temps 10W-50 (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00309', 'MANNOL Moto 4 temps 10W-50 (4L)', 'mannol-moto-4-temps-10w-50-4l', 'Description



Caractéristiques du produit :
– Un ensemble d’additifs spéciaux et une base synthétique assurent un coefficient de traction élevé dans les éléments de friction qui permettent d’éviter leur usure en raison de la prévention du dérapage et assurent un fonctionnement précis et fluide de l’embrayage lors du démarrage, de l’accélération et de la conduite à vitesse constante, permettant ainsi un changement de vitesse facile ;
– Grâce à sa base contenant des esters, elle possède des propriétés lubrifiantes, anti-usure et anti-éraflures supérieures qui réduisent la consommation de carburant, améliorent la puissance et la durée de vie du moteur. Elle assure une protection maximale contre l’usure du groupe cylindre-piston et de la commande des soupapes ;
– Créé à partir d’une base synthétique contenant des esters exceptionnellement stables et conçu pour des conditions de fonctionnement extrêmes, il présente une stabilité thermo-oxydative supérieure et une résistance aux température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 110.0, 10, 'TSC-00309-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W50', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7832-4 - MANNOL Huile moteur 4 temps Powerbike 15W-50 (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7832-4', 'MANNOL Huile moteur 4 temps Powerbike 15W-50 (4L)', 'mannol-huile-moteur-4-temps-powerbike-15w-50-4l', 'Description

Caractéristiques du produit :
– Un ensemble d’additifs spéciaux et une base synthétique assurent un coefficient de traction élevé dans les éléments de friction qui permettent d’éviter leur usure en raison de la prévention du dérapage et assurent un fonctionnement précis et fluide de l’embrayage lors du démarrage, de l’accélération et du mouvement à vitesse constante, permettant ainsi un changement de vitesse facile ;
– Grâce à sa base contenant des esters, elle possède des propriétés lubrifiantes, anti-usure et anti-éraflures supérieures qui réduisent la consommation de carburant, améliorent la puissance et la durée de vie du moteur. Elle assure une protection maximale contre l’usure du groupe cylindre-piston et de la commande des soupapes ;
– Créé à partir d’une base synthétique contenant des esters exceptionnellement stable et conçu pour des conditions de fonctionnement extrêmes, il présente une stabilité thermo-oxydative supérieure et une résistance aux températures éle', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 100.0, 10, '7832-4-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '15W50', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7832-1 - MANNOL Huile moteur 4 temps Powerbike 15W-50 (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7832-1', 'MANNOL Huile moteur 4 temps Powerbike 15W-50 (1L)', 'mannol-huile-moteur-4-temps-powerbike-15w-50-1l', 'Description



Caractéristiques du produit :
– Un ensemble d’additifs spéciaux et une base synthétique assurent un coefficient de traction élevé dans les éléments de friction qui permettent d’éviter leur usure en raison de la prévention du dérapage et assurent un fonctionnement précis et fluide de l’embrayage lors du démarrage, de l’accélération et du mouvement à vitesse constante, permettant ainsi un changement de vitesse facile ;
– Grâce à sa base contenant des esters, elle possède des propriétés lubrifiantes, anti-usure et anti-éraflures supérieures qui réduisent la consommation de carburant, améliorent la puissance et la durée de vie du moteur. Elle assure une protection maximale contre l’usure du groupe cylindre-piston et de la commande des soupapes ;
– Créé à partir d’une base synthétique contenant des esters exceptionnellement stable et conçu pour des conditions de fonctionnement extrêmes, il présente une stabilité thermo-oxydative supérieure et une résistance aux températures é', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 33.0, 10, '7832-1-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '15W50', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7812-4 - MANNOL 4 temps moto 10W-40  (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7812-4', 'MANNOL 4 temps moto 10W-40  (4L)', 'mannol-4-temps-moto-10w-40-4l', 'Description

Caractéristiques du produit :
– Un ensemble d’additifs spéciaux et une base synthétique assurent un coefficient de traction élevé dans les éléments de friction qui permettent d’éviter leur usure en raison de la prévention du dérapage et assurent un fonctionnement précis et fluide de l’embrayage lors du démarrage, de l’accélération et de la conduite à vitesse constante, permettant ainsi un changement de vitesse facile ;
– Grâce à sa base contenant des esters, elle possède des propriétés lubrifiantes, anti-usure et anti-éraflures supérieures qui réduisent la consommation de carburant, améliorent la puissance et la durée de vie du moteur. Elle assure une protection maximale contre l’usure du groupe cylindre-piston et de la commande des soupapes ;
– Créé à partir d’une base synthétique contenant des esters exceptionnellement stables et conçu pour des conditions de fonctionnement extrêmes, il présente une stabilité thermo-oxydative supérieure et une résistance aux températures', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 75.0, 10, '7812-4-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN', NULL, 'JASO MA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7812 - MANNOL 4 temps moto 10W-40  (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7812', 'MANNOL 4 temps moto 10W-40  (1L)', 'mannol-4-temps-moto-10w-40-1l', 'Description



Caractéristiques du produit :
– Un ensemble d’additifs spéciaux et une base synthétique assurent un coefficient de traction élevé dans les éléments de friction qui permettent d’éviter leur usure en raison de la prévention du dérapage et assurent un fonctionnement précis et fluide de l’embrayage lors du démarrage, de l’accélération et de la conduite à vitesse constante, permettant ainsi un changement de vitesse facile ;
– Grâce à sa base contenant des esters, elle possède des propriétés lubrifiantes, anti-usure et anti-éraflures supérieures qui réduisent la consommation de carburant, améliorent la puissance et la durée de vie du moteur. Elle assure une protection maximale contre l’usure du groupe cylindre-piston et de la commande des soupapes ;
– Créé à partir d’une base synthétique contenant des esters exceptionnellement stables et conçu pour des conditions de fonctionnement extrêmes, il présente une stabilité thermo-oxydative supérieure et une résistance aux température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 27.0, 10, '7812-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN', NULL, 'JASO MA', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8107 - MANNOL EP-2 Multi-MoS2 Ester (800g)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8107', 'MANNOL EP-2 Multi-MoS2 Ester (800g)', 'mannol-ep-2-multi-mos2-ester-800g', 'Description

Propriétés :
– La présence d’esters synthétiques augmente considérablement les propriétés anti-usure, anti-grippage et anti-friction de la graisse ;
– Conserve ses propriétés de performance de -30 °C à +140 °C, ce qui augmente la durée de vie des roulements ;
– Possède une excellente adhérence aux surfaces métalliques. Forme un film lubrifiant solide pour prolonger la durée de vie des unités lubrifiées. Assure une lubrification limite efficace à hautes pressions et températures ;
– Grâce aux additifs EP utilisés, il résiste aux charges extrêmes et à fort impact. En cas de surchauffe accidentelle, les additifs en couches éliminent le grippage et le blocage ;
– Grâce à des additifs spéciaux antioxydants et anticorrosion, il protège de manière fiable les roulements et autres pièces contre la corrosion, même en cas de fonctionnement dans un environnement humide et sale ;
– Possède une bonne stabilité thermique, qui assure une résistance aux variations de température, et une st', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '800g', 40.0, 10, '8107-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9954 - MANNOL Octane Plus (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9954', 'MANNOL Octane Plus (450ml)', 'mannol-octane-plus-450ml', 'Description

Propriétés du produit :
– Selon la méthode de recherche, augmente l’indice d’octane de 3 à 6 unités (selon la qualité de l’essence). Permet l’utilisation d’essence avec un indice d’octane jusqu’à 6 unités inférieur à celui recommandé ;
– Protège les pièces du moteur contre les cognements, évitant ainsi des réparations coûteuses ;
– En raison de l’absence de détonation et de la combustion complète du carburant, la puissance du moteur augmente et la stabilité de la puissance est assurée dans tous les modes de son fonctionnement, y compris en surcharge. Un ralenti régulier est assuré. Réduit le bruit et les vibrations du moteur ;
– Possède d’excellentes propriétés détergentes, nettoie efficacement le système de carburant et en particulier les injecteurs (buses) et les soupapes des cendres, de la suie, du vernis et d’autres résidus non brûlés et empêche leur dépôt ultérieur. Réduit la cokéfaction des segments de piston, empêchant leur collage et l’augmentation de la consommati', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 45.0, 10, '9954-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9903 - MANNOL Additif boite de vitesse manuel (100ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9903', 'MANNOL Additif boite de vitesse manuel (100ml)', 'mannol-additif-boite-de-vitesse-manuel-100ml', 'Description

Propriétés :
– Modifie la structure superficielle des surfaces de friction, réduisant le coefficient de frottement et leur usure ;
– Neutre pour les joints d’étanchéité et les joints d’étanchéité ;
– N’affecte pas les propriétés de frottement des éléments de friction ;
– Réduit le niveau de bruit de la transmission manuelle ;
– Réduit l’échauffement des unités et les températures de pointe ;
– Assure un changement de vitesse en douceur et sans à-coups, même dans les boîtes de vitesses très usées.
Application : 
Ajouter à l’huile de transmission – se mélange automatiquement pendant le fonctionnement. Dosage : Un flacon de 100 ml pour 4 L d’huile.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '100ml', 15.0, 10, '9903-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8113 - MANNOL SAE 90 (4L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8113', 'MANNOL SAE 90 (4L)', 'mannol-sae-90-4l', 'Huile pour engrenages minérale à composition simple pour conditions de fonctionnement douces (faibles charges et vitesses de glissement).
Elle peut être recommandée pour la lubrification des équipements auxiliaires à installer dans des véhicules spéciaux (réducteurs de grues, mécanismes de camions poubelles, éléments de levage latéraux, etc.) lorsqu’ils fonctionnent à des températures non inférieures à – 18 °С.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 65.0, 10, '8113-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, 'SAE 90', NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00318 - MANNOL Hypoïde 80W-90 GL-4/GL-5 LS
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00318', 'MANNOL Hypoïde 80W-90 GL-4/GL-5 LS', 'mannol-hypoide-80w-90-gl-4-gl-5-ls', 'Description



Caractéristiques du produit :
– La base unique de la plus haute qualité avec une viscosité optimale dans une large plage de températures en combinaison avec un ensemble d’additifs de dernière génération en concentration élevée assure d’excellentes propriétés antifriction garantissant ainsi une économie de carburant significative ;
– Grâce à sa composition équilibrée, elle assure d’excellentes propriétés anti-usure et anti-éraflure supérieures qui prolongent considérablement la durée de vie prévue de l’équipement technique dans tous les modes de fonctionnement, même les plus extrêmes, dans une large plage de températures ambiantes. Le film d’huile a une résistance améliorée aux pressions et températures élevées ;
– Il empêche le blocage des différentiels et réduit l’usure des pistons. Il assure un fonctionnement fiable des différentiels autobloquants ;
– Il offre les propriétés requises à basse température qui assurent un démarrage suffisamment facile, une lubrification f', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 28.0, 5, 'TSC-00318-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 28.0, 5, 'TSC-00318-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '80W90', 'API MT-1', NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00319 - MANNOL CVT NS-3
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00319', 'MANNOL CVT NS-3', 'mannol-cvt-ns-3', 'Description

Caractéristiques du produit :
– Une base synthétique haute viscosité unique de la plus haute qualité avec un indice de viscosité constamment élevé en combinaison avec un ensemble d’additifs multifonctionnel conserve toutes ses propriétés dans une large plage de températures : offre de bonnes propriétés lubrifiantes à basses températures (-45 °C et moins) en hiver et fournit un film d’huile stable à des charges extrêmes et à des températures élevées en été ;
– La combinaison de haute technologie d’additifs offre une stabilité de frottement inégalée pour la courroie, ce qui se traduit par des économies de carburant importantes, des changements de vitesse parfaitement fluides et une durée de vie prolongée de tous les composants de la transmission grâce à d’excellentes propriétés de lubrification ;
– Offre une excellente compatibilité avec les matériaux d’étanchéité, les empêche de gonfler, de durcir et de rétrécir, réduisant ainsi les coûts de pièces de rechange et évitant le', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 60.0, 5, 'TSC-00319-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 5, 'TSC-00319-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.20; FORD WSS-M2C933-A')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00320 - MANNOL multivéhicule ATF JWS
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00320', 'MANNOL multivéhicule ATF JWS', 'mannol-multivehicule-atf-jws', 'Description

Caractéristiques du produit :
– La base synthétique à faible viscosité de la plus haute qualité avec un indice de viscosité élevé constant en combinaison avec un ensemble d’additifs multifonctionnels conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C) en hiver et assure un film d’huile stable sous des charges extrêmes et des températures élevées en été ;
– La combinaison d’additifs de haute technologie assure de bonnes propriétés antifriction pour les embrayages à engrenages et les propriétés de frottement requises pour les éléments de friction, assurant ainsi une économie de carburant significative, un changement de vitesse continu et fluide et une durée de vie prolongée de tous les éléments de transmission. Il assure un fonctionnement coordonné et fluide de l’embrayage. Il évite les éraflures ;
– Il présente une stabilité thermo-oxydative et chimique accrue et une résistance à', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 35.0, 5, 'TSC-00320-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 5, 'TSC-00320-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.1; MB 236.2; MB 236.3; MB 236.10; MB 236.11; PORSCHE JWS')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3001-20 - AdBlue® (20L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'adblue';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3001-20', 'AdBlue® (20L)', 'adblue-20l', 'AdBlue® est une solution d’urée de haute pureté à 32,5 % p/p qui est utilisée comme fluide de travail supplémentaire dans les voitures et camions diesel équipés de la technologie SCR (Selective Catalytic Reduction). La composition d’AdBlue® est spécifiée dans la norme DIN 70070. L’utilisation de tels systèmes optimise les performances du moteur, réduit l’émission de particules nocives dans les gaz d’échappement et est conforme aux normes environnementales Euro 4, Euro 5 et Euro 6.
AdBlue® est une marque déposée de l’Association allemande de l’industrie automobile (VDA Verband der Automobilindustrie eV).', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '20L', 140.0, 10, '3001-20-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3001 - AdBlue® (10L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'adblue';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3001', 'AdBlue® (10L)', 'adblue-10l', 'AdBlue® est une solution d’urée de haute pureté à 32,5 % p/p qui est utilisée comme fluide de travail supplémentaire dans les voitures et camions diesel équipés de la technologie SCR (Selective Catalytic Reduction). La composition d’AdBlue® est spécifiée dans la norme DIN 70070. L’utilisation de tels systèmes optimise les performances du moteur, réduit l’émission de particules nocives dans les gaz d’échappement et est conforme aux normes environnementales Euro 4, Euro 5 et Euro 6.
AdBlue® est une marque déposée de l’Association allemande de l’industrie automobile (VDA Verband der Automobilindustrie eV).', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '10L', 85.0, 10, '3001-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00323 - MANNOL Antigel  AF12+ Longlife concentré (10L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00323', 'MANNOL Antigel  AF12+ Longlife concentré (10L)', 'mannol-antigel-af12-longlife-concentre-10l', 'Description

Caractéristiques du produit :
– Il assure une protection fiable des métaux et alliages (laiton, cuivre, acier allié traité, fonte, aluminium) contre toutes les formes de corrosion, ainsi qu’il empêche la corrosion à haute température des surfaces en aluminium des moteurs modernes. Il offre des propriétés anticorrosion suffisantes à partir d’une concentration aussi faible que 20 % ;
– Il a une stabilité thermique exceptionnelle. Il protège contre la formation de dépôts ;
– Il a d’excellentes propriétés de conductivité thermique et une résistance à la formation de mousse ;
– Il est neutre pour les inserts et les tuyaux, compatible avec tous les types de composants en caoutchouc et en plastique d’un système de refroidissement ;
– Il a une excellente résistance à l’eau dure et des taux d’épuisement des inhibiteurs de corrosion très faibles ;
– Le package d’additifs carboxylés hautement efficaces (OAT) assure une stabilité exceptionnelle des qualités de service de l’antigel pen', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '10L', 160.0, 10, 'TSC-00323-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00324 - MANNOL ATF AG60
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00324', 'MANNOL ATF AG60', 'mannol-atf-ag60', 'Description

Caractéristiques du produit :
– La base synthétique à faible viscosité de la plus haute qualité avec un indice de viscosité élevé constant en combinaison avec un ensemble d’additifs multifonctionnels conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C) en hiver et assure un film d’huile stable sous des charges extrêmes et des températures élevées en été ;
– La combinaison de haute technologie d’additifs assure de bonnes propriétés antifriction pour les accouplements à engrenages et des propriétés de friction supérieures pour les éléments de friction, assurant ainsi une économie de carburant significative, un changement de vitesse continu et en douceur et l’augmentation de la durée de vie de tous les éléments de transmission. Il assure un fonctionnement coordonné et en douceur des embrayages. Il évite les éraflures ;
– Il présente une stabilité thermique, oxydative et chimique accr', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 45.0, 5, 'TSC-00324-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 5, 'TSC-00324-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00325 - MANNOL AG55
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00325', 'MANNOL AG55', 'mannol-ag55', 'Description

Caractéristiques du produit :
– La base synthétique à faible viscosité de la plus haute qualité avec un indice de viscosité élevé constant en combinaison avec un ensemble d’additifs multifonctionnel conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C) en hiver et assure un film d’huile stable sous des charges extrêmes et des températures élevées en été ;
– La combinaison de haute technologie d’additifs assure de bonnes propriétés antifriction pour les accouplements à engrenages et des propriétés de friction supérieures pour les éléments de friction, assurant ainsi une économie de carburant significative, un changement de vitesse continu et en douceur et l’augmentation de la durée de vie de tous les éléments de transmission. Il assure un fonctionnement coordonné et en douceur des embrayages. Il évite les éraflures ;
– Il a une stabilité thermique-oxydative et chimique accrue et une', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 43.0, 5, 'TSC-00325-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 43.0, 5, 'TSC-00325-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00326 - MANNOL AG52
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00326', 'MANNOL AG52', 'mannol-ag52', 'Description


Caractéristiques du produit :
– La base synthétique de haute qualité à faible viscosité avec un indice de viscosité élevé en combinaison avec un ensemble d’additifs multifonctionnels conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C) en hiver et assure un film d’huile stable sous des charges maximales et à des températures élevées en été ;
– La combinaison d’additifs de haute technologie assure de bonnes propriétés antifriction pour les accouplements à engrenages et d’excellentes propriétés de frottement pour les éléments de friction, assurant ainsi une économie de carburant significative, un changement de vitesse continu et en douceur et une durée de vie prolongée de tous les éléments de transmission. Il assure un fonctionnement coordonné et en douceur des embrayages. Il évite les éraflures ;
– Il a une stabilité thermique, oxydative et chimique élevée et une résistance à la d', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 35.0, 5, 'TSC-00326-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 5, 'TSC-00326-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.1; MB 236.2; MB 236.10; MB 236.11')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8208 - MANNOL ATF T-IV (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8208', 'MANNOL ATF T-IV (1L)', 'mannol-atf-t-iv', 'Description


Caractéristiques du produit :
– La base synthétique de la plus haute qualité avec un indice de viscosité élevé constant en combinaison avec un ensemble d’additifs multifonctionnels conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C) en hiver et assure un film d’huile stable sous des charges extrêmes et à des températures élevées en été ;
– Une combinaison d’additifs de haute technologie assure de bonnes propriétés antifriction pour les accouplements à engrenages et les propriétés de frottement requises pour les éléments de friction, assurant ainsi une économie de carburant significative, un changement de vitesse continu et en douceur et une durée de vie prolongée de tous les éléments de transmission. Il assure un fonctionnement coordonné et en douceur des embrayages ;
– Il présente une stabilité thermique, oxydative et chimique accrue et une résistance à la dégradation thermique', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, '8208-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00328 - MANNOL ATF SP-IV
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00328', 'MANNOL ATF SP-IV', 'mannol-atf-sp-iv', 'Description



Caractéristiques du produit :
– Une base synthétique à faible viscosité de la plus haute qualité avec un indice de viscosité constamment élevé en combinaison avec un ensemble d’additifs multifonctionnel conserve toutes ses propriétés dans une large plage de températures : elle offre de bonnes propriétés lubrifiantes à basse température (-45 °C) en hiver et fournit un film d’huile stable à des charges et températures extrêmes en été, elle fournit les propriétés antifriction nécessaires même en cas de violation de la continuité du film d’huile sous de fortes charges. Protège les surfaces de friction de l’usure et du collage, réduit les pertes d’énergie de friction ;
– Une combinaison d’additifs de haute technologie offre de bonnes propriétés antifriction pour les engrenages et d’excellentes propriétés de friction pour les éléments de friction, ce qui garantit une économie de carburant importante, des changements de vitesse exceptionnellement doux et fluides sans à-coups et', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 43.0, 5, 'TSC-00328-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 43.0, 5, 'TSC-00328-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00329 - Transmission à variation continue ATF  (CVT) MANNO
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00329', 'Transmission à variation continue ATF  (CVT) MANNOL', 'transmission-a-variation-continue-atf-cvt-mannol', 'Description

Caractéristiques du produit :
– La base synthétique unique à haute viscosité de la plus haute qualité avec un indice de viscosité élevé en combinaison avec un ensemble d’additifs multifonctionnels conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C et moins) en hiver et assure un film d’huile stable sous des charges extrêmes et à des températures élevées en été ;
– La combinaison de haute technologie d’additifs assure des propriétés de friction supérieures pour la chaîne, assurant ainsi une économie de carburant significative, un changement de vitesse continu et fluide et une durée de vie prolongée de tous les éléments de transmission ;
– Elle offre une excellente compatibilité avec les matériaux d’étanchéité, les empêche de gonfler, de durcir et de rétrécir, réduisant ainsi les coûts des pièces de rechange et évitant les fuites ;
– Elle présente une stabilité thermique, oxydative', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 45.0, 5, 'TSC-00329-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 5, 'TSC-00329-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8206 - MANNOL Automatique ATF Dexron III
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8206', 'MANNOL Automatique ATF Dexron III', 'mannol-automatique-atf-dexron-iii', 'Description



Caractéristiques du produit :
– La base synthétique à faible viscosité de la plus haute qualité avec un indice de viscosité élevé constant en combinaison avec un ensemble d’additifs multifonctionnel conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C) en hiver et assure un film d’huile stable sous des charges extrêmes et des températures élevées en été ;
– La combinaison de haute technologie d’additifs assure de bonnes propriétés antifriction pour les accouplements à engrenages et les propriétés de friction requises pour les éléments de friction, assurant ainsi une économie de carburant significative, un changement de vitesse continu et en douceur et une durée de vie prolongée de tous les éléments de transmission. Il assure un fonctionnement coordonné et en douceur des embrayages. Il évite les éraflures;
– Il présente une stabilité thermo-oxydative et chimique accrue et une rési', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 28.0, 10, '8206-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00331 - MANNOL ATF SP-III
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00331', 'MANNOL ATF SP-III', 'mannol-atf-sp-iii', 'Description

Caractéristiques du produit :
– La base synthétique de la plus haute qualité avec un indice de viscosité élevé constant en combinaison avec un ensemble d’additifs multifonctionnel conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C) en hiver et assure un film d’huile stable sous des charges extrêmes et à des températures élevées en été ;
– La combinaison de haute technologie d’additifs assure de bonnes propriétés antifriction pour les accouplements à engrenages et les propriétés de frottement requises pour les éléments de friction, assurant ainsi une économie de carburant significative, un changement de vitesse continu et en douceur et une durée de vie prolongée de tous les éléments de transmission. Il assure un fonctionnement coordonné et en douceur des embrayages ;
– Il a une stabilité thermo-oxydative et chimique accrue et une résistance à la dégradation thermique à haute tempé', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 40.0, 5, 'TSC-00331-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 5, 'TSC-00331-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8207 - MANNOL Dexron VI (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8207', 'MANNOL Dexron VI (1L)', 'mannol-dexron-vi-1l', 'Description



Caractéristiques du produit :
– La base synthétique à faible viscosité de la plus haute qualité avec un indice de viscosité élevé constant en combinaison avec un ensemble d’additifs multifonctionnel conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C et moins) en hiver et assure un film d’huile stable sous des charges extrêmes et à des températures élevées en été ;
– La combinaison de haute technologie d’additifs assure d’excellentes propriétés antifriction pour les accouplements à engrenages et des propriétés de friction supérieures pour les éléments de friction assurant ainsi une économie de carburant significative, un changement de vitesse continu, précis et fluide dans toutes les conditions de conduite et une durée de vie prolongée de la boîte de vitesses automatique elle-même et de tous les éléments de transmission. Assure un fonctionnement coordonné et fluide des embrayage', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, '8207-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8205 - Mannol Automatique ATF Dexron II
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8205', 'Mannol Automatique ATF Dexron II', 'mannol-automatique-atf-dexron-ii', 'Description



Caractéristiques du produit :
– La base de faible viscosité de haute qualité en combinaison avec un ensemble d’additifs multifonctionnels conserve toutes ses propriétés dans une large plage de températures : elle assure de bonnes propriétés lubrifiantes à basses températures (-45 °C) en hiver et assure un film d’huile stable sous des charges extrêmes et à des températures élevées en été ;
– La combinaison de haute technologie d’additifs assure de bonnes propriétés antifriction pour les accouplements à engrenages et les propriétés de friction requises pour les éléments de friction, garantissant ainsi une économie de carburant significative, un changement de vitesse continu et en douceur et une durée de vie prolongée de tous les éléments de transmission. Il évite les éraflures ;
– Il a une stabilité thermo-oxydative accrue et une résistance à la dégradation thermique à haute température permettant de diminuer la formation de boues, augmentant le temps entre les changements', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 30.0, 10, '8205-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9955 - MANNOL Cétane Plus (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9955', 'MANNOL Cétane Plus (450ml)', 'mannol-cetane-plus-450ml', 'Description

Caractéristiques du produit :
– Contient uniquement des composants autorisés améliorant l’indice de cétane. Augmente l’indice de cétane de 2 à 4 unités (selon la qualité du carburant) ;
– Grâce à une combustion plus silencieuse, plus douce et plus complète du carburant, la puissance du moteur est augmentée et la stabilité de la puissance est assurée dans tous les modes de fonctionnement, y compris pendant les surcharges. Un ralenti régulier est assuré. Réduit le bruit et les vibrations du moteur ;
– Augmente l’inflammabilité du carburant par temps froid, facilitant le démarrage du moteur froid ;
– Nettoie efficacement les composants et les pièces du système de carburant : la chambre de combustion, les buses d’injecteur, les soupapes et les têtes de piston des cendres, du carbone, du vernis et d’autres résidus non brûlés et empêche leur formation à l’avenir. Réduit la cokéfaction des segments de piston, empêchant leur apparition et l’augmentation de la consommation de carbu', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 40.0, 10, '9955-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9943 - MANNOL Motor Doctor + Ester (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9943', 'MANNOL Motor Doctor + Ester (450ml)', 'mannol-motor-doctor-ester-450ml', 'Description

Propriétés :
– Remplace la perte de viscosité cinématique (à 100 °C) pendant le fonctionnement (en particulier lors de démarrages à froid fréquents) sans réduire les propriétés à basse température ;
– Augmente l’indice de viscosité ;
– Réduit les pertes de compression du cylindre en améliorant l’étanchéité dynamique entre le piston et le cylindre, réduisant ainsi la consommation de fonctionnement en empêchant l’huile de pénétrer dans la chambre de combustion ;
– Élimine les micro-fuites causées par l’usure mécanique des pièces détachées du moteur en ajoutant des modificateurs provoquant le blocage de ces fuites ;
– Pénètre dans les joints usés et les joints en caoutchouc, restaure leur ancien volume et leur élasticité, empêchant les fuites d’huile à travers eux ;
– Contient un ensemble d’additifs API SN/CG-4 ;
– Augmente l’épaisseur du film d’huile ;
– Réduit la volatilité de l’huile, ce qui réduit également la consommation opérationnelle et prolonge la durée de vie de l’h', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 28.0, 10, '9943-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API SN/CG-4', NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9939 - Mannol Burning Booster (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9939', 'Mannol Burning Booster (450ml)', 'mannol-burning-booster-450ml', 'Description



Caractéristiques du produit :
– En augmentant l’efficacité de la combustion, il réduit la consommation d’essence de 3 à 5 % et réduit les émissions de CO-CH ;
– Toutes choses étant égales par ailleurs, augmente la puissance du moteur, notamment en améliorant les propriétés lubrifiantes de l’essence et en réduisant les frottements dans les zones des cylindres ;
– Protège le moteur des conséquences de l’utilisation de carburant de mauvaise qualité et des additifs qu’il contient : en facilitant l’accès à l’oxygène, il assure la combustion complète des hydrocarbures de haut poids moléculaire et des composés aromatiques qui peuvent être contenus dans l’essence de mauvaise qualité et les additifs utilisés dans celle-ci, et assure également la combustion complète du soufre. En conséquence, la formation de carbone dans la chambre de combustion est réduite et la cokéfaction des segments de piston est réduite, ce qui empêche leur apparition. Tout cela évite une consommation excess', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 30.0, 10, '9939-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9919 - MANNOL Anticor Noir (650ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9919', 'MANNOL Anticor Noir (650ml)', 'mannol-anticor-noir-650ml', 'Description

Propriétés :
– Protège de manière fiable la carrosserie contre les effets négatifs du sel de voirie et des réactifs de dégivrage, de tous les types d’effets atmosphériques, de la corrosion, protège contre les rayures causées par les particules de la surface de la route (gravier, pierre concassée, etc.) ;
– Possède des propriétés passivantes, ralentissant considérablement le processus de corrosion déjà commencé ;
– Forme un film élastique solide, lisse et indélébile aux propriétés ticostropes (peut être appliqué en couche épaisse sans former de taches et s’auto-nivelant, et les rayures dessus sont sujettes à l’auto-serrage), résistant aux influences mécaniques, à l’humidité, aux sels, aux acides et aux alcalis après séchage. Ne s’écaille pas et ne s’use pas pendant le fonctionnement ;
Pénètre efficacement dans les plus petites crevasses, déplaçant l’eau des fissures, des crevasses et des joints entre les panneaux de carrosserie forme une couche imperméable ;
– Possède une e', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '650ml', 35.0, 10, '9919-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9881 - MANNOL Lithium spray (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9881', 'MANNOL Lithium spray (400ml)', 'mannol-lithium-spray-400ml', 'Description

– Ne s’épaissit pas au froid, ne s’écoule pas à la chaleur. Conserve ses propriétés de performance de – 30 °C à + 120 °C, ce qui augmente la durée de vie des unités de friction ;
– En raison de l’utilisation de différents cations métalliques dans sa composition, il a des propriétés protectrices accrues et protège de manière fiable les surfaces métalliques contre la corrosion ;
– Protège de manière fiable les roulements et autres pièces contre la corrosion lors du fonctionnement de l’équipement dans un environnement humide et pollué, garantissant une longue durée de vie ;
– Possède de bonnes propriétés antifriction : réduit efficacement les frottements et l’usure ;
– Résistant à l’action de l’eau chaude et froide, absolument insensible à l’action de l’eau de mer, possède des propriétés hydrofuges et d’étanchéité ;
– A une bonne adhérence aux métaux, forme un film lubrifiant durable, résistant à l’eau, aux variations de température, à la saleté, qui permet d’augmenter l’inte', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 17.0, 10, '9881-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9968 - Mannol anti-fuite boite de vitesse
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9968', 'Mannol anti-fuite boite de vitesse', 'mannol-anti-fuite-boite-de-vitesse', 'Description

Propriétés :
– Des modificateurs spéciaux restaurent la forme et l’élasticité d’origine des joints et des joints ;
– Particulièrement efficace dans des conditions de fonctionnement difficiles ;
– Applicable à tous les composants de transmission mécanique et compatible avec toute huile pour transmissions mécaniques. Ne s’applique pas aux transmissions automatiques ;
– Peut être utilisé pour prévenir le processus de vieillissement et l’usure des joints et des joints ;
– N’empêche pas les fuites à travers les joints bourrés.
Application :
 Préchauffer l’unité de transmission manuelle à la température de fonctionnement. Verser l’additif dans l’huile de transmission chauffée. Le contenu du flacon est suffisant pour 4 à 5 litres d’huile de transmission. En cas de fuite importante, vous pouvez utiliser deux flacons. Recommandé pour une utilisation permanente.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 19.0, 10, '9968-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9932 - Mannol Dissolvant antirouille (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'produits-divers';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9932', 'Mannol Dissolvant antirouille (450ml)', 'mannol-dissolvant-antirouille-450ml', 'Description

Propriétés :
– Grâce à la présence de solvants à pénétration rapide dans sa composition, il libère instantanément les raccords filetés de la rouille, des oxydes et de la saleté, ce qui facilite grandement leur démontage ;
– Possède de bonnes propriétés anticorrosion, empêche la formation de rouille et d’oxydes à l’avenir. Forme un revêtement protecteur solide, imperméable et résistant à la chaleur ;
– Améliore l’adhérence du revêtement ultérieur à la surface traitée ;
– La présence de bisulfure de molybdène confère d’excellentes propriétés antifriction aux articulations mobiles, garantissant leur bon fonctionnement, leur facilité de mouvement et éliminant les grincements pendant une longue période ;
– Peut être utilisé pour sécher les interrupteurs-distributeurs, les bobines et les bougies d’allumage, car il déplace l’humidité et le carburant de leurs surfaces de travail, aidant ainsi au démarrage des moteurs humides et des appareils électriques ;
– Neutre pour les surface', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 19.0, 10, '9932-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9863 - Mannol Silicone Spray  (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9863', 'Mannol Silicone Spray  (400ml)', 'mannol-silicone-spray-400ml', 'Description

Propriétés :
– Forme une couche polymère transparente solide de molécules de silicone sur la surface traitée, ce qui confère à la surface d’excellentes propriétés hydrofuges, anti-poussière et antistatiques, en plus, il réduit les frottements, empêche les craquements, le gel et la corrosion ;
– Peut être utilisé aussi bien à l’intérieur qu’à l’extérieur de la voiture, sur des surfaces en plastique, caoutchouc, métal, bois, etc.
– Protège les surfaces et leur redonne de la brillance, protège contre l’exposition aux UV ;
– Restaure l’élasticité des pièces en caoutchouc et en plastique et les protège du dessèchement et des fissures ;
– Ne contient pas d’huiles et de graisses minérales.
– Recommandé pour la lubrification des rouleaux et guides des ceintures de sécurité et des trappes, pour la protection contre le gel des joints en caoutchouc des portes, capots, couvercles de coffre, etc. protège contre le vieillissement et la fragilisation des pare-chocs, grilles de radiateur,', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 22.0, 10, '9863-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9202 - Mannol Ester catalytique (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9202', 'Mannol Ester catalytique (450ml)', 'ester-catalytique', 'Description



Propriétés :
– En augmentant la température de combustion et en libérant de l’oxygène actif dans le processus, il brûle et élimine les dépôts et les impuretés dans l’ensemble du système d’échappement, y compris le convertisseur catalytique et les capteurs. Le résultat est une résistance réduite au mouvement des gaz d’échappement, une composition optimisée du mélange air-carburant et du processus de combustion, augmentant ainsi la puissance du moteur et l’efficacité de conversion énergétique ;
– Réduit la formation de monoxyde de carbone, l’opacité et la toxicité des gaz d’échappement, augmente la durée de vie des convertisseurs catalytiques, des capteurs d’oxygène, des bougies d’allumage, des injecteurs et du moteur dans son ensemble. Cela élimine les problèmes de moteur les plus courants conduisant aux indications « Check Engine » et réduit les coûts d’entretien et de réparation ;
– Assure la lubrification de tout le système d’alimentation et le nettoyage de ses élément', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 25.0, 10, '9202-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9964 - Mannol Huile pour filtre à air (200ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9964', 'Mannol Huile pour filtre à air (200ml)', 'huile-pour-filtre-a-air-200ml', 'Description

Propriétés:
– Fournit une alimentation en air maximale, augmentant la puissance du moteur;
– Retient de manière fiable la poussière, la saleté et le sable dans les conditions les plus extrêmes. Réduit l’usure et prolonge l’intervalle de vidange d’huile. Élimine les dommages au moteur causés par la contamination, prolonge sa durée de vie et réduit les coûts d’entretien et de réparation;
– Fournit d’excellentes propriétés adhésives du filtre, de sorte qu’il retient efficacement même les plus petites particules de poussière, tout en étant solidement maintenu à la surface des éléments filtrants;
– Recommandé pour une utilisation dans le sport automobile;
– Colore le filtre dans des teintes allant du rose pâle au rouge, et la couleur peut apparaître immédiatement ou après un certain temps;
– Élimine complètement le risque de destruction des filtres HIGH-FLOW pendant le fonctionnement.
Utilisation :
Retirer le filtre. Nettoyer la surface du filtre des grosses particules de pouss', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '200ml', 16.0, 10, '9964-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9670 - Mannol Nettoyant pour montage (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9670', 'Mannol Nettoyant pour montage (500ml)', 'mannol-nettoyant-pour-montage-500ml', 'Description

Propriétés :
– Convient aux pièces en tous métaux et alliages ;
– Possède d’excellentes propriétés nettoyantes ;
– Applicable sur les plaquettes et disques de frein, les pièces d’embrayage et de transmission, les outils, etc. ;
– Élimine la saleté, la graisse, l’huile et autres produits pétroliers, le liquide de frein, les résidus de fluides techniques brûlés et évaporés ;
– Facilite le démontage et l’installation des pièces, fait gagner du temps pour le démontage, réduit l’effort appliqué lors du démontage et du démontage des composants et des pièces lors des réparations automobiles ;
– Convient pour nettoyer les carrosseries des véhicules, les filtres à huile, les chaînes de moto et les chaînes de distribution, les moteurs, les charnières de porte et les contacts électriques, les équipements de jardin (minitracteurs, motoculteurs, tondeuses à gazon, etc.).
Application : 
Vaporisez le nettoyant sur les pièces sales et dans leurs articulations et laissez-le s’écouler. Une', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 17.0, 10, '9670-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9672 - Mannol Nettoyant pour montage  (600ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9672', 'Mannol Nettoyant pour montage  (600ml)', 'mannol-nettoyant-pour-montage-600ml', 'Description

Propriétés :
– Convient aux pièces en tous métaux et alliages ;
– Possède d’excellentes propriétés nettoyantes ;
– Applicable sur les plaquettes et disques de frein, les pièces d’embrayage et de transmission, les outils, etc. ;
– Élimine la saleté, la graisse, l’huile et autres produits pétroliers, le liquide de frein, les résidus de fluides techniques brûlés et évaporés ;
– Facilite le démontage et l’installation des pièces, fait gagner du temps pour le démontage, réduit l’effort appliqué lors du démontage et du démontage des composants et des pièces lors des réparations automobiles ;
– Convient pour nettoyer les carrosseries des véhicules, les filtres à huile, les chaînes de moto et les chaînes de distribution, les moteurs, les charnières de porte et les contacts électriques, les équipements de jardin (minitracteurs, motoculteurs, tondeuses à gazon, etc.).
Application :
Vaporisez le nettoyant sur les pièces sales et dans leurs articulations et laissez-le s’écouler. Une f', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '600ml', 20.0, 10, '9672-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9692 - Mannol Nettoyant pour freins (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'liquide-frein';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9692', 'Mannol Nettoyant pour freins (450ml)', 'mannol-nettoyant-pour-freins-450ml', 'Description

Application :
Pulvériser le nettoyant sur les pièces sales et laisser s’écouler. Les pièces sont propres et dégraissées après évaporation des solvants.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 15.0, 10, '9692-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9965 - MANNOL Nettoyant pour radiateur (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9965', 'MANNOL Nettoyant pour radiateur (250ml)', 'mannol-nettoyant-pour-radiateur-250ml', 'Description

Caractéristiques du produit :
– Compatible avec tout liquide de refroidissement ;
– Améliore le transfert de chaleur dans le système de refroidissement et augmente l’efficacité du radiateur de 50 à 70 % ;
– Élimine la rouille, le tartre, le calcaire, les produits de décomposition de l’antigel, la graisse et autres contaminants de tous les éléments du système de refroidissement (chemise de refroidissement du moteur, radiateur, chauffage, canalisations, etc.) ;
– Élimine la surchauffe locale des parois du cylindre résultant du colmatage de la chemise de refroidissement par du tartre et entraînant une usure accrue du groupe cylindre-piston et, par conséquent, son blocage ;
– Réduit le risque de surchauffe du moteur et de son « ébullition » lors de la conduite dans les embouteillages ;
– Rétablit la circulation du liquide de refroidissement à travers les tubes du radiateur obstrués par des dépôts ;
– Protège le joint d’huile de la pompe contre la destruction par les inclusions', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 15.0, 10, '9965-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9923 - MANNOL Antifuite pour direction assistée
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9923', 'MANNOL Antifuite pour direction assistée', 'mannol-antifuite-pour-direction-assistee', 'Description

Propriétés du produit :
– Des modificateurs spéciaux restaurent la forme, la taille et l’élasticité d’origine des joints et des joints de direction assistée ;
– Protège les joints en caoutchouc et en néoprène du dessèchement, du durcissement, de la déformation et des fissures, ralentissant leur vieillissement et prolongeant ainsi leur durée de vie ;
– Contient des composants qui améliorent les propriétés antifriction de l’additif, réduisant ainsi l’usure des éléments du système, améliorant leur mobilité et prolongeant la durée de vie de la direction assistée ;
– Assure un fonctionnement souple et silencieux du système de direction, réduit la chaleur, le bruit et les vibrations de la direction assistée ;
– Prolonge la durée de vie de la pompe et des soupapes de dérivation ;
– Peut être utilisé pour prévenir le vieillissement et l’usure des joints et des joints, et généralement pour prévenir les pannes du système ;
– Compatible avec tout liquide de direction assistée.
Applic', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 21.0, 10, '9923-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9912 - MANNOL Joint Maker Noir (85g)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9912', 'MANNOL Joint Maker Noir (85g)', 'mannol-joint-maker-noir-85g', 'Description

Plage de température de fonctionnement : -40 °C à +230 °C.
Conservez le produit d’étanchéité dans des conditions fraîches et sèches dans son emballage d’origine hermétiquement fermé.
Il conserve sa résistance pendant au moins deux ans à compter de la date de production.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '85g', 12.5, 10, '9912-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9913 - MANNOL Joint Maker gris (85g)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9913', 'MANNOL Joint Maker gris (85g)', 'mannol-joint-maker-gris-85g', 'Description

Plage de température de fonctionnement : -40 °C à +230 °C.
Conservez le produit d’étanchéité dans des conditions fraîches et sèches dans son emballage d’origine hermétiquement fermé.
Il conserve sa résistance pendant au moins deux ans à compter de la date de production.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '85g', 12.5, 10, '9913-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7901 - Lubrifiant pour chaîne (chain lube) (200ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7901', 'Lubrifiant pour chaîne (chain lube) (200ml)', 'lubrifiant-pour-chaine-chain-lube-200ml', 'Description

Propriétés :
– Il a une adhérence accrue et adhère bien aux chaînes les plus rapides sous l’action des forces centrifuges, offrant une lubrification fiable dans tous les modes ;
– Un ensemble d’additifs unique et des éléments micro-céramiques-modificateurs de friction contenus offrent d’excellentes propriétés antifriction et anti-usure ;
– A une bonne résistance à l’eau, ne se lave pas à l’eau chaude lors du lavage de l’équipement ;
– Prend soin en douceur des joints de chaîne de toute section (joint torique, joint en X, joint en W) ;
– Résistant aux basses températures ambiantes et aux températures de fonctionnement élevées (jusqu’à 260 °C) ;
– Protège de manière fiable les chaînes contre la corrosion ;
– Empêche les chaînes de s’étirer, prolongeant ainsi leur durée de vie ;
– Neutre pour les caoutchoucs, les plastiques et les revêtements de peinture.
Application : 
avant d’appliquer le lubrifiant pour chaîne MANNOL 7901, il est recommandé de nettoyer la chaîne avec le ne', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '200ml', 17.0, 10, '7901-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9970 - Mannol Nettoyant pour carburateur (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9970', 'Mannol Nettoyant pour carburateur (400ml)', 'mannol-nettoyant-pour-carburateur-400ml', 'Description

Propriétés :
– C’est un mélange de solvants organiques très efficaces. Ne contient pas d’acétone ;
– Dissout et élimine complètement tous les contaminants typiques du carburateur d’origines diverses ;
– N’obstrue pas les composants du moteur situés derrière le carburateur : soupapes, chambre de combustion, etc. ;
– Stabilise le régime de ralenti, facilite le démarrage à froid, améliore l’accélération du moteur ;
– Optimise le fonctionnement du système d’admission en nettoyant et en lubrifiant ses pièces mobiles ;
– Le produit contient des substances agressives pour les surfaces peintes et les plastiques ;
– Réduit la consommation de carburant (jusqu’à 5 %) et la toxicité des gaz d’échappement ;
– Applicable pour nettoyer les chaînes de moto, les chaînes de distribution, les pièces d’embrayage, les pompes à huile, les engrenages, les vilebrequins et autres composants métalliques non peints et les pièces du moteur.
Application:
Éteignez le moteur et retirez le filtre à air.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 12.5, 10, '9970-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9873 - Mannol Nettoyant pour soupape d’admission (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9873', 'Mannol Nettoyant pour soupape d’admission (400ml)', 'mannol-nettoyant-pour-soupape-dadmission-400ml', 'Description



Propriétés :
– Élimine rapidement, efficacement et soigneusement la saleté, la suie, le carbone, les dépôts de résine et d’huile et autres saletés les plus difficiles à éliminer et les plus anciennes ;
– Protège en outre les éléments du système d’admission contre la corrosion et l’oxydation, empêche la formation de nouvelles saletés et de dépôts sur eux, assure la fonctionnalité et la mobilité des pièces mobiles, – prolonge la durée de vie du système d’admission et réduit les coûts de réparation ;
– Facilite le démarrage à froid, rétablit l’uniformité du régime de ralenti et réduit la consommation de carburant ;
– Contient de l’acétone agressive pour les surfaces peintes et les plastiques ;
– Sans danger pour les convertisseurs catalytiques, les capteurs d’oxygène et les turbocompresseurs.
Application :
 bien agiter le ballon avant utilisation. Le produit doit être pulvérisé derrière le débitmètre d’air (le produit ne doit pas pénétrer dessus) pendant au moins 30 seconde', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 21.0, 10, '9873-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9893 - Mannol Nettoyant pour contacts (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9893', 'Mannol Nettoyant pour contacts (450ml)', 'mannol-nettoyant-pour-contacts-450ml', 'Description

Propriétés :
– Nettoie rapidement, efficacement et en douceur les contacts et connecteurs électriques, ainsi que les éléments électroniques des films de graisse et d’huile, des oxydes, des phosphates, de la poussière et d’autres contaminants isolants. Réduit la résistance électrique des contacts et réduit ainsi la perte de puissance des équipements électriques et stabilise la tension ;
– Déplace l’humidité, forme un film hydrofuge ;
– S’évapore rapidement sans laisser de traces et élimine les fuites de courant et les courts-circuits ;
– Assure une protection à long terme des contacts électriques contre l’oxydation, tout en maintenant leur conductivité ;
– Grâce à sa grande capacité de pénétration, il améliore l’efficacité et la fiabilité des systèmes électroniques et des équipements électriques, prévenant les pannes et les pannes ;
– Sans silicone, sans danger pour les pièces en plastique et en caoutchouc, ainsi que pour les revêtements de peinture ;
– Peut être utilisé po', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 24.0, 10, '9893-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9423 - MANNOL Anti-fuite d’huile (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9423', 'MANNOL Anti-fuite d’huile (250ml)', 'mannol-anti-fuite-dhuile-250ml', 'Description

Propriétés :
– Modifie la structure de surface des segments de piston et des hydrocompensateurs ;
– Restaure l’élasticité des joints et des garnitures ;
– Réduit le flux d’huile à travers les segments de piston en maintenant la viscosité de l’huile au niveau requis.
Application : 
Ajouter à l’huile moteur à tout moment. Faire chauffer le moteur et le laisser tourner au ralenti pendant 10 minutes. L’effet d’étanchéité est obtenu après 600-800 km. Pour un effet à long terme, appliquer à chaque vidange d’huile. Une boîte de 250 ml suffit pour un système d’huile de 6 L.
Remarque : Ne pas utiliser sur les motos avec un embrayage humide.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 15.0, 10, '9423-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 20 - WOLF ANTIFREEZE EVO LL (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20', 'WOLF ANTIFREEZE EVO LL (1L)', 'wolf-antifreeze-evo-ll-1l', 'Description

Applications
Ce concentré doit être dilué dans de l’eau avant utilisation. Il ne peut être utilisé qu’à une concentration de 33 % vol. minimum et de 60 % vol. maximum. Nous recommandons d’appliquer un ratio de mélange de 50:50 (% vol.) uniquement avec de l’eau déminéralisée ou distillée. Il offre une protection à long terme dans les applications VW TL 774 L (G12 evo) et de nombreuses autres applications OEM.
Performances
Il offre aux moteurs une exceptionnelle protection à long terme contre la corrosion, la surchauffe et le gel. Néanmoins, nous recommandons de changer de liquide de refroidissement au minimum tous les 6 ans ou tous les 250 000 km, selon la première des deux occurrences.
Conforme aux spécifications OEM

2G – SFU
ALFA ROMEO – SFU
APRILIA – SFU
ATLAS – SFU
AUDI – SFU
BMW – LC-18
BMW – LC-87
BMW – LC-97
BUGATTI – SFU
BYD – SFU
CASE – JIC-501
CASE – MAT 3624
CATERPILLAR – GCM34
CHEVROLET – SFU
CHRYSLER – SFU
CITROËN – –
CLAAS – SFU
CUMMINS – 85T8-2
CUMMINS – CES', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 20.0, 10, '20-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00357 - WOLF OIL LEAK STOP (325ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00357', 'WOLF OIL LEAK STOP (325ml)', 'wolf-oil-leak-stop', 'Description

Applications
Pour tous les moteurs à essence, diesel et GPL, équipés ou non d’un turbocompresseur. Peut être mélangé avec toutes les huiles moteurs disponibles dans le commerce. Ne colmate pas les filtres et ne présente aucun risque pour les convertisseurs catalytiques. Ajouter le contenu d’une bouteille dans l’huile chaude. S’assurer de ne pas dépasser le niveau maximal d’huile dans le moteur. Une bouteille (325 ml) traite un carter de 3 à 6 litres.
Performances
Ce produit évite les réparations onéreuses du moteur et prolonge la durée de vie de ce dernier.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '325ml', 22.0, 10, 'TSC-00357-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00358 - WOLF traitement essence (325ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00358', 'WOLF traitement essence (325ml)', 'wolf-traitement-essence-325ml', 'Description

Applications
Pour tous les moteurs à essence (avec ou sans plomb), avec carburateurs ou à injection de carburant. Sans risque pour les convertisseurs catalytiques.Ajouter une bouteille dans le réservoir de carburant avant de faire le plein d’essence. Une bouteille traite 50 à 60 litres d’essence.Dosage pour une utilisation normale : une bouteille tous les 2 000 km.Dosage pour un traitement de nettoyage : une bouteille pour chaque remplissage du réservoir.
Performances
Ce produit garantit des performances continues du système en offrant un nettoyage efficace et en augmentant la puissance.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '325ml', 19.0, 10, 'TSC-00358-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00359 - WOLF ENGINE FLUSH (325ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00359', 'WOLF ENGINE FLUSH (325ml)', 'wolf-engine-flush-325ml', 'Description

Applications
Pour tous les moteurs à essence, diesel et GPL, équipés ou non d’un turbocompresseur. Compatible avec toutes les huiles moteurs minérales et synthétiques.Instructions d’utilisation : ajouter une bouteille dans l’huile moteur chaude avant de changer l’huile. Faire tourner le moteur pendant 15 minutes, puis vidanger l’huile. Remplacer le filtre à huile et remplir le moteur avec une huile appropriée. Une bouteille traite 3 à 6 litres d’huile moteur.
Performances
Ce produit a été spécialement sélectionné pour garantir l’élimination de toutes les impuretés destructrices, comme la boue, le vernis et la suie, et pour optimiser le fonctionnement et l’efficacité du moteur.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '325ml', 18.0, 10, 'TSC-00359-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 5022 - Mannol lave glace super concentré 1:100 (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5022', 'Mannol lave glace super concentré 1:100 (250ml)', 'mannol-lave-glace-super-concentre-1100-250ml', 'Description

Propriétés :
– Élimine efficacement la saleté, les insectes, les taches d’huile, le film de silicone et autres saletés tenaces des vitres et des phares ;
– Assure rapidement la transparence du pare-brise, augmentant ainsi la sécurité de conduite ;
– A une agréable odeur d’agrumes
– Ne laisse pas de taches ni de traces sur le verre ;
– Sans phosphates, biologiquement neutre ;
– Chimiquement neutre pour les caoutchoucs, les plastiques et les revêtements de peinture.
Application : diluer avec de l’eau dans un rapport de 1:100 (25 ml pour 2,5 litres d’eau) et verser dans le réservoir du lave-glace.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 10.0, 10, '5022-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1515 - Liqui Moly Anti rongeurs (200ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1515', 'Liqui Moly Anti rongeurs (200ml)', 'liqui-moly-anti-rongeurs-200ml', 'Description

Appli­ca­tion
bien agiter la bouteille avant l’utilisation. Pulvériser le produit sur tous les côtés des pièces en caoutchouc et en plastique dans le compartiment moteur et sur le véhicule. Répéter le traitement env. tous les quinze jours.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '200ml', 28.0, 10, '1515-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9897 - Mannol entretien tendeur de courroie  (200ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9897', 'Mannol entretien tendeur de courroie  (200ml)', 'mannol-entretien-tendeur-de-courroie-200ml', 'Description

Propriétés :
– Réduit l’usure des courroies et des poulies, prévient leur vieillissement, prolongeant ainsi leur durée de vie ;
– Augmente l’efficacité de la transmission par courroie ;
– Réduit le bruit pendant le fonctionnement du moteur ;
– Particulièrement efficace pour éliminer le glissement des vieilles courroies lorsqu’elles ne peuvent pas être remplacées ou étirées ;
– Convient aux courroies trapézoïdales et semi-trapézoïdales, ne convient pas aux courroies plates ;
– Pour les courroies en cuir, divers tissus imprégnés de caoutchouc ou de balata, fibres chimiques, nylon, polyuréthane et autres matières synthétiques ;
– L’utilisation régulière du produit prolonge la durée de vie des courroies de 1,5 à 2 fois.
Application :
Arrêt de la transmission par courroie. Pulvériser une petite quantité de produit à une distance d’environ 20 cm sur la poulie sous les surfaces latérales de la courroie et/ou directement sur les surfaces latérales elles-mêmes. Faire tourner la tra', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '200ml', 15.0, 10, '9897-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9671 - Mannol nettoyant Moteur spray (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9671', 'Mannol nettoyant Moteur spray (450ml)', 'mannol-nettoyant-moteur-spray-450ml', 'Description

– Possède une capacité de solvant accrue et des propriétés de nettoyage actives ;
– La mousse active reste longtemps sur les surfaces verticales, assurant un excellent nettoyage des saletés complexes dans toutes les dimensions ;
– Neutre par rapport au plastique, au caoutchouc, aux revêtements de peinture, au chrome, au nickel, au zinc, etc., ainsi qu’aux surfaces des métaux et alliages ferreux et non ferreux (aluminium, bronze, laiton, etc.) ;
– Empêche en outre l’oxydation, la fissuration et la perte de propriétés des pièces en caoutchouc et en plastique du moteur sous l’influence agressive de la pollution et de l’environnement, empêche l’oxydation des connexions électriques, réduit le risque de courts-circuits, empêche l’incendie du câblage électrique ;
– Peut être utilisé pour nettoyer divers agrégats de voitures, motos, camions, tracteurs et autres équipements agricoles et de construction, ainsi que les équipements hydrauliques : châssis, filtres, pompes, outils, chaî', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 19.0, 10, '9671-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9944 - Mannol Nettoyant pour cuir (450ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9944', 'Mannol Nettoyant pour cuir (450ml)', 'mannol-nettoyant-pour-cuir-450ml', 'Description

Propriétés :
– Élimine efficacement la plupart des saletés, tout en renforçant la structure de la peau grâce à des substances actives pénétrantes en profondeur ;
– Restaure l’élasticité, prévient la déformation, la fissuration et le dessèchement des surfaces en cuir ;
– Forme une couche imperméable qui, en même temps, ne rend pas la surface glissante et collante ;
– Ne contient pas de colorants et convient aux produits en cuir de toutes les couleurs ;
– Idéal pour les véhicules avec sièges chauffants avec surfaces en cuir poreuses ;
– La composition comprend un filtre UV qui protège la peau de la décoloration au soleil.
Application :
Bien agiter le flacon avant utilisation. Vaporiser sur la surface à traiter, puis utiliser un chiffon ou une éponge propre pour essuyer soigneusement la surface dans un mouvement circulaire, sans exercer beaucoup d’effort, en répartissant le produit uniformément dessus. Si vous le souhaitez, après un certain temps, la surface peut être polie a', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '450ml', 25.0, 10, '9944-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8986 - Liqui Moly Nettoyeur papillon des gaz Pro-Line (40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8986', 'Liqui Moly Nettoyeur papillon des gaz Pro-Line (400ml)', 'liqui-moly-nettoyeur-papillon-des-gaz-pro-line-400ml', 'Description

Appli­ca­tion
Ménager un accès direct au papillon des gaz. Démarrer le moteur afin de commencer le nettoyage.
Vaporiser du nettoyant pour papillon des gaz sur toute la zone du papillon des gaz à l’aide d’une sonde de pulvérisation à brefs intervalles de 2-3 s et à 2 000 tours min.
Si le moteur n’arrive pas à maintenir le régime lorsque la tubulure d’admission est retirée ou s’il ne peut pas être démarré, débrancher le connecteur du débitmètre massique lorsque le contact est coupé. Dans ce cas-là, le défaut enregistré doit être effacé du calculateur du moteur après le nettoyage au moyen d’un appareil de diagnostic approprié et le débitmètre massique doit, le cas échéant, être appris de nouveau.
Si, lors de l’utilisation, des variations de régime de plus de 1 000 tours surviennent, il est important de réduire les intervalles de pulvérisation. Noter que le nettoyant pour papillon des gaz ne doit pas entrer en contact avec le débitmètre massique ou des composants laqués.
En pr', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 37.0, 10, '8986-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1600 - Liqui Moly Anti-goudron (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1600', 'Liqui Moly Anti-goudron (400ml)', 'liqui-moly-anti-goudron-400ml', 'Description

Appli­ca­tion
1. Bien agiter avant l’emploi.
2. Pulvériser l’anti-goudron sur les surfaces à nettoyer et laisser agir brièvement.
3. Essuyer avec un chiffon microfibre non pelucheux (réf. 1651).
4. Si les salissures sont extrêmement coriaces, répéter l’opération jusqu’à ce que le résultat souhaité soit obtenu.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 28.0, 10, '1600-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7389 - Liqui Moly Silicone spary Pro-Line (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7389', 'Liqui Moly Silicone spary Pro-Line (400ml)', 'liqui-moly-silicone-spary-pro-line-400ml', 'Description

Appli­ca­tion
Pulvériser une fine couche uniforme sur les composants à traiter. Si nécessaire, réitérer l’opération. Ne pas utiliser à proximité des postes de peinture et vernissage. Ne pas pulvériser sur les aliments et sur les pièces de machine qui sont en contact direct avec des aliments. Le tube de pulvérisation dépliant garantit une vaporisation précise. Lorsqu’il est rabattu, la pulvérisation s’effectue sur une grande surface. Pulvérise aussi en hauteur.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 30.0, 10, '7389-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 4066 - Liqui Moly Nettoyant pour débit­mètre d’air (200ml
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4066', 'Liqui Moly Nettoyant pour débit­mètre d’air (200ml)', 'liqui-moly-nettoyant-pour-debitmetre-dair-200ml', 'Description

Appli­ca­tion
Desserrer le raccordement électrique du débitmètre massique d’air et démonter le capteur. 
Vaporiser généreusement du produit sur les composants encrassés comme le fil de chaleur ou la plaque de chaleur et laisser la saleté s’écouler.
 Ne pas toucher les composants sensibles du débitmètre.
Avant le montage, laisser sécher complètement le solvant. 
Il est recommandé de répéter l’application lors de chaque remplacement du filtre à air ou en cas de survenance de problèmes. Remarque : tester la compatibilité avant toute utilisation sur des matières plastiques sensibles aux solvants, en particulier pour les pièces subissant des sollicitations mécaniques.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '200ml', 30.0, 10, '4066-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1085 - Liqui Moly Aide au démarrage START FIX (200ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1085', 'Liqui Moly Aide au démarrage START FIX (200ml)', 'liqui-moly-aide-au-demarrage-start-fix-200ml', 'Description

Appli­ca­tion
Vaporiser directement dans le filtre à air ou la conduite d’aspiration d’air et démarrer immédiatement. Pour les moteurs essence, n’appuyer que légèrement sur l’accélérateur ; pour les moteurs diesel sans préchauffage, démarrer à pleins gaz. 
Remarque : contient des substances particulièrement inflammables. C’est pourquoi il est interdit de fumer pendant l’utilisation du produit. Il est également interdit d’utiliser le produit d’aide au démarrage à proximité de flammes nues ou d’autres sources d’inflammation.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '200ml', 20.0, 10, '1085-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1832 - Liqui Moly élec­tro­nique spray (200ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'batteries';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1832', 'Liqui Moly élec­tro­nique spray (200ml)', 'liqui-moly-electronique-spray-200ml', 'Description

Appli­ca­tion
Vaporiser sur les composants avant le montage puis les monter. En cas de contacts fortement corrodés, laisser le produit agir plus longtemps, puis enlever les résidus de corrosion détachés en frottant avec un chiffon ou une brosse.

Remarque :
 respecter un temps de séchage de 10 min après la pulvérisation avant de raccorder le composant à une source de tension.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '200ml', 26.0, 10, '1832-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3391 - Liqui Moly LM 40 Spray Multi Fonc­tionnel  (400ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3391', 'Liqui Moly LM 40 Spray Multi Fonc­tionnel  (400ml)', 'liqui-moly-lm-40-spray-multi-fonctionnel-400ml', 'Lubrifie, nettoie, détache, protège et entretient. Préserve durablement la mobilité des pièces. Atteint les zones les plus reculées grâce à l’excellent pouvoir de pénétration. Détache très rapidement les vis rouillées et calcinées. S’infiltre et élimine la saleté, ainsi que les restes d’huile et de graisse coriaces. Protège contre la rouille et la corrosion, et entretient les pièces chromées.

L’huile universelle pour la maison, les loisirs, l’atelier, la voiture et l’industrie. Pour les charnières, les galets, les serrures, les vis, les interrupteurs, les poignées, les câbles Bowden, les antennes de voiture et bien plus.





bonne résistance à l’eau
bonne protection anticorrosion
préserve la mobilité des pièces
n’attaque pas les plastiques, les peintures, les métaux et le bois
pouvoir de pénétration optimal
réduit les frottements et l’usure
antirouille
lubrifie et entretient
élimine la saleté
sans silicone
utilisation universelle
améliore la conductibilité électrique
haute résistance', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 24.0, 10, '3391-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3304 - Liqui Moly Multi-Spray Plus 7 (300ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3304', 'Liqui Moly Multi-Spray Plus 7 (300ml)', 'liqui-moly-multi-spray-plus-7-300ml', 'Spray multifonction offrant 7 avantages clés : 1. Refoule l’humidité et démarre les moteurs humides. 2. Protège le système électrique, élimine les courants de fuite et les courts-circuits. 3. Desserre les vis grippées par la rouille. 4. Préserve la mobilité des pièces. 5. Protège contre la corrosion et l’oxydation. 6. Entretient les pièces en caoutchouc, empêche leur gel. 7. Élimine les grincements et n’attaque pas les plastiques, vernis, métaux et bois.

Application universelle dans l’atelier, la maison, le jardin et l’industrie. Pour les charnières, les galets, les serrures, les vis, les interrupteurs, les poignées, les câbles Bowden, les antennes de voiture et bien plus. Entretient et protège tout le système électrique.




élimine les grincements
bonne résistance à l’eau
bonne protection anticorrosion
n’attaque pas les plastiques, les peintures, les métaux et le bois
pouvoir de pénétration optimal
réduit les frottements et l’usure
antirouille
élimine la saleté
sans silicone
utilisation universelle', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 22.0, 10, '3304-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1816 - Liqui Moly Nettoyeur rapide (Spray) (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1816', 'Liqui Moly Nettoyeur rapide (Spray) (500ml)', 'liqui-moly-nettoyeur-rapide-spray-500ml', 'Description

Facilite les travaux de montage, les rend plus propres et plus sûrs. Élimine rapidement et complètement l’huile, la graisse et les saletés. Les pièces traitées sont absolument exemptes de résidus et complètement dégraissées. Économise temps et argent, et assure une réparation parfaite. Dissout les résidus de résine, d’huile et de graisse. Se caractérise par une bonne capacité de pénétration et une évaporation contrôlée et sans résidus.

Appli­ca­tion
Vaporiser le produit sur les pièces à nettoyer et laisser agir. Après l’évaporation des solvants, les pièces sont propres et exemptes de graisse.
Le produit peut attaquer la peinture et les pièces en plastique. Vérifier la compatibilité avant l’utilisation!


Les autres infor­ma­tions
Comme ce produit est un produit technique, il peut contenir des traces d’alcool dénaturé, par exemple de l’isopropanol/éthanol.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 16.0, 10, '1816-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1825 - Liqui Moly Dégrip­pant rapide (300ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1825', 'Liqui Moly Dégrip­pant rapide (300ml)', 'liqui-moly-degrippant-rapide-300ml', 'Description

Appli­ca­tion
Bien pulvériser le produit sur les vis ou écrous à desserrer et laisser agir un certain temps avant le desserrage, selon le degré de corrosion, comme cela est habituel avec les dégrippants. Dans des cas extrêmes, répéter l’opération.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 17.0, 10, '1825-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1844 - Liqui Moly Nettoyant d’ex­té­rieur de carbu­ra­teu
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1844', 'Liqui Moly Nettoyant d’ex­té­rieur de carbu­ra­teur (400ml)', 'liqui-moly-nettoyant-dexterieur-de-carburateur-400ml', 'Description

Appli­ca­tion
Avec le filtre à air démonté et le moteur arrêté, vaporiser toutes les pièces visibles. Vaporiser les pièces extérieures et laisser sécher. Dans des cas extrêmes, répéter le nettoyage. Démarrer le moteur et le laisser tourner à régime moyen. Ne pas vaporiser sur les pièces peintes. Sur les pièces peintes, tester la compatibilité et les alterations de couleur à un endroit dissimulé !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ml', 22.0, 10, '1844-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1529 - Liqui Moly Crème de polissage pour chrome (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1529', 'Liqui Moly Crème de polissage pour chrome (250ml)', 'liqui-moly-creme-de-polissage-pour-chrome-250ml', 'Description

Appli­ca­tion
1. Bien agiter avant l’emploi.
2. Appliquer ensuite avec un chiffon microfibre (réf. 1651) sur les pièces à traiter et faire pénétrer par frottement en exerçant une légère pression.
3. Laisser sécher brièvement et polir avec une zone sèche du chiffon microfibre.
4. Si les salissures sont coriaces, répéter l’opération jusqu’à ce que le résultat souhaité soit obtenu.
Remarque : 
ne pas utiliser sur des surfaces à haute température, ni sur des pièces revêtues de chrome !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 38.0, 10, '1529-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1545 - Liqui Moly auto Shampoo
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1545', 'Liqui Moly auto Shampoo', '2441', 'Description


Appli­ca­tion
1. Enlever les fortes salissures préalablement avec un jet d’eau haute pression ou puissant.
2. Bien agiter avant l’emploi.
3. Mélanger ensuite le shampoing auto avec de l’eau (40 ml pour 8 l d’eau).
4. Appliquer et étaler avec l’éponge auto (réf. 1549).
5. Rincer ensuite abondamment à l’eau et essuyer ou astiquer à la peau.
Remarque : ne pas utiliser sur des peintures et surfaces à haute température ni en plein soleil !

 

Les autres infor­ma­tions
Remarque : ne pas utiliser sur des peintures et surfaces à haute température ni en plein soleil !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 27.0, 10, '1545-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 4014 - Antigel MANNOL AG13+ (5L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4014', 'Antigel MANNOL AG13+ (5L)', 'antigel-mannol-ag13-5l', 'Description

Caractéristiques du produit :
– Il assure une protection fiable des métaux et alliages (laiton, cuivre, acier allié traité, fonte, aluminium) contre toutes les formes de corrosion, ainsi qu’il prévient la corrosion à haute température des surfaces en aluminium des moteurs modernes ;
– Le paquet d’additifs non organiques protège immédiatement la surface et la partie organique commence à agir uniquement lorsque des sources de corrosion apparaissent, ce qui permet d’obtenir une protection maximale dès le début de l’utilisation et de prolonger la durée de vie du moteur ;
– Il a une stabilité thermique exceptionnelle. Il protège contre la formation de dépôts ;
– Il a d’excellentes propriétés de conductivité thermique et une résistance à la formation de mousse ;
– Il est neutre pour les inserts et les tuyaux, compatible avec tous les types de pièces en caoutchouc et en plastique du système de refroidissement ;
– Il a une excellente résistance à l’eau dure et des taux d’épuisemen', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 10, '4014-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1542 - Liqui Moly Shampoing auto avec cire (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1542', 'Liqui Moly Shampoing auto avec cire (1L)', 'liqui-moly-shampoing-auto-avec-cire-1l', 'Description


Appli­ca­tion
1. Enlever les fortes salissures préalablement avec un jet d’eau haute pression ou puissant.
2. Bien agiter avant l’emploi.
3. Mélanger ensuite le shampoing auto avec de l’eau (30 ml pour 10 l d’eau). 1 trait sur l’échelle de dosage correspond à env. 30 ml.
4. Appliquer et étaler avec l’éponge auto (réf. 1549).
5. Puis, rincer abondamment à l’eau et essuyer ou astiquer à la peau de chamois.
Remarque : ne pas utiliser sur des peintures et surfaces à haute température ni en plein soleil !

 

Les autres infor­ma­tions
Remarque : ne pas utiliser sur des peintures et surfaces à haute température ni en plein soleil !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 36.0, 10, '1542-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1597 - Liqui Moly Nettoyant jantes spécial (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1597', 'Liqui Moly Nettoyant jantes spécial (1L)', 'liqui-moly-nettoyant-jantes-special-1l', 'Description

Appli­ca­tion
1. Bien agiter avant l’emploi.
2. Pulvériser ensuite le nettoyant jantes spécial de façon homogène sur les jantes encrassées. Remarque sur la bouteille de pulvérisation de 1 l : En cas d’actionnement rapide de la gâchette, le liquide pulvérisé présente une surface large. En cas d’actionnement lent, un point.
3. Laisser agir 5 à 7 minutes en fonction du degré d’encrassement, mais sans attendre que cela sèche.
4. Si les salissures sont extrêmement tenaces, utiliser en plus une éponge ou une brosse.
5. Le nettoyage peut être contrôlé de façon optique sur la base du changement de couleur et est optimal lorsque la couleur est complètement violette.
6. Rincer minutieusement les jantes avec un nettoyeur haute pression.

Remarque : 
ne pas appliquer sur des jantes à haute température ni en plein soleil ! Si les surfaces traitées sont sensibles, vérifier la compatibilité des matériaux à un endroit discret !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 10, '1597-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1554 - Liqui Moly Entretien du cuir (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1554', 'Liqui Moly Entretien du cuir (250ml)', 'liqui-moly-entretien-du-cuir-250ml', 'Description

Appli­ca­tion
1. En cas d’encrassement, nettoyer d’abord la surface de cuir à traiter avec le produit d’entretien intérieur voiture et laisser sécher.
2. Bien agiter avant l’emploi.
3. Mettre ensuite le produit d’entretien du cuir sur un chiffon doux ou en microfibre (réf. 1651) et appliquer une fine couche homogène avec des mouvements circulaires en exerçant une légère pression.
4. Après un court temps d’action, polir avec la zone sèche du chiffon microfibre.
Remarque : Ne convient pas au cuir velours ! Veiller à ce que le liquide ne pénètre pas dans le cuir perforé ! Vérifier, avant l’utilisation sur une grande surface, la compatibilité des matériaux sur une zone peu visible ! Ne pas utiliser sur les motos !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 41.0, 10, '1554-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1610 - Liqui MolyEntretien tableau de bord (600ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'nettoyage-interieur';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1610', 'Liqui MolyEntretien tableau de bord (600ml)', 'liqui-molyentretien-tableau-de-bord-600ml', 'Description

Appli­ca­tion
1. En cas de fort encrassement, nettoyer d’abord la surface à traiter avec le produit d’entretien intérieur voiture.
2. Pulvériser ensuite une fine couche de produit d’entretien tableau de bord.
3. Après un court temps d’action, étaler en frottant avec un chiffon microfibre (réf. 1651) ou un chiffon doux.
Remarque :
ne pas utiliser sur les volants, pédales, assises de siège ou pommeaux de levier de vitesses, car il y a un risque de glissement !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '600ml', 23.0, 10, '1610-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9931 - MANNOL Mousse textile (650ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9931', 'MANNOL Mousse textile (650ml)', 'mannol-mousse-textile-650ml', 'Description

Propriétés :
– Rend la couleur naturelle, restaure l’aspect d’origine des tissus et des matériaux de moquette, soulève les poils, élimine les odeurs désagréables et rafraîchit l’air de la voiture ;
– Empêche les contaminations répétées grâce à ses propriétés antistatiques.
Application :
Bien agiter le ballon. Nous vous recommandons de traiter l’ensemble du siège ou du produit dans son intégralité, et pas seulement des taches individuelles. Vaporisez la mousse sur la surface textile souillée et frottez-la avec l’éponge fournie. Après application, rincez l’éponge plusieurs fois et essuyez soigneusement la surface traitée avec celle-ci ou un chiffon propre et humide. Répétez la procédure si nécessaire.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '650ml', 17.0, 10, '9931-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3327 - Liqui Moly Étan­chéité moteur (300ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3327', 'Liqui Moly Étan­chéité moteur (300ml)', 'liqui-moly-etancheite-moteur-300ml', 'Description

Appli­ca­tion
Bien secouer la boîte avant l’utilisation et la tenir à la verticale lors de l’utilisation. Nettoyer minutieusement les pièces à traiter avec du nettoyant compartiment moteur LIQUI MOLY ou du détergent universel LIQUI MOLY et les sécher. Vaporiser une couche régulière de scellement de moteur sur les pièces à traiter. Remarque : sur les pièces peintes avec de la résine synthétique, tester d’abord la compatibilité à un endroit dissimulé.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 28.0, 10, '3327-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3326 - Liqui Moly Nettoyant compar­ti­ment moteur (400ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3326', 'Liqui Moly Nettoyant compar­ti­ment moteur (400ML)', 'liqui-moly-nettoyant-compartiment-moteur-400ml', 'Description

Appli­ca­tion
Pulvériser le produit à une distance d’env. 20-30 cm sur les pièces à nettoyer et laisser agir env. 10 à 20 min selon le degré d’encrassement. Rincer ensuite soigneusement avec un jet d’eau fort. Pour protéger les pièces nettoyées, utiliser le produit Étanchéité moteur LIQUI MOLY. On peut aussi s’en servir pour enlever le revêtement de cire Wax-Coating de LIQUI MOLY.
Remarque : Vérifier la compatibilité du nettoyant de compartiment moteur avec les composants repeints ou avec air brush en l’appliquant d’abord sur des zones non apparentes. Lors du nettoyage, il convient de respecter les prescriptions locales des organismes chargés de la gestion des eaux.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '400ML', 22.0, 10, '3326-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1379 - Lave-glace super concentré aux agrumes (50ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1379', 'Lave-glace super concentré aux agrumes (50ml)', 'lave-glace-super-concentre-aux-agrumes-50ml', 'Description

Appli­ca­tion
Mode d’emploi : dilué avec de l’eau dans la proportion 1:100. 50 ml de liquide concentré donnent 5 l de liquide de nettoyage. 250 ml de liquide concentré donnent 25 l de liquide de nettoyage.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '50ml', 15.0, 10, '1379-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 4087 - Entretien des circuits de clima­ti­sa­tion (Spray)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4087', 'Entretien des circuits de clima­ti­sa­tion (Spray) 250ml', 'entretien-des-circuits-de-climatisation-spray-250ml', 'Description

Appli­ca­tion
Conditionnement unitaire :
Une bouteille suffit pour traiter un véhicule ou un climatiseur. Si le fabricant recommande un nettoyage de maintenance du climatiseur, il faut en tenir compte. S’il n’y a aucune prescription du constructeur de voitures particulières spécifique au type de climatiseur, il faut procéder selon la recommandation d’application de LIQUI MOLY. Pour les climatiseurs de véhicules industriels, bus et climatiseurs domestiques, vaporiser le nettoyant liquide si possible directement sur la surface de l’évaporateur.
Recommandation d’application de LIQUI MOLY :

Ouvrir les vitres pendant le nettoyage. Éviter d’inhaler les vapeurs pendant le nettoyage.
Contrôler si les orifices d’écoulement de l’eau de condensation sont ouverts.
Alors que le moteur tourne, sécher la surface de l’évaporateur pendant 10 minutes en réglant le chauffage et la ventilation comme suit : Couper le climatiseur et régler sur le mode recyclage d’air. Régler le contacteur de r', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 35.0, 10, '4087-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 20000 - Klima Refresh (75ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20000', 'Klima Refresh (75ml)', 'klima-refresh-75ml', 'Description


Appli­ca­tion
Démarrer le moteur et activer la climatisation (AC). Régler le régulateur de température sur « froid » et le flux d’air vers le pare-brise (vers le haut), à puissance maximale et en mode recyclage d’air. Si le véhicule dispose d’un système d’ionisation ou d’un ioniseur, couper cette fonction avant l’application. Bien agiter la bouteille et la positionner au moyen du carton d’emballage dans la zone d’admission du système de recirculation d’air (généralement dans la zone des pieds du passager ou de la console centrale) de manière à ce que la pulvérisation puisse s’effectuer sans entrave vers le haut. Lorsque les vitres sont fermées, actionner la tête de vaporisation, quitter le véhicule et fermer les portes. Après 10 min, ouvrir les portes, arrêter le moteur et laisser aérer l’intérieur pendant env.
10 min.


Les autres infor­ma­tions
Aucune personne ne doit se trouver à bord du véhicule pendant la pulvérisation !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '75ml', 30.0, 10, '20000-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9811 - MANNOL Chamois synthétique (43×32 cm)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9811', 'MANNOL Chamois synthétique (43×32 cm)', 'mannol-chamois-synthetique', 'Description

Propriétés :
– Doux et très hygroscopique – absorbe bien l’humidité et la poussière ;
– Polit et nettoie parfaitement, ne laisse pas de taches, de traces, de microparticules et de peluches ;
– Ne laisse pas de rayures ;
– Haute résistance, durabilité, résistance chimique.
Taille : 43×32 cm
Application :
Après utilisation, laver le chiffon à l’eau tiède et au savon, puis rincer abondamment. Conserver humide dans un récipient hermétiquement fermé.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '32 cm', 20.0, 10, '9811-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9814 - MANNOL Micro Fibre Polish  (33×36 cm)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'lavage-carrosserie';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9814', 'MANNOL Micro Fibre Polish  (33×36 cm)', 'mannol-micro-fibre-polish-33x36-cm', 'Description

Propriétés :
– Doux et très hygroscopique ;
– Polit magnifiquement, laissant des microparticules et des peluches ;
– Ne laisse pas de rayures ;
– Permet d’économiser beaucoup de vernis lors des opérations de polissage ;
– Haute résistance, durabilité, résistance aux agents de nettoyage.
Taille : 33×36 cm
Utilisation : 
laver à l’eau tiède avant la première utilisation. Après utilisation, laver le chiffon à l’eau tiède et au savon, puis rincer abondamment.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '36 cm', 13.0, 10, '9814-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 5189 - Pro-Line Nettoyant radiateur   (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5189', 'Pro-Line Nettoyant radiateur   (1L)', 'pro-line-nettoyant-radiateur-1l', 'Description

Les dépôts s’amoncelant dans les systèmes de refroidissement et de chauffage entravent les échanges de chaleur et obturent les vannes thermostatiques et les mécanismes de régulation. Des températures trop hautes dans le moteur entraînent un fonctionnement inefficace de ce dernier, une forte usure ainsi que des risques d’endommagement élevés. Ce concentré élimine efficacement les dépôts huileux et calcaires, et garantit une température moteur ainsi qu’une sécurité de fonctionnement optimales. Ne contient pas d’acides ou de lessives alcalines agressives.

Appli­ca­tion
Ajouter le contenu à l’eau de refroidissement et enclencher le chauffage. Laisser tourner le moteur chaud env. 10 à 30 min, suivant le degré d’encrassement. Évacuer le nettoyant, rincer le système de refroidissement abondamment à l’eau, puis le remplir selon les prescriptions du fabricant. Le contenu suffit pour traiter jusqu’à 50 l de liquide de refroidissement.
Les autres infor­ma­tions

Entreposer à l’abri', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 50.0, 10, '5189-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 21317 - Additif de Diesel anti-bactérien (1L)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21317', 'Additif de Diesel anti-bactérien (1L)', 'additif-de-diesel-anti-bacterien-1l', 'Description

Indiqué pour tous les moteurs diesel, avec et sans filtre à particules, à titre préventif ou pour le traitement de problèmes. Compatible avec turbocompresseur. À verser directement dans le réservoir de carburant. Entièrement compatible avec tous les gazoles conventionnels et les gazoles verts. Le contenu de 25 ml du récipient doseur (intégré dans le bouchon) suffit, pour une utilisation préventive, à traiter 25 l de carburant (dosage 1:1000) et, pour un traitement en cas de problèmes, à traiter 5 l de carburant (dosage 1:200).

Appli­ca­tion
Dosage 1 : 1000. Un gobelet gradué, 25 ml, suffit pour 25 l de carburant diesel. A titre préventif, ajouter la quantité correspondante avant le remplissage du réservoir. En cas de forte contamination par les bactéries et les moisissures avec engorgement du filtre, appliquer un dosage choc (dosage à 1 : 200).', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 100.0, 10, '21317-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8380 - Rinçage Diesel  (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8380', 'Rinçage Diesel  (500ml)', 'rincage-diesel-500ml', 'Description

Ce produit élimine les dépôts des injecteurs, des pistons et de la chambre de combustion. Élimine les problèmes de fonctionnement du moteur. Plus de cognement sous charge partielle : ralenti plus régulier et fonctionnement plus souple du moteur. Des injecteurs plus propres produisent un fonctionnement optimal du moteur. Nettoie l’ensemble du circuit de carburant. Protège contre la corrosion. Garantit une bonne combustion, une réduction de consommation et une fiabilité de fonctionnement.
Appli­ca­tion

Traitement préventif :　
ajout au carburant lors d’opérations d’inspection régulières.　
Traitement curatif :
débrancher la conduite d’alimentation et de retour, et l’introduire dans le produit Diesel Purge. Démarrer le moteur. Faire tourner le moteur à des régimes différents et le couper avant que le récipient ne soit vide. Raccorder de nouveau les conduites de carburant au système de carburant et vérifier l’étanchéité. En cas d’encrassement extrême, répéter la procédure de ne', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 38.0, 10, '8380-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8363 - Diesel stop smoke (150ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8363', 'Diesel stop smoke (150ml)', 'diesel-stop-smoke-150ml', 'Description

Accélère la combustion des suies et réduit les fumées à l’échappement. Diminue l’émission de substances nocives et les désagréments olfactifs. Efficacité maximale dès l’ajout. Optimise les résultats du contrôle antipollution
Appli­ca­tion
150 ml est suffisant pour 50 l de gazole, c’est-à-dire 1:333. Verser directement le contenu dans le réservoir avant le ravitaillement en carburant. Pour un effet optimal, ajouter à chaque passage à la pompe.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '150ml', 22.0, 10, '8363-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 5148 - Protec­tion du filtre à parti­cules diesel (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5148', 'Protec­tion du filtre à parti­cules diesel (250ml)', 'protection-du-filtre-a-particules-diesel-250ml', 'Description

Garantit une combustion optimale du carburant, réduit la formation de suie, diminue les émissions et prolonge la durée de vie des filtres à particule diesel. Le colmatage des filtres à particules diesel est un phénomène affectant notamment les véhicules utilisés sur de courtes distances ou dans le trafic urbain. L’utilisation régulière assure la propreté du filtre à particules diesel et évite des réparations et périodes d’immobilisation onéreuses.
Appli­ca­tion
Ajouter au carburant tous les 2 000 km, immédiatement avant de faire le plein. Le contenu de la bouteille suffit pour traiter 50 – 70 l de gazole.
Remarque : éviter un surdosage et un emploi en combinaison avec Suie Diesel Stop !', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 29.0, 10, '5148-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8372 - Entretien du système diesel (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-air';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8372', 'Entretien du système diesel (250ml)', 'entretien-du-systeme-diesel-250ml', 'Description

Appli­ca­tion
L’augmentation de l’inflammabilité ainsi qu’une amélioration de l’effet de lubrification grâce au pouvoir lubrifiant ne sont obtenues qu’avec l’adjonction en continu aux carburants diesel pauvres en soufre. A ce propos, une boîte de 250 ml suffit pour 75 l de carburant diesel. Dosage à 1 : 300. Pour assurer la propreté des injecteurs et la protection contre la corrosion, il est recommandé d’ajouter du traitement circuit diesel tous les 2000 km dans le réservoir de diesel des voitures de tourisme. En cas d’arrêt et de conservation de moteurs, ajouter 1 % de traitement circuit diesel au carburant diesel. Respecter les prescriptions de conservation. Il est possible d’ajouter du traitement circuit diesel au carburant à tout moment de son choix, car le mélange s’effectue de lui-même.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 30.0, 10, '8372-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2962 - Pro-Line JetClean Nettoyant pour système diesel (5
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2962', 'Pro-Line JetClean Nettoyant pour système diesel (500ml)', 'pro-line-jetclean-nettoyant-pour-systeme-diesel-500ml', 'Description


Détergent liquide fortement concentré, prêt à l’emploi. Élimine les dépôts dans la pompe d’injection, sur les injecteurs et dans la chambre de combustion, empêche la formation de nouveaux dépôts. Arrête le grippage et la résinification des aiguilles d’injecteur. Améliore le fonctionnement du moteur et optimise la valeur des gaz d’échappement. Élimine les difficultés de démarrage, le fonctionnement irrégulier du moteur, la mauvaise prise des gaz et les pertes de puissance. Entretient l’intégralité du système de carburant et le protège contre l’usure et la corrosion. Les moteurs propres consomment moins de carburant et rejettent moins de substances nocives.


Appli­ca­tion
Prêt à l’emploi pour le remplissage des appareils JetClean, à verser non dilué. Une description d’application détaillée se trouve dans les modes d’emploi des appareils JetClean.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 48.0, 10, '2962-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1797 - Pro-Line Nettoyant pour système diesel (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1797', 'Pro-Line Nettoyant pour système diesel (500ml)', 'pro-line-nettoyant-pour-systeme-diesel-500ml', 'Description

Réduit les émissions de substances polluantes et optimise ainsi l’opacité de la fumée avant le contrôle antipollution. Testé avec succès dans le cadre d’essais sur banc à l’échelle internationale. Débarrasse les injecteurs, l’ensemble du système de carburant et les chambres de combustion de dépôts gênants. Empêche le grippage et la résinification des aiguilles d’injecteur. Optimise le processus de combustion et permet au moteur de retrouver sa puissance d’origine.
Appli­ca­tion
À verser directement dans le réservoir de carburant. À titre préventif à chaque révision, après des réparations sur le système de carburant, pour le traitement de problèmes ou après chaque nettoyage JetClean. Pour éliminer les problèmes, il est recommandé d’ajouter le produit au carburant à chaque passage à la pompe pendant environ 2 000 km. Le contenu suffit pour traiter 70 l max. de carburant.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 50.0, 10, '1797-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8366 - Super Additif Diesel (250ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8366', 'Super Additif Diesel (250ml)', 'super-additif-diesel-250ml', 'Description

Élimine les dépôts dans le système d’injection diesel ainsi que dans la chambre de combustion, et empêche la formation de nouveaux dépôts. Entretient tous les composants du système d’injection diesel. Empêche le grippage et la résinification des aiguilles d’injecteur. Augmente l’indice de cétane, améliore la qualité de l’allumage du gazole et veille à un fonctionnement régulier du moteur. Protège l’ensemble du système de carburant contre la corrosion et l’usure. Optimise les résultats du contrôle antipollution et les performances du moteur. Les moteurs propres consomment moins de carburant et rejettent moins de gaz polluants.
Appli­ca­tion
L’ajout continu aux gazoles à basse teneur en soufre permet d’augmenter la qualité d’allumage et l’effet lubrifiant grâce à des agents améliorant le pouvoir lubrifiant. Une bouteille de 250 ml permet de traiter 75 l de gazole. Dosage : 1:300.
Propreté des injecteurs et protection anticorrosion par versement dans le réservoir diesel tous', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ml', 23.0, 10, '8366-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8373 - nettoyant soupapes (150ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8373', 'nettoyant soupapes (150ml)', 'nettoyant-soupapes-150ml', 'Description

Assure une puissance optimale du moteur. Élimine les dépôts au niveau des soupapes, dans la chambre de combustion et empêche la formation de nouveaux dépôts. Économise le carburant. Optimise les résultats du contrôle antipollution et les performances du moteur. Améliore la compression. Les moteurs propres consomment moins de carburant et rejettent moins de gaz polluants. Compatible avec catalyseur et turbocompresseur.
Appli­ca­tion:
Ajout au carburant à chaque ravitaillement. Le contenu suffit pour traiter jusqu’à 75 l de carburant.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '150ml', 21.0, 10, '8373-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8351 - Octane Plus (150ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8351', 'Octane Plus (150ml)', 'octane-plus-150ml', 'Description

Combinaison automiscible de principes actifs, formulée selon l’état actuel de la technologie des additifs et des carburants. Utilisation universelle, augmente l’indice d’octane (RON) du carburant de 2-4 points en fonction du RON. L’amélioration des performances du carburant empêche des dommages au moteur dus à des combustions détonantes. L’augmentation de l’indice d’octane garantit une faible consommation de carburant.
ATTENTION : ne peut être commandé qu’en dehors de l’Europe.
Appli­ca­tion
Une bouteille de 150 ml traite jusqu’à 50 l d’essence. Verser Octane-Plus dans le réservoir, puis ajouter de l’essence. Le mélange s’effectue automatiquement.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '150ml', 32.0, 10, '8351-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2955 - Fuel Protect essence
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2955', 'Fuel Protect essence', 'fuel-protect-essence', 'Description




lie et élimine l’eau
bonne protection anticorrosion
compatible avec turbocompresseur et catalyseur
sans danger pour l’environnement
empêche le givrage du carburateur
rentable



  Appli­ca­tion
                  Ajout au carburant à chaque ravitaillement. 300 ml suffisent pour 60 l de carburant.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 27.0, 10, '2955-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2970 - Pro-Line Nettoyant pour système essence (500ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2970', 'Pro-Line Nettoyant pour système essence (500ml)', 'pro-line-nettoyant-pour-systeme-essence-500ml', 'Description

Élimine les dépôts au niveau des injecteurs, des soupapes d’admission, des bougies d’allumage ainsi que dans la chambre de combustion et empêche la formation de nouveaux dépôts. Élimine les difficultés de démarrage et les irrégularités du moteur. Entretient tous les composants du système d’injection d’essence et protège l’ensemble du système de carburant contre la corrosion. Améliore les montées en régime et la compression. Optimise les résultats du contrôle antipollution et les performances du moteur. Les moteurs propres consomment moins de carburant et rejettent moins de gaz polluants.
Appli­ca­tion
Pour un versement direct dans le réservoir de carburant. A appliquer de manière préventive lors de chaque inspection ainsi qu’après les réparations sur le système de carburant et après chaque nettoyage avec le produit JetClean. Le mélange avec le carburant s’effectue automatiquement. Contenu deboîte suffisant pour 70 litres de carburant au max.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '500ml', 40.0, 10, '2970-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8361 - Nettoyant pour systèmes d‘ injection (300ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8361', 'Nettoyant pour systèmes d‘ injection (300ml)', 'nettoyant-pour-systemes-d-injection-300ml', 'Description

Élimine les dépôts au niveau des injecteurs, des soupapes d’admission, des bougies d’allumage ainsi que dans la chambre de combustion et empêche la formation de nouveaux dépôts. Élimine les difficultés de démarrage et les irrégularités du moteur. Entretient tous les composants du système d’injection essence. Protège l’ensemble du système de carburant contre la corrosion. Améliore les montées en régime et la compression. Optimise les résultats du contrôle antipollution et les performances du moteur. Les moteurs propres consomment moins de carburant et rejettent moins de gaz polluants.
Appli­ca­tion
300 ml traitent 70 l de carburant. Effet longue durée (2 000 km). Peut être mélangé à tout moment au carburant, car le mélange s’effectue automatiquement. Si les problèmes réapparaissent, réeffectuer le traitement.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 24.0, 10, '8361-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7918 - MANNOL Légende Ultra 0W-20
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7918', 'MANNOL Légende Ultra 0W-20', 'mannol-legende-ultra-0w-20', 'Description

Caractéristiques du produit :
– Économie de carburant exceptionnelle grâce à une viscosité à haute température HTHS réduite et à des propriétés antifriction optimales ;
– Un ensemble d’additifs très efficaces et une base bi-synthétique à faible viscosité assurent un démarrage à froid fiable dans les conditions les plus sévères, réduisant ainsi considérablement l’usure au démarrage du moteur ;
– Grâce à ses excellentes propriétés de lavage et de dispersion et à la plus haute stabilité à l’oxydation thermique, elle lutte efficacement contre tous les types de dépôts et maintient les pièces du moteur propres pendant tout l’intervalle entre les remplacements ;
– Les composants de l’huile ester offrent d’excellentes propriétés anti-usure grâce à la résistance exceptionnelle du film d’huile, qui, combinée à une excellente pompabilité, augmente considérablement la durée de vie du moteur même en modes de conduite « start-stop » ;
– Pour les moteurs turbocompressés à injection direc', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 135.0, 10, '7918-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W20', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00406 - Nettoyant boîte de vitesses (150ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'entretien-chaine';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00406', 'Nettoyant boîte de vitesses (150ml)', 'nettoyant-boite-de-vitesses-150ml', 'Description




élimine les résidus gênants
convient aux boîtes mécaniques, engrenages hypoïdes, boîtes-ponts et boîtes auxiliaires
assure un passage facile des rapports
nettoyage en douceur
assure le passage optimal des rapports
pour éliminer les problèmes de passage des rapports




Appli­ca­tion
Verser le contenu de la bouteille dans l’huile de boîte de vitesses chaude (température de service) avant la vidange de l’huile de boîte. Si la boîte de vitesses est saturée, il faut vidanger 150 ml d’huile usagée afin de pouvoir ajouter le nettoyant. Passer ensuite sur la plateforme élévatrice plusieurs fois toutes les vitesses de la boîte en l’espace d’env. 10 min. Vidanger ensuite l’huile de boîte usagée et remplir d’huile de boîte fraîche selon les prescriptions du fabricant.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '150ml', 21.0, 10, 'TSC-00406-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2512 - Nettoyeur de boîtes de vitesses auto­ma­tiques (30
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2512', 'Nettoyeur de boîtes de vitesses auto­ma­tiques (300ml)', 'nettoyeur-de-boites-de-vitesses-automatiques-300ml', 'Description

Convient à toutes les boîtes de vitesses automatiques ! Le contenu de la bouteille est suffisant pour 6 à 9 l d’huile. Peut être mélangé à l’huile de boîte de vitesses par un entonnoir introduit dans la jauge ou être utilisé dans tous les appareils de nettoyage du commerce pour boîtes de vitesses automatiques.





utilisation simple
rentabilité élevée
n’attaque pas les matériaux d’étanchéité courants
nettoyage en douceur
assure le passage optimal des rapport
nettoyage rapide





Appli­ca­tion

Ajouter le contenu à l’huile chaude (température de service) par un entonnoir introduit dans la jauge.avant d’effectuer la vidange de l’huile de boîte automatique. Laisser tourner le moteur en position parking pendant environ 10 min et passer toutes les positions du levier sélecteur au moins deux fois, le véhicule étant à l’arrêt. Après le nettoyage, effectuer la vidange d’huile et le remplacement du filtre en utilisant l’huile de boîte de vitesses LIQUI MOLY adéquate. Le contenu d', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '300ml', 37.0, 10, '2512-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1042 - Stop fuites d’huile pour engre­nages (50ml)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1042', 'Stop fuites d’huile pour engre­nages (50ml)', 'stop-fuites-dhuile-pour-engrenages-50ml', 'Description





élimine les fuites causées par les joints rétrécis ou poreux
prévient les pertes d’huile
utilisation simple
augmente la sécurité du fonctionnement
miscible avec les huiles de boîte de vitesses courantes





lubrification optimale dans toutes les conditions de service
empêche les fuites d’huile et la pollution
évite l’encrassement des embrayages par l’huile




Pour boîtes de vitesses mécaniques, boîtes auxiliaires et différentiels. Le contenu suffit pour traiter jusqu’à 1 l d’huile de boîte de vitesses. Ne convient pas aux boîtes DSG, boîtes automatiques ainsi qu’aux différentiels et motos avec embrayage à bain d’huile.
Appli­ca­tion
Le contenu traite jusqu’à 1 l d’huile de boîte de vitesses. Peut être ajouté à tout moment. L’effet d’étanchéité se manifeste au bout de 600 à 800 km environ. Recommandation : appliquer à chaque vidange d’huile de boîte de vitesses pour garantir l’étanchéité.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '50ml', 25.0, 10, '1042-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1099 - Anti-​fuite d’huile de direction assistée  (35ML)
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1099', 'Anti-​fuite d’huile de direction assistée  (35ML)', 'anti-fuite-dhuile-de-direction-assistee-35ml', 'Description

Ses additifs entretiennent parfaitement les joints en caoutchouc et en plastique du boîtier de direction. Évite les fuites d’huile, stoppe les fuites d’huile des boîtiers de direction non étanches et régénère les joints durcis. Nettoie les alésages et les canaux des boîtiers de direction en augmentant ainsi l’efficacité de l’huile. Réduit les bruits, augmente la durée de vie et diminue les coûts de réparation.

Convient aux boîtiers de direction utilisant les huiles ATF II, ATF III, ATF VI ou huiles pour systèmes hydrauliques centralisés. Verser le contenu dans le réservoir d’expansion du système de direction. 35 ml suffisent pour 1 litre d’huile.
Appli­ca­tion
Verser le contenu dans le réservoir d’expansion du système de direction. 35 ml traitent un volume d’huile de 1 l.




prévient les pertes d’huile
augmente la durée de vie
bonne protection anticorrosion
minimise les bruits
régénère les joints





nettoie et entretient
empêche le vieillissement rapide de l’huile', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '35ML', 18.0, 10, '1099-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8336 - ATF Additive ( 250ML )
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8336', 'ATF Additive ( 250ML )', 'atf-additive-250ml', 'Description

Entretient de façon optimale les joints en caoutchouc et matière plastique dans les boîtiers de direction et boîtes de vitesses automatiques. Les fuites au niveau des boîtes de vitesses, causées par des joints durcis ou fragilisés, sont évitées ou éliminées. Les alésages et les canaux dans la boîte de vitesses sont nettoyés et l’efficacité de l’huile augmente. La formation de bruits est réduite et le passage de rapports de boîtes de vitesses automatique amélioré. Prolonge la durée de vie des boîtiers de direction et boîtes de vitesses automatiques.
 
Mélanger les additifs ATF à l’huile de boîte de vitesses soit dans le réservoir d’expansion de la direction assistée, soit par la jauge. Le contenu de 250 ml suffit à traiter 8 litres d’huile au maximum. Convient à toutes les boîtes de direction et boîtes de vitesses automatiques utilisant les huiles ATF II et ATF III.
 

Appli­ca­tion
Ajouter l’additif ATF à l’huile de boîte de vitesses par le trou de la jauge. Le contenu de', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '250ML', 50.0, 10, '8336-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8367 - Additif poussoirs hydrau­liques
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8367', 'Additif poussoirs hydrau­liques', 'additif-poussoirs-hydrauliques', 'Description

Réduit les bruits des poussoirs à commande hydraulique. Nettoie les alésages d’écoulement et conduits du circuit d’huile, et veille à leur état de fonctionnement optimal. Augmente la sécurité de fonctionnement et le confort de conduite du véhicule. Améliore le fonctionnement des tendeurs de chaîne de distribution remplis d’huile sous pression.

Pour toutes les huiles moteur courantes destinées aux moteurs essence et diesel avec ou sans filtre à particules diesel (DPF). Compatible avec catalyseur et turbocompresseur. Le contenu suffit pour traiter jusqu’à 6 l d’huile moteur. Ne convient pas aux motos avec embrayage à bain d’huile.
Appli­ca­tion
Le contenu (300 ml) suffit pour traiter jusqu’à 6 l d’huile moteur. Des ajouts peuvent être effectués à tout moment. Après l’ajout, amener le moteur à température. Pour garantir une efficacité sur le long terme, utiliser l’additif après chaque vidange d’huile.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 27.0, 10, '8367-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8360 - Stop fumée d’huile
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8360', 'Stop fumée d’huile', 'stop-fumee-dhuile', 'Description

Réduit la consommation d’huile par les segments de piston et les guides de soupape sur les moteurs essence et diesel. Prévient la formation de fumée bleue et de brouillard d’huile, et agit contre les baisses de viscosité des huiles moteur. Augmente la compression et réduit les bruits du moteur. Assure une protection renforcée des moteurs à forte usure. Prolonge la durée de vie de catalyseurs de gaz d’échappement.
 
Pour tous les moteurs essence et diesel. Compatible avec toutes les huiles moteur du commerce. Ne convient pas aux motos avec embrayage à bain d’huile.
 

Appli­ca­tion
Une bouteille de 300 ml traite jusqu’à 4-6 l d’huile moteur. Ne pas ajouter plus de 10 %. Ajouter à l’huile moteur chaude lors de chaque vidange d’huile, de même qu’entre les vidanges si la consommation d’huile est très élevée.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 24.0, 10, '8360-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2428 - Pro-Line Rinçage moteur 5L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2428', 'Pro-Line Rinçage moteur 5L', 'pro-line-rincage-moteur-5l', 'Description

Nettoie le moteur de l’intérieur et élimine les dépôts des alésages d’huile, roulements, de la zone des segments de piston, etc. Réduit les bruits du moteur et la consommation d’huile, améliore la compression et augmente la sécurité de fonctionnement du véhicule. Permet, après la vidange, à l’huile moteur de déployer toute son efficacité.
 
Pour tous les moteurs à essence et diesel avec et sans filtre à particules (DPF/GPF). Assure un parfait fonctionnement hydraulique des systèmes à commande pour huile, comme par exemple VVT, VANOS et des systèmes similaires. Peut s’utiliser sans problèmes sur des véhicules munis de courroies crantées à bain d’huile. 500 ml suffisent pour un volume d’huile jusqu’à 5 l. Compatible avec catalyseur et turbocompresseur.
 

Appli­ca­tion
500 ml suffisent pour un volume d’huile jusqu’à 5 l. Ajouter avant la vidange à l’huile moteur à température de service. Après l’ajout, faire tourner le moteur au ralenti pendant environ 10-15 minutes, selon l', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 255.0, 10, '2428-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 2427 - Pro-Line Rinçage moteur
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2427', 'Pro-Line Rinçage moteur', 'pro-line-rincage-moteur', 'Description

Nettoie le moteur de l’intérieur et élimine les dépôts des alésages d’huile, roulements, de la zone des segments de piston, etc. Réduit les bruits du moteur et la consommation d’huile, améliore la compression et augmente la sécurité de fonctionnement du véhicule. Permet, après la vidange, à l’huile moteur de déployer toute son efficacité.
 
Pour tous les moteurs à essence et diesel avec et sans filtre à particules (DPF/GPF). Assure un parfait fonctionnement hydraulique des systèmes à commande pour huile, comme par exemple VVT, VANOS et des systèmes similaires. Peut s’utiliser sans problèmes sur des véhicules munis de courroies crantées à bain d’huile. 500 ml suffisent pour un volume d’huile jusqu’à 5 l. Compatible avec catalyseur et turbocompresseur.
 

Appli­ca­tion
500 ml suffisent pour un volume d’huile jusqu’à 5 l. Ajouter avant la vidange à l’huile moteur à température de service. Après l’ajout, faire tourner le moteur au ralenti pendant environ 10-15 minutes, selon l', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 35.0, 10, '2427-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 5200 - Rinçage boue d‘huile
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '5200', 'Rinçage boue d‘huile', 'rincage-boue-dhuile', 'Description

La solution idéale pour nettoyer le moteur de l’intérieur. Élimine les boues noires et autres salissures, ainsi que les dépôts. Augmente la sécurité de fonctionnement du moteur et assure une lubrification suffisante. Nettoie en douceur les orifices d’huile, les filtres à huile, les gorges annulaires du piston et les conduits tout en évitant l’endommagement du moteur.
 
Indiqué pour toutes les huiles moteur courantes pour moteurs essence et diesel avec ou sans filtre à particules diesel (FAP). Compatible avec catalyseur et turbocompresseur. Ajouter env. 200 km avant la vidange d’huile. Le contenu suffit pour traiter jusqu’à 5 l d’huile moteur. S’utilise sans danger dans les véhicules équipés de courroies à bain d’huile. Ne convient pas aux motos avec embrayage à bain d’huile.
 

Appli­ca­tion
Une bouteille de 300 ml suffit pour les moteurs d’une capacité d’huile de 5 l. Après l’ajout, rouler pendant environ 200 km comme d’habitude, en évitant la pleine charge. Ensuite, vida', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 34.0, 10, '5200-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 3721 - Cera Tec
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3721', 'Cera Tec', 'cera-tec', 'Description

Protection avancée contre l’usure avec de la céramique. Réduit le frottement et l’usure grâce à des composés de céramique qui supportent des charges chimiques et thermiques élevées. Empêche le contact direct métal sur métal et augmente ainsi la durée de vie des organes. Réduit la consommation de carburant des véhicules essence et diesel grâce à l’effet lubrifiant. Miscible avec toutes les huiles moteur et huiles de boîte de vitesses automobile du commerce.
 
Pour les moteurs, boîtes de vitesses mécaniques, pompes et compresseurs. S’ajoute à l’huile utilisée et est automiscible. Le contenu suffit pour 5 l d’huile. Effet longue durée jusqu’à 50 000 km. Convient aux courroies dentées à bain d’huile. Ne convient pas aux embrayages à bain d’huile !　
 

Appli­ca­tion
300 ml suffisent à traiter jusqu’à 5 litres d’huile moteur. Effet longue durée jusqu’à 50 000 km. Bien agiter avant l’emploi.





excellent comportement aux températures élevées et basses
chimiquement inerte
convie', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 97.0, 10, '3721-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 1145 - Huile pour boîtier de direction 3100
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '1145', 'Huile pour boîtier de direction 3100', 'huile-pour-boitier-de-direction-3100', 'Description

L’huile pour boîtier de direction 3100 est une huile de boîte de vitesses spécialement formulée utilisable aussi bien pour les directions mécaniques que pour les directions assistées.

Convient aux voitures particulières et aux petits véhicules industriels. Utilisation conforme aux spécifications préconisées par les fabricants d’organes ou d’automobiles et de boîtes de vitesses.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 40.0, 10, '1145-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00418 - Huile pour système hydrau­lique central 2300
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00418', 'Huile pour système hydrau­lique central 2300', 'huile-pour-systeme-hydraulique-central-2300', 'Description

Les huiles LIQUI MOLY pour systèmes hydrauliques centralisés remplissent les plus hautes exigences techniques et conviennent à de nombreuses applications dans le domaine automobile. Les formulations sélectionnées avec soin à partir des meilleures matières premières garantissent une excellente tenue aux températures et un bon fonctionnement des systèmes même à de très basses températures atteignant -45 °C. Toutes les huiles pour systèmes hydrauliques centralisés offrent une excellente protection contre l’usure, le vieillissement et la corrosion, de même que des valeurs de friction optimales et une très faible tendance à la formation de mousse.
MB 343.0', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 90.0, 10, 'TSC-00418-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 343.0')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00419 - Huile de boîte de vitesses à double embrayage 8100
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00419', 'Huile de boîte de vitesses à double embrayage 8100', 'huile-de-boite-de-vitesses-a-double-embrayage-8100', 'Description

Huile moteur haute performance basée sur des huiles modernes de base de synthèse HC et une combinaison de composants additifs performants. Embrayage très performant grâce aux additifs extrêmement résistants au cisaillement qui améliorent l’indice de viscosité, aux additifs modernes de protection contre l’usure ainsi qu’aux modificateurs de frottement stables. Le lubrifiant convient également aux boîtes de vitesses à double embrayage disposant d’une réserve d’huile commune pour l’embrayage, la synchronisation, le train planétaire et la commande hydraulique.



LIQUI MOLY recommande ce produit pour les véhicules et organes pour lesquels les spécifications ou références de pièce de rechange d’origine suivantes sont requisesBMW 83 22 0 440 214, BMW 83 22 2 147 477, BMW 83 22 2 148 578, BMW 83 22 2 148 579, BMW 83 22 2 167 666, BMW 83 22 2 433 157, BMW DCTF-1,BMW DCTF-1+,BMW DCTF-2 ,BMW MTF LT-5,
Chrysler 68044345 EA, Chrysler 68044345 GA,
Eaton PS-278,
Fiat 9.55550-HE2, Fiat 9', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 60.0, 5, 'TSC-00419-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 5, 'TSC-00419-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Fiat 9.55550-HE2')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 21378 - Top Tec ATF 1950
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '21378', 'Top Tec ATF 1950', 'top-tec-atf-1950', 'Description

Huile de boîte automatique offrant des performances optimales grâce à sa puissante combinaison d’agents actifs. Sa basse viscosité réduit la consommation et augmente le rendement. L’excellent coefficient de frottement permet de prolonger les intervalles de vidange.
MB 236.17', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 65.0, 10, '21378-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.17')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3648 - Top Tec ATF 1900
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3648', 'Top Tec ATF 1900', 'top-tec-atf-1900', 'Description

Huile de boîte automatique haute performance de dernière génération faite à partir d’huiles de base sélectionnées et d’additifs puissants ultramodernes. La viscosité réduite contribue à baisser la consommation ainsi qu’à améliorer le rendement.  Grâce à un coefficient de frottement extrêmement stable, les intervalles de vidange peuvent être prolongés.

Développée pour les boîtes de vitesses automatiques à 7 rapports des types 722.9 et 724.2 (hybride) de Mercedes-Benz.

MB 236.15', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 75.0, 10, '3648-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.15')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20625 - Top Tec ATF 1800 R
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20625', 'Top Tec ATF 1800 R', 'top-tec-atf-1800-r', 'Description

Huile de boîte de vitesses automatique de haute performance et de faible viscosité de la nouvelle génération basée sur la technologie de synthèse avec des additifs modernes et performants. En plus de son excellente stabilité au vieillissement et à l’oxydation, elle garantit un passage optimal des vitesses grâce à son indice de viscosité extrêmement élevé dans toutes les conditions d’utilisation. Permet de longs intervalles de vidange.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 60.0, 10, '20625-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'MB 236.12; MB 236.14; Fiat 9.55550-AV5')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00423 - Top Tec ATF 1800
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00423', 'Top Tec ATF 1800', 'top-tec-atf-1800', 'Description

Huile de boîte de vitesses automatique de haute performance et de faible viscosité de la nouvelle génération basée sur la technologie de synthèse avec des additifs modernes et performants. En plus de son excellente stabilité au vieillissement et à l’oxydation, elle garantit un passage optimal des vitesses grâce à son indice de viscosité extrêmement élevé dans toutes les conditions d’utilisation. Permet de longs intervalles de vidange.



permet un champ d’application très varié
excellente protection anticorrosion
excellente stabilité à l’oxydation
excellent comportement en friction
grande résistance au vieillissement





protection anti-usure élevée
empêche la formation de mousse
bon comportement viscosité-température
très bonnes propriétés à basse température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 60.0, 5, 'TSC-00423-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 5, 'TSC-00423-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'MB 236.12; MB 236.14; Fiat 9.55550-AV5')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3659 - Top Tec ATF 1600
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3659', 'Top Tec ATF 1600', 'top-tec-atf-1600', 'Description

Huile de boîte de vitesses automatique à technologie de synthèse de la toute nouvelle génération, avec réserve en puissance extrêmement élevée. Excellente stabilité au vieillissement. Assure la performance maximale de la boîte de vitesses. Assure un comportement optimal en friction et garantit une excellente résistance au vieillissement. Elle assure un fonctionnement irréprochable des coupleurs hydrauliques, même dans des conditions d’utilisation extrêmement difficiles et de fortes variations de température. Convient spécialement aux difficultés de passage de rapports. Avec formule améliorée pour une longue durée de vie de la boîte de vitesses. Permet des intervalles de vidange d’huile extrêmement longs.
Spécifications / Homologations
MB-Approval 236.14
LIQUI MOLY recommande
MB 236.12', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 76.0, 10, '3659-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'MB 236.12; MB236.14')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 3662 - Top Tec ATF 1400
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '3662', 'Top Tec ATF 1400', 'top-tec-atf-1400', 'Description

Huile de boîte de vitesses automatique à technologie de synthèse de la toute dernière génération, avec réserve en puissance extrêmement élevée. Évite la formation de dépôts gênants et redonne à la boîte de vitesses moteur sa pleine puissance de façon permanente. Assure un comportement optimal en friction et garantit une excellente résistance au vieillissement. Assure le bon fonctionnement des groupes et leur confère une longévité maximale. Surpasse les impératifs les plus sévères dictés par les fabricants d’automobiles et de groupes renommés.



excellente protection anti-usure
extrêmement stable au vieillissement
excellente protection anticorrosion
excellente stabilité à l’oxydation
excellent comportement en friction





empêche la formation de mousse
bon comportement viscosité-température
très bonnes propriétés à basse température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 55.0, 10, '3662-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'MB 236.20')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00426 - Top Tec ATF 1200
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00426', 'Top Tec ATF 1200', 'top-tec-atf-1200', 'Description

Huile pour boîtes de vitesses automatiques de nouvelle génération, à base d’huiles synthétiques d’hydrocraquage en liaison avec des additifs modernes et performants. Elle satisfait aux exigences de nombreux constructeurs de boîtes de vitesses automatiques et d’automobiles. Assure un comportement optimal en friction et s’avère extrêmement résistante au vieillissement.



permet un champ d’application très varié
excellente protection anticorrosion
excellente protection anti-usure
excellent comportement en friction
stabilité thermique maximale





grande stabilité chimique
stabilité au vieillissement optimale
bon comportement viscosité-température
très bonnes propriétés à basse température', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 50.0, 5, 'TSC-00426-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 50.0, 5, 'TSC-00426-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.10; MB 236.11; MB 236.2; MB 236.5; MB 236.6; MB 236.7; MB 236.9; MB 236.91')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00427 - Top Tec ATF 1100
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00427', 'Top Tec ATF 1100', 'top-tec-atf-1100', 'Description

Huile moderne universelle pour boîtes de vitesses automatiques, à base d’huiles synthétiques d’hydrocraquage en liaison avec des additifs modernes et performants.Elle garantit un fonctionnement irréprochable du liquide de transmission, même dans des conditions d’utilisation extrêmement difficiles et de fortes variations de température. Convient également comme liquide hydraulique pour les systèmes fonctionnant dans des conditions difficiles.
 
Pour boîtes de vitesses automatiques, boîtes de vitesses mécaniques, systèmes de direction, systèmes hydrauliques et prises de force, aussi bien dans le secteur des voitures particulières que dans celui des véhicules industriels. Utilisation conforme aux spécifications préconisées par les fabricants d’organes ou d’automobiles et de boîtes de vitesses.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 5, 'TSC-00427-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 5, 'TSC-00427-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'MB 236.6')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 20842 - Top Tec MTF 5100 75W
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '20842', 'Top Tec MTF 5100 75W', 'top-tec-mtf-5100-75w', 'Description




excellente protection anti-usure
excellente stabilité au cisaillement
assure une moindre consommation de carburant
excellente stabilité à l’oxydation
excellente protection anticorrosion





bon comportement viscosité-température
excellent passage des rapports dans toutes les conditions de service
comportement synchrone remarquable', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 48.0, 10, '20842-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API GL4', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Ford WSS-M2C; Fiat 9.55550-MZ6')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8103 - Huile pour engrenages MANNOL Extra 75W-90 GL-4/GL-
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8103', 'Huile pour engrenages MANNOL Extra 75W-90 GL-4/GL-5 LS', 'huile-pour-engrenages-mannol-extra-75w-90-gl-4-gl-5-ls', 'Description

Caractéristiques du produit :
– La base synthétique unique de la plus haute qualité avec une viscosité idéale dans une large plage de températures en combinaison avec un ensemble d’additifs de dernière génération assure des propriétés antifriction supérieures, garantissant ainsi une économie de carburant significative et un changement de vitesse en douceur ;
– Grâce à sa composition unique, elle assure d’excellentes propriétés anti-usure et anti-éraflure qui prolongent considérablement la durée de vie prévue de l’équipement technique dans tous les modes de fonctionnement, même les plus extrêmes, dans une large plage de températures ambiantes. Le film d’huile a une résistance améliorée à une pression accrue. Il empêche le blocage des différentiels et réduit l’usure des pistons ;
– Il possède des propriétés supérieures à basse température qui assurent un démarrage facile, une lubrification fiable, ainsi qu’un changement de vitesse facile et précis à toutes les températures a', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 38.0, 10, '8103-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W90', 'API GL-4', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00430 - MANNOL Molibden 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00430', 'MANNOL Molibden 10W-40', 'mannol-molibden-10w-40', 'Description

Huile moteur universelle à base hydrosynthétique, spécialement développée pour tous types de moteurs essence et diesel, y compris les moteurs poids lourds. Contient du molybdène organique et inorganique (MoS2).
Propriétés du produit :
– La base HC assure un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode urbain et sur autoroute ;
– Contient du molybdène organique et inorganique, offrant des propriétés antifriction et extrême pression uniques. Réduit efficacement l’usure grâce à un film protecteur unique qui peut résister à des charges extrêmes ;
– Un ensemble efficace d’antioxydants résiste efficacement au vieillissement ;
– Un ensemble d’additifs moderne préserve la fonctionnalité et les performances du moteur pendant tout l’intervalle entre les remplacements et maintient une viscosité stable tout au long de la durée de vie.
Conçu pour les moteurs essence et diesel d’une large flotte de voitures (voitures, SUV l', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 93.0, 10, 'TSC-00430-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN/CH-4', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 65648 - WOLF OFFICIALTECH 5W30 C3 SP EXTRA
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-moto-2t-4t';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '65648', 'WOLF OFFICIALTECH 5W30 C3 SP EXTRA', 'wolf-officialtech-5w30-c3-sp-extra', 'Description





Description
Il s’agit d’un lubrifiant entièrement synthétique composé d’huiles de base de très haute qualité et soigneusement sélectionnées, formulé grâce à la toute dernière technologie élaborée pour les huiles moteurs compatibles pour convertisseurs catalytiques. Sa formulation spéciale associe économies de carburant et durée de service prolongée. Cette formulation limitant les cendres protège les filtres à particules et les dispositifs de post-traitement d’échappement.
Applications
Cette huile dexos 2TM est requise pour tous les nouveaux modèles GM/Opel/Vauxhall/Chevrolet diesel et à essence. GM/Opel a indiqué que la spécification dexos 2TM est rétrocompatible avec les spécifications GM/Opel plus anciennes (GM-LL-A-025 et GM-B-LL-025). La majorité des véhicules diesel et à essence GM/Opel/Vauxhall/Chevrolet peuvent utiliser des lubrifiants dexos 2TM. Large champ d’application avec ACEA C3/C2 et couvrant également API SP.
Performances
La norme Dexos 2 implique un liq', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 29.0, 3, '65648-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 29.0, 3, '65648-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 29.0, 3, '65648-U-3')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SP', NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00432 - MANNOL Diesel Extra 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00432', 'MANNOL Diesel Extra 10W-40', '2005', 'Description

Caractéristiques du produit :
– La technologie ester et une base hydrosynthétique avec une plage étendue de propriétés visco-température garantissent un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode ville, en mode autoroute, ainsi que sous charge accrue (lors de la conduite sur des routes impraticables, en montée, en déplacement avec une remorque, charge maximale) et à des températures ambiantes élevées :
– Idéale pour la conduite active et ne perd pas ses propriétés lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de la grande réserve d’indice alcalin (TBN) ;
– La base hydrosynthétique contenant des esters associée à un ensemble d’additifs moderne préserve les paramètres de puissance du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants de l’huile ester en combinaison avec un ensemble d’additifs modernes uniques offrent d’exce', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 23.0, 5, 'TSC-00432-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 23.0, 5, 'TSC-00432-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API CH-4/SN', 'ACEA A3/B4', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; MB 229.1; RENAULT RN0700; RENAULT RN0710; PSA B71 2296')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00433 - MANNOL Classic 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00433', 'MANNOL Classic 10W-40', 'mannol-classic-10w-40-2', 'Description

Propriétés du produit :
– La technologie Ester associée à la base HC avec une gamme élargie de propriétés viscosité-température assure un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode urbain et sur autoroute, sous charge accrue (conduite tout-terrain et en montée, remorquage, conduite avec charge maximale) et à des températures ambiantes élevées ;
– Idéal pour la conduite active. Ne perd pas sa fonctionnalité lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de l’indice de base total (TBN) élevé ;
– Préserve les paramètres de puissance et la fonctionnalité du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants en ester associés à un ensemble d’additifs modernes et uniques offrent d’excellentes propriétés anti-usure et anti-friction grâce à la durabilité exceptionnelle du film d’huile, qui, combinées à une bonne pompabilité, augme', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 120.0, 10, 'TSC-00433-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN/CH-4', 'ACEA A3/B4', 'JASO MA2', FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'MB 229.1; RENAULT RN0700; RENAULT RN0710; PSA B71 2296')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00434 - MANNOL Diesel Extra 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00434', 'MANNOL Diesel Extra 10W-40', 'mannol-diesel-extra-10w-40-2', 'Description

Caractéristiques du produit :
– La technologie ester et une base hydrosynthétique avec une plage étendue de propriétés visco-température garantissent un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode ville, en mode autoroute, ainsi que sous charge accrue (lors de la conduite sur des routes impraticables, en montée, en déplacement avec une remorque, charge maximale) et à des températures ambiantes élevées :
– Idéale pour la conduite active et ne perd pas ses propriétés lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de la grande réserve d’indice alcalin (TBN) ;
– La base hydrosynthétique contenant des esters associée à un ensemble d’additifs moderne préserve les paramètres de puissance du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants de l’huile ester en combinaison avec un ensemble d’additifs modernes uniques offrent d’exce', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 125.0, 10, 'TSC-00434-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API CH-4/SN', 'ACEA A3/B4', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'MB 229.3; MB 229.1; RENAULT RN0700; RENAULT RN0710; PSA B71 2296')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00435 - MANNOL Classic 10W-40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00435', 'MANNOL Classic 10W-40', 'mannol-classic-10w-40-3', 'Description

Propriétés du produit :
– La technologie Ester associée à la base HC avec une gamme élargie de propriétés viscosité-température assure un fonctionnement efficace du moteur dans tous les modes de fonctionnement : lors du démarrage à froid, en mode urbain et sur autoroute, sous charge accrue (conduite tout-terrain et en montée, remorquage, conduite avec charge maximale) et à des températures ambiantes élevées ;
– Idéal pour la conduite active. Ne perd pas sa fonctionnalité lors de l’utilisation de carburant de qualité variable (avec une teneur en soufre jusqu’à 500 ppm) en raison de l’indice de base total (TBN) élevé ;
– Préserve les paramètres de puissance et la fonctionnalité du moteur pendant tout l’intervalle entre les remplacements ;
– Les composants en ester associés à un ensemble d’additifs modernes et uniques offrent d’excellentes propriétés anti-usure et anti-friction grâce à la durabilité exceptionnelle du film d’huile, qui, combinées à une bonne pompabilité, augme', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 160.0, 10, 'TSC-00435-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '10W40', 'API SN/CH-4', 'ACEA A3/B4', 'JASO MA2', FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'MB 229.1; RENAULT RN0700; RENAULT RN0710; PSA B71 2296')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00436 - WOLF OFFICIALTECH 5W30 MS-Ford
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00436', 'WOLF OFFICIALTECH 5W30 MS-Ford', 'wolf-officialtech-5w30-ms-ford', 'Description

Description
Il s’agit d’un lubrifiant entièrement synthétique composé d’huiles de base de très haute qualité et soigneusement sélectionnées, spécialement développé en fonction des exigences des spécifications WSS-M2C913-C/D de Ford. Il se caractérise par des propriétés lubrifiantes considérablement améliorées et permet de réaliser des économies de carburant (> 3 %). Cette huile remplace les spécifications M2C-913-A/B.
Applications
Il est imposé pour les modèles Ford à compter de 2009. Il est également requis pour les véhicules équipés de moteurs 2.2L Duratorq TDCI et est rétrocompatible avec les moteurs Ford nécessitant la spécification Ford M2C913-A ou M2C913-B, à l’exception des modèles équipés d’injecteurs-pompes (Galaxy I et II) et des modèles Ford KA (moteurs diesel et à essence depuis 2009).
Performances
Huile nouvelle génération, à faible viscosité et à fluidité élevée. Elle atteint les objectifs d’économies de carburant et de réduction des émissions, tout en permet', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 31.0, 5, 'TSC-00436-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 31.0, 5, 'TSC-00436-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00437 - WOLF OFFICIALTECH 0W30 SP
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00437', 'WOLF OFFICIALTECH 0W30 SP', 'wolf-officialtech-0w30-sp', 'Description

Description
Il s’agit d’un lubrifiant entièrement synthétique composé d’huiles de base soigneusement sélectionnées. Sa formule est spécialement conçue pour répondre aux spécifications BMW Longlife-12 FE et Ford WSS M2C950-A. Il est adapté afin de répondre aux exigences des dernières technologies des moteurs turbo de pointe nécessitant des huiles hautes performances et à plus faible viscosité.
Applications
L’utilisation de ce produit est obligatoire sur les derniers moteurs à essence et diesel BMW et Ford. Il est compatible avec plusieurs véhicules grâce à la spécification ACEA C2. Sa formule est optimisée pour les voitures actuelles avec un film lubrifiant hautement résistant qui empêche sa décomposition et réduit la friction pour davantage de fiabilité et d’économies de carburant.
Performances
Grâce à sa faible viscosité et à sa remarquable fluidité, cette huile réduit considérablement l’usure tout en réduisant la consommation de carburant et les émissions de CO2. L’ensem', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 179.0, 10, 'TSC-00437-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '0W30', NULL, 'ACEA C2.', NULL, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00438 - WOLF VITALTECH 5W40
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00438', 'WOLF VITALTECH 5W40', 'wolf-vitaltech-5w40', 'Description

Description
Il s’agit d’un lubrifiant entièrement synthétique composé d’huiles de base et d’additifs de très haute qualité et soigneusement sélectionnés de dernière génération, spécialement conçu pour répondre aux exigences strictes des fabricants. Il fournit une excellente fluidité à basse température, une résistance très faible au démarrage, un indice de viscosité exceptionnel et une stabilité thermique très élevée.
Applications
Cette huile est utilisée dans les moteurs à essence des voitures hautes performances et les moteurs diesel de voitures de tourisme à injection directe et turbo. Sa haute qualité permet de longs intervalles de vidange, selon les exigences particulières des fabricants.
Performances
Grâce à sa faible viscosité et à sa fluidité remarquable, cette huile garantit un bon démarrage à froid et contribue à diminuer l’usure du moteur. Un ensemble d’additifs de pointe assure la propreté et la durabilité des moteurs, même dans des conditions extrêmes.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 26.0, 3, 'TSC-00438-U-1')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 26.0, 3, 'TSC-00438-U-2')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 26.0, 3, 'TSC-00438-U-3')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W40', NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00439 - WOLF GUARDTECH 15W40 SL/CF
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00439', 'WOLF GUARDTECH 15W40 SL/CF', 'wolf-guardtech-15w40-sl-cf', 'Description

Description
Cette huile minérale d’excellente qualité affiche des performances prouvées. Elle a été mise à niveau pour satisfaire, et même dépasser, la norme ACEA A3/B4-08. Elle convient à la plupart des voitures et véhicules utilitaires légers 4 temps à essence ou diesel.
Applications
Moteurs 4 temps à essence de voitures de tourisme (soupapes multiples, turbo, etc.) ; moteurs 4 temps diesel, avec ou sans turbo. Grande compatibilité avec le biodiesel, basée sur de nombreux essais sur le terrain.
Performances
Formulation d’huile résistante, qui garde le moteur propre, limite l’oxydation et protège contre la boue, la suie et les dépôts des pistons. Elle affiche une fluidité suffisante à basses températures et une viscosité stable à des températures élevées.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 71.5, 10, 'TSC-00439-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '15W40', NULL, 'ACEA A3/B4-08.', NULL, FALSE, FALSE, TRUE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 23300 - WOLF OFFICIALTECH 75W-85 GL 5
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '23300', 'WOLF OFFICIALTECH 75W-85 GL 5', 'wolf-officialtech-75w-85-gl-5', 'Description

Description
Prévu pour les boîtes de vitesses et composé d’huiles de base de haute qualité spécialement sélectionnées et d’un ensemble d’additifs personnalisé, ce lubrifiant de type « Extreme Pressure » a été spécialement formulé pour répondre aux conditions de fonctionnement les plus éprouvantes : vitesse élevée, charges par à-coups, couples élevés à bas régime et multicompatibilité synchromesh.
Applications
Recommandée pour toutes les transmissions hypoïdes, cette huile convient également aux roues coniques spirales, roues hélicoïdales et à la plupart des boîtes-pont.
Performances
Ce liquide de transmission manuelle assure une lubrification adéquate à des températures très basses comme très hautes, et protège contre la corrosion, l’usure, l’épaississement et les dépôts', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 32.0, 10, '23300-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W85', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 2408 - WOLF EXTENDTECH 80W90 LS GL 5
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '2408', 'WOLF EXTENDTECH 80W90 LS GL 5', 'wolf-extendtech-80w90-ls-gl-5', 'Description

Description
Cette huile minérale est composée d’huiles de base paraffiniques et d’additifs sélectionnés à base de soufre et de phosphore. Un additif spécial anti-friction confère à cette huile les propriétés nécessaires pour une utilisation dans les différentiels équipés d’un mécanisme à glissement limité.
Applications
Cette huile est particulièrement adaptée aux essieux arrière hypoïdes avec mécanisme de glissement limité.
Performances
Cette huile pour transmission de haute qualité est formulée avec d’excellents additifs et huiles de base sélectionnées, ce qui améliore les propriétés anti-friction et permet de l’utiliser dans les applications à glissement limité. Elle offre une bonne protection contre l’oxydation, la corrosion et la rouille, ce qui permet d’allonger la durée de vie des engrenages.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 25.0, 10, '2408-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '80W90', NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00442 - WOLF EXTENDTECH 75W90 GL 5
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00442', 'WOLF EXTENDTECH 75W90 GL 5', 'wolf-extendtech-75w90-gl-5', 'Description

Description
Il s’agit d’un lubrifiant semi-synthétique composé d’huiles de base hautement raffinées et soigneusement sélectionnées. Cette huile de transmission est dotée d’un indice de viscosité exceptionnellement élevé. Elle affiche une excellente fluidité à basses températures et garantit une longue durée de vie de l’huile et des engrenages.
Applications
Cette huile de transmission spéciale, dotée de propriétés de « pression extrême », est composée spécifiquement pour empêcher la corrosion sur les alliages de cuivre. Elle convient aux boîtes de vitesses modernes et à certains essieux arrière, notamment lorsque l’utilisation d’huiles plus épaisses crée des problèmes de changement de vitesse.
Performances
Huiles de base soigneusement sélectionnées et associées à un ensemble d’additifs performants, comprenant des composants synthétiques et permettant de limiter la dégradation de l’huile et d’allonger les intervalles d’entretien.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 32.0, 10, 'TSC-00442-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W90', NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00443 - WOLF ECOTECH CVT FLUID
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00443', 'WOLF ECOTECH CVT FLUID', 'wolf-ecotech-cvt-fluid', 'Description

Description
Il s’agit d’un lubrifiant entièrement synthétique composé d’huiles de base de très haute qualité et soigneusement sélectionnées, qui a été développé pour être utilisé dans la plupart des boîtes de vitesses CVT. Il convient aux transmissions à variation continue équipées de courroies ou de chaînes en acier. Il offre une protection exceptionnelle contre l’usure et affiche des caractéristiques stables en matière de frottements.
Applications
Les équipementiers recommandent généralement des fluides CVT spécifiques pour leurs transmissions. Grâce à une formulation soigneusement équilibrée d’huiles de base et d’additifs avancés, ce fluide répond aux exigences des constructeurs européens et japonais de transmissions CVT. Ce produit peut être contre-indiqué pour certains véhicules hybrides nécessitant des fluides spécifiques.
Performances
Spécifiquement conçu pour les transmissions CVT, ce fluide haute qualité garantit des changements de vitesse faciles et souples, ains', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 38.0, 10, 'TSC-00443-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00444 - WOLF ECOTECH DSG FLUID
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'wolf';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00444', 'WOLF ECOTECH DSG FLUID', 'wolf-ecotech-dsg-fluid', 'Description

Description
Il s’agit d’un lubrifiant entièrement synthétique composé d’huiles de base de très haute qualité et soigneusement sélectionnées, spécialement élaboré pour les transmissions à double embrayage (DCT) des voitures de tourisme récentes. Il garantit le bon fonctionnement de ces boîtes de vitesses.
Applications
Principalement conçu pour les boîtes automatiques à passage direct (DSG) de la VAG, ce fluide peut également être utilisé pour les transmissions DCT à 6 rapports, telles que Chrysler Powershift, Ford Powershift, Mitsubishi TC-SST, Volvo Powershift, BMW Drivelogic 7 vitesses, etc. Ce produit n’est pas destiné aux embrayages à sec VW des boîtes DSG de types 0AM, 02M, 02Q et 02S.
Performances
Ce fluide haute qualité allie la fonctionnalité des transmissions manuelles et automatiques. Grâce à sa formulation spécifique, il garantit des performances stables dans des conditions de conduite variables, même dans des conditions difficiles. Il contribue significativement', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 40.0, 10, 'TSC-00444-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7703 - MANNOL Formule énergétique PSA 5W-30 4L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7703', 'MANNOL Formule énergétique PSA 5W-30 4L', 'mannol-formule-energetique-psa-5w-30-4l', 'Description

Caractéristiques du produit :
– Les composants esters offrent d’excellentes propriétés anti-usure et anti-friction grâce à la durabilité exceptionnelle du film d’huile, qui, combinée à une excellente pompabilité, augmente considérablement la durée de vie du moteur ;
– Économise activement du carburant grâce à une faible viscosité HTHS ;
– Assure un démarrage à froid facile et en douceur grâce à une excellente aptitude au démarrage et à la pompabilité, ce qui réduit considérablement l’usure du moteur ;
– Maintient une viscosité optimale dans une large plage de températures, ce qui garantit un fonctionnement stable du moteur dans tous les modes de fonctionnement, y compris les surcharges ;
– L’excellente capacité de lavage et de dispersion résiste efficacement à tous les types de dépôts et maintient les pièces du moteur exceptionnellement propres pendant tout l’intervalle entre les remplacements ;
– La stabilité thermo-oxydative élevée résiste efficacement au vieillissement,', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 120.0, 10, '7703-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SN/CH-4', 'ACEA C3', NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'PSA B71 2290; FIAT 9.55535-S1; FIAT 9.55535-S3')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 7713 - MANNOL pour voitures coréennes 5W-30 4L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7713', 'MANNOL pour voitures coréennes 5W-30 4L', 'mannol-pour-voitures-coreennes-5w-30-4l', 'Description

Caractéristiques du produit :
– Les composants esters offrent d’excellentes propriétés anti-usure et anti-friction grâce à la durabilité exceptionnelle du film d’huile, qui, combinée à une excellente pompabilité, augmente considérablement la durée de vie des moteurs même dans des conditions de conduite difficiles ;
– Un ensemble d’additifs très efficaces et une base synthétique garantissent un démarrage à froid sûr dans toutes les conditions, ce qui réduit considérablement l’usure au démarrage ;
– D’excellentes propriétés de lavage et de dispersion et la plus haute stabilité thermo-oxydative luttent efficacement contre tous les types de dépôts et maintiennent les pièces du moteur et les turbocompresseurs propres ;
– Compatible avec les derniers systèmes de post-traitement des gaz d’échappement ;
– Une base synthétique spéciale assure un fonctionnement sans problème à long terme du système de distribution à calage variable continu CVVT ;
– Convient aux moteurs avec des inte', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '4L', 115.0, 10, '7713-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '5W30', 'API SN/CH-4', 'ACEA A5/B5', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'FORD WSS-M2C929-A; FORD WSS-M2C946-A; FORD WSS-M2C946-B1; GM dexos1')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8109 - MANNOL Unigear 75W-80 GL-4/GL-5
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8109', 'MANNOL Unigear 75W-80 GL-4/GL-5', 'mannol-unigear-75w-80-gl-4-gl-5', 'Description

Caractéristiques du produit :
– La base synthétique à faible viscosité de la plus haute qualité avec une viscosité idéale dans la plage de températures requise en combinaison avec un ensemble d’additifs de dernière génération assure des propriétés antifriction supérieures, garantissant ainsi une économie de carburant significative et la douceur du changement de vitesse ;
– Grâce à sa composition unique, elle assure d’excellentes propriétés anti-usure et anti-éraflure qui prolongent considérablement la durée de vie prévue de l’équipement technique dans tous les modes de fonctionnement, même les plus extrêmes, dans une large plage de températures ambiantes ;
– La base synthétique assure des propriétés supérieures à basse température qui garantissent un démarrage facile, une lubrification fiable, ainsi qu’un changement de vitesse facile et précis aux températures ambiantes les plus basses (jusqu’à -45 °C) ;
– Grâce à sa base synthétique, il présente une grande stabilité à l’o', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 29.0, 10, '8109-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W80', NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9958 - MANNOL Nettoyant DPF 9958
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'filtres-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9958', 'MANNOL Nettoyant DPF 9958', 'mannol-nettoyant-dpf-9958', 'Description

Additif pour carburant diesel pour le nettoyage et la régénération de tous types de filtres à particules diesel (DPF) sans démontage ni démontage. Convient à tous les types de gazole et à tous les types de moteurs diesel équipés et non équipés de systèmes de régénération automatique du DPF. Particulièrement recommandé pour les voitures circulant en ville (dans les embouteillages) et/ou lorsqu’elles utilisent du carburant de mauvaise qualité.
Une utilisation régulière permet de restaurer le DPF aux paramètres d’usine.
Propriétés du produit :
– Réduit la température d’inflammation des suies dans le DPF, accélérant et facilitant ainsi le processus de postcombustion dans tous les modes de fonctionnement du moteur, et notamment en mode urbain, prolongeant ainsi la durée de vie du filtre et réduisant les coûts d’exploitation de la voiture ;
– Augmente la complétude de la combustion du carburant, réduisant ainsi sa consommation, toutes choses égales par ailleurs ;
– En augmentant', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 35.0, 10, '9958-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 9899 - Lubrifiant MANNOL M-40 9899
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-huile';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9899', 'Lubrifiant MANNOL M-40 9899', 'lubrifiant-mannol-m-40-9899', 'Description

Le lubrifiant MANNOL M-40 est un lubrifiant en aérosol universel (pénétrant, nettoyant, anticorrosion, anti-humidité, anti-grincement, etc.) – un analogue du WD-40. Il possède des propriétés lubrifiantes et protectrices uniques et a une large gamme d’applications. Idéal pour un usage professionnel et domestique. Il s’agit d’un mélange très efficace de solvants actifs et d’huiles à pénétration rapide.
Propriétés :
– Possède d’excellentes propriétés nettoyantes. Nettoie et élimine facilement la graisse, la saleté, les taches bitumineuses, les résidus de colle, etc. de la plupart des surfaces, en formant une couche protectrice ;
– Couvre la surface, empêchant l’apparition d’humidité même dans les micro-rugosités du métal ;
– Possède de bonnes propriétés lubrifiantes, réduit les frottements, assure le bon fonctionnement des joints et autres pièces mobiles des mécanismes, tout en ne laissant pas de traces grasses et collantes ;
– Possède d’excellentes propriétés hydrofuges et d', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 16.0, 10, '9899-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 4211-5 - MANNOL Liquide de refroidissement G11 5L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4211-5', 'MANNOL Liquide de refroidissement G11 5L', 'mannol-liquide-de-refroidissement-g11-5l', 'Description

Une solution de silicate (inorganique – IAT Inorganic Acid Technology) prête à l’emploi, conçue pour une utilisation toute l’année dans tous les systèmes de refroidissement modernes contenant des composants en cuivre, en laiton et en aluminium pour lesquels l’utilisation d’un antigel à base d’éthylène glycol est recommandée. .
Propriétés du produit :
– Il assure une protection fiable des métaux et alliages (laiton, cuivre, acier allié, fonte, aluminium) contre toutes les formes de corrosion, et prévient également une corrosion à haute température des surfaces en aluminium des moteurs modernes ;
– Il protège de la formation de dépôts ;
– Il possède d’excellentes propriétés de conductivité thermique et une résistance à la formation de mousse ;
– Il est neutre vis-à-vis des inserts et des durites, compatible avec tous types de composants en caoutchouc et en plastique d’un système de refroidissement ;
– C’est un liquide silicaté aux qualités de service exceptionnelles. Il ne c', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 10, '4211-5-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 4212-5 - MANNOL Liquide de refroidissement G12+ 5L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4212-5', 'MANNOL Liquide de refroidissement G12+ 5L', 'mannol-liquide-de-refroidissement-g12-5l', 'Description

Une solution carboxylée (organique – OAT Organic Acid Technology) prête à l’emploi, conçue pour une utilisation toute l’année dans tous les systèmes de refroidissement modernes pour lesquels l’utilisation d’un antigel à base d’éthylène-glycol est recommandée. Il assure une protection fiable de tout système de refroidissement.
Propriétés du produit :
– Il assure une protection fiable des métaux et alliages (laiton, cuivre, acier allié, fonte, aluminium) contre toutes les formes de corrosion, et prévient également une corrosion à haute température des surfaces en aluminium des moteurs modernes ;
– Il possède une stabilité thermique exceptionnelle. Il protège de la formation de dépôts ;
– Il possède d’excellentes propriétés de conductivité thermique et une résistance à la formation de mousse ;
– Il est neutre vis-à-vis des inserts et des durites, compatible avec tous types de composants en caoutchouc et en plastique d’un système de refroidissement ;
– Il présente une excellen', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 10, '4212-5-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'FORD WSS-M97B44-D')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 4112 - MANNOL Antigel AF12+ Longlife 1L Concentré
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4112', 'MANNOL Antigel AF12+ Longlife 1L Concentré', 'mannol-antigel-af12-longlife-1l-concentre', 'Description

Un antigel concentré carboxylé (organique – OAT Organic Acid Technology) destiné à une utilisation toute l’année dans tout système de refroidissement moderne pour lequel l’utilisation d’un antigel à base d’éthylène-glycol est recommandée.
Il assure une protection fiable de tout système de refroidissement.
Propriétés du produit :
– Il assure une protection fiable des métaux et alliages (laiton, cuivre, acier allié, fonte, aluminium) contre toutes les formes de corrosion, et prévient également une corrosion à haute température des surfaces en aluminium des moteurs modernes. Il offre des propriétés anticorrosion suffisantes à partir d’une concentration aussi faible que 20 % ;
– Il possède une stabilité thermique exceptionnelle. Il protège de la formation de dépôts ;
– Il possède d’excellentes propriétés de conductivité thermique et une résistance à la formation de mousse ;
– Il est neutre vis-à-vis des inserts et des durites, compatible avec tous types de composants en caoutc', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 23.0, 10, '4112-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'FORD WSS-M97B44-D')
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 4213-5 - MANNOL Liquide de refroidissement G13 5L
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4213-5', 'MANNOL Liquide de refroidissement G13 5L', 'mannol-liquide-de-refroidissement-g13-5l', 'Description

Une solution hybride (HOAT – Hybrid Organic Acid Technology) de haute technologie prête à l’emploi avec d’excellentes caractéristiques de fonctionnement destinée à une utilisation toute l’année dans tout système de refroidissement moderne pour lequel l’utilisation d’antigel à base de mono-éthylène glycol est recommandée . Il assure une protection fiable de tout système de refroidissement.
Propriétés du produit :
– Il assure une protection fiable des métaux et alliages (laiton, cuivre, acier allié, fonte, aluminium) contre toutes les formes de corrosion, et prévient également une corrosion à haute température des surfaces en aluminium des moteurs modernes ;
– Le paquet d’additifs non organiques protège immédiatement la surface et la partie organique ne commence à agir que lorsque des sources de corrosion apparaissent ainsi une protection maximale est atteinte dès le début de l’utilisation et la durée de vie du moteur est prolongée ;
– Il possède une stabilité thermique exce', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '5L', 40.0, 10, '4213-5-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 4113-1 - MANNOL Antigel AG13 1L Concentré
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'antigel-refroidissement';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '4113-1', 'MANNOL Antigel AG13 1L Concentré', 'mannol-antigel-ag13-1l-concentre', 'Description

Antigel concentré hybride (HOAT – Hybrid Organic Acid Technology) de haute technologie avec d’excellentes caractéristiques de fonctionnement destiné à une utilisation toute l’année dans tout système de refroidissement moderne pour lequel l’utilisation d’un antigel à base de mono-éthylène-glycol est recommandée.
Il assure une protection fiable de tout système de refroidissement.
Propriétés du produit :
– Il assure une protection fiable des métaux et alliages (laiton, cuivre, acier allié, fonte, aluminium) contre toutes les formes de corrosion, et prévient également une corrosion à haute température des surfaces en aluminium des moteurs modernes. Il offre des propriétés anticorrosion suffisantes à partir d’une concentration aussi faible que 30 % ;
– Le paquet d’additifs non organiques protège immédiatement la surface et la partie organique ne commence à agir que lorsque des sources de corrosion apparaissent ainsi une protection maximale est atteinte dès le début de l’utilisa', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1L', 23.0, 10, '4113-1-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: TSC-00455 - MANNOL Motor Doctor + Ester
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00455', 'MANNOL Motor Doctor + Ester', 'mannol-motor-doctor-ester', 'Description

Propriétés :
– Remplace la perte de viscosité cinématique (à 100 °C) pendant le fonctionnement (en particulier lors de démarrages à froid fréquents) sans réduire les propriétés à basse température ;
– Augmente l’indice de viscosité ;
– Réduit les pertes de compression du cylindre en améliorant l’étanchéité dynamique entre le piston et le cylindre, réduisant ainsi la consommation de fonctionnement en empêchant l’huile de pénétrer dans la chambre de combustion ;
– Élimine les micro-fuites causées par l’usure mécanique des pièces détachées du moteur en ajoutant des modificateurs provoquant le blocage de ces fuites ;
– Pénètre dans les joints usés et les joints en caoutchouc, restaure leur ancien volume et leur élasticité, empêchant les fuites d’huile à travers eux ;
– Contient un ensemble d’additifs API SN/CG-4 ;
– Augmente l’épaisseur du film d’huile ;
– Réduit la volatilité de l’huile, ce qui réduit également la consommation opérationnelle et prolonge la durée de vie de l’h', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 28.0, 10, 'TSC-00455-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, 'API SN/CG-4', NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9829 - MANNOL Ceramo Ester
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9829', 'MANNOL Ceramo Ester', 'mannol-ceramo-ester', 'Description

Il s’agit d’une suspension stable de micropoudre de type graphite dans de l’éther.
Les molécules d’éther de l’additif sont liées magnétiquement aux surfaces métalliques en raison de leur polarité distincte et forment un film d’huile dense et très stable, tandis que les microparticules de céramique lissent les irrégularités des surfaces de friction et dissipent efficacement la chaleur. Cela évite le contact direct des surfaces métalliques et l’usure des pièces détachées même dans les conditions de fonctionnement les plus extrêmes. Le frottement sec lors des démarrages à froid, en particulier à des températures inférieures à zéro, est évité, minimisant ainsi l’usure lors du démarrage du moteur.
Français La couche limite qui se forme lors de l’application du produit a les propriétés suivantes :
– résistance à l’extrême pression – permettant au moteur et/ou à la transmission de fonctionner sous des charges accrues sans conséquences négatives ;
– excellentes propriétés anti-usu', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 40.0, 10, '9829-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 9900 - MANNOL Nettoyeur moteur
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '9900', 'MANNOL Nettoyeur moteur', 'mannol-nettoyeur-moteur-9900', 'Description

Caractéristiques du produit :
– Nettoie le système d’huile et les filets filtrants des pompes à huile. Pendant le processus de lavage, il assure une lubrification fiable, empêchant l’usure des pièces du moteur. En raison de la composition unique d’additifs détergents-dispersants, il garantit une élimination très efficace et sûre des dépôts de carbone, y compris du fond du piston ;
– Élimine les contaminants solubles et non solubles dans l’huile ;
– Le nettoyage est doux pour toutes les pièces et composants du moteur et ne les endommage pas ;
– Neutre pour les joints utilisés ;
– Il est miscible avec tous les types d’huiles moteur (minérales et synthétiques, etc.) et peut être utilisé pour rincer tous les moteurs à essence et diesel avec ou sans turbocompresseur, avec ou sans systèmes d’épuration des gaz d’échappement ;
– Complètement éliminé du système avec l’huile usagée.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 15.0, 10, '9900-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, NULL, NULL, NULL, NULL, FALSE, FALSE, TRUE, FALSE, TRUE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: 8102 - MANNOL Maxpower 75W-140 GL-5  4*4
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'huiles-boite-transmission';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'mannol';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8102', 'MANNOL Maxpower 75W-140 GL-5  4*4', 'mannol-maxpower-75w-140-gl-5-44', 'Description

Caractéristiques du produit :
– La base PAO unique à haute viscosité de la plus haute qualité préservant ses principales propriétés dans une large plage de températures en combinaison avec un ensemble d’additifs de dernière génération garantit des propriétés antifriction supérieures assurant ainsi une économie de carburant significative ;
– Grâce à sa composition unique, il assure des propriétés anti-usure et anti-éraflure supérieures qui prolongent considérablement la durée de vie prévue de l’équipement technique dans tous les modes de fonctionnement, même les plus extrêmes, dans une large plage de températures ambiantes. Le film d’huile a une résistance accrue aux pressions extrêmes ;
– Il assure d’excellentes propriétés à basse température qui assurent un démarrage facile et une lubrification fiable des pièces de transmission à toutes les températures ambiantes (jusqu’à -45 °C) et dans toutes les conditions de fonctionnement ;
– Il présente une stabilité thermo-oxydativ', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 48.0, 10, '8102-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
  INSERT INTO public."ProductSpecs" (id, "productId", viscosity, "apiStandard", "aeceaStandard", "jasoStandard", "isFullySynth", "isSemiSynth", "isMinerale", "DPFCompatible", "TurboCompatible", "HybridCompatible", "OEMApprovals")
  VALUES (gen_random_uuid()::text, prod_id, '75W140', 'API GL5', NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL)
  ON CONFLICT ("productId") DO NOTHING;

  -- Product: TSC-00459 - Engine Flush
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-moto';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'liqui-moly';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, 'TSC-00459', 'Engine Flush', '2116', 'Description

Nettoyant liquide extrêmement efficace, éliminant les dépôts gênants de la partie intérieure de moteurs. Les résidus en tout genre, solubles et insolubles dans l’huile, sont mis en suspension puis éliminés du circuit d’huile lors de la vidange d’huile. Le moteur débarrassé des dépôts et des impuretés ainsi que l’huile fraîche non contaminée par les vieux dépôts peuvent alors développer leur pleine puissance. L’usure du moteur s’en trouve réduite et sa longévité prolongée.
 
Convient aux moteurs essence et diesel. Peut s’utiliser sans problèmes sur des véhicules munis de courroies crantées à bain d’huile. 300 ml suffisent pour un volume d’huile jusqu’à 6 l. Ne convient pas à des motos dotées d’un embrayage à bain d’huile !
 

Appli­ca­tion
300 ml suffisent pour un volume d’huile jusqu’à 6 l. Ajouter à l’huile moteur avant la vidange d’huile. Après l’ajout, laisser tourner le moteur pendant env. 10 min au ralenti. Ensuite, vidanger l’huile et remplacer le filtre. Compatible', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 24.0, 10, 'TSC-00459-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7110+8931 - Pack Catalytic (nettoyage catalyseur) 7110+8931
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7110+8931', 'Pack Catalytic (nettoyage catalyseur) 7110+8931', 'pack-catalytic-nettoyage-catalyseur-71108931', 'Description

Appli­ca­tion
Ajouter au carburant à titre préventif. 300 ml suffisent pour traiter jusqu’à 70 l de carburant. Ajout du produit à tout moment, car le mélange s’effectue automatiquement. Effet longue durée jusqu’à 2 000 km.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 51.0, 10, '7110+8931-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 7110 - Catalytic-​System Clean
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '7110', 'Catalytic-​System Clean', 'catalytic-system-clean', 'Description

Appli­ca­tion
Ajouter au carburant à titre préventif. 300 ml suffisent pour traiter jusqu’à 70 l de carburant. Ajout du produit à tout moment, car le mélange s’effectue automatiquement. Effet longue durée jusqu’à 2 000 km.', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 27.0, 10, '7110-U')
  ON CONFLICT ("skuVariant") DO NOTHING;

  -- Product: 8931 - Catalytic-​​​​System Cleaner
  SELECT id INTO cat_id FROM public."Category" WHERE slug = 'additifs-carburant';
  SELECT id INTO brand_id FROM public."Brand" WHERE slug = 'generique';
  INSERT INTO public."Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
  VALUES (gen_random_uuid()::text, '8931', 'Catalytic-​​​​System Cleaner', 'catalytic-system-cleaner', 'Description

Appli­ca­tion

Verser l’additif dans le vaporisateur à pompe LIQUI MOLY (réf. 3316). Mettre le vaporisateur à pompe sous pression. Ménager l’accès à la tubulure d’admission, de préférence derrière le turbocompresseur. Important : l’accès doit impérativement se trouver en aval du débitmètre d’air massique. Démarrer le moteur et pulvériser l’additif en courts intervalles dans la tubulure d’admission, le moteur tournant à régime moyen (2 000-3 000 tr/mn). Si le régime reste régulier, la pulvérisation peut s’effectuer en intervalles plus longs. En cas de fortes variations de régime (<700 tr/mn), réduire la durée de pulvérisation. Afin d’assurer une atomisation fine, contrôler régulièrement la pression résiduelle dans le vaporisateur à pompe. LIQUI MOLY déclinera toute garantie en cas d’utilisation contraire aux directives figurant dans les informations concernant le produit ou si l’application se fait au moyen de systèmes de dosage différents du système indiqué ici. L’utilisat', FALSE, TRUE, brand_id, cat_id, NOW())
  ON CONFLICT (sku) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "categoryId" = EXCLUDED."categoryId", "brandId" = EXCLUDED."brandId", "isPublished" = EXCLUDED."isPublished"
  RETURNING id INTO prod_id;
  INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
  VALUES (gen_random_uuid()::text, prod_id, '1 Pièce', 26.0, 10, '8931-U')
  ON CONFLICT ("skuVariant") DO NOTHING;
END $$;

COMMIT;

-- Total products processed: 462