import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Processo from './Processo.js';

class Documento extends Model {}

Documento.init({
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
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM(
      'peticao',
      'procuracao',
      'sentenca',
      'despacho',
      'comprovante',
      'contrato',
      'certidao',
      'outros'
    ),
    allowNull: false,
    defaultValue: 'outros'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL pública do arquivo no Supabase Storage'
  },
  caminho: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Caminho completo no storage'
  },
  tamanho: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tamanho em bytes'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  uploadPor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Documento',
  tableName: 'documentos',
  timestamps: true,
  underscored: true
});

export default Documento;

