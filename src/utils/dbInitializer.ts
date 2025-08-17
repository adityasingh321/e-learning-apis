import sequelize from '../config/database';
import logger from './logger';
import '../models';

export const initializeDatabase = async () => {
  try {
    // First, try to authenticate
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Check if the database exists and has tables
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    
    if (tableExists.length === 0) {
      // No tables exist, create them with force
      logger.info('No tables found, creating fresh database...');
      await sequelize.sync({ force: true });
      logger.info('Database tables created successfully');
      return { isNewDatabase: true };
    } else {
      // Tables exist, just sync without altering
      logger.info('Tables exist, syncing database schema...');
      await sequelize.sync({ alter: false });
      logger.info('Database schema synced successfully');
      return { isNewDatabase: false };
    }
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};
