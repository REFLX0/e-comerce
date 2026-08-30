import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

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
  private resend: Resend | null = null;
  private readonly adminEmail: string;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey && apiKey !== 'local' && apiKey !== 'mock') {
      this.resend = new Resend(apiKey);
    }

    this.adminEmail = this.config.get<string>(
      'ADMIN_NOTIFICATION_EMAIL',
      'specpart@hotmail.com',
    );
    this.fromEmail = this.config.get<string>(
      'RESEND_FROM',
      'Specpart <noreply@specpart.tn>',
    );
    this.frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'https://specpart.tn',
    );
  }

  private isConfigured(): boolean {
    return this.resend !== null;
  }

  // ── 1. Order Confirmation (Customer + Admin) ──────────────────────────────
  async sendOrderEmails(order: OrderEmailPayload): Promise<void> {
    const orderRef = order.id.slice(-8).toUpperCase();

    if (!this.isConfigured()) {
      this.logger.log(
        `[MAIL MOCK] Order #${orderRef} created for ${order.customerName} (${order.customerEmail || 'No Email'}) — Total: ${order.totalAmount} TND. (Configure RESEND_API_KEY to send real emails)`,
      );
      return;
    }

    const itemsHtml = order.items
      .map(
        (i) => `
          <tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;">
              <strong>${i.name}</strong> ${i.volume ? `<span style="color: #64748b; font-size: 12px;">(${i.volume})</span>` : ''}
              <br/><span style="color: #94a3b8; font-size: 12px;">Qté : ${i.quantity}</span>
            </td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: 600; font-size: 14px;">
              ${(i.unitPrice * i.quantity).toFixed(3)} TND
            </td>
          </tr>
        `,
      )
      .join('');

    const promises: Promise<any>[] = [];

    // A. Send to Customer (if email is provided)
    if (order.customerEmail) {
      promises.push(
        this.resend!.emails.send({
          from: this.fromEmail,
          to: order.customerEmail,
          subject: `Confirmation de votre commande #${orderRef} — Specpart`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"/></head>
            <body style="margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background: #16254c; padding: 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Specpart</h1>
                  <p style="color: #D4A76A; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">Confirmation de commande</p>
                </div>
                <div style="padding: 24px;">
                  <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Merci pour votre commande, ${order.customerName} ! 👋</h2>
                  <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                    Votre commande <strong>#${orderRef}</strong> a bien été enregistrée et nos équipes s'occupent de sa préparation.
                  </p>

                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                      <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 8px; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase;">Article</th>
                        <th style="padding: 8px; text-align: right; color: #475569; font-size: 12px; text-transform: uppercase;">Total</th>
                      </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                    <tfoot>
                      <tr>
                        <td style="padding: 8px; color: #64748b; font-size: 13px;">Frais de livraison (${order.wilaya})</td>
                        <td style="padding: 8px; text-align: right; color: #64748b; font-size: 13px;">${order.shippingCost.toFixed(3)} TND</td>
                      </tr>
                      <tr style="font-size: 16px; font-weight: 700; color: #16254c;">
                        <td style="padding: 12px 8px; border-top: 2px solid #e2e8f0;">Total TTC</td>
                        <td style="padding: 12px 8px; border-top: 2px solid #e2e8f0; text-align: right; color: #16254c;">${order.totalAmount.toFixed(3)} TND</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div style="background: #f8fafc; border-radius: 12px; padding: 14px 16px; margin: 20px 0; font-size: 13px; color: #475569;">
                    <div style="margin-bottom: 6px;">📍 <strong>Adresse de livraison :</strong> ${order.city}, ${order.wilaya}</div>
                    <div style="margin-bottom: 6px;">📞 <strong>Téléphone :</strong> ${order.phone}</div>
                    <div>💳 <strong>Paiement :</strong> ${order.paymentMethod === 'COD' ? 'Paiement à la livraison (Espèces)' : 'Carte Bancaire / Flouci'}</div>
                  </div>

                  <p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 24px;">
                    Une question sur votre livraison ? Contactez notre support au <strong>+216 29 294 195</strong>.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        }).catch((err) => this.logger.error(`Failed to send customer order email: ${err.message}`)),
      );
    }

    // B. Send Alert to Store Admin
    promises.push(
      this.resend!.emails.send({
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
      }).catch((err) => this.logger.error(`Failed to send admin order alert: ${err.message}`)),
    );

    await Promise.all(promises);
  }

  // ── 2. Welcome Email on Registration (Customer + Admin) ───────────────────
  async sendWelcomeEmails(user: UserEmailPayload): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.log(
        `[MAIL MOCK] Welcome email for ${user.name} (${user.email}). (Configure RESEND_API_KEY to send real emails)`,
      );
      return;
    }

    await Promise.all([
      // To User
      this.resend!.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: 'Bienvenue chez Specpart ! 🎉',
        html: `
          <div style="font-family: sans-serif; max-width: 540px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #16254c; margin: 0; font-size: 22px;">Specpart</h1>
              <p style="color: #D4A76A; font-size: 13px; font-weight: bold; margin-top: 4px;">Pièces auto & Lubrifiants en Tunisie</p>
            </div>
            <h2 style="color: #0f172a; font-size: 18px;">Bonjour ${user.name} ! 👋</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Votre compte a été créé avec succès sur <strong>specpart.tn</strong>. Vous pouvez dès à présent ajouter vos véhicules à votre garage, commander vos pièces certifiées et suivre vos livraisons.
            </p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${this.frontendUrl}/catalogue" style="background: #16254c; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                Explorer le catalogue Specpart →
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              Service client disponible du Lundi au Samedi au <strong>+216 29 294 195</strong>.
            </p>
          </div>
        `,
      }).catch((err) => this.logger.error(`Welcome email failed: ${err.message}`)),

      // To Admin
      this.resend!.emails.send({
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
      }).catch((err) => this.logger.error(`Admin registration alert failed: ${err.message}`)),
    ]);
  }

  // ── 3. Forgot Password / Reset Link ───────────────────────────────────────
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password/${token}`;

    if (!this.isConfigured()) {
      this.logger.log(
        `[MAIL MOCK] Password reset link for ${email}: ${resetUrl}`,
      );
      return;
    }

    await this.resend!.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Réinitialisation de votre mot de passe Specpart 🔑',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <h2 style="color: #16254c; margin-top: 0;">Mot de passe oublié ?</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe pour le compte <strong>${email}</strong>.
          </p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetUrl}" style="background: #D4A76A; color: #0d162d; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.4;">
            Ce lien est sécurisé et expire dans <strong>1 heure</strong>.<br/>
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
          </p>
        </div>
      `,
    }).catch((err) => this.logger.error(`Password reset email failed: ${err.message}`));
  }

  // ── 4. Login Security Alert (User + Admin if Admin Account) ────────────────
  async sendLoginAlerts(user: UserEmailPayload): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const time = new Date().toLocaleString('fr-FR', {
      timeZone: 'Africa/Tunis',
    });

    const promises: Promise<any>[] = [
      this.resend!.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: 'Nouvelle connexion détectée — Specpart',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
            <h3 style="color: #16254c; margin-top: 0;">Bonjour ${user.name || user.email},</h3>
            <p style="color: #475569; font-size: 14px;">
              Une nouvelle connexion à votre compte Specpart a été enregistrée le <strong>${time}</strong>.
            </p>
            <p style="color: #94a3b8; font-size: 12px;">
              Si vous n'êtes pas à l'origine de cette activité, nous vous conseillons de changer votre mot de passe immédiatement.
            </p>
          </div>
        `,
      }).catch(() => {}),
    ];

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      promises.push(
        this.resend!.emails.send({
          from: this.fromEmail,
          to: this.adminEmail,
          subject: `🔐 [Alerte Sécurité Admin] Connexion de ${user.email}`,
          html: `<p>L'administrateur <strong>${user.email}</strong> s'est connecté au tableau de bord le ${time}.</p>`,
        }).catch(() => {}),
      );
    }

    await Promise.all(promises);
  }
}
