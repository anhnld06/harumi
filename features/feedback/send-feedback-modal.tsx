'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ImagePlus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SendFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CARD_STYLE =
  'rounded-xl border border-zinc-700/50 bg-[#231f26] shadow-2xl text-zinc-50';

export function SendFeedbackModal({ open, onOpenChange }: SendFeedbackModalProps) {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotOpen, setScreenshotOpen] = useState(false);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && session?.user) {
      setEmail(session.user.email ?? '');
      setName(session.user.name ?? '');
    }
  }, [open, session?.user]);


  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isSubmitting) {
        onOpenChange(isOpen);
        if (!isOpen) {
          setName('');
          setDescription('');
          setScreenshotDataUrl(null);
          setScreenshotOpen(false);
        }
      }
    },
    [isSubmitting, onOpenChange]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Call API to send feedback with screenshotDataUrl
    await new Promise((r) => setTimeout(r, 500));
    setIsSubmitting(false);
    handleOpenChange(false);
  };

  const captureScreenshot = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 0.5,
        ignoreElements: (el) => !!el.closest('[data-feedback-ui]'),
      });
      setScreenshotDataUrl(canvas.toDataURL('image/png'));
    } catch {
      setScreenshotDataUrl(null);
    }
  };

  const handleAddScreenshot = () => {
    setScreenshotOpen(true);
    onOpenChange(false); // Đóng panel nhỏ khi mở modal lớn
  };

  const handleRemoveScreenshot = () => {
    setScreenshotDataUrl(null);
    setScreenshotOpen(false);
  };


  // Khi modal lớn mở: chỉ hiển thị Dialog (panel nhỏ đã đóng)
  const showSmallPanel = open && !screenshotOpen;

  if (!open && !screenshotOpen) return null;

  return (
    <>
      {/* Backdrop - chỉ hiện khi panel nhỏ mở */}
      {showSmallPanel && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          aria-hidden="true"
          onClick={() => handleOpenChange(false)}
          data-feedback-ui
        />
      )}

      {/* Small panel - bottom-right (ẩn khi modal lớn mở) */}
      {showSmallPanel && (
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-zinc-600 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg"
            onClick={handleAddScreenshot}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Add a screenshot
          </Button>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#5d59c6] hover:bg-[#4d49b6] rounded-lg"
            >
              {isSubmitting ? 'Sending...' : 'Send Bug Report'}
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
      )}

      {/* Large screenshot modal */}
      <Dialog open={screenshotOpen} onOpenChange={setScreenshotOpen}>
        <DialogContent
          className={cn(
            'max-w-[95vw] w-[900px] h-[85vh] p-0 gap-0 overflow-hidden',
            'border-0 bg-zinc-950'
          )}
        >
          <div className="flex h-full flex-col sm:flex-row">
            {/* Screenshot preview - left */}
            <div className="flex-1 flex min-h-[200px] items-center justify-center bg-zinc-900/50 p-4">
              {screenshotDataUrl ? (
                <div className="relative h-[min(70vh,720px)] w-full">
                  <Image
                    src={screenshotDataUrl}
                    alt="Screenshot preview"
                    fill
                    unoptimized
                    className="rounded-lg border border-zinc-700 object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                  <p className="text-sm">Screenshot preview will appear here</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-zinc-600 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    onClick={async () => {
                      setScreenshotOpen(false);
                      await new Promise((r) => setTimeout(r, 100));
                      await captureScreenshot();
                      setScreenshotOpen(true);
                    }}
                  >
                    Capture current page
                  </Button>
                </div>
              )}
            </div>

            {/* Form sidebar - right */}
            <div
              className={cn(
                'w-full sm:w-[340px] shrink-0 flex flex-col border-l border-zinc-800 p-6',
                CARD_STYLE,
                'border-t sm:border-t-0 sm:border-l'
              )}
            >
              <DialogHeader className="p-0 pb-4">
                <DialogTitle className="text-lg font-semibold text-white">
                  Report a Bug
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">
                    Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-zinc-700 bg-zinc-800/80 text-white rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-zinc-700 bg-zinc-800/80 text-white rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <textarea
                    placeholder="What's the bug? What did you expect?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="flex w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-none"
                  />
                </div>
                {screenshotDataUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-zinc-600 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg"
                    onClick={handleRemoveScreenshot}
                  >
                    Remove screenshot
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-zinc-700">
                <Button
                  type="button"
                  className="w-full bg-[#5d59c6] hover:bg-[#4d49b6] rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                    setScreenshotOpen(false);
                  }}
                >
                  Send Bug Report
                </Button>
                <button
                  type="button"
                  onClick={() => setScreenshotOpen(false)}
                  className="w-full rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
