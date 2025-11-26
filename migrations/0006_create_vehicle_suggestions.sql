-- Create vehicle suggestions table for user-submitted vehicle requests
CREATE TABLE IF NOT EXISTS vehicle_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_email TEXT,
  vehicle_brand TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  battery_capacity REAL,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'added', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_vehicle_suggestions_status ON vehicle_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_suggestions_user_id ON vehicle_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_suggestions_created_at ON vehicle_suggestions(created_at DESC);
