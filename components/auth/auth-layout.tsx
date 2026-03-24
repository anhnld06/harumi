'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  type: 'login' | 'signup';
}

export function AuthLayout({ children, type }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Background image - cyberpunk gradient with glowing elements */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/bg.png)' }}
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/40" />

      {/* Navbar - Home only */}
      <nav className="absolute left-6 right-6 top-6 z-20 flex items-center justify-end">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-white/90 transition hover:text-white"
        >
          Home
        </Link>
      </nav>

      {/* Left: Hero character */}
      <div className="relative hidden w-1/2 items-center justify-center lg:flex">
        <div className="relative z-10">
          <div className="relative">
            <div className="absolute inset-0 -m-8 animate-pulse rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="relative flex items-center justify-center">
              <Image
                src="/images/cyberpunk.png"
                alt="Cyberpunk character"
                width={480}
                height={640}
                priority
                className="relative z-10 max-h-[500px] w-auto object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form - Logo trên các text */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-10 lg:w-1/2">
        <Logo href="/" height={44} width={140} className="mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" />
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
