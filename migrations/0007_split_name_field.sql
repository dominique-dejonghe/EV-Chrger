-- Split 'name' field into 'first_name' and 'last_name'
-- SQLite doesn't support ALTER TABLE to add/drop columns with constraints easily
-- So we recreate the table

-- Step 1: Create new table with first_name and last_name
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'free' CHECK(role IN ('free', 'premium')),
  stripe_customer_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Copy data and attempt to split existing 'name' field
-- If name contains space, split into first and last
-- Otherwise, put entire name in first_name
INSERT INTO users_new (id, email, password_hash, first_name, last_name, role, stripe_customer_id, created_at, updated_at)
SELECT 
  id, 
  email, 
  password_hash,
  CASE 
    WHEN name IS NULL THEN NULL
    WHEN INSTR(name, ' ') > 0 THEN SUBSTR(name, 1, INSTR(name, ' ') - 1)
    ELSE name
  END as first_name,
  CASE 
    WHEN name IS NULL THEN NULL
    WHEN INSTR(name, ' ') > 0 THEN SUBSTR(name, INSTR(name, ' ') + 1)
    ELSE NULL
  END as last_name,
  role,
  stripe_customer_id,
  created_at,
  updated_at
FROM users;

-- Step 3: Drop old table and rename new one
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
