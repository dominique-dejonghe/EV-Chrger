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

  if (!c.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
  const jwtSecret = c.env.JWT_SECRET
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
    if (!c.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
  const jwtSecret = c.env.JWT_SECRET
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
    console.log('[ADMIN MIDDLEWARE] No auth token found')
    return c.redirect('/')
  }

  if (!c.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
  const jwtSecret = c.env.JWT_SECRET
  const payload = await verifyToken(token, jwtSecret)

  if (!payload) {
    console.log('[ADMIN MIDDLEWARE] Invalid token')
    return c.redirect('/')
  }

  console.log('[ADMIN MIDDLEWARE] JWT payload:', JSON.stringify(payload))

  // Fetch full user data from DB to check role
  const user = await c.env.DB.prepare(
    'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first()

  console.log('[ADMIN MIDDLEWARE] User from DB:', JSON.stringify(user))

  if (!user || user.role !== 'admin') {
    return c.html(`
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Denied</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="text-center p-8">
          <i class="fas fa-shield-alt text-6xl text-red-600 mb-4"></i>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p class="text-gray-600 mb-2">Je hebt geen admin rechten om deze pagina te bekijken.</p>
          <p class="text-sm text-gray-500 mb-6">
            ${!user ? 'User not found' : `Current role: ${user.role}`}
          </p>
          <div class="space-x-4">
            <a href="/app" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              Terug naar Calculator
            </a>
            <button onclick="logout()" class="inline-block px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 cursor-pointer">
              Uitloggen & Opnieuw Inloggen
            </button>
          </div>
        </div>
        <script>
          async function logout() {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/';
          }
        </script>
      </body>
      </html>
    `, 403)
  }

  // Attach user to context
  c.set('user', payload)
  
  await next()
})
