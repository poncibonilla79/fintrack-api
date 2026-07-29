import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/app-error';
import { CreateTransactionDto, UpdateTransactionDto, TransactionFilter } from '../types/transaction.types';
import { CATEGORY_INCLUDE, TransactionWithCategory } from '../types/prisma-includes';

export const transactionService = {
  async list(userId: string, filters: TransactionFilter): Promise<TransactionWithCategory[]> {
    const where: Prisma.TransactionWhereInput = { userId };

    if (filters.month && filters.year) {
      const start = new Date(filters.year, filters.month - 1, 1);
      const end = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;

    return prisma.transaction.findMany({
      where,
      include: CATEGORY_INCLUDE,
      orderBy: { date: 'desc' },
    });
  },

  async create(data: CreateTransactionDto, userId: string): Promise<TransactionWithCategory> {
    return prisma.transaction.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        type: data.type,
        categoryId: data.categoryId,
        userId,
      },
      include: CATEGORY_INCLUDE,
    });
  },

  async update(id: string, userId: string, data: UpdateTransactionDto): Promise<TransactionWithCategory> {
    const tx = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new AppError(404, 'Transaccion no encontrada');

    const cleanData: Prisma.TransactionUpdateInput = {};
    const allowedFields: (keyof UpdateTransactionDto)[] = ['amount', 'description', 'date', 'type', 'categoryId'];
    for (const key of allowedFields) {
      if (key in data && data[key] !== undefined) {
        if (key === 'date') {
          cleanData.date = new Date(data.date as string);
        } else {
          (cleanData as Record<string, unknown>)[key] = data[key];
        }
      }
    }

    return prisma.transaction.update({
      where: { id },
      data: cleanData,
      include: CATEGORY_INCLUDE,
    });
  },

  async remove(id: string, userId: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new AppError(404, 'Transaccion no encontrada');

    return prisma.transaction.delete({ where: { id } });
  },
};
