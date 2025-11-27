import { createMiddleware } from 'hono/factory'

/**
 * Security headers middleware
 * Adds important security headers to all responses
 */
export const securityHeaders = createMiddleware(async (c, next) => {
  await next()
  
  // Content Security Policy
  c.header('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
    "img-src 'self' data: https: http:; " +
    "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; " +
    "connect-src 'self' https://api.mollie.com; " +
    "frame-ancestors 'none';"
  )
  
  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff')
  
  // XSS protection (legacy, but still good)
  c.header('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy (disable unnecessary features)
  c.header('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=()'
  )
  
  // HSTS (HTTP Strict Transport Security) - force HTTPS
  // Only add if already on HTTPS
  if (c.req.url.startsWith('https://')) {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
})
