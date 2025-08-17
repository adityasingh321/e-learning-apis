import { Request, Response, NextFunction } from 'express';
import { logQuery } from '../utils/dbLogger';

export const queryLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logQuery(
      `${req.method} ${req.path} - Response time: ${duration}ms`,
      duration,
      `API Request: ${req.method} ${req.path}`
    );
    
    return originalSend.call(this, data);
  };

  next();
};
