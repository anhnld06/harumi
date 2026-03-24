/**
 * Database model types - mirror Prisma schema.
 * Use these for component props when @prisma/client types aren't resolving.
 */

export type Kanji = {
  id: string;
  character: string;
  meaning: string;
  onyomi: string | null;
  kunyomi: string | null;
  strokeCount: number;
  jlptLevel: string;
  grade: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Grammar = {
  id: string;
  title: string;
  structure: string;
  explanation: string;
  exampleJp: string | null;
  exampleEn: string | null;
  level: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Vocabulary = {
  id: string;
  word: string;
  reading: string | null;
  onyomiVi: string | null;
  meaningEn: string;
  meaningVi: string | null;
  exampleEn: string | null;
  exampleJp: string | null;
  audioUrl: string | null;
  level: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReadingPassage = {
  id: string;
  title: string;
  content: string;
  level: string;
  wordCount: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Question = {
  id: string;
  type: QuestionType;
  content: string;
  options: unknown; // Prisma JsonValue - use as Record<string, string> when needed
  correctAnswer: string;
  explanation: string | null;
  vocabularyId: string | null;
  kanjiId: string | null;
  grammarId: string | null;
  readingPassageId: string | null;
  listeningPassageId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MockTest = {
  id: string;
  title: string;
  duration: number;
  passScore: number;
  createdAt: Date;
  updatedAt: Date;
};

export type MockTestSection = {
  id: string;
  mockTestId: string;
  name: string;
  order: number;
  duration: number;
  questionCount: number;
};

export type QuestionType =
  | 'VOCAB_MEANING'
  | 'VOCAB_FILL_BLANK'
  | 'KANJI_MEANING'
  | 'KANJI_READING'
  | 'GRAMMAR_MULTIPLE'
  | 'GRAMMAR_ORDER'
  | 'READING'
  | 'LISTENING';
