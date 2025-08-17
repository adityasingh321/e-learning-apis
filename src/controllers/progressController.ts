import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import progressService from '../services/progressService';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validation';

export const updateProgressValidation = [
  body('isCompleted').isBoolean().withMessage('isCompleted must be a boolean'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('timeSpent must be a non-negative integer'),
  body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('score must be between 0 and 100'),
  validate
];

export const updateProgress = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, lessonId } = req.params;
  const progress = await progressService.updateProgress(
    req.user!.userId,
    parseInt(courseId),
    parseInt(lessonId),
    req.body
  );
  
  res.json({
    success: true,
    data: progress
  });
});

export const getCourseProgress = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const progress = await progressService.getCourseProgress(req.user!.userId, parseInt(courseId));
  
  res.json({
    success: true,
    data: progress
  });
});

export const getStudentProgressForInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const progress = await progressService.getStudentProgressForInstructor(parseInt(courseId), req.user!.userId);
  
  res.json({
    success: true,
    data: progress
  });
});
