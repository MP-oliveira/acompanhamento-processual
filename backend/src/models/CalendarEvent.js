import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CalendarEvent = sequelize.define('CalendarEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Título é obrigatório' },
      len: { args: [3, 200], msg: 'Título deve ter entre 3 e 200 caracteres' }
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('audiencia', 'prazo_recurso', 'prazo_embargos', 'reuniao', 'outro'),
    allowNull: false,
    defaultValue: 'outro'
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
  diaInteiro: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'dia_inteiro'
  },
  local: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendente', 'concluido', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  prioridade: {
    type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
    allowNull: false,
    defaultValue: 'media'
  },
  cor: {
    type: DataTypes.STRING(7),
    allowNull: true,
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  lembrete: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lembreteAntecedencia: {
    type: DataTypes.INTEGER, // em minutos
    defaultValue: 1440, // 24 horas
    field: 'lembrete_antecedencia'
  },
  notificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
    onDelete: 'CASCADE'
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
  tableName: 'calendar_events',
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
      fields: ['status']
    },
    {
      fields: ['tipo']
    }
  ]
});

export default CalendarEvent;

