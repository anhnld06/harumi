import type { MockTest, MockTestSection, Question } from '@/lib/db-types';

export type ReadingPassageLite = {
  id: string;
  title: string;
  content: string;
  contentVi?: string | null;
};

export type ListeningPassageLite = {
  id: string;
  title: string;
  audioUrl: string;
  transcript?: string | null;
  duration?: number | null;
};

export type QuestionInTest = Question & {
  readingPassage?: ReadingPassageLite | null;
  listeningPassage?: ListeningPassageLite | null;
};

/** Full mock test tree returned by `getMockTestWithQuestions` / Prisma include. */
export type TestWithSections = MockTest & {
  sections: (MockTestSection & {
    questions: Array<{ question: QuestionInTest }>;
  })[];
};
