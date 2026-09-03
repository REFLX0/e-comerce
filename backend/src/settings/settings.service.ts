import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Default settings seeded if they don't exist in the DB
const DEFAULT_SETTINGS: Record<string, string> = {
  SITE_NAME: '"specpart"',
  SITE_CURRENCY: '"TND"',
  CONTACT_EMAIL: '"specpart@hotmail.com"',
  CONTACT_PHONE: '"+216 71 000 000"',
  SEO_TITLE: '"specpart - Pièces Auto & Lubrifiants"',
  SEO_DESCRIPTION:
    '"Découvrez notre large gamme de lubrifiants et huiles moteur en Tunisie."',
  SEO_INDEX: 'true',
  EMAIL_SENDER: '"noreply@specpart.tn"',
  EMAIL_ORDER_CONFIRMATION: 'true',
  EMAIL_SHIP_CONFIRMATION: 'true',
  PAYMENT_COD_ENABLED: 'true',
  PAYMENT_CARD_ENABLED: 'false',
  CGV_LINK: '"/fr/cgv"',
  CGV_REQUIRE_CHECKOUT: 'true',
  SECURITY_SESSION_DAYS: '30',
  SECURITY_2FA_ENABLED: 'false',
  FACTURE_LOGO: '"/logo.jpg"',
  FACTURE_TABA3: '""',
  FACTURE_CODE_IMG: '""',
  FACTURE_MATRICULE_FISCALE: '"100000/A/P/000"',
  FACTURE_REGISTRE_COMMERCE: '"B0123452026"',
  FACTURE_ADDRESS: '"03, rue Mohamed Bayram 5, Sidi Daoud la Marsa, 2046"',
  FACTURE_PHONE: '"29294195"',
  FACTURE_EMAIL: '"specpart@hotmail.com"',
  FACTURE_TVA_RATE: '"19"',
  FACTURE_TIMBRE_FISCAL: '"1.000"',
};

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  // Seed defaults on startup
  async onModuleInit() {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await this.prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: {}, // Don't overwrite existing values
      });
    }

    // Force update address and matricule if they still have old Carthage or Chaker values
    try {
      const currentAddr = await this.prisma.setting.findUnique({ where: { key: 'FACTURE_ADDRESS' } });
      if (currentAddr && (currentAddr.value.includes('Carthage') || currentAddr.value.includes('Chaker'))) {
        await this.prisma.setting.update({
          where: { key: 'FACTURE_ADDRESS' },
          data: { value: JSON.stringify('03, rue Mohamed Bayram 5, Sidi Daoud la Marsa, 2046') },
        });
      }

      const currentMf = await this.prisma.setting.findUnique({ where: { key: 'FACTURE_MATRICULE_FISCALE' } });
      if (currentMf && currentMf.value.includes('1823940')) {
        await this.prisma.setting.update({
          where: { key: 'FACTURE_MATRICULE_FISCALE' },
          data: { value: JSON.stringify('100000/A/P/000') },
        });
      }
    } catch {}
  }

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)]));
  }

  async batchUpdate(
    updates: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const ops = Object.entries(updates).map(([key, val]) =>
      this.prisma.setting.upsert({
        where: { key },
        create: { key, value: JSON.stringify(val) },
        update: { value: JSON.stringify(val) },
      }),
    );
    await this.prisma.$transaction(ops);
    return this.getAll();
  }
}
