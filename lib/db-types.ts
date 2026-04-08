/**
 * Database model types - mirror Prisma schema.
 * Use these for component props when @prisma/client types aren't resolving.
 */

import type { CertificateTemplate } from '@/lib/certificate/constants';

export type UserCertificate = {
  id: string;
  userId: string;
  mockTestId: string;
  attemptId: string;
  template: CertificateTemplate;
  recipientName: string;
  courseTitle: string;
  scoreText: string;
  certificateNo: string;
  issuedAt: Date;
  updatedAt: Date;
};

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
  /** Set server-side from Mimikara N2 static MP3s when word+reading match JSON */
  n2AudioSrc?: string;
};

export type ReadingPassage = {
  id: string;
  title: string;
  content: string;
  level: string;
  /** false when passage is mock-test-only (not shown in Reading module) */
  libraryVisible: boolean;
  wordCount: number | null;
  contentVi: string | null;
  footnotes: unknown | null;
  grammarInPassage: unknown | null;
  vocabulary: unknown | null;
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
  sortOrder: number;
  contentVi: string | null;
  optionsVi: unknown | null;
  explanationVi: string | null;
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
  passTotalScaled: number;
  jlptLevel: string | null;
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
  scaledMax: number;
  minimumPassScaled: number;
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
