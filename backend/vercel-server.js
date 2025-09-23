// Handler simples para o Vercel - sem dependências pesadas
export default async (req, res) => {
  try {
    // Resposta simples para testar se está funcionando
    res.status(200).json({ 
      message: 'Backend funcionando!',
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method
    });
  } catch (error) {
    console.error('❌ Erro no handler do Vercel:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};
