import express from 'express';
import cors from 'cors';
import { sequelize } from './src/models/index.js';
import routes from './src/routes/index.js';
import { errorHandler, notFound } from './src/middlewares/error.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares básicos
app.use(cors({
  origin: true, // Aceita todas as origens em produção
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Servidor Sequelize + Supabase funcionando'
  });
});

// Teste de conexão com banco
app.get('/api/test/db-test', async (req, res) => {
  try {
    const { User } = await import('./src/models/index.js');
    const userCount = await User.count();
    
    res.status(200).json({
      message: 'Conexão com banco OK',
      userCount: userCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao testar conexão com banco:', error);
    res.status(500).json({
      error: 'Erro de conexão com banco',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Importar todas as rotas do sistema principal
app.use('/api', routes);

// Middlewares de erro
app.use(notFound);
app.use(errorHandler);

// Inicializar conexão com banco
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    
    // Sincronizar modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com o banco');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error);
  }
};

// Inicializar banco
initializeDatabase();

export default app;
