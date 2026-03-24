import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getVocabularyList,
  getBookmarkIdsForVocab,
} from '@/server/services/vocabulary.service';
import { VocabularyList } from '@/features/vocab/vocabulary-list';
import { VocabFlashcard } from '@/features/vocab/vocab-flashcard';
import { Button } from '@/components/ui/button';

export default async function VocabPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; page?: string; search?: string; returnTo?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const mode = params.mode ?? 'list';
  const returnTo = params.returnTo;
  const backHref =
    returnTo && returnTo.startsWith('/vocab') && !returnTo.includes('//')
      ? returnTo
      : '/vocab';
  const page = parseInt(params.page ?? '1', 10);
  const search = params.search ?? '';

  if (mode === 'flashcard') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="-ml-2 gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Flashcards</h1>
        </div>
        <VocabFlashcard
          userId={session?.user?.id ?? ''}
          page={page}
          search={search}
        />
      </div>
    );
  }

  const { items, total, totalPages } = await getVocabularyList({
    level: 'N2',
    search: search || undefined,
    page,
    limit: 20,
  });

  const bookmarkIds =
    session?.user?.id && items.length > 0
      ? await getBookmarkIdsForVocab(
          session.user.id,
          items.map((i) => i.id)
        )
      : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vocabulary</h1>
      <VocabularyList
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
        userId={session?.user?.id ?? ''}
        bookmarkIds={bookmarkIds}
      />
    </div>
  );
}
