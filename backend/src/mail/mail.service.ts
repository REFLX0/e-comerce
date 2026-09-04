import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface OrderEmailPayload {
  id: string;
  totalAmount: number;
  shippingCost: number;
  customerName: string;
  customerEmail?: string | null;
  phone: string;
  wilaya: string;
  city: string;
  paymentMethod?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    volume?: string;
  }>;
}

export interface UserEmailPayload {
  email: string;
  name: string;
  phone?: string | null;
  role?: string;
  ip?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private apiKey: string | null = null;
  private readonly adminEmail: string;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  private templates: Record<string, handlebars.TemplateDelegate> = {};

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (apiKey && apiKey !== 'local' && apiKey !== 'mock') {
      this.apiKey = apiKey;
    }

    this.adminEmail = this.config.get<string>(
      'ADMIN_NOTIFICATION_EMAIL',
      'specpart@hotmail.com',
    );
    this.fromEmail = this.config.get<string>(
      'BREVO_FROM',
      'Specpart <noreply@specpart.tn>',
    );
    this.frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'https://specpart.tn',
    );

    this.initializeTemplates();
  }

  private initializeTemplates() {
    handlebars.registerHelper('formatPrice', function (price: number) {
      if (typeof price !== 'number') return price;
      return price.toFixed(3);
    });

    const templateNames = [
      'welcome',
      'order-confirmation',
      'delivery-notice',
      'password-reset',
      'login-alert'
    ];

    try {
      const templatesDir = path.join(__dirname, '..', '..', 'src', 'mail', 'templates');
      
      templateNames.forEach(name => {
        const filePath = path.join(templatesDir, `${name}.hbs`);
        if (fs.existsSync(filePath)) {
          const source = fs.readFileSync(filePath, 'utf8');
          this.templates[name] = handlebars.compile(source);
        } else {
          this.logger.warn(`Template not found: ${filePath}`);
        }
      });
    } catch (error) {
      this.logger.error(`Error loading templates: ${error.message}`);
    }
  }

  private isConfigured(): boolean {
    return this.apiKey !== null;
  }

  private renderTemplate(name: string, data: any): string {
    const template = this.templates[name];
    if (!template) {
      this.logger.error(`Template ${name} is not loaded`);
      return '';
    }
    return template({ ...data, frontendUrl: this.frontendUrl, year: new Date().getFullYear() });
  }

  private async sendEmailViaBrevo(options: { to: string; subject: string; html: string; from?: string }): Promise<void> {
    if (!this.apiKey) return;
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Specpart', email: options.from || this.fromEmail },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Brevo email failed: ${response.status} ${errText}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to send email via Brevo: ${err.message}`);
    }
  }

  // ── 1. Order Confirmation (Customer + Admin) ──────────────────────────────
  async sendOrderEmails(order: OrderEmailPayload): Promise<void> {
    const orderRef = order.id.slice(-8).toUpperCase();

    if (!this.isConfigured()) {
      this.logger.log(`[MAIL MOCK] Order #${orderRef} created for ${order.customerName}`);
      return;
    }

    const itemsWithTotal = order.items.map(item => ({
      ...item,
      totalLinePrice: item.unitPrice * item.quantity
    }));

    const promises: Promise<any>[] = [];

    // Customer Email
    if (order.customerEmail && this.templates['order-confirmation']) {
      const html = this.renderTemplate('order-confirmation', {
        ...order,
        orderRef,
        items: itemsWithTotal,
      });

      promises.push(
        this.sendEmailViaBrevo({
          from: this.fromEmail,
          to: order.customerEmail,
          subject: `Confirmation de votre commande #${orderRef} — Specpart`,
          html,
        })
      );
    }

    // Admin Email
    promises.push(
      this.sendEmailViaBrevo({
        from: this.fromEmail,
        to: this.adminEmail,
        subject: `🔔 [Nouvelle Vente] #${orderRef} — ${order.totalAmount.toFixed(3)} TND (${order.customerName})`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
            <h3 style="color: #16254c; margin-top: 0;">🎉 Nouvelle commande reçue !</h3>
            <p><strong>Commande :</strong> #${orderRef}</p>
            <p><strong>Client :</strong> ${order.customerName} (${order.phone})</p>
            <p><strong>Email :</strong> ${order.customerEmail || 'Non spécifié'}</p>
            <p><strong>Destination :</strong> ${order.city}, ${order.wilaya}</p>
            <p><strong>Montant Total :</strong> <span style="font-size: 16px; color: #16a34a; font-weight: bold;">${order.totalAmount.toFixed(3)} TND</span></p>
            <p style="margin-top: 20px;">
              <a href="${this.frontendUrl}/admin/orders/${order.id}" style="background: #16254c; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Ouvrir dans le panneau Admin →
              </a>
            </p>
          </div>
        `,
      })
    );

    await Promise.all(promises);
  }

  // ── 2. Welcome Email on Registration (Customer + Admin) ───────────────────
  async sendWelcomeEmails(user: UserEmailPayload): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.log(`[MAIL MOCK] Welcome email for ${user.name}`);
      return;
    }

    const promises: Promise<any>[] = [];

    if (this.templates['welcome']) {
      const html = this.renderTemplate('welcome', { name: user.name });
      promises.push(
        this.sendEmailViaBrevo({
          from: this.fromEmail,
          to: user.email,
          subject: 'Bienvenue chez Specpart ! 🎉',
          html,
        })
      );
    }

    // Admin Alert
    promises.push(
      this.sendEmailViaBrevo({
        from: this.fromEmail,
        to: this.adminEmail,
        subject: `👤 [Nouveau Client] ${user.name} (${user.email})`,
        html: `
          <div style="font-family: sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h3 style="color: #16254c; margin-top: 0;">Un nouvel utilisateur s'est inscrit :</h3>
            <p><strong>Nom :</strong> ${user.name}</p>
            <p><strong>Email :</strong> ${user.email}</p>
            <p><strong>Téléphone :</strong> ${user.phone || 'Non renseigné'}</p>
          </div>
        `,
      })
    );

    await Promise.all(promises);
  }

  // ── 3. Forgot Password / Reset Link ───────────────────────────────────────
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password/${token}`;

    if (!this.isConfigured()) {
      this.logger.log(`[MAIL MOCK] Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    if (this.templates['password-reset']) {
      const html = this.renderTemplate('password-reset', { email, resetUrl });
      await this.sendEmailViaBrevo({
        from: this.fromEmail,
        to: email,
        subject: 'Réinitialisation de votre mot de passe Specpart 🔑',
        html,
      });
    }
  }

  // ── 4. Login Security Alert ────────────────────────────────────────────────
  async sendLoginAlerts(user: UserEmailPayload): Promise<void> {
    if (!this.isConfigured()) return;

    const time = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Tunis' });
    const promises: Promise<any>[] = [];

    if (this.templates['login-alert']) {
      const html = this.renderTemplate('login-alert', { name: user.name || user.email, time });
      promises.push(
        this.sendEmailViaBrevo({
          from: this.fromEmail,
          to: user.email,
          subject: 'Nouvelle connexion détectée — Specpart',
          html,
        })
      );
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      promises.push(
        this.sendEmailViaBrevo({
          from: this.fromEmail,
          to: this.adminEmail,
          subject: `🔐 [Alerte Sécurité Admin] Connexion de ${user.email}`,
          html: `<p>L'administrateur <strong>${user.email}</strong> s'est connecté au tableau de bord le ${time}.</p>`,
        })
      );
    }

    await Promise.all(promises);
  }

  // ── 5. Delivery Notice (Shipped/Delivered) ────────────────────────────────
  async sendDeliveryNotice(order: OrderEmailPayload): Promise<void> {
    const orderRef = order.id.slice(-8).toUpperCase();

    if (!this.isConfigured()) {
      this.logger.log(`[MAIL MOCK] Delivery notice for Order #${orderRef}`);
      return;
    }

    if (order.customerEmail && this.templates['delivery-notice']) {
      const html = this.renderTemplate('delivery-notice', {
        ...order,
        orderRef,
      });

      await this.sendEmailViaBrevo({
        from: this.fromEmail,
        to: order.customerEmail,
        subject: `🚚 Votre commande #${orderRef} est en route ! — Specpart`,
        html,
      });
    }
  }
}
