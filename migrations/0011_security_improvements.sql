-- Security improvements migration
-- Add security-related columns to existing users table

-- Recreate users table with new security columns
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  paddle_customer_id TEXT,
  paddle_subscription_id TEXT,
  mollie_customer_id TEXT,
  mollie_subscription_id TEXT,
  subscription_status TEXT,
  subscription_end_date DATETIME,
  last_login_at DATETIME,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until DATETIME,
  password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data
INSERT INTO users_new (
  id, email, password_hash, first_name, last_name, role,
  stripe_customer_id, paddle_customer_id, paddle_subscription_id,
  mollie_customer_id, mollie_subscription_id, 
  subscription_status, subscription_end_date,
  created_at, updated_at
)
SELECT 
  id, email, password_hash, first_name, last_name, role,
  stripe_customer_id, paddle_customer_id, paddle_subscription_id,
  mollie_customer_id, mollie_subscription_id,
  subscription_status, subscription_end_date,
  created_at, updated_at
FROM users;

-- Drop old table and rename new one
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_locked ON users(account_locked_until);
CREATE INDEX idx_users_mollie_customer ON users(mollie_customer_id);
CREATE INDEX idx_users_mollie_subscription ON users(mollie_subscription_id);
