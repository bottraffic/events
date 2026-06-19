import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIMCHA OS — ניהול אולמות וגני אירועים',
  description: 'מערכת ה-SaaS המתקדמת לניהול אולמות, גני אירועים ומתחמי חתונות',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
