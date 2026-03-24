'use client';

import { CreditCard, FileText, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';

type SubscriptionEventType = 'trialStarted' | 'trialEnded' | 'upgraded' | 'downgraded';

interface SubscriptionEvent {
  id: string;
  type: SubscriptionEventType;
  fromPlan: string;
  toPlan: string;
  timestamp: string;
}

interface Invoice {
  id: string;
  status: 'draft' | 'paid' | 'pending';
  date: string;
  amount: string;
}

const MOCK_SUBSCRIPTION_EVENTS: SubscriptionEvent[] = [
  { id: '1', type: 'trialEnded', fromPlan: 'Pro', toPlan: 'Free', timestamp: '14:00 12/03/2026' },
  { id: '2', type: 'trialStarted', fromPlan: 'Free', toPlan: 'Pro', timestamp: '10:30 05/03/2026' },
  { id: '3', type: 'trialStarted', fromPlan: 'Free', toPlan: 'Pro', timestamp: '09:15 05/03/2026' },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-1772086733720-679', status: 'draft', date: '26/02/2026', amount: '99.000 VND' },
];

function getEventIcon(type: SubscriptionEventType) {
  switch (type) {
    case 'trialEnded':
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case 'trialStarted':
    case 'upgraded':
    case 'downgraded':
    default:
      return <Sparkles className="h-4 w-4 text-muted-foreground" />;
  }
}

export function AccountPackageHistory() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Subscription History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            {t('account.subscriptionHistory')}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {MOCK_SUBSCRIPTION_EVENTS.length} {t('account.events')}
          </span>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4">
            <div className="absolute left-[11px] top-6 bottom-6 w-px bg-border" />
            {MOCK_SUBSCRIPTION_EVENTS.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary/10 shadow-sm">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 rounded-lg border bg-card p-4">
                  <p className="mb-2 font-medium">{t(`account.event.${event.type}`)}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      {event.fromPlan}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      {event.toPlan}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            {t('account.invoices')}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {MOCK_INVOICES.length} {t('account.invoicesCount')}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_INVOICES.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t('account.noInvoices')}
              </div>
            ) : (
              MOCK_INVOICES.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center gap-4 rounded-lg border bg-card p-4"
                >
                  <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{invoice.id}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          invoice.status === 'draft'
                            ? 'bg-muted text-muted-foreground'
                            : invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {t(`account.invoiceStatus.${invoice.status}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">{invoice.date}</span>
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold">{invoice.amount}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
