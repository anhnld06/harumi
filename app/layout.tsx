import type { Metadata } from 'next';
import { Alex_Brush, Great_Vibes, Inter, Niconne, Orbitron } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});

/** Certificate recipient name fonts (template 1–3). Used via CSS variables on <html>. */
const certNameFont1 = Alex_Brush({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-cert-name-1',
});
/** “New Icon Script” (Canva) is not on Google Fonts — Niconne is the closest script on Google Fonts. */
const certNameFont2 = Niconne({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-cert-name-2',
});
const certNameFont3 = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-cert-name-3',
});

export const metadata: Metadata = {
  title: 'Harumi - JLPT N2 Smart Trainer',
  description: 'Master Japanese - Pass JLPT N2 with smart learning. Harumi helps you conquer the exam with flashcards, quizzes, and AI-powered explanations.',
  icons: {
    icon: '/images/harumi-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${certNameFont1.variable} ${certNameFont2.variable} ${certNameFont3.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
