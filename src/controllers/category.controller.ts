import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';
import { getAuthUserId } from '../middleware/auth.middleware';

export const categoryController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.list(getAuthUserId(req));
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body, getAuthUserId(req));
      sendCreated(res, category, 'Categoría creada');
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const category = await categoryService.update(id, getAuthUserId(req), req.body);
      sendSuccess(res, category, 'Categoría actualizada');
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await categoryService.remove(id, getAuthUserId(req));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },
};
