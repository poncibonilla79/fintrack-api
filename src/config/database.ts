// ═══════════════════════════════════════════════════════════════════════════
// Conexión a BD — Singleton PrismaClient con adapter PostgreSQL
//
// Patrón:
//   - Pool de pg compartido (PrismaPg adapter)
//   - Singleton global reciclado en desarrollo (hot-reload)
//   - dotenv.config() al inicio asegura vars de entorno disponibles
//
// Para migrar a otra BD:
//   1. Cambiar provider en schema.prisma
//   2. Cambiar adapter aquí (ej: @prisma/adapter-planetscale)
//   3. Ajustar DATABASE_URL en .env
// ═══════════════════════════════════════════════════════════════════════════

import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
    return;
  }
  console.log('✅ Conexión a PostgreSQL establecida correctamente');
  release();
});

const adapter = new PrismaPg(pool);

// Cache global para desarrollo (evita múltiples instancias con hot-reload)
declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
