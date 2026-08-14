-- Group the imported auto-parts catalogue into practical, customer-facing sections.
-- Existing products stay untouched except for their category assignment.
BEGIN;

INSERT INTO "Category" (id, "nameFr", slug, "sortOrder", "parentId")
SELECT item.id, item.name, item.slug, item.position, parent.id
FROM "Category" parent
CROSS JOIN (
  VALUES
    ('auto-parts-filters', 'Filtres', 'auto-filtres', 1),
    ('auto-parts-brakes', 'Freinage', 'auto-freinage', 2),
    ('auto-parts-engine', 'Moteur & distribution', 'auto-moteur-distribution', 3),
    ('auto-parts-suspension', 'Suspension & direction', 'auto-suspension-direction', 4),
    ('auto-parts-transmission', 'Transmission & embrayage', 'auto-transmission-embrayage', 5),
    ('auto-parts-cooling', 'Refroidissement & climatisation', 'auto-refroidissement-climatisation', 6),
    ('auto-parts-electrical', 'Electricite & eclairage', 'auto-electricite-eclairage', 7),
    ('auto-parts-body', 'Carrosserie & habitacle', 'auto-carrosserie-habitacle', 8),
    ('auto-parts-exhaust', 'Echappement', 'auto-echappement', 9),
    ('auto-parts-other', 'Autres pieces auto', 'auto-autres-pieces', 10)
) AS item(id, name, slug, position)
WHERE parent.slug = 'pieces-auto'
ON CONFLICT (slug) DO UPDATE
SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder", "parentId" = EXCLUDED."parentId";

UPDATE "Product" product
SET "categoryId" = (
  SELECT category.id FROM "Category" category WHERE category.slug = CASE
  WHEN product."nameFr" ILIKE ANY (ARRAY['%filtre%', '%filter%'])
    THEN 'auto-filtres'
  WHEN product."nameFr" ILIKE ANY (ARRAY['%frein%', '%plaquette%', '%disque%', '%étrier%', '%etrier%', '%tambour%'])
    THEN 'auto-freinage'
  WHEN product."nameFr" ILIKE ANY (ARRAY['%amortisseur%', '%suspension%', '%direction%', '%rotule%', '%triangle%', '%roulement%', '%stabilis%', '%essieu%'])
    THEN 'auto-suspension-direction'
  WHEN product."nameFr" ILIKE ANY (ARRAY['%embrayage%', '%boîte%', '%boite%', '%cardan%', '%transmission%', '%différentiel%', '%differentiel%', '%volant moteur%'])
    THEN 'auto-transmission-embrayage'
  WHEN product."nameFr" ILIKE ANY (ARRAY['%radiateur%', '%thermostat%', '%refroidissement%', '%pompe à eau%', '%pompe a eau%', '%ventilateur%', '%climatisation%', '%condenseur%'])
    THEN 'auto-refroidissement-climatisation'
  WHEN product."nameFr" ILIKE ANY (ARRAY['%alternateur%', '%démarreur%', '%demarreur%', '%capteur%', '%contacteur%', '%interrupteur%', '%phare%', '%projecteur%', '%ampoule%', '%éclairage%', '%eclairage%', '%feu %'])
    THEN 'auto-electricite-eclairage'
  WHEN product."nameFr" ILIKE ANY (ARRAY['%pare-chocs%', '%pare chocs%', '%carrosserie%', '% aile%', '%porte%', '%capot%', '%rétroviseur%', '%retroviseur%', '%hayon%', '%grille%'])
    THEN 'auto-carrosserie-habitacle'
  WHEN product."nameFr" ILIKE ANY (ARRAY['%échappement%', '%echappement%', '%catalyseur%', '%silencieux%'])
    THEN 'auto-echappement'
  WHEN product."nameFr" ILIKE ANY (ARRAY['%moteur%', '%courroie%', '%distribution%', '%chaîne%', '%chaine%', '%soupape%', '%piston%', '%culasse%', '%arbre à came%', '%arbre a came%', '%injecteur%', '%pompe à huile%', '%pompe a huile%'])
    THEN 'auto-moteur-distribution'
  ELSE 'auto-autres-pieces'
  END
)
WHERE product."categoryId" = (SELECT id FROM "Category" WHERE slug = 'pieces-auto');

COMMIT;
