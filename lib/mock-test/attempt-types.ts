/**
 * Shape expected by `buildMockTestReviewPayload` — mirrors Prisma includes on the result page.
 */

type ReviewQuestionRow = {
  id: string;
  content: string;
  options: unknown;
  correctAnswer: string;
  explanation?: string | null;
  explanationVi?: string | null;
  readingPassageId?: string | null;
  listeningPassageId?: string | null;
  readingPassage?: {
    id: string;
    title: string;
    content: string;
    contentVi?: string | null;
  } | null;
  listeningPassage?: {
    id: string;
    title: string;
    audioUrl: string;
    transcript?: string | null;
    duration?: number | null;
  } | null;
};

export type AttemptWithQuestions = {
  score: number | null;
  totalScore: number | null;
  startedAt: Date;
  completedAt: Date | null;
  answers: Array<{
    questionId: string;
    userAnswer: string | null;
    isCorrect: boolean;
  }>;
  mockTest: {
    sections: Array<{
      id: string;
      name: string;
      questions: Array<{
        questionId: string;
        question: ReviewQuestionRow;
      }>;
    }>;
  };
};
