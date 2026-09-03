import type { Metadata } from 'next';
import CategoriePage from './client-page';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const formattedName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return {
    title: `${formattedName} | specpart`,
    description: `Découvrez notre sélection de ${formattedName} de qualité au meilleur prix en Tunisie chez specpart.`,
    alternates: {
      canonical: `/${locale}/categorie/${slug}`,
      languages: {
        fr: `/fr/categorie/${slug}`,
        en: `/en/categorie/${slug}`,
        ar: `/ar/categorie/${slug}`,
      },
    },
  };
}

export default function Page({ params }: { params: any }) { 
  return <CategoriePage params={params} />; 
}
