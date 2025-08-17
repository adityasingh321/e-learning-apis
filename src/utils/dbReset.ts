import sequelize from '../config/database';
import logger from './logger';

export const resetDatabase = async () => {
  try {
    logger.info('Starting database reset...');
    
    // Force drop and recreate all tables
    await sequelize.sync({ force: true });
    logger.info('Database reset completed successfully');
    
    return true;
  } catch (error) {
    logger.error('Database reset failed:', error);
    throw error;
  }
};
