export default function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{title}</h1>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="mb-3 text-5xl">🚧</div>
        <p className="font-medium text-slate-600">מודול זה מתוכנן ל-{phase}</p>
        <p className="mt-1 text-sm text-slate-400">ראה את ה-Roadmap במסמך הארכיטקטורה</p>
      </div>
    </div>
  );
}
