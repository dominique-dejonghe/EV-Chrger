import { sign, verify } from 'hono/jwt'
import type { JWTPayload } from 'hono/utils/jwt/types'

// Password hashing using Web Crypto API (Cloudflare Workers compatible)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// JWT token generation
export interface UserPayload extends JWTPayload {
  userId: number
  email: string
  role: string
}

export async function generateToken(payload: UserPayload, secret: string): Promise<string> {
  return await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
    secret
  )
}

export async function verifyToken(token: string, secret: string): Promise<UserPayload | null> {
  try {
    const payload = await verify(token, secret)
    return payload as UserPayload
  } catch (error) {
    return null
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  return { valid: true }
}
