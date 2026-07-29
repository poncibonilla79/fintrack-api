import { Prisma } from '@prisma/client';

export const CATEGORY_INCLUDE = {
  category: { select: { id: true, name: true, icon: true, color: true } },
} as const;

export type TransactionWithCategory = Prisma.TransactionGetPayload<{ include: typeof CATEGORY_INCLUDE }>;
export type BudgetWithCategory = Prisma.BudgetGetPayload<{ include: typeof CATEGORY_INCLUDE }>;
