/**
 * Đề 模擬試験 第1〜3回 trong seed là miễn phí; đề full (và các đề khác) cần gói Pro / Pro Max.
 */
export function isFreePublicMockTestTitle(title: string): boolean {
  return /第[123]回/.test(title);
}

export function userCanAccessPremiumMockTests(
  planTier: string | null | undefined,
  planExpiresAt: string | Date | null | undefined
): boolean {
  if (planTier == null || planTier === '') return false;
  const t = planTier.toLowerCase();
  if (t !== 'pro' && t !== 'pro_max') return false;
  if (planExpiresAt == null) return true;
  const d = typeof planExpiresAt === 'string' ? new Date(planExpiresAt) : planExpiresAt;
  return d.getTime() > Date.now();
}

/** Sắp xếp tăng dần: 第1回 → 第2回 → 第3回 → các đề khác (full) theo title. */
export function compareMockTestsByTitle(aTitle: string, bTitle: string): number {
  const na = titleSortKey(aTitle);
  const nb = titleSortKey(bTitle);
  if (na !== nb) return na - nb;
  return aTitle.localeCompare(bTitle, 'ja');
}

function titleSortKey(title: string): number {
  const m = title.match(/第(\d+)回/);
  if (m) return parseInt(m[1], 10);
  return 10_000;
}
