import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import User, { UserStatus } from '../models/User';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validation';
import { NotFoundError } from '../utils/errors';

export const updateUserStatusValidation = [
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  validate
];

export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await User.count();
  const totalStudents = await User.count({ where: { role: 'student' } });
  const totalInstructors = await User.count({ where: { role: 'instructor' } });
  const totalCourses = await Course.count();
  const totalEnrollments = await Enrollment.count();
  const activeEnrollments = await Enrollment.count({ where: { status: 'active' } });

  const stats = {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    totalEnrollments,
    activeEnrollments,
    completionRate: totalEnrollments > 0 ? (activeEnrollments / totalEnrollments) * 100 : 0
  };

  res.json({
    success: true,
    data: stats
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const role = req.query.role as string;
  const offset = (page - 1) * limit;

  const whereClause: any = {};
  if (role && ['student', 'instructor', 'admin'].includes(role)) {
    whereClause.role = role;
  }

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt'],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });

  res.json({
    success: true,
    data: {
      users: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findByPk(parseInt(id));
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await user.update({ status });

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: {
      id: user.id,
      email: user.email,
      status: user.status
    }
  });
});
