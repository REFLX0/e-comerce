-- ============================================================
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

-- Category: adblue (3 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'adblue')
WHERE id IN ('ed4d6f9a-f5c1-4e0f-8ad2-0e68c9effde9', 'c9567fc4-1192-4562-89bd-31eb40050f9b', '94ca1e75-1985-43f6-8d64-5e52265812c6');

-- Category: additif-diesel (20 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-diesel')
WHERE id IN ('36ed3b9b-6ad8-4c8d-bc94-a383e1b39338', 'd75884bf-6c44-4b18-b57f-77f8d3cbdde1', '2ef92b6b-58cd-459a-bf4e-9a135cebba0e', '019404ad-e469-4aa7-8d4a-d07c0379cb55', 'b127f230-6ff9-4817-b8e4-a0e5e5615359', '513066dd-12ee-47a0-9602-dd4d70044526', 'ecd09da5-7c9e-4289-a652-ece1c0c6e7f8', '932689c0-2e08-46a7-98f2-00dbe74245d5', '0ee2f698-2547-4e0d-be39-e4a00b2f6788', '8ddc1657-22b0-4606-9850-1b9b65d064a6', '08905879-cc5a-4f72-9137-25a2490bde19', 'e48aabe1-eca6-47b0-b6b6-a5aa0f6b3dd0', 'd892553b-7477-454b-858e-09dd07aadf76', '4ba757fd-5bff-464c-8f30-71653ce7f97e', 'e4d3fdb4-ad7e-4797-9bba-b13aa5436ddf', 'b9cb34b5-f763-4949-b4df-8f8df096d8e1', '386b7364-dbb9-4e5c-b1b1-caf9b8c361c1', 'e767e359-446e-43b8-bf3f-afe5e99f5904', '57a5eec8-ef8a-4153-913c-e18f6f30f545', 'b7e08df8-d4fd-43e1-99fe-6f1f804be60b');

-- Category: additif-essence (12 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-essence')
WHERE id IN ('56557eb8-53ff-414d-abcd-a7b142530208', 'a7ea52df-ce41-41cf-982d-a0d8baab0548', 'e83a9702-01b8-4615-a442-7bfe803e2d4c', '62082539-0135-4b2d-8ff1-6569e844943d', 'fde4e204-e953-4735-a3d6-f54fdfe0fc75', '25aa6cfb-2f47-41a2-a8fb-4326e89e5945', '931dba02-37af-48eb-bf32-187742800efb', '1acd28da-d840-44a3-93c3-48172cbebe8e', '84fe76e6-9cb2-47ac-a8dd-8b45218420dc', '8b6fee7f-3789-46a8-a34b-8103cabd7c9b', '448e2d25-bfb7-45de-a2bb-2ace1fb37eb5', '48da60bd-98d6-4146-a990-2d65ac00a023');

-- Category: additif-huile (19 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additif-huile')
WHERE id IN ('950d9c4e-f44a-4423-8c41-f1da769b8097', 'ba28168f-2747-47f0-928b-42fd855fa3b2', 'f61863d1-47de-497d-bc28-7bbdab5a4157', '7ea9acc9-a73a-4b03-9b72-734e5ebbbc50', '8f7602df-1025-4624-b147-76b3576f5541', '9211185d-87f2-447b-85b9-9186309d6463', 'a50ac245-b2bb-4f8b-b909-ac7c6bb859b0', 'baeced6d-d361-4151-ad11-e28150bac067', 'b5f90cbd-eada-41fb-a51c-0e1681710755', '99b225a9-db1d-40ff-b73b-9b8bd2c9f746', '4172e86f-c42f-40c3-8cae-6ecab11563b7', '5e0e2ff2-c2fe-431e-851b-d739d7978646', '3270166e-664e-462a-a629-3e0ca610ee61', '13748ab9-ec69-4879-8bea-5bac224bc8d3', '073bcea4-0057-4f1a-ab58-6293a3be7cd6', '29cfa7d1-2fab-4796-8b75-21aba3d49bc3', '60701372-930f-4cf1-b5bd-653b5878ebcb', 'd3f5af2e-5e0d-4d1b-b3d0-111bb98f8ffa', '9da0691e-95dc-4a86-bb89-07601674186c');

-- Category: additifs (7 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs')
WHERE id IN ('a3655dd5-e131-4c2a-8a20-198412cbe9bc', '7a2b4268-36fa-46a3-a8a3-0a39270cd8dd', 'ffe9c521-be08-4925-af5a-b0b622a4eb45', '1c490267-9cf7-4c7b-9a41-c223ec971f64', 'e173948f-2948-4202-b740-23614394c207', 'ca471583-3ac8-4f96-81c2-a28cbb7a9bbf', '3f337956-aaff-422a-ace6-7da3937a0eae');

-- Category: antigel-refroidissement (18 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'antigel-refroidissement')
WHERE id IN ('58266a6f-917d-4753-87ad-03c7afd04e0e', '01671e12-829e-4442-8684-e749493ee89b', '9ee94432-fbf8-4ce7-87bb-dc6b2dde510d', '669d9b6e-a644-44d5-9bc7-48c0ba8bf829', '81412a8b-7cde-4e1a-b6ec-a215be62b333', '5e1bd47b-ae3b-4abf-9dab-f7001459a8e5', '43740bdb-b292-4135-a7c8-15cb32c4a2fd', '183fa378-b726-4bca-970e-ee582d375278', 'ac78a43b-d051-490d-9521-8096c90b986f', '886d0126-bb56-4e8b-8e16-e781c7602912', '55ee5f24-0363-4a33-9d35-626a9f894575', '40e176c4-a3fb-480b-9fc8-7a5514d470cb', '28a4586f-01b4-428e-85b6-6ba64839808e', '9ffdb11a-4cfe-439c-afa9-dd94f22703d7', 'dd47c1ef-3483-47b1-8636-ba2a1c4c48af', '8b9c8379-ed62-4446-8198-beeceb9ffd77', '207dfd8b-d886-476e-9dd7-f54cd9d16392', 'cmt0vly91007xqc33xvztu700');

-- Category: auto-autres-pieces (38 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-autres-pieces')
WHERE id IN ('1c02ef3d-73bd-4dc8-9439-ab3aac52dea3', '143edb83-2900-4fe1-a7e7-99fa58c961f0', 'cd56734d-d49f-415c-ab25-91524a0113e8', 'b5a3f6c3-c855-449f-ba2b-919d8d41a59b', '4c5b5df8-30f9-4b0a-bf56-9645b78094f5', '79d0ded6-e3b0-43c1-949e-46e5a82a5786', 'de42acd4-1c69-49b3-9ed7-4371b4782af4', '6ac600ad-5d68-4659-a73c-2d3a612f4032', '1102d883-1beb-4b0b-b5fb-88e7ff5099ee', 'b7456ab3-b854-47f6-8594-06219480133f', '991c9915-8bf8-4e1e-9bcf-79174a66c5f5', 'ac0d0ac6-9231-490b-8527-100d40c3afa0', '80f14c19-8a9d-4e25-9a8b-e274a984cef3', '0b71f3bf-b658-47f7-98a0-1a0f74008dd7', '66f8c62c-a6eb-4e2b-aec1-14ff877b019d', '8a0e5a8c-3159-4298-a3d9-5b6fd3f11768', '9b859c29-c0c5-4587-b7b9-0084ad848cce', 'b2d16fb9-5825-465e-ba60-019b5f32314b', '803c719c-7ceb-4994-8f73-7478db463e51', '534c32ce-f21e-444e-8aa1-f45a4a53392c', 'b36a391f-5c07-49d6-a535-1665094d7b83', '4fa95b05-ab71-4508-9ab6-19ea9cba2663', '4deaf6ab-a2ae-4bd6-ba64-c64ac37bc375', 'fa564df1-36b3-47a6-98f9-b99390880c9b', 'dec2aaf6-b9f3-4c96-8787-6ccf172cb493', '7e003d60-dec7-4f89-92dc-c4b9771c2551', '207f0bc0-8d8e-4abb-8b16-279e2eb94eee', '14d07f5a-5e29-419b-81bd-7a876c8ee4fd', 'af692937-53ad-4843-9d8d-1eb0524a80d0', '71662304-0ab7-463e-9117-0d53db02eded', '6166523f-956f-423e-ada0-d5c0720ca4df', '85d837d7-bc9a-4754-afd8-16471cb1ff55', '7067d83f-08f8-4851-9457-c810f7bdc1e6', '5d53c6e5-ac14-43a9-9c61-0f48cfdda647', '1a09a35a-bfd8-471c-a7f9-04c9a07f2282', '4d59bc02-d1ec-44b6-a6ea-26c2ceadbc3e', 'cab0e35d-2866-4159-9976-06a729261b73', 'ea83e90b-982e-4a77-8004-feb69a7d81a4');

-- Category: auto-carrosserie-habitacle (4 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-carrosserie-habitacle')
WHERE id IN ('f368dcd0-2846-4cb6-a9a8-b1c4039576d6', 'f3dd82b5-a44d-422f-994a-57184fa7c030', '2956345a-1e19-4ad7-b1db-e3a0fc4fa5a1', 'c8dd2420-e417-4323-be9d-2024964d8a7c');

-- Category: auto-electricite-eclairage (5 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-electricite-eclairage')
WHERE id IN ('fc4d3772-e09c-4b06-8a04-0029308c1b75', 'c901862f-549e-4bde-b354-2bd0105a5dc4', '619230fd-6074-4699-b5df-206de5b2a2d8', '2f04a6e7-7ebb-4bf4-8a18-8fd92fc36cd7', 'cmt0vm1jd00ohqc339l4se7e5');

-- Category: auto-freinage (2 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-freinage')
WHERE id IN ('a9f6dfd9-729c-40b6-9d39-22382767f7e9', 'c9b65bf4-92f8-41e7-b624-1ca0200bcfd6');

-- Category: auto-moteur-distribution (5 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-moteur-distribution')
WHERE id IN ('d3e2c994-2515-42d2-9593-ab549a1ddc13', 'ce1803b1-1bc4-48a0-a05d-79f84ac43ebb', '9a3cfc6f-4526-4bdb-980e-5d285141f3dd', '7bc51d6b-03fd-4a7c-8bf8-165ae7cdd3f8', '0340e477-1794-48ba-824e-8048c6c46222');

-- Category: auto-suspension-direction (1 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'auto-suspension-direction')
WHERE id IN ('ed603e92-85b3-4611-908f-ba8b8ac5226c');

-- Category: batteries (47 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'batteries')
WHERE id IN ('49bef94b-a39e-468b-9d05-d093200ab266', '2a8dc928-314d-4d3e-a87f-6435291d7852', 'eef1ecb8-a90d-4215-9893-6168433d710d', '6e08b769-84c1-48f1-a331-534bc8a52243', '3e59308b-206f-4c7c-a5ad-e48f524c3c4e', '2282e4ca-4808-4e4b-8439-3de2dc076c95', 'd0f79fc8-c785-47ec-951a-8b6329656b62', '6ba479bc-726e-476f-b957-43c734dd06cc', 'e1e7eb9b-b4ce-41c5-b3da-e74e4cc5cfd5', '9aee82cf-79ca-4f41-ae0f-0ea82f049229', '3cb41255-5771-4978-ba4f-f0f7b6132d2f', '09856d63-93d1-4c09-8e5e-c24408fd759f', 'fac3a808-0b39-4ab9-ac9b-b6bb4621db8a', 'efde3f31-e74c-459a-9ab5-4e2f6368268d', '6a35f470-ffad-4fbb-a759-373d15a6f59c', '8186fffc-677e-4350-b045-2d064f97fa2a', '4d409bbf-85df-4e1d-a3d2-4309ca1ea0cf', 'c9995969-8d07-4a50-8bad-8af988c476b0', '9cea37f9-7684-40e0-b54b-a65bc864794b', 'de1c575e-931e-4fc5-866d-c4aba4a19728', 'af298551-6508-49db-b44e-213a93b7ba60', '6bd296cd-cc5e-404a-9485-8faea9ab29eb', '9ce1b5a0-1a97-488d-b8ae-7f977501fb47', '911fcae1-4e1c-40a7-98b2-5dcc5c167bec', '4b4e98c0-58f4-444a-9fba-f99d72740d3c', '2b3e5726-801e-421b-b7aa-e51cfd058b67', 'c7f21fce-aba6-4dad-b9be-303a3ce5dbb5', '39eac873-83a9-48bf-bb10-1a2daacfc59e', '6f7ad1a8-4a64-484a-a234-639383327fd3', 'c539b381-6f99-4b16-9179-b92bd59ce7e9', '6e7d93fc-fbee-47ec-bac5-690c75485255', '154b445a-4747-4d40-9aee-c563299632f1', 'fdbf645c-ff35-41b0-a61d-3a2bf01582dd', '4c4eac2c-2382-483d-926a-1221834bebf8', '39141e0c-e257-4198-8880-04e283b709d1', '49648117-4c00-4305-8a8d-c583448579fe', '111eb99b-3541-4ebf-a164-2193b86ac395', '31fa0fbe-19de-4943-b22a-4aaf82e4c02f', 'dc65d322-9639-4427-b727-20b737386b72', '3d9ace08-8429-45bc-85cf-8c23bf91f511', 'ece534af-37e8-455e-af2b-4343319b1adb', 'aba0e5db-ea0e-4f39-82f9-69dcde8619ef', '85127659-f079-4a22-a254-a85fa646eec4', 'c44a1f4e-5a99-450d-847d-03fe4e2c3afd', '866a762b-972f-4597-9dc5-e805c4a3c6d3', '2975101d-981b-43ba-b210-936c35d6b36f', '1652d668-5143-43b9-b27c-4907b85f6888');

-- Category: direction-assistee (6 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'direction-assistee')
WHERE id IN ('1ecaa96f-160f-4475-9754-622bfd2bc921', '56d72927-f07f-420b-bec2-5514567161b6', '31b45c58-5b44-42ed-b7cd-1a13ab47148e', 'a9a90f3c-e8d1-4cf8-863a-02220cb07395', 'f591232e-86ac-4879-8565-f20e4f2bfe82', 'a0593f50-3365-4f1f-b00c-3b05cc6246ea');

-- Category: essuie-glaces (24 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'essuie-glaces')
WHERE id IN ('19821692-15f6-43a7-892b-ca8126f34341', '3f733ea6-6356-4788-89f9-dfa4917c6600', '024de0e3-6173-4ff8-aba9-a86526545e46', '8ebcf9b5-53d1-4050-a121-7501e7d002b3', 'a8bd4779-2bbb-44e5-9820-aa82c5ad767f', '45a798ff-bd52-4483-a048-6053ddd8dbff', 'cd9ded9a-03ba-4dff-92c0-3398ef4fc91e', '67eb31b9-57de-4ea8-8c36-d97b09e1adba', 'f24f62b1-c839-458e-811d-907503734d6a', '0c66aa0c-873d-4783-b8b6-2454899c4602', 'f287ea9f-2342-47a1-8a0f-9549354ef910', '60408742-0cbe-4251-be31-a224aa80348c', '873e705c-5b6d-47df-8b83-684a7ebed781', '5bf09b17-ba1b-43a5-b2ff-81d5cd876c23', 'e66ad84e-144b-4245-bc9b-2a8144f8530f', 'f39333f0-65a5-4629-9772-d0b7e92a6f10', '6a3dae08-2a69-42a6-b419-7bdcebbb22bd', 'd07d57e6-e9a0-4a01-bd1f-2ecc40eb456a', 'f5522070-ec38-4922-9943-4d4c545e2c7f', 'daeeafd1-1888-4ce1-a41f-8c53ffa295da', 'b929a363-8184-48b9-af36-aa136a58bb7e', '2f85bc6a-fa76-45d3-86e4-941a34d1e3b8', 'b2bf3e43-b0a4-4684-9b9d-03fb21990e9f', '1a450790-cf76-44cd-9ea6-d2f6f1678436');

-- Category: filtres-air (11 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'filtres-air')
WHERE id IN ('39d7dda7-488e-40f0-b45c-cd720f622e27', '2ebe4d26-52e6-44ea-ac5d-9fe15be52a9a', '757932ad-7341-404b-987d-b1f8eda78ea8', '36bc826c-7166-4d96-b3ba-cd73d60798d5', '7ceaf4b7-0987-4994-bfb7-22fda688d67b', '4498a699-0dd5-4a0a-8937-15d2267ac31d', '82afd84a-45d7-4c82-be83-173b8475ad47', '50949ea2-c278-48d8-94ad-1e2cc9acc50a', '84eca2a8-78d2-43e9-a574-c8698f9cc0fc', 'fb59835a-0666-4acd-bcfe-06841d5e1fab', 'a4744295-e9c4-4614-b0a2-74d391edfea1');

-- Category: filtres-carburant (3 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'filtres-carburant')
WHERE id IN ('10d67ba9-58c4-476f-92ef-94a8885a0e0d', '10d67ba9-58c4-476f-92ef-94a8885a0e0d', '6a241e0f-b0e7-4235-bf66-bc8e582fe455');

-- Category: filtres-habitacle (5 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'filtres-habitacle')
WHERE id IN ('501df26d-3285-4173-9bdc-1ca901a3e504', '8c0ae67b-6de1-419b-b0cc-cb6bf0609740', 'cd8c04e2-8386-4f81-8a7c-0d0e6d58ed97', '36b80fdd-c182-449c-a7c0-8150ff5254fc', 'b630a6a2-acaa-426b-a0dc-c9f2bcc11b46');

-- Category: filtres-huile (16 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'filtres-huile')
WHERE id IN ('71c94547-c372-4d9f-893e-cebd0dbc5d99', '272b8394-6fe4-438d-b4a5-92b49ae754b0', 'a7b89ff9-5988-48d0-9f4d-b9b911b40c31', 'c30dd6ad-3666-4ed6-bade-81ec686b11d7', 'b197487b-0625-4589-adbc-40feb9cbfe6f', 'b5c96f1e-afa7-4ad2-89eb-16cf8940335d', '0d051d49-6514-4d86-8af2-b1aef617cab1', '74d08a0e-dac1-4ee1-b0f1-51c6149a02f2', '1cea0117-6b5a-455a-a14c-537396e6ca7d', 'e5934a29-c32a-4658-95d4-5860e22465f8', '06290c20-e8a4-499b-8106-377f12917417', '24d5fea7-142a-4b72-af06-e9733972a58f', '45b31746-a729-4af1-a348-5fdb42f50308', 'b7ce17f5-0c33-4afa-ad3d-d502bdcde845', '66fbecaa-570d-4d6e-aa2d-7e480fddbd95', '45e588f6-8b84-4b9f-a353-f73d12e23a8c');

-- Category: huile-de-boite (54 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite')
WHERE id IN ('b0026455-45f1-469b-a1eb-d49cd7da24fb', 'd7cba333-bc98-47e5-9457-c914837279c4', '299e4675-46b5-4703-8a6e-603291110252', '6f53c240-5c6f-401f-ab8b-9f0410238d53', '034d4b34-8e35-40f3-b6a8-1118ed0a7164', '0bfc5684-1b96-4619-8215-c8b721926f8f', '1c3c6bd2-0bee-49f8-b390-8212956b5172', 'bc5b4b9f-1ee9-408d-ac3b-b54801ac2d12', '18a897b3-3012-4b38-a231-ea0192eded5e', '718b27b1-c95f-415f-97da-ca1b599a07d1', 'df11be81-250d-43a6-bcdf-7950da820d39', '5e1fc706-6442-488a-a266-c06412d32352', '0cb1f076-9771-4cd8-8f00-dadfb5334678', '5f485a14-ac97-4eef-a1e5-757fd07805c6', 'd17149d7-cb34-4b43-9e0d-4f57cf91c8b4', 'ef10ab7f-45c0-4414-9093-f871a576e00c', 'c6b51bc0-93e0-4816-9aed-266b468917d1', '4295cf89-424d-4d91-9919-6c7bd1cf0598', '03084633-7bb0-4af0-88fe-f9af2244ad7f', '16ca2284-3ed7-4dec-afa4-43c361edcfc2', '97ac8d60-9a88-4ce2-9ff1-802e10665fe1', '7b4b0590-10bf-4307-9500-4ba9cd189fc7', 'db90a9ee-b9f3-4cdc-b669-ac92815c8da9', 'a56b39f0-8818-438a-8c9c-a71d32196864', '0df28aa9-23f7-4830-abd7-8eb2d4f0dd0d', 'bad35c6d-9b5c-4811-a067-bbbcaeaf2d50', '0415934f-b14c-45e3-9f01-81b67236972a', '8ca08745-29ae-4f5e-b312-4762666602a7', 'c4c29005-7e20-4119-bb2a-3cc922517cf0', '8c6aa5f2-e1f7-4175-a8a8-3b3be4bfda25', '057b55d8-7d71-4db4-8299-21778ae0ebb8', 'f0ef71e3-0769-4211-8c5d-cc83cb8fd0d0', '300bc75a-f56d-4496-8fe9-988e20f40c4d', '2d979cb0-933d-4b77-9bd2-506234cb8827', 'a0825afd-64a2-4c1d-80a4-68a46e3196f9', 'c61e2af3-3d61-4d51-b60f-49ea1b7071a2', '5e7416e2-6e8f-4170-97e3-20267ab295d3', '2d1622d5-7d72-4fe2-b3bd-edf14ab8e656', 'fe651589-4bd6-44f7-84d8-2b20dfd5eab5', '8e9a98de-2eb4-479d-aa3d-7047f731b563', '3f281e82-54e9-4fd3-bd1e-f3a69d8b6928', 'a9e19758-3944-44ef-87f6-35d3dd5f680b', '832b4b6e-0665-4f9c-a66f-c527826c35fa', '3426899e-91d3-4da8-baf9-04c5e124e67c', '2af6a40b-4bd7-4e16-b2ba-48a68fa1f827', 'b441a274-5012-4123-a8e7-bbcac2c737d8', 'da5f720a-bd98-4d0b-9d21-69f853b76a6c', '3e4052a1-d315-42fb-82e2-a68319b08322', 'fc085b28-f49b-4282-b95f-38d8234b45a4', '11461d30-d77c-418b-8221-803ed94e695b', '5204c798-0ced-4400-a5a9-010a7c2b7f48', '22d20565-a4a7-4873-b4d4-47545a0e27ef', '7caf358a-3376-45e4-b2bf-8e7a6e306609', '6ef902f2-f9bc-4d69-ad30-0f5a94fdba28');

-- Category: huiles-moteur (73 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur')
WHERE id IN ('7af154a9-2bc4-40af-99ab-0749ae25e1f6', '84c181e3-2d3f-4465-b199-15057def0099', '35cb911c-2a4b-4ebd-b65f-dc588a819d8d', 'f7e9f6f3-8c28-4bd9-8ceb-2e555562cc30', '22f8db81-1453-4fa1-b3be-21ede120e166', '870e793d-532f-41af-8de4-a04bc0cf2c40', 'a3dac7f7-7c0d-4f67-9ae3-dce6f2fcfd19', 'e91f7961-c24e-45f2-97d1-6252183305b3', '1d1b3498-3c2c-457e-b70b-50169c82c59a', 'accf7dfc-6776-4eaf-8c2a-326c517266a7', '8a0b2053-f3c5-4bd4-af55-b73572f4e4f1', 'b8718075-b712-4324-ae4a-854d5e2570ad', '3ac108f4-a05e-40b6-b1ed-45aa97ba232d', 'fa9162fb-abb4-458c-bb6e-67bfd842b638', 'f98caeec-45aa-44ae-a942-a8a0cbb22508', '6e6516ac-2d5e-438d-9143-9a613fa5a348', '501931ee-03a3-4dd6-8c19-acf5c969077a', '605051c3-9f3d-42b8-ae87-04c29f14acef', '4659d0a2-4d18-4054-96e9-fa27019702df', 'a16950d0-d70f-4d42-93b4-8507df34e615', 'db3f819d-ac48-4b82-98c5-0f007dbc1e22', '1ad3cd7d-6bc9-493c-b27f-c1c70148d692', '7e5b4bf7-c42b-4c49-8316-51411d2563b4', 'b56d041f-4286-4a68-b1a6-f7bda1045ab2', '8ee9cd4b-299e-4c6d-b731-e51ba8c04702', '900c6118-c462-484c-8405-8193a37ec482', '283efec2-c2bf-4a03-88fc-c4cf70e38509', '857bcb1b-b4fe-48ad-8dcb-696d3b39b70c', '043ef3e2-a772-4e7f-a927-7f39065465a9', '08e2a4f1-9a55-48d4-8670-ad54de39a4d3', '6a59dd78-b4d6-4579-b8d0-f7f6017197b5', 'a331b8cf-98da-4905-9c6a-605aaeaaf08f', '05cf1ddc-3aba-4c00-98c6-1b27f0e01358', 'efa1a3b9-ae93-4675-a658-3dcd446be67e', 'bd1d98d5-7fb9-4bae-ab1c-9175feb5ce9b', '54e71720-6b2d-4be2-9d09-dcd10b919ca9', '5a99cefb-4009-4ba4-93cd-700642514a3d', '0d000157-dc5b-467c-bd24-4551b9643f68', 'c04b8c16-ca7f-42a6-b60a-e0d1ddf6ba4b', '24e0dabd-9408-45c9-9aa1-5df5753cefec', '9efaf408-90f5-42fe-a417-54bcb81bfe5f', 'd7447663-199b-4ca8-91e4-4926b7d6a604', 'd92b2350-718f-431a-b6a4-2563943645d3', 'e8d6cfdc-b534-4866-be21-550085c28970', '684fe005-0405-4b63-8091-b1e50a99d73a', '49cbfafe-d6ce-43fe-8b8f-000d68822033', 'd21108e4-c1b5-49cf-8a2f-e1dd26e60b27', '1926d8ca-1811-4449-b23e-87b55853e29e', '36fe5c0e-7c9b-4dcc-87f9-6e2ee8e08240', 'f8a9485d-4789-420f-8198-8bc2a3f0128d', 'f34c86f5-aaa4-4cd9-aaf7-96e8e7475328', 'c8aeb6f5-d9e1-429e-900c-d4406a7b7c6b', 'c4511faf-87d0-46cd-b71e-50c89664b929', '09d3b748-f863-498d-96e2-92bd3b4a7777', 'dc81f6ea-625f-40d6-ab5e-217ab22a4915', 'd0331796-6e3a-48fa-a18c-fbaab7f6be72', 'a133266e-9901-44de-95e6-bc6be417f1dd', 'c9c30ff2-1d2e-414d-8d6b-ac71d9414dda', 'd966b649-8ae3-4f76-8ec0-768e8c9aedcd', '3dc62370-8066-4f11-a30b-a19c0a8b8173', '8e340d44-5b2d-41f7-b149-f6b2330de228', '0bc686c5-5314-4e96-b41f-6015ba479a48', '005a0c3e-313f-46bf-9dd4-2691df2b0aba', '28259376-d001-4f95-b18e-3968dcd233d4', '56c3574a-60c6-468c-882c-7a99a7ddd407', 'e7d2b294-3986-47bd-9386-02b67258c01e', '59e9d4bf-1d39-4ff3-ae11-4f50adf7c7ea', '86b9dd81-4e22-4270-a5d9-37c0bd853e26', 'c34555b4-9318-41bf-8843-c840cbff75de', '6531da22-9518-4c4f-919a-a1a6be15b026', 'ec9962d9-df08-4caf-acb2-d0cebb996c1b', '9367657d-a003-4f09-aa60-dc2b188b026f', 'f293fb28-4a21-4f42-90f3-61888b6f2399');

-- Category: lavage-carrosserie (28 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'lavage-carrosserie')
WHERE id IN ('2ed51e25-aee5-4e73-a97c-22c9036bf92b', 'da736a59-2726-4b69-9865-a523ee52b92b', 'd6c81c91-c2ab-4c4c-95c2-50a7150610c6', '255cf1cd-be42-497d-adac-f5f6043f9a0c', '4d20a99c-525c-43f2-9ece-2d645fe4a5e7', 'f57ab44c-c5e6-43d1-99b1-1ade9b389854', 'aabfa400-a402-425a-93d0-9cc5ab2f1893', 'd0b9754d-a542-4ebf-a3c2-971390a6cd7e', '1dccae2e-fe30-404c-b8d8-72e0fef25a1a', 'c37d82de-8649-401c-b7a6-4ffddf1e6b9a', 'bdf404f2-6120-4fb9-9fd8-7e04baa717d1', 'f04412f7-ec50-4d0f-ab5b-5dbf804045be', '352d8bc1-7e1f-40d9-ad43-4e53ad7dfe47', '1f4d2b0d-7b7e-48d0-bb7b-4c373efbb488', 'babe2f59-f840-4501-8af7-19c8e3b5582f', '5d694327-305d-4339-9723-e43e737ad6e8', '29210058-5e5e-45b0-a030-9de69b4dca74', 'b5e1d8e8-6212-4b6c-b45b-67d6d0f85fd6', '073760b7-957b-453a-812e-594e0ec8934d', 'baf3ab77-edce-4000-b0a2-ecdd84ce2ef4', 'c74a69fe-5f50-47d6-b860-5eebc3f750c5', 'e79604ce-e02e-4e4f-b820-1471d272a3ab', '30e5ef4d-60dd-4195-94f8-8a2afa223b78', '687ba9c2-ea14-4452-ae49-67987dd131e4', '714b860d-af5d-43ed-8286-2e5fdb63f048', '50f6cd94-60a0-45da-a6b6-7ca6deeda5b0', 'c145574c-b156-4815-be52-fadaf6f4c0ab', '62543e2f-ad9a-464e-8661-1441b2271b82');

-- Category: liquide-de-frein (6 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquide-de-frein')
WHERE id IN ('aaac1f29-a14f-4676-9a50-0f6e4e3c3a29', '2da865e0-4862-444b-8147-5c0cb8379b73', '0d8ac934-42ab-4dd5-ad4b-6cb0ea0ff0c6', '2915f0af-a7a2-4be7-b4e9-2de68787a80b', '3770de7a-ed6b-4a54-b3bb-8747d4c1ab1d', '830cd9f3-d90a-4278-a1a9-2e6b10137a15');

-- Category: moto-huile-boite (4 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-boite')
WHERE id IN ('0a3495dd-a81e-4629-8c33-8d8bc2bb4f48', 'aee79b0a-3e11-4336-8307-11488dce849f', 'ef7bf3a0-2045-45b8-ae14-653b60b282e9', '4ef9eb01-76f1-4b55-b382-a9f1116eada6');

-- Category: moto-huile-fourche (4 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huile-fourche')
WHERE id IN ('01c32e3a-147e-4bc5-afb6-4639a03e93a3', '01c32e3a-147e-4bc5-afb6-4639a03e93a3', 'ba654110-227f-4939-a70c-3a341e27af10', '9d56b6f0-ed4e-41f0-a129-c9d29a3cb1f8');

-- Category: moto-huiles (26 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-huiles')
WHERE id IN ('f721febd-dbf8-4e83-8d44-feaf3add41e1', 'df087b0c-651f-4af3-81be-cb5d3d62363e', 'ed0b324f-f08e-420a-b8b4-231fdf352104', '0fcd6454-c017-4b37-a429-6c1c8a9da3fb', '3c9c1d11-4652-460e-ade7-2d8039a07e01', 'b35caca8-3f51-4e33-8589-9bdebc004d2a', '58aa5dc2-4a7f-472a-8243-599ef6d42987', 'd9f8b646-1a09-4e2c-ab33-6fce60c6eb4b', '58b75dfd-b984-4ac8-a051-5ae3ce624c83', 'e4ea7367-e605-4961-9d48-32d731d51b19', 'b164f1fa-aba9-4afe-8724-3a9846036d0b', '0837c0d8-127e-4c3f-9422-743591d1e2a2', 'c9a24c87-7586-40b5-8845-b5e1ed71da8e', '2adf23d2-1267-470d-91b2-2cd43d37d98e', 'ae04e903-583e-4913-89ad-a961531948d0', '3ee47c99-0f2d-4308-9f2a-d009c189795f', '20217f17-4dda-40b7-9018-cbbb2870e4aa', '28b0747b-3909-4415-ae5d-f47ff20b94f3', '347e5912-8bcc-4c13-808b-6c56ea8caeec', 'ab199db2-c7e0-4b3c-aafe-9a6672ed0750', '938ad107-62e9-40cf-ae00-999f0ea643b0', 'a5d55441-982d-4e5b-91f2-a4a766f310e9', 'c1065d8e-0e0d-40ca-929e-53c64d02532d', 'dc84d80b-cd72-4135-91e4-51a19e85acf9', '796d9da8-61e2-4f20-a2bc-16d6f2819bd1', '14be4a7d-2299-4e71-b614-8b1b502e1779');

-- Category: moto-lubrifiants-chaine (9 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'moto-lubrifiants-chaine')
WHERE id IN ('95ad68fa-4d1d-4c58-8469-a8007005081c', 'c7a66c67-796e-42e8-a530-b1a011c3221e', '95ad68fa-4d1d-4c58-8469-a8007005081c', 'c7a66c67-796e-42e8-a530-b1a011c3221e', '729179b2-c915-4824-94f2-89d18d83371a', '55b76345-c9d2-49cb-b2a5-5c861e11a5ce', '4670d4d4-9fa6-4cb0-8f09-314c02c664f2', 'be01e326-320b-4e6f-82fb-ffa74e578131', '1b744b26-c514-4822-b390-bd98583e81b4');

-- Category: produits-divers (17 products)
UPDATE public."Product" SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'produits-divers')
WHERE id IN ('ae9525d1-0095-48ff-9056-3c116363a6de', 'b9c324c7-20bd-4b17-8761-bcebad8888bf', 'f3249c50-ee7c-4089-836f-febb1fdc087c', 'c2fce19f-1f37-4cef-81d8-bb196338277d', '49a973ae-87bc-4597-a485-23e937011958', 'f36002a7-6862-4347-9212-773ba5b3804b', 'cd00d1c9-4b80-4156-b420-f15ac187d772', '8c9aa5ce-8a7a-4167-98dd-a11c6770636a', '5ab75ec7-62b1-4fc3-b470-e8c10ee48b97', '4b9cd24c-9b0b-4db7-8468-bc672adee5c2', 'ebe82ec7-3c27-48cb-a3f6-182d3c0efd15', '65d07244-d2c4-4a29-a972-77c81b9e5e1b', '35fa3705-2bec-40e5-9cb7-c57695ccda3c', 'd83bf549-b789-4036-ad03-ddcbc67534dd', '73dd1d0e-d1db-4d68-adef-ae4eb1d9cb2e', 'dacc1b5e-8e6e-4893-ba4c-727bf54e3aea', 'bc5728b5-bcb2-4b95-aed6-bb4be4d3c8e3');

COMMIT;
