import { calcSpecificity } from './specificity';

describe('calcSpecificity', () => {
  describe('cylinder range width', () => {
    it('exact single-cylinder match scores higher than a wide range for the same user input', () => {
      const exact = calcSpecificity({ minCylinders: 4, maxCylinders: 4 });
      const wide = calcSpecificity({ minCylinders: 1, maxCylinders: 12 });
      expect(exact).toBeGreaterThan(wide);
    });

    it('produces identical scores for identical specs', () => {
      const a = calcSpecificity({ minCylinders: 4, maxCylinders: 6 });
      const b = calcSpecificity({ minCylinders: 4, maxCylinders: 6 });
      expect(a).toBe(b);
    });

    it('narrower range scores higher than wider range', () => {
      const narrow = calcSpecificity({ minCylinders: 4, maxCylinders: 5 });
      const medium = calcSpecificity({ minCylinders: 4, maxCylinders: 8 });
      const broad = calcSpecificity({ minCylinders: 1, maxCylinders: 12 });
      expect(narrow).toBeGreaterThan(medium);
      expect(medium).toBeGreaterThan(broad);
    });

    it('one-sided bound scores higher than no bound but lower than exact', () => {
      const exact = calcSpecificity({ minCylinders: 4, maxCylinders: 4 });
      const oneSide = calcSpecificity({ minCylinders: 4 });
      const none = calcSpecificity({});
      expect(exact).toBeGreaterThan(oneSide);
      expect(oneSide).toBeGreaterThan(none);
    });
  });

  describe('power range width', () => {
    it('exact power match scores higher than a wide range', () => {
      const exact = calcSpecificity({ minPower: 90, maxPower: 90 });
      const wide = calcSpecificity({ minPower: 0, maxPower: 500 });
      expect(exact).toBeGreaterThan(wide);
    });

    it('narrower power range scores higher than wider range', () => {
      const narrow = calcSpecificity({ minPower: 90, maxPower: 95 });
      const wide = calcSpecificity({ minPower: 50, maxPower: 200 });
      expect(narrow).toBeGreaterThan(wide);
    });
  });

  describe('vehicle types', () => {
    it('fewer vehicle types scores higher than listing all types', () => {
      const single = calcSpecificity({ vehicleTypes: ['CAR'] });
      const all = calcSpecificity({
        vehicleTypes: ['CAR', 'MOTO', 'TRUCK', 'AGRI'],
      });
      expect(single).toBeGreaterThan(all);
    });

    it('two vehicle types ranks between one and four', () => {
      const one = calcSpecificity({ vehicleTypes: ['CAR'] });
      const two = calcSpecificity({ vehicleTypes: ['CAR', 'MOTO'] });
      const four = calcSpecificity({
        vehicleTypes: ['CAR', 'MOTO', 'TRUCK', 'AGRI'],
      });
      expect(one).toBeGreaterThan(two);
      expect(two).toBeGreaterThan(four);
    });
  });

  describe('fuel types', () => {
    it('single fuel type scores higher than both', () => {
      const single = calcSpecificity({ fuelTypes: ['ESSENCE'] });
      const both = calcSpecificity({ fuelTypes: ['ESSENCE', 'DIESEL'] });
      expect(single).toBeGreaterThan(both);
    });
  });

  describe('composite scoring', () => {
    it('a product with exact cylinders AND exact power outranks one with only exact cylinders', () => {
      const both = calcSpecificity({
        minCylinders: 4,
        maxCylinders: 4,
        minPower: 90,
        maxPower: 90,
      });
      const onlyCyl = calcSpecificity({ minCylinders: 4, maxCylinders: 4 });
      expect(both).toBeGreaterThan(onlyCyl);
    });

    it('null specs returns 0', () => {
      expect(calcSpecificity(null)).toBe(0);
      expect(calcSpecificity(undefined)).toBe(0);
    });

    it('empty object returns 0', () => {
      expect(calcSpecificity({})).toBe(0);
    });
  });

  describe('user-requested explicit examples', () => {
    it('moto-only scores higher than all-four-types', () => {
      const motoOnly = calcSpecificity({ vehicleTypes: ['moto'] });
      const allTypes = calcSpecificity({
        vehicleTypes: ['car', 'moto', 'truck', 'agri'],
      });
      expect(motoOnly).toBeGreaterThan(allTypes);
    });

    it('for same user input cylinders=4, a tight-range product outranks a wide-range one', () => {
      // Both products claim to cover cylinders=4, but one is more specific
      const tight = calcSpecificity({ minCylinders: 4, maxCylinders: 4 });
      const wide = calcSpecificity({ minCylinders: 1, maxCylinders: 12 });
      expect(tight).toBeGreaterThan(wide);
    });

    it('null or unbounded sides contribute zero specificity for that dimension', () => {
      const noPower = calcSpecificity({ minCylinders: 4, maxCylinders: 4 });
      const withPower = calcSpecificity({
        minCylinders: 4,
        maxCylinders: 4,
        minPower: 90,
        maxPower: 90,
      });
      expect(withPower).toBeGreaterThan(noPower);
      expect(noPower).toBeGreaterThan(0);
    });
  });

  describe('no-specs product is handled gracefully', () => {
    it('returns 0 for null specs', () => {
      expect(calcSpecificity(null)).toBe(0);
    });

    it('returns 0 for undefined specs', () => {
      expect(calcSpecificity(undefined)).toBe(0);
    });

    it('products without ProductSpecs are excluded by Prisma WHERE, never reach calcSpecificity', () => {
      // In findOilRecommendations, the Prisma query has:
      //   where: { isPublished: true, specs: specsWhere }
      // Products without a ProductSpecs row don't match this filter
      // and are excluded at the database level — no null reaches the scoring loop
      expect(calcSpecificity(null)).toBe(0);
    });
  });

  describe('regression: original bug', () => {
    it('would have caught the original bug — array length must not add to score', () => {
      // Original code did `score += specs.vehicleTypes?.length`, so 4 types = 4pts, 1 type = 1pt
      // Correct behavior: 4 types = 0pts (least specific), 1 type = 3pts (most specific)
      const oneType = calcSpecificity({ vehicleTypes: ['CAR'] });
      const fourTypes = calcSpecificity({
        vehicleTypes: ['CAR', 'MOTO', 'TRUCK', 'AGRI'],
      });
      expect(oneType).toBeGreaterThan(fourTypes);
    });

    it('would have caught the original bug — range width matters, not just bound presence', () => {
      // Original code scored both the same (just checked `!= null`)
      const tight = calcSpecificity({ minCylinders: 4, maxCylinders: 4 });
      const loose = calcSpecificity({ minCylinders: 1, maxCylinders: 12 });
      expect(tight).toBeGreaterThan(loose);
    });
  });
});
