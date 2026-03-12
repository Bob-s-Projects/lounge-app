const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const yenDecimalFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatYen(value: number): string {
  return yenFormatter.format(value);
}

export function formatYenDecimal(value: number): string {
  return yenDecimalFormatter.format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "";
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ja-JP").format(value);
}
