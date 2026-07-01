import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'automobile',
      slug: 'automobile',
      name: 'Automobile',
      productCount: 145,
      children: [
        {
          id: 'auto-huiles-moteur',
          slug: 'huiles-moteur',
          name: 'Huiles Moteur',
          productCount: 70,
        },
        {
          id: 'auto-huiles-boite',
          slug: 'huiles-boite-et-pont',
          name: 'Huiles de Boîte et Pont',
          productCount: 38,
        },
        {
          id: 'auto-direction-freinage',
          slug: 'direction-freinage',
          name: 'Direction / Freinage',
          productCount: 17,
        },
        {
          id: 'auto-additifs-entretien',
          slug: 'additifs-entretien',
          name: 'Additifs / Entretien',
          productCount: 13,
        },
        {
          id: 'auto-liquide-refroidissement',
          slug: 'liquide-refroidissement',
          name: 'Liquide Refroidissement',
          productCount: 7,
        },
      ],
    },
    {
      id: 'moto-quad-karting',
      slug: 'moto-quad-karting',
      name: 'Moto / Quad / Karting',
      productCount: 45,
      children: [
        {
          id: 'moto-huiles-moteur',
          slug: 'huiles-moteur',
          name: 'Huiles Moteur',
          productCount: 20,
        },
        {
          id: 'moto-huiles-boite',
          slug: 'huiles-boite',
          name: 'Huiles de Boîte',
          productCount: 10,
        },
        {
          id: 'moto-huiles-fourche',
          slug: 'huiles-fourche',
          name: 'Huiles de fourche',
          productCount: 5,
        },
        {
          id: 'moto-liquide-refroidissement',
          slug: 'liquide-refroidissement',
          name: 'Liquide Refroidissement',
          productCount: 5,
        },
        { id: 'moto-divers', slug: 'divers', name: 'Divers', productCount: 5 },
      ],
    },
    {
      id: 'transport-tp',
      slug: 'transport-tp',
      name: 'Transport / T.P.',
      productCount: 80,
      children: [
        { id: 'tp-huiles-moteur', slug: 'huiles-moteur', name: 'Huiles Moteur', productCount: 40 },
        {
          id: 'tp-huiles-boite',
          slug: 'huiles-boite-et-pont',
          name: 'Huiles de Boîte et Pont',
          productCount: 20,
        },
        {
          id: 'tp-huiles-hydrauliques',
          slug: 'huiles-hydrauliques',
          name: 'Huiles Hydrauliques',
          productCount: 10,
        },
        { id: 'tp-graisse', slug: 'graisse', name: 'Graisse', productCount: 5 },
        { id: 'tp-divers', slug: 'divers', name: 'Divers', productCount: 5 },
      ],
    },
    {
      id: 'agriculture-motoculture',
      slug: 'agriculture-motoculture',
      name: 'Agriculture / Motoculture',
      productCount: 60,
      children: [
        {
          id: 'agri-huiles-moteur',
          slug: 'huiles-moteur',
          name: 'Huiles Moteur',
          productCount: 25,
        },
        {
          id: 'agri-huiles-boite',
          slug: 'huiles-boite-et-pont',
          name: 'Huiles de Boîte et Pont',
          productCount: 15,
        },
        {
          id: 'agri-huiles-multifonctionnelles',
          slug: 'huiles-multifonctionnelles',
          name: 'Huiles Multifonctionnelles',
          productCount: 10,
        },
        {
          id: 'agri-huiles-hydrauliques',
          slug: 'huiles-hydrauliques',
          name: 'Huiles Hydrauliques',
          productCount: 5,
        },
        { id: 'agri-graisse', slug: 'graisse', name: 'Graisse', productCount: 3 },
        { id: 'agri-divers', slug: 'divers', name: 'Divers', productCount: 2 },
      ],
    },
    {
      id: 'industrie-specialites',
      slug: 'industrie-specialites',
      name: 'Industrie et spécialités',
      productCount: 90,
      children: [
        {
          id: 'ind-huiles-compresseur',
          slug: 'huiles-compresseur',
          name: 'Huiles de Compresseur',
          productCount: 10,
        },
        {
          id: 'ind-huiles-engrenage',
          slug: 'huiles-engrenage-reducteur',
          name: "Huiles d'Engrenage/Réducteur",
          productCount: 15,
        },
        { id: 'ind-huiles-coupe', slug: 'huiles-coupe', name: 'Huiles de Coupe', productCount: 10 },
        {
          id: 'ind-huiles-hydrauliques',
          slug: 'huiles-hydrauliques',
          name: 'Huiles Hydrauliques',
          productCount: 20,
        },
        {
          id: 'ind-huiles-glissiere',
          slug: 'huiles-glissiere',
          name: 'Huiles de Glissière',
          productCount: 5,
        },
        {
          id: 'ind-huiles-agro',
          slug: 'huiles-agro-alimentaires',
          name: 'Huiles Agro-Alimentaires',
          productCount: 5,
        },
        { id: 'ind-huiles-moteur', slug: 'huiles-moteur', name: 'Huiles Moteur', productCount: 10 },
        {
          id: 'ind-liquide-refroidissement',
          slug: 'liquide-refroidissement',
          name: 'Liquide Refroidissement',
          productCount: 5,
        },
        { id: 'ind-graisse', slug: 'graisse', name: 'Graisse', productCount: 5 },
        { id: 'ind-divers', slug: 'divers', name: 'Divers', productCount: 5 },
      ],
    },
    {
      id: 'marine-nautisme',
      slug: 'marine-nautisme',
      name: 'Marine nautisme',
      productCount: 30,
      children: [
        { id: 'mar-huiles-moteur', slug: 'huiles-moteur', name: 'Huiles Moteur', productCount: 15 },
        {
          id: 'mar-huiles-hydrauliques',
          slug: 'huiles-hydrauliques',
          name: 'Huiles Hydrauliques',
          productCount: 10,
        },
        { id: 'mar-graisse', slug: 'graisse', name: 'Graisse', productCount: 3 },
        { id: 'mar-divers', slug: 'divers', name: 'Divers', productCount: 2 },
      ],
    },
    {
      id: 'filtres',
      slug: 'filtres',
      name: 'Filtres',
      productCount: 120,
      children: [
        { id: 'filtres-huile', slug: 'filtres-huile', name: 'Filtres à Huile', productCount: 50 },
        { id: 'filtres-air', slug: 'filtres-air', name: 'Filtres à Air', productCount: 40 },
        {
          id: 'filtres-carburant',
          slug: 'filtres-carburant',
          name: 'Filtres à Carburant',
          productCount: 20,
        },
        {
          id: 'filtres-habitacles',
          slug: 'filtres-habitacles',
          name: 'Filtres Habitacles',
          productCount: 10,
        },
      ],
    },
    {
      id: 'additifs-entretien',
      slug: 'additifs-entretien',
      name: 'Additifs / Entretien',
      productCount: 45,
      children: [],
    },
  ])
}
