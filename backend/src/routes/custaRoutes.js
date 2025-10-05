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

// Rota de teste SEM autenticação
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de custas funcionando!', timestamp: new Date().toISOString() });
});

// Todas as rotas requerem autenticação
router.use(auth);

// Estatísticas financeiras (DEVE vir ANTES das rotas parametrizadas)
router.get('/estatisticas', obterEstatisticas);

// Rotas de custas por processo
router.get('/processos/:processoId', listarCustas);
router.post('/processos/:processoId', criarCusta);

// Rotas de custas individuais
router.put('/:id', atualizarCusta);
router.delete('/:id', deletarCusta);

export default router;

