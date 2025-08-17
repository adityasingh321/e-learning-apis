import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User, { UserRole } from '../models/User';
import { AuthenticationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';
import { logQuery } from '../utils/dbLogger';

export class AuthService {
  private generateToken(userId: number, email: string, role: UserRole): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.sign(
      { userId, email, role },
      secret as string,
      { expiresIn: '24h' }
    );
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }) {
    const startTime = Date.now();
    const existingUser = await User.findOne({ where: { email: userData.email } });
    const endTime = Date.now();
    
    logQuery(
      `SELECT existing user by email: ${userData.email}`,
      endTime - startTime,
      'User Registration Check Query'
    );
    
    if (existingUser) {
      throw new AuthenticationError('Email already registered');
    }

    const user = await User.create({
      ...userData,
      role: userData.role || UserRole.STUDENT
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    };
  }

  async login(email: string, password: string) {
    const startTime = Date.now();
    const user = await User.findOne({ where: { email } });
    const endTime = Date.now();
    
    logQuery(
      `SELECT user by email: ${email}`,
      endTime - startTime,
      'User Login Query'
    );
    
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    };
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string) {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpires: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for user ${user.email}`);
  }
}

export default new AuthService();
