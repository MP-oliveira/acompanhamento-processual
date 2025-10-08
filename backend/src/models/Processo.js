import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Processo extends Model {}

Processo.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  classe: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  assunto: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tribunal: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  comarca: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'arquivado', 'suspenso'),
    defaultValue: 'ativo'
  },
  dataDistribuicao: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_distribuicao'
  },
  dataSentenca: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_sentenca'
  },
  prazoRecurso: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'prazo_recurso'
  },
  prazoEmbargos: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'prazo_embargos'
  },
  proximaAudiencia: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'proxima_audiencia'
  },
  horaAudiencia: {
    type: DataTypes.STRING(5),
    allowNull: true,
    field: 'hora_audiencia'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'cliente_id',
    references: {
      model: 'clientes',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Processo',
  tableName: 'processos'
});

export default Processo;
