import * as Speech from 'expo-speech';

/* ---------- Text-to-speech (voice OUTPUT) — works in Expo Go ---------- */
export function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'he-IL', rate: 1.0, pitch: 1.0 });
}
export function stopSpeaking() {
  Speech.stop();
}

/* ---------- Speech-to-text (voice INPUT) ----------
 * Uses @react-native-voice/voice. Native recognition is available only in a
 * real build (eas build / APK / App Store), not in Expo Go — so we load it
 * lazily and fall back gracefully. The UI stays identical either way.
 */
let Voice: any = null;
try { Voice = require('@react-native-voice/voice').default; } catch { Voice = null; }
export const STT_AVAILABLE = !!Voice;

export async function startListening(onResult: (text: string) => void, onEnd?: () => void): Promise<boolean> {
  if (!Voice) { onEnd?.(); return false; }
  try {
    Voice.onSpeechResults = (e: any) => { const t = e?.value?.[0]; if (t) onResult(t); };
    Voice.onSpeechEnd = () => onEnd?.();
    Voice.onSpeechError = () => onEnd?.();
    await Voice.start('he-IL');
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}
export async function stopListening() {
  try { await Voice?.stop(); } catch {}
}
