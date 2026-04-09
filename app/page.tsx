import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiteFooter } from '@/components/site-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingHeroBackdrop } from '@/components/landing/landing-hero-backdrop';
import { LandingHeroFigure } from '@/components/landing/landing-hero-figure';
import { LandingHeroSakura } from '@/components/landing/landing-hero-sakura';
import { cn } from '@/lib/utils';

/** In-page anchors only — app entry stays via Log in / Get started / feature cards. */
const navLinks = [
  { href: '#hero', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#study', label: 'Study' },
  { href: '#about', label: 'About' },
] as const;

const features = [
  { title: 'Vocabulary', desc: 'Flashcards, SRS-style reviews, and quizzes', href: '/vocab', icon: '📚' },
  { title: 'Kanji', desc: 'Readings, meanings, and stroke-level practice', href: '/kanji', icon: '漢' },
  { title: 'Grammar', desc: 'JLPT patterns with clear explanations', href: '/grammar', icon: '📝' },
  { title: 'Mock test', desc: 'Full-paper timing and scored results', href: '/mock-test', icon: '📋' },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f4f5fb] text-slate-900">
      <LandingHeader links={navLinks} />

      {/*
        First screen only: full viewport, full-bleed gradient (edge to edge).
        pt-16 accounts for fixed header so content is not hidden.
      */}
      <section id="hero" className="relative scroll-mt-20">
        <div className="relative min-h-[100dvh] w-full max-w-none pt-16">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-100/95 via-fuchsia-50/90 to-cyan-50/60"
            aria-hidden
          />
          <LandingHeroBackdrop />
          <LandingHeroSakura />

          <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl grid-cols-1 content-center items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-8">
            <div className="max-w-xl justify-self-start lg:py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
                Harumi · JLPT N2
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
                The smarter way to train for{' '}
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  JLPT N2
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-700">
                Vocabulary, kanji, grammar, reading, and listening in one place — with mock exams and an
                AI assistant when you need explanations. Track progress and study with purpose.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="rounded-full bg-slate-900 px-8 text-base text-white shadow-lg shadow-violet-600/20 hover:bg-slate-800"
                  >
                    Start learning free
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-slate-400/80 bg-white/80 px-8 text-base text-slate-900 backdrop-blur-sm hover:bg-white"
                  >
                    Open dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative z-10 flex min-h-[260px] w-full min-w-0 items-end justify-center sm:min-h-[320px] lg:min-h-[min(560px,62vh)]">
              <div className="hidden w-full min-w-0 justify-center lg:flex">
                <LandingHeroFigure pose="book" size="hero" blink priority />
              </div>
              <div className="flex w-full min-w-0 justify-center lg:hidden">
                <LandingHeroFigure pose="hand" size="hero" blink priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section
          id="features"
          className="scroll-mt-24 border-t border-slate-200/80 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything for N2 prep
              </h2>
              <p className="mt-4 text-slate-600">
                Explore each skill area in the app — flashcards, drills, reading and listening passages, and
                full mock exams with scoring.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((item) => (
                <Link key={item.href} href={item.href} className="group block h-full">
                  <div
                    className={cn(
                      'flex h-full flex-col rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-sm transition',
                      'hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/10'
                    )}
                  >
                    <span className="text-3xl" aria-hidden>
                      {item.icon}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-violet-700">
                      {item.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                    <span className="mt-4 text-sm font-medium text-violet-600 opacity-0 transition group-hover:opacity-100">
                      Open in app →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          id="study"
          className="scroll-mt-24 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white py-20 sm:py-24"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 flex justify-center lg:order-1">
              <LandingHeroFigure pose="hand" className="max-w-md lg:max-w-lg" blink />
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Study with Harumi
              </h2>
              <p className="text-lg text-slate-600">
                Your companion for structured JLPT N2 practice — from vocabulary drills to timed mock papers,
                with progress you can see week by week.
              </p>
              <ul className="space-y-3 text-slate-700">
                {[
                  'Reading & listening aligned with exam formats',
                  'Kanji and grammar with clear explanations',
                  'Mock tests with results and review',
                  'AI assistant for subscribers — ask when a point does not click',
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/register">
                  <Button className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
                    Create account
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" className="rounded-full border-slate-300">
                    See features
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div id="about" className="scroll-mt-24">
        <SiteFooter className="mt-auto border-t-0" />
      </div>
    </div>
  );
}
