# SIMCHA OS — מדריך העלאה לשרת

## מה מוכן להעלאה

| רכיב | מצב | מוכן לשרת? |
|------|------|------------|
| **אפליקציית Web** (Next.js) | 20 מודולים מלאים, רץ במצב דמו (נתונים בדפדפן) | ✅ כן — מעלים כמו שהוא |
| **בסיס נתונים MySQL** | סכמה מוכנה (`packages/db/prisma/mysql-init.sql`) | ✅ כן — מייבאים לשרת |
| **API** (NestJS) | auth, לידים, אירועים, pipeline, דוחות | ⚠️ חלקי (ראה הערה למטה) |
| **אפליקציית מובייל** (Expo) | מסכי ליבה: התחברות, דשבורד, לידים, אירועים | ⚠️ בסיסית (ראה הערה) |

> **חשוב:** ה-Web עובד כרגע ב**מצב דמו** — כל הנתונים נשמרים בדפדפן, בלי שרת. זה **מוכן לעלות מיד** להדגמה/שימוש בסיסי. לחיבור אמיתי רב-משתמשים (נתונים בשרת, שליחת WhatsApp אמיתית, חשבוניות מול iCount) צריך להשלים את ה-API — ראה "שלב הבא".

---

## אופציה 1 — Vercel (הכי קל, מומלץ להתחלה)
1. העלה את התיקייה ל-GitHub.
2. ב-Vercel: **New Project** → בחר את הריפו → **Root Directory: `apps/web`**.
3. Environment Variables: `NEXT_PUBLIC_DEMO=1`.
4. Deploy. תקבל כתובת ציבורית (https) מיד.

## אופציה 2 — שרת Node / VPS (cPanel, Plesk, Ubuntu)
```bash
# בשרת, בתוך apps/web:
cp .env.production.example .env.local      # ערוך אם צריך
npm install
npm run build
npm run start            # רץ על פורט 3000
```
מומלץ עם **PM2** שיישאר חי: `pm2 start "npm run start" --name simcha-web`
ומאחורי **nginx** (reverse proxy מ-80/443 → 3000) עם SSL (Let's Encrypt).

## אופציה 3 — Docker
```bash
cd apps/web
docker build -t simcha-web .
docker run -d -p 80:3000 -e NEXT_PUBLIC_DEMO=1 --name simcha-web simcha-web
```

---

## בסיס הנתונים (MySQL) — להעלאה לשרת שלך
```bash
mysql -u USER -p < packages/db/prisma/mysql-init.sql      # 49 טבלאות
mysql -u USER -p simcha < packages/db/prisma/mysql-seed.sql  # נתוני דמו (אופציונלי)
```
או דרך cPanel/phpMyAdmin: יוצרים DB בשם `simcha` ומייבאים את הקובץ.

## ה-API (NestJS) — אם מחברים Backend אמיתי
```bash
cd apps/api
cp .env.example .env        # DATABASE_URL ל-MySQL + JWT_SECRET
npm install && npm run build && npm run start:prod   # פורט 4000
```
ואז ב-Web: `NEXT_PUBLIC_DEMO=0` + `NEXT_PUBLIC_API_URL=https://api.your-domain/v1`.

## אפליקציית מובייל (Android + iOS)
```bash
cd apps/mobile
npm install
npx expo start                              # תצוגה ב-Expo Go
eas build -p android --profile preview       # APK להתקנה
eas build -p ios --profile production         # IPA ל-App Store
```

---

## בדיקות שבוצעו
- `next build` (Web) → **20 routes, exit 0** ✅
- `tsc --noEmit` → נקי ✅
- כל המסלולים מחזירים 200 ✅

## שלב הבא (לפרודקשן אמיתי)
ה-Web מלא ועובד בדמו. כדי שהכל יעבוד מול שרת אמיתי צריך להשלים ב-API את ה-endpoints של המודולים החדשים (חשבוניות, RSVP, הושבה, חוזים-תבניות, יומן, הזמנות) — הם בנויים בצד הלקוח באותה תבנית, וההעברה ל-MySQL+WebSockets+WhatsApp API היא המשימה הבאה.
