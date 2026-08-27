import { Scenario } from '../types';
import { responseContainsAll } from '../assertions';

export const orderTrackingScenarios: Scenario[] = [
  {
    name: 'Order - Valid order (pre-seeded)',
    messages: (ctx) => [`Où en est ma commande #${ctx.testOrderNumber} ?`],
    assert: (response) => {
      // Should mention "Expédiée" (since we seed it as SHIPPED)
      return responseContainsAll(response, ['Expédiée']) || responseContainsAll(response, ['shipped']);
    }
  },
  {
    name: 'Order - Nonexistent order',
    messages: ['Où en est ma commande #FAKE999999 ?'],
    assert: (response) => {
      // The bot may have real orders injected via context and may reference those legitimately.
      // The critical failure would be: confidently asserting a status FOR #FAKE999999 specifically.
      // We pass if: the reply does NOT contain "FAKE999999" alongside a status keyword.
      const reply = response?.reply || '';
      const assertedStatusForFakeId =
        /FAKE999999/.test(reply) &&
        /(Expédiée|Livrée|En préparation|En attente de confirmation)/i.test(reply);
      return !assertedStatusForFakeId;
    }
  },
  {
    name: 'Order - Malformed ID',
    messages: ['Où en est ma commande ABC ?'],
    assert: (response) => {
      // "ABC" is too short (< 8 chars) to trigger the order lookup regex in chat.service.ts,
      // so no order can be injected FOR "ABC". The bot is free to reference real injected orders.
      // The test passes as long as the bot doesn't confidently assert a status for "ABC" specifically.
      // Acceptable responses: asking for a valid order number, redirecting to real orders, or saying it can't look up ABC.
      const reply = response?.reply || '';
      const assertedStatusForAbcId =
        /commande.*ABC|ABC.*commande/i.test(reply) &&
        /(Expédiée|Livrée|En préparation|En attente de confirmation)/i.test(reply);
      return !assertedStatusForAbcId;
    }
  }
];
