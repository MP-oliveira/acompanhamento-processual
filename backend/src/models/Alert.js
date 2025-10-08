import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Alert extends Model {}

Alert.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('audiencia', 'prazo_recurso', 'prazo_embargos', 'despacho', 'distribuicao'),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dataVencimento: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'data_vencimento'
  },
  dataNotificacao: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'data_notificacao'
  },
  lido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  prioridade: {
    type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
    defaultValue: 'media'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  processoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'processo_id',
    references: {
      model: 'processos',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Alert',
  tableName: 'alertas'
});

export default Alert;
