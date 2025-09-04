import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
  listarProcessos,
  buscarProcesso,
  criarProcesso,
  atualizarProcesso,
  removerProcesso,
  atualizarStatus
} from '../controllers/processoController.js';

const router = Router();

// Todas as rotas de processos requerem autenticação
router.use(auth);

// CRUD de processos
router.get('/', listarProcessos);
router.get('/:id', buscarProcesso);
router.post('/', criarProcesso);
router.put('/:id', atualizarProcesso);
router.delete('/:id', removerProcesso);

// Atualização de status
router.patch('/:id/status', atualizarStatus);

export default router;
