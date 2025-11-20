-- Seed data for EV vehicles (mix of free and premium)

-- FREE TIER VEHICLES (Popular mainstream EVs)
INSERT OR IGNORE INTO vehicles (make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium, charging_curve_data) VALUES
('Tesla', 'Model 3', 'Standard Range Plus', 2024, 60, 57.5, 14.5, 170, 11, 0, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 50, "kw": 170}, {"soc": 80, "kw": 80}, {"soc": 100, "kw": 20}]}'),
('Tesla', 'Model 3', 'Long Range', 2024, 82, 78.5, 15.2, 250, 11, 0, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 25}]}'),
('Volkswagen', 'ID.3', 'Pro', 2024, 62, 58, 16.8, 120, 11, 0, '{"curve": [{"soc": 0, "kw": 120}, {"soc": 35, "kw": 120}, {"soc": 80, "kw": 50}, {"soc": 100, "kw": 15}]}'),
('Hyundai', 'Ioniq 5', 'Standard Range', 2024, 58, 54, 18.5, 220, 11, 0, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Kia', 'EV6', 'Standard Range', 2024, 58, 54, 18.2, 220, 11, 0, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Nissan', 'Leaf', 'e+', 2024, 62, 59, 18.9, 100, 7.4, 0, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 45}, {"soc": 100, "kw": 12}]}'),
('Renault', 'Megane E-Tech', 'EV60', 2024, 60, 57, 16.2, 130, 7.4, 0, '{"curve": [{"soc": 0, "kw": 130}, {"soc": 45, "kw": 130}, {"soc": 80, "kw": 60}, {"soc": 100, "kw": 18}]}'),
('Peugeot', 'e-208', 'GT', 2024, 50, 46, 17.5, 100, 11, 0, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 45}, {"soc": 100, "kw": 15}]}');

-- PREMIUM TIER VEHICLES (Luxury and performance EVs)
INSERT OR IGNORE INTO vehicles (make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium, charging_curve_data) VALUES
('Tesla', 'Model S', 'Long Range', 2024, 100, 95, 17.5, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),
('Tesla', 'Model X', 'Long Range', 2024, 100, 95, 20.5, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),
('Tesla', 'Model S', 'Plaid', 2024, 100, 95, 19.2, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),
('Porsche', 'Taycan', '4S', 2024, 93.4, 83.7, 22.5, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Porsche', 'Taycan', 'Turbo S', 2024, 93.4, 83.7, 24.8, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Audi', 'e-tron GT', 'Quattro', 2024, 93.4, 83.7, 22.1, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Mercedes-Benz', 'EQS', '450+', 2024, 107.8, 102, 19.8, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 50, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 35}]}'),
('BMW', 'iX', 'xDrive50', 2024, 111.5, 105.2, 21.4, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 50, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 35}]}'),
('Lucid', 'Air', 'Dream Edition', 2024, 118, 112, 18.5, 300, 19.2, 1, '{"curve": [{"soc": 0, "kw": 300}, {"soc": 40, "kw": 300}, {"soc": 80, "kw": 180}, {"soc": 100, "kw": 50}]}'),
('Mercedes-Benz', 'EQE', 'AMG', 2024, 90.6, 85.5, 21.2, 170, 11, 1, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 50, "kw": 170}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 30}]}'),
('Hyundai', 'Ioniq 5', 'Long Range AWD', 2024, 77.4, 72.6, 19.5, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Kia', 'EV6', 'GT', 2024, 77.4, 72.6, 20.8, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Ford', 'Mustang Mach-E', 'GT', 2024, 98.7, 91, 22.5, 150, 11, 1, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 45, "kw": 150}, {"soc": 80, "kw": 75}, {"soc": 100, "kw": 25}]}'),
('Jaguar', 'I-Pace', 'EV400', 2024, 90, 84.7, 24.2, 100, 11, 1, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 50}, {"soc": 100, "kw": 20}]}');

-- Sample test user (for testing)
INSERT OR IGNORE INTO users (email, name, subscription_tier) VALUES
('demo@evcharger.app', 'Demo User', 'free'),
('premium@evcharger.app', 'Premium User', 'premium');
