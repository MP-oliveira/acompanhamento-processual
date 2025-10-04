import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Processo from './Processo.js';

class Custa extends Model {}

Custa.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  processoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'processos',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM(
      'custas_judiciais',
      'honorarios_contratuais', 
      'honorarios_sucumbenciais',
      'despesas_processuais',
      'honorarios_periciais',
      'emolumentos',
      'outros'
    ),
    allowNull: false
  },
  descricao: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  responsavel: {
    type: DataTypes.ENUM('cliente', 'escritorio', 'sucumbente', 'outro'),
    allowNull: false,
    defaultValue: 'cliente'
  },
  status: {
    type: DataTypes.ENUM('pendente', 'pago', 'reembolsado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  dataVencimento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dataPagamento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  formaPagamento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  comprovante: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL do comprovante de pagamento'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  registradoPor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Custa',
  tableName: 'custas',
  timestamps: true,
  underscored: true
});

export default Custa;

