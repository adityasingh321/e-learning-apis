import logger from './logger';

export const logQuery = (sql: string, timing?: number, context?: string) => {
  const logData = {
    sql: sql.trim(),
    timing: timing ? `${timing}ms` : 'N/A',
    context: context || 'Database Query',
    timestamp: new Date().toISOString()
  };

  logger.info(`[DB Query] ${logData.context}`, logData);
};

export const logError = (error: any, context?: string) => {
  const logData = {
    error: error.message || error,
    stack: error.stack,
    context: context || 'Database Error',
    timestamp: new Date().toISOString()
  };

  logger.error(`[DB Error] ${logData.context}`, logData);
};

export const logConnection = (action: string, details?: any) => {
  const logData = {
    action,
    details: details || {},
    timestamp: new Date().toISOString()
  };

  logger.info(`[DB Connection] ${action}`, logData);
};

export const logTransaction = (action: string, details?: any) => {
  const logData = {
    action,
    details: details || {},
    timestamp: new Date().toISOString()
  };

  logger.info(`[DB Transaction] ${action}`, logData);
};
