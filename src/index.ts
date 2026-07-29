import app from './app';
import prisma from './config/database';

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`\n💰 FinTrack API — http://localhost:${PORT}`);
  console.log(`🏥 Health:       /health`);
  console.log(`🔐 Auth:         /api/auth/register  /api/auth/login`);
  console.log(`📂 Categories:   /api/categories`);
  console.log(`💳 Transactions: /api/transactions`);
  console.log(`🎯 Budgets:      /api/budgets`);
  console.log(`📊 Reports:      /api/reports/monthly  /api/reports/budget  /api/reports/trends\n`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default server;
