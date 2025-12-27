// JWT authentication helpers
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export interface TokenPayload {
  username: string;
  role: string;
}

export function verifyToken(token: string): TokenPayload {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function createToken(username: string, role: string = 'admin'): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '24h' });
}

export function getAdminCredentials() {
  return {
    username: ADMIN_USERNAME,
    passwordHash: ADMIN_PASSWORD_HASH,
  };
}

