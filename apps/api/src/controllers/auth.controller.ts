import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/password';
import { HttpError } from '../../infra/errors';
import { prisma } from '../services/database.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  fullName: z.string().min(2)
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    console.log('Trying to login with email:', email);
    console.log('Password provided:', password);
    
    // Tìm user trong database
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('User not found for email:', email);
      return next(new HttpError(401, 'Invalid credentials'));
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });
    console.log('Stored password hash:', user.passwordHash.substring(0, 20) + '...');

    // Kiểm tra password
    const isValid = await comparePassword(password, user.passwordHash);
    console.log('Password validation result:', isValid);
    
    if (!isValid) {
      console.log('Password validation failed');
      return next(new HttpError(401, 'Invalid credentials'));
    }

    // Update login activity
    await updateUserLogin(user.id);

    // Tạo JWT token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
      { expiresIn: '1d' }
    );

    // Trả về thông tin user và token
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({
      accessToken,
      me: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = registerSchema.parse(req.body);
    
    // Kiểm tra email đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return next(new HttpError(400, 'Email already exists'));
    }

    // Hash password và tạo user mới
    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: 'USER'
      }
    });

    // Tạo JWT token
    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
      { expiresIn: '1d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      accessToken,
      me: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy user từ token (sẽ được set bởi auth middleware)
    const user = (req as any).user;
    if (!user) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.userId }
    });
    
    if (!fullUser) {
      return next(new HttpError(404, 'User not found'));
    }

    const { passwordHash, ...userWithoutPassword } = fullUser;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy user từ token
    const user = (req as any).user;
    if (!user) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    // Update logout activity
    await updateUserLogout(user.userId);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Export function để access users từ database
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

// Export function để add user activity tracking
let userLastActivity: Record<string, { 
  lastActivityAt: string; 
  lastActivityType: string;
  lastLoginAt?: string;
  isCurrentlyActive?: boolean;
}> = {};

// Export để activity monitor có thể access
export { userLastActivity };

export const updateUserActivity = async (userId: string, activityType: string) => {
  const now = new Date();
  
  if (!userLastActivity[userId]) {
    // Chỉ set active = true nếu là login, các activity khác không thay đổi trạng thái
    userLastActivity[userId] = {
      lastActivityAt: now.toISOString(),
      lastActivityType: activityType,
      isCurrentlyActive: activityType === 'login'
    };
  } else {
    // Update activity và set active = true nếu không phải logout
    userLastActivity[userId] = {
      ...userLastActivity[userId],
      lastActivityAt: now.toISOString(),
      lastActivityType: activityType,
      isCurrentlyActive: activityType !== 'logout' && activityType !== 'auto-logout'
    };
  }
  
  // Update database với lastActivityAt để activity monitor có thể track
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastActivityAt: now,
        lastActivityType: activityType,
        // Set active = true khi có bất kỳ activity nào (trừ logout)
        isCurrentlyActive: activityType !== 'logout' && activityType !== 'auto-logout'
      }
    });
  } catch (error) {
    console.error('Error updating user activity in DB:', error);
  }
};

export const updateUserLogin = async (userId: string) => {
  const now = new Date();
  
  // Update database
  await prisma.user.update({
    where: { id: userId },
    data: {
      isCurrentlyActive: true,
      lastActivityAt: now,
      lastActivityType: 'login'
    }
  });
  
  // Update memory cache
  userLastActivity[userId] = {
    lastActivityAt: now.toISOString(),
    lastActivityType: 'login',
    lastLoginAt: now.toISOString(),
    isCurrentlyActive: true
  };
};

export const updateUserLogout = async (userId: string) => {
  const now = new Date();
  
  // Update database
  await prisma.user.update({
    where: { id: userId },
    data: {
      isCurrentlyActive: false,
      lastActivityAt: now,
      lastActivityType: 'logout'
    }
  });
  
  // Update memory cache
  if (userLastActivity[userId]) {
    userLastActivity[userId] = {
      ...userLastActivity[userId],
      lastActivityAt: now.toISOString(),
      lastActivityType: 'logout',
      isCurrentlyActive: false
    };
  }
};

export const getUserLastActivity = async (userId: string) => {
  // Check memory first
  let activity = userLastActivity[userId];
  
  // If not in memory, get from database
  if (!activity) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        isCurrentlyActive: true,
        lastActivityAt: true,
        lastActivityType: true
      }
    });
    
    if (user && user.lastActivityAt) {
      activity = {
        lastActivityAt: user.lastActivityAt.toISOString(),
        lastActivityType: user.lastActivityType || 'unknown',
        isCurrentlyActive: user.isCurrentlyActive
      };
      
      // Cache in memory
      userLastActivity[userId] = activity;
    }
  }
  
  console.log(`[DEBUG] getUserLastActivity for ${userId}:`, activity);
  return activity || null;
};

// Debug function để xem tất cả user activities
export const getAllUserActivities = () => {
  console.log('[DEBUG] All user activities:', userLastActivity);
  return userLastActivity;
};
