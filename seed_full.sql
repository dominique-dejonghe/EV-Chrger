-- COMPREHENSIVE EV DATABASE - ALPHABETICALLY SORTED BY MAKE
-- Mix of FREE and PREMIUM vehicles with realistic 2024-2025 specifications

-- FREE TIER: Mainstream popular EVs (20 vehicles)
INSERT OR IGNORE INTO vehicles (make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium, charging_curve_data) VALUES

-- AUDI (Free)
('Audi', 'Q4 e-tron', '40', 2024, 82, 76.6, 19.3, 125, 11, 0, '{"curve": [{"soc": 0, "kw": 125}, {"soc": 38, "kw": 125}, {"soc": 80, "kw": 50}, {"soc": 100, "kw": 20}]}'),

-- BMW (Free)
('BMW', 'i4', 'eDrive40', 2024, 83.9, 80.7, 16.1, 205, 11, 0, '{"curve": [{"soc": 0, "kw": 205}, {"soc": 37, "kw": 205}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 25}]}'),
('BMW', 'iX1', 'xDrive30', 2024, 66.5, 64.8, 17.3, 130, 11, 0, '{"curve": [{"soc": 0, "kw": 130}, {"soc": 35, "kw": 130}, {"soc": 80, "kw": 60}, {"soc": 100, "kw": 18}]}'),

-- BYD (Free)
('BYD', 'Atto 3', 'Extended Range', 2024, 60.5, 60, 16.9, 88, 11, 0, '{"curve": [{"soc": 0, "kw": 88}, {"soc": 40, "kw": 88}, {"soc": 80, "kw": 40}, {"soc": 100, "kw": 15}]}'),
('BYD', 'Seal', 'Design', 2024, 82.5, 82, 17.5, 150, 11, 0, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 35, "kw": 150}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 20}]}'),

-- CITROEN (Free)
('Citroën', 'ë-C4', 'Electric', 2024, 50, 46, 16.3, 100, 11, 0, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 45}, {"soc": 100, "kw": 15}]}'),

-- CUPRA (Free)
('Cupra', 'Born', '58 kWh', 2024, 62, 58, 16.8, 135, 11, 0, '{"curve": [{"soc": 0, "kw": 135}, {"soc": 35, "kw": 135}, {"soc": 80, "kw": 55}, {"soc": 100, "kw": 18}]}'),

-- FIAT (Free)
('Fiat', '500e', '42 kWh', 2024, 42, 37.3, 14.9, 85, 11, 0, '{"curve": [{"soc": 0, "kw": 85}, {"soc": 38, "kw": 85}, {"soc": 80, "kw": 38}, {"soc": 100, "kw": 12}]}'),

-- FORD (Free)
('Ford', 'Mustang Mach-E', 'Standard Range', 2024, 70, 68, 19.5, 150, 11, 0, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 45, "kw": 150}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 22}]}'),

-- HYUNDAI (Free)
('Hyundai', 'Ioniq 5', 'Standard Range', 2024, 58, 54, 18.5, 220, 11, 0, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Hyundai', 'Kona Electric', '65 kWh', 2024, 65.4, 64.8, 16.5, 102, 11, 0, '{"curve": [{"soc": 0, "kw": 102}, {"soc": 40, "kw": 102}, {"soc": 80, "kw": 48}, {"soc": 100, "kw": 17}]}'),

-- KIA (Free)
('Kia', 'EV6', 'Standard Range', 2024, 58, 54, 18.2, 220, 11, 0, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Kia', 'Niro EV', '64.8 kWh', 2024, 64.8, 64.8, 16.2, 85, 11, 0, '{"curve": [{"soc": 0, "kw": 85}, {"soc": 42, "kw": 85}, {"soc": 80, "kw": 40}, {"soc": 100, "kw": 15}]}'),

-- MAZDA (Free)
('Mazda', 'MX-30', 'e-Skyactiv', 2024, 35.5, 35.5, 18.0, 50, 6.6, 0, '{"curve": [{"soc": 0, "kw": 50}, {"soc": 50, "kw": 50}, {"soc": 80, "kw": 25}, {"soc": 100, "kw": 10}]}'),

-- MG (Free)
('MG', 'MG4 Electric', '64 kWh', 2024, 64, 61.7, 17.3, 135, 11, 0, '{"curve": [{"soc": 0, "kw": 135}, {"soc": 38, "kw": 135}, {"soc": 80, "kw": 60}, {"soc": 100, "kw": 18}]}'),
('MG', 'ZS EV', 'Long Range', 2024, 72.6, 68.3, 19.8, 92, 11, 0, '{"curve": [{"soc": 0, "kw": 92}, {"soc": 40, "kw": 92}, {"soc": 80, "kw": 42}, {"soc": 100, "kw": 15}]}'),

-- NISSAN (Free)
('Nissan', 'Leaf', 'e+ 62 kWh', 2024, 62, 59, 18.9, 100, 7.4, 0, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 45}, {"soc": 100, "kw": 12}]}'),
('Nissan', 'Ariya', '63 kWh', 2024, 66, 63, 18.0, 130, 7.4, 0, '{"curve": [{"soc": 0, "kw": 130}, {"soc": 35, "kw": 130}, {"soc": 80, "kw": 60}, {"soc": 100, "kw": 20}]}'),

-- OPEL (Free)
('Opel', 'Corsa Electric', '50 kWh', 2024, 50, 46, 16.8, 100, 11, 0, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 45}, {"soc": 100, "kw": 15}]}'),

-- PEUGEOT (Free)
('Peugeot', 'e-208', 'GT', 2024, 50, 46, 17.5, 100, 11, 0, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 45}, {"soc": 100, "kw": 15}]}'),
('Peugeot', 'e-2008', 'GT', 2024, 50, 46, 18.2, 100, 11, 0, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 45}, {"soc": 100, "kw": 15}]}');

-- RENAULT (Free) - continuing from above
INSERT OR IGNORE INTO vehicles (make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium, charging_curve_data) VALUES
('Renault', 'Megane E-Tech', 'EV60', 2024, 60, 57, 16.2, 130, 7.4, 0, '{"curve": [{"soc": 0, "kw": 130}, {"soc": 45, "kw": 130}, {"soc": 80, "kw": 60}, {"soc": 100, "kw": 18}]}'),
('Renault', 'Zoe', 'R135 Z.E. 52', 2024, 52, 52, 17.2, 50, 22, 0, '{"curve": [{"soc": 0, "kw": 50}, {"soc": 50, "kw": 50}, {"soc": 80, "kw": 25}, {"soc": 100, "kw": 10}]}'),

-- SKODA (Free)
('Škoda', 'Enyaq iV', '60', 2024, 62, 58, 18.4, 120, 11, 0, '{"curve": [{"soc": 0, "kw": 120}, {"soc": 38, "kw": 120}, {"soc": 80, "kw": 55}, {"soc": 100, "kw": 18}]}'),

-- SMART (Free)
('Smart', '#1', 'Pro+', 2024, 66, 62, 16.7, 150, 22, 0, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 35, "kw": 150}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 20}]}'),

-- TESLA (Free - base models)
('Tesla', 'Model 3', 'Standard Range Plus', 2024, 60, 57.5, 14.5, 170, 11, 0, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 50, "kw": 170}, {"soc": 80, "kw": 80}, {"soc": 100, "kw": 20}]}'),
('Tesla', 'Model 3', 'Long Range', 2024, 82, 78.5, 15.2, 250, 11, 0, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 25}]}'),
('Tesla', 'Model Y', 'Standard Range', 2024, 60, 57.5, 16.9, 170, 11, 0, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 50, "kw": 170}, {"soc": 80, "kw": 80}, {"soc": 100, "kw": 20}]}'),

-- VOLKSWAGEN (Free)
('Volkswagen', 'ID.3', 'Pro', 2024, 62, 58, 16.8, 120, 11, 0, '{"curve": [{"soc": 0, "kw": 120}, {"soc": 35, "kw": 120}, {"soc": 80, "kw": 50}, {"soc": 100, "kw": 15}]}'),
('Volkswagen', 'ID.4', 'Pro', 2024, 77, 77, 18.5, 135, 11, 0, '{"curve": [{"soc": 0, "kw": 135}, {"soc": 38, "kw": 135}, {"soc": 80, "kw": 65}, {"soc": 100, "kw": 20}]}'),

-- VOLVO (Free)
('Volvo', 'EX30', 'Single Motor', 2024, 69, 64, 17.8, 153, 11, 0, '{"curve": [{"soc": 0, "kw": 153}, {"soc": 35, "kw": 153}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 22}]}');


-- PREMIUM TIER: Luxury, Performance & Extended Range EVs (50+ vehicles)
INSERT OR IGNORE INTO vehicles (make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium, charging_curve_data) VALUES

-- AUDI (Premium)
('Audi', 'Q4 e-tron', '50 Quattro', 2024, 82, 76.6, 20.9, 135, 11, 1, '{"curve": [{"soc": 0, "kw": 135}, {"soc": 38, "kw": 135}, {"soc": 80, "kw": 65}, {"soc": 100, "kw": 20}]}'),
('Audi', 'Q8 e-tron', '55 Quattro', 2024, 114, 106, 24.4, 170, 11, 1, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 40, "kw": 170}, {"soc": 80, "kw": 85}, {"soc": 100, "kw": 28}]}'),
('Audi', 'e-tron GT', 'Quattro', 2024, 93.4, 83.7, 22.1, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Audi', 'e-tron GT', 'RS', 2024, 93.4, 83.7, 23.7, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Audi', 'Q6 e-tron', 'Quattro', 2025, 100, 94.9, 19.8, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 35, "kw": 270}, {"soc": 80, "kw": 135}, {"soc": 100, "kw": 35}]}'),
('Audi', 'A6 e-tron', 'Performance', 2025, 100, 94.4, 17.5, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 35, "kw": 270}, {"soc": 80, "kw": 135}, {"soc": 100, "kw": 35}]}'),

-- BMW (Premium)
('BMW', 'i4', 'M50', 2024, 83.9, 80.7, 18.1, 205, 11, 1, '{"curve": [{"soc": 0, "kw": 205}, {"soc": 37, "kw": 205}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 25}]}'),
('BMW', 'iX', 'xDrive40', 2024, 76.6, 71, 21.4, 150, 11, 1, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 45, "kw": 150}, {"soc": 80, "kw": 75}, {"soc": 100, "kw": 25}]}'),
('BMW', 'iX', 'xDrive50', 2024, 111.5, 105.2, 21.4, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 50, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 35}]}'),
('BMW', 'iX', 'M60', 2024, 111.5, 105.2, 24.7, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 50, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 35}]}'),
('BMW', 'i7', 'xDrive60', 2024, 101.7, 101.7, 19.6, 195, 11, 1, '{"curve": [{"soc": 0, "kw": 195}, {"soc": 40, "kw": 195}, {"soc": 80, "kw": 95}, {"soc": 100, "kw": 30}]}'),
('BMW', 'i7', 'M70', 2024, 101.7, 101.7, 22.8, 195, 11, 1, '{"curve": [{"soc": 0, "kw": 195}, {"soc": 40, "kw": 195}, {"soc": 80, "kw": 95}, {"soc": 100, "kw": 30}]}'),
('BMW', 'i5', 'eDrive40', 2024, 84.3, 81.2, 16.9, 205, 11, 1, '{"curve": [{"soc": 0, "kw": 205}, {"soc": 37, "kw": 205}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 25}]}'),
('BMW', 'i5', 'M60 xDrive', 2024, 84.3, 81.2, 19.4, 205, 11, 1, '{"curve": [{"soc": 0, "kw": 205}, {"soc": 37, "kw": 205}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 25}]}'),

-- BYD (Premium)
('BYD', 'Tang', 'EV', 2024, 108.8, 108.8, 22.5, 126, 11, 1, '{"curve": [{"soc": 0, "kw": 126}, {"soc": 40, "kw": 126}, {"soc": 80, "kw": 60}, {"soc": 100, "kw": 20}]}'),
('BYD', 'Han', 'EV', 2024, 85.4, 85.4, 16.9, 120, 11, 1, '{"curve": [{"soc": 0, "kw": 120}, {"soc": 38, "kw": 120}, {"soc": 80, "kw": 55}, {"soc": 100, "kw": 18}]}'),

-- CADILLAC (Premium)
('Cadillac', 'Lyriq', 'RWD', 2024, 102, 102, 21.3, 190, 11, 1, '{"curve": [{"soc": 0, "kw": 190}, {"soc": 40, "kw": 190}, {"soc": 80, "kw": 95}, {"soc": 100, "kw": 30}]}'),

-- CHEVROLET (Premium)
('Chevrolet', 'Blazer EV', 'SS', 2024, 85, 85, 20.5, 190, 11, 1, '{"curve": [{"soc": 0, "kw": 190}, {"soc": 40, "kw": 190}, {"soc": 80, "kw": 95}, {"soc": 100, "kw": 30}]}'),

-- CUPRA (Premium)
('Cupra', 'Born', 'VZ 77 kWh', 2024, 82, 77, 17.9, 170, 11, 1, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 35, "kw": 170}, {"soc": 80, "kw": 80}, {"soc": 100, "kw": 22}]}'),
('Cupra', 'Tavascan', 'VZ', 2024, 82, 77, 19.5, 175, 11, 1, '{"curve": [{"soc": 0, "kw": 175}, {"soc": 35, "kw": 175}, {"soc": 80, "kw": 85}, {"soc": 100, "kw": 25}]}'),

-- FISKER (Premium)
('Fisker', 'Ocean', 'Extreme', 2024, 113, 106.5, 20.8, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 35}]}'),

-- FORD (Premium)
('Ford', 'Mustang Mach-E', 'Extended Range AWD', 2024, 98.7, 91, 20.5, 150, 11, 1, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 45, "kw": 150}, {"soc": 80, "kw": 75}, {"soc": 100, "kw": 25}]}'),
('Ford', 'Mustang Mach-E', 'GT', 2024, 98.7, 91, 22.5, 150, 11, 1, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 45, "kw": 150}, {"soc": 80, "kw": 75}, {"soc": 100, "kw": 25}]}'),
('Ford', 'F-150 Lightning', 'Extended Range', 2024, 131, 131, 30.5, 155, 11, 1, '{"curve": [{"soc": 0, "kw": 155}, {"soc": 45, "kw": 155}, {"soc": 80, "kw": 75}, {"soc": 100, "kw": 28}]}'),

-- GENESIS (Premium)
('Genesis', 'GV60', 'Performance AWD', 2024, 77.4, 72.6, 19.2, 235, 11, 1, '{"curve": [{"soc": 0, "kw": 235}, {"soc": 48, "kw": 235}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 25}]}'),
('Genesis', 'Electrified GV70', 'Sport AWD', 2024, 77.4, 72.6, 21.8, 240, 11, 1, '{"curve": [{"soc": 0, "kw": 240}, {"soc": 48, "kw": 240}, {"soc": 80, "kw": 110}, {"soc": 100, "kw": 28}]}'),
('Genesis', 'G80', 'Electrified', 2024, 87.2, 82.5, 19.8, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 45, "kw": 220}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 30}]}'),

-- GMC (Premium)
('GMC', 'Hummer EV', 'Edition 1', 2024, 212.7, 212.7, 49.0, 350, 11, 1, '{"curve": [{"soc": 0, "kw": 350}, {"soc": 30, "kw": 350}, {"soc": 80, "kw": 180}, {"soc": 100, "kw": 50}]}'),

-- HONDA (Premium)
('Honda', 'e:Ny1', 'Advance', 2024, 68.8, 61.9, 18.3, 78, 11, 1, '{"curve": [{"soc": 0, "kw": 78}, {"soc": 42, "kw": 78}, {"soc": 80, "kw": 38}, {"soc": 100, "kw": 15}]}'),

-- HYUNDAI (Premium)
('Hyundai', 'Ioniq 5', 'Long Range AWD', 2024, 77.4, 72.6, 19.5, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Hyundai', 'Ioniq 5', 'N', 2024, 77.4, 72.6, 21.8, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Hyundai', 'Ioniq 6', 'Long Range RWD', 2024, 77.4, 72.6, 14.3, 239, 11, 1, '{"curve": [{"soc": 0, "kw": 239}, {"soc": 48, "kw": 239}, {"soc": 80, "kw": 110}, {"soc": 100, "kw": 25}]}'),
('Hyundai', 'Ioniq 6', 'Long Range AWD', 2024, 77.4, 72.6, 16.9, 239, 11, 1, '{"curve": [{"soc": 0, "kw": 239}, {"soc": 48, "kw": 239}, {"soc": 80, "kw": 110}, {"soc": 100, "kw": 25}]}'),
('Hyundai', 'Ioniq 9', 'Long Range AWD', 2025, 110.3, 103, 22.5, 350, 11, 1, '{"curve": [{"soc": 0, "kw": 350}, {"soc": 35, "kw": 350}, {"soc": 80, "kw": 170}, {"soc": 100, "kw": 45}]}'),

-- JAGUAR (Premium)
('Jaguar', 'I-Pace', 'EV400', 2024, 90, 84.7, 24.2, 100, 11, 1, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 50}, {"soc": 100, "kw": 20}]}'),

-- KIA (Premium)
('Kia', 'EV6', 'Long Range AWD', 2024, 77.4, 72.6, 19.5, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Kia', 'EV6', 'GT', 2024, 77.4, 72.6, 20.8, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 50, "kw": 220}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 20}]}'),
('Kia', 'EV9', 'Long Range AWD', 2024, 99.8, 95, 23.8, 239, 11, 1, '{"curve": [{"soc": 0, "kw": 239}, {"soc": 45, "kw": 239}, {"soc": 80, "kw": 115}, {"soc": 100, "kw": 32}]}'),
('Kia', 'EV9', 'GT-Line', 2024, 99.8, 95, 25.2, 239, 11, 1, '{"curve": [{"soc": 0, "kw": 239}, {"soc": 45, "kw": 239}, {"soc": 80, "kw": 115}, {"soc": 100, "kw": 32}]}'),

-- LEXUS (Premium)
('Lexus', 'RZ', '450e', 2024, 71.4, 64, 18.2, 147, 11, 1, '{"curve": [{"soc": 0, "kw": 147}, {"soc": 42, "kw": 147}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 22}]}'),

-- LOTUS (Premium)
('Lotus', 'Eletre', 'S', 2024, 112, 109, 23.5, 350, 22, 1, '{"curve": [{"soc": 0, "kw": 350}, {"soc": 30, "kw": 350}, {"soc": 80, "kw": 180}, {"soc": 100, "kw": 50}]}'),
('Lotus', 'Eletre', 'R', 2024, 112, 109, 26.4, 350, 22, 1, '{"curve": [{"soc": 0, "kw": 350}, {"soc": 30, "kw": 350}, {"soc": 80, "kw": 180}, {"soc": 100, "kw": 50}]}'),

-- LUCID (Premium)
('Lucid', 'Air', 'Pure', 2024, 88, 84, 15.8, 300, 19.2, 1, '{"curve": [{"soc": 0, "kw": 300}, {"soc": 40, "kw": 300}, {"soc": 80, "kw": 180}, {"soc": 100, "kw": 50}]}'),
('Lucid', 'Air', 'Touring', 2024, 92, 88, 16.2, 300, 19.2, 1, '{"curve": [{"soc": 0, "kw": 300}, {"soc": 40, "kw": 300}, {"soc": 80, "kw": 180}, {"soc": 100, "kw": 50}]}'),
('Lucid', 'Air', 'Grand Touring', 2024, 118, 112, 18.5, 300, 19.2, 1, '{"curve": [{"soc": 0, "kw": 300}, {"soc": 40, "kw": 300}, {"soc": 80, "kw": 180}, {"soc": 100, "kw": 50}]}'),
('Lucid', 'Air', 'Sapphire', 2024, 118, 112, 20.5, 300, 19.2, 1, '{"curve": [{"soc": 0, "kw": 300}, {"soc": 40, "kw": 300}, {"soc": 80, "kw": 180}, {"soc": 100, "kw": 50}]}'),
('Lucid', 'Gravity', 'Grand Touring', 2025, 120, 112, 22.8, 350, 19.2, 1, '{"curve": [{"soc": 0, "kw": 350}, {"soc": 38, "kw": 350}, {"soc": 80, "kw": 200}, {"soc": 100, "kw": 55}]}'),

-- MASERATI (Premium)
('Maserati', 'Grecale', 'Folgore', 2024, 105, 100, 24.5, 150, 11, 1, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 45, "kw": 150}, {"soc": 80, "kw": 75}, {"soc": 100, "kw": 25}]}'),

-- MERCEDES-BENZ (Premium)
('Mercedes-Benz', 'EQA', '250+', 2024, 70.5, 66.5, 17.7, 100, 11, 1, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 50}, {"soc": 100, "kw": 18}]}'),
('Mercedes-Benz', 'EQB', '300 4MATIC', 2024, 70.5, 66.5, 19.8, 100, 11, 1, '{"curve": [{"soc": 0, "kw": 100}, {"soc": 40, "kw": 100}, {"soc": 80, "kw": 50}, {"soc": 100, "kw": 18}]}'),
('Mercedes-Benz', 'EQE', '300', 2024, 96, 90.6, 18.7, 170, 11, 1, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 50, "kw": 170}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 30}]}'),
('Mercedes-Benz', 'EQE', 'AMG 53 4MATIC+', 2024, 96, 90.6, 21.2, 170, 11, 1, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 50, "kw": 170}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 30}]}'),
('Mercedes-Benz', 'EQE SUV', '350 4MATIC', 2024, 96, 90.6, 21.8, 170, 11, 1, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 50, "kw": 170}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 30}]}'),
('Mercedes-Benz', 'EQS', '450+', 2024, 120, 107.8, 19.8, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 50, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 35}]}'),
('Mercedes-Benz', 'EQS', '580 4MATIC', 2024, 120, 107.8, 22.5, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 50, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 35}]}'),
('Mercedes-Benz', 'EQS SUV', '450 4MATIC', 2024, 120, 107.8, 24.8, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 50, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 35}]}'),
('Mercedes-Benz', 'EQS SUV', 'AMG 53 4MATIC+', 2024, 120, 107.8, 26.5, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 50, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 35}]}'),

-- NISSAN (Premium)
('Nissan', 'Ariya', 'e-4ORCE 87 kWh', 2024, 91, 87, 19.5, 130, 7.4, 1, '{"curve": [{"soc": 0, "kw": 130}, {"soc": 35, "kw": 130}, {"soc": 80, "kw": 60}, {"soc": 100, "kw": 20}]}'),

-- POLESTAR (Premium)
('Polestar', '2', 'Long Range Single Motor', 2024, 82, 78, 16.9, 205, 11, 1, '{"curve": [{"soc": 0, "kw": 205}, {"soc": 37, "kw": 205}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 25}]}'),
('Polestar', '2', 'Long Range Dual Motor', 2024, 82, 78, 18.5, 205, 11, 1, '{"curve": [{"soc": 0, "kw": 205}, {"soc": 37, "kw": 205}, {"soc": 80, "kw": 90}, {"soc": 100, "kw": 25}]}'),
('Polestar', '3', 'Long Range Dual Motor', 2024, 111, 107, 22.3, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 35}]}'),
('Polestar', '4', 'Long Range Dual Motor', 2024, 100, 94, 19.8, 200, 11, 1, '{"curve": [{"soc": 0, "kw": 200}, {"soc": 42, "kw": 200}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 30}]}'),

-- PORSCHE (Premium)
('Porsche', 'Taycan', '4S', 2024, 93.4, 83.7, 22.5, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Porsche', 'Taycan', 'Turbo', 2024, 93.4, 83.7, 24.1, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Porsche', 'Taycan', 'Turbo S', 2024, 93.4, 83.7, 24.8, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Porsche', 'Taycan', 'GTS', 2024, 93.4, 83.7, 23.5, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Porsche', 'Taycan', 'Cross Turismo 4S', 2024, 93.4, 83.7, 23.8, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 30, "kw": 270}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}'),
('Porsche', 'Macan', 'Electric 4', 2024, 100, 95, 21.5, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 35, "kw": 270}, {"soc": 80, "kw": 135}, {"soc": 100, "kw": 35}]}'),
('Porsche', 'Macan', 'Turbo Electric', 2024, 100, 95, 24.3, 270, 11, 1, '{"curve": [{"soc": 0, "kw": 270}, {"soc": 35, "kw": 270}, {"soc": 80, "kw": 135}, {"soc": 100, "kw": 35}]}'),

-- RIVIAN (Premium)
('Rivian', 'R1T', 'Dual Motor', 2024, 135, 135, 32.5, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 45, "kw": 220}, {"soc": 80, "kw": 110}, {"soc": 100, "kw": 35}]}'),
('Rivian', 'R1T', 'Quad Motor', 2024, 180, 180, 38.2, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 45, "kw": 220}, {"soc": 80, "kw": 110}, {"soc": 100, "kw": 40}]}'),
('Rivian', 'R1S', 'Dual Motor', 2024, 135, 135, 33.8, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 45, "kw": 220}, {"soc": 80, "kw": 110}, {"soc": 100, "kw": 35}]}'),

-- SKODA (Premium)
('Škoda', 'Enyaq iV', '80', 2024, 82, 77, 19.2, 135, 11, 1, '{"curve": [{"soc": 0, "kw": 135}, {"soc": 38, "kw": 135}, {"soc": 80, "kw": 65}, {"soc": 100, "kw": 20}]}'),
('Škoda', 'Enyaq Coupé iV', 'RS', 2024, 82, 77, 20.5, 135, 11, 1, '{"curve": [{"soc": 0, "kw": 135}, {"soc": 38, "kw": 135}, {"soc": 80, "kw": 65}, {"soc": 100, "kw": 20}]}'),

-- SUBARU (Premium)
('Subaru', 'Solterra', 'AWD', 2024, 71.4, 64, 18.9, 147, 11, 1, '{"curve": [{"soc": 0, "kw": 147}, {"soc": 42, "kw": 147}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 22}]}'),

-- TESLA (Premium)
('Tesla', 'Model 3', 'Performance', 2024, 82, 78.5, 16.8, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 25}]}'),
('Tesla', 'Model Y', 'Long Range', 2024, 82, 78.5, 17.2, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 25}]}'),
('Tesla', 'Model Y', 'Performance', 2024, 82, 78.5, 18.5, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 100}, {"soc": 100, "kw": 25}]}'),
('Tesla', 'Model S', 'Long Range', 2024, 100, 95, 17.5, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),
('Tesla', 'Model S', 'Plaid', 2024, 100, 95, 19.2, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),
('Tesla', 'Model X', 'Long Range', 2024, 100, 95, 20.5, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),
('Tesla', 'Model X', 'Plaid', 2024, 100, 95, 22.8, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),
('Tesla', 'Cybertruck', 'Dual Motor AWD', 2024, 123, 123, 28.5, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),
('Tesla', 'Cybertruck', 'Tri-Motor AWD', 2024, 123, 123, 32.8, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 30}]}'),

-- TOYOTA (Premium)
('Toyota', 'bZ4X', 'AWD', 2024, 71.4, 64, 18.7, 147, 11, 1, '{"curve": [{"soc": 0, "kw": 147}, {"soc": 42, "kw": 147}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 22}]}'),

-- VOLKSWAGEN (Premium)
('Volkswagen', 'ID.4', 'GTX', 2024, 82, 77, 20.8, 135, 11, 1, '{"curve": [{"soc": 0, "kw": 135}, {"soc": 38, "kw": 135}, {"soc": 80, "kw": 65}, {"soc": 100, "kw": 20}]}'),
('Volkswagen', 'ID.5', 'GTX', 2024, 82, 77, 20.9, 135, 11, 1, '{"curve": [{"soc": 0, "kw": 135}, {"soc": 38, "kw": 135}, {"soc": 80, "kw": 65}, {"soc": 100, "kw": 20}]}'),
('Volkswagen', 'ID.7', 'Pro', 2024, 82, 77, 16.3, 170, 11, 1, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 35, "kw": 170}, {"soc": 80, "kw": 80}, {"soc": 100, "kw": 22}]}'),
('Volkswagen', 'ID.Buzz', 'Pro', 2024, 82, 77, 21.8, 170, 11, 1, '{"curve": [{"soc": 0, "kw": 170}, {"soc": 35, "kw": 170}, {"soc": 80, "kw": 80}, {"soc": 100, "kw": 22}]}'),

-- VOLVO (Premium)
('Volvo', 'EX30', 'Twin Motor Performance', 2024, 69, 64, 19.2, 153, 11, 1, '{"curve": [{"soc": 0, "kw": 153}, {"soc": 35, "kw": 153}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 22}]}'),
('Volvo', 'EX40', 'Single Motor', 2024, 82, 78, 18.5, 150, 11, 1, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 40, "kw": 150}, {"soc": 80, "kw": 75}, {"soc": 100, "kw": 25}]}'),
('Volvo', 'EX40', 'Twin Motor', 2024, 82, 78, 20.3, 150, 11, 1, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 40, "kw": 150}, {"soc": 80, "kw": 75}, {"soc": 100, "kw": 25}]}'),
('Volvo', 'EX90', 'Twin Motor', 2024, 111, 107, 22.5, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 35}]}'),
('Volvo', 'EX90', 'Performance', 2024, 111, 107, 24.8, 250, 11, 1, '{"curve": [{"soc": 0, "kw": 250}, {"soc": 40, "kw": 250}, {"soc": 80, "kw": 120}, {"soc": 100, "kw": 35}]}'),
('Volvo', 'EM90', 'Single Motor', 2024, 116, 112, 20.5, 220, 11, 1, '{"curve": [{"soc": 0, "kw": 220}, {"soc": 42, "kw": 220}, {"soc": 80, "kw": 110}, {"soc": 100, "kw": 32}]}'),

-- XPENG (Premium)
('XPeng', 'P7', 'Long Range', 2024, 86.2, 80.9, 16.8, 120, 11, 1, '{"curve": [{"soc": 0, "kw": 120}, {"soc": 40, "kw": 120}, {"soc": 80, "kw": 60}, {"soc": 100, "kw": 20}]}'),
('XPeng', 'G9', 'Long Range AWD', 2024, 98, 93, 20.5, 300, 11, 1, '{"curve": [{"soc": 0, "kw": 300}, {"soc": 35, "kw": 300}, {"soc": 80, "kw": 150}, {"soc": 100, "kw": 40}]}');

-- Sample test users
INSERT OR IGNORE INTO users (email, name, subscription_tier) VALUES
('demo@evcharger.app', 'Demo User', 'free'),
('premium@evcharger.app', 'Premium User', 'premium'),
('pro@evcharger.app', 'Pro User', 'pro');
