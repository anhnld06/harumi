import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { SiteFooter } from '@/components/site-footer';

export default function HomePage() {
  /* Explicit light palette: global theme can be dark (system) but this page stays a light landing. */
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 text-slate-900">
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Logo href="/" height={30} width={120} priority />
          <div className="flex gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-violet-600 text-white hover:bg-violet-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Master Japanese.
            <br />
            <span className="text-violet-600">Pass JLPT N2.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Smart learning platform with flashcards, quizzes, mock tests, and AI-powered
            explanations. Track your progress and conquer the JLPT N2 exam.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-violet-600 px-8 text-white hover:bg-violet-700">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-300 bg-white/90 text-slate-900 hover:bg-slate-50 hover:text-slate-900"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-32 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Vocabulary', desc: 'Flashcards & quizzes', href: '/vocab', icon: '📚' },
            { title: 'Kanji', desc: 'Readings & meanings', href: '/kanji', icon: '漢' },
            { title: 'Grammar', desc: 'Structures & patterns', href: '/grammar', icon: '📝' },
            { title: 'Mock Test', desc: 'Real exam simulation', href: '/mock-test', icon: '📋' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="rounded-xl border border-slate-200/90 bg-white/95 p-6 text-slate-900 shadow-sm transition hover:shadow-md">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter className="mt-auto" />
    </div>
  );
}
