import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async chat(messages: ChatMessage[], userEmail?: string): Promise<{ reply: string }> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new HttpException('Chat is not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const model =
      this.config.get<string>('OPENROUTER_MODEL') || 'openai/gpt-4o-mini';

    let systemPrompt = `Tu es l'assistant IA officiel de Specpart (specpart.tn), une boutique tunisienne spécialisée dans les pièces auto, moto et marine.

RÈGLES STRICTES — tu DOIS les respecter absolument :
1. Tu ne réponds QU'aux questions liées à Specpart et à ses domaines : produits (huiles, lubrifiants, pièces auto/moto/marine, additifs, filtres, freinage…), commandes, livraison, retours, paiement, compte client, navigation sur le site, et conseils techniques liés aux produits vendus sur le site.
2. Si la question n'est PAS liée à Specpart ou à ses produits/services, réponds UNIQUEMENT : "Je suis uniquement là pour vous aider avec Specpart et ses produits. Pour toute autre question, je ne suis pas en mesure de vous répondre. 😊"
3. Ne réponds JAMAIS à des questions générales, politiques, culturelles, personnelles, mathématiques, ou hors-sujet.
4. Si on te demande qui t'a créé ou développé, réponds : "J'ai été développé par Mohamed Aziz Jlassi et Mohamed Harbi, dans le cadre du projet Specpart."
5. Tu répondras toujours de manière chaleureuse, concise et professionnelle, de préférence en français.
6. Si la question porte sur un produit du site, propose de chercher sur specpart.tn ou redirige vers la bonne catégorie.
7. Si l'utilisateur demande le statut de sa commande mais ne fournit pas de numéro de commande valide, demande-lui de te fournir le numéro de commande (qui commence par #).`;

    if (userEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
        include: { orders: { orderBy: { createdAt: 'desc' }, take: 3 } },
      });
      if (user && user.orders.length > 0) {
        systemPrompt += `\n\nREMARQUE SYSTÈME : L'utilisateur actuel est connecté.
Voici ses ${user.orders.length} dernières commandes :
${user.orders.map(o => `- Commande #${o.id.slice(-8).toUpperCase()} du ${o.createdAt.toLocaleDateString('fr-FR')} : ${o.status}, ${o.totalAmount} TND`).join('\n')}
S'il pose des questions sur ses commandes sans préciser de numéro, utilise ces informations pour l'aider.`;
      }
    }

    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')?.content;
    if (lastUserMessage) {
      const potentialIds = lastUserMessage.match(/(?:#|^|\s)([a-zA-Z0-9]{8,30})(?:\s|$|[.,!?])/g);
      if (potentialIds) {
        let orderFound = false;
        for (const match of potentialIds) {
          const cleanId = match.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          if (cleanId.length >= 8) {
            const order = await this.prisma.order.findFirst({
              where: { id: { endsWith: cleanId } },
              include: { items: { include: { product: true } } },
            });
            if (order) {
              orderFound = true;
              const statusMap: Record<string, string> = {
                PENDING: 'En attente de confirmation',
                PROCESSING: 'En cours de préparation',
                SHIPPED: 'Expédiée',
                DELIVERED: 'Livrée',
                CANCELLED: 'Annulée',
              };
              const statusFr = statusMap[order.status] || order.status;
              const itemsList = order.items.map((i) => `${i.quantity}x ${i.product.nameFr}`).join(', ');
              systemPrompt += `\n\nINFORMATIONS DE COMMANDE TROUVÉES (INJECTÉES PAR LE SYSTÈME) :
L'utilisateur a mentionné la commande #${order.id.slice(-8).toUpperCase()}.
- Statut actuel : ${statusFr}
- Date de création : ${order.createdAt.toLocaleDateString('fr-FR')}
- Total : ${order.totalAmount} TND
- Adresse de livraison : ${order.shipCity}, ${order.shipWilaya}
- Articles : ${itemsList}

Utilise ces informations pour répondre à la question de l'utilisateur sur sa commande de façon polie et utile. Ne dis pas que tu n'as pas accès aux commandes, car ces informations te sont fournies.`;
              break;
            }
          }
        }
        
        if (!orderFound) {
          systemPrompt += `\n\nREMARQUE SYSTÈME : L'utilisateur a mentionné un identifiant ressemblant à un numéro de commande (${potentialIds[0].trim()}), mais AUCUNE commande correspondante n'a été trouvée dans la base de données.
NE dis PAS que tu n'as pas accès aux commandes (car le système vérifie pour toi).
Dis simplement que ce numéro de commande est introuvable ou incorrect, et demande à l'utilisateur de bien vérifier le numéro (il doit commencer par # suivi de 8 caractères minimum).`;
        }
      }
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          max_tokens: 700,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `OpenRouter ${response.status}: ${errorText.slice(0, 500)}`,
        );
        throw new HttpException(
          'Le service de chat est momentanément indisponible',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) {
        throw new HttpException(
          'Réponse vide du service de chat',
          HttpStatus.BAD_GATEWAY,
        );
      }
      return { reply: reply.trim() };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Chat request failed: ${(err as Error).message}`);
      throw new HttpException(
        'Impossible de contacter le service de chat',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
