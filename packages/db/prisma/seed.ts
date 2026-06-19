import { PrismaClient, Plan, RoleLevel, LeadSource, StageType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_STAGES: { name: string; order: number; color: string; type: StageType }[] = [
  { name: 'ליד חדש', order: 1, color: '#6366f1', type: StageType.OPEN },
  { name: 'תיאום פגישה', order: 2, color: '#8b5cf6', type: StageType.OPEN },
  { name: 'פגישה בוצעה', order: 3, color: '#0ea5e9', type: StageType.OPEN },
  { name: 'הצעת מחיר', order: 4, color: '#f59e0b', type: StageType.OPEN },
  { name: 'מו"מ', order: 5, color: '#f97316', type: StageType.OPEN },
  { name: 'נסגר', order: 6, color: '#10b981', type: StageType.WON },
  { name: 'הפסד', order: 7, color: '#ef4444', type: StageType.LOST },
];

async function main() {
  console.log('🌱 Seeding SIMCHA OS demo tenant...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'אולמי דמו',
      slug: 'demo',
      subdomain: 'demo',
      plan: Plan.PRO,
      status: 'ACTIVE',
    },
  });

  const adminRole =
    (await prisma.role.findFirst({ where: { tenantId: tenant.id, level: RoleLevel.ADMIN } })) ??
    (await prisma.role.create({
      data: { tenantId: tenant.id, name: 'מנהל', level: RoleLevel.ADMIN, isSystem: true },
    }));

  const passwordHash = await bcrypt.hash('Demo1234!', 10);
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.simcha.io' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'דני מנהל',
      email: 'admin@demo.simcha.io',
      phone: '050-0000000',
      passwordHash,
      userRoles: { create: { roleId: adminRole.id } },
    },
  });

  let stages = await prisma.pipelineStage.findMany({ where: { tenantId: tenant.id }, orderBy: { order: 'asc' } });
  if (stages.length === 0) {
    for (const s of DEFAULT_STAGES) {
      stages.push(await prisma.pipelineStage.create({ data: { tenantId: tenant.id, ...s } }));
    }
  }

  const demoLeads = [
    { name: 'יוסי כהן', phone: '050-1111111', source: LeadSource.FACEBOOK, score: 88, estimatedValue: 90000 },
    { name: 'רינה לוי', phone: '050-2222222', source: LeadSource.INSTAGRAM, score: 64, estimatedValue: 75000 },
    { name: 'דנה ברק', phone: '050-3333333', source: LeadSource.GOOGLE_ADS, score: 71, estimatedValue: 85000 },
    { name: 'משה צור', phone: '050-4444444', source: LeadSource.WHATSAPP, score: 55, estimatedValue: 60000 },
  ];

  const existingLeads = await prisma.lead.count({ where: { tenantId: tenant.id } });
  if (existingLeads === 0) {
    for (let i = 0; i < demoLeads.length; i++) {
      await prisma.lead.create({
        data: {
          tenantId: tenant.id,
          stageId: stages[i % stages.length].id,
          assignedToId: admin.id,
          ...demoLeads[i],
        },
      });
    }
  }

  console.log(`✅ Done. Login: admin@demo.simcha.io / Demo1234! (tenant: ${tenant.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
