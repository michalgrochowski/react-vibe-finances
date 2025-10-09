/**
 * Converts cents to PLN (Polish Zloty)
 * @param cents - Amount in cents
 * @returns Formatted amount in PLN
 */
export function centsToPlnString(cents: number): string {
  const pln = cents / 100;
  return `${pln.toFixed(2)} PLN`;
}

/**
 * Converts cents to PLN number
 * @param cents - Amount in cents
 * @returns Amount in PLN as number
 */
export function centsToPlnNumber(cents: number): number {
  return cents / 100;
}

/**
 * Converts PLN to cents
 * @param pln - Amount in PLN
 * @returns Amount in cents
 */
export function plnToCents(pln: number): number {
  return Math.round(pln * 100);
}

/**
 * Formats a number to PLN currency string
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatPlnCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parses a string amount to cents
 * @param amountStr - String representation of amount (e.g., "123.45", "123,45")
 * @returns Amount in cents, or null if invalid
 */
export function parseAmountToCents(amountStr: string): number | null {
  // Replace comma with dot for parsing
  const normalized = amountStr.replace(',', '.');
  const parsed = parseFloat(normalized);
  
  if (isNaN(parsed) || parsed < 0) {
    return null;
  }
  
  return plnToCents(parsed);
}

/**
 * Calculates percentage
 * @param part - Part value
 * @param total - Total value
 * @returns Percentage (0-100)
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Formats percentage with precision
 * @param percentage - Percentage value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(percentage: number, decimals: number = 1): string {
  return `${percentage.toFixed(decimals)}%`;
}

