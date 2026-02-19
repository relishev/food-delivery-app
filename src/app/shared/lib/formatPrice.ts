export function formatPrice(
  amount: number,
  code: CurrencyCode,
  rates: Record<string, number>,
  symbol: string
): string {
  const rate = rates[code] ?? 1;
  const converted = amount * rate;
  if (code === "KRW") return symbol + Math.round(converted).toLocaleString();
  return converted.toFixed(2) + " " + symbol;
}
