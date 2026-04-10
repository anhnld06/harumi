'use client';

import { Play } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  CONVERSATION_LESSONS,
  externalConversationVideoUrl,
  lessonPhraseSub,
  lessonTitle,
} from '@/lib/conversation/lessons';
import { ConversationLessonThumb } from '@/features/conversation/conversation-lesson-thumb';
import { cn } from '@/lib/utils';

const BAR = '#6eb89a';
const BAR_ACCENT = '#3f9d7f';

export function ConversationLessonGrid() {
  const { locale, t } = useLanguage();

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">{t('conversation.disclaimer')}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CONVERSATION_LESSONS.map((lesson) => {
          const href = externalConversationVideoUrl(lesson.id);
          const title = lessonTitle(lesson, locale);
          const sub = lessonPhraseSub(lesson, locale);
          return (
            <a
              key={lesson.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('conversation.openVideo')}: #${lesson.id} ${title}`}
              className={cn(
                'group block overflow-hidden rounded-lg border border-border/80 bg-card text-left shadow-sm',
                'transition hover:border-primary/25 hover:shadow-md'
              )}
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                <ConversationLessonThumb lessonId={lesson.id} title={title} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-white/90 transition group-hover:scale-105 dark:ring-zinc-900">
                  <Play className="h-5 w-5 fill-white text-white" aria-hidden />
                </div>
              </div>
              <div
                className="flex min-h-[48px] items-stretch text-[13px] font-semibold leading-snug text-white"
                style={{ backgroundColor: BAR }}
              >
                <div
                  className="flex w-11 shrink-0 items-center justify-center text-sm tabular-nums"
                  style={{ backgroundColor: BAR_ACCENT }}
                >
                  #{lesson.id}
                </div>
                <div className="flex flex-1 items-center px-2.5 py-2">{title}</div>
              </div>
              <div className="space-y-1.5 p-3">
                <p className="text-sm font-medium leading-snug text-foreground">{lesson.phraseJa}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{sub}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
