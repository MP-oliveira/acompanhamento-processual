import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
  validateCreateProcesso,
  validateUpdateProcesso,
  validateRouteParams,
  validateQueryParams,
  validateMaliciousContent
} from '../middlewares/inputValidation.js';
import {
  listarProcessos,
  buscarProcesso,
  criarProcesso,
  atualizarProcesso,
  removerProcesso,
  atualizarStatus
} from '../controllers/processoController.js';

const router = Router();

// Middleware de validação de conteúdo malicioso para todas as rotas
router.use(validateMaliciousContent);

// Todas as rotas de processos requerem autenticação
router.use(auth);

// CRUD de processos
router.get('/', validateQueryParams(['page', 'limit', 'status', 'search']), listarProcessos);
router.get('/:id', validateRouteParams({ id: { type: 'number', required: true } }), buscarProcesso);
router.post('/', validateCreateProcesso, criarProcesso);
router.put('/:id', validateRouteParams({ id: { type: 'number', required: true } }), validateUpdateProcesso, atualizarProcesso);
router.delete('/:id', validateRouteParams({ id: { type: 'number', required: true } }), removerProcesso);

// Validação do status
const validateStatus = (req, res, next) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({
      error: 'Status é obrigatório',
      receivedBody: req.body
    });
  }
  
  if (!['ativo', 'arquivado', 'suspenso'].includes(status)) {
    return res.status(400).json({
      error: 'Status inválido',
      received: status,
      validOptions: ['ativo', 'arquivado', 'suspenso']
    });
  }
  
  next();
};

// Atualização de status
router.patch('/:id/status', validateRouteParams({ id: { type: 'number', required: true } }), validateStatus, atualizarStatus);

export default router;
