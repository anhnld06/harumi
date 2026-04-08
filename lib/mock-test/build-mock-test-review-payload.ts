import type { AttemptWithQuestions } from '@/lib/mock-test/attempt-types';
import type { MockTestReviewPayload } from '@/lib/mock-test/mock-test-review.types';

export function buildMockTestReviewPayload(attempt: AttemptWithQuestions): MockTestReviewPayload {
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const completedAt = attempt.completedAt ?? attempt.startedAt;
  const durationMs = Math.max(0, completedAt.getTime() - attempt.startedAt.getTime());

  const sections = attempt.mockTest.sections.map((sec, si) => {
    let lastReadingPassageId: string | null = null;
    let lastListeningPassageId: string | null = null;

    const questions = sec.questions.map((mq, qi) => {
      const q = mq.question;
      const ans = answerMap.get(q.id);
      const raw = q.options;
      const options =
        raw && typeof raw === 'object' && !Array.isArray(raw)
          ? (raw as Record<string, string>)
          : null;

      let readingBlock: { title: string; content: string; contentVi?: string | null } | null = null;
      if (q.readingPassageId && q.readingPassage) {
        if (q.readingPassageId !== lastReadingPassageId) {
          readingBlock = {
            title: q.readingPassage.title,
            content: q.readingPassage.content,
            contentVi: q.readingPassage.contentVi ?? null,
          };
          lastReadingPassageId = q.readingPassageId;
        }
      } else {
        lastReadingPassageId = null;
      }

      let listeningBlock: {
        title: string;
        audioUrl: string;
        transcript?: string | null;
        duration?: number | null;
      } | null = null;
      if (q.listeningPassageId && q.listeningPassage) {
        if (q.listeningPassageId !== lastListeningPassageId) {
          listeningBlock = {
            title: q.listeningPassage.title,
            audioUrl: q.listeningPassage.audioUrl,
            transcript: q.listeningPassage.transcript ?? null,
            duration: q.listeningPassage.duration ?? null,
          };
          lastListeningPassageId = q.listeningPassageId;
        }
      } else {
        lastListeningPassageId = null;
      }

      return {
        questionId: q.id,
        label: `${si + 1}.${qi + 1}`,
        content: q.content,
        options,
        correctAnswer: q.correctAnswer,
        userAnswer: ans?.userAnswer?.trim() ? ans.userAnswer : '',
        isCorrect: ans?.isCorrect ?? false,
        readingBlock,
        listeningBlock,
        explanation: q.explanation ?? null,
        explanationVi: q.explanationVi ?? null,
      };
    });

    return {
      id: sec.id,
      name: sec.name,
      questions,
    };
  });

  return {
    sections,
    durationMs,
    totalScore: attempt.score ?? 0,
    totalMax: attempt.totalScore ?? 0,
  };
}
