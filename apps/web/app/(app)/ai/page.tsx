'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui';

interface Msg { role: 'user' | 'ai'; text: string; }
const SUGGESTIONS = ['כמה לידים נכנסו החודש?', 'מה ההכנסה הצפויה?', 'אילו אירועים קרובים?', 'מי הלקוחות החמים ביותר?'];

export default function AiPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'ai', text: 'שלום דני! אני העוזר העסקי החכם של SIMCHA OS. שאל אותי כל דבר על הנתונים שלך 📊' }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setThinking(true);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      const res = await api('/ai/ask', { method: 'POST', body: JSON.stringify({ question: q }) });
      setMsgs((m) => [...m, { role: 'ai', text: res.answer }]);
    } finally {
      setThinking(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl animate-fade-in flex-col">
      <PageHeader title="עוזר AI עסקי" subtitle="OpenAI · Claude · Gemini — שאל בשפה טבעית" />
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${m.role === 'ai' ? 'bg-gradient-to-br from-violet-500 to-brand-600 text-white' : 'bg-slate-200'}`}>{m.role === 'ai' ? '🤖' : '🧑'}</div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'ai' ? 'bg-slate-50 text-ink-soft' : 'bg-brand-600 text-white'}`}>{m.text}</div>
            </div>
          ))}
          {thinking && <div className="flex gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-brand-600 text-white">🤖</div><div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-ink-faint">חושב…</div></div>}
          <div ref={endRef} />
        </div>
        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => <button key={s} onClick={() => ask(s)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-ink-muted transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">{s}</button>)}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask(input)} placeholder="שאל שאלה עסקית…" className="input flex-1" />
            <button onClick={() => ask(input)} className="btn-primary">שלח</button>
          </div>
        </div>
      </div>
    </div>
  );
}
