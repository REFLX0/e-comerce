import { PrismaClient } from '@prisma/client';
import { Scenario } from '../types';
import { toolWasCalled } from '../assertions';

const prisma = new PrismaClient();

// Resolved once at test-boot time, shared across cart scenarios.
let liveSlug: string | null = null;
let liveProductName: string | null = null;

async function resolveLiveSlugForCart() {
  if (liveSlug) return { slug: liveSlug, name: liveProductName! };

  // We need a product that has at least one variant (required by add_to_cart handler in chat.service.ts).
  const found = await prisma.product.findFirst({
    where: {
      variants: { some: { stockQty: { gt: 0 } } }, // stockQty lives on ProductVariant, not Product
    },
    select: { slug: true, nameFr: true },
  });

  if (!found) {
    throw new Error(
      '[Test setup failure] No in-stock product with at least one variant found in the database. ' +
      'The add_to_cart handler requires product.variants.length > 0. ' +
      'Ensure the catalog has products with variants configured.',
    );
  }

  liveSlug = found.slug;
  liveProductName = found.nameFr;
  return { slug: liveSlug, name: liveProductName };
}

export const toolCartScenarios: Scenario[] = [
  {
    name: 'Cart - Full spec (live product)',
    messages: async () => {
      const { slug, name } = await resolveLiveSlugForCart();
      // Use the real product name and real slug so the LLM has correct grounding.
      return [`Ajoute "${name}" à mon panier. Le slug est ${slug}`];
    },
    setup: async () => {
      // Eagerly resolve so failures are loud before the LLM call.
      await resolveLiveSlugForCart();
    },
    assert: (response) => {
      return toolWasCalled(response, 'add_to_cart');
    },
  },
  {
    name: 'Cart - Missing param',
    messages: ["Ajoute ça à mon panier"],
    assert: (response) => {
      // Should ask which product, shouldn't hallucinate a slug and call the tool.
      const calledTool = toolWasCalled(response, 'add_to_cart');
      return !calledTool;
    },
  },
];
