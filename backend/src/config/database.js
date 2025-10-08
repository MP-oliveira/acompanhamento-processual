import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Detectar se está rodando no Vercel (serverless)
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

// Configuração do Supabase (local e produção)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  // Pool otimizado para serverless
  pool: isVercel ? {
    max: 2,
    min: 0,
    acquire: 3000,
    idle: 0
  } : {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

export default sequelize;
