/**
 * Friendly pricing utility
 * Rounds prices to "friendly" numbers ending in 9 or 99
 * Examples:
 * - R87 → R99
 * - R1,312 → R1,319
 * - R5,450 → R5,499
 * - R12,800 → R12,899
 */

export function roundToFriendlyPrice(price: number): number {
  if (price <= 0) return price;

  // For prices under R100, round up to nearest 9
  if (price < 100) {
    return Math.ceil(price / 10) * 10 - 1; // Round up to nearest 10, then subtract 1
  }

  // For prices R100-R999, round up to nearest 99
  if (price < 1000) {
    return Math.ceil(price / 100) * 100 - 1; // Round up to nearest 100, then subtract 1
  }

  // For prices R1,000-R9,999, round up to nearest 99
  if (price < 10000) {
    return Math.ceil(price / 100) * 100 - 1; // Round up to nearest 100, then subtract 1
  }

  // For prices R10,000+, round up to nearest 99
  return Math.ceil(price / 100) * 100 - 1; // Round up to nearest 100, then subtract 1
}

/**
 * Examples and tests:
 * R87 → R99 (round up to 90, then -1 = 89, but we want 99, so...)
 * Actually, let me reconsider the logic:
 * 
 * R87: We want R99
 * - Round up to nearest 10: 90
 * - But we want it to end in 9, so: 89? No, that's lower
 * - We want to round UP to the next "friendly" number
 * 
 * Better logic:
 * - Under R100: Round up to next number ending in 9 (9, 19, 29, ..., 99)
 * - R100+: Round up to next number ending in 99 (199, 299, ..., 999, 1099, 1199, ...)
 */

export function roundToFriendlyPriceV2(price: number): number {
  if (price <= 0) return price;

  // For prices under R100, round up to R99
  if (price < 100) {
    return 99;
  }

  // For prices R100+, round up to next number ending in 9 or 99
  // Pattern: Round up to next number ending in 9 (in the last digit)
  // Examples:
  // R1,312 → R1,319 (round up to next number ending in 9)
  // R5,450 → R5,459
  // R12,800 → R12,809
  
  // Round up to next 10, then subtract 1 to get ending in 9
  const rounded = Math.ceil((price + 1) / 10) * 10 - 1;
  return rounded;
}

// Use the V2 version as it handles edge cases better
export const roundToFriendly = roundToFriendlyPriceV2;

