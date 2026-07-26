import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response.util';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as "now"`;
    sendSuccess(res, {
      server: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
      database: {
        status: 'connected',
        queryTimestamp: result[0]?.now,
      },
    }, 'FinTrack API funcionando correctamente');
  } catch (error) {
    sendError(res, 500, 'Error al conectar con la base de datos');
  }
});

export default router;
