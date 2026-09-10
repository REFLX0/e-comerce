export interface PriceChangeAnalysis {
  changePercent: number | null;
  isSuspicious: boolean;
  warning: string | null;
}

const LARGE_INCREASE_PERCENT = 300; // e.g. old 100 -> new 400+
const LARGE_DECREASE_PERCENT = 80; // e.g. old 100 -> new 20 or less
const DECIMAL_SHIFT_RATIOS = [10, 100, 0.1, 0.01];
const DECIMAL_SHIFT_TOLERANCE = 0.05; // 5%

/**
 * Flags price changes an admin should double-check before applying —
 * huge swings, and the classic "extracted 1950 instead of 19.50" decimal
 * slip. Never blocks the change, only marks it for a confirmation prompt.
 */
export function analyzePriceChange(
  oldPrice: number | null,
  newPrice: number | null,
): PriceChangeAnalysis {
  if (newPrice == null) {
    return { changePercent: null, isSuspicious: false, warning: null };
  }

  if (oldPrice == null || oldPrice === 0) {
    if (oldPrice === 0) {
      return {
        changePercent: null,
        isSuspicious: true,
        warning:
          'Previous price was 0 — please verify this new price manually.',
      };
    }
    return { changePercent: null, isSuspicious: false, warning: null };
  }

  const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

  for (const ratio of DECIMAL_SHIFT_RATIOS) {
    const expected = oldPrice * ratio;
    if (
      expected !== 0 &&
      Math.abs(newPrice - expected) / expected <= DECIMAL_SHIFT_TOLERANCE
    ) {
      return {
        changePercent: round(changePercent),
        isSuspicious: true,
        warning: `Possible decimal error: new price looks ${ratio >= 1 ? ratio + 'x larger' : 1 / ratio + 'x smaller'} than the previous price.`,
      };
    }
  }

  if (changePercent >= LARGE_INCREASE_PERCENT) {
    return {
      changePercent: round(changePercent),
      isSuspicious: true,
      warning: `Suspicious price change: +${round(changePercent)}%`,
    };
  }

  if (changePercent <= -LARGE_DECREASE_PERCENT) {
    return {
      changePercent: round(changePercent),
      isSuspicious: true,
      warning: `Suspicious price change: ${round(changePercent)}%`,
    };
  }

  return {
    changePercent: round(changePercent),
    isSuspicious: false,
    warning: null,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
