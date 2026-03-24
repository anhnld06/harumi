'use client';

import { useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ThemeSwitch } from '@/components/theme-switch';
import { SidebarNav } from './sidebar-nav';
import { SidebarUser } from './sidebar-user';
import { SendFeedbackModal } from '@/features/feedback/send-feedback-modal';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          'relative hidden h-full shrink-0 flex-col overflow-y-auto border-r bg-card md:flex transition-[width] duration-200 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center justify-between gap-2 border-b overflow-hidden',
            sidebarCollapsed ? 'px-1' : 'px-3'
          )}
        >
          <div className="flex min-w-0 flex-1 items-center justify-center">
            {sidebarCollapsed ? (
              <Logo href="/dashboard" variant="icon" height={50} width={50} className="max-h-7" />
            ) : (
              <Logo href="/dashboard" variant="full" height={30} width={120} className="max-h-10" />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'shrink-0 rounded-md hover:bg-accent',
              sidebarCollapsed ? 'h-7 w-7' : 'h-8 w-8'
            )}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((prev) => !prev)}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-3 w-3" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <SidebarNav
          collapsed={sidebarCollapsed}
          onSendFeedback={() => setFeedbackOpen(true)}
        />
        <SidebarUser collapsed={sidebarCollapsed} />
      </aside>

      <main className="min-h-0 flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/95 backdrop-blur px-4 md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-2 h-9 overflow-hidden">
            <Logo href="/dashboard" height={36} width={120} className="max-h-full" />
          </div>
        </header>
        <div className="fixed top-4 right-4 z-50">
          <ThemeSwitch />
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
      <SendFeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}
