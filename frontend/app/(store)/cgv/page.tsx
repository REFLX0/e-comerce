import { Breadcrumb } from '@/components/common/Breadcrumb'

export const metadata = {
  title: 'Conditions Générales de Vente | BestLub Tunisie',
  description: 'Consultez les conditions générales de vente de BestLub Tunisie.',
}

export default function CgvPage() {
  return (
    <>
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white">
        <div className="section-padding text-center">
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl">
            Conditions Générales de Vente
          </h1>
          <p className="text-white/70">Dernière mise à jour : Juin 2026</p>
        </div>
      </section>

      <div className="section-padding mx-auto max-w-4xl py-12">
        <Breadcrumb items={[{ label: 'Conditions de vente' }]} />

        <div className="prose prose-lg mt-10 space-y-8 text-gray-600">
          <section>
            <h2 className="text-brand-primary font-display">Article 1 – Objet</h2>
            <p>
              Les présentes conditions générales de vente (CGV) régissent l&apos;ensemble des
              transactions effectuées sur le site BestLub.tn. Toute commande implique
              l&apos;acceptation sans réserve des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Article 2 – Produits</h2>
            <p>
              Les produits proposés à la vente sont décrits avec la plus grande exactitude possible.
              Les photographies des produits ne sont pas contractuelles. BestLub s&apos;engage à
              proposer uniquement des produits 100% authentiques et certifiés par les marques
              partenaires.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Article 3 – Prix</h2>
            <p>
              Les prix sont indiqués en Dinar Tunisien (DT) toutes taxes comprises (TTC). BestLub se
              réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés
              sur la base des tarifs en vigueur au moment de la validation de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Article 4 – Commandes</h2>
            <p>
              Le client passe commande sur le site internet bestlub.tn. La validation de la commande
              implique l&apos;acceptation des présentes CGV et constitue un contrat de vente.
              BestLub confirmera la commande par email.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Article 5 – Livraison</h2>
            <p>
              La livraison est effectuée à l&apos;adresse indiquée lors de la commande. Les délais
              de livraison sont de 24 à 48 heures ouvrables sur l&apos;ensemble du territoire
              tunisien. La livraison est gratuite pour toute commande supérieure à 100 DT.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Article 6 – Paiement</h2>
            <p>
              Le paiement peut être effectué par : paiement à la livraison, virement bancaire, ou
              carte bancaire en ligne. Toutes les transactions en ligne sont sécurisées.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Article 7 – Droit de rétractation</h2>
            <p>
              Conformément à la législation en vigueur, le client dispose d&apos;un délai de 14
              jours à compter de la réception de sa commande pour exercer son droit de rétractation,
              sans avoir à justifier de motifs. Le produit doit être retourné dans son emballage
              d&apos;origine, non ouvert et non utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Article 8 – Réclamations</h2>
            <p>
              Pour toute réclamation, le client peut contacter le service client par email à
              contact@bestlub.tn ou par téléphone au +216 71 123 456.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
