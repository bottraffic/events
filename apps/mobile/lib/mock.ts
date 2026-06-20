import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Demo data layer for mobile — mirrors apps/web/lib/mock.ts so both clients
 * show the same demo content. Persists to AsyncStorage. Set extra.demo=false
 * (app.json) to use the real shared API instead.
 */

export interface MockStage { id: string; name: string; color: string; type: string; order: number; }
export interface MockLead { id: string; name: string; phone?: string; source: string; score?: number; estimatedValue?: number; stageId: string; }
export interface MockEvent { id: string; type: string; eventDate: string; guestsCount: number; status: string; totalPrice?: number; customer?: { name: string; partnerName?: string }; }

export const STAGES: MockStage[] = [
  { id: 'stage-1', name: 'ליד חדש', color: '#6366f1', type: 'OPEN', order: 1 },
  { id: 'stage-2', name: 'תיאום פגישה', color: '#8b5cf6', type: 'OPEN', order: 2 },
  { id: 'stage-3', name: 'פגישה בוצעה', color: '#0ea5e9', type: 'OPEN', order: 3 },
  { id: 'stage-4', name: 'הצעת מחיר', color: '#f59e0b', type: 'OPEN', order: 4 },
  { id: 'stage-5', name: 'מו"מ', color: '#f97316', type: 'OPEN', order: 5 },
  { id: 'stage-6', name: 'נסגר', color: '#10b981', type: 'WON', order: 6 },
  { id: 'stage-7', name: 'הפסד', color: '#ef4444', type: 'LOST', order: 7 },
];

const SEED_LEADS: MockLead[] = [
  { id: 'l1', name: 'יוסי כהן', phone: '050-1111111', source: 'FACEBOOK', score: 88, estimatedValue: 90000, stageId: 'stage-1' },
  { id: 'l2', name: 'רינה לוי', phone: '050-2222222', source: 'INSTAGRAM', score: 64, estimatedValue: 75000, stageId: 'stage-2' },
  { id: 'l3', name: 'דנה ברק', phone: '050-3333333', source: 'GOOGLE_ADS', score: 71, estimatedValue: 85000, stageId: 'stage-3' },
  { id: 'l4', name: 'משה צור', phone: '050-4444444', source: 'WHATSAPP', score: 55, estimatedValue: 60000, stageId: 'stage-4' },
  { id: 'l5', name: 'אבי רוזן', phone: '050-5555555', source: 'REFERRAL', score: 79, estimatedValue: 92000, stageId: 'stage-5' },
  { id: 'l6', name: 'גל מזרחי', phone: '050-6666666', source: 'WEBSITE', score: 91, estimatedValue: 78000, stageId: 'stage-6' },
];

const SEED_EVENTS: MockEvent[] = [
  { id: 'e1', type: 'חתונה', eventDate: '2026-07-12', guestsCount: 350, status: 'BOOKED', totalPrice: 92000, customer: { name: 'גל', partnerName: 'מאיה' } },
  { id: 'e2', type: 'בר מצווה', eventDate: '2026-08-03', guestsCount: 180, status: 'OPTION', totalPrice: 48000, customer: { name: 'משפחת לוי' } },
  { id: 'e3', type: 'חתונה', eventDate: '2026-09-21', guestsCount: 420, status: 'INQUIRY', totalPrice: 0, customer: { name: 'דניאל', partnerName: 'שירה' } },
];

const CUSTOMERS = [
  { id: 'cu1', name: 'גל מזרחי', partner: 'מאיה לוי', phone: '050-6666666', email: 'gal@mail.com', eventType: 'חתונה', eventDate: '2026-07-12', guests: 350, hall: 'אולם הדר', value: 92000, status: 'לקוח פעיל' },
  { id: 'cu2', name: 'משפחת לוי', partner: '', phone: '050-2222222', email: 'levi@mail.com', eventType: 'בר מצווה', eventDate: '2026-08-03', guests: 180, hall: 'גן ורדים', value: 48000, status: 'לקוח' },
  { id: 'cu3', name: 'דניאל אבני', partner: 'שירה כהן', phone: '050-7777777', email: 'dani@mail.com', eventType: 'חתונה', eventDate: '2026-09-21', guests: 420, hall: 'אולם הדר', value: 110000, status: 'ליד חם' },
  { id: 'cu4', name: 'חברת טק-נובה', partner: '', phone: '03-5550000', email: 'events@technova.com', eventType: 'אירוע חברה', eventDate: '2026-06-30', guests: 250, hall: 'אולם הדר', value: 195000, status: 'לקוח VIP' },
];
const APPTS = [
  { id: 'ap1', customerName: 'גל מזרחי', title: 'סיור באולם + טעימות', type: 'סיור', date: '2026-06-22', time: '18:00' },
  { id: 'ap2', customerName: 'דניאל אבני', title: 'פגישת סגירה', type: 'פגישה', date: '2026-06-25', time: '12:00' },
  { id: 'ap3', customerName: 'עומר רז', title: 'שיחת תיאום DJ', type: 'שיחה', date: '2026-06-20', time: '10:30' },
];
const SEED_TASKS = [
  { id: 't1', title: 'התקשר ליוסי כהן לתיאום סיור', dueAt: '2026-06-19T14:00', priority: 'HIGH', done: false },
  { id: 't2', title: 'שלח הצעת מחיר לרינה לוי', dueAt: '2026-06-19T17:00', priority: 'URGENT', done: false },
  { id: 't3', title: 'מעקב חוזה עומר & ליהי', dueAt: '2026-06-21T10:00', priority: 'MEDIUM', done: false },
  { id: 't4', title: 'אישור תפריט אירוע טק-נובה', dueAt: '2026-06-17T16:00', priority: 'LOW', done: true },
];
const GUESTS = [
  { id: 'g1', name: 'דוד כהן', group: 'משפחת חתן', size: 2, status: 'YES' },
  { id: 'g2', name: 'מיכל לוי', group: 'חברים', size: 1, status: 'YES' },
  { id: 'g3', name: 'רון אבני', group: 'עבודה', size: 2, status: 'MAYBE' },
  { id: 'g4', name: 'תמר שגב', group: 'משפחת כלה', size: 4, status: 'PENDING' },
  { id: 'g5', name: 'יואב מור', group: 'חברים', size: 2, status: 'NO' },
  { id: 'g6', name: 'נטע גל', group: 'משפחת חתן', size: 1, status: 'YES' },
];
const CALLS = [
  { id: 'ca1', name: 'יוסי כהן', number: '050-1111111', status: 'ANSWERED', dur: '6:42', prob: 88 },
  { id: 'ca2', name: 'מספר חסום', number: '054-7777777', status: 'MISSED', dur: '0:00', prob: 0 },
  { id: 'ca3', name: 'דנה ברק', number: '050-3333333', status: 'ANSWERED', dur: '2:51', prob: 73 },
];
const DOCS = [
  { id: 'd1', number: 'INR-2026-0001', type: 'חשבונית מס/קבלה', customerName: 'גל מזרחי', total: 27140, status: 'ISSUED' },
  { id: 'd2', number: 'PRO-2026-0001', type: 'חשבונית עסקה', customerName: 'חברת טק-נובה', total: 76700, status: 'ISSUED' },
];

const LS_LEADS = 'demo_leads';
const LS_TASKS = 'demo_tasks';
let leadsCache: MockLead[] | null = null;
let tasksCache: any[] | null = null;

export function isDemo(): boolean {
  return Constants.expoConfig?.extra?.demo !== false;
}

async function getLeads(): Promise<MockLead[]> {
  if (leadsCache) return leadsCache;
  const raw = await AsyncStorage.getItem(LS_LEADS);
  leadsCache = raw ? JSON.parse(raw) : SEED_LEADS;
  return leadsCache!;
}
async function saveLeads(leads: MockLead[]) {
  leadsCache = leads;
  await AsyncStorage.setItem(LS_LEADS, JSON.stringify(leads));
}

export async function mockApi(path: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method ?? 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  await new Promise((r) => setTimeout(r, 120));

  if (path === '/auth/login' || path === '/auth/register-tenant') {
    return {
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      tenant: { id: 'demo', name: 'אולמי דמו', slug: 'demo' },
      user: { id: 'u1', name: 'דני מנהל', email: body.email ?? 'admin@demo.simcha.io' },
    };
  }
  if (path === '/auth/me') return { id: 'u1', name: 'דני מנהל', roles: ['ADMIN'] };

  if (path === '/tenant' && method === 'GET') {
    const logo = await AsyncStorage.getItem('demo_logo');
    return { id: 'demo', name: 'אולמי דמו', slug: 'demo', logoUrl: logo || null };
  }
  if (path === '/tenant/logo' && method === 'PATCH') { await AsyncStorage.setItem('demo_logo', body.logo || ''); return { ok: true, logoUrl: body.logo }; }
  if (path === '/tenant/logo/remove') { await AsyncStorage.removeItem('demo_logo'); return { ok: true }; }

  if (path === '/pipeline') {
    const leads = await getLeads();
    return STAGES.map((s) => ({ ...s, leadsCount: leads.filter((l) => l.stageId === s.id).length }));
  }
  if (path === '/leads' && method === 'GET') return getLeads();
  if (path === '/leads' && method === 'POST') {
    const leads = await getLeads();
    const lead: MockLead = { id: 'l' + Date.now(), name: body.name, source: body.source ?? 'OTHER', stageId: 'stage-1', score: Math.floor(40 + Math.random() * 55) };
    await saveLeads([lead, ...leads]);
    return lead;
  }
  const stageMatch = path.match(/^\/leads\/([^/]+)\/stage$/);
  if (stageMatch && method === 'PATCH') {
    const leads = (await getLeads()).map((l) => (l.id === stageMatch[1] ? { ...l, stageId: body.stageId } : l));
    await saveLeads(leads);
    return leads.find((l) => l.id === stageMatch[1]);
  }
  if (path === '/events') return SEED_EVENTS;
  if (path === '/customers') return CUSTOMERS;
  if (path === '/appointments') return APPTS;
  if (path === '/guests') return GUESTS;
  if (path === '/calls') return CALLS;
  if (path === '/documents') return DOCS;

  if (path === '/tasks' && method === 'GET') {
    if (!tasksCache) { const raw = await AsyncStorage.getItem(LS_TASKS); tasksCache = raw ? JSON.parse(raw) : SEED_TASKS; }
    return tasksCache;
  }
  if (path === '/tasks' && method === 'POST') {
    if (!tasksCache) tasksCache = SEED_TASKS;
    const t = { id: 't' + Date.now(), done: false, priority: 'MEDIUM', dueAt: '', ...body };
    tasksCache = [t, ...tasksCache]; await AsyncStorage.setItem(LS_TASKS, JSON.stringify(tasksCache)); return t;
  }
  const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (taskMatch && method === 'PATCH') {
    tasksCache = (tasksCache ?? SEED_TASKS).map((t) => (t.id === taskMatch[1] ? { ...t, ...body } : t));
    await AsyncStorage.setItem(LS_TASKS, JSON.stringify(tasksCache)); return tasksCache.find((t) => t.id === taskMatch[1]);
  }

  if (path === '/notifications') return [
    { id: 'n1', type: 'lead', title: 'ליד חדש מפייסבוק', body: 'יוסי כהן · חתונה 350 איש', time: 'עכשיו' },
    { id: 'n2', type: 'task', title: 'תזכורת: התקשר לרינה לוי', body: 'מתוזמן ל-17:00 היום', time: 'בעוד שעה' },
    { id: 'n3', type: 'contract', title: 'חוזה נחתם', body: 'אבי רוזן · ₪92,000', time: 'לפני שעה' },
    { id: 'n4', type: 'message', title: 'הודעת WhatsApp חדשה', body: 'דנה ברק שלחה הודעה', time: 'לפני שעתיים' },
    { id: 'n5', type: 'rsvp', title: 'אישור הגעה', body: '12 אורחים אישרו · גל & מאיה', time: 'אתמול' },
  ];
  if (path === '/ai/ask') {
    const q = body.question ?? '';
    let answer = 'החודש נכנסו 6 לידים, נסגרה עסקה אחת, וההכנסה הצפויה היא ₪157,000.';
    if (q.includes('הכנס') || q.includes('כסף')) answer = 'ההכנסה הצפויה מאירועים סגורים היא ₪157,000.';
    else if (q.includes('ליד')) answer = 'נכנסו 6 לידים החודש. המקור המוביל הוא פייסבוק.';
    else if (q.includes('אירוע') || q.includes('פגיש')) answer = 'יש 3 אירועים קרובים. הקרוב: סיור עם גל מזרחי ב-22.6 בשעה 18:00.';
    else if (q.includes('משימ')) answer = 'יש לך 3 משימות פתוחות, אחת דחופה: שליחת הצעת מחיר לרינה לוי.';
    return { answer };
  }

  if (path === '/reports/overview') {
    const leads = await getLeads();
    const closed = leads.filter((l) => l.stageId === 'stage-6').length;
    return {
      leadsThisMonth: leads.length,
      closedDeals: closed,
      totalLeads: leads.length,
      upcomingEvents: SEED_EVENTS.length,
      expectedRevenue: SEED_EVENTS.filter((e) => ['BOOKED', 'COMPLETED'].includes(e.status)).reduce((a, e) => a + (e.totalPrice ?? 0), 0),
      conversionRate: leads.length ? Math.round((closed / leads.length) * 100) : 0,
    };
  }
  return {};
}
