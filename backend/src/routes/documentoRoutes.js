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

// Rotas de documentos por processo
router.get('/processos/:processoId', listarDocumentos);
router.post('/processos/:processoId', criarDocumento);

// Rotas de documentos individuais
router.delete('/:id', deletarDocumento);

export default router;

