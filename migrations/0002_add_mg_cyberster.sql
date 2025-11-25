-- Add MG Cyberster (Premium electric roadster)
INSERT INTO vehicles (make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium, charging_curve_data) 
VALUES ('MG', 'Cyberster', 'First Edition', 2024, 77, 74, 18.5, 150, 11, 1, '{"curve": [{"soc": 0, "kw": 150}, {"soc": 35, "kw": 150}, {"soc": 80, "kw": 70}, {"soc": 100, "kw": 22}]}');
