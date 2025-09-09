// Hybrid Service - Permite usar Firebase ou Backend
import { alertService, processoService, userService } from './api.js';
import firestoreService from './firestoreService.js';
import firebaseAuthService from './firebaseAuth.js';

class HybridService {
  constructor() {
    this.useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';
    this.currentUser = null;
  }

  // ===== CONFIGURAÇÃO =====

  setUseFirebase(useFirebase) {
    this.useFirebase = useFirebase;
    console.log(`🔄 Modo alterado para: ${useFirebase ? 'Firebase' : 'Backend'}`);
  }

  isUsingFirebase() {
    return this.useFirebase;
  }

  // ===== AUTENTICAÇÃO =====

  async init() {
    if (this.useFirebase) {
      return await firebaseAuthService.init();
    }
    return null;
  }

  async login(email, password) {
    if (this.useFirebase) {
      const user = await firebaseAuthService.login(email, password);
      this.currentUser = user;
      return user;
    } else {
      // Usar backend atual
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Erro no login');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      this.currentUser = data.user;
      return data.user;
    }
  }

  async logout() {
    if (this.useFirebase) {
      await firebaseAuthService.logout();
    } else {
      localStorage.removeItem('token');
    }
    this.currentUser = null;
  }

  getCurrentUser() {
    if (this.useFirebase) {
      return firebaseAuthService.getCurrentUser();
    }
    return this.currentUser;
  }

  isAuthenticated() {
    if (this.useFirebase) {
      return firebaseAuthService.isAuthenticated();
    }
    return !!this.currentUser;
  }

  // ===== PROCESSOS =====

  async getProcessos(filters = {}) {
    if (this.useFirebase) {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('Usuário não autenticado');
      
      const firebaseFilters = { ...filters, userId };
      return await firestoreService.getProcessos(firebaseFilters);
    } else {
      return await processoService.getAll(filters);
    }
  }

  async getProcessoById(id) {
    if (this.useFirebase) {
      return await firestoreService.getProcessoById(id);
    } else {
      return await processoService.getById(id);
    }
  }

  async createProcesso(processoData) {
    if (this.useFirebase) {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('Usuário não autenticado');
      
      const firebaseData = {
        ...processoData,
        userId
      };
      return await firestoreService.createProcesso(firebaseData);
    } else {
      return await processoService.create(processoData);
    }
  }

  async updateProcesso(id, updateData) {
    if (this.useFirebase) {
      return await firestoreService.updateProcesso(id, updateData);
    } else {
      return await processoService.update(id, updateData);
    }
  }

  async deleteProcesso(id) {
    if (this.useFirebase) {
      return await firestoreService.deleteProcesso(id);
    } else {
      return await processoService.delete(id);
    }
  }

  // ===== ALERTAS =====

  async getAlertas(filters = {}) {
    if (this.useFirebase) {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('Usuário não autenticado');
      
      const firebaseFilters = { ...filters, userId };
      return await firestoreService.getAlertas(firebaseFilters);
    } else {
      return await alertService.getAll(filters);
    }
  }

  async getAlertaById(id) {
    if (this.useFirebase) {
      return await firestoreService.getAlertaById(id);
    } else {
      return await alertService.getById(id);
    }
  }

  async createAlerta(alertaData) {
    if (this.useFirebase) {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('Usuário não autenticado');
      
      const firebaseData = {
        ...alertaData,
        userId
      };
      return await firestoreService.createAlerta(firebaseData);
    } else {
      return await alertService.create(alertaData);
    }
  }

  async markAlertaAsRead(id) {
    if (this.useFirebase) {
      return await firestoreService.markAlertaAsRead(id);
    } else {
      return await alertService.markAsRead(id);
    }
  }

  async deleteAlerta(id) {
    if (this.useFirebase) {
      return await firestoreService.deleteAlerta(id);
    } else {
      return await alertService.delete(id);
    }
  }

  // ===== USUÁRIOS =====

  async getUsers(filters = {}) {
    if (this.useFirebase) {
      return await firestoreService.getUsers(filters);
    } else {
      return await userService.getAll(filters);
    }
  }

  async getUserById(id) {
    if (this.useFirebase) {
      return await firestoreService.getUserById(id);
    } else {
      return await userService.getById(id);
    }
  }

  async createUser(userData) {
    if (this.useFirebase) {
      return await firebaseAuthService.register(userData.email, userData.password, userData);
    } else {
      return await userService.create(userData);
    }
  }

  async updateUser(id, updateData) {
    if (this.useFirebase) {
      return await firestoreService.updateUser(id, updateData);
    } else {
      return await userService.update(id, updateData);
    }
  }

  // ===== LISTENERS EM TEMPO REAL =====

  subscribeToProcessos(callback, filters = {}) {
    if (this.useFirebase) {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) {
        console.warn('Usuário não autenticado para listener');
        return () => {};
      }
      
      const firebaseFilters = { ...filters, userId };
      return firestoreService.subscribeToProcessos(callback, firebaseFilters);
    } else {
      // Para backend, simular com polling
      const interval = setInterval(async () => {
        try {
          const processos = await this.getProcessos(filters);
          callback(processos);
        } catch (error) {
          console.error('Erro no polling de processos:', error);
        }
      }, 30000); // 30 segundos
      
      return () => clearInterval(interval);
    }
  }

  subscribeToAlertas(callback, filters = {}) {
    if (this.useFirebase) {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) {
        console.warn('Usuário não autenticado para listener');
        return () => {};
      }
      
      const firebaseFilters = { ...filters, userId };
      return firestoreService.subscribeToAlertas(callback, firebaseFilters);
    } else {
      // Para backend, simular com polling
      const interval = setInterval(async () => {
        try {
          const alertas = await this.getAlertas(filters);
          callback(alertas);
        } catch (error) {
          console.error('Erro no polling de alertas:', error);
        }
      }, 30000); // 30 segundos
      
      return () => clearInterval(interval);
    }
  }

  // ===== ESTATÍSTICAS =====

  async getDashboardStats() {
    if (this.useFirebase) {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('Usuário não autenticado');
      
      return await firestoreService.getDashboardStats(userId);
    } else {
      // Para backend, buscar dados separadamente
      try {
        const [processos, alertas] = await Promise.all([
          this.getProcessos(),
          this.getAlertas({ lido: false })
        ]);

        const totalProcessos = processos.length;
        const processosAtivos = processos.filter(p => p.status === 'ativo').length;
        const processosVencidos = processos.filter(p => {
          if (!p.prazoRecurso && !p.prazoEmbargos) return false;
          const hoje = new Date();
          const prazo = p.prazoRecurso || p.prazoEmbargos;
          return new Date(prazo) < hoje;
        }).length;

        const alertasNaoLidos = alertas.length;

        // Processos criados este mês
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        
        const processosEsteMes = processos.filter(p => 
          p.createdAt && new Date(p.createdAt) >= inicioMes
        ).length;

        return {
          totalProcessos,
          processosAtivos,
          processosVencidos,
          alertasNaoLidos,
          processosEsteMes
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }
    }
  }
}

// Instância singleton
const hybridService = new HybridService();

export default hybridService;
