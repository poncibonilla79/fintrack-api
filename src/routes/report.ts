import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { reportController } from '../controllers/report.controller';
import { z } from 'zod';

const monthlySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2000).max(2100),
  }),
});

const trendsSchema = z.object({
  query: z.object({
    year: z.coerce.number().int().min(2000).max(2100),
  }),
});

const router = Router();

router.get('/monthly', authMiddleware, validate(monthlySchema), reportController.monthlySummary);
router.get('/budget', authMiddleware, validate(monthlySchema), reportController.budgetVsActual);
router.get('/trends', authMiddleware, validate(trendsSchema), reportController.trends);

export default router;
