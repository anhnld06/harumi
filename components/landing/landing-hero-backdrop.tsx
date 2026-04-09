/**
 * Light tech backdrop behind the mascot — blobs + soft grid (no fake UI cards).
 */
export function LandingHeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.3] motion-reduce:opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.22) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse 130% 100% at 50% 45%, rgb(0 0 0 / 0.92) 35%, transparent 88%)',
        }}
      />
      <div className="absolute -left-[10%] top-[5%] h-[55%] w-[55%] rounded-full bg-gradient-to-br from-violet-400/40 via-fuchsia-400/30 to-transparent blur-3xl motion-reduce:animate-none animate-landingBlobA" />
      <div className="absolute -right-[6%] bottom-[8%] h-[48%] w-[48%] rounded-full bg-gradient-to-tr from-cyan-400/25 via-violet-300/22 to-transparent blur-3xl motion-reduce:animate-none animate-landingBlobB" />
    </div>
  );
}
