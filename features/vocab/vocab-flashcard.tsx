'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SpeakButton } from '@/components/speak-button';

interface VocabItem {
  id: string;
  word: string;
  reading: string | null;
  onyomiVi: string | null;
  meaningEn: string;
  meaningVi: string | null;
  exampleJp: string | null;
  exampleEn: string | null;
}

interface VocabFlashcardProps {
  userId: string;
  page?: number;
  search?: string;
}

export function VocabFlashcard({ userId, page = 1, search }: VocabFlashcardProps) {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (search) params.set('search', search);
    fetch(`/api/vocab/flashcards?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setIndex(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center py-12">
          <p className="text-muted-foreground">Loading flashcards...</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center py-12">
          <p className="text-muted-foreground">
            No vocabulary available. Run database seed first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const current = items[index];

  function handleCorrect() {
    if (userId && current) {
      fetch('/api/vocab/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularyId: current.id, correct: true }),
      });
    }
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, items.length - 1));
  }

  function handleWrong() {
    if (userId && current) {
      fetch('/api/vocab/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularyId: current.id, correct: false }),
      });
    }
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, items.length - 1));
  }

  return (
    <div className="space-y-4">
      <Card
        className="cursor-pointer select-none transition"
        onClick={() => setFlipped((f) => !f)}
      >
        <CardHeader className="text-center">
          <p className="text-sm text-muted-foreground">
            {index + 1} / {items.length} — Click to flip
          </p>
        </CardHeader>
        <CardContent className="min-h-[180px] text-center">
          <div className="text-3xl font-bold">{current.word}</div>
          <SpeakButton
              text={current.reading ?? ''}
              fallback={current.word}
              stopPropagation={true}
              className='mt-2'
            />
          {current.reading && (
            <div className="mt-2 text-lg text-muted-foreground">{current.reading}</div>
          )}
          {current.onyomiVi && (
            <div className="mt-2 text-sm uppercase text-amber-600 dark:text-amber-500">
              {current.onyomiVi}
            </div>
          )}
          {flipped && (
            <div className="mt-6 space-y-2">
              <div className="text-xl text-primary">{current.meaningEn}</div>
              {current.meaningVi && (
                <div className="text-muted-foreground">{current.meaningVi}</div>
              )}
              {current.exampleJp && (
                <div className="mt-4 text-sm italic">{current.exampleJp}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setFlipped(false);
            setIndex((i) => Math.max(0, i - 1));
          }}
          disabled={index === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleWrong}>
            Wrong
          </Button>
          <Button onClick={handleCorrect}>Correct</Button>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setFlipped(false);
            setIndex((i) => Math.min(items.length - 1, i + 1));
          }}
          disabled={index >= items.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
