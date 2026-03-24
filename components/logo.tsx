'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

interface LogoProps {
  href?: string;
  className?: string;
  height?: number;
  width?: number;
  priority?: boolean;
  variant?: 'full' | 'icon';
}

export function Logo({
  href = '/',
  className,
  height = 30,
  width = 120,
  priority = false,
  variant = 'full',
}: LogoProps) {
  const src = variant === 'icon' ? '/images/icon-lg.png' : '/images/harumi-logo.png';
  const img = (
    <Image
      src={src}
      alt="Harumi - JLPT N2 Smart Trainer"
      height={height}
      width={width}
      priority={priority}
      className="max-h-full w-auto object-contain"
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
          className
        )}
      >
        {img}
      </Link>
    );
  }

  return img;
}
