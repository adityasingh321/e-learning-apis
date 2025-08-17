import { Request, Response } from 'express';
import { param } from 'express-validator';
import enrollmentService from '../services/enrollmentService';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validation';

export const enrollStudent = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.body;
  const enrollment = await enrollmentService.enrollStudent(req.user!.userId, parseInt(courseId));
  
  res.status(201).json({
    success: true,
    data: enrollment
  });
});

export const getMyCourses = asyncHandler(async (req: Request, res: Response) => {
  const enrollments = await enrollmentService.getMyCourses(req.user!.userId);
  
  res.json({
    success: true,
    data: enrollments
  });
});

export const unenrollStudent = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  await enrollmentService.unenrollStudent(req.user!.userId, parseInt(courseId));
  
  res.json({
    success: true,
    message: 'Successfully unenrolled from course'
  });
});

export const getCourseStudents = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const students = await enrollmentService.getCourseStudents(parseInt(courseId), req.user!.userId);
  
  res.json({
    success: true,
    data: students
  });
});

export const getEnrollmentAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await enrollmentService.getEnrollmentAnalytics(req.user!.userId);
  
  res.json({
    success: true,
    data: analytics
  });
});
