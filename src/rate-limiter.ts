import { createMiddleware } from 'hono/factory'
import type { Env } from './middleware'

interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Max requests per window
}

// In-memory rate limit store (for Cloudflare Workers)
// Note: This resets on cold starts, but provides basic protection
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware
 * @param config - Configuration for rate limiting
 * @returns Middleware function
 */
export const rateLimiter = (config: RateLimitConfig) => {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const identifier = c.req.header('cf-connecting-ip') || 'unknown'
    const now = Date.now()
    
    // Opportunistic cleanup (every ~10 requests to avoid performance impact)
    if (Math.random() < 0.1) {
      cleanupOldEntries()
    }
    
    // Get or create rate limit record
    let record = rateLimitStore.get(identifier)
    
    // Reset if window expired
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + config.windowMs
      }
      rateLimitStore.set(identifier, record)
    }
    
    // Increment request count
    record.count++
    
    // Check if limit exceeded
    if (record.count > config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      return c.json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: retryAfter
      }, 429, {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
      })
    }
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', config.maxRequests.toString())
    c.header('X-RateLimit-Remaining', (config.maxRequests - record.count).toString())
    c.header('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
    
    await next()
  })
}

/**
 * Cleanup old entries (called during rate limit checks to prevent memory leak)
 * Note: In Cloudflare Workers, we can't use setInterval, so we clean opportunistically
 */
function cleanupOldEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + 60000) { // Clean entries 1 minute after expiry
      rateLimitStore.delete(key)
    }
  }
}
