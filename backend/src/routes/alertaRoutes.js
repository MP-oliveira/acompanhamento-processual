import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  listarAlertas,
  buscarAlerta,
  marcarComoLido,
  marcarMultiplosComoLidos,
  removerAlerta,
  estatisticasAlertas
} from '../controllers/alertController.js';

const router = express.Router();

// Todas as rotas de alertas requerem autenticação
router.use(auth);

// CRUD de alertas
router.get('/', listarAlertas);
router.get('/stats', estatisticasAlertas);
router.get('/:id', buscarAlerta);
router.patch('/:id/read', marcarComoLido);
router.patch('/mark-multiple', marcarMultiplosComoLidos);
router.delete('/:id', removerAlerta);

export default router;
