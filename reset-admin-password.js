// Quick password hash generator for admin reset
// Usage: node reset-admin-password.js <password>

async function hashPassword(password) {
  // Generate random salt (16 bytes = 128 bits)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  
  // Derive key using PBKDF2
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
    32 * 8 // 32 bytes = 256 bits
  )
  
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  // Format matches auth.ts: salt$hash (no prefix)
  return `${saltHex}$${hashHex}`
}

const password = process.argv[2] || 'Admin2025!'

hashPassword(password).then(hash => {
  console.log('\n=== ADMIN PASSWORD RESET ===')
  console.log('Password:', password)
  console.log('Hash:', hash)
  console.log('\nRun this SQL command:')
  console.log(`\ncd /home/user/webapp && npx wrangler d1 execute evcharger-production --remote --command="UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@evcharge.be'"`)
})
