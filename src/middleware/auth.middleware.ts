// ═══════════════════════════════════════════════════════════════════════════
// Autenticación JWT
//
// authMiddleware → protege rutas, inyecta req.user
// getAuthUserId → helper tipado para controllers
//
// Para agregar roles/permissions:
//   1. Extender el payload JWT con role
//   2. Crear middleware requireRole('ADMIN')
//   3. Verificar req.user.role antes de cada operación
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';
import { sendError } from '../utils/response.util';
import { AppError } from '../utils/app-error';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'JWT_SECRET no configurado en el servidor');
  }
  return secret;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getSecret()) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    sendError(res, 401, 'Token inválido o expirado');
  }
};

// Helper para extraer userId con type-safety.
// Lanza AppError 401 si el middleware auth no se ejecutó antes.
export function getAuthUserId(req: Request): string {
  if (!req.user?.userId) {
    throw new AppError(401, 'No autenticado');
  }
  return req.user.userId;
}
