'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { JlptMockTestResultView, type SectionScoreRow } from '@/features/mock-test/jlpt-mock-test-result-view';
import { MockTestAnswerReviewModal } from '@/features/mock-test/mock-test-answer-review-modal';
import type { JlptResultBreakdown } from '@/lib/mock-test/jlpt-result-breakdown';
import type { MockTestReviewPayload } from '@/lib/mock-test/mock-test-review.types';

type Props = {
  mockTestId: string;
  attemptId: string;
  userName: string;
  testTitle: string;
  completedAt: Date;
  level: string;
  breakdown: JlptResultBreakdown;
  totalScore: number;
  totalMax: number;
  passed: boolean;
  sectionRows: SectionScoreRow[];
  review: MockTestReviewPayload;
  /** Pro / Pro Max — show DB explanations in answer review */
  canViewExplanations?: boolean;
  /** Pro / Pro Max — open certificate flow (otherwise upgrade dialog) */
  canIssueCertificate?: boolean;
  topLearners?: ReactNode;
};

export function MockTestResultInteractive({
  mockTestId,
  attemptId,
  userName,
  testTitle,
  completedAt,
  level,
  breakdown,
  totalScore,
  totalMax,
  passed,
  sectionRows,
  review,
  canViewExplanations = false,
  canIssueCertificate = false,
  topLearners,
}: Props) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [scrollToQid, setScrollToQid] = useState<string | null>(null);

  const openReview = useCallback((questionId?: string) => {
    setScrollToQid(questionId ?? null);
    setReviewOpen(true);
  }, []);

  return (
    <>
      <JlptMockTestResultView
        mockTestId={mockTestId}
        attemptId={attemptId}
        userName={userName}
        testTitle={testTitle}
        completedAt={completedAt}
        level={level}
        breakdown={breakdown}
        totalScore={totalScore}
        totalMax={totalMax}
        passed={passed}
        sectionRows={sectionRows}
        onViewAnswers={() => openReview()}
        onSectionNavigate={(questionId) => openReview(questionId)}
        asideFooter={topLearners}
        canIssueCertificate={canIssueCertificate}
      />

      <MockTestAnswerReviewModal
        open={reviewOpen}
        onOpenChange={(o) => {
          setReviewOpen(o);
          if (!o) setScrollToQid(null);
        }}
        review={review}
        initialScrollQuestionId={scrollToQid}
        canViewExplanations={canViewExplanations}
      />
    </>
  );
}
