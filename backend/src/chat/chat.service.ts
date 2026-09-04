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
    let systemPrompt = `Tu es l'assistant IA intelligent, chaleureux et expert de Specpart (specpart.tn), la référence en Tunisie pour les pièces auto, lubrifiants & huiles moteur, accessoires moto et marine.

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
3. LIENS CLIQUABLES : Inclus TOUJOURS les liens markdown fournis par les outils au format [Nom du Produit](/produit/slug) pour que l'utilisateur puisse cliquer dessus.
4. CONTACT & SUPPORT : Si le client demande à contacter l'admin, un conseiller humain ou le support, fournis-lui gentiment les coordonnées directes (Tél: +216 29 294 195, Email: specpart@hotmail.com, ou [Page Contact](/contact)).
5. SUIVI DE COMMANDE : Utilise les informations de commande authentifiées injectées par le système. Si non connecté, invite gentiment le client à se connecter ou à contacter le service client avec son numéro.
6. HORS SUJET : Si la question n'a aucun rapport avec l'automobile, le bricolage auto, Specpart ou ton identité/créateurs, réponds poliment que tu es spécialisé dans l'univers automobile Specpart.`;

    // ── Inject user's own orders (authenticated only) ────────────────────────
    if (userEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
        include: { orders: { orderBy: { createdAt: 'desc' }, take: 5 } },
      });
      if (user?.orders.length) {
        systemPrompt +=
          `\n\nREMARQUE SYSTÈME : L'utilisateur est connecté (${user.name ?? user.email}). Ses dernières commandes :\n` +
          user.orders
            .map(
              (o) =>
                `- Commande #${o.id.slice(-8).toUpperCase()} (ID: ${o.id}) du ${o.createdAt.toLocaleDateString('fr-FR')} : Statut: ${o.status}, Montant: ${o.totalAmount} TND`,
            )
            .join('\n');
      }
    }

    // ── IDOR-safe order tracking ─────────────────────────────────────────────
    const lastUserMsg =
      safeMessages.slice().reverse().find((m) => m.role === 'user')?.content ?? '';
    const orderIdMatch = (lastUserMsg as string).match(
      /\b(cm[a-z0-9]{20,30})\b/i,
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
          PENDING: '⏳ En attente de confirmation',
          PROCESSING: '🔧 En préparation',
          SHIPPED: '🚚 Expédiée (en cours de livraison)',
          DELIVERED: '✅ Livrée avec succès',
          CANCELLED: '❌ Annulée',
        };
        const itemsList = order.items
          .map((i) => `${i.quantity}x [${i.product.nameFr}](/produit/${i.product.slug})`)
          .join(', ');
        systemPrompt += `\n\n📦 DÉTAILS DE LA COMMANDE DEMANDÉE : #${order.id.slice(-8).toUpperCase()} — Statut actuel: ${statusMap[order.status] ?? order.status} — Total: ${order.totalAmount} TND — Articles commandés: ${itemsList}. Réponds directement au client avec ces informations claires et rassurantes.`;
      } else {
        systemPrompt += `\n\n⚠️ La commande #${rawId.slice(-8).toUpperCase()} est introuvable sur le compte connecté. Invite le client à vérifier le numéro ou à contacter le support (+216 29 294 195).`;
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
            "Rechercher les huiles moteur recommandées pour un véhicule spécifique (marque, modèle, viscosité)",
          parameters: {
            type: 'object',
            properties: {
              make: {
                type: 'string',
                description: "Marque (ex: 'Volkswagen', 'Renault', 'Peugeot', 'BMW')",
              },
              model: {
                type: 'string',
                description: "Modèle (ex: 'Polo 6', 'Golf 7', 'Clio 4')",
              },
              viscosity: {
                type: 'string',
                description:
                  "Viscosité optionnelle (ex: '5W-40', '5W-30', '10W-40')",
              },
            },
            required: ['make', 'model'],
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
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        },
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
            const make = args.make?.trim() ?? '';
            const model = args.model?.trim() ?? '';
            const viscosity = args.viscosity?.trim() ?? '';

            const queries = [
              viscosity ? `huile ${viscosity} ${make}` : '',
              viscosity ? `huile ${viscosity}` : '',
              `huile ${make} ${model}`,
              `huile moteur ${make}`,
              'huile moteur 5W-40',
              'huile moteur 5W-30',
            ];

            const products = await firstNonEmpty(
              queries,
              (q, l) => this.searchService.searchProducts(q, l),
              6,
            );

            if (products.length > 0) {
              toolResult = `Huiles de haute qualité recommandées pour ${make} ${model}${viscosity ? ` (${viscosity})` : ''} :\n${formatProducts(products)}`;
            } else {
              toolResult = `Consultez notre catalogue complet d'huiles moteur sur notre boutique.`;
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
        const secondResponse = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payloadNoTools),
          },
        );

        const secondData = await secondResponse.json();
        const finalReply =
          secondData?.choices?.[0]?.message?.content?.trim() ??
          "Je n'ai pas pu récupérer les informations.";
        return {
          reply: finalReply,
          clientActions: clientActions.length > 0 ? clientActions : undefined,
        };
      }

      return {
        reply: replyMessage.content?.trim() ?? '',
        clientActions: clientActions.length > 0 ? clientActions : undefined,
      };
    } catch (err) {
      this.logger.error(`Chat failed: ${(err as Error).message}`);
      throw new HttpException('Service indisponible', HttpStatus.BAD_GATEWAY);
    }
  }
}
