import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
  validateRouteParams,
  validateQueryParams,
  validateMaliciousContent
} from '../middlewares/inputValidation.js';
import {
  listarEventos,
  buscarEvento,
  criarEvento,
  atualizarEvento,
  removerEvento,
  sincronizarEventos,
  obterEstatisticas
} from '../controllers/calendarController.js';

const router = Router();

// Middleware de validação de conteúdo malicioso
router.use(validateMaliciousContent);

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de calendário
router.get('/', validateQueryParams(['dataInicio', 'dataFim', 'tipo', 'status', 'processoId']), listarEventos);
router.get('/estatisticas', obterEstatisticas);
router.post('/sincronizar', sincronizarEventos);
router.get('/:id', validateRouteParams({ id: { type: 'number', required: true } }), buscarEvento);
router.post('/', criarEvento);
router.put('/:id', validateRouteParams({ id: { type: 'number', required: true } }), atualizarEvento);
router.delete('/:id', validateRouteParams({ id: { type: 'number', required: true } }), removerEvento);

export default router;

