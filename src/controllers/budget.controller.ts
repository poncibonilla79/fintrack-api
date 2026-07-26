import { Request, Response, NextFunction } from 'express';
import { budgetService } from '../services/budget.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getAuthUserId } from '../middleware/auth.middleware';

export const budgetController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const month = Number(query.month);
      const year = Number(query.year);
      const budgets = await budgetService.list(getAuthUserId(req), month, year);
      sendSuccess(res, budgets);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.create(req.body, getAuthUserId(req));
      sendCreated(res, budget, 'Presupuesto creado');
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const budget = await budgetService.update(id, getAuthUserId(req), req.body.amount);
      sendSuccess(res, budget, 'Presupuesto actualizado');
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await budgetService.remove(id, getAuthUserId(req));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },
};
