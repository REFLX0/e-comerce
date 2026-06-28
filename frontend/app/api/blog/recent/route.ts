import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      "id": "bestoiltn-une-autre-maniere",
      "title": "Bestoil.tn : Une autre manière pour vendre les lubrifiants automobiles et industriels",
      "slug": "bestoiltn-une-autre-maniere-pour-vendre-les-lubrifiants",
      "excerpt": "Découvrez comment Bestoil.tn révolutionne la vente de lubrifiants.",
      "publishedAt": "2021-12-13T00:00:00.000Z",
      "coverImage": "",
      "tags": ["Entreprise"]
    },
    {
      "id": "shell-helix-elu-produit-annee-2021",
      "title": "Shell Helix « Élu produit de l'année 2021 »",
      "slug": "shell-helix-elu-produit-de-lannee-2021",
      "excerpt": "Shell Helix remporte le prestigieux prix.",
      "publishedAt": "2021-10-22T00:00:00.000Z",
      "coverImage": "",
      "tags": ["Awards", "Shell"]
    },
    {
      "id": "comment-choisir-huile-moteur",
      "title": "Comment bien choisir son huile moteur ?",
      "slug": "comment-bien-choisir-son-huile-moteur",
      "excerpt": "Guide pratique pour choisir l'huile idéale pour votre moteur.",
      "publishedAt": "2021-08-06T00:00:00.000Z",
      "coverImage": "",
      "tags": ["Conseils"]
    },
    {
      "id": "yacco-fim-quality-product",
      "title": "Yacco rejoint le programme « FIM Quality Product »",
      "slug": "yacco-rejoint-le-programme-fim-quality-product",
      "excerpt": "Yacco s'engage pour la qualité avec la FIM.",
      "publishedAt": "2021-07-12T00:00:00.000Z",
      "coverImage": "",
      "tags": ["Yacco", "Qualité"]
    },
    {
      "id": "lancement-nouveau-site-bestoil",
      "title": "Lancement de notre nouveau site web bestoil.tn",
      "slug": "lancement-de-notre-nouveau-site-web",
      "excerpt": "Bienvenue sur la nouvelle plateforme de vente en ligne.",
      "publishedAt": "2021-05-27T00:00:00.000Z",
      "coverImage": "",
      "tags": ["Nouveautés"]
    }
  ])
}
