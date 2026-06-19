'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Avatar, Badge } from '@/components/ui';

interface Conv { id: string; name: string; channel: string; last: string; time: string; unread: number; online: boolean; }
interface Msg { from: 'me' | 'them'; body: string; time: string; }

const CHANNEL: Record<string, { icon: string; tone: any; label: string }> = {
  WHATSAPP: { icon: '🟢', tone: 'emerald', label: 'WhatsApp' },
  EMAIL: { icon: '✉️', tone: 'sky', label: 'Email' },
  SMS: { icon: '💬', tone: 'violet', label: 'SMS' },
};

export default function InboxPage() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<Conv[]>('/conversations').then((c) => { setConvs(c); setActive(c[0]); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (active) api<Msg[]>(`/conversations/${active.id}/messages`).then(setMessages).catch(() => {});
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: 'me', body: draft, time: 'עכשיו' }]);
    setDraft('');
    setTimeout(() => setMessages((m) => [...m, { from: 'them', body: 'מעולה, תודה! 🙏', time: 'עכשיו' }]), 1200);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] animate-fade-in flex-col">
      <PageHeader title="תיבת הודעות מאוחדת" subtitle="WhatsApp · Email · SMS במקום אחד" />
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {/* conversations list */}
        <div className="w-80 shrink-0 border-l border-slate-100">
          <div className="border-b border-slate-100 p-3"><input className="input !py-2" placeholder="חיפוש שיחה…" /></div>
          <div className="overflow-y-auto">
            {convs.map((c) => (
              <button key={c.id} onClick={() => setActive(c)} className={`flex w-full items-center gap-3 border-b border-slate-50 p-3 text-right transition hover:bg-slate-50 ${active?.id === c.id ? 'bg-brand-50/60' : ''}`}>
                <div className="relative">
                  <Avatar name={c.name} size={42} />
                  {c.online && <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between"><span className="font-semibold text-ink">{c.name}</span><span className="text-[10px] text-ink-faint">{c.time}</span></div>
                  <div className="flex items-center gap-1"><span className="truncate text-xs text-ink-faint">{c.last}</span></div>
                </div>
                {c.unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{c.unread}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* chat panel */}
        {active ? (
          <div className="flex flex-1 flex-col bg-slate-50">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-5 py-3">
              <Avatar name={active.name} size={40} />
              <div className="flex-1">
                <div className="font-semibold text-ink">{active.name}</div>
                <div className="text-xs text-emerald-600">{active.online ? 'מחובר/ת עכשיו' : 'לא מחובר/ת'}</div>
              </div>
              <Badge tone={CHANNEL[active.channel]?.tone}>{CHANNEL[active.channel]?.icon} {CHANNEL[active.channel]?.label}</Badge>
              <button className="btn-outline !py-1.5">📞 חייג</button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'me' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-card ${m.from === 'me' ? 'rounded-bl-md bg-brand-600 text-white' : 'rounded-br-md bg-white text-ink'}`}>
                    <div>{m.body}</div>
                    <div className={`mt-1 text-[10px] ${m.from === 'me' ? 'text-brand-100' : 'text-ink-faint'}`}>{m.time}</div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
              <button className="text-xl text-ink-faint hover:text-ink-soft">📎</button>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="הקלד הודעה…" className="input flex-1" />
              <button onClick={send} className="btn-primary">שלח</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-ink-faint">בחר שיחה</div>
        )}
      </div>
    </div>
  );
}
