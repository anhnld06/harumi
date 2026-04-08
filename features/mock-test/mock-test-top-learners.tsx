'use client';

import { useMemo, useState } from 'react';
import { Crown, Sparkles, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import type { MockTestLeaderboardRow } from '@/server/services/mock-test-leaderboard.service';
import type { getMockTestLeaderboard } from '@/server/services/mock-test-leaderboard.service';

type LeaderboardBoard = Awaited<ReturnType<typeof getMockTestLeaderboard>>;
type Period = 'all' | 'week' | 'month';

function initials(name: string | null, userId: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (
        parts[0]![0]! + parts[parts.length - 1]![0]!
      ).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return userId.slice(0, 2).toUpperCase();
}

function displayName(name: string | null, fallback: string): string {
  const n = name?.trim();
  return n && n.length > 0 ? n : fallback;
}

/** Small pink downward triangle — rank 3 */
function PinkArrowDown({ className }: { className?: string }) {
  return (
    <svg
      className={cn('shrink-0', className)}
      width="12"
      height="10"
      viewBox="0 0 12 10"
      aria-hidden
    >
      <path d="M6 10 L0 0 L12 0 Z" fill="#f472b6" className="drop-shadow-sm" />
    </svg>
  );
}

/** Small pink upward triangle — rank 2 (mẫu podium) */
function PinkArrowUp({ className }: { className?: string }) {
  return (
    <svg
      className={cn('shrink-0', className)}
      width="12"
      height="10"
      viewBox="0 0 12 10"
      aria-hidden
    >
      <path d="M6 0 L0 10 L12 10 Z" fill="#f472b6" className="drop-shadow-sm" />
    </svg>
  );
}

const avatarGlow = {
  1: 'ring-[3px] ring-cyan-400/90 shadow-[0_0_8px_2px_rgba(34,211,238,0.35),0_0_28px_10px_rgba(34,211,238,0.45),0_12px_24px_rgba(0,0,0,0.45)]',
  2: 'ring-[3px] ring-amber-300/95 shadow-[0_0_6px_2px_rgba(250,204,21,0.35),0_0_22px_8px_rgba(245,158,11,0.4),0_10px_20px_rgba(0,0,0,0.4)]',
  3: 'ring-[3px] ring-amber-500/90 shadow-[0_0_6px_2px_rgba(251,191,36,0.3),0_0_18px_6px_rgba(217,119,6,0.35),0_8px_18px_rgba(0,0,0,0.4)]',
} as const;

/** Sidebar podium: between full default and old tiny compact */
const avatarGlowCompact = {
  1: 'ring-[2.5px] ring-cyan-400/90 shadow-[0_0_10px_2px_rgba(34,211,238,0.4),0_0_20px_rgba(34,211,238,0.25)]',
  2: 'ring-[2.5px] ring-amber-300/95 shadow-[0_0_8px_2px_rgba(250,204,21,0.38)]',
  3: 'ring-[2.5px] ring-amber-500/90 shadow-[0_0_8px_2px_rgba(251,191,36,0.32)]',
} as const;

function LearnerAvatar({
  name,
  userId,
  image,
  className,
  glowClass,
}: {
  name: string | null;
  userId: string;
  image: string | null;
  className?: string;
  glowClass: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={cn(
          'rounded-full bg-[#2d1b4e] object-cover',
          glowClass,
          className
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-[#2d1b4e] text-amber-300',
        glowClass,
        className
      )}
    >
      <User className="h-[55%] w-[55%] stroke-[2.5]" stroke="currentColor" fill="none" />
    </div>
  );
}

/** 3D trapezoid pedestal: yellow–orange gradient, white rank number */
function PodiumPedestal({
  rank,
  className,
  compact,
}: {
  rank: 1 | 2 | 3;
  className?: string;
  /** Narrow sidebar: shorter faces + smaller rank numeral */
  compact?: boolean;
}) {
  const config = (
    compact
      ? {
          1: {
            frontH: 'min-h-[5rem]',
            w: 'w-[6rem]',
            from: 'from-amber-200',
            via: 'via-amber-400',
            to: 'to-orange-600',
            lid: 'from-amber-100 to-amber-300',
            text: 'text-4xl',
          },
          2: {
            frontH: 'min-h-[4rem]',
            w: 'w-[5rem]',
            from: 'from-amber-300',
            via: 'via-amber-500',
            to: 'to-orange-700',
            lid: 'from-amber-200 to-amber-400',
            text: 'text-3xl',
          },
          3: {
            frontH: 'min-h-[3.5rem]',
            w: 'w-[4.5rem]',
            from: 'from-amber-400',
            via: 'via-amber-600',
            to: 'to-orange-900',
            lid: 'from-amber-300 to-amber-500',
            text: 'text-2xl',
          },
        }
      : {
          1: {
            frontH: 'min-h-[7rem] md:min-h-[7.5rem]',
            w: 'w-[6.75rem] md:w-[7.5rem]',
            from: 'from-amber-200',
            via: 'via-amber-400',
            to: 'to-orange-600',
            lid: 'from-amber-100 to-amber-300',
            text: 'text-5xl md:text-6xl',
          },
          2: {
            frontH: 'min-h-[5rem] md:min-h-[5.25rem]',
            w: 'w-[5.75rem] md:w-24',
            from: 'from-amber-300',
            via: 'via-amber-500',
            to: 'to-orange-700',
            lid: 'from-amber-200 to-amber-400',
            text: 'text-4xl md:text-5xl',
          },
          3: {
            frontH: 'min-h-[4rem] md:min-h-[4.25rem]',
            w: 'w-[5.25rem] md:w-[5.5rem]',
            from: 'from-amber-400',
            via: 'via-amber-600',
            to: 'to-orange-900',
            lid: 'from-amber-300 to-amber-500',
            text: 'text-3xl md:text-4xl',
          },
        }
  )[rank];

  return (
    <div className={cn('relative flex flex-col items-center', config.w, className)}>
      {/* Top “lid” — lighter plane for 3D read */}
      <div
        className={cn(
          'relative z-0 -mb-1 origin-bottom rounded-t-sm bg-gradient-to-r shadow-inner',
          compact ? 'h-2.5 w-[88%]' : 'h-3 w-[88%]',
          config.lid
        )}
        style={{
          transform: 'skewX(-6deg) scaleY(0.85)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.35)',
        }}
      />
      {/* Front trapezoid face */}
      <div
        className={cn(
          'relative z-10 flex w-full items-center justify-center bg-gradient-to-b shadow-[0_14px_28px_rgba(0,0,0,0.5),inset_0_-8px_16px_rgba(0,0,0,0.15)]',
          compact ? 'pb-1 pt-1.5' : 'pb-1 pt-2',
          config.frontH,
          config.from,
          config.via,
          config.to
        )}
        style={{
          clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0% 100%)',
        }}
      >
        {/* Light from top-center */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20"
          aria-hidden
        />
        <span
          className={cn(
            'relative z-10 font-orbitron font-black tabular-nums text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]',
            config.text
          )}
        >
          {rank}
        </span>
      </div>
    </div>
  );
}

function PodiumBlock({
  row,
  orderClass,
  currentUserId,
  labelLearner,
  labelYou,
  compact,
}: {
  row: MockTestLeaderboardRow;
  orderClass: string;
  currentUserId: string | null;
  labelLearner: string;
  labelYou: string;
  compact?: boolean;
}) {
  const isYou = currentUserId && row.userId === currentUserId;
  const rk = row.rank as 1 | 2 | 3;
  if (rk !== 1 && rk !== 2 && rk !== 3) return null;

  const nameLabel = displayName(row.name, labelLearner);
  const glow = compact ? avatarGlowCompact[rk] : avatarGlow[rk];
  // Mẫu: #1 lớn ~1.35–1.45× cạnh; #2 vừa; #3 nhỏ hơn #2 một chút
  const avatarSize = compact
    ? rk === 1
      ? 'h-[4.5rem] w-[4.5rem] sm:h-[5.25rem] sm:w-[5.25rem]'
      : rk === 2
        ? 'h-[3.35rem] w-[3.35rem] sm:h-14 sm:w-14'
        : 'h-[3.1rem] w-[3.1rem] sm:h-[3.35rem] sm:w-[3.35rem]'
    : rk === 1
      ? 'h-[5.5rem] w-[5.5rem] md:h-[6rem] md:w-[6rem]'
      : rk === 2
        ? 'h-[3.85rem] w-[3.85rem] md:h-[4.35rem] md:w-[4.35rem]'
        : 'h-[3.5rem] w-[3.5rem] md:h-16 md:w-16';

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-stretch origin-bottom',
        compact
          ? cn(
              'min-h-[15.5rem] w-[6.25rem]',
              rk === 1 && 'z-10',
              rk === 2 && 'z-[1]',
              rk === 3 && 'z-[1]'
            )
          : cn(
              'min-h-[17.5rem] w-[7.25rem] sm:min-h-[18.5rem] sm:w-[10rem]',
              rk === 1 && 'z-10',
              rk === 2 && 'z-[1]',
              rk === 3 && 'z-[1]'
            ),
        orderClass
      )}
    >
      {/* Bậc dọc: #1 kéo lên, #2 giữa, #3 đẩy xuống (kiểu “núi” như mẫu) */}
      <div
        className={cn(
          'flex w-full flex-col items-center px-0.5',
          rk === 1 && (compact ? '-mt-1.5 sm:-mt-2.5' : '-mt-2 md:-mt-5'),
          rk === 2 && (compact ? 'pt-1 sm:pt-1.5' : 'pt-1.5 md:pt-2.5'),
          rk === 3 && (compact ? 'pt-3 sm:pt-4' : 'pt-4 md:pt-6')
        )}
      >
        {/* Cố định chiều cao vùng crown / số+hình tam giác để 3 cột thẳng hàng */}
        <div
          className={cn(
            'flex w-full shrink-0 items-end justify-center pb-1.5',
            compact ? 'h-[2.125rem]' : 'h-10 sm:h-11'
          )}
        >
          {rk === 1 ? (
            <div className="relative flex items-center justify-center pb-2">
              <Crown
                className={cn(
                  'text-amber-300 [filter:drop-shadow(0_3px_8px_rgba(251,191,36,0.95))]',
                  compact ? 'h-10 w-10' : 'h-10 w-10 md:h-12 md:w-12'
                )}
                strokeWidth={1.35}
                aria-hidden
              />
              <div
                className={cn(
                  'absolute left-1/2 top-[42%] -translate-x-1/2 rounded-full bg-pink-400 shadow-[0_0_6px_#f472b6]',
                  compact ? 'h-1.5 w-1.5' : 'h-1.5 w-1.5'
                )}
              />
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <span
                className={cn(
                  'font-orbitron font-bold tabular-nums text-white drop-shadow-md',
                  compact ? 'text-xs' : 'text-sm'
                )}
              >
                {rk}
              </span>
              {rk === 2 ? (
                <PinkArrowUp className={compact ? 'h-2.5 w-3' : 'h-2.5 w-3'} />
              ) : (
                <PinkArrowDown className={compact ? 'h-2.5 w-3' : 'h-2.5 w-3'} />
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            'shrink-0',
            rk === 1 &&
              (compact
                ? 'origin-bottom scale-[1.06] sm:scale-[1.1]'
                : 'origin-bottom scale-[1.08] md:scale-[1.14]')
          )}
        >
          <LearnerAvatar
            name={row.name}
            userId={row.userId}
            image={row.image}
            glowClass={glow}
            className={avatarSize}
          />
        </div>

        <div className={cn('w-full max-w-full text-center font-orbitron', compact ? 'mt-2.5' : 'mt-3')}>
          <p
            className={cn(
              'w-full truncate font-medium text-white drop-shadow',
              compact ? 'text-[13px] leading-tight' : 'text-xs md:text-sm'
            )}
            title={nameLabel}
          >
            {nameLabel}
          </p>
          <p
            className={cn(
              'font-bold tabular-nums text-amber-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.35)]',
              compact ? 'mt-1 text-2xl' : 'mt-1 text-2xl md:text-3xl'
            )}
          >
            {row.percent}
            <span className={compact ? 'text-base font-bold' : 'text-lg font-bold'}>%</span>
          </p>
          <p
            className={cn(
              'font-medium tabular-nums text-amber-200/80',
              compact ? 'text-[11px]' : 'text-[10px]'
            )}
          >
            {row.score}/{row.totalScore}
          </p>
          <div className={cn('flex items-center justify-center', compact ? 'mt-1 min-h-[1.15rem]' : 'mt-1 min-h-[1.25rem]')}>
            {isYou ? (
              <span
                className={cn(
                  'rounded-full bg-amber-400/20 font-semibold uppercase tracking-wide text-amber-100',
                  compact ? 'px-2 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[9px]'
                )}
              >
                {labelYou}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-auto flex w-full shrink-0 justify-center pt-2">
        <PodiumPedestal rank={rk} compact={compact} />
      </div>
    </div>
  );
}

function GradientListRow({
  row,
  currentUserId,
  labelLearner,
  labelYou,
  compact,
}: {
  row: MockTestLeaderboardRow;
  currentUserId: string | null;
  labelLearner: string;
  labelYou: string;
  compact?: boolean;
}) {
  const isYou = currentUserId && row.userId === currentUserId;
  const nameLabel = displayName(row.name, labelLearner);

  return (
    <li
      className={cn(
        'flex items-center rounded-2xl bg-gradient-to-r from-[#6d28d9] via-[#5b21b6] to-[#4c1d95] shadow-md',
        'ring-1 ring-white/10 transition hover:brightness-110',
        compact ? 'gap-2 px-3 py-2.5' : 'gap-3 px-4 py-3.5',
        isYou && 'ring-2 ring-amber-300/80'
      )}
    >
      <span
        className={cn(
          'shrink-0 font-orbitron font-black tabular-nums text-amber-200/70',
          compact ? 'w-5 text-center text-sm' : 'text-lg'
        )}
      >
        {row.rank}
      </span>
      <LearnerAvatar
        name={row.name}
        userId={row.userId}
        image={row.image}
        glowClass="ring-2 ring-white/30 shadow-lg shadow-black/30"
        className={cn('shrink-0 text-xs', compact ? 'h-9 w-9' : 'h-11 w-11')}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate font-orbitron font-semibold text-white',
            compact ? 'text-xs leading-snug' : 'text-sm'
          )}
          title={nameLabel}
        >
          {nameLabel}
        </p>
        {isYou && (
          <p className={cn('font-medium text-amber-200/80', compact ? 'text-[9px]' : 'text-[10px]')}>
            {labelYou}
          </p>
        )}
      </div>
      <div className="shrink-0 whitespace-nowrap text-right font-orbitron">
        <p className={cn('font-black tabular-nums text-amber-300', compact ? 'text-lg' : 'text-xl')}>
          {row.percent}
          <span className={compact ? 'text-xs' : 'text-sm'}>%</span>
        </p>
        <p
          className={cn(
            'font-medium tabular-nums text-violet-200/80',
            compact ? 'text-[9px]' : 'text-[10px]'
          )}
        >
          {row.score}/{row.totalScore}
        </p>
      </div>
    </li>
  );
}

export function MockTestTopLearners({
  boards,
  currentUserId,
  variant = 'default',
}: {
  boards: Record<Period, LeaderboardBoard>;
  currentUserId: string | null;
  /** `compact`: same podium UI, scaled down for narrow sidebar. */
  variant?: 'default' | 'compact';
}) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>('all');

  const data = boards[period];
  const top = data.top;
  const compact = variant === 'compact';

  const tabs = useMemo(
    () =>
      [
        { id: 'all' as const, label: t('mockTest.leaderboard.periodAll') },
        { id: 'week' as const, label: t('mockTest.leaderboard.periodWeek') },
        { id: 'month' as const, label: t('mockTest.leaderboard.periodMonth') },
      ] as const,
    [t]
  );

  const first = top.find((r) => r.rank === 1);
  const second = top.find((r) => r.rank === 2);
  const third = top.find((r) => r.rank === 3);
  const rest = top.filter((r) => r.rank > 3);

  return (
    <div
      className={cn(
        'relative overflow-hidden ring-1 ring-white/10',
        compact
          ? 'rounded-3xl shadow-xl shadow-violet-950/40'
          : 'rounded-[28px] shadow-[0_20px_50px_-12px_rgba(76,29,149,0.55)]'
      )}
    >
      {/* Deep purple + organic waves */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#12051f] via-[#2d1250] to-[#6b21a8]"
        aria-hidden
      />
      <div
        className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-[80px]"
        aria-hidden
      />
      <div
        className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-violet-500/25 blur-[90px]"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/4 h-64 w-96 -translate-x-1/2 rounded-full bg-purple-600/20 blur-[70px]"
        aria-hidden
      />
      {/* Dotted blocks — sides */}
      <div
        className="absolute left-3 top-24 h-40 w-20 rounded-2xl opacity-[0.45] [background-image:radial-gradient(rgba(216,180,254,0.5)_1.5px,transparent_1.5px)] [background-size:10px_10px] md:left-6"
        aria-hidden
      />
      <div
        className="absolute right-3 top-32 h-36 w-20 rounded-2xl opacity-[0.45] [background-image:radial-gradient(rgba(216,180,254,0.5)_1.5px,transparent_1.5px)] [background-size:10px_10px] md:right-6"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.28] [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:14px_14px]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 top-1/2 opacity-25 [background:radial-gradient(ellipse_at_50%_0%,rgba(253,224,71,0.12),transparent_55%)]"
        aria-hidden
      />

      <div className="relative flex flex-col">
        <div className={cn(compact ? 'px-3 pb-4 pt-5 sm:px-4' : 'px-3 pb-5 pt-6 sm:px-6')}>
          <p
            className={cn(
              'text-center font-orbitron font-semibold uppercase text-violet-200/80',
              compact ? 'text-[10px] tracking-[0.28em]' : 'text-[10px] tracking-[0.35em]'
            )}
          >
            {t('mockTest.leaderboardHeading')}
          </p>
          <h2
            className={cn(
              'text-center font-orbitron font-black uppercase tracking-tight text-white drop-shadow-md',
              compact ? 'mt-1 text-xl sm:text-2xl' : 'mt-1 text-2xl sm:text-3xl'
            )}
          >
            {t('mockTest.leaderboardTitle')}
          </h2>

          <div
            className={cn(
              'mx-auto flex justify-center gap-1 rounded-full bg-black/25 ring-1 ring-white/10',
              compact ? 'mt-4 max-w-full p-1' : 'mt-5 max-w-md p-1'
            )}
          >
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPeriod(id)}
                className={cn(
                  'flex-1 rounded-full text-center font-orbitron font-bold transition',
                  compact ? 'px-2 py-2 text-[10px] sm:text-xs' : 'px-2 py-2 text-[11px] sm:text-xs',
                  period === id
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-900/40'
                    : 'text-violet-100/90 hover:bg-white/10'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium — centered, items-end */}
        <div
          className={cn(
            'relative flex min-h-[1px] justify-center',
            compact ? 'px-2 pb-7 pt-4 sm:px-3' : 'px-2 pb-8 pt-4 sm:px-6'
          )}
        >
          {top.length === 0 ? (
            <div
              className={cn(
                'flex flex-col items-center text-center',
                compact ? 'gap-3 px-2 py-8' : 'gap-3 px-4 py-10'
              )}
            >
              <div
                className={cn(
                  'rounded-2xl bg-white/10 ring-1 ring-white/10',
                  compact ? 'p-4' : 'p-4'
                )}
              >
                <Trophy
                  className={cn('text-amber-200/70', compact ? 'h-9 w-9' : 'h-10 w-10')}
                  aria-hidden
                />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-violet-100/85">
                {t('mockTest.leaderboardEmpty')}
              </p>
            </div>
          ) : (
            <>
              {(first || second || third) && (
                <div
                  className={cn(
                    'flex w-full items-stretch justify-center',
                    compact
                      ? 'max-w-full flex-nowrap gap-3 pb-2 pt-2'
                      : 'max-w-2xl flex-wrap gap-2 pb-2 pt-2 sm:gap-4 md:gap-8'
                  )}
                >
                  {second && (
                    <PodiumBlock
                      row={second}
                      orderClass="order-1"
                      currentUserId={currentUserId}
                      labelLearner={t('mockTest.leaderboardLearner')}
                      labelYou={t('mockTest.leaderboardYou')}
                      compact={compact}
                    />
                  )}
                  {first && (
                    <PodiumBlock
                      row={first}
                      orderClass="order-2"
                      currentUserId={currentUserId}
                      labelLearner={t('mockTest.leaderboardLearner')}
                      labelYou={t('mockTest.leaderboardYou')}
                      compact={compact}
                    />
                  )}
                  {third && (
                    <PodiumBlock
                      row={third}
                      orderClass="order-3"
                      currentUserId={currentUserId}
                      labelLearner={t('mockTest.leaderboardLearner')}
                      labelYou={t('mockTest.leaderboardYou')}
                      compact={compact}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {top.length > 0 && (
          <div
            className={cn(
              'relative -mt-2 bg-gradient-to-b from-white to-violet-50/90 shadow-[0_-10px_40px_rgba(0,0,0,0.35)] dark:from-slate-950 dark:to-slate-900/95',
              compact ? 'rounded-t-[24px] px-3 pb-5 pt-4 sm:px-4' : 'rounded-t-[32px] px-4 pb-6 pt-4'
            )}
          >
            <div
              className={cn(
                'mx-auto rounded-full bg-violet-200/80 dark:bg-violet-700/50',
                compact ? 'mb-3 h-1 w-10' : 'mb-3 h-1 w-12'
              )}
            />
            <p
              className={cn(
                'text-center leading-relaxed text-muted-foreground',
                compact ? 'mb-3 px-1 text-[10px] sm:text-[11px]' : 'mb-4 text-[11px]'
              )}
            >
              {t('mockTest.leaderboardSubtitle')}
            </p>

            {rest.length > 0 && (
              <ul className={cn(compact ? 'space-y-1.5' : 'space-y-1.5')}>
                {rest.map((row) => (
                  <GradientListRow
                    key={`${period}-${row.userId}`}
                    row={row}
                    currentUserId={currentUserId}
                    labelLearner={t('mockTest.leaderboardLearner')}
                    labelYou={t('mockTest.leaderboardYou')}
                    compact={compact}
                  />
                ))}
              </ul>
            )}

            {currentUserId &&
              data.currentUserRank != null &&
              data.currentUserPercent != null &&
              !data.currentUserInTop && (
                <div
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-50 to-violet-50 text-center font-orbitron font-semibold text-violet-950 shadow-inner dark:from-violet-950/80 dark:to-slate-900 dark:text-amber-100',
                    compact ? 'mt-4 px-3 py-2.5 text-[11px] leading-snug sm:text-xs' : 'mt-4 px-4 py-3 text-sm'
                  )}
                >
                  <Sparkles
                    className={cn(
                      'shrink-0 text-amber-500 dark:text-amber-300',
                      compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
                    )}
                  />
                  <span>
                    {t('mockTest.leaderboardYourRank')
                      .replace('{{rank}}', String(data.currentUserRank))
                      .replace('{{percent}}', String(data.currentUserPercent))}
                  </span>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
