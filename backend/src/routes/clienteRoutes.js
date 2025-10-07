import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
  validateRouteParams,
  validateQueryParams,
  validateMaliciousContent
} from '../middlewares/inputValidation.js';
import {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  removerCliente,
  obterEstatisticas
} from '../controllers/clienteController.js';

const router = Router();

// Middleware de validação
router.use(validateMaliciousContent);

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de clientes
router.get('/', validateQueryParams(['search', 'tipo', 'ativo', 'page', 'limit']), listarClientes);
router.get('/estatisticas', obterEstatisticas);
router.get('/:id', validateRouteParams({ id: { type: 'number', required: true } }), buscarCliente);
router.post('/', criarCliente);
router.put('/:id', validateRouteParams({ id: { type: 'number', required: true } }), atualizarCliente);
router.delete('/:id', validateRouteParams({ id: { type: 'number', required: true } }), removerCliente);

export default router;

