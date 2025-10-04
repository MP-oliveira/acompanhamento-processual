import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TribunalBarChart = ({ processos }) => {
  // Agrupar processos por tribunal
  const tribunalCount = processos.reduce((acc, processo) => {
    const tribunal = processo.tribunal || 'Não informado';
    acc[tribunal] = (acc[tribunal] || 0) + 1;
    return acc;
  }, {});

  // Transformar em formato do gráfico
  const data = Object.entries(tribunalCount)
    .map(([tribunal, count]) => ({
      tribunal,
      processos: count
    }))
    .sort((a, b) => b.processos - a.processos)
    .slice(0, 8); // Top 8 tribunais

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>Nenhum processo para exibir</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Processos por Tribunal</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="tribunal" 
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
          <Bar 
            dataKey="processos" 
            fill="#4A90E2" 
            radius={[8, 8, 0, 0]}
            name="Quantidade"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TribunalBarChart;

