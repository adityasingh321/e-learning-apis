import { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import courseService from '../services/courseService';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validation';

export const courseValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('Valid category is required'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('language').optional().isString().withMessage('Language must be a string'),
  validate
];

export const createCourseValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('language').optional().isString().withMessage('Language must be a string'),
  validate
];

export const lessonValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty if provided'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('type').optional().isIn(['video', 'text', 'quiz', 'assignment']).withMessage('Invalid lesson type'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a non-negative integer'),
  validate
];

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.getCourses(req.query);
  
  res.json({
    success: true,
    data: result
  });
});

export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate course ID
  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid course ID format' }
    });
  }
  
  const includeLessons = req.query.includeLessons === 'true';
  const course = await courseService.getCourseById(courseId, includeLessons);
  
  return res.json({
    success: true,
    data: course
  });
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.createCourse(req.body, req.user!.userId);
  
  res.status(201).json({
    success: true,
    data: course
  });
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate course ID
  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid course ID format' }
    });
  }
  
  const course = await courseService.updateCourse(
    courseId,
    req.body,
    req.user!.userId,
    req.user!.role
  );
  
  return res.json({
    success: true,
    data: course
  });
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate course ID
  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid course ID format' }
    });
  }
  
  try {
    await courseService.deleteCourse(courseId, req.user!.userId, req.user!.role);
    
    return res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error: any) {
    if (error.name === 'AuthorizationError') {
      return res.status(403).json({
        success: false,
        error: { message: error.message }
      });
    }
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        error: { message: error.message }
      });
    }
    throw error;
  }
});

export const getCourseLessons = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate course ID
  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid course ID format' }
    });
  }
  
  const lessons = await courseService.getCourseLessons(courseId);
  
  return res.json({
    success: true,
    data: lessons
  });
});

export const addLesson = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate course ID
  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid course ID format' }
    });
  }
  
  const lesson = await courseService.addLesson(courseId, req.body, req.user!.userId);
  
  return res.status(201).json({
    success: true,
    data: lesson
  });
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, lessonId } = req.params;
  
  // Validate IDs
  const courseIdNum = parseInt(courseId);
  const lessonIdNum = parseInt(lessonId);
  
  if (isNaN(courseIdNum) || isNaN(lessonIdNum)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid course or lesson ID format' }
    });
  }
  
  const lesson = await courseService.updateLesson(
    courseIdNum,
    lessonIdNum,
    req.body,
    req.user!.userId
  );
  
  return res.json({
    success: true,
    data: lesson
  });
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, lessonId } = req.params;
  
  // Validate course ID
  const courseIdNum = parseInt(courseId);
  const lessonIdNum = parseInt(lessonId);
  
  if (isNaN(courseIdNum) || isNaN(lessonIdNum)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid course or lesson ID format' }
    });
  }
  
  await courseService.deleteLesson(courseIdNum, lessonIdNum, req.user!.userId);
  
  return res.json({
    success: true,
    message: 'Lesson deleted successfully'
  });
});
