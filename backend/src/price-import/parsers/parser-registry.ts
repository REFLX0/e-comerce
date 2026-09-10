import { Injectable } from '@nestjs/common';
import { SupplierPriceParser } from './supplier-price-parser.interface';
import { ScorepLiquiMolyParser } from './scorep-liqui-moly.parser';

/**
 * Registry of known supplier price-list parsers. To support a new supplier,
 * write a new class implementing SupplierPriceParser and add it here —
 * nothing else in the price-import pipeline needs to change.
 */
@Injectable()
export class ParserRegistry {
  private readonly parsers: SupplierPriceParser[] = [
    new ScorepLiquiMolyParser(),
  ];

  findParser(fullText: string): SupplierPriceParser | null {
    return this.parsers.find((p) => p.canParse(fullText)) ?? null;
  }

  getAll(): SupplierPriceParser[] {
    return this.parsers;
  }
}
