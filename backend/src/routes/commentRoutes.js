import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  listarComentarios,
  criarComentario,
  atualizarComentario,
  deletarComentario
} from '../controllers/commentController.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de comentários
router.get('/processos/:processoId/comments', listarComentarios);
router.post('/processos/:processoId/comments', criarComentario);
router.put('/comments/:id', atualizarComentario);
router.delete('/comments/:id', deletarComentario);

export default router;

