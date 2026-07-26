import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    type: z.enum(['INCOME', 'EXPENSE']),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
