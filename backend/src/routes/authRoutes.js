import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { 
  register, 
  login, 
  me, 
  updateProfile 
} from '../controllers/authController.js';

const router = Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// Rotas protegidas
router.get('/me', auth, me);
router.put('/profile', auth, updateProfile);

export default router;
