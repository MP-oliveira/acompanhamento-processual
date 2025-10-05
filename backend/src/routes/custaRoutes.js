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

// Estatísticas financeiras (DEVE vir ANTES das rotas parametrizadas)
router.get('/custas/estatisticas', obterEstatisticas);

// Rotas de custas
router.get('/processos/:processoId/custas', listarCustas);
router.post('/processos/:processoId/custas', criarCusta);
router.put('/custas/:id', atualizarCusta);
router.delete('/custas/:id', deletarCusta);

export default router;

