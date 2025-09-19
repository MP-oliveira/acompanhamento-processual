import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas básicas para alertas
router.get('/', (req, res) => {
  res.json({ message: 'Lista de alertas - em desenvolvimento' });
});

export default router;
