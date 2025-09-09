import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = JSON.parse(readFileSync(join(__dirname, 'docs', 'swagger.json'), 'utf8'));

import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.js';
import { sequelize } from './models/index.js';
import alertScheduler from './services/alertScheduler.js';
import logger from './config/logger.js';

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    process.env.CORS_ORIGIN || 'https://your-frontend.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting para proteção contra ataques
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down para requests suspeitos
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // começar a atrasar após 50 requests
  delayMs: 500, // atrasar 500ms por request adicional
});

// Aplicar rate limiting geral
app.use(generalLimiter);
app.use(speedLimiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  next();
});

// Documentação da API
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da aplicação
app.use('/api', routes);

// Middleware de tratamento de erros
app.use(notFound);
app.use(errorHandler);

// Inicialização da aplicação
export const initializeApp = async () => {
  try {
    // Testa a conexão com o banco
    await sequelize.authenticate();
    logger.info('Conexão com o banco de dados estabelecida com sucesso');

    // Sincroniza os modelos com o banco (em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Modelos sincronizados com o banco de dados');
    }

    // Inicia o agendador de alertas
    alertScheduler.start();
    logger.info('Agendador de alertas iniciado');

  } catch (error) {
    logger.error('Erro ao inicializar a aplicação:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recebido, iniciando shutdown graceful...');
  
  try {
    alertScheduler.stop();
    await sequelize.close();
    logger.info('Aplicação encerrada com sucesso');
    process.exit(0);
  } catch (error) {
    logger.error('Erro durante shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recebido, iniciando shutdown graceful...');
  
  try {
    alertScheduler.stop();
    await sequelize.close();
    logger.info('Aplicação encerrada com sucesso');
    process.exit(0);
  } catch (error) {
    logger.error('Erro durante shutdown:', error);
    process.exit(1);
  }
});

export default app;
