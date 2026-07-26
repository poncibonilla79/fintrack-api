import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from './middleware/error.middleware';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import categoryRouter from './routes/category';
import transactionRouter from './routes/transaction';
import budgetRouter from './routes/budget';
import reportRouter from './routes/report';
import healthRouter from './routes/health';
import { openapiSpec } from './docs/openapi';
import { sendSuccess, sendError } from './utils/response.util';

dotenv.config();

const app: Application = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'];

app.use(helmet());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FinTrack API Docs',
}));

app.get('/', (_req: Request, res: Response) => {
  sendSuccess(res, {
    project: 'FinTrack API',
    version: '1.0.0',
    endpoints: ['/health', '/api/auth', '/api/categories', '/api/transactions', '/api/budgets', '/api/reports'],
  });
});

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/budgets', budgetRouter);
app.use('/api/reports', reportRouter);

app.use((_req: Request, res: Response) => sendError(res, 404));
app.use(errorMiddleware);

export default app;
