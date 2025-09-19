import { Router } from 'express';
import { auth, adminOnly } from '../middlewares/auth.js';
import { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  deactivateUser,
  activateUser
} from '../controllers/userController.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas que requerem permissão de admin
router.get('/', adminOnly, getAllUsers);
router.post('/', adminOnly, createUser);
router.patch('/:id/deactivate', adminOnly, deactivateUser);
router.patch('/:id/activate', adminOnly, activateUser);

// Rotas que qualquer usuário autenticado pode acessar
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/password', updatePassword);

export default router;
