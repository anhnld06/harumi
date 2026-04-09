'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Search, Star } from 'lucide-react';
import { NoData } from '@/components/ui/no-data';
import { SpeakButton } from '@/components/speak-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Vocabulary } from '@/lib/db-types';

interface VocabularyListProps {
  items: Vocabulary[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  userId: string;
  bookmarkIds?: string[];
}

export function VocabularyList({
  items,
  total,
  page,
  totalPages,
  search,
  userId,
  bookmarkIds = [],
}: VocabularyListProps) {
  const [searchVal, setSearchVal] = useState(search);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form action="/vocab" method="get" className="flex gap-2">
            <Input
              name="search"
              placeholder="Search ..."
              className="pl-9"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
        <Link
          href={
            '/vocab?mode=flashcard' +
            (page > 1 ? `&page=${page}` : '') +
            (search ? `&search=${encodeURIComponent(search)}` : '') +
            '&returnTo=' +
            encodeURIComponent(
              '/vocab' +
                (page > 1 || search
                  ? '?' +
                    new URLSearchParams({
                      ...(page > 1 && { page: String(page) }),
                      ...(search && { search }),
                    }).toString()
                  : '')
            )
          }
        >
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Flashcards
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>N2 Vocabulary ({total} words)</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <NoData
              message={'No data found'}
              description={search ? `Try a different keyword for "${search}"` : 'No vocabulary found'}
            />
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <VocabRow
                  key={item.id}
                  item={item}
                  userId={userId}
                  initialBookmarked={bookmarkIds.includes(item.id)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link href={`/vocab?page=${page - 1}${search ? `&search=${search}` : ''}`}>
                  <Button variant="outline" size="sm" disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/vocab?page=${page + 1}${search ? `&search=${search}` : ''}`}>
                  <Button variant="outline" size="sm" disabled={page >= totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VocabRow({
  item,
  userId,
  initialBookmarked = false,
}: {
  item: Vocabulary;
  userId: string;
  initialBookmarked?: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);

  async function handleBookmark() {
    if (!userId || bookmarkSaving) return;
    setBookmarkSaving(true);
    try {
      const res = await fetch('/api/vocab/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularyId: item.id }),
      });
      const data = await res.json();
      if (res.ok) setBookmarked(data.bookmarked);
    } catch {
      // ignore
    } finally {
      setBookmarkSaving(false);
    }
  }

  return (
    <div className="flex items-start justify-between rounded-lg border p-4 transition hover:bg-muted/50">
      <div>
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
      </div>
      <div className="flex shrink-0 gap-1">
        <SpeakButton
          text={item.reading ?? ''}
          fallback={item.word}
          audioSrc={item.audioUrl ?? item.n2AudioSrc}
          variant="ghost"
          size="icon"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void handleBookmark()}
          disabled={bookmarkSaving}
          aria-busy={bookmarkSaving}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {bookmarkSaving ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
          ) : (
            <Star className={`h-5 w-5 ${bookmarked ? 'fill-yellow-400 text-yellow-500' : ''}`} />
          )}
        </Button>
      </div>
    </div>
  );
}
