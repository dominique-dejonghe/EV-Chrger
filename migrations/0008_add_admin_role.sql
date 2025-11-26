-- Add 'admin' role to users table
-- Update CHECK constraint to allow 'free', 'premium', and 'admin'

-- Step 1: Create new table with updated role constraint
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'free' CHECK(role IN ('free', 'premium', 'admin')),
  stripe_customer_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Copy all existing data
INSERT INTO users_new (id, email, password_hash, first_name, last_name, role, stripe_customer_id, created_at, updated_at)
SELECT id, email, password_hash, first_name, last_name, role, stripe_customer_id, created_at, updated_at
FROM users;

-- Step 3: Drop old table and rename new one
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
