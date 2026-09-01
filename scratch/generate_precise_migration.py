import json
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from test_exact_classifier import classify_exact

items = json.load(open('all_live_products.json', encoding='utf-8'))

sql = """-- ============================================================
-- PRECISE CATALOGUE TAXONOMY & PRODUCT REORGANIZATION
-- Generated for all 467 live products on SpecPart
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- 1. ROOT CATEGORIES
-- ─────────────────────────────────────────────────────────────
INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId", "imageUrl")
VALUES
  (gen_random_uuid()::text, 'Automobile', 'automobile', 1, NULL, '/categories/auto.webp'),
  (gen_random_uuid()::text, 'Pièces de Rechange / D''origine', 'auto-pieces-rechange', 2, NULL, '/categories/pieces.webp'),
  (gen_random_uuid()::text, 'Moto & Karting', 'moto-karting', 3, NULL, '/categories/moto.webp'),
  (gen_random_uuid()::text, 'Marine', 'marine', 4, NULL, '/categories/marine.webp'),
  (gen_random_uuid()::text, 'Entretien & Accessoires', 'entretien-accessoires', 5, NULL, '/categories/entretien.webp')
ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder";

-- ─────────────────────────────────────────────────────────────
-- 2. ALL SUB-CATEGORIES WITH CORRECT PARENTS
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  auto_id text;
  pieces_id text;
  moto_id text;
  marine_id text;
  entretien_id text;
  additifs_id text;
  filtres_id text;
  eclairage_id text;
BEGIN
  SELECT id INTO auto_id FROM public."Category" WHERE slug = 'automobile';
  SELECT id INTO pieces_id FROM public."Category" WHERE slug = 'auto-pieces-rechange';
  SELECT id INTO moto_id FROM public."Category" WHERE slug = 'moto-karting';
  SELECT id INTO marine_id FROM public."Category" WHERE slug = 'marine';
  SELECT id INTO entretien_id FROM public."Category" WHERE slug = 'entretien-accessoires';

  -- Under Automobile
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huile Moteur', 'huiles-moteur', 1, auto_id),
    (gen_random_uuid()::text, 'Liquide de Frein', 'liquide-de-frein', 2, auto_id),
    (gen_random_uuid()::text, 'Liquide de Direction', 'direction-assistee', 3, auto_id),
    (gen_random_uuid()::text, 'Huile de Boîte & Transmission', 'huile-de-boite', 4, auto_id),
    (gen_random_uuid()::text, 'Additifs', 'additifs', 5, auto_id),
    (gen_random_uuid()::text, 'Liquide de Refroidissement & Antigel', 'antigel-refroidissement', 6, auto_id),
    (gen_random_uuid()::text, 'AdBlue', 'adblue', 7, auto_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = auto_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Under Additifs
  SELECT id INTO additifs_id FROM public."Category" WHERE slug = 'additifs';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Additif Essence', 'additif-essence', 1, additifs_id),
    (gen_random_uuid()::text, 'Additif Diesel', 'additif-diesel', 2, additifs_id),
    (gen_random_uuid()::text, 'Additif Huile & Rinçage', 'additif-huile', 3, additifs_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = additifs_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Under Pièces de Rechange
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Filtres', 'auto-filtres', 1, pieces_id),
    (gen_random_uuid()::text, 'Freinage', 'auto-freinage', 2, pieces_id),
    (gen_random_uuid()::text, 'Suspension & Direction', 'auto-suspension-direction', 3, pieces_id),
    (gen_random_uuid()::text, 'Boîte de Vitesse', 'transmission', 4, pieces_id),
    (gen_random_uuid()::text, 'Moteur & Distribution', 'auto-moteur-distribution', 5, pieces_id),
    (gen_random_uuid()::text, 'Électricité & Éclairage', 'auto-electricite-eclairage', 6, pieces_id),
    (gen_random_uuid()::text, 'Carrosserie & Habitacle', 'auto-carrosserie-habitacle', 7, pieces_id),
    (gen_random_uuid()::text, 'Autres pièces auto', 'auto-autres-pieces', 8, pieces_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = pieces_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Under auto-filtres
  SELECT id INTO filtres_id FROM public."Category" WHERE slug = 'auto-filtres';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Filtres à huile', 'filtres-huile', 1, filtres_id),
    (gen_random_uuid()::text, 'Filtres à air', 'filtres-air', 2, filtres_id),
    (gen_random_uuid()::text, 'Filtres à carburant', 'filtres-carburant', 3, filtres_id),
    (gen_random_uuid()::text, 'Filtres d''habitacle', 'filtres-habitacle', 4, filtres_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = filtres_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Under auto-electricite-eclairage
  SELECT id INTO eclairage_id FROM public."Category" WHERE slug = 'auto-electricite-eclairage';
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Batteries', 'batteries', 1, eclairage_id),
    (gen_random_uuid()::text, 'Essuie-glaces', 'essuie-glaces', 2, eclairage_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = eclairage_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Under Moto & Karting
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huiles Moteur (Moto & Karting)', 'moto-huiles', 1, moto_id),
    (gen_random_uuid()::text, 'Huiles Moteur Moto', 'moto-huile-moteur', 2, moto_id),
    (gen_random_uuid()::text, 'Huile de boîte Moto', 'moto-huile-boite', 3, moto_id),
    (gen_random_uuid()::text, 'Huile de fourche Moto', 'moto-huile-fourche', 4, moto_id),
    (gen_random_uuid()::text, 'Chaîne & Additifs Moto', 'moto-lubrifiants-chaine', 5, moto_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = moto_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Under Marine
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Huiles moteurs marins', 'marine-moteurs', 1, marine_id),
    (gen_random_uuid()::text, 'Hydraulique Marine', 'marine-hydraulique', 2, marine_id),
    (gen_random_uuid()::text, 'Graisses Marine', 'marine-graisses', 3, marine_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = marine_id, "sortOrder" = EXCLUDED."sortOrder";

  -- Under Entretien & Accessoires
  INSERT INTO public."Category" (id, "nameFr", slug, "sortOrder", "parentId")
  VALUES
    (gen_random_uuid()::text, 'Lavage, Carrosserie & Detailing', 'lavage-carrosserie', 1, entretien_id),
    (gen_random_uuid()::text, 'Nettoyage & Entretien Intérieur', 'nettoyage-interieur', 2, entretien_id),
    (gen_random_uuid()::text, 'Produits divers & Maintenance', 'produits-divers', 3, entretien_id)
  ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = entretien_id, "sortOrder" = EXCLUDED."sortOrder";

END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. DETERMINISTIC PRODUCT ASSIGNMENTS (ALL 467 PRODUCTS)
-- ─────────────────────────────────────────────────────────────
"""

# Generate update statement for each product
grouped = {}
for p in items:
    cat_slug = classify_exact(p)
    grouped.setdefault(cat_slug, []).append(p)

for cat_slug, prods in sorted(grouped.items()):
    sql += f"\n-- Category: {cat_slug} ({len(prods)} products)\n"
    sql += f'UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = \'{cat_slug}\')\n'
    id_list = ", ".join([f"'{p['id']}'" for p in prods])
    sql += f"WHERE id IN ({id_list});\n"

sql += "\nCOMMIT;\n"

with open('backend/prisma/precise-catalogue-reorganization.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"Generated precise-catalogue-reorganization.sql with {len(items)} products classified across {len(grouped)} categories!")
