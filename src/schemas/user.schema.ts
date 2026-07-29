import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(100),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).max(100).optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
