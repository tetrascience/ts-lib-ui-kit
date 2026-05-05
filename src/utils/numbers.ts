const MILLION = 1_000_000;
const THOUSAND = 1_000;

export function formatCount(n: number): string {
  if (n >= MILLION) return `${(n / MILLION).toFixed(1)}M`;
  if (n >= THOUSAND) {
    const thousands = n / THOUSAND;
    if (Number(thousands.toFixed(1)) >= MILLION / THOUSAND) {
      return `${(n / MILLION).toFixed(1)}M`;
    }
    return `${thousands.toFixed(1)}K`;
  }
  return String(n);
}
