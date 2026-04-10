'use client';

import Image from 'next/image';
import { useState } from 'react';
import { nhkLessonOgImageUrl } from '@/lib/conversation/lessons';
import { cn } from '@/lib/utils';

type Props = {
  lessonId: number;
  title: string;
};

export function ConversationLessonThumb({ lessonId, title }: Props) {
  const [broken, setBroken] = useState(false);
  const src = nhkLessonOgImageUrl(lessonId);

  if (broken) {
    return (
      <div
        className={cn(
          'h-full w-full bg-gradient-to-br from-emerald-50 via-teal-50/90 to-cyan-50/80',
          'dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/20'
        )}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      className="object-cover transition duration-300 group-hover:scale-[1.03]"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      onError={() => setBroken(true)}
      title={title}
    />
  );
}
