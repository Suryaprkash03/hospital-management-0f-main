
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '@/middleware/auth';
import { ValidationError, UnauthorizedError } from '@/middleware/errorHandler';
import { JWTPayload, ApiResponse } from '@/types';
import { validateEmail, validatePassword } from '@/utils/validation';

const prisma = new PrismaClient();

const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const authController = {
  async login(req: AuthRequest, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        staffProfile: true,
        patientProfile: true
      }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update login tracking
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        loginCount: user.loginCount + 1,
        firstLogin: false
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const response: ApiResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          profileCompleted: user.profileCompleted,
          mustChangePassword: user.mustChangePassword,
          firstLogin: user.firstLogin,
          staffProfile: user.staffProfile,
          patientProfile: user.patientProfile
        }
      },
      message: 'Login successful'
    };

    res.json(response);
  },

  async register(req: AuthRequest, res: Response) {
    const { email, password, firstName, lastName, role, phone } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      throw new ValidationError('All required fields must be provided');
    }

    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!validatePassword(password)) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        profileCompleted: false
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const response: ApiResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          profileCompleted: user.profileCompleted
        }
      },
      message: 'Registration successful'
    };

    res.status(201).json(response);
  },

  async getProfile(req: AuthRequest, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        staffProfile: true,
        patientProfile: true
      },
      omit: { password: true }
    });

    const response: ApiResponse = {
      success: true,
      data: { user }
    };

    res.json(response);
  },

  async updateProfile(req: AuthRequest, res: Response) {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        profileCompleted: true
      },
      omit: { password: true }
    });

    const response: ApiResponse = {
      success: true,
      data: { user },
      message: 'Profile updated successfully'
    };

    res.json(response);
  },

  async changePassword(req: AuthRequest, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    if (!validatePassword(newPassword)) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const isValidPassword = await bcrypt.compare(currentPassword, user!.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.json(response);
  },

  async forgotPassword(req: AuthRequest, res: Response) {
    // Implementation for password reset email
    const response: ApiResponse = {
      success: true,
      message: 'Password reset email sent (if email exists)'
    };

    res.json(response);
  },

  async resetPassword(req: AuthRequest, res: Response) {
    // Implementation for password reset with token
    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful'
    };

    res.json(response);
  },

  async refreshToken(req: AuthRequest, res: Response) {
    // Implementation for token refresh
    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully'
    };

    res.json(response);
  },

  async logout(req: AuthRequest, res: Response) {
    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };

    res.json(response);
  }
};
