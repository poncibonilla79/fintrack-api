import { AppError } from './app-error';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError(500, 'JWT_SECRET no configurado en el servidor');
  return secret;
}

export function getJwtExpiry(): number {
  return parseInt(process.env.JWT_EXPIRES_IN || '86400', 10);
}
