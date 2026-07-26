import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    categoryId: z.string().nullable().optional(),
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const deleteBudgetSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const listBudgetsSchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2000).max(2100),
  }),
});
