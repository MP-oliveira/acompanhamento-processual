import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  X, 
  Send, 
  Trash2,
  MinusCircle,
  Bot,
  User
} from 'lucide-react';
import { processoService } from '../../services/api';
import { 
  processarMensagem, 
  getMensagemBoasVindas,
  salvarHistorico,
  carregarHistorico,
  limparHistorico
} from '../../utils/chatbotService';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [processos, setProcessos] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Carregar processos
  useEffect(() => {
    const carregarProcessos = async () => {
      try {
        const response = await processoService.getAll();
        setProcessos(response.processos || response);
      } catch (error) {
        console.error('Erro ao carregar processos:', error);
      }
    };
    carregarProcessos();
  }, []);

  // Carregar histórico ao abrir
  useEffect(() => {
    if (isOpen && mensagens.length === 0) {
      const historico = carregarHistorico();
      if (historico.length > 0) {
        setMensagens(historico);
      } else {
        // Mensagem de boas-vindas
        const boasVindas = getMensagemBoasVindas();
        setMensagens([{ tipo: 'bot', ...boasVindas, timestamp: new Date() }]);
      }
    }
  }, [isOpen]);

  // Scroll para o final quando novas mensagens
  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  // Focus no input quando abrir
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    const texto = inputValue.trim();
    if (!texto) return;

    // Adiciona mensagem do usuário
    const novaMensagemUsuario = {
      tipo: 'usuario',
      texto,
      timestamp: new Date()
    };

    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setInputValue('');
    setLoading(true);

    // Processa resposta do bot
    try {
      const resposta = await processarMensagem(texto, processos);
      const novaMensagemBot = {
        tipo: 'bot',
        ...resposta,
        timestamp: new Date()
      };

      setMensagens(prev => {
        const updated = [...prev, novaMensagemBot];
        salvarHistorico(updated);
        return updated;
      });
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      setMensagens(prev => [...prev, {
        tipo: 'bot',
        texto: '❌ Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (sugestao) => {
    setInputValue(sugestao);
    handleSendMessage();
  };

  const handleActionClick = (acao) => {
    switch (acao.acao) {
      case 'abrir_processo':
        navigate(`/processos/editar/${acao.id}`);
        setIsOpen(false);
        break;
      case 'timeline':
        navigate(`/processos/editar/${acao.id}`);
        setIsOpen(false);
        break;
      case 'novo_processo':
        navigate('/processos/novo');
        setIsOpen(false);
        break;
      case 'template':
        navigate('/processos/novo');
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Deseja limpar todo o histórico de conversa?')) {
      limparHistorico();
      const boasVindas = getMensagemBoasVindas();
      setMensagens([{ tipo: 'bot', ...boasVindas, timestamp: new Date() }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="chatbot-fab"
        onClick={() => setIsOpen(true)}
        title="Abrir assistente"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <div className="chatbot-avatar">
            <Bot size={20} />
          </div>
          <div className="chatbot-header-text">
            <h3>Assistente Virtual</h3>
            <span className="chatbot-status">Online</span>
          </div>
        </div>
        <div className="chatbot-header-actions">
          <button 
            onClick={handleClearHistory}
            title="Limpar histórico"
            className="chatbot-header-btn"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Maximizar' : 'Minimizar'}
            className="chatbot-header-btn"
          >
            <MinusCircle size={18} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            title="Fechar"
            className="chatbot-header-btn"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {mensagens.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.tipo}`}>
                <div className="chatbot-message-avatar">
                  {msg.tipo === 'bot' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="chatbot-message-content">
                  <div className="chatbot-message-text">
                    {msg.texto
                      .replace(/\*\*/g, '')
                      .replace(/\*/g, '')
                      .replace(/_/g, '')
                      .split('\n').map((linha, i) => (
                      <p key={i}>{linha}</p>
                    ))}
                  </div>
                  
                  {msg.sugestoes && msg.sugestoes.length > 0 && (
                    <div className="chatbot-suggestions">
                      {msg.sugestoes.map((sugestao, i) => (
                        <button
                          key={i}
                          className="chatbot-suggestion"
                          onClick={() => setInputValue(sugestao)}
                          style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
                        >
                          {sugestao}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.acoes && msg.acoes.length > 0 && (
                    <div className="chatbot-actions">
                      {msg.acoes.map((acao, i) => (
                        <button
                          key={i}
                          className="chatbot-action-btn"
                          onClick={() => handleActionClick(acao)}
                          style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
                        >
                          {acao.texto}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message bot">
                <div className="chatbot-message-avatar">
                  <Bot size={16} />
                </div>
                <div className="chatbot-message-content">
                  <div className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Digite sua mensagem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button 
              className="chatbot-send-btn"
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;

