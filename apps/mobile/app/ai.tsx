import { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { speak, stopSpeaking, startListening, stopListening, STT_AVAILABLE } from '@/lib/voice';

interface Msg { role: 'user' | 'ai'; text: string; }
const SUGGEST = ['כמה לידים החודש?', 'מה הפגישות שלי?', 'מה ההכנסה הצפויה?', 'אילו משימות פתוחות?'];

export default function AiScreen() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'ai', text: 'שלום דני! אני העוזר הקולי של SIMCHA OS. שאל אותי כל דבר על העסק — בכתב או בדיבור 🎙️' }]);
  const [input, setInput] = useState('');
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: 'user', text: q }]); setInput('');
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    const res = await api('/ai/ask', { method: 'POST', body: JSON.stringify({ question: q }) }).catch(() => ({ answer: 'שגיאה' }));
    setMsgs((m) => [...m, { role: 'ai', text: res.answer }]);
    if (voiceOn) speak(res.answer);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
  };

  const onMic = async () => {
    if (listening) { await stopListening(); setListening(false); return; }
    stopSpeaking();
    setListening(true);
    const ok = await startListening(
      (text) => { setListening(false); setInput(text); ask(text); },
      () => setListening(false),
    );
    if (!ok) {
      setListening(false);
      setMsgs((m) => [...m, { role: 'ai', text: 'זיהוי דיבור פעיל בגרסה המותקנת (APK / App Store). כאן אפשר להקליד — ואני אקריא את התשובה בקול 🔊' }]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="עוזר AI קולי" subtitle="OpenAI · Claude · Gemini" back right={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 11, color: C.inkMuted }}>קול</Text>
          <Switch value={voiceOn} onValueChange={(v) => { setVoiceOn(v); if (!v) stopSpeaking(); }} trackColor={{ true: C.brand }} />
        </View>
      } />

      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {msgs.map((m, i) => (
          <View key={i} style={[st.bubbleRow, { flexDirection: m.role === 'user' ? 'row' : 'row' }]}>
            <View style={[st.avatar, { backgroundColor: m.role === 'ai' ? C.violet : C.border }]}><Text style={{ fontSize: 16 }}>{m.role === 'ai' ? '🤖' : '🧑'}</Text></View>
            <View style={[st.bubble, m.role === 'ai' ? st.aiBubble : st.userBubble]}>
              <Text style={{ color: m.role === 'ai' ? C.inkSoft : '#fff', fontSize: 14, textAlign: 'right', lineHeight: 20 }}>{m.text}</Text>
              {m.role === 'ai' && i > 0 && <TouchableOpacity onPress={() => speak(m.text)} style={st.replay}><Text style={{ fontSize: 12, color: C.brand }}>🔊 השמע</Text></TouchableOpacity>}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={st.suggestWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
          {SUGGEST.map((s) => <TouchableOpacity key={s} onPress={() => ask(s)} style={st.chip}><Text style={{ fontSize: 12, color: C.inkSoft }}>{s}</Text></TouchableOpacity>)}
        </ScrollView>
      </View>

      <View style={st.inputBar}>
        <TouchableOpacity onPress={onMic} style={[st.micBtn, listening && { backgroundColor: C.rose }]}>
          <Text style={{ fontSize: 20 }}>{listening ? '⏺️' : '🎙️'}</Text>
        </TouchableOpacity>
        <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => ask(input)} placeholder={listening ? 'מאזין…' : 'שאל שאלה…'} style={st.input} />
        <TouchableOpacity onPress={() => ask(input)} style={st.sendBtn}><Text style={{ color: '#fff', fontWeight: '700' }}>שלח</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  bubbleRow: { alignItems: 'flex-start', gap: 8 },
  avatar: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  aiBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderBottomRightRadius: 4 },
  userBubble: { backgroundColor: C.brand, borderBottomLeftRadius: 4 },
  replay: { marginTop: 6, alignSelf: 'flex-start' },
  suggestWrap: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.card },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, paddingBottom: 24, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  micBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: C.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, textAlign: 'right', fontSize: 14 },
  sendBtn: { backgroundColor: C.brand, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
});
