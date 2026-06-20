import * as Speech from 'expo-speech';

/* ---------- Text-to-speech (voice OUTPUT) — works in managed builds ---------- */
export function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'he-IL', rate: 1.0, pitch: 1.0 });
}
export function stopSpeaking() {
  Speech.stop();
}

/* ---------- Speech-to-text (voice INPUT) ----------
 * Voice input is temporarily disabled (the native STT library is being replaced
 * with a maintained one post-launch). The assistant UI falls back to typing and
 * still reads replies aloud via TTS. The contract below is unchanged so callers
 * keep working without edits.
 */
export const STT_AVAILABLE = false;

export async function startListening(
  _onResult: (text: string) => void,
  onEnd?: () => void,
): Promise<boolean> {
  onEnd?.();
  return false;
}
export async function stopListening() {
  /* no-op */
}
