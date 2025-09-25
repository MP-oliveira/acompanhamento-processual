import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Supabase (local e produção)
const databaseConfig = process.env.DATABASE_URL ? 
  process.env.DATABASE_URL : 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const sequelize = new Sequelize(databaseConfig, {
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000,
    requestTimeout: 60000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 30000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  logging: console.log
});

export default sequelize;
