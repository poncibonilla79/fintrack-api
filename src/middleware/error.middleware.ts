// ═══════════════════════════════════════════════════════════════════════════
// Manejador global de errores
//
// Convierte cualquier error en una respuesta JSON estandarizada.
// Los AppError (errores controlados) devuelven su status específico.
// Los errores no controlados devuelven 500 (no exponen detalles internos).
//
// Para agregar manejo de errores específicos:
//   - ZodError → 400 con detalles de validación
//   - PrismaClientKnownRequestError → según el código P2002, etc.
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { AppError } from '../utils/app-error';

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error no manejado:', error);

  if (error instanceof AppError) {
    sendError(res, error.status, error.message);
    return;
  }

  sendError(res, 500);
};
