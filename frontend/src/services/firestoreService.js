// Firestore Database Service
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

class FirestoreService {
  constructor() {
    this.collections = {
      users: 'users',
      processos: 'processos',
      alertas: 'alertas'
    };
  }

  // ===== MÉTODOS GENÉRICOS =====

  // Converter Timestamp do Firestore para Date
  convertTimestamp(timestamp) {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return timestamp;
  }

  // Converter documento do Firestore para objeto JavaScript
  convertDocument(doc) {
    if (!doc.exists()) return null;
    
    const data = doc.data();
    const converted = { id: doc.id };
    
    // Converter timestamps
    Object.keys(data).forEach(key => {
      if (data[key] && data[key].toDate) {
        converted[key] = data[key].toDate();
      } else {
        converted[key] = data[key];
      }
    });
    
    return converted;
  }

  // ===== PROCESSOS =====

  // Buscar todos os processos
  async getProcessos(filters = {}) {
    try {
      let q = collection(db, this.collections.processos);
      
      // Aplicar filtros
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters.search) {
        // Para busca por texto, precisaríamos de um índice composto
        // Por enquanto, vamos buscar todos e filtrar no cliente
        q = query(q, orderBy('numero'));
      }
      
      // Ordenar por data de criação (mais recentes primeiro)
      q = query(q, orderBy('createdAt', 'desc'));
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      let processos = snapshot.docs.map(doc => this.convertDocument(doc));
      
      // Filtrar por busca de texto no cliente (temporário)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        processos = processos.filter(processo => 
          processo.numero?.toLowerCase().includes(searchTerm) ||
          processo.cliente?.toLowerCase().includes(searchTerm) ||
          processo.tribunal?.toLowerCase().includes(searchTerm)
        );
      }
      
      return processos;
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      throw error;
    }
  }

  // Buscar processo por ID
  async getProcessoById(id) {
    try {
      const docRef = doc(db, this.collections.processos, id);
      const docSnap = await getDoc(docRef);
      return this.convertDocument(docSnap);
    } catch (error) {
      console.error('Erro ao buscar processo:', error);
      throw error;
    }
  }

  // Criar novo processo
  async createProcesso(processoData) {
    try {
      const docData = {
        ...processoData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.collections.processos), docData);
      return { id: docRef.id, ...processoData };
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      throw error;
    }
  }

  // Atualizar processo
  async updateProcesso(id, updateData) {
    try {
      const docRef = doc(db, this.collections.processos, id);
      const docData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, docData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      throw error;
    }
  }

  // Deletar processo
  async deleteProcesso(id) {
    try {
      const docRef = doc(db, this.collections.processos, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar processo:', error);
      throw error;
    }
  }

  // ===== ALERTAS =====

  // Buscar todos os alertas
  async getAlertas(filters = {}) {
    try {
      let q = collection(db, this.collections.alertas);
      
      // Aplicar filtros
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters.lido !== undefined) {
        q = query(q, where('lido', '==', filters.lido));
      }
      
      if (filters.tipo) {
        q = query(q, where('tipo', '==', filters.tipo));
      }
      
      // Ordenar por data de criação (mais recentes primeiro)
      q = query(q, orderBy('createdAt', 'desc'));
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertDocument(doc));
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      throw error;
    }
  }

  // Buscar alerta por ID
  async getAlertaById(id) {
    try {
      const docRef = doc(db, this.collections.alertas, id);
      const docSnap = await getDoc(docRef);
      return this.convertDocument(docSnap);
    } catch (error) {
      console.error('Erro ao buscar alerta:', error);
      throw error;
    }
  }

  // Criar novo alerta
  async createAlerta(alertaData) {
    try {
      const docData = {
        ...alertaData,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.collections.alertas), docData);
      return { id: docRef.id, ...alertaData };
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      throw error;
    }
  }

  // Marcar alerta como lido
  async markAlertaAsRead(id) {
    try {
      const docRef = doc(db, this.collections.alertas, id);
      await updateDoc(docRef, { 
        lido: true,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
      throw error;
    }
  }

  // Deletar alerta
  async deleteAlerta(id) {
    try {
      const docRef = doc(db, this.collections.alertas, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar alerta:', error);
      throw error;
    }
  }

  // ===== USUÁRIOS =====

  // Buscar todos os usuários (apenas admin)
  async getUsers(filters = {}) {
    try {
      let q = collection(db, this.collections.users);
      
      // Aplicar filtros
      if (filters.role) {
        q = query(q, where('role', '==', filters.role));
      }
      
      if (filters.ativo !== undefined) {
        q = query(q, where('ativo', '==', filters.ativo));
      }
      
      // Ordenar por nome
      q = query(q, orderBy('nome'));
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertDocument(doc));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  // Buscar usuário por ID
  async getUserById(id) {
    try {
      const docRef = doc(db, this.collections.users, id);
      const docSnap = await getDoc(docRef);
      return this.convertDocument(docSnap);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  // Atualizar usuário
  async updateUser(id, updateData) {
    try {
      const docRef = doc(db, this.collections.users, id);
      const docData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, docData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // ===== LISTENERS EM TEMPO REAL =====

  // Listener para processos em tempo real
  subscribeToProcessos(callback, filters = {}) {
    try {
      let q = collection(db, this.collections.processos);
      
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const processos = snapshot.docs.map(doc => this.convertDocument(doc));
        callback(processos);
      });
    } catch (error) {
      console.error('Erro ao configurar listener de processos:', error);
      throw error;
    }
  }

  // Listener para alertas em tempo real
  subscribeToAlertas(callback, filters = {}) {
    try {
      let q = collection(db, this.collections.alertas);
      
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters.lido !== undefined) {
        q = query(q, where('lido', '==', filters.lido));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const alertas = snapshot.docs.map(doc => this.convertDocument(doc));
        callback(alertas);
      });
    } catch (error) {
      console.error('Erro ao configurar listener de alertas:', error);
      throw error;
    }
  }

  // ===== ESTATÍSTICAS =====

  // Buscar estatísticas do dashboard
  async getDashboardStats(userId) {
    try {
      // Buscar processos do usuário
      const processosQuery = query(
        collection(db, this.collections.processos),
        where('userId', '==', userId)
      );
      const processosSnapshot = await getDocs(processosQuery);
      const processos = processosSnapshot.docs.map(doc => this.convertDocument(doc));

      // Buscar alertas não lidos
      const alertasQuery = query(
        collection(db, this.collections.alertas),
        where('userId', '==', userId),
        where('lido', '==', false)
      );
      const alertasSnapshot = await getDocs(alertasQuery);
      const alertasNaoLidos = alertasSnapshot.docs.length;

      // Calcular estatísticas
      const totalProcessos = processos.length;
      const processosAtivos = processos.filter(p => p.status === 'ativo').length;
      const processosVencidos = processos.filter(p => {
        if (!p.prazoRecurso && !p.prazoEmbargos) return false;
        const hoje = new Date();
        const prazo = p.prazoRecurso || p.prazoEmbargos;
        return new Date(prazo) < hoje;
      }).length;

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

// Instância singleton
const firestoreService = new FirestoreService();

export default firestoreService;
