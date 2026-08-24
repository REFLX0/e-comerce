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

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  async chat(messages: ChatMessage[], userEmail?: string): Promise<{ reply: string, clientActions?: any[] }> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new HttpException('Chat is not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const model =
      this.config.get<string>('OPENROUTER_MODEL') || 'openai/gpt-4o-mini';

    let systemPrompt = `Tu es l'assistant IA officiel de Specpart (specpart.tn), une boutique tunisienne spécialisée dans les pièces auto, moto et marine.

RÈGLES STRICTES :
1. Tu ne réponds QU'aux questions liées à Specpart : produits, pièces, commandes, livraison, retours.
2. Si la question n'est PAS liée à l'automobile ou à nos services, dis : "Je suis uniquement là pour vous aider avec Specpart et ses produits. 😊"
3. Ne réponds JAMAIS à des questions générales, politiques, ou hors-sujet.
4. Si on te demande qui t'a créé, réponds : "J'ai été développé par Mohamed Aziz Jlassi et Mohamed Harbi."
5. Tu as accès à un outil de recherche de produits (search_products). Utilise-le IMMÉDIATEMENT dès qu'un utilisateur cherche une pièce, un lubrifiant, ou un accessoire !
6. Quand tu proposes des produits trouvés par l'outil, INCLUS TOUJOURS les liens URL fournis par l'outil pour que le client puisse cliquer et acheter.`;

    if (userEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
        include: { orders: { orderBy: { createdAt: 'desc' }, take: 3 } },
      });
      if (user && user.orders.length > 0) {
        systemPrompt += `\n\nREMARQUE SYSTÈME : L'utilisateur est connecté. Ses ${user.orders.length} dernières commandes :
${user.orders.map(o => `- Commande #${o.id.slice(-8).toUpperCase()} du ${o.createdAt.toLocaleDateString('fr-FR')} : ${o.status}, ${o.totalAmount} TND`).join('\n')}`;
      }
    }

    // Order tracking fallback
    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')?.content;
    if (lastUserMessage) {
      const potentialIds = lastUserMessage.match(/(?:#|^|\s)([a-zA-Z0-9]{8,30})(?:\s|$|[.,!?])/g);
      if (potentialIds) {
        for (const match of potentialIds) {
          const cleanId = match.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          if (cleanId.length >= 8) {
            const order = await this.prisma.order.findFirst({
              where: { id: { endsWith: cleanId } },
              include: { items: { include: { product: true } } },
            });
            if (order) {
              const statusMap: Record<string, string> = {
                PENDING: 'En attente de confirmation', PROCESSING: 'En préparation', SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée',
              };
              const itemsList = order.items.map((i) => `${i.quantity}x ${i.product.nameFr}`).join(', ');
              systemPrompt += `\n\nINFO COMMANDE INJECTÉE : #${order.id.slice(-8).toUpperCase()} - Statut: ${statusMap[order.status] || order.status} - Total: ${order.totalAmount} TND - Articles: ${itemsList}. Utilise ça pour répondre.`;
              break;
            }
          }
        }
      }
    }

      {
        type: 'function',
        function: {
          name: 'search_products',
          description: 'Rechercher des pièces, huiles, et accessoires dans le catalogue 40k+ produits',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: "Les mots-clés de recherche (ex: 'plaquettes de frein clio 4')"
              }
            },
            required: ['query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'find_vehicle_parts',
          description: 'Rechercher une pièce spécifique pour un véhicule (marque, modèle, année)',
          parameters: {
            type: 'object',
            properties: {
              make: { type: 'string', description: "Marque (ex: 'Renault')" },
              model: { type: 'string', description: "Modèle (ex: 'Clio 4')" },
              part: { type: 'string', description: "La pièce recherchée (ex: 'plaquettes de frein')" }
            },
            required: ['make', 'model', 'part']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'add_to_cart',
          description: 'Ajouter un produit au panier du client en utilisant son identifiant (slug)',
          parameters: {
            type: 'object',
            properties: {
              slug: { type: 'string', description: "Le slug du produit (ex: 'motul-8100-x-cess-5w40-5l')" }
            },
            required: ['slug']
          }
        }
      }
    ];

    const payload: any = {
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      tools,
      max_tokens: 700,
      temperature: 0.7,
    };

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new HttpException('Erreur OpenRouter', HttpStatus.BAD_GATEWAY);
      }

      const data = await response.json();
      const replyMessage = data?.choices?.[0]?.message;

      if (!replyMessage) throw new HttpException('Réponse vide', HttpStatus.BAD_GATEWAY);

      const clientActions: any[] = [];

      // Handle Tool Calling
      if (replyMessage.tool_calls && replyMessage.tool_calls.length > 0) {
        payload.messages.push(replyMessage);

        for (const toolCall of replyMessage.tool_calls) {
          let args: any = {};
          try { args = JSON.parse(toolCall.function.arguments); } catch (e) {}

          if (toolCall.function.name === 'search_products') {
            const q = args.query?.trim();
            let productsText = "Aucun produit trouvé.";
            
            if (q && q.length > 2) {
              const products = await this.searchService.searchProducts(q, 5);

              if (products && products.length > 0) {
                productsText = products.map(p => 
                  `- [${p.nameFr || (p as any).name}](/produit/${p.slug}) (Prix: ${(p as any).price || p.variants?.[0]?.price || 'N/A'} TND, Slug: ${p.slug})`
                ).join('\n');
              }
            }

            payload.messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: productsText
            });
          }
          
          else if (toolCall.function.name === 'find_vehicle_parts') {
            const q = `${args.part} ${args.make} ${args.model}`.trim();
            let productsText = "Aucune pièce compatible trouvée.";
            
            if (q.length > 2) {
              const products = await this.searchService.searchProducts(q, 5);

              if (products && products.length > 0) {
                productsText = products.map(p => 
                  `- [${p.nameFr || (p as any).name}](/produit/${p.slug}) (Prix: ${(p as any).price || p.variants?.[0]?.price || 'N/A'} TND, Slug: ${p.slug})`
                ).join('\n');
              }
            }

            payload.messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: productsText
            });
          }

          else if (toolCall.function.name === 'add_to_cart') {
            const slug = args.slug;
            let resultText = "Produit introuvable.";

            if (slug) {
              const product = await this.prisma.product.findUnique({
                where: { slug },
                include: { variants: true, brand: true, category: true, images: true }
              });

              if (product && product.variants.length > 0) {
                clientActions.push({
                  type: 'ADD_TO_CART',
                  payload: {
                    product: product,
                    variant: product.variants[0]
                  }
                });
                resultText = `Le produit a été ajouté au panier du client avec succès.`;
              }
            }

            payload.messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: resultText
            });
          }
        }

        // Second Request with tool results
        const secondResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        const secondData = await secondResponse.json();
        const finalReply = secondData?.choices?.[0]?.message?.content;
        return { reply: finalReply?.trim() || "Je n'ai pas pu récupérer les informations.", clientActions: clientActions.length > 0 ? clientActions : undefined };
      }

      return { reply: replyMessage.content?.trim() || '', clientActions: clientActions.length > 0 ? clientActions : undefined };

    } catch (err) {
      this.logger.error(`Chat failed: ${(err as Error).message}`);
      throw new HttpException('Service indisponible', HttpStatus.BAD_GATEWAY);
    }
  }
}
