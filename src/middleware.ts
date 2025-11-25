import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { verifyToken } from './auth'
import type { UserPayload } from './auth'

export interface Env {
  DB: D1Database
  JWT_SECRET: string
}

// Extend Hono context with user info
declare module 'hono' {
  interface ContextVariableMap {
    user: UserPayload
  }
}

// Authentication middleware - verifies JWT token
export const authMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.json({ success: false, error: 'Unauthorized - No token provided' }, 401)
  }

  const jwtSecret = c.env.JWT_SECRET || 'default-secret-change-in-production'
  const user = await verifyToken(token, jwtSecret)

  if (!user) {
    return c.json({ success: false, error: 'Unauthorized - Invalid token' }, 401)
  }

  // Attach user to context
  c.set('user', user)
  
  await next()
})

// Optional auth middleware - doesn't block if no token, but adds user to context if present
export const optionalAuthMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const token = getCookie(c, 'auth_token')
  
  if (token) {
    const jwtSecret = c.env.JWT_SECRET || 'default-secret-change-in-production'
    const user = await verifyToken(token, jwtSecret)
    
    if (user) {
      c.set('user', user)
    }
  }
  
  await next()
})

// Role-based middleware - check if user has required role
export const requireRole = (allowedRoles: string[]) => {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({ 
        success: false, 
        error: 'Forbidden - Insufficient permissions',
        requiredRole: allowedRoles,
        currentRole: user.role
      }, 403)
    }

    await next()
  })
}
