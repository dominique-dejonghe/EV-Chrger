-- Add missing vehicles: MG Cyberster and Dacia Spring

-- MG Cyberster (Premium - Sports car)
INSERT OR IGNORE INTO vehicles (make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium, charging_curve_data) VALUES
('MG', 'Cyberster', 'RWD', 2024, 77, 72, 18.5, 144, 11, 1, '{"curve": [{"soc": 0, "kw": 144}, {"soc": 38, "kw": 144}, {"soc": 80, "kw": 65}, {"soc": 100, "kw": 20}]}');

-- Dacia Spring (Free - Budget EV)
INSERT OR IGNORE INTO vehicles (make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium, charging_curve_data) VALUES
('Dacia', 'Spring', 'Electric 65', 2024, 26.8, 25, 14.5, 30, 7, 0, '{"curve": [{"soc": 0, "kw": 30}, {"soc": 50, "kw": 30}, {"soc": 80, "kw": 15}, {"soc": 100, "kw": 8}]}');
