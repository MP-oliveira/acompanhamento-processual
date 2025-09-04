import { Router } from 'express';
import authRoutes from './authRoutes.js';
import processoRoutes from './processoRoutes.js';
import alertRoutes from './alertRoutes.js';
import consultaRoutes from './consultaRoutes.js';
import externalRoutes from './externalRoutes.js';

const router = Router();

// Rotas de autenticação (públicas)
router.use('/auth', authRoutes);

// Rotas protegidas
router.use('/processos', processoRoutes);
router.use('/alerts', alertRoutes);
router.use('/consultas', consultaRoutes);

// Rotas externas (públicas)
router.use('/external', externalRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
