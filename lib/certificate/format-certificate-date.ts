/**
 * SSR-safe certificate date: identical on Node and browser (avoids hydration mismatch
 * from default `toLocaleDateString()` differing by runtime locale).
 */
export function formatCertificateDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}
