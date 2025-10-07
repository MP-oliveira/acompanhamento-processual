import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Timesheet = sequelize.define('Timesheet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  descricao: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Descrição é obrigatória' },
      len: { args: [3, 500], msg: 'Descrição deve ter entre 3 e 500 caracteres' }
    }
  },
  tipo: {
    type: DataTypes.ENUM(
      'audiencia',
      'peticao',
      'reuniao',
      'pesquisa',
      'deslocamento',
      'consulta_processo',
      'analise_documentos',
      'outros'
    ),
    allowNull: false,
    defaultValue: 'outros'
  },
  dataInicio: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'data_inicio'
  },
  dataFim: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_fim'
  },
  duracao: {
    type: DataTypes.INTEGER, // em minutos
    allowNull: false,
    validate: {
      min: { args: 1, msg: 'Duração mínima é 1 minuto' }
    }
  },
  valorHora: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'valor_hora',
    validate: {
      min: { args: 0, msg: 'Valor/hora não pode ser negativo' }
    }
  },
  valorTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'valor_total'
  },
  faturavel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  faturado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dataFaturamento: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_faturamento'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'processo_id',
    references: {
      model: 'processos',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'timesheets',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['processo_id']
    },
    {
      fields: ['data_inicio']
    },
    {
      fields: ['tipo']
    },
    {
      fields: ['faturavel']
    },
    {
      fields: ['faturado']
    }
  ],
  hooks: {
    beforeSave: (timesheet) => {
      // Calcular valor total se valor/hora foi fornecido
      if (timesheet.valorHora && timesheet.duracao) {
        const horas = timesheet.duracao / 60;
        timesheet.valorTotal = (horas * parseFloat(timesheet.valorHora)).toFixed(2);
      }
      
      // Calcular data fim se não foi fornecida
      if (!timesheet.dataFim && timesheet.dataInicio && timesheet.duracao) {
        timesheet.dataFim = new Date(
          new Date(timesheet.dataInicio).getTime() + timesheet.duracao * 60000
        );
      }
    }
  }
});

export default Timesheet;

