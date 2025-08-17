import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import authService from '../services/authService';
import User from '../models/User';
import { NotFoundError } from '../utils/errors';
import { logQuery } from '../utils/dbLogger';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validation';

export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1, max: 100 }).withMessage('Last name is required'),
  body('role').optional().isIn(['student', 'instructor', 'admin']).withMessage('Invalid role'),
  validate
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

export const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  validate
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validate
];

export const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  validate
];

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  
  res.status(201).json({
    success: true,
    data: result
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  res.json({
    success: true,
    data: result
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any).userId;
  
  const startTime = Date.now();
  const user = await User.findByPk(userId, {
    attributes: ['id', 'email', 'firstName', 'lastName', 'bio', 'role', 'status', 'createdAt']
  });
  const endTime = Date.now();
  
  logQuery(
    `SELECT user profile by ID: ${userId}`,
    endTime - startTime,
    'Get Profile Query'
  );
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    }
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, bio } = req.body;
  const userId = (req.user as any).userId;
  
  const startTime = Date.now();
  const user = await User.findByPk(userId);
  const endTime = Date.now();
  
  logQuery(
    `SELECT user by ID: ${userId}`,
    endTime - startTime,
    'Update Profile Query'
  );
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  const updateStartTime = Date.now();
  await user.update({
    firstName: firstName || user.firstName,
    lastName: lastName || user.lastName,
    bio: bio || user.bio
  });
  const updateEndTime = Date.now();
  
  logQuery(
    `UPDATE user profile for ID: ${userId}`,
    updateEndTime - updateStartTime,
    'Update Profile Query'
  );
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        role: user.role
      }
    }
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  console.log(req.body);
  const { email } = req.body;
  const token = await authService.forgotPassword(email);
  
  res.json({
    success: true,
    data: {
      token
    }
  });
});


export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  
  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});
