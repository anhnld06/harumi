'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { Toaster } from '@/components/ui/toaster';
import { JapaneseHandbookFab } from '@/components/japanese-handbook-fab';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          {children}
          <JapaneseHandbookFab />
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
