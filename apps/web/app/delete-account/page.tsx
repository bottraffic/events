export const metadata = {
  title: 'מחיקת חשבון ונתונים · events360',
  description: 'בקשת מחיקת חשבון ונתונים מאפליקציית events360',
};

const h2 = { fontSize: 20, fontWeight: 700, marginTop: 28, marginBottom: 6 } as const;

export default function DeleteAccountPage() {
  const mailto =
    'mailto:contact.webon@gmail.com' +
    '?subject=' + encodeURIComponent('בקשת מחיקת חשבון - events360') +
    '&body=' + encodeURIComponent('אני מבקש/ת למחוק את החשבון והנתונים שלי ב-events360.\n\nאימייל החשבון: \nשם האולם / מזהה (אם ידוע): \n');

  return (
    <main
      dir="rtl"
      style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, "Segoe UI", sans-serif', lineHeight: 1.85, color: '#1e293b' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>S</div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>מחיקת חשבון ונתונים — events360</h1>
          <div style={{ color: '#64748b', fontSize: 13 }}>עודכן לאחרונה: 20 ביוני 2026</div>
        </div>
      </div>

      <p>
        עמוד זה מסביר כיצד למחוק את החשבון והנתונים שלך מאפליקציית <strong>events360</strong>
        {' '}(מאת WebOn / Bot-Traffic). אנו מכבדים את זכותך למחוק את המידע שלך בכל עת.
      </p>

      <h2 style={h2}>כיצד לבקש מחיקה</h2>
      <p><strong>אפשרות א' — מתוך האפליקציה:</strong> הגדרות → חשבון → "מחיקת חשבון", ואישור.</p>
      <p><strong>אפשרות ב' — בבקשה במייל (גם ללא התקנת האפליקציה):</strong></p>
      <p>
        <a
          href={mailto}
          style={{ display: 'inline-block', background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', padding: '12px 22px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}
        >
          שליחת בקשת מחיקה במייל
        </a>
      </p>
      <p style={{ fontSize: 14, color: '#475569' }}>
        או שלח/י ידנית אל{' '}
        <a href="mailto:contact.webon@gmail.com" style={{ color: '#4f46e5', fontWeight: 600 }}>contact.webon@gmail.com</a>
        {' '}עם נושא "בקשת מחיקת חשבון" וכתובת האימייל של החשבון. נאמת את זהותך לפני הביצוע.
      </p>

      <h2 style={h2}>איזה נתונים נמחקים</h2>
      <ul>
        <li>פרטי החשבון: שם, אימייל, טלפון, סיסמה ומזהי התקן (Push token).</li>
        <li>נתוני העסק שהזנת: לידים, לקוחות, אירועים, אורחים, הסכמים, הזמנות ומסמכים.</li>
      </ul>

      <h2 style={h2}>נתונים שעשויים להישמר זמנית</h2>
      <p>
        מידע מסוים עשוי להישמר לתקופה מוגבלת כאשר הדין מחייב זאת (למשל רישומים חשבונאיים/מס) או לצורך מניעת
        הונאה — ולאחר מכן יימחק או יהפוך אנונימי.
      </p>

      <h2 style={h2}>תוך כמה זמן</h2>
      <p>בקשות מטופלות בתוך <strong>עד 30 ימים</strong>. נשלח אישור במייל עם השלמת המחיקה.</p>

      <h2 style={h2}>יצירת קשר</h2>
      <p>
        <a href="mailto:contact.webon@gmail.com" style={{ color: '#4f46e5', fontWeight: 600 }}>contact.webon@gmail.com</a>
      </p>

      <hr style={{ margin: '36px 0', border: 0, borderTop: '1px solid #e2e8f0' }} />

      <div dir="ltr" style={{ color: '#475569', fontSize: 14 }}>
        <h2 style={{ ...h2, fontSize: 18 }}>Account &amp; Data Deletion — events360 (English)</h2>
        <p>
          To delete your <strong>events360</strong> account and data: in-app via <em>Settings → Account → Delete
          account</em>, or email{' '}
          <a href="mailto:contact.webon@gmail.com" style={{ color: '#4f46e5' }}>contact.webon@gmail.com</a>{' '}
          with the subject "Account deletion request" and your account email (no install required).
        </p>
        <p>
          <strong>Deleted:</strong> account details (name, email, phone, password, push tokens) and all business data
          you entered (leads, customers, events, guests, contracts, invitations, documents).
          <strong>Temporarily retained</strong> only where legally required (e.g. accounting/tax records) or for
          fraud prevention, then deleted or anonymized. Requests are completed within <strong>30 days</strong>.
        </p>
      </div>
    </main>
  );
}
