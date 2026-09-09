import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content?: string;
  tool_call_id?: string;
  name?: string;
  tool_calls?: any[];
}

/** Run a list of search queries in order and return results from the first one that yields results */
async function firstNonEmpty(
  queries: string[],
  searcher: (q: string, limit: number) => Promise<any[]>,
  limit = 6,
): Promise<any[]> {
  for (const q of queries) {
    if (!q || !q.trim()) continue;
    const results = await searcher(q.trim(), limit);
    if (results && results.length > 0) return results;
  }
  return [];
}

function getProductPrice(p: any): string {
  const price =
    p.variants?.[0]?.priceTTC ??
    p.variants?.[0]?.price ??
    p.price ??
    null;
  return price !== null && price !== undefined ? `${Number(price).toFixed(3)} TND` : 'Prix sur demande';
}

// The system prompt tells the model to always use a bare relative path for
// internal links, but LLM instruction-following isn't 100% reliable — it can
// still rewrite a correct `/produit/slug` link from a tool result into an
// absolute one (sometimes even with the wrong/dead domain) while composing
// its final answer. Strip any domain it adds back off, deterministically,
// rather than relying on prompt wording alone to prevent it.
const INTERNAL_LINK_PREFIXES = ['/produit/', '/categorie/', '/marque/', '/contact', '/auth/login', '/panier', '/compte'];
function stripDomainFromInternalLinks(text: string): string {
  return text.replace(/\]\(https?:\/\/[^)\s/]+(\/[^)\s]*)\)/g, (match, path) =>
    INTERNAL_LINK_PREFIXES.some((p) => path.startsWith(p)) ? `](${path})` : match,
  );
}

function formatProducts(products: any[]): string {
  return products
    .map((p: any) => {
      const name = p.nameFr || p.name || 'Produit';
      const slug = p.slug;
      const priceStr = getProductPrice(p);
      return `- [${name}](/produit/${slug}) — ${priceStr}`;
    })
    .join('\n');
}

/** Cap on messages[] to avoid runaway token costs */
const MAX_HISTORY = 20;
const MAX_MSG_LEN = 2000;

// Engine-oil category slugs per vehicle class. searchProducts() is plain keyword
// text search with no vehicle-type awareness, so without this a car query can
// surface motorcycle oil (wet-clutch friction modifiers) and vice versa — both
// genuinely wrong, not just a bad match. Category is the one reliably-populated
// signal for this (specs.vehicleTypes is present in the schema but not actually
// set on products), so results are filtered against this allow-list before use.
const OIL_CATEGORY_SLUGS: Record<string, string[]> = {
  automobile: ['huiles-moteur', 'auto-synthese', 'auto-semi', 'auto-minerale'],
  moto: ['moto-huiles'],
  marine: ['marine-moteurs'],
};

/** Wrap `searcher`, over-fetching to absorb the category filter, then keep only
 * hits whose own category matches `vehicleType` — never trust the query text
 * alone to have kept the vehicle class correct. */
function searchOilForVehicleType(
  searcher: (q: string, limit: number) => Promise<any[]>,
  vehicleType: string,
) {
  const allowedSlugs = OIL_CATEGORY_SLUGS[vehicleType];
  return async (q: string, limit: number) => {
    const candidates = await searcher(q, limit * 4);
    const filtered = allowedSlugs
      ? candidates.filter((p) => allowedSlugs.includes(p.category?.slug))
      : candidates;
    return filtered.slice(0, limit);
  };
}
const OPENROUTER_TIMEOUT_MS = 25000;

/** fetch() has no default timeout — an unresponsive upstream would otherwise
 * hold the request (and the caller's rate-limit slot) open indefinitely. */
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  async chat(
    messages: ChatMessage[],
    userEmail?: string,
  ): Promise<{ reply: string; clientActions?: any[] }> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new HttpException(
        'Chat is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const model =
      this.config.get<string>('OPENROUTER_MODEL') || 'openai/gpt-4o-mini';

    // ── Abuse guard: cap history size and individual message length ──────────
    const safeMessages = messages
      .slice(-MAX_HISTORY)
      .map((m) => ({
        ...m,
        content:
          typeof m.content === 'string' && m.content.length > MAX_MSG_LEN
            ? m.content.slice(0, MAX_MSG_LEN) + ' [tronqué]'
            : m.content,
      }));

    // ── System prompt ────────────────────────────────────────────────────────
    let systemPrompt = `Tu es l'assistant IA intelligent, chaleureux et expert de Specpart (specpart.tech), la référence en Tunisie pour les pièces auto, lubrifiants & huiles moteur, accessoires moto et marine.

TON IDENTITÉ & CRÉATEURS :
- Tu as été conçu, créé et développé par Mohamed Aziz Jlassi et Mohamed Harbi exclusivement pour Specpart.
- Si le client te demande qui t'a créé, développé, conçu ou programmé (ex: "who made you?", "who created you?", "who built you?", "qui t'a créé ?", "qui vous a conçu ?", "qui sont tes développeurs ?", "chkoun sna3ek ?", "chkoun 3amlek ?", "من صنعك؟", etc.), réponds TOUJOURS fièrement, clairement et chaleureusement dans la langue du client en indiquant que tu as été créé et développé par Mohamed Aziz Jlassi et Mohamed Harbi pour Specpart. Ne dis JAMAIS que tu as été conçu ou créé par OpenAI, Anthropic, Mistral, Google ou une autre entité.

TON RÔLE & PERSONNALITÉ :
- Tu es accueillant, serviable, concis et professionnel.
- Tu réponds dans la MÊME LANGUE que le client (Français, Arabe / Derja tunisienne, ou Anglais).
- Tu es un expert automobile : tu conseilles sur les huiles (viscosités 5W-40, 5W-30, 10W-40, normes ACEA/API, VW 504/507, etc.), les filtres, plaquettes et pièces de rechange.

INFORMATIONS IMPORTANTES SUR SPECPART :
- Boutique & Showroom : 03, rue Mohamed Bayram 5, Sidi Daoud la Marsa, 2046, Tunisie
- Téléphone & Service Client : +216 29 294 195 (Lun–Sam 8h–18h)
- Email : specpart@hotmail.com
- Livraison : Partout en Tunisie sous 24h à 48h
- Paiement : Paiement à la livraison (Cash on Delivery), Carte bancaire, Flouci
- Retours : Garantie satisfait ou remboursé sous 14 jours

RÈGLES D'ACTION :
1. IDENTITÉ / CRÉATEURS : Quand on te demande qui t'a créé, conçu ou développé, cite impérativement et fidèlement Mohamed Aziz Jlassi et Mohamed Harbi.
2. RECHERCHE PRODUITS & HUILES : Dès qu'un client mentionne un véhicule, une pièce ou une huile, utilise IMMÉDIATEMENT les outils (search_products ou oil_for_vehicle).
3. LIENS CLIQUABLES : Inclus TOUJOURS les liens markdown fournis par les outils, EXACTEMENT au format relatif [Nom du Produit](/produit/slug) — reprends le chemin tel quel depuis le résultat de l'outil. Ne préfixe JAMAIS un lien avec un nom de domaine, http:// ou https:// : écris uniquement le chemin qui commence par "/".
4. CONTACT & SUPPORT : Si le client demande à contacter l'admin, un conseiller humain ou le support, fournis-lui gentiment les coordonnées directes (Tél: +216 29 294 195, Email: specpart@hotmail.com, ou [Page Contact](/contact)).
5. SUIVI DE COMMANDE : Utilise les informations de commande authentifiées injectées par le système. Si non connecté, invite gentiment le client à se connecter ou à contacter le service client avec son numéro.
6. HORS SUJET : Si la question n'a aucun rapport avec l'automobile, le bricolage auto, Specpart ou ton identité/créateurs, réponds poliment que tu es spécialisé dans l'univers automobile Specpart.`;

    // ── Inject user's own orders (authenticated only) ────────────────────────
    if (userEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              items: { include: { product: { select: { nameFr: true, slug: true } } } },
            },
          },
        },
      });

      const statusMap: Record<string, string> = {
        PENDING: '⏳ En attente de confirmation / Pending confirmation',
        PROCESSING: '🔧 En préparation / Processing',
        SHIPPED: '🚚 Expédiée (en cours de livraison) / Shipped',
        DELIVERED: '✅ Livrée avec succès / Delivered',
        CANCELLED: '❌ Annulée / Cancelled',
      };

      if (user) {
        const userName = user.name || (user as any).firstName || user.email;
        if (user.orders && user.orders.length > 0) {
          const ordersList = user.orders
            .map((o) => {
              const items = o.items?.length
                ? ` (${o.items.map((i) => `${i.quantity}x [${i.product?.nameFr || 'Article'}](/produit/${i.product?.slug || ''})`).join(', ')})`
                : '';
              return `- Commande #${o.id.slice(-8).toUpperCase()} (Réf: ${o.id}) passée le ${o.createdAt.toLocaleDateString('fr-FR')} — Statut: ${statusMap[o.status] ?? o.status} — Total: ${o.totalAmount} TND${items}`;
            })
            .join('\n');

          systemPrompt +=
            `\n\n🟢 SESSION UTILISATEUR CONNECTÉ :` +
            `\nLe client est actuellement connecté sur son compte (${userName}, Email: ${user.email}).` +
            `\nVoici ses commandes récentes sur Specpart :\n${ordersList}` +
            `\n\nRÈGLE ABSOLUE POUR LE SUIVI DE COMMANDE :` +
            `\n- NE DEMANDE JAMAIS au client de se connecter car il est DÉJÀ CONNECTÉ.` +
            `\n- Si le client demande à suivre sa commande ou ses commandes (ex: "Track my order", "Suivre ma commande", "Où est ma commande ?", etc.), présente-lui DIRECTEMENT ses commandes ci-dessus avec leur statut, référence et articles de manière claire et rassurante.` +
            `\n- Réponds TOUJOURS dans la même langue que la demande du client (Anglais s'il écrit en anglais, Français s'il écrit en français, Arabe s'il écrit en arabe).`;
        } else {
          systemPrompt +=
            `\n\n🟢 SESSION UTILISATEUR CONNECTÉ :` +
            `\nLe client est actuellement connecté sur son compte (${userName}, Email: ${user.email}), mais il n'a encore passé AUCUNE commande sur le site.` +
            `\n\nRÈGLE ABSOLUE POUR LE SUIVI DE COMMANDE :` +
            `\n- NE DEMANDE JAMAIS au client de se connecter car il est DÉJÀ CONNECTÉ.` +
            `\n- Si le client demande à suivre sa commande (ex: "Track my order", "Suivre ma commande", etc.), informe-le gentiment qu'il n'a actuellement aucune commande enregistrée sur son compte connecté (${user.email}). Propose-lui avec bienveillance de l'aider à trouver les pièces ou huiles dont il a besoin pour son véhicule.` +
            `\n- Réponds TOUJOURS dans la même langue que la demande du client (Anglais s'il écrit en anglais, Français s'il écrit en français, Arabe s'il écrit en arabe).`;
        }
      }
    }

    // ── IDOR-safe order tracking ─────────────────────────────────────────────
    const lastUserMsg =
      safeMessages.slice().reverse().find((m) => m.role === 'user')?.content ?? '';
    const orderIdMatch = (lastUserMsg as string).match(
      /\b(cm[a-z0-9]{20,30}|test[0-9]+)\b/i,
    );

    if (orderIdMatch && userEmail) {
      const rawId = orderIdMatch[1].toLowerCase();
      const order = await this.prisma.order.findFirst({
        where: { id: rawId, user: { email: userEmail } },
        include: {
          items: { include: { product: { select: { nameFr: true, slug: true } } } },
        },
      });

      if (order) {
        const statusMap: Record<string, string> = {
          PENDING: '⏳ En attente de confirmation / Pending confirmation',
          PROCESSING: '🔧 En préparation / Processing',
          SHIPPED: '🚚 Expédiée (en cours de livraison) / Shipped',
          DELIVERED: '✅ Livrée avec succès / Delivered',
          CANCELLED: '❌ Annulée / Cancelled',
        };
        const itemsList = order.items
          .map((i) => `${i.quantity}x [${i.product.nameFr}](/produit/${i.product.slug})`)
          .join(', ');
        systemPrompt += `\n\n📦 DÉTAILS DE LA COMMANDE DEMANDÉE : #${order.id.slice(-8).toUpperCase()} — Statut actuel: ${statusMap[order.status] ?? order.status} — Total: ${order.totalAmount} TND — Articles commandés: ${itemsList}. Réponds directement au client dans sa langue avec ces informations claires et rassurantes.`;
      } else {
        systemPrompt += `\n\n⚠️ La commande #${rawId.slice(-8).toUpperCase()} est introuvable sur le compte connecté. Invite le client à vérifier le numéro ou à contacter le support (+216 29 294 195). Ne lui dis pas de se connecter puisqu'il est déjà connecté.`;
      }
    } else if (orderIdMatch && !userEmail) {
      systemPrompt += `\n\n⚠️ L'utilisateur demande le suivi de la commande #${orderIdMatch[1].slice(-8).toUpperCase()} mais n'est pas connecté. Invite-le poliment à [se connecter](/auth/login) pour sécuriser l'accès à ses commandes, ou à contacter le service client au +216 29 294 195.`;
    }

    // ── Tools ────────────────────────────────────────────────────────────────
    const tools = [
      {
        type: 'function',
        function: {
          name: 'search_products',
          description:
            'Rechercher des pièces de rechange, lubrifiants, et accessoires dans le catalogue Specpart',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description:
                  "Mots-clés de recherche (ex: 'filtre a huile polo', 'plaquettes clio 4', '5w40 castrol')",
              },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'oil_for_vehicle',
          description:
            "Rechercher les huiles moteur recommandées pour un véhicule spécifique (type, marque, modèle, carburant, viscosité). Ne JAMAIS deviner vehicleType : une voiture/camion/utilitaire est 'automobile', une moto/scooter est 'moto', un bateau est 'marine' — une huile automobile n'est PAS adaptée à une moto (embrayage humide) et inversement, ne les mélange jamais.",
          parameters: {
            type: 'object',
            properties: {
              vehicleType: {
                type: 'string',
                enum: ['automobile', 'moto', 'marine'],
                description:
                  "Catégorie du véhicule — déduis-la du message du client (ex: 'CBR 600' ou 'scooter' → moto ; 'Golf 7' ou 'camion' → automobile ; 'bateau', 'hors-bord' → marine). Demande à l'utilisateur si ce n'est pas clair, ne suppose jamais 'automobile' par défaut.",
              },
              make: {
                type: 'string',
                description: "Marque (ex: 'Volkswagen', 'Renault', 'Peugeot', 'BMW', 'Honda')",
              },
              model: {
                type: 'string',
                description: "Modèle (ex: 'Polo 6', 'Golf 7', 'Clio 4', 'CBR 600')",
              },
              fuelType: {
                type: 'string',
                enum: ['essence', 'diesel'],
                description:
                  "Carburant (uniquement pertinent pour vehicleType='automobile'). Demande-le au client si ambigu, ne le suppose pas.",
              },
              viscosity: {
                type: 'string',
                description:
                  "Viscosité optionnelle (ex: '5W-40', '5W-30', '10W-40')",
              },
            },
            required: ['vehicleType', 'make', 'model'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'find_vehicle_parts',
          description:
            'Rechercher une pièce spécifique pour un véhicule (marque, modèle, type de pièce)',
          parameters: {
            type: 'object',
            properties: {
              make: { type: 'string', description: "Marque (ex: 'Renault')" },
              model: {
                type: 'string',
                description: "Modèle (ex: 'Clio 4', 'Polo 6')",
              },
              part: {
                type: 'string',
                description:
                  "La pièce recherchée (ex: 'filtre a huile', 'plaquettes de frein', 'batterie')",
              },
            },
            required: ['make', 'model', 'part'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'add_to_cart',
          description:
            'Ajouter un produit au panier du client',
          parameters: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                description:
                  "Le slug du produit (ex: 'huile-moteur-castrol-5w40-magnatec-c3-5l')",
              },
              variantId: {
                type: 'string',
                description:
                  'ID optionnel de la variante de packaging',
              },
            },
            required: ['slug'],
          },
        },
      },
    ];

    const payload: any = {
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...safeMessages],
      tools,
      tool_choice: 'auto',
      max_tokens: 800,
      temperature: 0.5,
    };

    try {
      const response = await fetchWithTimeout(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        },
        OPENROUTER_TIMEOUT_MS,
      );

      if (!response.ok) {
        throw new HttpException('Erreur OpenRouter', HttpStatus.BAD_GATEWAY);
      }

      const data = await response.json();
      const replyMessage = data?.choices?.[0]?.message;
      if (!replyMessage)
        throw new HttpException('Réponse vide', HttpStatus.BAD_GATEWAY);

      const clientActions: any[] = [];

      // ── Handle tool calls ────────────────────────────────────────────────
      if (replyMessage.tool_calls?.length > 0) {
        payload.messages.push(replyMessage);

        for (const toolCall of replyMessage.tool_calls) {
          let args: any = {};
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch (e) {
            this.logger.warn(
              `Tool "${toolCall.function.name}" returned malformed JSON arguments: ${toolCall.function.arguments}`,
            );
          }

          const toolName: string = toolCall.function.name;
          let toolResult = '';

          // ── search_products ───────────────────────────────────────────
          if (toolName === 'search_products') {
            const q = args.query?.trim() ?? '';
            const products = q.length > 1
              ? await this.searchService.searchProducts(q, 6)
              : [];
            toolResult =
              products.length > 0
                ? formatProducts(products)
                : 'Aucun produit trouvé avec cette recherche exacte dans le catalogue.';
          }

          // ── oil_for_vehicle ───────────────────────────────────────────
          else if (toolName === 'oil_for_vehicle') {
            const vehicleType: string = args.vehicleType?.trim().toLowerCase() ?? '';
            const make = args.make?.trim() ?? '';
            const model = args.model?.trim() ?? '';
            const fuelType = args.fuelType?.trim() ?? '';
            const viscosity = args.viscosity?.trim() ?? '';

            const vehicleWord = vehicleType === 'moto' ? 'moto' : vehicleType === 'marine' ? 'marine' : '';
            const words = (parts: (string | undefined)[]) =>
              parts.filter((p) => p && p.trim()).join(' ');

            const queries = [
              viscosity ? words(['huile', vehicleWord, viscosity, make]) : '',
              words(['huile', vehicleWord, fuelType, make, model]),
              words(['huile', vehicleWord, make, model]),
              viscosity ? words(['huile', vehicleWord, viscosity]) : '',
              words(['huile', 'moteur', vehicleWord]),
            ];

            const products = OIL_CATEGORY_SLUGS[vehicleType]
              ? await firstNonEmpty(
                  queries,
                  searchOilForVehicleType(
                    (q, l) => this.searchService.searchProducts(q, l),
                    vehicleType,
                  ),
                  6,
                )
              : [];

            if (products.length > 0) {
              toolResult = `Huiles de haute qualité recommandées pour ${make} ${model}${viscosity ? ` (${viscosity})` : ''} :\n${formatProducts(products)}`;
            } else if (!OIL_CATEGORY_SLUGS[vehicleType]) {
              toolResult = `Type de véhicule non reconnu ("${vehicleType || 'inconnu'}") — demande au client de préciser s'il s'agit d'une automobile, d'une moto ou d'un bateau.`;
            } else {
              toolResult = `Aucune huile spécifique trouvée pour ${make} ${model} dans cette catégorie (${vehicleType}). Ne recommande PAS une huile d'une autre catégorie de véhicule — invite plutôt le client à consulter le catalogue complet ou à contacter le service client.`;
            }
          }

          // ── find_vehicle_parts ────────────────────────────────────────
          else if (toolName === 'find_vehicle_parts') {
            const queries = [
              `${args.part} ${args.make} ${args.model}`,
              `${args.part} ${args.make}`,
              args.part,
            ];
            const products = await firstNonEmpty(
              queries,
              (q, l) => this.searchService.searchProducts(q, l),
              5,
            );
            toolResult =
              products.length > 0
                ? formatProducts(products)
                : `Aucune pièce trouvée pour "${args.part}".`;
          }

          // ── add_to_cart ───────────────────────────────────────────────
          else if (toolName === 'add_to_cart') {
            const slug = args.slug?.trim() ?? '';
            const requestedVariantId = args.variantId?.trim() ?? '';

            if (!slug) {
              toolResult = 'Identifiant produit manquant.';
            } else {
              const product = await this.prisma.product.findUnique({
                where: { slug },
                include: {
                  variants: true,
                  brand: true,
                  category: true,
                  images: true,
                },
              });

              if (!product) {
                toolResult = `Produit introuvable pour l'identifiant "${slug}".`;
              } else if (product.variants.length === 0) {
                toolResult = `Le produit "${product.nameFr}" n'a pas de variante disponible.`;
              } else {
                const variant =
                  (requestedVariantId
                    ? product.variants.find((v) => v.id === requestedVariantId)
                    : null) ?? product.variants[0];

                clientActions.push({
                  type: 'ADD_TO_CART',
                  payload: { product, variant },
                });
                toolResult = `✅ "${product.nameFr}" (${variant.volume || '1 pièce'}) ajouté au panier.`;
              }
            }
          }

          payload.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolName,
            content: toolResult,
          });
        }

        // Second LLM call — no tools to avoid loop
        const { tools: _t, tool_choice: _tc, ...payloadNoTools } = payload;
        const secondResponse = await fetchWithTimeout(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payloadNoTools),
          },
          OPENROUTER_TIMEOUT_MS,
        );

        if (!secondResponse.ok) {
          this.logger.error(`OpenRouter second call failed: ${secondResponse.status}`);
          throw new HttpException('Erreur OpenRouter', HttpStatus.BAD_GATEWAY);
        }

        const secondData = await secondResponse.json();
        const finalReply =
          secondData?.choices?.[0]?.message?.content?.trim() ??
          "Je n'ai pas pu récupérer les informations.";
        return {
          reply: stripDomainFromInternalLinks(finalReply),
          clientActions: clientActions.length > 0 ? clientActions : undefined,
        };
      }

      return {
        reply: stripDomainFromInternalLinks(replyMessage.content?.trim() ?? ''),
        clientActions: clientActions.length > 0 ? clientActions : undefined,
      };
    } catch (err) {
      this.logger.error(`Chat failed: ${(err as Error).message}`);
      throw new HttpException('Service indisponible', HttpStatus.BAD_GATEWAY);
    }
  }
}
