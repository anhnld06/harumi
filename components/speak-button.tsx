'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

let globalMp3: HTMLAudioElement | null = null;

function stopGlobalMp3() {
  if (globalMp3) {
    globalMp3.pause();
    globalMp3.currentTime = 0;
    globalMp3 = null;
  }
}

interface SpeakButtonProps {
  /** Text to speak - prefer hiragana/reading for accurate pronunciation */
  text: string;
  /** Fallback if text is empty (e.g. kanji) */
  fallback?: string;
  /** Pre-generated MP3 (e.g. Edge TTS); when set, Web Speech API is not used */
  audioSrc?: string | null;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  /** Prevent click from bubbling (e.g. when inside clickable card) */
  stopPropagation?: boolean;
}

export function SpeakButton({
  text,
  fallback = '',
  audioSrc,
  variant = 'ghost',
  size = 'icon',
  className,
  stopPropagation = true,
}: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const speakWithSynth = useCallback(() => {
    const toSpeak = text?.trim() || fallback?.trim();
    if (!toSpeak) return;

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    stopGlobalMp3();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(toSpeak);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [text, fallback]);

  const speakWithMp3 = useCallback(
    (src: string) => {
      stopGlobalMp3();
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }

      const a = new Audio(src);
      globalMp3 = a;

      const end = () => {
        setIsSpeaking(false);
        if (globalMp3 === a) globalMp3 = null;
      };

      a.onplay = () => setIsSpeaking(true);
      a.onended = end;
      a.onerror = end;

      cleanupRef.current = () => {
        a.pause();
        if (globalMp3 === a) globalMp3 = null;
      };

      void a.play().catch(() => {
        setIsSpeaking(false);
        if (globalMp3 === a) globalMp3 = null;
      });
    },
    [],
  );

  const speak = useCallback(() => {
    const src = audioSrc?.trim();
    if (src) {
      speakWithMp3(src);
    } else {
      speakWithSynth();
    }
  }, [audioSrc, speakWithMp3, speakWithSynth]);

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
