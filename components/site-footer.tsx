'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, Lock } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/lib/i18n/language-context';
import { siteContact } from '@/lib/site-contact';
import { cn } from '@/lib/utils';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';

const aboutLinks: { key: string; href: string }[] = [
  { key: 'footer.linkBrandStory', href: '/' },
  { key: 'footer.linkFaqs', href: '/' },
  { key: 'footer.linkUserGuide', href: '/dashboard' },
  { key: 'footer.linkTerms', href: '/' },
  { key: 'footer.linkRefund', href: '/account' },
];

const quickLinks: { key: string; href: string }[] = [
  { key: 'nav.vocabulary', href: '/vocab' },
  { key: 'nav.kanji', href: '/kanji' },
  { key: 'nav.grammar', href: '/grammar' },
  { key: 'nav.reading', href: '/reading' },
  { key: 'nav.listening', href: '/listening' },
  { key: 'nav.mockTest', href: '/mock-test' },
];

function StoreBadge({
  children,
  href,
  className,
  title,
}: {
  children: ReactNode;
  href: string;
  className?: string;
  title?: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      title={title}
      className={cn(
        'flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800',
        href === '#' && 'pointer-events-none opacity-60',
        className
      )}
    >
      {children}
    </a>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className={cn('border-t border-slate-200 bg-white text-slate-700', className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Brand & contact */}
          <div className="space-y-5">
            <Logo href="/" height={28} width={112} />
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <a href={`mailto:${siteContact.email}`} className="text-slate-600 hover:text-violet-600">
                  {siteContact.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <a href={`tel:${siteContact.phone.replace(/\s/g, '')}`} className="text-slate-600 hover:text-violet-600">
                  {siteContact.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span className="text-slate-600">{siteContact.address}</span>
              </li>
              <li className="flex gap-2.5">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <a
                  href={siteContact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-violet-600"
                >
                  {siteContact.website.replace(/^https?:\/\//, '')}
                </a>
              </li>
            </ul>
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {t('footer.dmcaBadge')}
            </div>
          </div>

          {/* About & social */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('footer.aboutTitle')}</h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                {aboutLinks.map(({ key, href }) => (
                  <li key={key}>
                    <Link href={href} className="text-slate-600 transition hover:text-violet-600">
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('footer.socialTitle')}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={siteContact.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2] text-white transition hover:opacity-90"
                  aria-label="Facebook"
                >
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a
                  href={siteContact.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] text-white transition hover:opacity-90"
                  aria-label="Instagram"
                >
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a
                  href={siteContact.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white transition hover:opacity-90"
                  aria-label="TikTok"
                >
                  <SiTiktok className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Apps & quick links */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('footer.appSectionTitle')}</h3>
              <p className="mt-1 text-xs text-slate-500">{t('footer.appSectionHint')}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col">
                <StoreBadge href={siteContact.appStoreUrl} title={t('footer.comingSoon')}>
                  {t('footer.appStore')}
                </StoreBadge>
                <StoreBadge href={siteContact.googlePlayUrl} title={t('footer.comingSoon')}>
                  {t('footer.googlePlay')}
                </StoreBadge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('footer.quickLinksTitle')}</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {quickLinks.map(({ key, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-[11px] font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
                  >
                    {t(key)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
            <p>
              {t('footer.copyrightBelongsTo')} {siteContact.legalEntity}
            </p>
            <p>{t('footer.copyrightYearLine').replace('{{year}}', String(year))}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
