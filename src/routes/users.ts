import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema, deleteUserSchema } from '../schemas/user.schema';

const router = Router();

router.get('/', authMiddleware, usersController.getAll);
router.get('/:id', authMiddleware, usersController.getById);
router.post('/', authMiddleware, validate(createUserSchema), usersController.create);
router.put('/:id', authMiddleware, validate(updateUserSchema), usersController.update);
router.delete('/:id', authMiddleware, validate(deleteUserSchema), usersController.remove);

export default router;
