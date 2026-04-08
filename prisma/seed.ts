import { PrismaClient, type Prisma, type Question, type ReadingPassage, type ListeningPassage, type QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import Kanji from 'kanji.js';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const LEGACY_DEMO_MOCK_TITLE = 'JLPT N2 Demo Mock (seed)';

/** mock-tests-n2.json — 聴解 placeholder; replace per passage in JSON if needed */
const DEFAULT_LISTENING_AUDIO_URL =
  'https://actions.google.com/sounds/v1/cartoon/pop_cork.ogg';

type MockTestsN2Mcq = {
  type: QuestionType;
  content: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation?: string | null;
  contentVi?: string | null;
  optionsVi?: Record<string, string> | null;
  explanationVi?: string | null;
};

type MockTestsN2InlineSection = {
  kind: 'INLINE';
  name: string;
  order: number;
  duration: number;
  scaledMax: number;
  minimumPassScaled: number;
  questions: MockTestsN2Mcq[];
};

type MockTestsN2ReadingPassageBlock = {
  title: string;
  contentJp: string;
  contentVi?: string | null;
  wordCount?: number | null;
  questions: MockTestsN2Mcq[];
};

type MockTestsN2ReadingSection = {
  kind: 'READING';
  name: string;
  order: number;
  duration: number;
  scaledMax: number;
  minimumPassScaled: number;
  /** 単一 passage（従来） */
  passage?: MockTestsN2ReadingPassageBlock;
  /** 本番相当：複数短文・中文・統合・長文など */
  passages?: MockTestsN2ReadingPassageBlock[];
};

type MockTestsN2ListeningSection = {
  kind: 'LISTENING';
  name: string;
  order: number;
  duration: number;
  scaledMax: number;
  minimumPassScaled: number;
  passages: Array<{
    title: string;
    audioUrl?: string;
    transcript?: string | null;
    duration?: number | null;
    questions: MockTestsN2Mcq[];
  }>;
};

type MockTestN2Seed = {
  title: string;
  duration: number;
  passTotalScaled: number;
  jlptLevel: 'N2';
  sections: Array<
    MockTestsN2InlineSection | MockTestsN2ReadingSection | MockTestsN2ListeningSection
  >;
};

type MockTestsN2Json = {
  version: number;
  tests: MockTestN2Seed[];
};

function buildMockTestN2QuestionData(q: MockTestsN2Mcq) {
  return {
    type: q.type,
    content: q.content,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation ?? null,
    contentVi: q.contentVi ?? null,
    optionsVi: q.optionsVi ?? undefined,
    explanationVi: q.explanationVi ?? null,
  };
}

async function removeMockTestByTitle(title: string) {
  const mt = await prisma.mockTest.findFirst({
    where: { title },
    include: { sections: { include: { questions: true } } },
  });
  if (!mt) return;

  const questionIds = mt.sections.flatMap((s) => s.questions.map((mq) => mq.questionId));
  if (questionIds.length === 0) {
    await prisma.mockTest.delete({ where: { id: mt.id } });
    return;
  }

  const meta = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { readingPassageId: true, listeningPassageId: true },
  });
  const readingIds = Array.from(
    new Set(meta.map((m) => m.readingPassageId).filter((id): id is string => id != null)),
  );
  const listeningIds = Array.from(
    new Set(meta.map((m) => m.listeningPassageId).filter((id): id is string => id != null)),
  );

  await prisma.mockTest.delete({ where: { id: mt.id } });
  await prisma.question.deleteMany({ where: { id: { in: questionIds } } });

  if (readingIds.length > 0) {
    await prisma.readingPassage.deleteMany({ where: { id: { in: readingIds } } });
  }
  if (listeningIds.length > 0) {
    await prisma.listeningPassage.deleteMany({ where: { id: { in: listeningIds } } });
  }
}

async function seedMockTestsN2FromJson(payload: MockTestsN2Json) {
  for (const test of payload.tests) {
    await removeMockTestByTitle(test.title);

    const mt = await prisma.mockTest.create({
      data: {
        title: test.title,
        duration: test.duration,
        passTotalScaled: test.passTotalScaled,
        jlptLevel: test.jlptLevel,
      } as Prisma.MockTestUncheckedCreateInput,
    });

    for (const sec of test.sections) {
      const msec = await prisma.mockTestSection.create({
        data: {
          mockTestId: mt.id,
          name: sec.name,
          order: sec.order,
          duration: sec.duration,
          questionCount: 0,
          scaledMax: sec.scaledMax,
          minimumPassScaled: sec.minimumPassScaled,
        } as Prisma.MockTestSectionUncheckedCreateInput,
      });

      let ord = 1;
      let qCount = 0;

      if (sec.kind === 'INLINE') {
        for (const q of sec.questions) {
          const question = await prisma.question.create({
            data: buildMockTestN2QuestionData(q),
          });
          await prisma.mockTestQuestion.create({
            data: { sectionId: msec.id, questionId: question.id, order: ord++ },
          });
          qCount++;
        }
      } else if (sec.kind === 'READING') {
        const blocks: MockTestsN2ReadingPassageBlock[] =
          Array.isArray(sec.passages) && sec.passages.length > 0
            ? sec.passages
            : sec.passage
              ? [sec.passage]
              : [];
        for (const block of blocks) {
          const passage = (await prisma.readingPassage.create({
            data: {
              title: block.title,
              content: block.contentJp,
              contentVi: block.contentVi ?? null,
              level: 'N2',
              libraryVisible: false,
              wordCount: block.wordCount ?? null,
              questions: {
                create: block.questions.map((q, i) => ({
                  ...buildMockTestN2QuestionData(q),
                  sortOrder: i + 1,
                })),
              },
            } as Prisma.ReadingPassageCreateInput,
            include: { questions: true },
          })) as ReadingPassage & { questions: Question[] };
          for (const q of passage.questions) {
            await prisma.mockTestQuestion.create({
              data: { sectionId: msec.id, questionId: q.id, order: ord++ },
            });
            qCount++;
          }
        }
      } else if (sec.kind === 'LISTENING') {
        for (const pass of sec.passages) {
          const audioUrl = pass.audioUrl?.trim() || DEFAULT_LISTENING_AUDIO_URL;
          const lp = (await prisma.listeningPassage.create({
            data: {
              title: pass.title,
              audioUrl,
              transcript: pass.transcript ?? null,
              duration: pass.duration ?? null,
              level: 'N2',
              libraryVisible: false,
              questions: {
                create: pass.questions.map((q, i) => ({
                  ...buildMockTestN2QuestionData(q),
                  sortOrder: i + 1,
                })),
              },
            } as Prisma.ListeningPassageCreateInput,
            include: { questions: true },
          })) as ListeningPassage & { questions: Question[] };
          for (const q of lp.questions) {
            await prisma.mockTestQuestion.create({
              data: { sectionId: msec.id, questionId: q.id, order: ord++ },
            });
            qCount++;
          }
        }
      }

      await prisma.mockTestSection.update({
        where: { id: msec.id },
        data: { questionCount: qCount },
      });
    }

    console.log('Mock test seeded:', test.title);
  }
}

async function main() {
  console.log('Seeding database...');

  // 1. Demo user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@jlpt.com' },
    update: {},
    create: {
      email: 'demo@jlpt.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });
  console.log('Created user:', user.email);

  // 2. Vocabulary from tu-vung-n2.json
  const vocabPath = path.join(DATA_DIR, 'tu-vung-n2.json');
  if (!fs.existsSync(vocabPath)) {
    console.warn('Skipping vocabulary: tu-vung-n2.json not found');
  } else {
    const vocabJson = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
    const vocabulary = vocabJson.vocabulary ?? [];
    let created = 0;
    for (const v of vocabulary) {
      const exists = await prisma.vocabulary.findFirst({
        where: { word: v.kanji, level: 'N2' },
      });
      if (!exists) {
        const nghiaViet = v.nghia_viet ?? v.nghia ?? '';
        const nghiaAnh = v.nghia_anh ?? v.nghia ?? nghiaViet;
        await prisma.vocabulary.create({
          data: {
            word: v.kanji,
            reading: v.hiragana ?? null,
            onyomiVi: v.am_han_viet ?? null,
            meaningEn: nghiaAnh,
            meaningVi: nghiaViet,
            level: 'N2',
          },
        });
        created++;
      }
    }
    console.log('Vocabulary:', created, 'new /', vocabulary.length, 'total');
  }

  // 3. Grammar from ngu-phap-n2.json
  const grammarPath = path.join(DATA_DIR, 'ngu-phap-n2.json');
  if (!fs.existsSync(grammarPath)) {
    console.warn('Skipping grammar: ngu-phap-n2.json not found');
  } else {
    const grammarJson = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));
    const patterns = grammarJson.patterns ?? [];
    let created = 0;
    let updated = 0;
    for (const g of patterns) {
      const title = Array.isArray(g.mau_ngu_phap) ? g.mau_ngu_phap[0] : g.mau_ngu_phap;
      const structure = Array.isArray(g.cach_dung) ? g.cach_dung[0] : g.cach_dung ?? '';
      const explanation = Array.isArray(g.y_nghia)
        ? g.y_nghia.join('\n')
        : String(g.y_nghia ?? '');
      const exampleJp = Array.isArray(g.vi_du)
        ? g.vi_du.length > 0
          ? g.vi_du.join('\n')
          : null
        : g.vi_du != null && String(g.vi_du).trim()
          ? String(g.vi_du)
          : null;

      const exists = await prisma.grammar.findFirst({ where: { title } });
      if (!exists) {
        await prisma.grammar.create({
          data: {
            title,
            structure,
            explanation,
            exampleJp,
            level: 'N2',
          },
        });
        created++;
      } else {
        await prisma.grammar.update({
          where: { id: exists.id },
          data: { structure, explanation, exampleJp },
        });
        updated++;
      }
    }
    console.log(
      'Grammar:',
      created,
      'new,',
      updated,
      'updated /',
      patterns.length,
      'total',
    );
  }

  // 4. Kanji from kanji-n2.json (enriched with kanji.js: strokeCount, onyomi, kunyomi)
  const kanjiPath = path.join(DATA_DIR, 'kanji-n2.json');
  if (!fs.existsSync(kanjiPath)) {
    console.warn('Skipping kanji: kanji-n2.json not found');
  } else {
    const kanjiJson = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
    const kanjiList = kanjiJson.kanji ?? [];
    let created = 0;
    let updated = 0;
    for (const k of kanjiList) {
      const character = k.kanji;
      const details = Kanji.getDetails(character);
      const onyomi = details?.onyomi?.length
        ? details.onyomi.join(', ')
        : null;
      const kunyomi = details?.kunyomi?.length
        ? details.kunyomi.join(', ')
        : null;
      const strokeCount = details?.stroke_count ?? 0;

      const exists = await prisma.kanji.findUnique({
        where: { character },
      });
      if (!exists) {
        await prisma.kanji.create({
          data: {
            character,
            meaning: k.nghia ?? '',
            onyomi,
            kunyomi,
            strokeCount,
            jlptLevel: 'N2',
          },
        });
        created++;
      } else if (exists.strokeCount === 0 && strokeCount > 0) {
        await prisma.kanji.update({
          where: { character },
          data: { onyomi, kunyomi, strokeCount },
        });
        updated++;
      }
    }
    console.log('Kanji:', created, 'new /', updated, 'updated /', kanjiList.length, 'total');
  }

  // 5. Reading passages from reading-n2.json (passage + footnotes + grammar + vocab + JP/VI questions)
  const readingPath = path.join(DATA_DIR, 'reading-n2.json');
  if (!fs.existsSync(readingPath)) {
    console.warn('Skipping reading: reading-n2.json not found');
  } else {
    const raw = JSON.parse(fs.readFileSync(readingPath, 'utf-8')) as unknown;
    const items = Array.isArray(raw) ? raw : [];
    let created = 0;
    let skipped = 0;

    type JsonQuestion = {
      order?: number;
      content?: string;
      options?: Record<string, string>;
      correctAnswer?: string;
      explanationJp?: string;
      explanationVi?: string;
    };

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      const p = row.passage as Record<string, unknown> | undefined;
      if (!p || typeof p.title !== 'string' || typeof p.contentJp !== 'string') continue;

      const exists = await prisma.readingPassage.findFirst({
        where: { title: p.title },
      });
      if (exists) {
        skipped++;
        continue;
      }

      const questionsJp = (row.questionsJp as JsonQuestion[]) ?? [];
      const questionsVi = (row.questionsVi as JsonQuestion[]) ?? [];
      const viByOrder = new Map<number, JsonQuestion>();
      for (const qv of questionsVi) {
        if (qv && typeof qv.order === 'number') viByOrder.set(qv.order, qv);
      }

      const footnotes = row.footnotes;
      const grammarInPassage = row.grammarInPassage;
      const vocabulary = row.vocabulary;

      await prisma.readingPassage.create({
        data: {
          title: p.title,
          content: p.contentJp,
          contentVi: typeof p.contentVi === 'string' ? p.contentVi : null,
          level: typeof p.level === 'string' ? p.level : 'N2',
          wordCount: typeof p.wordCount === 'number' ? p.wordCount : null,
          ...(Array.isArray(footnotes) ? { footnotes } : {}),
          ...(Array.isArray(grammarInPassage) ? { grammarInPassage } : {}),
          ...(Array.isArray(vocabulary) ? { vocabulary } : {}),
          questions: {
            create: questionsJp.map((q, idx) => {
              const order = typeof q?.order === 'number' ? q.order : idx + 1;
              const qv = viByOrder.get(order);
              return {
                type: 'READING' as const,
                content: String(q?.content ?? ''),
                options: q?.options ?? undefined,
                correctAnswer: String(q?.correctAnswer ?? ''),
                sortOrder: order,
                contentVi: qv?.content != null ? String(qv.content) : null,
                optionsVi: qv?.options ?? undefined,
                explanation: q?.explanationJp != null ? String(q.explanationJp) : null,
                explanationVi: qv?.explanationVi != null ? String(qv.explanationVi) : null,
              };
            }),
          },
        },
      });
      created++;
    }
    console.log('Reading:', created, 'created,', skipped, 'skipped (title exists)');
  }

  // 6. JLPT N2 mock tests (語彙・文法・読解・聴解) from mock-tests-n2.json
  const mockTestsPath = path.join(DATA_DIR, 'mock-tests-n2.json');
  if (!fs.existsSync(mockTestsPath)) {
    console.warn('Skipping mock tests: mock-tests-n2.json not found');
  } else {
    const mockRaw = JSON.parse(fs.readFileSync(mockTestsPath, 'utf-8')) as MockTestsN2Json;
    await seedMockTestsN2FromJson(mockRaw);
  }

  // 7. JLPT N2 本番相当フル模試（54+19+32問）from mock-tests-n2-full.json
  const mockFullPath = path.join(DATA_DIR, 'mock-tests-n2-full.json');
  if (!fs.existsSync(mockFullPath)) {
    console.warn('Skipping full mock test: mock-tests-n2-full.json not found (generate via scripts)');
  } else {
    const mockFullRaw = JSON.parse(fs.readFileSync(mockFullPath, 'utf-8')) as MockTestsN2Json;
    await seedMockTestsN2FromJson(mockFullRaw);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
