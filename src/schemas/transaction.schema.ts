import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    description: z.string().min(1).max(200),
    date: z.string().datetime(),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string(),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    description: z.string().min(1).max(200).optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().optional(),
  }),
});
