import { Router } from 'express';
import {
  updateProgress,
  getCourseProgress,
  getStudentProgressForInstructor,
  updateProgressValidation
} from '../controllers/progressController';
import { authenticate, requireInstructor } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/progress/{courseId}/lessons/{lessonId}:
 *   post:
 *     summary: Update lesson progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isCompleted
 *             properties:
 *               isCompleted:
 *                 type: boolean
 *                 description: Whether the lesson is completed
 *               timeSpent:
 *                 type: integer
 *                 minimum: 0
 *                 description: Time spent on the lesson in seconds (optional)
 *               score:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Score achieved on the lesson (optional, 0-100)
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/:courseId/lessons/:lessonId', authenticate, updateProgressValidation, updateProgress);

/**
 * @swagger
 * /api/v1/progress/{courseId}:
 *   get:
 *     summary: Get course progress for current user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course progress data
 *       401:
 *         description: Unauthorized
 */
router.get('/:courseId', authenticate, getCourseProgress);

/**
 * @swagger
 * /api/v1/progress/courses/{courseId}/students:
 *   get:
 *     summary: Get all students' progress for a course (Instructor only)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Students' progress data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor access required
 */
router.get('/courses/:courseId/students', authenticate, requireInstructor, getStudentProgressForInstructor);

export default router;
