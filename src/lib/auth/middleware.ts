import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock user database - in real app, use database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password', // In real app, this would be hashed
    name: 'Admin User',
    role: 'ADMIN',
    permissions: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
  },
  {
    id: '2',
    email: 'accountant@example.com',
    password: 'password',
    name: 'Accountant User',
    role: 'ACCOUNTANT',
    permissions: ['read', 'write', 'manage_financial'],
  },
  {
    id: '3',
    email: 'user@example.com',
    password: 'password',
    name: 'Regular User',
    role: 'USER',
    permissions: ['read'],
  },
];

// Mock JWT secret - in real app, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface AuthTokenPayload {
  user: UserPayload;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

export function generateToken(user: UserPayload): string {
  const payload = {
    user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };

  return jwt.sign(payload, JWT_SECRET);
}

export function getUserByEmail(email: string): UserPayload | null {
  const user = users.find(u => u.email === email);
  if (!user) return null;

  const { password, ...userPayload } = user;
  return userPayload;
}

export function validatePassword(email: string, password: string): boolean {
  const user = users.find(u => u.email === email);
  if (!user) return false;

  // In real app, use bcrypt.compare(password, user.password)
  return user.password === password;
}

export function hasPermission(user: UserPayload, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function hasRole(user: UserPayload, role: string): boolean {
  return user.role === role;
}

export function requireAuth(request: NextRequest): UserPayload | null {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  return decoded.user;
}

export function requirePermission(request: NextRequest, permission: string): UserPayload | null {
  const user = requireAuth(request);
  if (!user) {
    return null;
  }

  if (!hasPermission(user, permission)) {
    return null;
  }

  return user;
}

export function requireRole(request: NextRequest, role: string): UserPayload | null {
  const user = requireAuth(request);
  if (!user) {
    return null;
  }

  if (!hasRole(user, role)) {
    return null;
  }

  return user;
}

export function createAuthMiddleware(options: {
  permissions?: string[];
  roles?: string[];
} = {}) {
  return (request: NextRequest): NextResponse | null => {
    const user = requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permissions if specified
    if (options.permissions) {
      const hasAllPermissions = options.permissions.every(permission => 
        hasPermission(user, permission)
      );
      
      if (!hasAllPermissions) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Check roles if specified
    if (options.roles) {
      const hasRequiredRole = options.roles.some(role => 
        hasRole(user, role)
      );
      
      if (!hasRequiredRole) {
        return NextResponse.json(
          { error: 'Insufficient role' },
          { status: 403 }
        );
      }
    }

    return null; // User is authorized
  };
}