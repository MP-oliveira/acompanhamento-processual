import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
  validateRouteParams,
  validateQueryParams,
  validateMaliciousContent
} from '../middlewares/inputValidation.js';
import {
  listarTimesheets,
  criarTimesheet,
  atualizarTimesheet,
  removerTimesheet,
  obterEstatisticas
} from '../controllers/timesheetController.js';

const router = Router();

// Middleware de validação de conteúdo malicioso
router.use(validateMaliciousContent);

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de timesheet
router.get('/', validateQueryParams(['processoId', 'dataInicio', 'dataFim', 'tipo', 'faturavel', 'faturado', 'page', 'limit']), listarTimesheets);
router.get('/estatisticas', obterEstatisticas);
router.post('/', criarTimesheet);
router.put('/:id', validateRouteParams({ id: { type: 'number', required: true } }), atualizarTimesheet);
router.delete('/:id', validateRouteParams({ id: { type: 'number', required: true } }), removerTimesheet);

export default router;

