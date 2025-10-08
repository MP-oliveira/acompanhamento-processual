import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se as variáveis de ambiente necessárias estão definidas
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida nas variáveis de ambiente');
}

// Importar Sequelize e modelos
import sequelize from './src/config/database.js';

// Variável global para controlar se já tentamos conectar
let connectionInitialized = false;

// Função para garantir conexão (apenas tenta autenticar, sem sync)
const ensureConnection = async () => {
  if (!connectionInitialized) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexão com o banco de dados estabelecida');
      connectionInitialized = true;
    } catch (err) {
      console.error('❌ Erro ao conectar com o banco:', err.message);
      // Não lançar erro, deixar tentar novamente na próxima requisição
      connectionInitialized = false;
    }
  }
};

// Importar rotas reais
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import processoRoutes from './src/routes/processoRoutes.js';
import alertRoutes from './src/routes/alertRoutes.js';
import relatorioRoutes from './src/routes/relatorioRoutes.js';
import consultaRoutes from './src/routes/consultaRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import custaRoutes from './src/routes/custaRoutes.js';
import documentoRoutes from './src/routes/documentoRoutes.js';
import calendarRoutes from './src/routes/calendarRoutes.js';
import timesheetRoutes from './src/routes/timesheetRoutes.js';
import clienteRoutes from './src/routes/clienteRoutes.js';

// Criar app Express
const app = express();

// CORS configurável por ALLOWED_ORIGINS (lista separada por vírgulas)
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = allowedOriginsEnv
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origin (como mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Se não há origens configuradas, permite todas
    if (allowedOrigins.length === 0) return callback(null, true);
    
    // Verifica se a origem está permitida
    const isAllowed = allowedOrigins.some(allowed => origin === allowed || origin.endsWith(allowed));
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true
};

// Middlewares básicos
app.use(helmet());
app.use(cors(corsOptions));
// Responder preflight de todos os caminhos
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware OPTIONS removido - deixando apenas o CORS do express

// Rota para a raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Juris Acompanha Backend funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      api: '/api',
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      processos: '/api/processos',
      alerts: '/api/alerts',
      relatorios: '/api/relatorios',
      consultas: '/api/consultas'
    }
  });
});

// Rotas básicas
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Juris Acompanha API funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Rota de debug para verificar variáveis de ambiente
app.get('/api/debug', (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY
  });
});


// Middleware para garantir conexão antes de cada requisição
app.use('/api', async (req, res, next) => {
  // Tenta garantir conexão, mas não bloqueia se falhar
  // (os próprios controllers lidarão com erros de conexão)
  await ensureConnection();
  next();
});

// Usar rotas reais do backend com tratamento de erro
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/processos', processoRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/relatorios', relatorioRoutes);
  app.use('/api/consultas', consultaRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/custas', custaRoutes);
  app.use('/api/documentos', documentoRoutes);
  app.use('/api/calendar', calendarRoutes);
  app.use('/api/timesheets', timesheetRoutes);
  app.use('/api/clientes', clienteRoutes);
} catch (error) {
  console.error('Erro ao configurar rotas:', error);
  // Rota de fallback para quando há problemas com o banco
  app.use('/api/*', (req, res) => {
    res.status(503).json({ 
      error: 'Serviço temporariamente indisponível',
      message: 'Problemas de conexão com o banco de dados'
    });
  });
}

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

// Handler para o Vercel
export default app;
