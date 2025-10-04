import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { userService } from '../../services/api';
import UserAvatar from '../UserAvatar/UserAvatar';

const WorkloadChart = ({ processos }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.users || response);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar processos por usuário
  const workloadData = users.map(user => {
    const userProcessos = processos.filter(p => p.userId === user.id);
    const ativos = userProcessos.filter(p => p.status === 'ativo').length;
    const suspensos = userProcessos.filter(p => p.status === 'suspenso').length;
    const arquivados = userProcessos.filter(p => p.status === 'arquivado').length;
    
    return {
      nome: user.nome,
      user: user,
      total: userProcessos.length,
      ativos,
      suspensos,
      arquivados
    };
  }).filter(w => w.total > 0); // Apenas usuários com processos

  if (loading || workloadData.length === 0) {
    return (
      <div className="chart-empty">
        <p>{loading ? 'Carregando...' : 'Nenhum dado para exibir'}</p>
      </div>
    );
  }

  const COLORS = ['#4A90E2', '#28A745', '#FFC107', '#DC3545', '#7B68EE'];

  return (
    <div className="chart-container">
      <h3 className="chart-title">Carga de Trabalho por Advogado</h3>
      
      {/* Lista de advogados com avatares */}
      <div className="workload-list">
        {workloadData.map((data, index) => (
          <div key={data.user.id} className="workload-item">
            <UserAvatar user={data.user} size="sm" showName={true} />
            <div className="workload-stats">
              <span className="workload-total">{data.total} processos</span>
              <div className="workload-breakdown">
                <span className="workload-stat workload-stat-active">{data.ativos} ativos</span>
                {data.suspensos > 0 && (
                  <span className="workload-stat workload-stat-suspended">{data.suspensos} suspensos</span>
                )}
                {data.arquivados > 0 && (
                  <span className="workload-stat workload-stat-archived">{data.arquivados} arquivados</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <ResponsiveContainer width="100%" height={200} style={{ marginTop: 'var(--spacing-lg)' }}>
        <BarChart data={workloadData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="nome" 
            tick={{ fontSize: 11 }}
            stroke="#718096"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            stroke="#718096"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-light)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="ativos" fill="#28A745" name="Ativos" radius={[4, 4, 0, 0]} />
          <Bar dataKey="suspensos" fill="#FFC107" name="Suspensos" radius={[4, 4, 0, 0]} />
          <Bar dataKey="arquivados" fill="#6B7280" name="Arquivados" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkloadChart;

