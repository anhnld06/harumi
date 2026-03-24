'use client';

import { useState, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpeakButtonProps {
  /** Text to speak - prefer hiragana/reading for accurate pronunciation */
  text: string;
  /** Fallback if text is empty (e.g. kanji) */
  fallback?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  /** Prevent click from bubbling (e.g. when inside clickable card) */
  stopPropagation?: boolean;
}

export function SpeakButton({
  text,
  fallback = '',
  variant = 'ghost',
  size = 'icon',
  className,
  stopPropagation = true,
}: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(() => {
    const toSpeak = text?.trim() || fallback?.trim();
    if (!toSpeak) return;

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [text, fallback]);

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    speak();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      title="Phát âm (Pronunciation)"
      aria-label="Phát âm"
    >
      <Volume2
        className={`h-4 w-4 ${isSpeaking ? 'text-primary animate-pulse' : ''}`}
      />
    </Button>
  );
}
