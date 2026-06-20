export const metadata = {
  title: 'מדיניות פרטיות · events360',
  description: 'מדיניות הפרטיות של אפליקציית events360',
};

const h2 = { fontSize: 20, fontWeight: 700, marginTop: 30, marginBottom: 6 } as const;
const h3 = { fontSize: 16, fontWeight: 700, marginTop: 18, marginBottom: 4 } as const;

export default function PrivacyPage() {
  return (
    <main
      dir="rtl"
      style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, "Segoe UI", sans-serif', lineHeight: 1.85, color: '#1e293b' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>S</div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>מדיניות פרטיות — events360</h1>
          <div style={{ color: '#64748b', fontSize: 13 }}>עודכן לאחרונה: 20 ביוני 2026 · גרסה 1.0</div>
        </div>
      </div>

      <p>
        מדיניות פרטיות זו מסבירה כיצד אפליקציית <strong>events360</strong> ("האפליקציה", "השירות") — מערכת לניהול
        אולמות וגני אירועים — אוספת, משתמשת, משתפת ומגנה על מידע. המפעיל ("אנחנו") הוא <strong>WebOn / Bot-Traffic</strong>.
        השימוש באפליקציה מהווה הסכמה למדיניות זו.
      </p>

      <h2 style={h2}>1. איזה מידע אנו אוספים</h2>
      <h3 style={h3}>מידע שאתה מספק</h3>
      <ul>
        <li><strong>פרטי חשבון:</strong> שם, אימייל, טלפון וסיסמה (מאוחסנת מוצפנת/hashed).</li>
        <li><strong>נתוני עסק:</strong> לידים, לקוחות, אירועים, אורחים, הסכמים, הזמנות ומסמכים שאתה מזין למערכת.</li>
      </ul>
      <h3 style={h3}>מידע הנאסף אוטומטית</h3>
      <ul>
        <li><strong>מזהה התקן להתראות (Push token)</strong> — לשליחת התראות תפעוליות.</li>
        <li><strong>נתוני שימוש ותקלות בסיסיים</strong> — לצורך יציבות ושיפור השירות.</li>
      </ul>

      <h2 style={h2}>2. הרשאות באפליקציה וכיצד הן משמשות</h2>
      <ul>
        <li>
          <strong>מיקרופון (RECORD_AUDIO):</strong> נדרש <u>אך ורק</u> כאשר אתה מפעיל ביוזמתך את העוזר הקולי.
          ההקלטה מומרת לטקסט לצורך ביצוע הפקודה ו<strong>אינה נשמרת</strong> לאחר מכן. אין הקלטה ברקע.
        </li>
        <li><strong>התראות (Notifications):</strong> לקבלת עדכונים על לידים, משימות ואירועים — בכפוף לאישורך.</li>
      </ul>

      <h2 style={h2}>3. למה אנו משתמשים במידע</h2>
      <ul>
        <li>לאספקת השירות ותפעולו (ניהול אירועים, לקוחות, מסמכים, תזכורות).</li>
        <li>לאימות, אבטחת חשבון ומניעת שימוש לרעה.</li>
        <li>לשליחת התראות תפעוליות שביקשת.</li>
        <li>לשיפור היציבות והביצועים.</li>
      </ul>
      <p>איננו מוכרים מידע אישי, ואיננו משתמשים בו לפרסום של צד שלישי.</p>

      <h2 style={h2}>4. שיתוף מידע עם צדדים שלישיים</h2>
      <p>אנו משתפים מידע רק עם ספקי תשתית הנחוצים להפעלת השירות, ובהיקף המינימלי הנדרש:</p>
      <ul>
        <li><strong>אחסון ושרתים</strong> (Hetzner / תשתית ענן) — אחסון מאובטח של הנתונים.</li>
        <li><strong>שירותי התראות</strong> (Expo / Google Firebase Cloud Messaging) — להעברת התראות.</li>
        <li><strong>WhatsApp / מסרונים / אימייל</strong> — רק כאשר אתה יוזם שליחת הודעה ללקוחותיך.</li>
        <li>במקרים של דרישה חוקית — אם נחויב על פי דין.</li>
      </ul>

      <h2 style={h2}>5. אחסון, אבטחה ושמירת מידע</h2>
      <p>
        הנתונים מאוחסנים בשרתים מאובטחים עם הצפנה בהעברה (HTTPS/TLS) וסיסמאות מוצפנות. אנו שומרים מידע כל עוד
        החשבון פעיל או כנדרש לצרכים חוקיים/עסקיים. בעת מחיקת חשבון, הנתונים האישיים נמחקים או הופכים אנונימיים
        בתוך זמן סביר.
      </p>

      <h2 style={h2}>6. הזכויות שלך</h2>
      <p>אתה רשאי לבקש בכל עת עיון, תיקון, ייצוא או מחיקה של המידע האישי שלך, וכן למשוך הסכמה. לבקשות — פנה אלינו.</p>

      <h2 style={h2}>7. פרטיות ילדים</h2>
      <p>האפליקציה מיועדת לשימוש עסקי ואינה מיועדת לקטינים מתחת לגיל 16. איננו אוספים ביודעין מידע מילדים.</p>

      <h2 style={h2}>8. שינויים במדיניות</h2>
      <p>נעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו בעמוד זה עם עדכון תאריך ה"עודכן לאחרונה".</p>

      <h2 style={h2}>9. יצירת קשר</h2>
      <p>
        בכל שאלה או בקשה בנושא פרטיות:{' '}
        <a href="mailto:contact.webon@gmail.com" style={{ color: '#4f46e5', fontWeight: 600 }}>contact.webon@gmail.com</a>
      </p>

      <hr style={{ margin: '36px 0', border: 0, borderTop: '1px solid #e2e8f0' }} />

      <div dir="ltr" style={{ color: '#475569', fontSize: 14 }}>
        <h2 style={{ ...h2, fontSize: 18 }}>Privacy Policy — events360 (English summary)</h2>
        <p>
          <strong>events360</strong> (by WebOn / Bot-Traffic) is an event-venue management app. We collect account
          details (name, email, phone, hashed password), the business data you enter (leads, customers, events,
          guests, contracts), a push-notification device token, and basic usage/crash data.
        </p>
        <p>
          <strong>Microphone (RECORD_AUDIO)</strong> is used only when you actively start the in-app voice assistant;
          audio is converted to text to run your command and is not stored. <strong>Notifications</strong> are used for
          operational updates with your consent.
        </p>
        <p>
          We use data only to provide and secure the service. We do <strong>not</strong> sell personal data. We share
          data only with infrastructure providers needed to run the service (cloud hosting, push via Expo/Google FCM,
          and WhatsApp/SMS/email only when you send messages to your clients), or when legally required.
        </p>
        <p>
          Data is encrypted in transit (HTTPS/TLS) and stored securely. You may request access, correction, export, or
          deletion of your data at any time. The app is for business use and not directed to children under 16.
          Contact: <a href="mailto:contact.webon@gmail.com" style={{ color: '#4f46e5' }}>contact.webon@gmail.com</a>.
        </p>
      </div>
    </main>
  );
}
