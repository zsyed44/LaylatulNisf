import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// Admin credentials - in production, store these in environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Hash the password on first run if not already hashed
// In production, generate this hash and store in environment variable
let passwordHash: string | null = null;

async function getPasswordHash(): Promise<string> {
  if (passwordHash) {
    return passwordHash;
  }

  if (ADMIN_PASSWORD_HASH) {
    passwordHash = ADMIN_PASSWORD_HASH;
    return passwordHash;
  }

  // Generate hash for the password "YaMahdi313!"
  // This should be done once and stored in environment variable
  const plainPassword = 'YaMahdi313!';
  passwordHash = await bcrypt.hash(plainPassword, 10);
  console.warn('⚠️  Generated password hash. Store this in ADMIN_PASSWORD_HASH environment variable:');
  console.warn(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  return passwordHash;
}

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
    }

    // Verify username
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Get password hash
    const hash = await getPasswordHash();

    // Verify password
    const isValid = await bcrypt.compare(password, hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        token,
        username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate',
    });
  }
});

// Verify token endpoint (for frontend to check if still authenticated)
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
      res.json({
        success: true,
        data: {
          username: decoded.username,
          role: decoded.role,
        },
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify token',
    });
  }
});

export default router;

