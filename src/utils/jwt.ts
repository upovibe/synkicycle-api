import jwt from 'jsonwebtoken';
import { config } from '@config/env';

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  } as jwt.SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
};

