const MILLION = 1_000_000;
const THOUSAND = 1_000;

export function formatCount(n: number): string {
  if (n >= MILLION) return `${(n / MILLION).toFixed(1)}M`;
  if (n >= THOUSAND) return `${(n / THOUSAND).toFixed(1)}K`;
  return String(n);
}
