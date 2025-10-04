import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  ativo: '#28A745',
  suspenso: '#FFC107',
  arquivado: '#6B7280'
};

const LABELS = {
  ativo: 'Ativos',
  suspenso: 'Suspensos',
  arquivado: 'Arquivados'
};

const StatusPieChart = ({ processos }) => {
  // Agrupar processos por status
  const statusCount = processos.reduce((acc, processo) => {
    const status = processo.status || 'ativo';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Transformar em formato do gráfico
  const data = Object.entries(statusCount).map(([status, count]) => ({
    name: LABELS[status] || status,
    value: count,
    status
  }));

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>Nenhum processo para exibir</p>
      </div>
    );
  }

  const renderLabel = (entry) => {
    return `${entry.value}`;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Processos por Status</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusPieChart;

