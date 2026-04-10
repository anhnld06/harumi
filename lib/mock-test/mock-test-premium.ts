/**
 * Mock-test explanations are a Pro / Pro Max feature while subscription is active.
 */
export function userCanViewMockTestExplanations(
  planTier: string | null | undefined,
  planExpiresAt: Date | null | undefined
): boolean {
  if (planTier == null || planTier === '') return false;
  const t = planTier.toLowerCase();
  if (t !== 'pro' && t !== 'pro_max') return false;
  if (planExpiresAt == null) return true;
  return planExpiresAt.getTime() > Date.now();
}

/** Course certificates after passing mock tests use the same plan gate as explanations. */
export function userCanIssueCourseCertificate(
  planTier: string | null | undefined,
  planExpiresAt: Date | null | undefined
): boolean {
  return userCanViewMockTestExplanations(planTier, planExpiresAt);
}
