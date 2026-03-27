import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { ReadingPractice } from '@/features/reading/reading-practice';
import { getReadingVocabAudioSrc } from '@/lib/n2-static-audio';

export default async function ReadingPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const passage = await prisma.readingPassage.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!passage) notFound();
  const orderedIds = await prisma.readingPassage.findMany({
    where: { level: passage.level },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  const currentIndex = orderedIds.findIndex((p) => p.id === passage.id);
  const prevId = currentIndex > 0 ? orderedIds[currentIndex - 1].id : null;
  const nextId =
    currentIndex >= 0 && currentIndex < orderedIds.length - 1
      ? orderedIds[currentIndex + 1].id
      : null;
  const vocabRows = Array.isArray(passage.vocabulary)
    ? (passage.vocabulary as Array<unknown>)
    : [];
  const readingVocabAudioSrc = vocabRows.map((_, idx) =>
    getReadingVocabAudioSrc(passage.title, idx),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <Link href="/reading">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <header className="space-y-2 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
            {passage.level}
          </span>
          {passage.contentVi ? (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              JP + VI
            </span>
          ) : null}
        </div>
        <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">{passage.title}</h1>
        <p className="text-sm text-muted-foreground">
          {passage.wordCount != null
            ? `${passage.wordCount.toLocaleString()} words`
            : '—'}
        </p>
      </header>

      <ReadingPractice
        passage={passage}
        questions={passage.questions}
        readingVocabAudioSrc={readingVocabAudioSrc}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        {prevId ? (
          <Link href={`/reading/${prevId}`}>
            <Button variant="outline" className="gap-1.5 rounded-full">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="gap-1.5 rounded-full" disabled>
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        )}
        {nextId ? (
          <Link href={`/reading/${nextId}`}>
            <Button variant="outline" className="gap-1.5 rounded-full">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="gap-1.5 rounded-full" disabled>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
