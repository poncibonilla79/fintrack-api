export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  databaseUrl: string;
  corsOrigins: string[];
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || '',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map(s => s.trim()),
  };
}
