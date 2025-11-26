-- Remove 'pro' tier from role constraint
-- SQLite doesn't support ALTER TABLE to modify CHECK constraints
-- So we need to recreate the table

-- Step 1: Create new table with updated constraint
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'free' CHECK(role IN ('free', 'premium')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Copy data (converting any 'pro' to 'premium')
INSERT INTO users_new (id, email, password_hash, name, role, stripe_customer_id, created_at, updated_at)
SELECT id, email, password_hash, name, 
       CASE WHEN role = 'pro' THEN 'premium' ELSE role END,
       stripe_customer_id, created_at, updated_at
FROM users;

-- Step 3: Drop old table and rename new one
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
