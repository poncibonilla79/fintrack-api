import prisma from '../src/config/database';

const DEFAULT_CATEGORIES = [
  { id: 'seed-income-salary',     name: 'Salario',       type: 'INCOME'  as const, icon: 'briefcase', color: '#22c55e' },
  { id: 'seed-income-freelance',  name: 'Freelance',     type: 'INCOME'  as const, icon: 'laptop',    color: '#16a34a' },
  { id: 'seed-income-investments',name: 'Inversiones',   type: 'INCOME'  as const, icon: 'trending-up', color: '#15803d' },
  { id: 'seed-expense-food',      name: 'Comida',        type: 'EXPENSE' as const, icon: 'utensils',  color: '#ef4444' },
  { id: 'seed-expense-transport', name: 'Transporte',    type: 'EXPENSE' as const, icon: 'car',       color: '#f97316' },
  { id: 'seed-expense-services',  name: 'Servicios',     type: 'EXPENSE' as const, icon: 'zap',       color: '#eab308' },
  { id: 'seed-expense-entertain', name: 'Entretencion',  type: 'EXPENSE' as const, icon: 'gamepad-2', color: '#a855f7' },
  { id: 'seed-expense-health',    name: 'Salud',         type: 'EXPENSE' as const, icon: 'heart-pulse', color: '#ec4899' },
  { id: 'seed-expense-education', name: 'Educacion',     type: 'EXPENSE' as const, icon: 'book-open', color: '#3b82f6' },
  { id: 'seed-expense-shopping',  name: 'Compras',       type: 'EXPENSE' as const, icon: 'shopping-bag', color: '#06b6d4' },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@fintrack.com' },
    update: {},
    create: {
      id: 'seed-user-demo',
      name: 'Usuario Demo',
      email: 'demo@fintrack.com',
      password: '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm0GqTmZ3XkqOjVsqOae',
    },
  });

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: { ...cat, userId: null },
    });
  }

  const transactions = [
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-07-01'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 800,  description: 'Proyecto freelance web',      date: new Date('2026-07-05'), type: 'INCOME'  as const, categoryId: 'seed-income-freelance',   userId: user.id },
    { amount: 200,  description: 'Dividendos acciones',         date: new Date('2026-07-10'), type: 'INCOME'  as const, categoryId: 'seed-income-investments', userId: user.id },
    { amount: 350,  description: 'Supermercado mensual',        date: new Date('2026-07-03'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 50,   description: 'Uber al trabajo',             date: new Date('2026-07-04'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 120,  description: 'Cuenta de luz',               date: new Date('2026-07-06'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 60,   description: 'Internet + Netflix',          date: new Date('2026-07-06'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 45,   description: 'Cena con amigos',             date: new Date('2026-07-12'), type: 'EXPENSE' as const, categoryId: 'seed-expense-entertain',  userId: user.id },
  ];

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }

  const budgets = [
    { amount: 500,  month: 7, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
    { amount: 150,  month: 7, year: 2026, categoryId: 'seed-expense-transport', userId: user.id },
    { amount: 200,  month: 7, year: 2026, categoryId: 'seed-expense-services',  userId: user.id },
    { amount: 300,  month: 7, year: 2026, categoryId: null,                      userId: user.id },
    { amount: 500,  month: 8, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
  ];

  for (const b of budgets) {
    await prisma.budget.create({
      data: {
        amount: b.amount,
        month: b.month,
        year: b.year,
        categoryId: b.categoryId ?? undefined,
        userId: b.userId,
      },
    });
  }

  console.log('Seed completado exitosamente');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
