import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  listarDocumentos,
  criarDocumento,
  deletarDocumento
} from '../controllers/documentoController.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de documentos
router.get('/processos/:processoId/documentos', listarDocumentos);
router.post('/processos/:processoId/documentos', criarDocumento);
router.delete('/documentos/:id', deletarDocumento);

export default router;

