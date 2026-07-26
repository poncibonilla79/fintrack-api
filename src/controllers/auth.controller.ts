import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { getAuthUserId } from '../middleware/auth.middleware';
import { sendCreated, sendSuccess } from '../utils/response.util';
import { UserPublic } from '../types/user.types';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      sendCreated(res, result, 'Usuario registrado exitosamente');
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Inicio de sesion exitoso');
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(getAuthUserId(req));
      sendSuccess(res, { user }, 'Perfil obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  },
};
