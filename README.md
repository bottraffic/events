# SIMCHA OS — מונורפו

פלטפורמת SaaS רב-דיירת (Multi-Tenant) לניהול אולמות, גני אירועים ומתחמי חתונות.
**Web + מובייל (Android/iPhone) + API + MySQL** — כולם מסונכרנים דרך אותו backend.
מסמך האפיון המלא: [`../SIMCHA-OS-Architecture.md`](../SIMCHA-OS-Architecture.md).

## מבנה

```
simcha-os/
├─ apps/
│  ├─ api/      — NestJS (REST + JWT + RBAC + Prisma/MySQL)   ← מעלים לשרת
│  ├─ web/      — Next.js 14 (RTL, Tailwind)                  ← מעלים לשרת
│  └─ mobile/   — Expo / React Native (Android + iOS)         ← בונים APK/IPA
└─ packages/
   └─ db/       — Prisma schema + mysql-init.sql + mysql-seed.sql
```

> **סנכרון מלא מובייל↔web:** שתי האפליקציות מדברות עם אותו `apps/api` ואותו MySQL.
> שינוי במובייל נראה ב-web ולהפך. התראות Push למובייל דרך Expo (`User.pushToken`).

---

## 1️⃣ בסיס הנתונים (MySQL) — מעלים לשרת שלך

קבצים מוכנים ב-`packages/db/prisma/`:
- **`mysql-init.sql`** — כל הסכמה (49 טבלאות).
- **`mysql-seed.sql`** — נתוני דמו (אופציונלי). משתמש: `admin@demo.simcha.io` / `Demo1234!`.

**דרך א' — שורת פקודה:**
```bash
mysql -u USER -p < packages/db/prisma/mysql-init.sql
mysql -u USER -p simcha < packages/db/prisma/mysql-seed.sql   # אופציונלי
```

**דרך ב' — cPanel / phpMyAdmin:** צור DB בשם `simcha` (collation `utf8mb4_unicode_ci`) → Import → העלה את `mysql-init.sql`, ואז `mysql-seed.sql`.

---

## 2️⃣ ה-API (NestJS) — מעלים לשרת שלך

```bash
cd apps/api
cp .env.example .env     # ערוך DATABASE_URL ל-MySQL שלך + JWT_SECRET
# DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/simcha"
npm install
npm run build
npm run start:prod       # רץ על PORT (ברירת מחדל 4000)
```

מומלץ עם **PM2** (`pm2 start dist/main.js --name simcha-api`) או **Docker** (`apps/api/Dockerfile`).

---

## 3️⃣ ה-Web (Next.js) — מעלים לשרת שלך

```bash
cd apps/web
# קובץ .env.local להפקה:
#   NEXT_PUBLIC_DEMO=0
#   NEXT_PUBLIC_API_URL=https://api.your-domain.com/v1
npm install
npm run build
npm run start            # רץ על :3000
```

נבנה כ-`output: 'standalone'` → אפשר גם Docker (`apps/web/Dockerfile`) או Vercel.

### הרצה מהירה לבדיקה (בלי backend) ⭐
מצב Demo דלוק כברירת מחדל — ה-web עובד לבד עם נתוני דמו:
```bash
cd apps/web && npm install && npm run dev   # http://localhost:3000
```
נכנסים בלחיצה על "כניסה" (השדות ממולאים מראש). לחיבור ל-API: `NEXT_PUBLIC_DEMO=0`.

---

## 4️⃣ המובייל (Android + iPhone) — בונים אפליקציה

```bash
cd apps/mobile
npm install
npx expo start                 # תצוגה מיידית ב-Expo Go (סורקים QR)
```

הגדר את כתובת ה-API ב-`app.json` תחת `extra.apiUrl` (ברירת מחדל לאמולטור: `http://10.0.2.2:4000/v1`),
ו-`extra.demo=false` כדי לעבוד מול ה-API האמיתי.

**בניית קבצים להתקנה / חנויות (EAS):**
```bash
npm install -g eas-cli && eas login
eas build -p android --profile preview      # מפיק APK להתקנה ישירה
eas build -p android --profile production    # AAB ל-Google Play
eas build -p ios --profile production        # IPA ל-App Store (דרוש חשבון Apple Developer)
eas submit -p ios                            # העלאה ל-App Store
```

---

## בדיקות שבוצעו
| בדיקה | תוצאה |
|------|-------|
| `prisma validate` (MySQL) | ✅ valid |
| `mysql-init.sql` נוצר (UTF-8, 49 טבלאות) | ✅ |
| `nest build` (API) | ✅ |
| `next build` (Web, 13 routes) | ✅ |
| `tsc --noEmit` (Mobile/Expo) | ✅ |
| הרצת Web בדפדפן (login→dashboard→pipeline→events) | ✅ אומת |

> בניית APK/IPA בפועל דורשת EAS / Android SDK / Xcode (לא רצים בסביבת הפיתוח כאן).
