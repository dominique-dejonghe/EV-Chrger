-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'free' CHECK(role IN ('free', 'premium', 'pro')),
  stripe_customer_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancel_at_period_end BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Calculation history table
CREATE TABLE IF NOT EXISTS calculation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  charger_power_kw REAL NOT NULL,
  start_soc INTEGER DEFAULT 20,
  end_soc INTEGER DEFAULT 80,
  electricity_price REAL NOT NULL,
  charging_speed_kmh INTEGER,
  charging_time_minutes INTEGER,
  total_cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_history_user_id ON calculation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_history_created_at ON calculation_history(created_at);
