import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome é obrigatório' },
      len: { args: [3, 200], msg: 'Nome deve ter entre 3 e 200 caracteres' }
    }
  },
  tipo: {
    type: DataTypes.ENUM('fisica', 'juridica'),
    allowNull: false,
    defaultValue: 'fisica'
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    unique: true,
    validate: {
      is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    }
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: true,
    unique: true,
    validate: {
      is: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    }
  },
  rg: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Email inválido' }
    }
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  endereco: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true,
    validate: {
      len: [2, 2],
      isUppercase: true
    }
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: true,
    validate: {
      is: /^\d{5}-\d{3}$/
    }
  },
  profissao: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estadoCivil: {
    type: DataTypes.ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel'),
    allowNull: true,
    field: 'estado_civil'
  },
  dataNascimento: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_nascimento'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'clientes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['email']
    },
    {
      fields: ['nome']
    },
    {
      fields: ['ativo']
    }
  ],
  validate: {
    cpfOuCnpj() {
      if (this.tipo === 'fisica' && !this.cpf) {
        throw new Error('CPF é obrigatório para pessoa física');
      }
      if (this.tipo === 'juridica' && !this.cnpj) {
        throw new Error('CNPJ é obrigatório para pessoa jurídica');
      }
    }
  }
});

export default Cliente;

