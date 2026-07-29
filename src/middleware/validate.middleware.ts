import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response.util';

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body:   req.body,
      params: req.params,
      query:  req.query,
    });

    if (!result.success) {
      const details = result.error.issues.map(e => ({
        field:   e.path.slice(1).join('.'),
        message: e.message,
      }));
      const body = {
        success: false as const,
        status: 400 as const,
        message: 'Datos de entrada invalidos',
        error: 'Datos de entrada invalidos',
        details,
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(body);
      return;
    }

    next();
  };
