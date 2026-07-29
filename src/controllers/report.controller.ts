import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { sendSuccess } from '../utils/response.util';
import { getAuthUserId } from '../middleware/auth.middleware';

export const reportController = {
  async monthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const month = Number(query.month);
      const year = Number(query.year);
      const data = await reportService.monthlySummary(getAuthUserId(req), month, year);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async budgetVsActual(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const month = Number(query.month);
      const year = Number(query.year);
      const data = await reportService.budgetVsActual(getAuthUserId(req), month, year);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async trends(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const year = Number(query.year) || new Date().getFullYear();
      const data = await reportService.trends(getAuthUserId(req), year);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },
};
