/**
 * Format a number using the Serbian locale (e.g. 1.234,56).
 * Optionally append a currency code.
 *
 * @param {number} n
 * @param {string} [currency] - e.g. 'RSD', 'EUR'
 */
export function fmt(n, currency) {
  const formatted = n.toLocaleString('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return currency ? `${formatted} ${currency}` : formatted
}
