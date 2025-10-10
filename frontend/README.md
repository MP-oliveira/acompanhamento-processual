# 🏛️ JurisAcompanha - Frontend

Sistema de Acompanhamento Processual - Interface do usuário moderna e responsiva.

## 🎨 Design System

### Paleta de Cores Jurídica
- **Azul Profissional**: `#6366f1` - Cor primária para transmitir confiança e seriedade
- **Dourado Elegante**: `#f59e0b` - Cor secundária para destaques e elementos especiais
- **Cinza Profissional**: Tons neutros para textos e fundos
- **Cores de Estado**: Verde (sucesso), Amarelo (aviso), Vermelho (erro), Azul (info)

### Tipografia
- **Fonte Principal**: Inter (fallback para system fonts)
- **Hierarquia**: H1-H6 com pesos e tamanhos consistentes
- **Monospace**: Courier New para números de processos

## 🏗️ Estrutura de Componentes

```
src/
├── components/
│   ├── Topbar/           # Header com navegação e menu do usuário
│   ├── Sidebar/          # Menu lateral com navegação organizada
│   ├── LoginForm/        # Formulário de login com validação
│   ├── Dashboard/        # Página principal com estatísticas
│   ├── ProcessoCard/     # Card para exibir processos
│   ├── ProcessoForm/     # Formulário para criar/editar processos
│   ├── AlertCard/        # Card para exibir alertas
│   ├── RegisterForm/     # Formulário de registro
│   ├── Processos/        # Página de listagem de processos
│   └── NovoProcesso/     # Página para criar novo processo
├── styles/
│   ├── index.css         # CSS principal com variáveis e reset
│   ├── layout/
│   │   └── App.css       # Layout principal da aplicação
│   └── components/
│       └── forms.css     # Estilos para formulários e botões
└── App.jsx               # Componente principal da aplicação
```

## 🚀 Funcionalidades

### ✅ Implementadas
- **Sistema de Autenticação**: Login com validação e estados de loading
- **Layout Responsivo**: Topbar fixo, sidebar colapsável, grid adaptativo
- **Dashboard**: Cards de estatísticas, listas de processos e prazos
- **Navegação**: Menu lateral organizado por seções
- **Design System**: Paleta de cores, tipografia e componentes consistentes

### 🔄 Em Desenvolvimento
- Integração com API do backend
- Formulários de CRUD para processos
- Sistema de alertas em tempo real
- Páginas de relatórios e consultas

## 📱 Responsividade

### Breakpoints
- **Desktop**: > 1024px - Layout completo com sidebar fixa
- **Tablet**: 768px - 1024px - Sidebar colapsável com overlay
- **Mobile**: < 768px - Menu hambúguer e layout adaptado

### Dispositivos Testados
- ✅ iPhone 14 / 14 Pro Max
- ✅ iPad Pro
- ✅ MacBook 13"

## 🎯 Como Usar

### 1. Instalação
```bash
cd frontend
npm install
```

### 2. Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:5173

### 3. Build para Produção
```bash
npm run build
```

### 4. Login de Teste
- **Email**: `admin@teste.com`
- **Senha**: `123456`

## 🎨 Componentes Principais

### Topbar
- Logo da aplicação
- Navegação principal
- Notificações (badge)
- Menu do usuário com dropdown

### Sidebar
- Navegação organizada por seções
- Ícones intuitivos
- Estados ativos
- Responsivo com overlay

### LoginForm
- Validação em tempo real
- Estados de loading e erro
- Toggle de visibilidade da senha
- Design moderno com gradiente

### Dashboard
- Cards de estatísticas com ícones
- Lista de processos recentes
- Prazos próximos com indicadores
- Grid responsivo

## 🔧 Tecnologias

- **React 18**: Biblioteca principal
- **Vite**: Build tool e dev server
- **React Router**: Navegação SPA
- **React Query**: Gerenciamento de estado servidor
- **Lucide React**: Ícones modernos
- **React Hot Toast**: Notificações
- **CSS Puro**: Estilos customizados sem frameworks

## 📋 Próximos Passos

1. **Integração com Backend**: Conectar com API REST
2. **Formulários CRUD**: Criar/editar/excluir processos
3. **Sistema de Alertas**: Notificações em tempo real
4. **Relatórios**: Gráficos e estatísticas avançadas
5. **Deploy**: Configurar Vercel para produção

## 🎨 Paleta de Cores Completa

```css
/* Cores Primárias - Azul Profissional */
--primary-500: #6366f1;  /* Principal */
--primary-600: #4f46e5;  /* Hover */
--primary-700: #4338ca;  /* Active */

/* Cores Secundárias - Dourado Elegante */
--secondary-500: #f59e0b; /* Principal */
--secondary-600: #d97706; /* Hover */
--secondary-700: #b45309; /* Active */

/* Cores de Estado */
--success-500: #22c55e;   /* Sucesso */
--warning-500: #f59e0b;   /* Aviso */
--error-500: #ef4444;     /* Erro */
--info-500: #3b82f6;      /* Informação */
```

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do backend ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ para a advocacia moderna**
<!-- Deploy Fri Oct 10 11:27:40 -03 2025 -->
