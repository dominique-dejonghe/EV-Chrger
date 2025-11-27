import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { hashPassword, verifyPassword, generateToken, isValidEmail, isValidPassword } from './auth'
import type { Env } from './middleware'

const auth = new Hono<{ Bindings: Env }>()

// Register new user
auth.post('/register', async (c) => {
  try {
    const { email, password, firstName, lastName } = await c.req.json()

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return c.json({ success: false, error: 'All fields are required' }, 400)
    }

    if (!isValidEmail(email)) {
      return c.json({ success: false, error: 'Invalid email format' }, 400)
    }

    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      return c.json({ success: false, error: passwordValidation.message }, 400)
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return c.json({ success: false, error: 'Email already registered' }, 409)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await c.env.DB.prepare(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?) RETURNING id, email, first_name, last_name, role`
    ).bind(email, passwordHash, firstName.trim(), lastName.trim(), 'free').first()

    if (!result) {
      return c.json({ success: false, error: 'Failed to create user' }, 500)
    }

    // Generate JWT token
    const jwtSecret = c.env.JWT_SECRET || 'default-secret-change-in-production'
    const token = await generateToken({
      userId: result.id as number,
      email: result.email as string,
      role: result.role as string
    }, jwtSecret)

    // Set httpOnly cookie
    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return c.json({
      success: true,
      user: {
        id: result.id,
        email: result.email,
        firstName: result.first_name,
        lastName: result.last_name,
        role: result.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ success: false, error: 'Registration failed' }, 500)
  }
})

// Login user
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    // Validation
    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400)
    }

    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401)
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash as string)
    
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401)
    }

    // Generate JWT token
    const jwtSecret = c.env.JWT_SECRET || 'default-secret-change-in-production'
    const token = await generateToken({
      userId: user.id as number,
      email: user.email as string,
      role: user.role as string
    }, jwtSecret)

    // Set httpOnly cookie
    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

// Logout user
auth.post('/logout', (c) => {
  deleteCookie(c, 'auth_token', { path: '/' })
  return c.json({ success: true, message: 'Logged out successfully' })
})

// Get current user info
auth.get('/me', async (c) => {
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.json({ success: false, error: 'Not authenticated' }, 401)
  }

  const jwtSecret = c.env.JWT_SECRET || 'default-secret-change-in-production'
  const { verifyToken } = await import('./auth')
  const payload = await verifyToken(token, jwtSecret)

  if (!payload) {
    return c.json({ success: false, error: 'Invalid token' }, 401)
  }

  // Fetch fresh user data from DB
  const user = await c.env.DB.prepare(
    'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first()

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404)
  }

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at
    }
  })
})

// Refresh JWT token with latest DB role
auth.post('/refresh-token', async (c) => {
  try {
    const token = getCookie(c, 'auth_token')
    
    if (!token) {
      return c.json({ success: false, error: 'Not authenticated' }, 401)
    }

    const jwtSecret = c.env.JWT_SECRET || 'default-secret-change-in-production'
    const { verifyToken } = await import('./auth')
    const payload = await verifyToken(token, jwtSecret)

    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401)
    }

    // Fetch fresh user data from DB to get latest role
    const user = await c.env.DB.prepare(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?'
    ).bind(payload.userId).first()

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404)
    }

    // Generate NEW JWT token with CURRENT database role
    const newToken = await generateToken({
      userId: user.id as number,
      email: user.email as string,
      role: user.role as string
    }, jwtSecret)

    // Set new httpOnly cookie
    setCookie(c, 'auth_token', newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return c.json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return c.json({ success: false, error: 'Failed to refresh token' }, 500)
  }
})

export default auth
