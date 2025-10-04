import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  listarCustas,
  criarCusta,
  atualizarCusta,
  deletarCusta,
  obterEstatisticas
} from '../controllers/custaController.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de custas
router.get('/processos/:processoId/custas', listarCustas);
router.post('/processos/:processoId/custas', criarCusta);
router.put('/custas/:id', atualizarCusta);
router.delete('/custas/:id', deletarCusta);

// Estatísticas financeiras
router.get('/custas/estatisticas', obterEstatisticas);

export default router;

