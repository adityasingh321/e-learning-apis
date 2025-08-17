import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { queryLogger } from './middleware/queryLogger';
import sequelize from './config/database';
import logger from './utils/logger';
import { seedDatabase } from './utils/seeder';
import { initializeDatabase } from './utils/dbInitializer';
import { specs } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(queryLogger);

app.use('/api/v1', routes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-Learning Platform API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found'
    }
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    // Initialize database
    const { isNewDatabase } = await initializeDatabase();

    // Seed database with initial data
    await seedDatabase();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export app for testing
export { app };

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
