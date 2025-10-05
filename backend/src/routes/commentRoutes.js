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

// Rotas de comentários por processo
router.get('/processos/:processoId', listarComentarios);
router.post('/processos/:processoId', criarComentario);

// Rotas de comentários individuais
router.put('/:id', atualizarComentario);
router.delete('/:id', deletarComentario);

export default router;

