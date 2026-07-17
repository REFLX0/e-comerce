import { Breadcrumb } from '@/components/common/Breadcrumb'

export const metadata = {
  title: 'Mentions Légales | specpart',
  description: 'Mentions légales du site specpart.tn.',
}

export default function MentionsLegalesPage() {
  return (
    <>
      <section className="from-brand-primary to-brand-primary-dark bg-gradient-to-br py-16 text-white">
        <div className="section-padding text-center">
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl">Mentions Légales</h1>
          <p className="text-white/70">Informations légales relatives au site specpart.tn</p>
        </div>
      </section>

      <div className="section-padding mx-auto max-w-4xl py-12">
        <Breadcrumb items={[{ label: 'Mentions légales' }]} />

        <div className="prose prose-lg mt-10 space-y-8 text-gray-600">
          <section>
            <h2 className="text-brand-primary font-display">Éditeur du site</h2>
            <p>
              <strong>specpart</strong>
              <br />
              Forme juridique : SARL
              <br />
              Siège social : Zone Industrielle, Megrine, Ben Arous, Tunisie
              <br />
              Téléphone : +216 71 123 456
              <br />
              Email : contact@specpart.tn
              <br />
              Registre du commerce : [Numéro RC]
              <br />
              Matricule fiscal : [Numéro MF]
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Directeur de la publication</h2>
            <p>
              Le directeur de la publication est le représentant légal de la société specpart
              Tunisie.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Hébergement</h2>
            <p>
              Le site est hébergé par :<br />
              <strong>Vercel Inc.</strong>
              <br />
              340 S Lemon Ave #4133, Walnut, CA 91789, USA
              <br />
              Site web : vercel.com
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, logos, graphismes, icônes,
              etc.) est protégé par les lois relatives à la propriété intellectuelle. Toute
              reproduction, représentation, modification ou exploitation de tout ou partie du
              contenu de ce site, par quelque procédé que ce soit, sans autorisation préalable
              écrite de specpart, est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Données personnelles</h2>
            <p>
              specpart s&apos;engage à protéger la vie privée de ses utilisateurs. Les données
              personnelles collectées sur ce site sont traitées conformément à la législation
              tunisienne en vigueur relative à la protection des données personnelles. Elles ne sont
              en aucun cas cédées à des tiers.
            </p>
            <p>
              Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
              données personnelles. Pour exercer ce droit, contactez-nous à : contact@specpart.tn.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur, mesurer
              l&apos;audience et personnaliser les contenus. En poursuivant votre navigation, vous
              acceptez l&apos;utilisation de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-brand-primary font-display">Limitation de responsabilité</h2>
            <p>
              specpart s&apos;efforce de fournir des informations aussi précises que possible.
              Toutefois, la société ne pourra être tenue responsable des omissions, inexactitudes ou
              carences dans la mise à jour du contenu du site.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
