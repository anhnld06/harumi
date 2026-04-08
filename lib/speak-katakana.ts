/**
 * Speak katakana using the browser (Japanese TTS when available).
 */
export function speakKatakana(text: string): void {
  if (typeof window === 'undefined') return;
  const clean = text.replace(/\u30FB/g, ' ').replace(/[—\s]+/g, ' ').trim();
  if (!clean) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'ja-JP';
  u.rate = 0.92;

  const voices = synth.getVoices();
  const ja =
    voices.find((v) => v.lang.startsWith('ja') && v.name.includes('Google')) ??
    voices.find((v) => v.lang.startsWith('ja')) ??
    null;
  if (ja) u.voice = ja;

  synth.speak(u);
}
