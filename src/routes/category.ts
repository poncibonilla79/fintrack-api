import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { categoryController } from '../controllers/category.controller';
import { createCategorySchema, updateCategorySchema, deleteCategorySchema } from '../schemas/category.schema';

const router = Router();

router.get('/', authMiddleware, categoryController.list);
router.post('/', authMiddleware, validate(createCategorySchema), categoryController.create);
router.put('/:id', authMiddleware, validate(updateCategorySchema), categoryController.update);
router.delete('/:id', authMiddleware, validate(deleteCategorySchema), categoryController.remove);

export default router;
