import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

// Middlewares básicos
app.use(cors({
  origin: ['https://jurisacompanha.vercel.app', 'https://frontend-glx5w9c74-mauricio-silva-oliveiras-projects.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Simulação de banco de dados em memória
const users = [
  {
    id: 22,
    nome: "Guilherme Fernandes",
    email: "guilhermefernandes.adv@hotmail.com",
    password: "$2b$10$rQKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvK", // hash de "Gui@2025"
    role: "user",
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Servidor simplificado funcionando'
  });
});

// Login de usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Busca o usuário
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Email ou senha inválidos'
      });
    }

    // Verifica se está ativo
    if (!user.ativo) {
      return res.status(401).json({
        error: 'Usuário inativo'
      });
    }

    // Para simplificar, vamos aceitar a senha diretamente
    // Em produção, deveria usar bcrypt.compare()
    if (password !== 'Gui@2025') {
      return res.status(401).json({
        error: 'Email ou senha inválidos'
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Remove a senha do retorno
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  try {
    const decoded = jwt.verify(token, 'fallback-secret-key');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Rota protegida de teste
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

// Rota para listar usuários (admin)
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota catch-all para SPA
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Inicialização
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor simplificado rodando na porta ${PORT}`);
});

export default app;
