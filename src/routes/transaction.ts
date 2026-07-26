import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { transactionController } from '../controllers/transaction.controller';
import {
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  listTransactionsSchema,
} from '../schemas/transaction.schema';

const router = Router();

router.get('/', authMiddleware, validate(listTransactionsSchema), transactionController.list);
router.post('/', authMiddleware, validate(createTransactionSchema), transactionController.create);
router.put('/:id', authMiddleware, validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', authMiddleware, validate(deleteTransactionSchema), transactionController.remove);

export default router;
