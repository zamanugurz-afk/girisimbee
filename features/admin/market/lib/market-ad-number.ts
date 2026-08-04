/** MARKET reklam numarası — yalnızca detayda gösterilir (ör. MK-MOCKAD01). */
export function formatMarketAdNumber(marketItemId: string): string {
  const compact = marketItemId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
  const padded = (compact || 'AD').padEnd(8, '0').slice(0, 8);
  return `MK-${padded}`;
}
