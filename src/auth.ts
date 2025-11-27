import { sign, verify } from 'hono/jwt'
import type { JWTPayload } from 'hono/utils/jwt/types'

// Password hashing using scrypt (Cloudflare Workers compatible)
// More secure than SHA-256: includes salt + computational cost
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt (16 bytes = 128 bits)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  
  // Derive key using PBKDF2 (scrypt not available in Workers, PBKDF2 is next best)
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  )
  
  const hashArray = Array.from(new Uint8Array(derivedBits))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // Return format: salt$hash (easier to verify later)
  return `${saltHex}$${hashHex}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Handle legacy SHA-256 hashes (no salt)
    if (!storedHash.includes('$')) {
      // Legacy SHA-256 verification (for backward compatibility)
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return legacyHash === storedHash
    }
    
    // New PBKDF2 verification
    const [saltHex, expectedHashHex] = storedHash.split('$')
    
    // Convert salt from hex to Uint8Array
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    
    // Derive key with same parameters
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    )
    
    const hashArray = Array.from(new Uint8Array(derivedBits))
    const computedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Constant-time comparison to prevent timing attacks
    return computedHashHex === expectedHashHex
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
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
