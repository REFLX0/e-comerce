-- =========================================================================
-- Migration: Fix Catalogue Categories & Product Specs for Motor & Gear Oils
-- Target: SpecPart Database
-- =========================================================================

BEGIN;

-- 1. Category Fixes

-- Move 98 products to 'huiles-moteur'
UPDATE public."Product"
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huiles-moteur' LIMIT 1)
WHERE sku IN (
    'TSC-00001',
    'TSC-00002',
    '7501',
    'MANNOL Defender 10W-40 7507',
    'Castrol Magnatec Professional E 5W-20 5L',
    'CASTROL EDGE C3 5W-40 5L',
    '7903',
    '7907',
    '23127',
    'TSC-00057',
    'Castrol GTX 10W-40 5L A3/B4',
    'CASTROL EDGE C3 5W-30 5L',
    'XTeer G500 SL10W40 (HYUNDAI) - 4L',
    'XTeer G500 5W30 (HYUNDAI) - 4L',
    '20750',
    'TSC-00125',
    '7915',
    '7504-10',
    '20058-0050-99',
    '20138-5',
    'TSC-00168',
    'TSC-00181',
    '20112-5',
    '20150-5',
    '20379-5',
    '30509',
    '21062',
    '21014',
    'TSC-00200',
    '7720',
    'TSC-00230',
    '7902',
    'TSC-00240',
    '7908',
    '7707',
    '7730',
    '7722',
    '7921',
    'TSC-00247',
    '2362',
    'TSC-00256',
    'TSC-00265',
    'TSC-00266',
    'TSC-00267',
    '21332',
    '7616',
    '6739',
    'TSC-00271',
    'TSC-00272',
    'TSC-00273',
    '8460',
    '21411',
    '20632',
    'TSC-00277',
    '21217',
    'TSC-00279',
    'TSC-00280',
    '7530',
    'TSC-00282',
    '2322',
    '21404',
    'TSC-00285',
    'TSC-00286',
    'TSC-00287',
    'TSC-00288',
    'TSC-00289',
    'TSC-00292',
    'TSC-00293',
    'TSC-00294',
    '1502',
    '20832',
    '21719',
    '2526',
    'TSC-00299',
    '20754',
    '20753',
    '3058',
    '1243',
    'TSC-00305',
    '7814-1',
    'TSC-00309',
    '7832-4',
    '7832-1',
    '7812-4',
    '7812',
    '7918',
    'TSC-00430',
    '65648',
    'TSC-00432',
    'TSC-00433',
    'TSC-00434',
    'TSC-00435',
    'TSC-00436',
    'TSC-00437',
    'TSC-00438',
    'TSC-00439',
    '7703',
    '7713'
);

-- Move 1 products to 'filtres-habitacle'
UPDATE public."Product"
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'filtres-habitacle' LIMIT 1)
WHERE sku IN (
    'Filtre habitacle MISFAT HB205 FIAT 500 / FORD KA'
);

-- Move 11 products to 'filtre-a-air'
UPDATE public."Product"
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'filtre-a-air' LIMIT 1)
WHERE sku IN (
    'Filtre à air MISFAT P 301A FIAT / FORD',
    'FILTRE A AIR MISFAT P460A RENAULT',
    'WUNDER filtre à air OPEL CORSA D',
    'MANN-FILTER - c 14 130',
    'C 27 009',
    'MANN-FILTER C35154',
    '24394 polo',
    'c 1370',
    'c 1361',
    'c 14 006',
    '9964'
);

-- Move 66 products to 'additifs'
UPDATE public."Product"
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'additifs' LIMIT 1)
WHERE sku IN (
    'MANNOL Additif ester diesel 9930 (250ml)',
    'MANNOL Additif Ester de Benzine 9950 (250ml)',
    'TSC-00028',
    'TSC-00029',
    '31008-AREXONS Nettoyant tissus (500ML)',
    '31022-AREXONS Nettoyant jantes (500ML)',
    '31001-AREXONS nettoyant cuir (500ML)',
    '31017 - AREXONS Nettoyant moteur (400ML)',
    'P2985DCC',
    '2388',
    '9694',
    '7904',
    'P2803',
    'P1911',
    '8364',
    'P6111BC',
    'P1101FLC',
    'P1501RF',
    'P2901',
    'P2131HLC',
    'P2233VIC',
    '2101',
    '1185',
    '1032',
    '8369',
    'TSC-00227',
    'TSC-00237',
    '9881',
    '9863',
    '9670',
    '9672',
    '9692',
    '9965',
    '9970',
    '9873',
    '9893',
    'TSC-00357',
    'TSC-00359',
    '9671',
    '9944',
    '8986',
    '4066',
    '1832',
    '3391',
    '3304',
    '1816',
    '1844',
    '1597',
    '3326',
    '4087',
    '5189',
    '21317',
    '8380',
    '2962',
    '1797',
    '8366',
    '8373',
    '2970',
    '8361',
    '8367',
    '2428',
    '2427',
    '5200',
    '9958',
    '9900',
    'TSC-00459'
);

-- Move 57 products to 'huile-de-boite'
UPDATE public."Product"
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'huile-de-boite' LIMIT 1)
WHERE sku IN (
    '2510',
    '3072',
    '25066',
    '25029',
    '25063',
    '25036',
    '25020',
    '25050',
    '25067',
    '25055',
    '25051',
    '25060',
    'S671.090.255',
    '5929',
    '5927',
    '1516',
    '1134',
    '4421',
    'TSC-00251',
    'TSC-00252',
    '21359',
    '3658',
    '4434',
    '1407',
    '9903',
    'TSC-00318',
    'TSC-00319',
    'TSC-00320',
    'TSC-00324',
    '8208',
    'TSC-00328',
    'TSC-00329',
    '8206',
    'TSC-00331',
    '8205',
    '9968',
    'TSC-00406',
    '2512',
    '8336',
    'TSC-00419',
    '21378',
    '3648',
    '20625',
    'TSC-00423',
    '3659',
    '3662',
    'TSC-00426',
    'TSC-00427',
    '20842',
    '8103',
    '23300',
    '2408',
    'TSC-00442',
    'TSC-00443',
    'TSC-00444',
    '8109',
    '8102'
);

-- Move 1 products to 'filtres-huile'
UPDATE public."Product"
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'filtres-huile' LIMIT 1)
WHERE sku IN (
    'BOSCH - F 026 407 006'
);

-- Move 6 products to 'liquide-de-frein'
UPDATE public."Product"
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'liquide-de-frein' LIMIT 1)
WHERE sku IN (
    '3092',
    '3089',
    '3093',
    'TSC-00262',
    '3003',
    '3002'
);

-- Move 1 products to 'direction-assistee'
UPDATE public."Product"
SET "categoryId" = (SELECT id FROM public."Category" WHERE slug = 'direction-assistee' LIMIT 1)
WHERE sku IN (
    '1145'
);

-- 2. Precision Product Specs Updates for Asian/Modern Vehicles & Hybrids

-- Liqui Moly Special Tec AA 0W-20 (5L) [SKU: 6739]
UPDATE public."ProductSpecs"
SET 
  viscosity = '0W-20',
  "apiStandard" = 'API SP',
  "aeceaStandard" = 'ILSAC GF-6A',
  "OEMApprovals" = 'Toyota; Lexus; Honda; Hyundai; Kia; Mazda; Mitsubishi; Nissan; Subaru; Suzuki; GM dexos1 Gen 3; Ford WSS-M2C; Fiat 9.55535-CR1; Chrysler MS-6395',
  "HybridCompatible" = TRUE,
  "isFullySynth" = TRUE,
  "TurboCompatible" = TRUE
WHERE "productId" = (SELECT id FROM public."Product" WHERE sku = '6739' LIMIT 1);

-- MANNOL Légende Ultra 0W-20 [SKU: 7918]
UPDATE public."ProductSpecs"
SET 
  viscosity = '0W-20',
  "apiStandard" = 'API SP',
  "aeceaStandard" = 'ILSAC GF-6A',
  "OEMApprovals" = 'Toyota; Honda; Nissan; Mazda; Suzuki; Subaru; GM dexos1 Gen 2; GM dexos1 Gen 3; Ford WSS-M2C947-A',
  "HybridCompatible" = TRUE,
  "isFullySynth" = TRUE,
  "TurboCompatible" = TRUE
WHERE "productId" = (SELECT id FROM public."Product" WHERE sku = '7918' LIMIT 1);

-- Liqui Moly Special Tec AA 5W-30 [SKUs: 7616, 7530]
UPDATE public."ProductSpecs"
SET 
  viscosity = '5W-30',
  "apiStandard" = 'API SP',
  "aeceaStandard" = 'ILSAC GF-6A',
  "OEMApprovals" = 'Toyota; Lexus; Honda; Hyundai; Kia; Mazda; Nissan; Subaru; GM dexos1 Gen 3; Ford WSS-M2C; Fiat 9.55535-CR1; Chrysler MS-6395',
  "HybridCompatible" = TRUE,
  "isFullySynth" = TRUE,
  "TurboCompatible" = TRUE
WHERE "productId" IN (SELECT id FROM public."Product" WHERE sku IN ('7616', '7530'));

-- MANNOL Toyota Lexus 5W-30 (4L) [SKU: TSC-00125]
UPDATE public."ProductSpecs"
SET 
  viscosity = '5W-30',
  "apiStandard" = 'API SN Plus',
  "aeceaStandard" = 'ILSAC GF-5',
  "OEMApprovals" = 'Toyota; Lexus; Daihatsu',
  "HybridCompatible" = TRUE,
  "isFullySynth" = TRUE,
  "TurboCompatible" = TRUE
WHERE "productId" = (SELECT id FROM public."Product" WHERE sku = 'TSC-00125' LIMIT 1);

-- WOLF OFFICIALTECH 0W30 SP [SKU: TSC-00437]
UPDATE public."ProductSpecs"
SET 
  viscosity = '0W-30',
  "apiStandard" = 'API SP',
  "aeceaStandard" = 'ACEA C2',
  "OEMApprovals" = 'Hyundai; Kia; PSA B71 2312',
  "isFullySynth" = TRUE,
  "TurboCompatible" = TRUE,
  "DPFCompatible" = TRUE
WHERE "productId" = (SELECT id FROM public."Product" WHERE sku = 'TSC-00437' LIMIT 1);

-- Liqui Moly Top Tec 4210 0W-30 [SKU: TSC-00277]
UPDATE public."ProductSpecs"
SET 
  viscosity = '0W-30',
  "apiStandard" = 'API SP',
  "aeceaStandard" = 'ACEA C2 / C3',
  "OEMApprovals" = 'VW 504 00; VW 507 00; Porsche C30',
  "isFullySynth" = TRUE,
  "TurboCompatible" = TRUE,
  "DPFCompatible" = TRUE
WHERE "productId" = (SELECT id FROM public."Product" WHERE sku = 'TSC-00277' LIMIT 1);

-- Liqui Moly Special Tec F 0W-30 [SKU: TSC-00280]
UPDATE public."ProductSpecs"
SET 
  viscosity = '0W-30',
  "aeceaStandard" = 'ACEA C2',
  "OEMApprovals" = 'Ford WSS-M2C 950-A; Jaguar Land Rover STJLR.03.5007',
  "isFullySynth" = TRUE,
  "TurboCompatible" = TRUE,
  "DPFCompatible" = TRUE
WHERE "productId" = (SELECT id FROM public."Product" WHERE sku = 'TSC-00280' LIMIT 1);

COMMIT;
