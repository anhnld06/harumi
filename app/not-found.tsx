import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-100/95 via-fuchsia-50/90 to-cyan-50/60 px-6 py-16">

      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-violet-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-fuchsia-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100/50 blur-3xl"
        aria-hidden
      />

      {/* Ghost "404" watermark */}
      <span
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-bold leading-none text-slate-200/70"
        style={{ fontSize: 'clamp(160px, 30vw, 320px)' }}
        aria-hidden
      >
        404
      </span>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:gap-16">

        {/* Character */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <div
            className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'destination-in',
            }}
          >
            <Image
              src="/images/404.png"
              alt="Harumi is confused — page not found"
              width={420}
              height={560}
              priority
              className="object-contain mix-blend-multiply"
            />
          </div>
        </div>

        {/* Text side */}
        <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left max-w-md">
          <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-violet-600">
            Error 404
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Page Not Found
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It may have been moved,
            deleted, or the URL might be incorrect.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link href="/">
              <Button
                size="lg"
                className="rounded-full bg-slate-900 px-8 text-base text-white shadow-lg shadow-violet-600/20 hover:bg-slate-800"
              >
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Decorative dots */}
          <div className="mt-10 flex items-center gap-2" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
