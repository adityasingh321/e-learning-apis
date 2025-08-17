import { Router } from 'express';
import authRoutes from './auth';
import courseRoutes from './courses';
import enrollmentRoutes from './enrollments';
import progressRoutes from './progress';
import reviewRoutes from './reviews';
import adminRoutes from './admin';
import categoryRoutes from './categories';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/progress', progressRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);

export default router;
