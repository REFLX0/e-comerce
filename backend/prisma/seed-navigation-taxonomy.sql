-- Production navigation taxonomy.
-- This only creates/reorganizes categories; it never creates, changes, or
-- assigns products. Product classification remains an explicit catalogue task.
BEGIN;

INSERT INTO "Category" (id, "nameFr", slug, "sortOrder")
VALUES
  ('nav-lubrifiants', 'Lubrifiants', 'lubrifiants', 0),
  ('nav-moto-karting', 'Moto & Karting', 'moto-karting', 2),
  ('nav-marine', 'Marine', 'marine', 3)
ON CONFLICT (slug) DO UPDATE
SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder";

UPDATE "Category"
SET "nameFr" = 'Automobile', "sortOrder" = 1, "parentId" = NULL
WHERE slug = 'automobile';

UPDATE "Category"
SET "nameFr" = 'Huile moteur', "parentId" = (SELECT id FROM "Category" WHERE slug = 'lubrifiants'), "sortOrder" = 0
WHERE slug = 'huiles-moteur';

UPDATE "Category"
SET "nameFr" = 'Liquide de frein', "parentId" = (SELECT id FROM "Category" WHERE slug = 'lubrifiants'), "sortOrder" = 1
WHERE slug = 'frein';

UPDATE "Category"
SET "nameFr" = 'Huile de boîte', "parentId" = (SELECT id FROM "Category" WHERE slug = 'lubrifiants'), "sortOrder" = 3
WHERE slug = 'transmission';

INSERT INTO "Category" (id, "nameFr", slug, "sortOrder", "parentId")
VALUES
  ('nav-lubrifiants-direction', 'Direction assistée', 'direction-assistee', 2, (SELECT id FROM "Category" WHERE slug = 'lubrifiants')),
  ('nav-moto-huile-moteur', 'Huile moteur', 'moto-huile-moteur', 0, (SELECT id FROM "Category" WHERE slug = 'moto-karting')),
  ('nav-moto-huile-boite', 'Huile de boîte', 'moto-huile-boite', 1, (SELECT id FROM "Category" WHERE slug = 'moto-karting')),
  ('nav-moto-huile-fourche', 'Huile de fourche', 'moto-huile-fourche', 2, (SELECT id FROM "Category" WHERE slug = 'moto-karting')),
  ('nav-marine-graisses', 'Graisses', 'marine-graisses', 0, (SELECT id FROM "Category" WHERE slug = 'marine')),
  ('nav-marine-huile-moteur', 'Huile moteur', 'marine-huile-moteur', 1, (SELECT id FROM "Category" WHERE slug = 'marine')),
  ('nav-marine-hydraulique', 'Hydraulique', 'marine-hydraulique', 2, (SELECT id FROM "Category" WHERE slug = 'marine')),
  ('nav-marine-additifs', 'Additifs', 'marine-additifs', 3, (SELECT id FROM "Category" WHERE slug = 'marine'))
ON CONFLICT (slug) DO UPDATE
SET "nameFr" = EXCLUDED."nameFr", "sortOrder" = EXCLUDED."sortOrder", "parentId" = EXCLUDED."parentId";

COMMIT;
