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

// Admin middleware - requires admin role and fetches full user data from DB
export const adminMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.redirect('/')
  }

  const jwtSecret = c.env.JWT_SECRET || 'default-secret-change-in-production'
  const payload = await verifyToken(token, jwtSecret)

  if (!payload) {
    return c.redirect('/')
  }

  // Fetch full user data from DB to check role
  const user = await c.env.DB.prepare(
    'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first()

  if (!user || user.role !== 'admin') {
    return c.html(`
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Toegang Geweigerd</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="text-center">
          <i class="fas fa-shield-alt text-6xl text-red-600 mb-4"></i>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Toegang Geweigerd</h1>
          <p class="text-gray-600 mb-6">Je hebt geen admin rechten om deze pagina te bekijken.</p>
          <a href="/app" class="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700">
            Terug naar Calculator
          </a>
        </div>
      </body>
      </html>
    `, 403)
  }

  // Attach user to context
  c.set('user', payload)
  
  await next()
})
