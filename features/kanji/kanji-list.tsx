'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { NoData } from '@/components/ui/no-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Kanji } from '@/lib/db-types';

interface KanjiListProps {
  items: Kanji[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
}

export function KanjiList({
  items,
  total,
  page,
  totalPages,
  search,
}: KanjiListProps) {
  return (
    <div className="space-y-4">
      <form action="/kanji" method="get" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search ..."
            className="pl-9"
            defaultValue={search}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>N2 Kanji ({total} characters)</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <NoData
              description={search ? `Try a different keyword for "${search}"` : 'No kanji found'}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const returnTo =
                  '/kanji' +
                  (page > 1 || search
                    ? '?' + new URLSearchParams({
                        ...(page > 1 && { page: String(page) }),
                        ...(search && { search }),
                      }).toString()
                    : '');
                return (
                  <Link
                    key={item.id}
                    href={`/kanji/${item.id}?returnTo=${encodeURIComponent(returnTo)}`}
                  >
                  <div className="rounded-lg border p-4 transition hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <span className="text-4xl font-medium">{item.character}</span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        {item.strokeCount} strokes
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{item.meaning}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.onyomi && `音: ${item.onyomi}`}
                      {item.onyomi && item.kunyomi && ' | '}
                      {item.kunyomi && `訓: ${item.kunyomi}`}
                    </p>
                  </div>
                </Link>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link href={`/kanji?page=${page - 1}${search ? `&search=${search}` : ''}`}>
                  <Button variant="outline" size="sm" disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/kanji?page=${page + 1}${search ? `&search=${search}` : ''}`}>
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
