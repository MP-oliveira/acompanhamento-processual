import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { auth } from '../middlewares/auth.js';
import { 
  register, 
  login, 
  me, 
  updateProfile 
} from '../controllers/authController.js';

const router = Router();

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // máximo 15 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Rotas públicas
router.post('/register', register);
router.post('/login', loginLimiter, login);

// Rotas protegidas
router.get('/me', auth, me);
router.put('/profile', auth, updateProfile);

export default router;
