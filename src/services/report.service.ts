import prisma from '../config/database';
import { MonthlySummaryResponse, BudgetVsActualResponse, MonthlyTrend, RawTrendRow } from '../types/report.types';

const CATEGORY_INCLUDE = { category: { select: { id: true, name: true, icon: true, color: true } } } as const;

export const reportService = {
  async monthlySummary(userId: string, month: number, year: number): Promise<MonthlySummaryResponse> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: CATEGORY_INCLUDE,
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const byCategory: Record<string, { name: string; icon: string | null; color: string | null; amount: number; count: number }> = {};

    for (const t of transactions) {
      const key = t.categoryId;
      if (!byCategory[key]) {
        byCategory[key] = {
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          amount: 0,
          count: 0,
        };
      }
      byCategory[key].amount += Number(t.amount);
      byCategory[key].count++;
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory: Object.values(byCategory).sort((a, b) => b.amount - a.amount),
    };
  },

  async budgetVsActual(userId: string, month: number, year: number): Promise<BudgetVsActualResponse> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [budgets, transactions] = await Promise.all([
      prisma.budget.findMany({
        where: { userId, month, year },
        include: CATEGORY_INCLUDE,
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: end }, type: 'EXPENSE' },
        select: { amount: true, categoryId: true },
      }),
    ]);

    const spentByCategory: Record<string, number> = {};
    for (const t of transactions) {
      spentByCategory[t.categoryId] = (spentByCategory[t.categoryId] || 0) + Number(t.amount);
    }

    const totalSpent = transactions.reduce((s, t) => s + Number(t.amount), 0);
    const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);

    const details = budgets
      .filter(b => b.categoryId)
      .map(b => ({
        category: b.category,
        budgeted: Number(b.amount),
        spent: spentByCategory[b.categoryId!] || 0,
        remaining: Number(b.amount) - (spentByCategory[b.categoryId!] || 0),
      }));

    const globalBudget = budgets
      .filter(b => !b.categoryId)
      .reduce((s, b) => s + Number(b.amount), 0);

    const categorizedSpent = Object.values(spentByCategory).reduce((s, v) => s + v, 0);
    const globalSpent = totalSpent - categorizedSpent;

    return {
      totalBudget,
      totalSpent,
      globalRemaining: globalBudget - globalSpent,
      details,
    };
  },

  async trends(userId: string, months: number): Promise<MonthlyTrend[]> {
    const start = new Date();
    start.setMonth(start.getMonth() - months + 1);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const rows = await prisma.$queryRaw<RawTrendRow[]>`
      SELECT
        EXTRACT(MONTH FROM t."date")::int AS month,
        EXTRACT(YEAR FROM t."date")::int AS year,
        COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense
      FROM "transactions" t
      WHERE t."userId" = ${userId}
        AND t."date" >= ${start}
      GROUP BY year, month
      ORDER BY year, month
    `;

    return rows.map(r => ({
      month: r.month,
      year: r.year,
      income: Number(r.income),
      expense: Number(r.expense),
    }));
  },
};
