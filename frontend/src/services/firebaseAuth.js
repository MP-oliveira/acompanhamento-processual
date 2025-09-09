// Firebase Authentication Service
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
  }

  // Inicializar listener de mudança de estado de autenticação
  init() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        this.currentUser = user;
        
        if (user) {
          // Buscar dados adicionais do usuário no Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              this.currentUser = {
                ...user,
                ...userDoc.data()
              };
            }
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
          }
        }

        // Notificar todos os listeners
        this.authStateListeners.forEach(listener => {
          try {
            listener(this.currentUser);
          } catch (error) {
            console.error('Erro no listener de auth:', error);
          }
        });

        resolve(this.currentUser);
      });

      // Retornar função para cancelar o listener
      return unsubscribe;
    });
  }

  // Adicionar listener para mudanças de estado de autenticação
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Retornar função para remover o listener
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Login com email e senha
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Buscar dados adicionais do usuário
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: user.uid,
          email: user.email,
          nome: userData.nome || user.displayName || 'Usuário',
          role: userData.role || 'user',
          ativo: userData.ativo !== false
        };
      }
      
      return {
        uid: user.uid,
        email: user.email,
        nome: user.displayName || 'Usuário',
        role: 'user',
        ativo: true
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw this.handleAuthError(error);
    }
  }

  // Registro de novo usuário
  async register(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualizar perfil do usuário
      if (userData.nome) {
        await updateProfile(user, {
          displayName: userData.nome
        });
      }

      // Criar documento do usuário no Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        nome: userData.nome || 'Usuário',
        role: userData.role || 'user',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      return {
        uid: user.uid,
        email: user.email,
        nome: userData.nome || 'Usuário',
        role: userData.role || 'user',
        ativo: true
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw this.handleAuthError(error);
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(userData) {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar perfil no Firebase Auth
      if (userData.nome) {
        await updateProfile(auth.currentUser, {
          displayName: userData.nome
        });
      }

      // Atualizar dados no Firestore
      const userDoc = {
        ...userData,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid), userDoc);

      // Atualizar usuário atual
      this.currentUser = {
        ...this.currentUser,
        ...userData
      };

      return this.currentUser;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw this.handleAuthError(error);
    }
  }

  // Alterar senha
  async changePassword(currentPassword, newPassword) {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Reautenticar usuário
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Atualizar senha
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw this.handleAuthError(error);
    }
  }

  // Enviar email de redefinição de senha
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      throw this.handleAuthError(error);
    }
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar se usuário está autenticado
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Verificar se usuário é admin
  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  // Tratar erros de autenticação
  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/requires-recent-login': 'Requer login recente para esta ação'
    };

    return new Error(errorMessages[error.code] || error.message || 'Erro de autenticação');
  }
}

// Instância singleton
const firebaseAuthService = new FirebaseAuthService();

export default firebaseAuthService;
