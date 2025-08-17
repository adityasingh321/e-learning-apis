import { Router } from 'express';
import {
  enrollStudent,
  getMyCourses,
  unenrollStudent,
  getCourseStudents,
  getEnrollmentAnalytics
} from '../controllers/enrollmentController';
import { authenticate, requireInstructor } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: Course ID to enroll in
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *       400:
 *         description: Already enrolled or course not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, enrollStudent);

/**
 * @swagger
 * /api/v1/enrollments/my-courses:
 *   get:
 *     summary: Get user's enrolled courses
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 *       401:
 *         description: Unauthorized
 */
router.get('/my-courses', authenticate, getMyCourses);

/**
 * @swagger
 * /api/v1/enrollments/{courseId}:
 *   delete:
 *     summary: Unenroll from a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unenrolled from course
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Enrollment not found
 */
router.delete('/:courseId', authenticate, unenrollStudent);

/**
 * @swagger
 * /api/v1/enrollments/courses/{courseId}/students:
 *   get:
 *     summary: Get students enrolled in a course (Instructor only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of enrolled students
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor access required
 */
router.get('/courses/:courseId/students', authenticate, requireInstructor, getCourseStudents);

/**
 * @swagger
 * /api/v1/enrollments/analytics/my-courses:
 *   get:
 *     summary: Get enrollment analytics for instructor's courses
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollment analytics data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor access required
 */
router.get('/analytics/my-courses', authenticate, requireInstructor, getEnrollmentAnalytics);

export default router;
