'use client';

/**
 * Demo data layer. When NEXT_PUBLIC_DEMO !== '0' the API client routes here
 * instead of the backend, so the whole enterprise app runs standalone with zero
 * infrastructure. Mutable collections persist in localStorage.
 */

export interface MockStage { id: string; name: string; color: string; type: string; order: number; }
export interface MockLead { id: string; name: string; phone?: string; email?: string; source: string; score?: number; estimatedValue?: number; stageId: string; owner?: string; }
export interface MockEvent { id: string; type: string; eventDate: string; guestsCount: number; status: string; totalPrice?: number; hall?: string; customer?: { name: string; partnerName?: string }; }

export const STAGES: MockStage[] = [
  { id: 'stage-1', name: 'ליד חדש', color: '#6366f1', type: 'OPEN', order: 1 },
  { id: 'stage-2', name: 'תיאום פגישה', color: '#8b5cf6', type: 'OPEN', order: 2 },
  { id: 'stage-3', name: 'פגישה בוצעה', color: '#0ea5e9', type: 'OPEN', order: 3 },
  { id: 'stage-4', name: 'הצעת מחיר', color: '#f59e0b', type: 'OPEN', order: 4 },
  { id: 'stage-5', name: 'מו"מ', color: '#f97316', type: 'OPEN', order: 5 },
  { id: 'stage-6', name: 'נסגר', color: '#10b981', type: 'WON', order: 6 },
  { id: 'stage-7', name: 'הפסד', color: '#ef4444', type: 'LOST', order: 7 },
];

const SEED_LEADS: any[] = [
  { id: 'l1', name: 'יוסי כהן', phone: '050-1111111', email: 'yossi@mail.com', source: 'FACEBOOK', eventType: 'חתונה', score: 88, estimatedValue: 90000, stageId: 'stage-1', owner: 'דני', createdAt: '2026-06-18' },
  { id: 'l2', name: 'רינה לוי', phone: '050-2222222', source: 'INSTAGRAM', eventType: 'חתונה', score: 64, estimatedValue: 75000, stageId: 'stage-2', owner: 'מאיה', createdAt: '2026-06-17' },
  { id: 'l3', name: 'דנה ברק', phone: '050-3333333', source: 'GOOGLE_ADS', eventType: 'בר מצווה', score: 71, estimatedValue: 85000, stageId: 'stage-3', owner: 'דני', createdAt: '2026-06-15' },
  { id: 'l4', name: 'משה צור', phone: '050-4444444', source: 'WHATSAPP', eventType: 'ברית', score: 55, estimatedValue: 60000, stageId: 'stage-4', owner: 'מאיה', createdAt: '2026-06-12' },
  { id: 'l5', name: 'אבי רוזן', phone: '050-5555555', source: 'REFERRAL', eventType: 'חתונה', score: 79, estimatedValue: 92000, stageId: 'stage-5', owner: 'דני', createdAt: '2026-06-10' },
  { id: 'l6', name: 'גל מזרחי', phone: '050-6666666', source: 'WEBSITE', eventType: 'חתונה', score: 91, estimatedValue: 78000, stageId: 'stage-6', owner: 'מאיה', createdAt: '2026-06-05' },
  { id: 'l7', name: 'נועה שגב', phone: '050-7777777', source: 'TIKTOK', eventType: 'בת מצווה', score: 42, estimatedValue: 50000, stageId: 'stage-1', owner: 'דני', createdAt: '2026-06-19' },
  { id: 'l8', name: 'איתי פרץ', phone: '050-8888888', source: 'FACEBOOK', eventType: 'אירוע חברה', score: 68, estimatedValue: 110000, stageId: 'stage-2', owner: 'מאיה', createdAt: '2026-06-14' },
  { id: 'l9', name: 'שירה כהן', phone: '050-9999999', source: 'INSTAGRAM', eventType: 'חתונה', score: 83, estimatedValue: 95000, stageId: 'stage-5', owner: 'דני', createdAt: '2026-06-08' },
];

const SEED_EVENTS: MockEvent[] = [
  { id: 'e1', type: 'חתונה', eventDate: '2026-07-12', guestsCount: 350, status: 'BOOKED', totalPrice: 92000, hall: 'אולם הדר', customer: { name: 'גל', partnerName: 'מאיה' } },
  { id: 'e2', type: 'בר מצווה', eventDate: '2026-08-03', guestsCount: 180, status: 'OPTION', totalPrice: 48000, hall: 'גן ורדים', customer: { name: 'משפחת לוי' } },
  { id: 'e3', type: 'חתונה', eventDate: '2026-09-21', guestsCount: 420, status: 'INQUIRY', totalPrice: 0, hall: 'אולם הדר', customer: { name: 'דניאל', partnerName: 'שירה' } },
  { id: 'e4', type: 'אירוע חברה', eventDate: '2026-06-30', guestsCount: 250, status: 'COMPLETED', totalPrice: 65000, hall: 'אולם הדר', customer: { name: 'חברת טק-נובה' } },
  { id: 'e5', type: 'חתונה', eventDate: '2026-10-15', guestsCount: 300, status: 'BOOKED', totalPrice: 88000, hall: 'גן ורדים', customer: { name: 'עומר', partnerName: 'ליהי' } },
];
const LS_EVENTS = 'simcha_demo_events_v1';

const SOURCE_COLORS: Record<string, string> = {
  FACEBOOK: '#1877f2', INSTAGRAM: '#e1306c', GOOGLE_ADS: '#ea4335', TIKTOK: '#000000',
  WHATSAPP: '#25d366', WEBSITE: '#6366f1', PHONE: '#0ea5e9', REFERRAL: '#f59e0b', OTHER: '#94a3b8',
};
export const SOURCE_LABEL: Record<string, string> = {
  FACEBOOK: 'פייסבוק', INSTAGRAM: 'אינסטגרם', GOOGLE_ADS: 'גוגל', TIKTOK: 'טיקטוק',
  WHATSAPP: 'וואטסאפ', WEBSITE: 'אתר', PHONE: 'טלפון', REFERRAL: 'המלצה', OTHER: 'אחר',
};

const LS_LEADS = 'simcha_demo_leads_v2';

function read<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed;
  const raw = localStorage.getItem(key);
  if (!raw) { localStorage.setItem(key, JSON.stringify(seed)); return seed; }
  try { return JSON.parse(raw) as T; } catch { return seed; }
}
function write<T>(key: string, val: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(val));
    // notify same-tab listeners immediately (cross-tab handled by the storage event)
    window.dispatchEvent(new CustomEvent('simcha:sync', { detail: key }));
  }
}
const getLeads = () => read(LS_LEADS, SEED_LEADS);
const getEvents = () => read(LS_EVENTS, SEED_EVENTS);

export function isDemo(): boolean {
  return process.env.NEXT_PUBLIC_DEMO !== '0';
}

/* -------- static demo collections for the other modules -------- */
const CONVERSATIONS = [
  { id: 'c1', name: 'יוסי כהן', channel: 'WHATSAPP', last: 'מעולה, נשמע מצוין! מתי אפשר לבוא לסיור?', time: '10:42', unread: 2, online: true },
  { id: 'c2', name: 'רינה לוי', channel: 'WHATSAPP', last: 'תוכלי לשלוח לי הצעת מחיר ל-300 איש?', time: '09:15', unread: 0, online: false },
  { id: 'c3', name: 'דנה ברק', channel: 'EMAIL', last: 'מצרפת את רשימת המוזמנים המעודכנת', time: 'אתמול', unread: 0, online: false },
  { id: 'c4', name: 'משה צור', channel: 'SMS', last: 'אישרתי הגעה ל-12.7', time: 'אתמול', unread: 1, online: false },
  { id: 'c5', name: 'אבי רוזן', channel: 'WHATSAPP', last: 'החוזה נחתם ✅ תודה רבה!', time: 'יום ב׳', unread: 0, online: true },
];
const MESSAGES: Record<string, { from: 'me' | 'them'; body: string; time: string }[]> = {
  c1: [
    { from: 'them', body: 'היי, ראיתי את האולם באינסטגרם, נראה מהמם!', time: '10:30' },
    { from: 'me', body: 'תודה רבה יוסי! נשמח לארח אתכם. לכמה מוזמנים האירוע?', time: '10:33' },
    { from: 'them', body: 'בערך 350 איש, חתונה בקיץ', time: '10:38' },
    { from: 'me', body: 'מעולה, יש לנו זמינות ביולי ואוגוסט. אשמח לקבוע סיור', time: '10:40' },
    { from: 'them', body: 'מעולה, נשמע מצוין! מתי אפשר לבוא לסיור?', time: '10:42' },
  ],
};
const CALLS = [
  { id: 'ca1', name: 'יוסי כהן', number: '050-1111111', campaign: 'פייסבוק', dir: 'נכנסת', dur: '6:42', status: 'ANSWERED', date: '2026-06-19', sentiment: 'חיובי', prob: 88, summary: 'מתעניין בחתונה ל-350 איש ביולי. תקציב ~90K. ביקש סיור.' },
  { id: 'ca2', name: 'רינה לוי', number: '050-2222222', campaign: 'אינסטגרם', dir: 'נכנסת', dur: '4:18', status: 'ANSWERED', date: '2026-06-18', sentiment: 'נייטרלי', prob: 61, summary: 'מבררת מחירים ל-300 איש. משווה אולמות. צריך מעקב.' },
  { id: 'ca3', name: 'דנה ברק', number: '050-3333333', campaign: 'גוגל', dir: 'יוצאת', dur: '2:51', status: 'ANSWERED', date: '2026-06-18', sentiment: 'חיובי', prob: 73, summary: 'תיאום פגישה לשבוע הבא. מעוניינת בחבילת פרימיום.' },
  { id: 'ca4', name: 'משה צור', number: '050-4444444', campaign: 'וואטסאפ', dir: 'נכנסת', dur: '1:33', status: 'ANSWERED', date: '2026-06-15', sentiment: 'שלילי', prob: 35, summary: 'תקציב נמוך מהמוצע. סיכוי סגירה נמוך.' },
  { id: 'ca5', name: 'מספר חסום', number: '054-7777777', campaign: 'גוגל', dir: 'נכנסת', dur: '0:00', status: 'MISSED', date: '2026-06-19', sentiment: '—', prob: 0, summary: 'שיחה שלא נענתה — מומלץ לחזור.' },
  { id: 'ca6', name: 'אורי בר', number: '052-8888888', campaign: 'פייסבוק', dir: 'נכנסת', dur: '0:12', status: 'DISCONNECTED', date: '2026-06-17', sentiment: '—', prob: 0, summary: 'השיחה נותקה אחרי 12 שניות.' },
  { id: 'ca7', name: 'טל נוי', number: '053-9999999', campaign: 'אינסטגרם', dir: 'יוצאת', dur: '0:00', status: 'MISSED', date: '2026-06-16', sentiment: '—', prob: 0, summary: 'לא ענו — נסיון חוזר נדרש.' },
];
const SEED_AUTOMATIONS = [
  { id: 'a1', name: 'ברכת ליד חדש', trigger: 'ליד חדש נכנס', actions: ['שלח WhatsApp ברכה', 'צור משימה "התקשר תוך שעה"', 'עדכן CRM'], active: true, runs: 142 },
  { id: 'a2', name: 'תזכורת RSVP', trigger: '7 ימים לפני אירוע', actions: ['שלח WhatsApp לכל המוזמנים', 'עדכן ספירת אישורים'], active: true, runs: 38 },
  { id: 'a3', name: 'מעקב הצעת מחיר', trigger: 'הצעת מחיר ללא מענה 3 ימים', actions: ['שלח תזכורת', 'התראה לנציג'], active: true, runs: 67 },
  { id: 'a4', name: 'חוזה נחתם', trigger: 'חוזה נחתם', actions: ['שלח אישור', 'צור אירוע', 'התראת Push'], active: false, runs: 23 },
];
const LS_AUTOMATIONS = 'simcha_demo_automations_v1';
const getAutomations = () => read(LS_AUTOMATIONS, SEED_AUTOMATIONS);
const SEED_USERS = [
  { id: 'u1', name: 'דני מנהל', email: 'admin@demo.simcha.io', role: 'מנהל מערכת' },
  { id: 'u2', name: 'מאיה כהן', email: 'maya@demo.simcha.io', role: 'מנהל מכירות' },
  { id: 'u3', name: 'רון לוי', email: 'ron@demo.simcha.io', role: 'נציג' },
  { id: 'u4', name: 'שיר אבני', email: 'shir@demo.simcha.io', role: 'שירות לקוחות' },
];
const LS_USERS = 'simcha_demo_users_v1';
const getUsers = () => read(LS_USERS, SEED_USERS);
const SEED_NUMBERS = [
  { id: 'n1', number: '050-111-1111', source: 'פייסבוק', calls: 38 },
  { id: 'n2', number: '050-222-2222', source: 'אינסטגרם', calls: 24 },
  { id: 'n3', number: '050-333-3333', source: 'גוגל', calls: 31 },
];
const LS_NUMBERS = 'simcha_demo_numbers_v1';
const getNumbers = () => read(LS_NUMBERS, SEED_NUMBERS);
const SEED_VENDORS = [
  { id: 'v1', name: 'DJ אלון', category: 'תקליטן', phone: '052-1000001', rating: 5, events: 28 },
  { id: 'v2', name: 'צילום אורבני', category: 'צלם', phone: '052-1000002', rating: 5, events: 41 },
  { id: 'v3', name: 'קייטרינג טעמים', category: 'קייטרינג', phone: '052-1000003', rating: 4, events: 19 },
  { id: 'v4', name: 'עיצוב פרחים בלום', category: 'עיצוב', phone: '052-1000004', rating: 5, events: 33 },
  { id: 'v5', name: 'אבטחת שלום', category: 'אבטחה', phone: '052-1000005', rating: 4, events: 52 },
];
const LS_VENDORS = 'simcha_demo_vendors_v1';
const getVendors = () => read(LS_VENDORS, SEED_VENDORS);
const SEED_TASKS = [
  { id: 't1', title: 'התקשר ליוסי כהן לתיאום סיור', dueAt: '2026-06-19T14:00', priority: 'HIGH', done: false, who: 'דני' },
  { id: 't2', title: 'שלח הצעת מחיר לרינה לוי', dueAt: '2026-06-19T17:00', priority: 'URGENT', done: false, who: 'מאיה' },
  { id: 't3', title: 'מעקב חוזה עומר & ליהי', dueAt: '2026-06-21T10:00', priority: 'MEDIUM', done: false, who: 'דני' },
  { id: 't4', title: 'אישור תפריט אירוע טק-נובה', dueAt: '2026-06-25T12:00', priority: 'LOW', done: false, who: 'מאיה' },
  { id: 't5', title: 'סגירת DJ לאירוע גל & מאיה', dueAt: '2026-06-18T09:00', priority: 'HIGH', done: false, who: 'דני' },
  { id: 't6', title: 'אישור תפריט אירוע טק-נובה', dueAt: '2026-06-17T16:00', priority: 'MEDIUM', done: true, who: 'מאיה' },
];
const LS_TASKS = 'simcha_demo_tasks_v1';
const getTasks = () => read(LS_TASKS, SEED_TASKS);
// g = group, st = status, p = phone, snt/dlv/rd = sent/delivered/read, att = send attempts
const G = (id: string, name: string, group: string, size: number, status: string, phone: string, snt = false, dlv = false, rd = false, att = 0) =>
  ({ id, customerId: 'cu1', name, group, size, status, phone, sent: snt, delivered: dlv, read: rd, attempts: att, lastSentAt: snt ? '15/06/2026 10:00' : '' });
const SEED_GUESTS = [
  G('g1', 'דוד כהן', 'משפחת חתן', 2, 'YES', '050-3010101', true, true, true, 1),
  G('g2', 'מיכל לוי', 'חברים', 1, 'YES', '050-3010102', true, true, true, 1),
  G('g3', 'רון אבני', 'עבודה', 2, 'MAYBE', '050-3010103', true, true, false, 2),
  G('g4', 'תמר שגב', 'משפחת כלה', 4, 'YES', '050-3010104', true, true, true, 1),
  G('g5', 'יואב מור', 'חברים', 2, 'NO', '050-3010105', true, true, true, 1),
  G('g6', 'נטע גל', 'משפחת חתן', 1, 'PENDING', '050-3010106', true, false, false, 2),
  G('g7', 'אורי בן דוד', 'משפחת חתן', 2, 'YES', '050-3010107', true, true, true, 1),
  G('g8', 'שני פרידמן', 'משפחת כלה', 3, 'YES', '050-3010108', true, true, true, 1),
  G('g9', 'עידן רז', 'חברים', 2, 'YES', '050-3010109', true, true, true, 1),
  G('g10', 'ליאת אדרי', 'עבודה', 1, 'MAYBE', '050-3010110', true, true, false, 1),
  G('g11', 'גיא שטרן', 'משפחת כלה', 2, 'YES', '050-3010111', true, true, true, 1),
  G('g12', 'הדס כספי', 'חברים', 2, 'YES', '050-3010112', true, true, true, 1),
  G('g13', 'אלון מויאל', 'משפחת חתן', 4, 'YES', '050-3010113', true, true, true, 1),
  G('g14', 'רעות לב', 'עבודה', 2, 'PENDING', '050-3010114', false, false, false, 0),
  G('g15', 'נדב חזן', 'משפחת כלה', 2, 'YES', '050-3010115', true, true, true, 1),
  G('g16', 'יעל נחום', 'חברים', 1, 'PENDING', '050-3010116', false, false, false, 0),
];
const LS_GUESTS = 'simcha_demo_guests_v1';
const getGuests = () => read(LS_GUESTS, SEED_GUESTS);

// Invitation templates by event type (theme + default text). Image is uploaded by the user.
export const INVITATION_TEMPLATES = [
  { id: 'wed', name: 'חתונה', theme: 'gold', emoji: '💍', text: 'מתרגשים להזמין אתכם לחגוג איתנו את יום נישואינו' },
  { id: 'brit', name: 'ברית', theme: 'emerald', emoji: '👶', text: 'שמחים להזמינכם לברית בננו' },
  { id: 'brita', name: 'בריתה', theme: 'rose', emoji: '🎀', text: 'שמחים להזמינכם לחגוג את בתנו' },
  { id: 'bar', name: 'בר מצווה', theme: 'emerald', emoji: '✡️', text: 'נשמח לחגוג יחד את בר המצווה' },
  { id: 'bat', name: 'בת מצווה', theme: 'rose', emoji: '✨', text: 'נשמח לחגוג יחד את בת המצווה' },
  { id: 'hina', name: 'חינה', theme: 'rose', emoji: '🌸', text: 'בואו לחגוג איתנו בערב החינה' },
  { id: 'corp', name: 'אירוע חברה', theme: 'minimal', emoji: '🎉', text: 'מוזמנים לאירוע החברה השנתי' },
];
const LS_INVITES = 'simcha_demo_invites_v1';
const getInvites = () => read(LS_INVITES, {} as Record<string, any>);

// ---- financial documents (invoices / receipts) ----
export const DOC_TYPES: Record<string, { label: string; prefix: string; receipt?: boolean }> = {
  INVOICE: { label: 'חשבונית מס', prefix: 'INV' },
  INVOICE_RECEIPT: { label: 'חשבונית מס/קבלה', prefix: 'INR', receipt: true },
  RECEIPT: { label: 'קבלה', prefix: 'RC', receipt: true },
  PROFORMA: { label: 'חשבונית עסקה', prefix: 'PRO' },
  CREDIT: { label: 'חשבונית זיכוי', prefix: 'CRN' },
};
export const VAT_RATE = 0.18;
export const BILLING_PROVIDERS = [
  { id: 'manual', name: 'הנפקה ידנית (ללא ספק)', logo: '🧾', needsKey: false },
  { id: 'icount', name: 'iCount', logo: '🟦', needsKey: true },
  { id: 'hashavshevet', name: 'חשבשבת', logo: '📒', needsKey: true },
  { id: 'greeninvoice', name: 'חשבונית ירוקה', logo: '🟢', needsKey: true },
  { id: 'tranzila', name: 'Tranzila', logo: '💳', needsKey: true },
  { id: 'morning', name: 'Morning (חשבונית ירוקה)', logo: '🌅', needsKey: true },
];
const LS_DOCS = 'simcha_demo_docs_v1';
const SEED_DOCS = [
  { id: 'd1', number: 'INR-2026-0001', type: 'INVOICE_RECEIPT', customerId: 'cu1', customerName: 'גל מזרחי', date: '2026-05-02', items: [{ desc: 'מקדמה — חתונה 12.7', qty: 1, price: 23000 }], subtotal: 23000, vat: 4140, total: 27140, status: 'ISSUED', provider: 'icount', sentChannel: 'Email' },
  { id: 'd2', number: 'PRO-2026-0001', type: 'PROFORMA', customerId: 'cu4', customerName: 'חברת טק-נובה', date: '2026-04-18', items: [{ desc: 'אירוע חברה 30.6', qty: 1, price: 65000 }], subtotal: 65000, vat: 11700, total: 76700, status: 'ISSUED', provider: 'icount', sentChannel: 'Email' },
];
const getDocs = () => read(LS_DOCS, SEED_DOCS);
const LS_BILLING = 'simcha_demo_billing_v1';
const getBilling = () => read(LS_BILLING, { provider: 'icount', apiKey: '', companyId: '', connected: true } as any);

const SEED_CUSTOMERS = [
  { id: 'cu1', name: 'גל מזרחי', partner: 'מאיה לוי', phone: '050-6666666', email: 'gal@mail.com', city: 'תל אביב', events: 1, value: 92000, deposit: 23000, eventDate: '2026-07-12', eventType: 'חתונה', guests: 350, hall: 'אולם הדר', status: 'לקוח פעיל', tags: ['חתונה', 'VIP'] },
  { id: 'cu2', name: 'משפחת לוי', partner: '', phone: '050-2222222', email: 'levi@mail.com', city: 'רמת גן', events: 1, value: 48000, deposit: 12000, eventDate: '2026-08-03', eventType: 'בר מצווה', guests: 180, hall: 'גן ורדים', status: 'לקוח', tags: ['בר מצווה'] },
  { id: 'cu3', name: 'דניאל אבני', partner: 'שירה כהן', phone: '050-7777777', email: 'dani@mail.com', city: 'הרצליה', events: 1, value: 110000, deposit: 27500, eventDate: '2026-09-21', eventType: 'חתונה', guests: 420, hall: 'אולם הדר', status: 'ליד חם', tags: ['חתונה'] },
  { id: 'cu4', name: 'חברת טק-נובה', partner: '', phone: '03-5550000', email: 'events@technova.com', city: 'תל אביב', events: 3, value: 195000, deposit: 50000, eventDate: '2026-06-30', eventType: 'אירוע חברה', guests: 250, hall: 'אולם הדר', status: 'לקוח VIP', tags: ['אירוע חברה', 'חוזר'] },
  { id: 'cu5', name: 'עומר רז', partner: 'ליהי שגב', phone: '050-8888888', email: 'omer@mail.com', city: 'גבעתיים', events: 1, value: 88000, deposit: 22000, eventDate: '2026-10-15', eventType: 'חתונה', guests: 300, hall: 'גן ורדים', status: 'לקוח פעיל', tags: ['חתונה'] },
];
const LS_CUSTOMERS = 'simcha_demo_customers_v1';
const getCustomers = () => read(LS_CUSTOMERS, SEED_CUSTOMERS);

const SEED_CAMPAIGNS = [
  { id: 'cm1', name: 'חתונות קיץ 2026', channel: 'פייסבוק', number: '050-111-1111', budget: 8000, leads: 38, deals: 6, revenue: 182000, color: '#1877f2', active: true },
  { id: 'cm2', name: 'אינסטגרם סטוריז', channel: 'אינסטגרם', number: '050-222-2222', budget: 6000, leads: 24, deals: 3, revenue: 96000, color: '#e1306c', active: true },
  { id: 'cm3', name: 'גוגל חיפוש', channel: 'גוגל', number: '050-333-3333', budget: 9000, leads: 31, deals: 5, revenue: 134000, color: '#ea4335', active: true },
  { id: 'cm4', name: 'טיקטוק אורגני', channel: 'טיקטוק', number: '050-444-4444', budget: 3000, leads: 14, deals: 1, revenue: 41000, color: '#000000', active: false },
];
const LS_CAMPAIGNS = 'simcha_demo_campaigns_v1';
const getCampaigns = () => read(LS_CAMPAIGNS, SEED_CAMPAIGNS);

export const CONTRACT_VARS = [
  { k: 'לקוח', label: 'שם לקוח' }, { k: 'בן_זוג', label: 'בן/בת זוג' }, { k: 'תאריך', label: 'תאריך אירוע' },
  { k: 'סוג', label: 'סוג אירוע' }, { k: 'מוזמנים', label: 'מס׳ מוזמנים' }, { k: 'אולם', label: 'אולם' },
  { k: 'סכום', label: 'סכום ₪' }, { k: 'מקדמה', label: 'מקדמה ₪' }, { k: 'יתרה', label: 'יתרה ₪' },
];

const V = (k: string, label: string) => `<span class="rt-var" contenteditable="false" data-k="${k}">${label}</span>`;
export const CONTRACT_TEMPLATE_HTML =
  `<h1 style="text-align:center">הסכם להזמנת אירוע</h1>` +
  `<p>נערך ונחתם בין <b>אולמי דמו בע"מ</b> (להלן: "האולם") לבין ${V('לקוח', 'שם לקוח')} (להלן: "הלקוח").</p>` +
  `<h2>פרטי האירוע</h2><ul>` +
  `<li>סוג האירוע: ${V('סוג', 'סוג אירוע')}</li>` +
  `<li>תאריך: ${V('תאריך', 'תאריך אירוע')}</li>` +
  `<li>מספר מוזמנים מוערך: ${V('מוזמנים', 'מס׳ מוזמנים')}</li>` +
  `<li>אולם/אזור: ${V('אולם', 'אולם')}</li></ul>` +
  `<h2>תמורה ותנאי תשלום</h2><ul>` +
  `<li>סכום כולל: ₪${V('סכום', 'סכום')}</li>` +
  `<li>מקדמה בעת חתימת ההסכם: ₪${V('מקדמה', 'מקדמה')}</li>` +
  `<li>יתרה לתשלום ביום האירוע: ₪${V('יתרה', 'יתרה')}</li></ul>` +
  `<h2>תנאים כלליים</h2><ol>` +
  `<li>ביטול עד 90 יום לפני מועד האירוע — תוחזר המקדמה בניכוי דמי טיפול.</li>` +
  `<li>מספר המוזמנים הסופי יימסר עד 7 ימים לפני האירוע.</li>` +
  `<li>האולם מתחייב לספק את השירותים המפורטים בנספח א'.</li></ol>`;

const LS_CONTRACTS = 'simcha_demo_contracts_v2';
const SEED_CONTRACTS = [
  { id: 'k1', title: 'הסכם חתונה — גל & מאיה', customerId: 'cu1', customerName: 'גל מזרחי', partnerName: 'מאיה לוי', eventType: 'חתונה', eventDate: '2026-07-12', guests: 350, hall: 'אולם הדר', phone: '050-6666666', email: 'gal@mail.com', amount: 92000, deposit: 23000, bodyHtml: CONTRACT_TEMPLATE_HTML, status: 'SIGNED', sentChannel: 'WhatsApp', signature: null, signedAt: '02/05/2026', signerName: 'גל מזרחי', ip: '84.21.55.10', device: 'iPhone' },
  { id: 'k2', title: 'הסכם אירוע — טק-נובה', customerId: 'cu4', customerName: 'חברת טק-נובה', partnerName: '', eventType: 'אירוע חברה', eventDate: '2026-06-30', guests: 250, hall: 'אולם הדר', phone: '03-5550000', email: 'events@technova.com', amount: 195000, deposit: 50000, bodyHtml: CONTRACT_TEMPLATE_HTML, status: 'SENT', sentChannel: 'Email', signature: null },
];
const getContracts = () => read(LS_CONTRACTS, SEED_CONTRACTS);

// Predefined contract templates the venue owner prepared per event type.
const LS_TEMPLATES = 'simcha_demo_templates_v1';
const SEED_TEMPLATES = [
  { id: 'tpl-wed', name: 'חתונה', eventType: 'חתונה', bodyHtml: CONTRACT_TEMPLATE_HTML },
  { id: 'tpl-brit', name: 'ברית', eventType: 'ברית', bodyHtml: CONTRACT_TEMPLATE_HTML },
  { id: 'tpl-brita', name: 'בריתה', eventType: 'בריתה', bodyHtml: CONTRACT_TEMPLATE_HTML },
  { id: 'tpl-bar', name: 'בר מצווה', eventType: 'בר מצווה', bodyHtml: CONTRACT_TEMPLATE_HTML },
  { id: 'tpl-bat', name: 'בת מצווה', eventType: 'בת מצווה', bodyHtml: CONTRACT_TEMPLATE_HTML },
  { id: 'tpl-corp', name: 'אירוע חברה', eventType: 'אירוע חברה', bodyHtml: CONTRACT_TEMPLATE_HTML },
  { id: 'tpl-hina', name: 'חינה', eventType: 'חינה', bodyHtml: CONTRACT_TEMPLATE_HTML },
];
const getTemplates = () => read(LS_TEMPLATES, SEED_TEMPLATES);

// ---- seating plans (saved per customer / event) ----
const LS_SEATING = 'simcha_demo_seating_v1';
const getSeating = () => read<Record<string, any>>(LS_SEATING, {});

// ---- calendar appointments ----
const LS_APPTS = 'simcha_demo_appts_v1';
const SEED_APPTS = [
  { id: 'ap1', customerId: 'cu1', customerName: 'גל מזרחי', title: 'סיור באולם + טעימות', type: 'סיור', date: '2026-06-22', time: '18:00', durationMin: 60, notes: 'סיור ראשון, להראות את הגן', channelSent: '' },
  { id: 'ap2', customerId: 'cu3', customerName: 'דניאל אבני', title: 'פגישת סגירה', type: 'פגישה', date: '2026-06-25', time: '12:00', durationMin: 45, notes: '', channelSent: 'WhatsApp' },
  { id: 'ap3', customerId: 'cu5', customerName: 'עומר רז', title: 'שיחת תיאום DJ', type: 'שיחה', date: '2026-06-20', time: '10:30', durationMin: 30, notes: '', channelSent: '' },
];
const getAppts = () => read(LS_APPTS, SEED_APPTS);

// ---- activity log (CRM timeline + per-user audit) ----
const LS_ACTIVITIES = 'simcha_demo_activities_v1';
const SEED_ACTIVITIES = [
  { id: 'av1', customerId: 'cu1', type: 'contract', text: 'ההסכם נחתם דיגיטלית', user: 'גל מזרחי', at: '02/05/2026 14:30' },
  { id: 'av2', customerId: 'cu1', type: 'call', text: 'שיחת טלפון 6:42 — ביקש סיור', user: 'דני מנהל', at: '28/04/2026 10:15' },
  { id: 'av3', customerId: 'cu1', type: 'quote', text: 'נשלחה הצעת מחיר ₪92,000', user: 'מאיה כהן', at: '20/04/2026 16:05' },
  { id: 'av4', customerId: 'cu1', type: 'lead', text: 'נוצר ליד ממקור פייסבוק', user: 'מערכת', at: '15/04/2026 09:00' },
];
const getActivities = () => read(LS_ACTIVITIES, SEED_ACTIVITIES);
const FIELD_LABELS: Record<string, string> = { name: 'שם', partner: 'בן/בת זוג', phone: 'טלפון', email: 'אימייל', city: 'עיר', eventType: 'סוג אירוע', eventDate: 'תאריך אירוע', guests: 'מס׳ מוזמנים', hall: 'אולם', value: 'שווי', deposit: 'מקדמה', status: 'סטטוס' };
function logActivity(customerId: string, type: string, text: string, user = 'דני מנהל') {
  if (!customerId) return;
  write(LS_ACTIVITIES, [{ id: 'av' + Date.now(), customerId, type, text, user, at: new Date().toLocaleString('he-IL') }, ...getActivities()]);
}

export async function mockApi(path: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method ?? 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  await new Promise((r) => setTimeout(r, 90));

  if (path === '/auth/login' || path === '/auth/register-tenant')
    return { accessToken: 'demo', refreshToken: 'demo', tenant: { id: 'demo', name: 'אולמי דמו', slug: 'demo' }, user: { id: 'u1', name: 'דני מנהל', email: body.email ?? 'admin@demo.simcha.io' } };
  if (path === '/auth/me') return { id: 'u1', name: 'דני מנהל', email: 'admin@demo.simcha.io', roles: ['ADMIN'] };

  if (path === '/pipeline') {
    const leads = getLeads();
    return STAGES.map((s) => ({ ...s, leadsCount: leads.filter((l) => l.stageId === s.id).length, totalValue: leads.filter((l) => l.stageId === s.id).reduce((a, l) => a + (l.estimatedValue ?? 0), 0) }));
  }
  if (path === '/leads' && method === 'GET') return getLeads();
  if (path === '/leads' && method === 'POST') {
    const lead: any = { id: 'l' + Date.now(), name: body.name, phone: body.phone, source: body.source ?? 'OTHER', eventType: body.eventType ?? 'חתונה', stageId: body.stageId ?? 'stage-1', score: Math.floor(40 + Math.random() * 55), owner: 'דני', estimatedValue: body.estimatedValue, createdAt: new Date().toISOString().slice(0, 10) };
    write(LS_LEADS, [lead, ...getLeads()]);
    return lead;
  }
  const stageMatch = path.match(/^\/leads\/([^/]+)\/stage$/);
  if (stageMatch && method === 'PATCH') {
    const leads = getLeads().map((l) => (l.id === stageMatch[1] ? { ...l, stageId: body.stageId } : l));
    write(LS_LEADS, leads);
    return leads.find((l) => l.id === stageMatch[1]);
  }

  if (path === '/events' && method === 'GET') return getEvents();
  if (path === '/events' && method === 'POST') { const e = { id: 'e' + Date.now(), status: 'INQUIRY', totalPrice: 0, ...body }; write(LS_EVENTS, [e, ...getEvents()]); return e; }

  if (path === '/reports/overview') {
    const leads = getLeads();
    const closed = leads.filter((l) => l.stageId === 'stage-6').length;
    const evs = getEvents();
    return { leadsThisMonth: leads.length, closedDeals: closed, totalLeads: leads.length, upcomingEvents: evs.filter((e) => new Date(e.eventDate) >= new Date()).length, expectedRevenue: evs.filter((e) => ['BOOKED', 'COMPLETED'].includes(e.status)).reduce((a, e) => a + (e.totalPrice ?? 0), 0), conversionRate: leads.length ? Math.round((closed / leads.length) * 100) : 0 };
  }
  if (path === '/reports/sources') {
    const leads = getLeads();
    const counts: Record<string, number> = {};
    leads.forEach((l) => (counts[l.source] = (counts[l.source] ?? 0) + 1));
    return Object.entries(counts).map(([source, count]) => ({ source, count, label: SOURCE_LABEL[source] ?? source, color: SOURCE_COLORS[source] ?? '#94a3b8' })).sort((a, b) => b.count - a.count);
  }
  if (path === '/reports/revenue') return { months: ['יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ', 'ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ'], values: [62, 71, 58, 84, 92, 110, 88, 95, 120, 132, 118, 157] };
  if (path === '/reports/funnel') {
    const leads = getLeads();
    return STAGES.filter((s) => s.type === 'OPEN' || s.type === 'WON').map((s) => ({ label: s.name, value: leads.filter((l) => (STAGES.find((x) => x.id === l.stageId)?.order ?? 0) >= s.order && l.stageId !== 'stage-7').length, color: s.color }));
  }

  if (path === '/conversations') return CONVERSATIONS;
  const msgMatch = path.match(/^\/conversations\/([^/]+)\/messages$/);
  if (msgMatch) return MESSAGES[msgMatch[1]] ?? [{ from: 'them', body: CONVERSATIONS.find((c) => c.id === msgMatch[1])?.last ?? 'שלום', time: '09:00' }];

  if (path === '/calls') return CALLS;
  if (path === '/automations' && method === 'GET') return getAutomations();
  if (path === '/automations' && method === 'POST') { const a = { id: 'a' + Date.now(), active: true, runs: 0, actions: [], ...body }; write(LS_AUTOMATIONS, [a, ...getAutomations()]); return a; }
  const aOne = path.match(/^\/automations\/([^/]+)$/);
  if (aOne && method === 'PATCH') { const list = getAutomations().map((a: any) => (a.id === aOne[1] ? { ...a, ...body } : a)); write(LS_AUTOMATIONS, list); return list.find((a: any) => a.id === aOne[1]); }

  if (path === '/users' && method === 'GET') return getUsers();
  if (path === '/users' && method === 'POST') { const u = { id: 'u' + Date.now(), role: 'נציג', ...body }; write(LS_USERS, [...getUsers(), u]); return u; }

  if (path === '/tracking-numbers' && method === 'GET') return getNumbers();
  if (path === '/tracking-numbers' && method === 'POST') { const n = { id: 'n' + Date.now(), calls: 0, ...body }; write(LS_NUMBERS, [...getNumbers(), n]); return n; }
  if (path === '/vendors' && method === 'GET') return getVendors();
  if (path === '/vendors' && method === 'POST') { const v = { id: 'v' + Date.now(), rating: 5, events: 0, ...body }; write(LS_VENDORS, [v, ...getVendors()]); return v; }
  if (path === '/tasks' && method === 'GET') return getTasks();
  if (path === '/tasks' && method === 'POST') { const t = { id: 't' + Date.now(), done: false, priority: 'MEDIUM', who: 'דני', dueAt: '', ...body }; write(LS_TASKS, [t, ...getTasks()]); if (body.customerId) logActivity(body.customerId, 'task', `נוצרה משימה: ${t.title}`); return t; }
  const tOne = path.match(/^\/tasks\/([^/]+)$/);
  if (tOne && method === 'PATCH') { const list = getTasks().map((t: any) => (t.id === tOne[1] ? { ...t, ...body } : t)); write(LS_TASKS, list); return list.find((t: any) => t.id === tOne[1]); }
  if (path.split('?')[0] === '/guests' && method === 'GET') {
    const cid = new URLSearchParams(path.split('?')[1] || '').get('customer');
    return getGuests().filter((g: any) => !cid || g.customerId === cid);
  }
  if (path === '/guests' && method === 'POST') {
    const g = { id: 'g' + Date.now(), group: 'אורח', size: 1, status: 'PENDING', phone: '', sent: false, delivered: false, read: false, attempts: 0, lastSentAt: '', ...body };
    write(LS_GUESTS, [...getGuests(), g]);
    return g;
  }

  // ---- invitations ----
  const invOne = path.match(/^\/invitations\/([^/]+)$/);
  if (invOne && method === 'GET') return getInvites()[invOne[1]] ?? null;
  if (path === '/invitations' && method === 'POST') {
    const all = getInvites(); all[body.slug] = body.data; write(LS_INVITES, all);
    return { ok: true, slug: body.slug };
  }
  const gOne = path.match(/^\/guests\/([^/]+)$/);
  if (gOne && method === 'PATCH') {
    const list = getGuests().map((g: any) => (g.id === gOne[1] ? { ...g, ...body } : g));
    write(LS_GUESTS, list);
    return list.find((g: any) => g.id === gOne[1]);
  }
  if (path === '/guests/remind' && method === 'POST') {
    const ids: string[] = body.ids ?? [];
    const list = getGuests().map((g: any) => (ids.includes(g.id)
      ? { ...g, sent: true, delivered: true, read: Math.random() > 0.4, attempts: (g.attempts ?? 0) + 1, lastSentAt: new Date().toLocaleString('he-IL') }
      : g));
    write(LS_GUESTS, list);
    return { sent: ids.length, channel: body.channel ?? 'WhatsApp' };
  }
  if (path === '/customers' && method === 'GET') return getCustomers();
  if (path === '/customers' && method === 'POST') {
    const list = getCustomers();
    const c = { id: 'cu' + Date.now(), events: 0, value: 0, deposit: 0, city: '', email: '', partner: '', eventDate: '', eventType: 'חתונה', guests: 0, hall: '', status: 'ליד חדש', tags: [] as string[], ...body };
    write(LS_CUSTOMERS, [c, ...list]);
    logActivity(c.id, 'lead', 'נוצר לקוח חדש במערכת');
    return c;
  }

  // ---- seating plans ----
  const spOne = path.match(/^\/seating-plans\/([^/]+)$/);
  if (spOne && method === 'GET') return getSeating()[spOne[1]] ?? null;
  if (path === '/seating-plans' && method === 'POST') {
    const all = getSeating(); all[body.key] = body.data; write(LS_SEATING, all);
    if (body.key && body.key !== 'default') logActivity(body.key, 'seating', `עודכן סידור הושבה: ${body.data?.tables?.length ?? 0} שולחנות · ${body.data?.seated ?? 0} משובצים`);
    return { ok: true };
  }

  // ---- appointments (calendar) ----
  if (path === '/appointments' && method === 'GET') return getAppts();
  if (path === '/appointments' && method === 'POST') {
    const a = { id: 'ap' + Date.now(), channelSent: '', ...body };
    write(LS_APPTS, [a, ...getAppts()]);
    if (a.customerId) logActivity(a.customerId, 'meeting', `נקבעה פגישה: ${a.title} · ${a.date} ${a.time}`);
    return a;
  }
  const apOne = path.match(/^\/appointments\/([^/]+)$/);
  if (apOne && method === 'PATCH') { const list = getAppts().map((a: any) => (a.id === apOne[1] ? { ...a, ...body } : a)); write(LS_APPTS, list); return list.find((a: any) => a.id === apOne[1]); }
  if (apOne && method === 'DELETE') { write(LS_APPTS, getAppts().filter((a: any) => a.id !== apOne[1])); return { ok: true }; }
  const apSend = path.match(/^\/appointments\/([^/]+)\/send$/);
  if (apSend && method === 'POST') {
    const list = getAppts().map((a: any) => (a.id === apSend[1] ? { ...a, channelSent: body.channel } : a)); write(LS_APPTS, list);
    const a = list.find((x: any) => x.id === apSend[1]);
    if (a?.customerId) logActivity(a.customerId, 'meeting', `הזמנה לפגישה "${a.title}" נשלחה ללקוח ב-${body.channel}`);
    return a;
  }

  // ---- activities (CRM log) ----
  if (path.split('?')[0] === '/activities' && method === 'GET') {
    const cid = new URLSearchParams(path.split('?')[1] || '').get('customer');
    return getActivities().filter((a: any) => !cid || a.customerId === cid);
  }
  if (path === '/activities' && method === 'POST') { logActivity(body.customerId, body.type || 'note', body.text, body.user); return { ok: true }; }

  if (path === '/contract-templates' && method === 'GET') return getTemplates();
  if (path === '/contract-templates' && method === 'POST') {
    const list = getTemplates();
    const t = { id: 'tpl' + Date.now(), ...body };
    write(LS_TEMPLATES, [...list, t]);
    return t;
  }
  const ctOne = path.match(/^\/contract-templates\/([^/]+)$/);
  if (ctOne && method === 'PATCH') { const list = getTemplates().map((t: any) => (t.id === ctOne[1] ? { ...t, ...body } : t)); write(LS_TEMPLATES, list); return list.find((t: any) => t.id === ctOne[1]); }
  if (ctOne && method === 'DELETE') { write(LS_TEMPLATES, getTemplates().filter((t: any) => t.id !== ctOne[1])); return { ok: true }; }

  // ---- custom invitation templates (created by the venue owner) ----
  if (path === '/invitation-templates' && method === 'GET') return read('simcha_demo_inv_tpls_v1', [] as any[]);
  if (path === '/invitation-templates' && method === 'POST') {
    const list = read('simcha_demo_inv_tpls_v1', [] as any[]);
    const t = { id: 'itpl' + Date.now(), ...body };
    write('simcha_demo_inv_tpls_v1', [...list, t]);
    return t;
  }
  const itOne = path.match(/^\/invitation-templates\/([^/]+)$/);
  if (itOne && method === 'PATCH') { const list = read('simcha_demo_inv_tpls_v1', [] as any[]).map((t: any) => (t.id === itOne[1] ? { ...t, ...body } : t)); write('simcha_demo_inv_tpls_v1', list); return list.find((t: any) => t.id === itOne[1]); }
  if (itOne && method === 'DELETE') { write('simcha_demo_inv_tpls_v1', read('simcha_demo_inv_tpls_v1', [] as any[]).filter((t: any) => t.id !== itOne[1])); return { ok: true }; }

  // ---- financial documents ----
  if (path === '/documents' && method === 'GET') return getDocs();
  if (path === '/documents' && method === 'POST') {
    const list = getDocs();
    const seq = list.filter((d: any) => d.type === body.type).length + 1;
    const prefix = DOC_TYPES[body.type]?.prefix ?? 'DOC';
    const items = body.items ?? [];
    const subtotal = items.reduce((a: number, it: any) => a + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const vat = body.type === 'RECEIPT' ? 0 : Math.round(subtotal * VAT_RATE);
    const doc = { id: 'd' + Date.now(), number: `${prefix}-2026-${String(seq).padStart(4, '0')}`, date: new Date().toISOString().slice(0, 10), status: 'ISSUED', provider: getBilling().provider, sentChannel: '', ...body, subtotal, vat, total: subtotal + vat };
    write(LS_DOCS, [doc, ...list]);
    if (doc.customerId) logActivity(doc.customerId, 'contract', `הונפק ${DOC_TYPES[body.type]?.label} ${doc.number} · ₪${(subtotal + vat).toLocaleString()}`);
    return doc;
  }
  const docOne = path.match(/^\/documents\/([^/]+)$/);
  if (docOne && method === 'PATCH') { const list = getDocs().map((d: any) => (d.id === docOne[1] ? { ...d, ...body } : d)); write(LS_DOCS, list); const d = list.find((x: any) => x.id === docOne[1]); if (d?.customerId && body.status === 'CANCELLED') logActivity(d.customerId, 'contract', `המסמך ${d.number} בוטל`); return d; }
  const docSend = path.match(/^\/documents\/([^/]+)\/send$/);
  if (docSend && method === 'POST') { const list = getDocs().map((d: any) => (d.id === docSend[1] ? { ...d, sentChannel: body.channel } : d)); write(LS_DOCS, list); const d = list.find((x: any) => x.id === docSend[1]); if (d?.customerId) logActivity(d.customerId, 'contract', `${DOC_TYPES[d.type]?.label} ${d.number} נשלח ב-${body.channel}`); return d; }

  if (path === '/billing-settings' && method === 'GET') return getBilling();
  if (path === '/billing-settings' && method === 'POST') { const s = { ...getBilling(), ...body }; write(LS_BILLING, s); return s; }
  if (path === '/campaigns' && method === 'GET') return getCampaigns();
  if (path === '/campaigns' && method === 'POST') { const c = { id: 'cm' + Date.now(), leads: 0, deals: 0, revenue: 0, active: true, color: '#6366f1', ...body }; write(LS_CAMPAIGNS, [c, ...getCampaigns()]); return c; }
  const cmOne = path.match(/^\/campaigns\/([^/]+)$/);
  if (cmOne && method === 'PATCH') { const list = getCampaigns().map((c: any) => (c.id === cmOne[1] ? { ...c, ...body } : c)); write(LS_CAMPAIGNS, list); return list.find((c: any) => c.id === cmOne[1]); }

  // ---- contracts ----
  if (path === '/contracts' && method === 'GET') return getContracts();
  if (path === '/contracts' && method === 'POST') {
    const list = getContracts();
    let saved;
    if (body.id) { saved = body; write(LS_CONTRACTS, list.map((c: any) => (c.id === body.id ? body : c))); }
    else { saved = { ...body, id: 'k' + Date.now() }; write(LS_CONTRACTS, [saved, ...list]); }
    return saved;
  }
  const cOne = path.match(/^\/contracts\/([^/]+)$/);
  if (cOne && method === 'GET') return getContracts().find((c: any) => c.id === cOne[1]) ?? null;
  if (cOne && method === 'PATCH') {
    const list = getContracts().map((c: any) => (c.id === cOne[1] ? { ...c, ...body } : c));
    write(LS_CONTRACTS, list);
    const c = list.find((x: any) => x.id === cOne[1]);
    if (c?.customerId && body.status) logActivity(c.customerId, 'contract', body.status === 'CANCELLED' ? `ההסכם "${c.title}" בוטל` : `סטטוס ההסכם עודכן`);
    return c;
  }
  if (cOne && method === 'DELETE') {
    const c = getContracts().find((x: any) => x.id === cOne[1]);
    write(LS_CONTRACTS, getContracts().filter((x: any) => x.id !== cOne[1]));
    if (c?.customerId) logActivity(c.customerId, 'contract', `הטיוטה "${c.title}" נמחקה`);
    return { ok: true };
  }
  const cSend = path.match(/^\/contracts\/([^/]+)\/send$/);
  if (cSend && method === 'POST') {
    const list = getContracts().map((c: any) => (c.id === cSend[1] ? { ...c, status: 'SENT', sentChannel: body.channel } : c));
    write(LS_CONTRACTS, list);
    const c = list.find((x: any) => x.id === cSend[1]);
    if (c?.customerId) logActivity(c.customerId, 'contract', `ההסכם "${c.title}" נשלח לחתימה ב-${body.channel}`);
    return c;
  }
  const cSign = path.match(/^\/contracts\/([^/]+)\/sign$/);
  if (cSign && method === 'POST') {
    const now = new Date();
    const audit = {
      status: 'SIGNED', signature: body.signature, signerName: body.signerName,
      signedAt: now.toLocaleString('he-IL'),
      ip: body.ip ?? `84.21.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 250) + 1}`,
      device: body.device ?? 'דפדפן',
      userAgent: body.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
    };
    const list = getContracts().map((c: any) => (c.id === cSign[1] ? { ...c, ...audit } : c));
    write(LS_CONTRACTS, list);
    const c = list.find((x: any) => x.id === cSign[1]);
    if (c?.customerId) logActivity(c.customerId, 'contract', `ההסכם נחתם דיגיטלית (IP ${audit.ip})`, audit.signerName || 'הלקוח');
    return c;
  }

  const cuUpd = path.match(/^\/customers\/([^/]+)$/);
  if (cuUpd && method === 'PATCH') {
    const before = getCustomers().find((c: any) => c.id === cuUpd[1]);
    const changed = before ? Object.keys(body).filter((k) => FIELD_LABELS[k] && String(body[k]) !== String((before as any)[k])).map((k) => FIELD_LABELS[k]) : [];
    const list = getCustomers().map((c: any) => (c.id === cuUpd[1] ? { ...c, ...body } : c));
    write(LS_CUSTOMERS, list);
    if (changed.length) logActivity(cuUpd[1], 'edit', `עודכנו פרטי לקוח: ${changed.join(', ')}`);
    return list.find((c: any) => c.id === cuUpd[1]);
  }
  if (cuUpd && method === 'GET') return getCustomers().find((c: any) => c.id === cuUpd[1]) ?? null;

  if (path === '/ai/ask') {
    const q = body.question ?? '';
    let answer = 'על פי הנתונים: החודש נכנסו 9 לידים, נסגרה עסקה אחת, וההכנסה הצפויה עומדת על ₪157,000. אחוז ההמרה הנוכחי הוא 11%.';
    if (q.includes('הכנס') || q.includes('כסף')) answer = 'ההכנסה הצפויה מאירועים סגורים היא ₪157,000. החודש החזק ביותר השנה הוא אפריל (₪132K).';
    else if (q.includes('ליד')) answer = 'החודש נכנסו 9 לידים. המקור המוביל הוא פייסבוק (3 לידים), אחריו אינסטגרם.';
    else if (q.includes('אירוע')) answer = 'יש 4 אירועים עתידיים. הקרוב ביותר: חתונה של גל & מאיה ב-12.7 (350 מוזמנים).';
    return { answer };
  }

  return {};
}
