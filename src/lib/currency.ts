/**
 * Official Kairos Addis Ethiopian Birr (ETB) currency formatting utilities.
 * Consistent styling: 'ETB 5,000,000'
 */

export const PENDING_ETB_PRICE_LABEL = 'ETB Price Pending Configuration';

export function formatETB(
  amount: number | null | undefined,
  fallback: string = PENDING_ETB_PRICE_LABEL
): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
    return fallback;
  }
  return `ETB ${Math.round(amount).toLocaleString('en-US')}`;
}

export function parseETB(input: string | number): number | null {
  if (typeof input === 'number') {
    return isNaN(input) || input <= 0 ? null : input;
  }
  if (!input) return null;
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
}
