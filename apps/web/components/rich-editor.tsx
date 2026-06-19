'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, AlignRight, AlignCenter, AlignLeft,
  List, ListOrdered, Heading1, Heading2, Type, Variable, ChevronDown,
} from 'lucide-react';

export interface Var { k: string; label: string }

/** Replace {{var}} chips in stored HTML with real values for preview / client view. */
export function renderMerged(html: string, data: Record<string, string>): string {
  return html.replace(/<span[^>]*class="rt-var"[^>]*data-k="([^"]+)"[^>]*>.*?<\/span>/g, (_m, k) =>
    `<b>${data[k] ?? '—'}</b>`,
  );
}

const FONT_SIZES = [
  { v: '2', label: 'קטן' }, { v: '3', label: 'רגיל' }, { v: '5', label: 'גדול' }, { v: '6', label: 'כותרת' },
];

export function RichEditor({ initialHtml, variables, onChange }: { initialHtml: string; variables: Var[]; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [varsOpen, setVarsOpen] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== initialHtml) ref.current.innerHTML = initialHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    sync();
  };
  const sync = () => { if (ref.current) onChange(ref.current.innerHTML); };

  const insertVar = (v: Var) => {
    ref.current?.focus();
    document.execCommand('insertHTML', false, `<span class="rt-var" contenteditable="false" data-k="${v.k}">${v.label}</span>&nbsp;`);
    setVarsOpen(false);
    sync();
  };

  const Btn = ({ cmd, val, children, title }: { cmd: string; val?: string; children: React.ReactNode; title: string }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={() => exec(cmd, val)}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-white hover:text-brand-600 hover:shadow-card">
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 p-1.5">
        <Btn cmd="bold" title="מודגש"><Bold className="h-4 w-4" /></Btn>
        <Btn cmd="italic" title="נטוי"><Italic className="h-4 w-4" /></Btn>
        <Btn cmd="underline" title="קו תחתי"><Underline className="h-4 w-4" /></Btn>
        <Divider />
        <Btn cmd="formatBlock" val="H1" title="כותרת ראשית"><Heading1 className="h-4 w-4" /></Btn>
        <Btn cmd="formatBlock" val="H2" title="כותרת משנה"><Heading2 className="h-4 w-4" /></Btn>
        <div className="relative">
          <select onMouseDown={(e) => e.stopPropagation()} onChange={(e) => exec('fontSize', e.target.value)} className="h-8 cursor-pointer rounded-lg border border-transparent bg-transparent px-1.5 text-xs text-ink-soft hover:bg-white" defaultValue="3" title="גודל גופן">
            {FONT_SIZES.map((f) => <option key={f.v} value={f.v}>{f.label}</option>)}
          </select>
        </div>
        <Divider />
        <Btn cmd="justifyRight" title="יישור לימין"><AlignRight className="h-4 w-4" /></Btn>
        <Btn cmd="justifyCenter" title="מרכוז"><AlignCenter className="h-4 w-4" /></Btn>
        <Btn cmd="justifyLeft" title="יישור לשמאל"><AlignLeft className="h-4 w-4" /></Btn>
        <Divider />
        <Btn cmd="insertUnorderedList" title="רשימת תבליטים"><List className="h-4 w-4" /></Btn>
        <Btn cmd="insertOrderedList" title="רשימה ממוספרת"><ListOrdered className="h-4 w-4" /></Btn>
        <Divider />
        <label className="flex h-8 cursor-pointer items-center gap-1 rounded-lg px-1.5 text-ink-soft hover:bg-white" title="צבע טקסט">
          <Type className="h-4 w-4" />
          <input type="color" onChange={(e) => exec('foreColor', e.target.value)} className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0" />
        </label>

        {/* dynamic variables */}
        <div className="relative ms-auto">
          <button type="button" onClick={() => setVarsOpen((o) => !o)} className="flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700">
            <Variable className="h-4 w-4" /> משתנה דינמי <ChevronDown className="h-3 w-3" />
          </button>
          {varsOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setVarsOpen(false)} />
              <div className="absolute left-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
                {variables.map((v) => (
                  <button key={v.k} type="button" onClick={() => insertVar(v)} className="block w-full px-3 py-1.5 text-right text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700">{v.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* editable surface */}
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={sync} onBlur={sync}
        data-placeholder="התחל לכתוב את ההסכם…" className="rt-content bg-white px-6 py-5" />
    </div>
  );
}

function Divider() { return <span className="mx-1 h-5 w-px bg-slate-200" />; }
