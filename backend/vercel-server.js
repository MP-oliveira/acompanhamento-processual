import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares básicos
app.use(cors({
  origin: true,
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
    message: 'Servidor funcionando'
  });
});

// Teste simples
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Teste OK',
    timestamp: new Date().toISOString()
  });
});

// Login simples para teste
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email e senha são obrigatórios'
    });
  }
  
  // Simular login
  res.json({
    message: 'Login realizado com sucesso',
    token: 'fake-token-for-test',
    user: {
      id: 1,
      email: email,
      nome: 'Teste',
      role: 'admin'
    }
  });
});

export default app;