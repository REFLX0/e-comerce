/**
 * Canonical Generation Schemas for Major Automobile Manufacturers
 * Defines human-readable names, year ranges, and maps historical/chassis fragments.
 */

const CANONICAL_SCHEMAS = {
  // ──────────────────────────────────────────
  // 1. VOLKSWAGEN
  // ──────────────────────────────────────────
  'volkswagen': {
    'golf': {
      name: 'Golf',
      generations: {
        'golf-iv': { genName: 'Golf IV (1997 - 2005)', genSlug: 'golf-iv', yearFrom: 1997, yearTo: 2005, sourceSlugs: ['golf-iv-1j1-1997-2005', '1j1', '1j5', 'golf-iv'] },
        'golf-v': { genName: 'Golf V (2003 - 2009)', genSlug: 'golf-v', yearFrom: 2003, yearTo: 2009, sourceSlugs: ['golf-v-1k1-2003-2009', '1k1', '1k5', 'golf-v'] },
        'golf-vi': { genName: 'Golf VI (2008 - 2013)', genSlug: 'golf-vi', yearFrom: 2008, yearTo: 2013, sourceSlugs: ['golf-vi-5k1-2008-2013', '5k1', 'aj5', 'golf-vi'] },
        'golf-vii': { genName: 'Golf VII (2012 - 2020)', genSlug: 'golf-vii', yearFrom: 2012, yearTo: 2020, sourceSlugs: ['golf-vii-5g1-2012-2020', '5g1', 'ba5', 'bv5', 'golf-vii'] },
        'golf-viii': { genName: 'Golf VIII (2020 - Présent)', genSlug: 'golf-viii', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['golf-viii-cd1-2020-present', 'cd1', 'cg5', 'golf-viii'] }
      }
    },
    'polo': {
      name: 'Polo',
      generations: {
        'polo-iii': { genName: 'Polo III (1994 - 2001)', genSlug: 'polo-iii', yearFrom: 1994, yearTo: 2001, sourceSlugs: ['polo-iii-6n-1994-2001', '6n1', '6n2', 'polo-iii'] },
        'polo-iv': { genName: 'Polo IV (2001 - 2009)', genSlug: 'polo-iv', yearFrom: 2001, yearTo: 2009, sourceSlugs: ['polo-iv-9n-2001-2009', '9n', '9n3', 'polo-iv'] },
        'polo-v': { genName: 'Polo V (2009 - 2017)', genSlug: 'polo-v', yearFrom: 2009, yearTo: 2017, sourceSlugs: ['polo-v-6r-6c-2009-2017', '6r', '6c', '6r1', 'polo-v'] },
        'polo-vi': { genName: 'Polo VI (2017 - Présent)', genSlug: 'polo-vi', yearFrom: 2017, yearTo: 9999, sourceSlugs: ['polo-vi-aw1-2017-present', 'aw1', 'polo-vi'] }
      }
    },
    'passat': {
      name: 'Passat',
      generations: {
        'passat-b5': { genName: 'Passat B5 (1996 - 2005)', genSlug: 'passat-b5', yearFrom: 1996, yearTo: 2005, sourceSlugs: ['3b2', '3b3', '3b5', '3b6', 'passat-b5'] },
        'passat-b6': { genName: 'Passat B6 (2005 - 2010)', genSlug: 'passat-b6', yearFrom: 2005, yearTo: 2010, sourceSlugs: ['3c2', '3c5', 'passat-b6'] },
        'passat-b7': { genName: 'Passat B7 (2010 - 2014)', genSlug: 'passat-b7', yearFrom: 2010, yearTo: 2014, sourceSlugs: ['362', '365', 'passat-b7'] },
        'passat-b8': { genName: 'Passat B8 (2014 - 2023)', genSlug: 'passat-b8', yearFrom: 2014, yearTo: 2023, sourceSlugs: ['b8-2015-2023', '3g2', '3g5', 'passat-b8'] },
        'passat-b9': { genName: 'Passat B9 (2023 - Présent)', genSlug: 'passat-b9', yearFrom: 2023, yearTo: 9999, sourceSlugs: ['passat-b9'] }
      }
    },
    'tiguan': {
      name: 'Tiguan',
      generations: {
        'tiguan-i': { genName: 'Tiguan I (2007 - 2016)', genSlug: 'tiguan-i', yearFrom: 2007, yearTo: 2016, sourceSlugs: ['tiguan-i', '5n', '5n_'] },
        'tiguan-ii': { genName: 'Tiguan II (2016 - 2024)', genSlug: 'tiguan-ii', yearFrom: 2016, yearTo: 2024, sourceSlugs: ['mk2-2016-2024', 'ad1', 'bt1', 'bw2', 'tiguan-ii'] },
        'tiguan-iii': { genName: 'Tiguan III (2024 - Présent)', genSlug: 'tiguan-iii', yearFrom: 2024, yearTo: 9999, sourceSlugs: ['tiguan-iii'] }
      }
    },
    't-roc': {
      name: 'T-Roc',
      generations: {
        't-roc-i': { genName: 'T-Roc (2017 - Présent)', genSlug: 't-roc-i', yearFrom: 2017, yearTo: 9999, sourceSlugs: ['a11-2018-present', 'a11', 'd11', 'ac7', 't-roc'] }
      }
    },
    't-cross': {
      name: 'T-Cross',
      generations: {
        't-cross-i': { genName: 'T-Cross (2018 - Présent)', genSlug: 't-cross-i', yearFrom: 2018, yearTo: 9999, sourceSlugs: ['a11-2020-present', 'c11', 't-cross'] }
      }
    },
    'caddy': {
      name: 'Caddy',
      generations: {
        'caddy-iii': { genName: 'Caddy III (2004 - 2015)', genSlug: 'caddy-iii', yearFrom: 2004, yearTo: 2015, sourceSlugs: ['2ka', '2kb', '2kj', 'caddy-iii'] },
        'caddy-iv': { genName: 'Caddy IV (2015 - 2020)', genSlug: 'caddy-iv', yearFrom: 2015, yearTo: 2020, sourceSlugs: ['saa', 'sab', 'caddy-iv'] },
        'caddy-v': { genName: 'Caddy V (2020 - Présent)', genSlug: 'caddy-v', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['sba', 'sbb', 'caddy-v'] }
      }
    },
    'touareg': {
      name: 'Touareg',
      generations: {
        'touareg-i': { genName: 'Touareg I (2002 - 2010)', genSlug: 'touareg-i', yearFrom: 2002, yearTo: 2010, sourceSlugs: ['7la', '7l6', '7l7', 'touareg-i'] },
        'touareg-ii': { genName: 'Touareg II (2010 - 2018)', genSlug: 'touareg-ii', yearFrom: 2010, yearTo: 2018, sourceSlugs: ['7p5', '7p6', 'touareg-ii'] },
        'touareg-iii': { genName: 'Touareg III (2018 - Présent)', genSlug: 'touareg-iii', yearFrom: 2018, yearTo: 9999, sourceSlugs: ['cr7-2018-present', 'cr7', 'touareg-iii'] }
      }
    },
    'transporter': {
      name: 'Transporter',
      generations: {
        'transporter-t5': { genName: 'Transporter T5 (2003 - 2015)', genSlug: 'transporter-t5', yearFrom: 2003, yearTo: 2015, sourceSlugs: ['7ha', '7hh', '7ea', 'transporter-t5'] },
        'transporter-t6': { genName: 'Transporter T6 / T6.1 (2015 - Présent)', genSlug: 'transporter-t6', yearFrom: 2015, yearTo: 9999, sourceSlugs: ['t6-2015-2019', 't6-1-2019-present', 'sga', 'sgh', 'transporter-t6'] }
      }
    },
    'sharan': {
      name: 'Sharan',
      generations: {
        'sharan-i': { genName: 'Sharan I (1995 - 2010)', genSlug: 'sharan-i', yearFrom: 1995, yearTo: 2010, sourceSlugs: ['7m8-7m9-7m6', 'sharan-i'] },
        'sharan-ii': { genName: 'Sharan II (2010 - 2022)', genSlug: 'sharan-ii', yearFrom: 2010, yearTo: 2022, sourceSlugs: ['7n1-7n2', 'sharan-ii'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 2. PEUGEOT
  // ──────────────────────────────────────────
  'peugeot': {
    '206': {
      name: '206',
      generations: {
        '206': { genName: '206 (1998 - 2009)', genSlug: '206', yearFrom: 1998, yearTo: 2009, sourceSlugs: ['206', 'hatchback-2a-c', 'cc-2d', 'sw-2e-k', 'saloon'] },
        '206-plus': { genName: '206+ (2009 - 2013)', genSlug: '206-plus', yearFrom: 2009, yearTo: 2013, sourceSlugs: ['2l-2m', 'standard', '206-plus'] }
      }
    },
    '207': {
      name: '207',
      generations: {
        '207': { genName: '207 (2006 - 2014)', genSlug: '207', yearFrom: 2006, yearTo: 2014, sourceSlugs: ['207', 'wa-wc', 'cc-wd', 'sw-wk', 'saloon'] }
      }
    },
    '208': {
      name: '208',
      generations: {
        '208-i': { genName: '208 I (2012 - 2019)', genSlug: '208-i', yearFrom: 2012, yearTo: 2019, sourceSlugs: ['208-i-ca-cc-2012-2019', '208', 'ca-cc'] },
        '208-ii': { genName: '208 II (2019 - Présent)', genSlug: '208-ii', yearFrom: 2019, yearTo: 9999, sourceSlugs: ['208-ii-ub-up-2019-present', 'ub-up', '208-ii'] }
      }
    },
    '301': {
      name: '301',
      generations: {
        '301': { genName: '301 (2012 - Présent)', genSlug: '301', yearFrom: 2012, yearTo: 9999, sourceSlugs: ['301-i-2012-2017', '301-i-2017-2023', '301', 'dd'] }
      }
    },
    '307': {
      name: '307',
      generations: {
        '307': { genName: '307 (2001 - 2008)', genSlug: '307', yearFrom: 2001, yearTo: 2008, sourceSlugs: ['307', '3a-c', '3e', '3b'] }
      }
    },
    '308': {
      name: '308',
      generations: {
        '308-i': { genName: '308 I (2007 - 2013)', genSlug: '308-i', yearFrom: 2007, yearTo: 2013, sourceSlugs: ['308-i', '308', '4a-4c'] },
        '308-ii': { genName: '308 II (2013 - 2021)', genSlug: '308-ii', yearFrom: 2013, yearTo: 2021, sourceSlugs: ['308-ii-2014-2021', '308-ii-2017-2021', '308-ii', 'lb-lp-lw-lh-l3'] },
        '308-iii': { genName: '308 III (2021 - Présent)', genSlug: '308-iii', yearFrom: 2021, yearTo: 9999, sourceSlugs: ['308-iii'] }
      }
    },
    '406': {
      name: '406',
      generations: {
        '406': { genName: '406 (1995 - 2004)', genSlug: '406', yearFrom: 1995, yearTo: 2004, sourceSlugs: ['406', '8b', '8e-f', '8c'] }
      }
    },
    '2008': {
      name: '2008',
      generations: {
        '2008-i': { genName: '2008 I (2013 - 2019)', genSlug: '2008-i', yearFrom: 2013, yearTo: 2019, sourceSlugs: ['2008-i-2013-2019', '2008-i', '2008', 'cu'] },
        '2008-ii': { genName: '2008 II (2019 - Présent)', genSlug: '2008-ii', yearFrom: 2019, yearTo: 9999, sourceSlugs: ['2008-ii-2019-present', '2008-ii', 'u'] }
      }
    },
    '3008': {
      name: '3008',
      generations: {
        '3008-i': { genName: '3008 I (2009 - 2016)', genSlug: '3008-i', yearFrom: 2009, yearTo: 2016, sourceSlugs: ['3008-i', '3008', '0u'] },
        '3008-ii': { genName: '3008 II (2016 - 2023)', genSlug: '3008-ii', yearFrom: 2016, yearTo: 2023, sourceSlugs: ['3008-ii-2016-2023', '3008-ii', 'mc-mj-mr-m4'] },
        '3008-iii': { genName: '3008 III (2023 - Présent)', genSlug: '3008-iii', yearFrom: 2023, yearTo: 9999, sourceSlugs: ['3008-iii'] }
      }
    },
    '5008': {
      name: '5008',
      generations: {
        '5008-i': { genName: '5008 I (2009 - 2017)', genSlug: '5008-i', yearFrom: 2009, yearTo: 2017, sourceSlugs: ['5008-i', '5008', '0e-0u'] },
        '5008-ii': { genName: '5008 II (2017 - 2024)', genSlug: '5008-ii', yearFrom: 2017, yearTo: 2024, sourceSlugs: ['5008-ii-2017-present', '5008-ii', 'mc-mj-mr-m4'] }
      }
    },
    'partner': {
      name: 'Partner',
      generations: {
        'partner-i': { genName: 'Partner I (1996 - 2008)', genSlug: 'partner-i', yearFrom: 1996, yearTo: 2008, sourceSlugs: ['partner-i', 'partner', '5-g'] },
        'partner-ii': { genName: 'Partner II (2008 - 2018)', genSlug: 'partner-ii', yearFrom: 2008, yearTo: 2018, sourceSlugs: ['partner-ii-2012-2018', 'partner-ii', 'b9'] },
        'partner-iii': { genName: 'Partner III / Rifter (2018 - Présent)', genSlug: 'partner-iii', yearFrom: 2018, yearTo: 9999, sourceSlugs: ['partner-iii-2018-present', 'partner-iii', 'k9'] }
      }
    },
    'expert': {
      name: 'Expert',
      generations: {
        'expert-i': { genName: 'Expert I (1995 - 2006)', genSlug: 'expert-i', yearFrom: 1995, yearTo: 2006, sourceSlugs: ['expert-i', '224'] },
        'expert-ii': { genName: 'Expert II (2007 - 2016)', genSlug: 'expert-ii', yearFrom: 2007, yearTo: 2016, sourceSlugs: ['expert-ii', 'vf3a-vf3u-vf3x'] },
        'expert-iii': { genName: 'Expert III (2016 - Présent)', genSlug: 'expert-iii', yearFrom: 2016, yearTo: 9999, sourceSlugs: ['expert-iii-2016-present', 'expert-iii', 'v'] }
      }
    },
    'rifter': {
      name: 'Rifter',
      generations: {
        'rifter-i': { genName: 'Rifter (2018 - Présent)', genSlug: 'rifter-i', yearFrom: 2018, yearTo: 9999, sourceSlugs: ['rifter-2018-present', 'rifter'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 3. RENAULT
  // ──────────────────────────────────────────
  'renault': {
    'clio': {
      name: 'Clio',
      generations: {
        'clio-ii': { genName: 'Clio II (1998 - 2012)', genSlug: 'clio-ii', yearFrom: 1998, yearTo: 2012, sourceSlugs: ['clio-ii-bb-cb-1998-2012', 'clio-ii', 'bb0-1-2-cb0-1-2'] },
        'clio-iii': { genName: 'Clio III (2005 - 2014)', genSlug: 'clio-iii', yearFrom: 2005, yearTo: 2014, sourceSlugs: ['clio-iii-br-cr-2005-2014', 'clio-iii', 'br0-1-cr0-1'] },
        'clio-iv': { genName: 'Clio IV (2012 - 2020)', genSlug: 'clio-iv', yearFrom: 2012, yearTo: 2020, sourceSlugs: ['clio-iv-bh-kh-2012-2020', 'clio-iv', 'bh'] },
        'clio-v': { genName: 'Clio V (2019 - Présent)', genSlug: 'clio-v', yearFrom: 2019, yearTo: 9999, sourceSlugs: ['clio-v-b7-2019-present', 'clio-v', 'b7'] }
      }
    },
    'megane': {
      name: 'Megane',
      generations: {
        'megane-i': { genName: 'Megane I (1995 - 2002)', genSlug: 'megane-i', yearFrom: 1995, yearTo: 2002, sourceSlugs: ['megane-i', 'ba0-1'] },
        'megane-ii': { genName: 'Megane II (2002 - 2009)', genSlug: 'megane-ii', yearFrom: 2002, yearTo: 2009, sourceSlugs: ['megane-ii', 'bm0-1-cm0-1'] },
        'megane-iii': { genName: 'Megane III (2008 - 2016)', genSlug: 'megane-iii', yearFrom: 2008, yearTo: 2016, sourceSlugs: ['megane-iii', 'bz0-1'] },
        'megane-iv': { genName: 'Megane IV (2016 - 2024)', genSlug: 'megane-iv', yearFrom: 2016, yearTo: 2024, sourceSlugs: ['megane-iv-2018-2025', 'megane-iv', 'b9a-m'] }
      }
    },
    'captur': {
      name: 'Captur',
      generations: {
        'captur-i': { genName: 'Captur I (2013 - 2019)', genSlug: 'captur-i', yearFrom: 2013, yearTo: 2019, sourceSlugs: ['captur-i-2013-2019', 'captur-i', 'captur', 'j5-h5'] },
        'captur-ii': { genName: 'Captur II (2019 - Présent)', genSlug: 'captur-ii', yearFrom: 2019, yearTo: 9999, sourceSlugs: ['captur-ii-2019-present', 'captur-ii', 'hfb'] }
      }
    },
    'symbol': {
      name: 'Symbol',
      generations: {
        'symbol-i': { genName: 'Symbol I (1999 - 2008)', genSlug: 'symbol-i', yearFrom: 1999, yearTo: 2008, sourceSlugs: ['symbol-i', 'lb0-1-2'] },
        'symbol-ii': { genName: 'Symbol II (2008 - 2013)', genSlug: 'symbol-ii', yearFrom: 2008, yearTo: 2013, sourceSlugs: ['symbol-ii', 'lu1-2'] },
        'symbol-iii': { genName: 'Symbol III (2013 - 2021)', genSlug: 'symbol-iii', yearFrom: 2013, yearTo: 2021, sourceSlugs: ['symbol-iii-2013-2021', 'symbol-iii', 'l8'] }
      }
    },
    'kadjar': {
      name: 'Kadjar',
      generations: {
        'kadjar-i': { genName: 'Kadjar (2015 - 2022)', genSlug: 'kadjar-i', yearFrom: 2015, yearTo: 2022, sourceSlugs: ['kadjar-2015-2022', 'kadjar', 'ha-hl'] }
      }
    },
    'kangoo': {
      name: 'Kangoo',
      generations: {
        'kangoo-i': { genName: 'Kangoo I (1997 - 2008)', genSlug: 'kangoo-i', yearFrom: 1997, yearTo: 2008, sourceSlugs: ['kangoo-i', 'kangoo', 'kc0-1', 'fc0-1'] },
        'kangoo-ii': { genName: 'Kangoo II (2008 - 2021)', genSlug: 'kangoo-ii', yearFrom: 2008, yearTo: 2021, sourceSlugs: ['kangoo-ii-2013-2021', 'kangoo-ii', 'kw0-1', 'fw0-1'] },
        'kangoo-iii': { genName: 'Kangoo III (2021 - Présent)', genSlug: 'kangoo-iii', yearFrom: 2021, yearTo: 9999, sourceSlugs: ['kangoo-iii'] }
      }
    },
    'scenic': {
      name: 'Scenic',
      generations: {
        'scenic-i': { genName: 'Scenic I (1996 - 2003)', genSlug: 'scenic-i', yearFrom: 1996, yearTo: 2003, sourceSlugs: ['scenic-i', 'ja0-1'] },
        'scenic-ii': { genName: 'Scenic II (2003 - 2009)', genSlug: 'scenic-ii', yearFrom: 2003, yearTo: 2009, sourceSlugs: ['scenic-ii', 'jm0-1'] },
        'scenic-iii': { genName: 'Scenic III (2009 - 2016)', genSlug: 'scenic-iii', yearFrom: 2009, yearTo: 2016, sourceSlugs: ['scenic-iii', 'jz0-1'] },
        'scenic-iv': { genName: 'Scenic IV (2016 - 2022)', genSlug: 'scenic-iv', yearFrom: 2016, yearTo: 2022, sourceSlugs: ['scenic-iv', 'j9'] }
      }
    },
    'taliant': {
      name: 'Taliant',
      generations: {
        'taliant-i': { genName: 'Taliant (2021 - Présent)', genSlug: 'taliant-i', yearFrom: 2021, yearTo: 9999, sourceSlugs: ['taliant-i-2021-2025', 'taliant'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 4. CITROËN
  // ──────────────────────────────────────────
  'citroen': {
    'c3': {
      name: 'C3',
      generations: {
        'c3-i': { genName: 'C3 I (2002 - 2009)', genSlug: 'c3-i', yearFrom: 2002, yearTo: 2009, sourceSlugs: ['c3-i', 'fc-fn'] },
        'c3-ii': { genName: 'C3 II (2009 - 2016)', genSlug: 'c3-ii', yearFrom: 2009, yearTo: 2016, sourceSlugs: ['c3-ii', 'sc'] },
        'c3-iii': { genName: 'C3 III (2016 - 2024)', genSlug: 'c3-iii', yearFrom: 2016, yearTo: 2024, sourceSlugs: ['c3-iii-2016-2024', 'c3-iii', 'sx'] },
        'c3-iv': { genName: 'C3 IV (2024 - Présent)', genSlug: 'c3-iv', yearFrom: 2024, yearTo: 9999, sourceSlugs: ['c3-iv-2024-present', 'c3-iv'] }
      }
    },
    'c-elysee': {
      name: 'C-Elysée',
      generations: {
        'c-elysee': { genName: 'C-Elysée (2012 - Présent)', genSlug: 'c-elysee', yearFrom: 2012, yearTo: 9999, sourceSlugs: ['c-elysee-ii-2012-2018', 'c-elysee-ii-2018-2023', 'dd', 'c-elysee-i', 'c-elysee'] }
      }
    },
    'c4': {
      name: 'C4',
      generations: {
        'c4-i': { genName: 'C4 I (2004 - 2010)', genSlug: 'c4-i', yearFrom: 2004, yearTo: 2010, sourceSlugs: ['c4-i', 'lc'] },
        'c4-ii': { genName: 'C4 II (2010 - 2018)', genSlug: 'c4-ii', yearFrom: 2010, yearTo: 2018, sourceSlugs: ['c4-ii', 'b7'] },
        'c4-cactus': { genName: 'C4 Cactus (2014 - 2020)', genSlug: 'c4-cactus', yearFrom: 2014, yearTo: 2020, sourceSlugs: ['cactus-2014-2018', 'cactus-2018-2021', 'cactus'] },
        'c4-iii': { genName: 'C4 III / C4 X (2020 - Présent)', genSlug: 'c4-iii', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['c4-i-2018-2022', 'x-2022-present', 'c4-iii', 'ba-bb-bc'] }
      }
    },
    'c5': {
      name: 'C5',
      generations: {
        'c5-i': { genName: 'C5 I (2001 - 2008)', genSlug: 'c5-i', yearFrom: 2001, yearTo: 2008, sourceSlugs: ['c5-i', 'dc-de', 'rc-re'] },
        'c5-ii': { genName: 'C5 II (2008 - 2017)', genSlug: 'c5-ii', yearFrom: 2008, yearTo: 2017, sourceSlugs: ['c5-ii', 'rd-td'] }
      }
    },
    'berlingo': {
      name: 'Berlingo',
      generations: {
        'berlingo-i': { genName: 'Berlingo I (1996 - 2008)', genSlug: 'berlingo-i', yearFrom: 1996, yearTo: 2008, sourceSlugs: ['berlingo-i', 'mf-gjk-gfk', 'box-body-mpv-m'] },
        'berlingo-ii': { genName: 'Berlingo II (2008 - 2018)', genSlug: 'berlingo-ii', yearFrom: 2008, yearTo: 2018, sourceSlugs: ['berlingo-ii-2012-2018', 'berlingo-ii', 'multispace-b9', 'box-body-mpv-b9', 'b9'] },
        'berlingo-iii': { genName: 'Berlingo III (2018 - Présent)', genSlug: 'berlingo-iii', yearFrom: 2018, yearTo: 9999, sourceSlugs: ['berlingo-iii-2018-present', 'berlingo-iii', 'er-ec', 'k9'] }
      }
    },
    'jumpy': {
      name: 'Jumpy',
      generations: {
        'jumpy-i': { genName: 'Jumpy I (1995 - 2006)', genSlug: 'jumpy-i', yearFrom: 1995, yearTo: 2006, sourceSlugs: ['jumpy-i', 'u60'] },
        'jumpy-ii': { genName: 'Jumpy II (2007 - 2016)', genSlug: 'jumpy-ii', yearFrom: 2007, yearTo: 2016, sourceSlugs: ['jumpy-ii', 'vf7'] },
        'jumpy-iii': { genName: 'Jumpy III (2016 - Présent)', genSlug: 'jumpy-iii', yearFrom: 2016, yearTo: 9999, sourceSlugs: ['jumpy-iii-2016-present', 'jumpy-iii', 'v'] }
      }
    },
    'xsara': {
      name: 'Xsara',
      generations: {
        'xsara-i': { genName: 'Xsara (1997 - 2005)', genSlug: 'xsara-i', yearFrom: 1997, yearTo: 2005, sourceSlugs: ['xsara', 'n1', 'break-n2', 'coupe-n0', 'xsara-i'] },
        'xsara-picasso': { genName: 'Xsara Picasso (1999 - 2010)', genSlug: 'xsara-picasso', yearFrom: 1999, yearTo: 2010, sourceSlugs: ['picasso-n68', 'picasso'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 5. FIAT
  // ──────────────────────────────────────────
  'fiat': {
    '500': {
      name: '500',
      generations: {
        '500-312': { genName: '500 (312) (2007 - Présent)', genSlug: '500-312', yearFrom: 2007, yearTo: 9999, sourceSlugs: ['312-2021-present', '312-2007-2020', '312', '500'] }
      }
    },
    'tipo': {
      name: 'Tipo',
      generations: {
        'tipo-356': { genName: 'Tipo (356) (2015 - Présent)', genSlug: 'tipo-356', yearFrom: 2015, yearTo: 9999, sourceSlugs: ['356-2016-present', '356-2016-2021', '356-2016-2018', '357-2018-present', '356', 'tipo'] }
      }
    },
    '500x': {
      name: '500X',
      generations: {
        '500x-334': { genName: '500X (334) (2014 - Présent)', genSlug: '500x-334', yearFrom: 2014, yearTo: 9999, sourceSlugs: ['334-2014-2018', '334-2019-present', '334', '500x'] }
      }
    },
    '500l': {
      name: '500L',
      generations: {
        '500l-351': { genName: '500L (2012 - Présent)', genSlug: '500l-351', yearFrom: 2012, yearTo: 9999, sourceSlugs: ['352-2012-2020', '351-352', '500l'] }
      }
    },
    'punto': {
      name: 'Punto',
      generations: {
        'punto-ii': { genName: 'Punto II (188) (1999 - 2012)', genSlug: 'punto-ii', yearFrom: 1999, yearTo: 2012, sourceSlugs: ['punto-ii', '188'] },
        'punto-iii': { genName: 'Grande Punto / Punto Evo / Punto III (199) (2005 - 2018)', genSlug: 'punto-iii', yearFrom: 2005, yearTo: 2018, sourceSlugs: ['grande-punto', 'punto-evo', 'punto-iii', '199', 'punto'] }
      }
    },
    'panda': {
      name: 'Panda',
      generations: {
        'panda-ii': { genName: 'Panda II (169) (2003 - 2012)', genSlug: 'panda-ii', yearFrom: 2003, yearTo: 2012, sourceSlugs: ['panda-ii', '169'] },
        'panda-iii': { genName: 'Panda III (312/319) (2012 - Présent)', genSlug: 'panda-iii', yearFrom: 2012, yearTo: 9999, sourceSlugs: ['panda-iii', '312-319', 'panda'] }
      }
    },
    'doblo': {
      name: 'Doblo',
      generations: {
        'doblo-i': { genName: 'Doblo I (119/223) (2000 - 2010)', genSlug: 'doblo-i', yearFrom: 2000, yearTo: 2010, sourceSlugs: ['doblo-i', '119-223'] },
        'doblo-ii': { genName: 'Doblo II (263) (2010 - 2022)', genSlug: 'doblo-ii', yearFrom: 2010, yearTo: 2022, sourceSlugs: ['263-2010-2022', '263-2015-2024', '263', 'doblo-ii'] },
        'doblo-iii': { genName: 'Doblo III (K9) (2022 - Présent)', genSlug: 'doblo-iii', yearFrom: 2022, yearTo: 9999, sourceSlugs: ['k9-2023-present', 'k9', 'doblo-iii'] }
      }
    },
    'fiorino': {
      name: 'Fiorino',
      generations: {
        'fiorino-iii': { genName: 'Fiorino III (225) (2007 - Présent)', genSlug: 'fiorino-iii', yearFrom: 2007, yearTo: 9999, sourceSlugs: ['225-2008-present', '225', 'fiorino'] }
      }
    },
    'ducato': {
      name: 'Ducato',
      generations: {
        'ducato-iii': { genName: 'Ducato III (250/290) (2006 - Présent)', genSlug: 'ducato-iii', yearFrom: 2006, yearTo: 9999, sourceSlugs: ['250-2014-2022', '290-2022-present', '250', '290', 'ducato'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 6. FORD
  // ──────────────────────────────────────────
  'ford': {
    'fiesta': {
      name: 'Fiesta',
      generations: {
        'fiesta-iv': { genName: 'Fiesta IV (1995 - 2002)', genSlug: 'fiesta-iv', yearFrom: 1995, yearTo: 2002, sourceSlugs: ['fiesta-iv', 'jas-jbs'] },
        'fiesta-v': { genName: 'Fiesta V (2002 - 2008)', genSlug: 'fiesta-v', yearFrom: 2002, yearTo: 2008, sourceSlugs: ['fiesta-v', 'jh-jd'] },
        'fiesta-vi': { genName: 'Fiesta VI (2008 - 2017)', genSlug: 'fiesta-vi', yearFrom: 2008, yearTo: 2017, sourceSlugs: ['fiesta-v-2014-2017', 'fiesta-vi', 'cb1-ccn'] },
        'fiesta-vii': { genName: 'Fiesta VII (2017 - 2023)', genSlug: 'fiesta-vii', yearFrom: 2017, yearTo: 2023, sourceSlugs: ['mk8-2017-2023', 'fiesta-vii', 'hje'] }
      }
    },
    'focus': {
      name: 'Focus',
      generations: {
        'focus-i': { genName: 'Focus I (1998 - 2004)', genSlug: 'focus-i', yearFrom: 1998, yearTo: 2004, sourceSlugs: ['focus-i', 'daw-dbw'] },
        'focus-ii': { genName: 'Focus II (2004 - 2011)', genSlug: 'focus-ii', yearFrom: 2004, yearTo: 2011, sourceSlugs: ['mk2-2004-2011', 'focus-ii', 'da-hcp-dp'] },
        'focus-iii': { genName: 'Focus III (2011 - 2018)', genSlug: 'focus-iii', yearFrom: 2011, yearTo: 2018, sourceSlugs: ['focus-v-2015-2018', 'mk3-2012-2018', 'focus-iii', 'dyb'] },
        'focus-iv': { genName: 'Focus IV (2018 - Présent)', genSlug: 'focus-iv', yearFrom: 2018, yearTo: 9999, sourceSlugs: ['mk4-2018-present', 'focus-iv', 'hnj'] }
      }
    },
    'kuga': {
      name: 'Kuga',
      generations: {
        'kuga-i': { genName: 'Kuga I (2008 - 2012)', genSlug: 'kuga-i', yearFrom: 2008, yearTo: 2012, sourceSlugs: ['kuga-i'] },
        'kuga-ii': { genName: 'Kuga II (2012 - 2020)', genSlug: 'kuga-ii', yearFrom: 2012, yearTo: 2020, sourceSlugs: ['mk2-2013-2020', 'kuga-ii', 'dm2'] },
        'kuga-iii': { genName: 'Kuga III (2020 - Présent)', genSlug: 'kuga-iii', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['mk3-2020-present', 'kuga-iii', 'dfk'] }
      }
    },
    'c-max': {
      name: 'C-Max',
      generations: {
        'c-max-i': { genName: 'C-Max I (2003 - 2010)', genSlug: 'c-max-i', yearFrom: 2003, yearTo: 2010, sourceSlugs: ['c-max-i', 'dm2'] },
        'c-max-ii': { genName: 'C-Max II (2010 - 2019)', genSlug: 'c-max-ii', yearFrom: 2010, yearTo: 2019, sourceSlugs: ['c-max-ii', 'dxa-cb7-dxa-ceu'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 7. OPEL
  // ──────────────────────────────────────────
  'opel': {
    'corsa': {
      name: 'Corsa',
      generations: {
        'corsa-c': { genName: 'Corsa C (2000 - 2006)', genSlug: 'corsa-c', yearFrom: 2000, yearTo: 2006, sourceSlugs: ['corsa-c', 'x01'] },
        'corsa-d': { genName: 'Corsa D (2006 - 2014)', genSlug: 'corsa-d', yearFrom: 2006, yearTo: 2014, sourceSlugs: ['corsa-d', 's07'] },
        'corsa-e': { genName: 'Corsa E (2014 - 2019)', genSlug: 'corsa-e', yearFrom: 2014, yearTo: 2019, sourceSlugs: ['e-2015-2019', 'corsa-e', 'x15'] },
        'corsa-f': { genName: 'Corsa F (2019 - Présent)', genSlug: 'corsa-f', yearFrom: 2019, yearTo: 9999, sourceSlugs: ['f-2019-present', 'corsa-f'] }
      }
    },
    'astra': {
      name: 'Astra',
      generations: {
        'astra-g': { genName: 'Astra G (1998 - 2004)', genSlug: 'astra-g', yearFrom: 1998, yearTo: 2004, sourceSlugs: ['astra-g', 't98'] },
        'astra-h': { genName: 'Astra H (2004 - 2010)', genSlug: 'astra-h', yearFrom: 2004, yearTo: 2010, sourceSlugs: ['astra-h', 'a04'] },
        'astra-j': { genName: 'Astra J (2009 - 2015)', genSlug: 'astra-j', yearFrom: 2009, yearTo: 2015, sourceSlugs: ['j-2012-2015', 'astra-j', 'p10'] },
        'astra-k': { genName: 'Astra K (2015 - 2022)', genSlug: 'astra-k', yearFrom: 2015, yearTo: 2022, sourceSlugs: ['k-2015-2022', 'astra-k', 'b16'] },
        'astra-l': { genName: 'Astra L (2021 - Présent)', genSlug: 'astra-l', yearFrom: 2021, yearTo: 9999, sourceSlugs: ['astra-l'] }
      }
    },
    'mokka': {
      name: 'Mokka',
      generations: {
        'mokka-a': { genName: 'Mokka A (2012 - 2020)', genSlug: 'mokka-a', yearFrom: 2012, yearTo: 2020, sourceSlugs: ['mokka-a', 'j13'] },
        'mokka-b': { genName: 'Mokka B (2020 - Présent)', genSlug: 'mokka-b', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['f-2020-present', 'mokka-b'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 8. SEAT
  // ──────────────────────────────────────────
  'seat': {
    'ibiza': {
      name: 'Ibiza',
      generations: {
        'ibiza-iii': { genName: 'Ibiza III (6L) (2002 - 2008)', genSlug: 'ibiza-iii', yearFrom: 2002, yearTo: 2008, sourceSlugs: ['ibiza-iii', '6l1'] },
        'ibiza-iv': { genName: 'Ibiza IV (6J/6P) (2008 - 2017)', genSlug: 'ibiza-iv', yearFrom: 2008, yearTo: 2017, sourceSlugs: ['ibiza-iv', '6j5-6p1', '6j1-6p5', '6j8-6p8'] },
        'ibiza-v': { genName: 'Ibiza V (KJ1) (2017 - Présent)', genSlug: 'ibiza-v', yearFrom: 2017, yearTo: 9999, sourceSlugs: ['mk5-2017-2021', 'ibiza-v', 'kj1'] }
      }
    },
    'leon': {
      name: 'Leon',
      generations: {
        'leon-i': { genName: 'Leon I (1M) (1999 - 2006)', genSlug: 'leon-i', yearFrom: 1999, yearTo: 2006, sourceSlugs: ['leon-i', '1m1'] },
        'leon-ii': { genName: 'Leon II (1P) (2005 - 2012)', genSlug: 'leon-ii', yearFrom: 2005, yearTo: 2012, sourceSlugs: ['leon-ii', '1p1'] },
        'leon-iii': { genName: 'Leon III (5F) (2012 - 2020)', genSlug: 'leon-iii', yearFrom: 2012, yearTo: 2020, sourceSlugs: ['leon-iii', '5f1', '5f5', '5f8'] },
        'leon-iv': { genName: 'Leon IV (KL) (2020 - Présent)', genSlug: 'leon-iv', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['mk4-2020-present', 'leon-iv', 'kl1', 'kl8'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 9. ŠKODA
  // ──────────────────────────────────────────
  'skoda': {
    'octavia': {
      name: 'Octavia',
      generations: {
        'octavia-i': { genName: 'Octavia I (1U) (1996 - 2010)', genSlug: 'octavia-i', yearFrom: 1996, yearTo: 2010, sourceSlugs: ['octavia-i', '1u2', '1u5'] },
        'octavia-ii': { genName: 'Octavia II (1Z) (2004 - 2013)', genSlug: 'octavia-ii', yearFrom: 2004, yearTo: 2013, sourceSlugs: ['octavia-ii', '1z3', '1z5'] },
        'octavia-iii': { genName: 'Octavia III (5E) (2012 - 2020)', genSlug: 'octavia-iii', yearFrom: 2012, yearTo: 2020, sourceSlugs: ['octavia-iii', '5e3-nl3-nr3', '5e5-5e6'] },
        'octavia-iv': { genName: 'Octavia IV (NX) (2020 - Présent)', genSlug: 'octavia-iv', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['mk4-2020-present', 'octavia-iv', 'nx3-nn3', 'nx5'] }
      }
    },
    'fabia': {
      name: 'Fabia',
      generations: {
        'fabia-i': { genName: 'Fabia I (6Y) (1999 - 2008)', genSlug: 'fabia-i', yearFrom: 1999, yearTo: 2008, sourceSlugs: ['fabia-i', '6y2', '6y3', '6y5'] },
        'fabia-ii': { genName: 'Fabia II (542) (2007 - 2014)', genSlug: 'fabia-ii', yearFrom: 2007, yearTo: 2014, sourceSlugs: ['fabia-ii', '542', '545'] },
        'fabia-iii': { genName: 'Fabia III (NJ) (2014 - 2021)', genSlug: 'fabia-iii', yearFrom: 2014, yearTo: 2021, sourceSlugs: ['fabia-iii', 'nj3', 'nj5'] },
        'fabia-iv': { genName: 'Fabia IV (PJ) (2021 - Présent)', genSlug: 'fabia-iv', yearFrom: 2021, yearTo: 9999, sourceSlugs: ['mk4-2022-present', 'fabia-iv', 'pj3'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 10. AUDI
  // ──────────────────────────────────────────
  'audi': {
    'a3': {
      name: 'A3',
      generations: {
        'a3-8l': { genName: 'A3 (8L) (1996 - 2003)', genSlug: 'a3-8l', yearFrom: 1996, yearTo: 2003, sourceSlugs: ['a3-8l', '8l1'] },
        'a3-8p': { genName: 'A3 (8P) (2003 - 2013)', genSlug: 'a3-8p', yearFrom: 2003, yearTo: 2013, sourceSlugs: ['a3-8p', '8p1', 'sportback-8pa', '8p7'] },
        'a3-8v': { genName: 'A3 (8V) (2012 - 2020)', genSlug: 'a3-8v', yearFrom: 2012, yearTo: 2020, sourceSlugs: ['a3-8v', '8v', '8v1-8vk', 'sportback-8va-8vf', '8vs-8vm', '8v7-8ve'] },
        'a3-8y': { genName: 'A3 (8Y) (2020 - Présent)', genSlug: 'a3-8y', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['a3-8y', 'sportback-8ya', '8ys'] }
      }
    },
    'a4': {
      name: 'A4',
      generations: {
        'a4-b5': { genName: 'A4 (B5) (1994 - 2001)', genSlug: 'a4-b5', yearFrom: 1994, yearTo: 2001, sourceSlugs: ['a4-b5', '8d2-b5', '8d5-b5'] },
        'a4-b6': { genName: 'A4 (B6) (2000 - 2004)', genSlug: 'a4-b6', yearFrom: 2000, yearTo: 2004, sourceSlugs: ['a4-b6', '8e2-b6', '8e5-b6', '8h7-b6'] },
        'a4-b7': { genName: 'A4 (B7) (2004 - 2008)', genSlug: 'a4-b7', yearFrom: 2004, yearTo: 2008, sourceSlugs: ['a4-b7', '8ec-b7', '8ed-b7', '8he-b7'] },
        'a4-b8': { genName: 'A4 (B8) (2007 - 2015)', genSlug: 'a4-b8', yearFrom: 2007, yearTo: 2015, sourceSlugs: ['a4-b8', 'b8', '8k2-b8', '8k5-b8', '8kh-b8'] },
        'a4-b9': { genName: 'A4 (B9) (2015 - Présent)', genSlug: 'a4-b9', yearFrom: 2015, yearTo: 9999, sourceSlugs: ['a4-b9', '8w2-8wc-b9', '8w5-8wd-b9', '8wh-8wj-b9'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 11. TOYOTA
  // ──────────────────────────────────────────
  'toyota': {
    'yaris': {
      name: 'Yaris',
      generations: {
        'yaris-i': { genName: 'Yaris I (XP10) (1999 - 2005)', genSlug: 'yaris-i', yearFrom: 1999, yearTo: 2005, sourceSlugs: ['yaris-i', 'p1'] },
        'yaris-ii': { genName: 'Yaris II (XP90) (2005 - 2011)', genSlug: 'yaris-ii', yearFrom: 2005, yearTo: 2011, sourceSlugs: ['yaris-ii', 'p9'] },
        'yaris-iii': { genName: 'Yaris III (XP130) (2011 - 2020)', genSlug: 'yaris-iii', yearFrom: 2011, yearTo: 2020, sourceSlugs: ['xp130-2011-2020', 'xp130-2011-2016', 'yaris-iii', 'p13'] },
        'yaris-iv': { genName: 'Yaris IV (XP210) (2020 - Présent)', genSlug: 'yaris-iv', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['xp210-2020-present', 'p21-pa1-ph1'] }
      }
    },
    'corolla': {
      name: 'Corolla',
      generations: {
        'corolla-ix': { genName: 'Corolla IX (E120) (2001 - 2007)', genSlug: 'corolla-ix', yearFrom: 2001, yearTo: 2007, sourceSlugs: ['e12'] },
        'corolla-x': { genName: 'Corolla X (E140/E150) (2006 - 2013)', genSlug: 'corolla-x', yearFrom: 2006, yearTo: 2013, sourceSlugs: ['e15'] },
        'corolla-xi': { genName: 'Corolla XI (E170/E180) (2013 - 2019)', genSlug: 'corolla-xi', yearFrom: 2013, yearTo: 2019, sourceSlugs: ['saloon-e18-zre17', 'e18'] },
        'corolla-xii': { genName: 'Corolla XII (E210) (2019 - Présent)', genSlug: 'corolla-xii', yearFrom: 2019, yearTo: 9999, sourceSlugs: ['sedan-2019-present', 'saloon-e21'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 12. HYUNDAI
  // ──────────────────────────────────────────
  'hyundai': {
    'i10': {
      name: 'i10',
      generations: {
        'i10-i': { genName: 'i10 I (PA) (2007 - 2013)', genSlug: 'i10-i', yearFrom: 2007, yearTo: 2013, sourceSlugs: ['i10-i', 'pa'] },
        'i10-ii': { genName: 'i10 II (BA/IA) (2013 - 2019)', genSlug: 'i10-ii', yearFrom: 2013, yearTo: 2019, sourceSlugs: ['ba-2014-2019', 'i10-ii', 'ba-ia'] },
        'i10-iii': { genName: 'i10 III (AC3) (2019 - Présent)', genSlug: 'i10-iii', yearFrom: 2019, yearTo: 9999, sourceSlugs: ['ac3-2020-present', 'ac3-ai3'] }
      }
    },
    'i20': {
      name: 'i20',
      generations: {
        'i20-i': { genName: 'i20 I (PB) (2008 - 2014)', genSlug: 'i20-i', yearFrom: 2008, yearTo: 2014, sourceSlugs: ['i20-i', 'pb-pbt'] },
        'i20-ii': { genName: 'i20 II (GB) (2014 - 2020)', genSlug: 'i20-ii', yearFrom: 2014, yearTo: 2020, sourceSlugs: ['gb-2016-2020', 'i20-ii-2016-2020', 'i20-ii', 'gb-ib', 'gb'] },
        'i20-iii': { genName: 'i20 III (BC3) (2020 - Présent)', genSlug: 'i20-iii', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['bp-2020-2026', 'bc3-bi3'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 13. KIA
  // ──────────────────────────────────────────
  'kia': {
    'picanto': {
      name: 'Picanto',
      generations: {
        'picanto-i': { genName: 'Picanto I (SA) (2004 - 2011)', genSlug: 'picanto-i', yearFrom: 2004, yearTo: 2011, sourceSlugs: ['picanto-i', 'sa'] },
        'picanto-ii': { genName: 'Picanto II (TA) (2011 - 2017)', genSlug: 'picanto-ii', yearFrom: 2011, yearTo: 2017, sourceSlugs: ['picanto-ii', 'ta'] },
        'picanto-iii': { genName: 'Picanto III (JA) (2017 - Présent)', genSlug: 'picanto-iii', yearFrom: 2017, yearTo: 9999, sourceSlugs: ['ja-2017-present', 'picanto-iii', 'ja'] }
      }
    },
    'rio': {
      name: 'Rio',
      generations: {
        'rio-ii': { genName: 'Rio II (JB) (2005 - 2011)', genSlug: 'rio-ii', yearFrom: 2005, yearTo: 2011, sourceSlugs: ['rio-ii', 'jb'] },
        'rio-iii': { genName: 'Rio III (UB) (2011 - 2017)', genSlug: 'rio-iii', yearFrom: 2011, yearTo: 2017, sourceSlugs: ['rio-iii', 'ub'] },
        'rio-iv': { genName: 'Rio IV (YB/SC) (2017 - 2023)', genSlug: 'rio-iv', yearFrom: 2017, yearTo: 2023, sourceSlugs: ['qb-2017-2023', 'rio-iv', 'yb-sc-fb'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 14. NISSAN
  // ──────────────────────────────────────────
  'nissan': {
    'micra': {
      name: 'Micra',
      generations: {
        'micra-iii': { genName: 'Micra III (K12) (2002 - 2010)', genSlug: 'micra-iii', yearFrom: 2002, yearTo: 2010, sourceSlugs: ['micra-iii', 'k12'] },
        'micra-iv': { genName: 'Micra IV (K13) (2010 - 2017)', genSlug: 'micra-iv', yearFrom: 2010, yearTo: 2017, sourceSlugs: ['micra-iv', 'k13'] },
        'micra-v': { genName: 'Micra V (K14) (2017 - Présent)', genSlug: 'micra-v', yearFrom: 2017, yearTo: 9999, sourceSlugs: ['k14-2016-present', 'micra-v', 'k14'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 15. CHEVROLET
  // ──────────────────────────────────────────
  'chevrolet': {
    'spark': {
      name: 'Spark',
      generations: {
        'spark-ii': { genName: 'Spark II (M300) (2009 - 2015)', genSlug: 'spark-ii', yearFrom: 2009, yearTo: 2015, sourceSlugs: ['spark-ii-2009-2015', 'm300'] },
        'spark-iii': { genName: 'Spark III (M400) (2015 - 2022)', genSlug: 'spark-iii', yearFrom: 2015, yearTo: 2022, sourceSlugs: ['spark-ii-2016-2022', 'm400'] }
      }
    },
    'aveo': {
      name: 'Aveo',
      generations: {
        'aveo-i': { genName: 'Aveo I (T250) (2006 - 2011)', genSlug: 'aveo-i', yearFrom: 2006, yearTo: 2011, sourceSlugs: ['kalos-t250-t255'] },
        'aveo-ii': { genName: 'Aveo II (T300) (2011 - 2018)', genSlug: 'aveo-ii', yearFrom: 2011, yearTo: 2018, sourceSlugs: ['aveo-v-2012-2018', 'aveo-vi-2012-2018', 't300'] }
      }
    },
    'cruze': {
      name: 'Cruze',
      generations: {
        'cruze-i': { genName: 'Cruze I (J300) (2008 - 2016)', genSlug: 'cruze-i', yearFrom: 2008, yearTo: 2016, sourceSlugs: ['j300'] },
        'cruze-ii': { genName: 'Cruze II (J400) (2016 - 2023)', genSlug: 'cruze-ii', yearFrom: 2016, yearTo: 2023, sourceSlugs: ['j400'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 16. ALFA ROMEO
  // ──────────────────────────────────────────
  'alfa-romeo': {
    '147': {
      name: '147',
      generations: {
        '147': { genName: '147 (937) (2000 - 2010)', genSlug: '147', yearFrom: 2000, yearTo: 2010, sourceSlugs: ['937', '147'] }
      }
    },
    '156': {
      name: '156',
      generations: {
        '156': { genName: '156 (932) (1997 - 2005)', genSlug: '156', yearFrom: 1997, yearTo: 2005, sourceSlugs: ['932', 'sportwagon-932', '156'] }
      }
    },
    'giulietta': {
      name: 'Giulietta',
      generations: {
        'giulietta': { genName: 'Giulietta (940) (2010 - 2020)', genSlug: 'giulietta', yearFrom: 2010, yearTo: 2020, sourceSlugs: ['940', 'giulietta'] }
      }
    },
    'mito': {
      name: 'MiTo',
      generations: {
        'mito': { genName: 'MiTo (955) (2008 - 2018)', genSlug: 'mito', yearFrom: 2008, yearTo: 2018, sourceSlugs: ['955', 'mito'] }
      }
    },
    'stelvio': {
      name: 'Stelvio',
      generations: {
        'stelvio': { genName: 'Stelvio (949) (2016 - Présent)', genSlug: 'stelvio', yearFrom: 2016, yearTo: 9999, sourceSlugs: ['stelvio-ii-2016-2026', '949', 'stelvio'] }
      }
    }
  },

  // ──────────────────────────────────────────
  // 17. CUPRA
  // ──────────────────────────────────────────
  'cupra': {
    'formentor': {
      name: 'Formentor',
      generations: {
        'formentor': { genName: 'Formentor (KM7) (2020 - Présent)', genSlug: 'formentor', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['mk1-2022-present', 'mk1-2023-present', 'mk1-2021-present', 'km7', 'formentor'] }
      }
    },
    'leon': {
      name: 'Leon',
      generations: {
        'leon-iv': { genName: 'Leon (KL) (2020 - Présent)', genSlug: 'leon-iv', yearFrom: 2020, yearTo: 9999, sourceSlugs: ['sportstourer-2021-present', 'kl1', 'km7', 'leon'] }
      }
    },
    'ateca': {
      name: 'Ateca',
      generations: {
        'ateca': { genName: 'Ateca (KH7) (2018 - Présent)', genSlug: 'ateca', yearFrom: 2018, yearTo: 9999, sourceSlugs: ['mk1-2021-present', 'kh7', 'km7', 'ateca'] }
      }
    },
    'born': {
      name: 'Born',
      generations: {
        'born': { genName: 'Born (K11) (2021 - Présent)', genSlug: 'born', yearFrom: 2021, yearTo: 9999, sourceSlugs: ['k11', 'born'] }
      }
    }
  }
};

module.exports = { CANONICAL_SCHEMAS };
