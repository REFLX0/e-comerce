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
    if (!q.trim()) continue;
    const results = await searcher(q, limit);
    if (results && results.length > 0) return results;
  }
  return [];
}

function formatProducts(products: any[]): string {
  return products
    .map(
      (p: any) =>
        `- [${p.nameFr || p.name}](/produit/${p.slug}) — ${p.price ?? p.variants?.[0]?.price ?? 'N/A'} TND`,
    )
    .join('\n');
}

/** Hard cap on messages[] to avoid runaway token costs */
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
    let systemPrompt = `Tu es l'assistant IA officiel de Specpart (specpart.tn), une boutique tunisienne spécialisée dans les pièces auto, moto et marine.

RÈGLES STRICTES :
1. Tu réponds UNIQUEMENT aux questions liées à Specpart : produits, pièces, huiles, commandes, livraison, retours, compatibilité.
2. Si la question n'est PAS liée à l'automobile, aux pièces, aux huiles, ou à nos services, réponds : "Je suis uniquement là pour vous aider avec Specpart et ses produits. 😊"
3. Ne réponds JAMAIS à des questions générales, politiques, ou hors-sujet.
4. Si on te demande qui t'a créé : "J'ai été développé par l'équipe Specpart."
5. Utilise les outils disponibles IMMÉDIATEMENT dès qu'un utilisateur cherche une pièce, une huile ou un accessoire.
6. Inclus TOUJOURS les liens URL des produits trouvés par les outils.
7. Pour le suivi de commandes : si un numéro est injecté dans le contexte SYSTÈME, communique-le directement. Ne refuse jamais un suivi de commande authentifié.
8. Pour les huiles : si l'utilisateur donne une marque/modèle de voiture, utilise TOUJOURS l'outil oil_for_vehicle.
9. INTERDIT : contacter l'admin, modifier des commandes, accéder à des systèmes externes.`;

    // ── Inject user's own orders (authenticated only) ────────────────────────
    if (userEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
        include: { orders: { orderBy: { createdAt: 'desc' }, take: 5 } },
      });
      if (user?.orders.length) {
        systemPrompt +=
          `\n\nREMARQUE SYSTÈME : L'utilisateur est connecté (${user.name ?? user.email}). Ses ${user.orders.length} dernières commandes :\n` +
          user.orders
            .map(
              (o) =>
                `- Commande #${o.id.slice(-8).toUpperCase()} du ${o.createdAt.toLocaleDateString('fr-FR')} : ${o.status}, ${o.totalAmount} TND`,
            )
            .join('\n');
      }
    }

    // ── IDOR-safe order tracking ─────────────────────────────────────────────
    // Only inject order details if the user is authenticated AND owns the order.
    const lastUserMsg =
      safeMessages.slice().reverse().find((m) => m.role === 'user')?.content ?? '';
    const orderIdMatch = (lastUserMsg as string).match(
      /\b(cm[a-z0-9]{20,30})\b/i,
    );

    if (orderIdMatch && userEmail) {
      const rawId = orderIdMatch[1].toLowerCase();
      const order = await this.prisma.order.findFirst({
        // Scope to the authenticated user — prevents IDOR
        where: { id: rawId, user: { email: userEmail } },
        include: {
          items: { include: { product: { select: { nameFr: true } } } },
        },
      });

      if (order) {
        const statusMap: Record<string, string> = {
          PENDING: '⏳ En attente de confirmation',
          PROCESSING: '🔧 En préparation',
          SHIPPED: '🚚 Expédiée',
          DELIVERED: '✅ Livrée',
          CANCELLED: '❌ Annulée',
        };
        const itemsList = order.items
          .map((i) => `${i.quantity}x ${i.product.nameFr}`)
          .join(', ');
        systemPrompt += `\n\n📦 COMMANDE TROUVÉE (authentifiée) : #${order.id.slice(-8).toUpperCase()} — Statut: ${statusMap[order.status] ?? order.status} — Total: ${order.totalAmount} TND — Articles: ${itemsList}. Communique ces informations directement.`;
      } else if (orderIdMatch) {
        // Order not found under this user — don't reveal whether it belongs to someone else
        systemPrompt += `\n\n⚠️ Commande introuvable pour votre compte. Informe le client que nous n'avons pas trouvé cette commande.`;
      }
    } else if (orderIdMatch && !userEmail) {
      // Unauthenticated — don't look up anything, just tell them to log in
      systemPrompt += `\n\n⚠️ Le client n'est pas connecté. Pour consulter une commande, invite-le à se connecter d'abord.`;
    }

    // ── Tools ────────────────────────────────────────────────────────────────
    const tools = [
      {
        type: 'function',
        function: {
          name: 'search_products',
          description:
            'Rechercher des pièces, huiles, et accessoires dans le catalogue Specpart (40k+ produits)',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description:
                  "Les mots-clés de recherche (ex: 'plaquettes de frein clio 4', '5W-40 motul')",
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
            "Rechercher les huiles moteur compatibles pour un véhicule. TOUJOURS utiliser cet outil quand un client cherche une huile pour sa voiture.",
          parameters: {
            type: 'object',
            properties: {
              make: {
                type: 'string',
                description: "Marque (ex: 'Volkswagen', 'Renault')",
              },
              model: {
                type: 'string',
                description: "Modèle (ex: 'Polo', 'Clio')",
              },
              viscosity: {
                type: 'string',
                description:
                  "Viscosité préférée si connue (ex: '5W-40'). Laisser vide si inconnue.",
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
                description: "Modèle (ex: 'Clio 4')",
              },
              part: {
                type: 'string',
                description:
                  "La pièce recherchée (ex: 'plaquettes de frein')",
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
            'Ajouter un produit au panier du client en utilisant son slug et optionnellement un identifiant de variante',
          parameters: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                description:
                  "Le slug du produit (ex: 'motul-8100-x-cess-5w40-5l')",
              },
              variantId: {
                type: 'string',
                description:
                  'ID de la variante si le produit en a plusieurs (ex: taille, contenance). Laisser vide pour prendre la première disponible.',
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
            const products = q.length > 2
              ? await this.searchService.searchProducts(q, 6)
              : [];
            toolResult =
              products.length > 0
                ? formatProducts(products)
                : 'Aucun produit trouvé dans le catalogue.';
          }

          // ── oil_for_vehicle ───────────────────────────────────────────
          else if (toolName === 'oil_for_vehicle') {
            const make = args.make?.trim() ?? '';
            const model = args.model?.trim() ?? '';
            const viscosity = args.viscosity?.trim() ?? '';

            const queries = [
              viscosity ? `huile moteur ${viscosity} ${make}` : '',
              `huile moteur ${make} ${model}`,
              `huile moteur ${make}`,
            ];

            const products = await firstNonEmpty(
              queries,
              (q, l) => this.searchService.searchProducts(q, l),
            );

            if (products.length > 0) {
              toolResult = `Huiles recommandées pour ${make} ${model}${viscosity ? ` (${viscosity})` : ''} :\n${formatProducts(products)}`;
            } else {
              // Generic fallback
              const fallback = await this.searchService.searchProducts(
                'huile moteur 5W-40',
                4,
              );
              toolResult =
                fallback.length > 0
                  ? `Nous n'avons pas trouvé d'huile spécifique pour ${make} ${model}. Voici nos huiles moteur polyvalentes :\n${formatProducts(fallback)}`
                  : `Aucune huile trouvée pour ${make} ${model}. Consultez notre catalogue pour plus de choix.`;
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
                : 'Aucune pièce compatible trouvée.';
          }

          // ── add_to_cart ───────────────────────────────────────────────
          else if (toolName === 'add_to_cart') {
            const slug = args.slug?.trim() ?? '';
            const requestedVariantId = args.variantId?.trim() ?? '';

            if (!slug) {
              this.logger.warn('add_to_cart called without a slug argument');
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
                this.logger.warn(
                  `add_to_cart: no product for slug="${slug}"`,
                );
                toolResult = `Produit introuvable pour l'identifiant "${slug}".`;
              } else if (product.variants.length === 0) {
                this.logger.warn(
                  `add_to_cart: product "${slug}" has 0 variants`,
                );
                toolResult = `Le produit "${product.nameFr}" n'a pas de variante disponible.`;
              } else {
                // Prefer requested variant, fall back to first
                const variant =
                  (requestedVariantId
                    ? product.variants.find((v) => v.id === requestedVariantId)
                    : null) ?? product.variants[0];

                clientActions.push({
                  type: 'ADD_TO_CART',
                  payload: { product, variant },
                });
                toolResult = `✅ "${product.nameFr}" (${variant.name ?? 'variante par défaut'}) ajouté au panier.`;
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
