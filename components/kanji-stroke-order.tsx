'use client';

import { ExternalLink } from 'lucide-react';

const JISHO_URL = 'https://jisho.org/search';
const KANJIVG_VIEWER = 'https://kanjivg.tagaini.net/viewer.html';

interface KanjiStrokeOrderProps {
  character: string;
  strokeCount: number;
  className?: string;
}

export function KanjiStrokeOrder({ character, strokeCount, className = '' }: KanjiStrokeOrderProps) {
  const jishoUrl = `${JISHO_URL}/${encodeURIComponent(character)}%23kanji`;
  const kanjivgUrl = `${KANJIVG_VIEWER}?kanji=${encodeURIComponent(character)}`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8">
        <div className="flex h-32 w-32 items-center justify-center rounded border-2 bg-white shadow-sm">
          <span className="text-7xl font-medium text-foreground">{character}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{strokeCount} strokes</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={jishoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          View stroke order on Jisho
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href={kanjivgUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          View on KanjiVG
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
