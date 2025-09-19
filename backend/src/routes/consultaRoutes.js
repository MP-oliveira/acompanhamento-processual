import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
  listarConsultas,
  buscarConsulta,
  criarConsulta,
  removerConsulta,
  estatisticasConsultas
} from '../controllers/consultaController.js';

const router = Router();

// Todas as rotas de consultas requerem autenticação
router.use(auth);

// CRUD de consultas
router.get('/', listarConsultas);
router.get('/stats', estatisticasConsultas);
router.get('/:id', buscarConsulta);
router.post('/', criarConsulta);
router.delete('/:id', removerConsulta);

export default router;
