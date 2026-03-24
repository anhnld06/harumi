'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Star } from 'lucide-react';
import { NoData } from '@/components/ui/no-data';
import { SpeakButton } from '@/components/speak-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Vocabulary } from '@/lib/db-types';

interface AccountBookmarksProps {
  userId: string;
}

export function AccountBookmarks({ userId }: AccountBookmarksProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBookmarks() {
    try {
      const res = await fetch('/api/vocab/bookmarks');
      const data = await res.json();
      if (res.ok) setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookmarks();
  }, []);

  async function handleUnbookmark(vocabularyId: string) {
    try {
      const res = await fetch('/api/vocab/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularyId }),
      });
      const data = await res.json();
      if (res.ok && !data.bookmarked) {
        setItems((prev) => prev.filter((i) => i.id !== vocabularyId));
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          {t('account.bookmarkedVocabulary')}
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {items.length} {t('account.bookmarksCount')}
        </span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="space-y-4">
            <NoData
              message={t('account.noBookmarks')}
              description={t('account.noBookmarksDesc')}
            />
            <Link href="/vocab">
              <Button variant="outline" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                {t('account.goToVocabulary')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <BookmarkVocabRow
                key={item.id}
                item={item}
                userId={userId}
                onUnbookmark={() => handleUnbookmark(item.id)}
              />
            ))}
          </div>
        )}
        {items.length > 0 && (
          <Link href="/vocab" className="mt-4 inline-flex">
            <Button variant="outline" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              {t('account.viewAllVocabulary')}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function BookmarkVocabRow({
  item,
  userId,
  onUnbookmark,
}: {
  item: Vocabulary;
  userId: string;
  onUnbookmark: () => void;
}) {
  async function handleBookmark() {
    if (!userId) return;
    try {
      const res = await fetch('/api/vocab/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularyId: item.id }),
      });
      const data = await res.json();
      if (res.ok && !data.bookmarked) onUnbookmark();
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-start justify-between rounded-lg border p-4 transition hover:bg-muted/50">
      <Link href={`/vocab?search=${encodeURIComponent(item.word)}`} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-medium">{item.word}</span>
          {item.reading && (
            <span className="text-sm text-muted-foreground">({item.reading})</span>
          )}
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
            {item.level}
          </span>
        </div>
        {item.onyomiVi && (
          <div className="mt-1 text-sm uppercase text-amber-600 dark:text-amber-500">
            {item.onyomiVi}
          </div>
        )}
        <p className="mt-1 text-muted-foreground">{item.meaningVi}</p>
        <p className="mt-1 text-muted-foreground">{item.meaningEn}</p>
        {item.exampleJp && (
          <p className="mt-2 text-sm italic text-muted-foreground">{item.exampleJp}</p>
        )}
      </Link>
      <div className="flex shrink-0 gap-1">
        <SpeakButton
          text={item.reading ?? ''}
          fallback={item.word}
          audioSrc={item.audioUrl ?? item.n2AudioSrc}
          variant="ghost"
          size="icon"
        />
        <Button variant="ghost" size="icon" onClick={handleBookmark} title="Remove bookmark">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />
        </Button>
      </div>
    </div>
  );
}
