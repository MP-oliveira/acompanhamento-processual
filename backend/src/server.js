import app, { initializeApp } from './app.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Inicializa a aplicação (banco, agendador, etc.)
    await initializeApp();

    // Inicia o servidor HTTP
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📚 Documentação disponível em http://localhost:${PORT}/docs`);
      logger.info(`🔗 API disponível em http://localhost:${PORT}/api`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info('🛠️  Modo de desenvolvimento ativo');
        logger.info('📊 Logs detalhados habilitados');
      }
    });

  } catch (error) {
    logger.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Inicia o servidor
startServer();
