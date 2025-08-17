import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import Review from '../models/Review';
import Course from '../models/Course';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validation';
import { NotFoundError, AuthorizationError, ConflictError } from '../utils/errors';

export const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  validate
];

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;

  const course = await Course.findByPk(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  const existingReview = await Review.findOne({
    where: { studentId: req.user!.userId, courseId: parseInt(courseId) }
  });

  if (existingReview) {
    throw new ConflictError('You have already reviewed this course');
  }

  const review = await Review.create({
    studentId: req.user!.userId,
    courseId: parseInt(courseId),
    rating,
    comment
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

export const getCourseReviews = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  
  const reviews = await Review.findAll({
    where: { courseId: parseInt(courseId) },
    include: [
      {
        model: User,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    data: reviews
  });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findByPk(parseInt(id));
  if (!review) {
    throw new NotFoundError('Review not found');
  }

  if (review.studentId !== req.user!.userId) {
    throw new AuthorizationError('You can only update your own reviews');
  }

  await review.update({ rating, comment });

  res.json({
    success: true,
    data: review
  });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findByPk(parseInt(id));
  if (!review) {
    throw new NotFoundError('Review not found');
  }

  if (review.studentId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AuthorizationError('You can only delete your own reviews');
  }

  await review.destroy();

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});
