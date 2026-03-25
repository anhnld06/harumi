'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast-store';

interface SendFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CARD_STYLE =
  'rounded-xl border border-zinc-700/50 bg-[#231f26] shadow-2xl text-zinc-50';

export function SendFeedbackModal({ open, onOpenChange: setOpen }: SendFeedbackModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && session?.user) {
      setEmail(session.user.email ?? '');
      setName(session.user.name ?? '');
    }
  }, [open, session?.user]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isSubmitting) return;
      setOpen(isOpen);
      if (!isOpen) {
        setName('');
        setDescription('');
      }
    },
    [isSubmitting, setOpen]
  );

  const submitFeedback = async () => {
    const n = name.trim();
    const em = email.trim();
    const msg = description.trim();
    if (!n || !em || !msg) {
      toast('Please fill in name, email, and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n,
          email: em,
          message: msg,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast(typeof data.error === 'string' ? data.error : 'Failed to send feedback');
        return;
      }

      toast('Thank you! Your feedback was sent.');
      setName('');
      setDescription('');
      setOpen(false);
    } catch {
      toast('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitFeedback();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30"
        aria-hidden="true"
        onClick={() => handleOpenChange(false)}
        data-feedback-ui
      />

      <div
        data-feedback-ui
        className={cn(
          'fixed bottom-5 right-5 z-50 w-[380px] p-6',
          CARD_STYLE
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold text-white">Report a Bug</h2>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300 text-sm">
              Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-zinc-700 bg-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-600 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300 text-sm">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-zinc-700 bg-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-600 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-300 text-sm">
              Description <span className="text-red-400">*</span>
            </Label>
            <textarea
              id="description"
              placeholder="What's the bug? What did you expect?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="flex w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 resize-none"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#5d59c6] hover:bg-[#4d49b6] rounded-lg"
            >
              {isSubmitting ? 'Sending…' : 'Send Bug Report'}
            </Button>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="w-full rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
