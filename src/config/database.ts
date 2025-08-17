import { Sequelize, Dialect } from 'sequelize';
import { logQuery, logConnection } from '../utils/dbLogger';
import dotenv from 'dotenv';

dotenv.config(); 

const dialect = (process.env.DB_DIALECT || 'mssql') as Dialect;

const sequelize = new Sequelize({
  dialect,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'e_learning_db',
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  logging: process.env.NODE_ENV === 'development' ? (sql, timing) => {
    logQuery(sql, timing, 'Sequelize Query');
  } : false,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
sequelize.authenticate()
  .then(() => console.log(' DB Connected!'))
  .catch(err => console.error(' DB Connection Error:', err));

export default sequelize;
