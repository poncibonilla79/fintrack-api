import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';
import { getAuthUserId } from '../middleware/auth.middleware';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.util';

export const usersController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.findAll();
      sendSuccess(res, { data: users, count: users.length });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.findById(req.params.id as string);
      if (!user) { sendSuccess(res, null, 'Usuario no encontrado'); return; }
      sendSuccess(res, { data: user });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body);
      sendCreated(res, { data: user });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id as string, req.body, getAuthUserId(req));
      sendSuccess(res, { data: user });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.remove(req.params.id as string, getAuthUserId(req));
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },
};
