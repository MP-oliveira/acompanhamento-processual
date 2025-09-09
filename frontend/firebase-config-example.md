# Configuração do Firebase

## 1. Criar projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "juris-acompanhamento")
4. Configure as opções conforme necessário
5. Aguarde a criação do projeto

## 2. Configurar Autenticação

1. No painel do projeto, vá em "Authentication"
2. Clique em "Começar"
3. Vá na aba "Sign-in method"
4. Habilite "Email/Password"
5. Opcionalmente, habilite outros métodos (Google, etc.)

## 3. Configurar Firestore Database

1. No painel do projeto, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Modo de teste" (para desenvolvimento)
4. Selecione uma localização (ex: us-central1)

## 4. Obter configurações

1. No painel do projeto, clique no ícone de engrenagem
2. Selecione "Configurações do projeto"
3. Role até "Seus aplicativos"
4. Clique em "Adicionar app" > "Web" (ícone </>)
5. Digite um nome para o app (ex: "juris-frontend")
6. Copie as configurações do objeto `firebaseConfig`

## 5. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na pasta `frontend/` com:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Emulator (opcional)
VITE_USE_FIREBASE_EMULATOR=false

# Backend API (se quiser usar backend + Firebase)
VITE_API_BASE_URL=http://localhost:3001/api
```

## 6. Regras de Segurança do Firestore

Configure as regras de segurança no Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Processos - usuários autenticados podem ler/escrever
    match /processos/{processoId} {
      allow read, write: if request.auth != null;
    }
    
    // Alertas - usuários autenticados podem ler/escrever
    match /alertas/{alertaId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 7. Estrutura de dados sugerida

### Coleção: users
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  nome: "Nome do Usuário",
  role: "admin" | "user",
  ativo: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Coleção: processos
```javascript
{
  numero: "1234567-89.2024.1.01.0001",
  cliente: "Nome do Cliente",
  tribunal: "Tribunal de Justiça",
  vara: "1ª Vara Cível",
  status: "ativo" | "arquivado" | "suspenso",
  dataDistribuicao: timestamp,
  dataAudiencia: timestamp,
  dataSentenca: timestamp,
  prazoRecurso: timestamp,
  prazoEmbargos: timestamp,
  observacoes: "Observações do processo",
  userId: "user-id", // Referência ao usuário
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Coleção: alertas
```javascript
{
  titulo: "Prazo de recurso vencendo",
  mensagem: "O prazo para recurso vence em 5 dias",
  tipo: "prazo" | "audiencia" | "sentenca" | "distribuicao",
  processoId: "processo-id", // Referência ao processo
  userId: "user-id", // Referência ao usuário
  lido: false,
  dataVencimento: timestamp,
  createdAt: timestamp
}
```
