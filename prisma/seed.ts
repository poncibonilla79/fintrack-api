import bcrypt from 'bcryptjs';
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
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@fintrack.com' },
    update: { password: passwordHash },
    create: {
      id: 'seed-user-demo',
      name: 'Usuario Demo',
      email: 'demo@fintrack.com',
      password: passwordHash,
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
    // Enero
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-01-05'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 500,  description: 'Freelance disenio',          date: new Date('2026-01-15'), type: 'INCOME'  as const, categoryId: 'seed-income-freelance',   userId: user.id },
    { amount: 300,  description: 'Supermercado',               date: new Date('2026-01-10'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 80,   description: 'Gasolina',                   date: new Date('2026-01-12'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 150,  description: 'Cuenta de luz',              date: new Date('2026-01-15'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    // Febrero
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-02-05'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 320,  description: 'Supermercado',               date: new Date('2026-02-08'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 60,   description: 'Uber',                       date: new Date('2026-02-10'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 200,  description: 'Internet + Netflix',         date: new Date('2026-02-12'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 90,   description: 'Cine y salida',              date: new Date('2026-02-14'), type: 'EXPENSE' as const, categoryId: 'seed-expense-entertain',  userId: user.id },
    // Marzo
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-03-05'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 1000, description: 'Proyecto freelance app',     date: new Date('2026-03-10'), type: 'INCOME'  as const, categoryId: 'seed-income-freelance',   userId: user.id },
    { amount: 380,  description: 'Supermercado',               date: new Date('2026-03-07'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 100,  description: 'Gasolina',                   date: new Date('2026-03-11'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 160,  description: 'Cuenta de luz + gas',        date: new Date('2026-03-15'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 250,  description: 'Curso online',               date: new Date('2026-03-18'), type: 'EXPENSE' as const, categoryId: 'seed-expense-education',  userId: user.id },
    // Abril
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-04-05'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 150,  description: 'Dividendos',                 date: new Date('2026-04-10'), type: 'INCOME'  as const, categoryId: 'seed-income-investments', userId: user.id },
    { amount: 290,  description: 'Supermercado',               date: new Date('2026-04-06'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 70,   description: 'Uber al trabajo',            date: new Date('2026-04-09'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 130,  description: 'Cuenta de luz',              date: new Date('2026-04-14'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 400,  description: 'Ropa nueva',                 date: new Date('2026-04-20'), type: 'EXPENSE' as const, categoryId: 'seed-expense-shopping',   userId: user.id },
    // Mayo
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-05-05'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 600,  description: 'Freelance consultoria',      date: new Date('2026-05-12'), type: 'INCOME'  as const, categoryId: 'seed-income-freelance',   userId: user.id },
    { amount: 340,  description: 'Supermercado',               date: new Date('2026-05-08'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 55,   description: 'Uber',                       date: new Date('2026-05-11'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 180,  description: 'Servicios',                  date: new Date('2026-05-15'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 300,  description: 'Farmacia',                   date: new Date('2026-05-18'), type: 'EXPENSE' as const, categoryId: 'seed-expense-health',     userId: user.id },
    // Junio
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-06-05'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 200,  description: 'Dividendos',                 date: new Date('2026-06-10'), type: 'INCOME'  as const, categoryId: 'seed-income-investments', userId: user.id },
    { amount: 310,  description: 'Supermercado',               date: new Date('2026-06-07'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 90,   description: 'Gasolina',                   date: new Date('2026-06-10'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 140,  description: 'Internet + Netflix',         date: new Date('2026-06-12'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 120,  description: 'Salida con amigos',          date: new Date('2026-06-20'), type: 'EXPENSE' as const, categoryId: 'seed-expense-entertain',  userId: user.id },
    // Julio
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-07-01'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 800,  description: 'Proyecto freelance web',     date: new Date('2026-07-05'), type: 'INCOME'  as const, categoryId: 'seed-income-freelance',   userId: user.id },
    { amount: 200,  description: 'Dividendos acciones',        date: new Date('2026-07-10'), type: 'INCOME'  as const, categoryId: 'seed-income-investments', userId: user.id },
    { amount: 350,  description: 'Supermercado mensual',       date: new Date('2026-07-03'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 50,   description: 'Uber al trabajo',            date: new Date('2026-07-04'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 120,  description: 'Cuenta de luz',              date: new Date('2026-07-06'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 60,   description: 'Internet + Netflix',         date: new Date('2026-07-06'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 45,   description: 'Cena con amigos',            date: new Date('2026-07-12'), type: 'EXPENSE' as const, categoryId: 'seed-expense-entertain',  userId: user.id },
    // Agosto
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-08-05'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 400,  description: 'Freelance logo',             date: new Date('2026-08-14'), type: 'INCOME'  as const, categoryId: 'seed-income-freelance',   userId: user.id },
    { amount: 360,  description: 'Supermercado',               date: new Date('2026-08-08'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 75,   description: 'Uber',                       date: new Date('2026-08-11'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 155,  description: 'Servicios',                  date: new Date('2026-08-15'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    // Septiembre
    { amount: 2500, description: 'Salario mensual',            date: new Date('2026-09-05'), type: 'INCOME'  as const, categoryId: 'seed-income-salary',      userId: user.id },
    { amount: 180,  description: 'Dividendos',                 date: new Date('2026-09-10'), type: 'INCOME'  as const, categoryId: 'seed-income-investments', userId: user.id },
    { amount: 330,  description: 'Supermercado',               date: new Date('2026-09-07'), type: 'EXPENSE' as const, categoryId: 'seed-expense-food',       userId: user.id },
    { amount: 85,   description: 'Gasolina',                   date: new Date('2026-09-12'), type: 'EXPENSE' as const, categoryId: 'seed-expense-transport',  userId: user.id },
    { amount: 170,  description: 'Internet + Netflix',         date: new Date('2026-09-14'), type: 'EXPENSE' as const, categoryId: 'seed-expense-services',   userId: user.id },
    { amount: 200,  description: 'Farmacia',                   date: new Date('2026-09-18'), type: 'EXPENSE' as const, categoryId: 'seed-expense-health',     userId: user.id },
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
    { amount: 450,  month: 1, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
    { amount: 120,  month: 1, year: 2026, categoryId: 'seed-expense-transport', userId: user.id },
    { amount: 180,  month: 2, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
    { amount: 100,  month: 2, year: 2026, categoryId: 'seed-expense-transport', userId: user.id },
    { amount: 480,  month: 3, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
    { amount: 150,  month: 3, year: 2026, categoryId: 'seed-expense-services',  userId: user.id },
    { amount: 400,  month: 4, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
    { amount: 100,  month: 4, year: 2026, categoryId: 'seed-expense-transport', userId: user.id },
    { amount: 200,  month: 4, year: 2026, categoryId: 'seed-expense-services',  userId: user.id },
    { amount: 500,  month: 5, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
    { amount: 130,  month: 5, year: 2026, categoryId: 'seed-expense-transport', userId: user.id },
    { amount: 400,  month: 6, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
    { amount: 120,  month: 6, year: 2026, categoryId: 'seed-expense-transport', userId: user.id },
    { amount: 180,  month: 6, year: 2026, categoryId: 'seed-expense-services',  userId: user.id },
    { amount: 470,  month: 9, year: 2026, categoryId: 'seed-expense-food',      userId: user.id },
    { amount: 140,  month: 9, year: 2026, categoryId: 'seed-expense-transport', userId: user.id },
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
