import { Breadcrumb } from '@/components/common/Breadcrumb'
import { HelpCircle } from 'lucide-react'
import FaqItem from '@/components/faq/FaqItem'

const faqs = [
  {
    category: 'Commandes & Livraison',
    items: [
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'Nous livrons partout en Tunisie sous 24 à 48 heures ouvrables. Les commandes passées avant 14h sont expédiées le jour même.',
      },
      {
        q: 'La livraison est-elle gratuite ?',
        a: "Oui, la livraison est gratuite pour toute commande supérieure à 100 DT. En dessous, des frais de livraison de 7 DT s'appliquent.",
      },
      {
        q: 'Comment suivre ma commande ?',
        a: "Vous recevrez un email avec un numéro de suivi dès l'expédition de votre commande. Vous pouvez aussi suivre votre commande depuis votre espace client.",
      },
      {
        q: 'Puis-je annuler ma commande ?',
        a: "Vous pouvez annuler votre commande tant qu'elle n'a pas été expédiée, en nous contactant par téléphone ou email.",
      },
    ],
  },
  {
    category: 'Paiement',
    items: [
      {
        q: 'Quels modes de paiement acceptez-vous ?',
        a: 'Nous acceptons le paiement à la livraison (cash), les virements bancaires et le paiement par carte bancaire en ligne.',
      },
      {
        q: 'Le paiement en ligne est-il sécurisé ?',
        a: 'Absolument. Toutes nos transactions en ligne sont protégées par un cryptage SSL 256 bits.',
      },
    ],
  },
  {
    category: 'Produits',
    items: [
      {
        q: 'Vos produits sont-ils authentiques ?',
        a: 'Oui, 100% de nos produits sont originaux et proviennent directement des distributeurs agréés des marques (Castrol, Shell, Total, Mobil, Motul...).',
      },
      {
        q: 'Comment choisir la bonne huile pour mon véhicule ?',
        a: 'Utilisez notre outil "Trouver mon huile" qui vous recommandera le lubrifiant adapté à votre véhicule en fonction de la marque, du modèle et du moteur.',
      },
      {
        q: 'Proposez-vous des tarifs professionnels ?',
        a: 'Oui ! Créez un compte professionnel depuis notre page Espace Pro pour bénéficier de tarifs préférentiels et de conditions adaptées.',
      },
    ],
  },
  {
    category: 'Retours & SAV',
    items: [
      {
        q: 'Puis-je retourner un produit ?',
        a: "Vous disposez de 14 jours pour nous retourner un produit non ouvert et dans son emballage d'origine. Les frais de retour sont à votre charge.",
      },
      {
        q: 'Comment contacter le service client ?',
        a: 'Vous pouvez nous joindre par téléphone au +216 71 123 456, par email à contact@bestlub.tn, ou via le formulaire de contact sur notre site.',
      },
    ],
  },
]

export const metadata = {
  title: 'FAQ | KiosqueTN',
  description: 'Retrouvez les réponses aux questions fréquentes.',
}

export default function FaqPage() {
  return (
    <>
      {/* Hero */}
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white md:py-24">
        <div className="section-padding text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <HelpCircle size={18} />
            <span className="text-sm font-medium">Centre d&apos;aide</span>
          </div>
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            Foire aux Questions
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            Retrouvez les réponses aux questions les plus fréquentes de nos clients.
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        <Breadcrumb items={[{ label: 'FAQ' }]} />

        <div className="mx-auto mt-10 max-w-3xl space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="font-display text-brand-primary mb-4 text-xl font-semibold">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <FaqItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
