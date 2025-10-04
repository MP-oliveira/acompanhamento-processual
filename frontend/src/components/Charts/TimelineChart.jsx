import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimelineChart = ({ processos }) => {
  // Agrupar processos por mês
  const getMonthYear = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('pt-BR', { month: 'short' })} ${d.getFullYear()}`;
  };

  const monthlyData = processos.reduce((acc, processo) => {
    const month = getMonthYear(processo.createdAt);
    if (!acc[month]) {
      acc[month] = { month, novos: 0, concluidos: 0 };
    }
    acc[month].novos++;
    
    if (processo.dataSentenca) {
      const conclusionMonth = getMonthYear(processo.dataSentenca);
      if (!acc[conclusionMonth]) {
        acc[conclusionMonth] = { month: conclusionMonth, novos: 0, concluidos: 0 };
      }
      acc[conclusionMonth].concluidos++;
    }
    
    return acc;
  }, {});

  // Ordenar por data e pegar últimos 6 meses
  const data = Object.values(monthlyData)
    .sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      return new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`);
    })
    .slice(-6);

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>Nenhum dado para exibir</p>
      </div>
    );
  }

  return (
    <div className="chart-container chart-container-wide">
      <h3 className="chart-title">Evolução de Processos</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            stroke="#718096"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
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
          <Line 
            type="monotone" 
            dataKey="novos" 
            stroke="#4A90E2" 
            strokeWidth={2}
            name="Novos Processos"
            dot={{ fill: '#4A90E2', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="concluidos" 
            stroke="#28A745" 
            strokeWidth={2}
            name="Processos Concluídos"
            dot={{ fill: '#28A745', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;

