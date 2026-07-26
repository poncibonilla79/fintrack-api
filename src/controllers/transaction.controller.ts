import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getAuthUserId } from '../middleware/auth.middleware';

export const transactionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year, type, categoryId } = req.query as Record<string, string | undefined>;
      const transactions = await transactionService.list(getAuthUserId(req), {
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        type: type as 'INCOME' | 'EXPENSE' | undefined,
        categoryId,
      });
      sendSuccess(res, transactions);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tx = await transactionService.create(req.body, getAuthUserId(req));
      sendCreated(res, tx, 'Transacción creada');
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const tx = await transactionService.update(id, getAuthUserId(req), req.body);
      sendSuccess(res, tx, 'Transacción actualizada');
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await transactionService.remove(id, getAuthUserId(req));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },
};
