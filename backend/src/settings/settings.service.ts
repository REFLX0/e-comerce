import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Default settings seeded if they don't exist in the DB
const DEFAULT_SETTINGS: Record<string, string> = {
  SITE_NAME: '"KiosqueTN"',
  SITE_CURRENCY: '"TND"',
  CONTACT_EMAIL: '"contact@kiosquetn.tn"',
  CONTACT_PHONE: '"+216 71 000 000"',
  SEO_TITLE: '"KiosqueTN - L\'Expertise Automobile"',
  SEO_DESCRIPTION:
    '"Découvrez notre large gamme de lubrifiants et huiles moteur en Tunisie."',
  SEO_INDEX: 'true',
  EMAIL_SENDER: '"noreply@kiosquetn.tn"',
  EMAIL_ORDER_CONFIRMATION: 'true',
  EMAIL_SHIP_CONFIRMATION: 'true',
  PAYMENT_COD_ENABLED: 'true',
  PAYMENT_CARD_ENABLED: 'false',
  CGV_LINK: '"/fr/cgv"',
  CGV_REQUIRE_CHECKOUT: 'true',
  SECURITY_SESSION_DAYS: '30',
  SECURITY_2FA_ENABLED: 'false',
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
