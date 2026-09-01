import json
import re
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from test_user_taxonomy import classify_user_exact, clean_title

items = json.load(open('all_live_products.json', encoding='utf-8'))

sql = """-- ============================================================
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
"""

for p in items:
    pid = p['id']
    original_name = p['name']
    cleaned_name, vol = clean_title(original_name)
    target_cat = classify_user_exact(p)

    escaped_clean = cleaned_name.replace("'", "''")
    escaped_orig = original_name.replace("'", "''")

    sql += f"-- [{target_cat}] {cleaned_name}\n"
    sql += f"""UPDATE public."Product" 
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = '{target_cat}'),
    "nameFr" = '{escaped_clean}'
WHERE id = '{pid}';\n"""

    if vol:
        # Also ensure ProductVariant has the extracted volume if volume is currently null/empty
        sql += f"""UPDATE public."ProductVariant" 
SET volume = '{vol}'
WHERE "productId" = '{pid}' AND (volume IS NULL OR volume = '');\n"""

sql += "\nCOMMIT;\n"

with open('backend/prisma/precise-catalogue-reorganization.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print("Generated complete precise-catalogue-reorganization.sql with title cleaning and exact user taxonomy!")
