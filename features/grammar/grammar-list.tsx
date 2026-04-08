'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { NoData } from '@/components/ui/no-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Grammar } from '@/lib/db-types';

interface GrammarListProps {
  items: Grammar[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
}

export function GrammarList({
  items,
  total,
  page,
  totalPages,
  search,
}: GrammarListProps) {
  return (
    <div className="space-y-4">
      <form action="/grammar" method="get" className="flex gap-2">
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
          <CardTitle>N2 Grammar ({total} patterns)</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <NoData
              message={'No data found'}
              description={search ? `Try a different keyword for "${search}"` : 'No grammar found'}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                const returnTo =
                  '/grammar' +
                  (page > 1 || search
                    ? '?' + new URLSearchParams({
                        ...(page > 1 && { page: String(page) }),
                        ...(search && { search }),
                      }).toString()
                    : '');
                return (
                  <Link
                    key={item.id}
                    href={`/grammar/${item.id}?returnTo=${encodeURIComponent(returnTo)}`}
                    className="block"
                  >
                  <div className="rounded-lg border px-4 pt-4 pb-4 transition hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm font-mono text-primary">{item.structure}</p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {item.explanation}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                        N2
                      </span>
                    </div>
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
                <Link href={`/grammar?page=${page - 1}${search ? `&search=${search}` : ''}`}>
                  <Button variant="outline" size="sm" disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/grammar?page=${page + 1}${search ? `&search=${search}` : ''}`}>
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
