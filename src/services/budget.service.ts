import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/app-error';
import { CreateBudgetDto, BudgetFilter } from '../types/budget.types';

const categoryInclude = {
  category: { select: { id: true, name: true, icon: true, color: true } },
} satisfies Prisma.BudgetInclude;

type BudgetWithCategory = Prisma.BudgetGetPayload<{ include: typeof categoryInclude }>;

export const budgetService = {
  async list(userId: string, month: BudgetFilter['month'], year: BudgetFilter['year']): Promise<BudgetWithCategory[]> {
    return prisma.budget.findMany({
      where: { userId, month, year },
      include: categoryInclude,
    });
  },

  async create(data: CreateBudgetDto, userId: string): Promise<BudgetWithCategory> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.budget.findFirst({
        where: {
          userId,
          month: data.month,
          year: data.year,
          categoryId: data.categoryId ?? null,
        },
      });

      if (existing) {
        if (!data.categoryId) {
          throw new AppError(409, 'Ya existe un presupuesto global para este mes');
        }
        throw new AppError(409, 'Ya existe un presupuesto para esta categoría en este mes');
      }

      return tx.budget.create({
        data: {
          amount: data.amount,
          month: data.month,
          year: data.year,
          categoryId: data.categoryId ?? null,
          userId,
        },
        include: categoryInclude,
      });
    });
  },

  async update(id: string, userId: string, amount: number): Promise<BudgetWithCategory> {
    const budget = await prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new AppError(404, 'Presupuesto no encontrado');

    return prisma.budget.update({
      where: { id },
      data: { amount },
      include: categoryInclude,
    });
  },

  async remove(id: string, userId: string) {
    const budget = await prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new AppError(404, 'Presupuesto no encontrado');

    return prisma.budget.delete({ where: { id } });
  },
};
