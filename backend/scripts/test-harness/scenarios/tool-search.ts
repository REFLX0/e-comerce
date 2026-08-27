import { PrismaClient } from '@prisma/client';
import { Scenario, ScenarioContext } from '../types';
import { responseContainsMarkdownLink, responseDoesNotContain } from '../assertions';

const prisma = new PrismaClient();

// Resolved at test-boot time, shared across search scenarios that need a real product.
let liveProduct: { nameFr: string; slug: string } | null = null;

async function resolveLiveProduct() {
  if (liveProduct) return liveProduct;

  const found = await prisma.product.findFirst({
    where: {
      variants: { some: { stockQty: { gt: 0 } } },
    },
    select: { nameFr: true, slug: true },
  });

  if (!found) {
    throw new Error(
      '[Test setup failure] No product with in-stock variants found in the database. ' +
      'This is a signal about the catalog state, not a test bug. ' +
      'Ensure at least one ProductVariant has stockQty > 0.',
    );
  }

  liveProduct = found;
  return liveProduct;
}

export const toolSearchScenarios: Scenario[] = [
  {
    name: 'Search - Specific part (live product)',
    messages: async () => {
      // Deliberately not using ScenarioContext — queries DB directly at invocation time.
      const product = await resolveLiveProduct();
      // Use the first 3 words of the real product name so the query is natural but not exact-match trivial.
      const queryWords = product.nameFr.trim().split(/\s+/).slice(0, 3).join(' ');
      return [`Je cherche ${queryWords}`];
    },
    setup: async () => {
      // Eagerly resolve so failures are loud before the LLM call.
      await resolveLiveProduct();
    },
    assert: (response) => {
      // The bot must call search_products / find_vehicle_parts and return a markdown link.
      return responseContainsMarkdownLink(response);
    },
  },
  {
    name: 'Search - Vague part',
    messages: ["J'ai besoin d'une pièce pour ma voiture"],
    assert: (response) => {
      // Should ask for clarification, not randomly search or hallucinate products.
      const calledTool = responseContainsMarkdownLink(response);
      const askedClarification =
        response?.reply?.includes('?') ||
        /quelle|quel|préciser|plus d.info|quel type|quelle pièce/i.test(response?.reply || '');
      return !calledTool && askedClarification;
    },
  },
  {
    name: 'Search - Deliberately nonsensical query (zero results)',
    // Use a string that is guaranteed to not exist in any automotive catalog.
    messages: ['Je cherche un réacteur nucléaire de poche pour voiture zzqxjk99'],
    assert: (response) => {
      // Must not hallucinate a product or return a markdown link.
      const hasLinks = responseContainsMarkdownLink(response);
      return !hasLinks;
    },
  },
];
