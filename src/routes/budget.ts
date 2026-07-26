import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { budgetController } from '../controllers/budget.controller';
import { createBudgetSchema, updateBudgetSchema, deleteBudgetSchema, listBudgetsSchema } from '../schemas/budget.schema';

const router = Router();

router.get('/', authMiddleware, validate(listBudgetsSchema), budgetController.list);
router.post('/', authMiddleware, validate(createBudgetSchema), budgetController.create);
router.put('/:id', authMiddleware, validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', authMiddleware, validate(deleteBudgetSchema), budgetController.remove);

export default router;
