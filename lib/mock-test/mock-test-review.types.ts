/** Serializable payload for the mock test answer review modal (built on the server). */
export type MockTestReviewQuestion = {
  questionId: string;
  label: string;
  content: string;
  options: Record<string, string> | null;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  /** 読解: 同じ passage の先頭の小問だけに付与 */
  readingBlock?: { title: string; content: string; contentVi?: string | null } | null;
  /** 聴解: 同じ音声トラックの先頭の小問だけに付与 */
  listeningBlock?: {
    title: string;
    audioUrl: string;
    transcript?: string | null;
    duration?: number | null;
  } | null;
  /** 解説（DB）— Pro 閲覧可 */
  explanation?: string | null;
  explanationVi?: string | null;
};

export type MockTestReviewSection = {
  id: string;
  name: string;
  questions: MockTestReviewQuestion[];
};

export type MockTestReviewPayload = {
  sections: MockTestReviewSection[];
  durationMs: number;
  totalScore: number;
  totalMax: number;
};
