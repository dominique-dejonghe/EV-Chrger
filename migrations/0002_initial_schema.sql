-- Users table (for freemium accounts)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'premium', 'pro')),
  subscription_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

-- EV Vehicles database
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INTEGER,
  battery_capacity_kwh REAL NOT NULL,
  usable_capacity_kwh REAL NOT NULL,
  avg_consumption_kwh_per_100km REAL NOT NULL,
  max_dc_charging_kw REAL,
  max_ac_charging_kw REAL,
  charging_curve_data TEXT, -- JSON data for charging curve
  is_premium BOOLEAN DEFAULT 0,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User calculation history
CREATE TABLE IF NOT EXISTS calculation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  vehicle_id INTEGER NOT NULL,
  charger_power_kw REAL NOT NULL,
  charging_speed_kmh REAL NOT NULL,
  calculation_data TEXT, -- JSON with detailed results
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- User favorites
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, vehicle_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Vehicle comparison sessions
CREATE TABLE IF NOT EXISTS comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  vehicle_ids TEXT NOT NULL, -- JSON array of vehicle IDs
  comparison_data TEXT, -- JSON with comparison results
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_premium ON vehicles(is_premium);
CREATE INDEX IF NOT EXISTS idx_calculation_history_user ON calculation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_history_vehicle ON calculation_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_user ON comparisons(user_id);
