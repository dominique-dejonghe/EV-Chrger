import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes

// Get all vehicles (free users see limited data)
app.get('/api/vehicles', async (c) => {
  const { DB } = c.env
  const tier = c.req.query('tier') || 'free'
  
  let query = 'SELECT id, make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh, avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw, is_premium FROM vehicles'
  
  if (tier === 'free') {
    query += ' WHERE is_premium = 0'
  }
  
  query += ' ORDER BY make, model'
  
  const { results } = await DB.prepare(query).all()
  return c.json(results)
})

// Get vehicle details (premium features locked for free users)
app.get('/api/vehicles/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const tier = c.req.query('tier') || 'free'
  
  const vehicle = await DB.prepare(
    'SELECT * FROM vehicles WHERE id = ?'
  ).bind(id).first()
  
  if (!vehicle) {
    return c.json({ error: 'Vehicle not found' }, 404)
  }
  
  // Hide charging curve data for free users on premium vehicles
  if (tier === 'free' && vehicle.is_premium) {
    return c.json({ 
      error: 'Premium vehicle',
      message: 'Upgrade to premium to access this vehicle'
    }, 403)
  }
  
  return c.json(vehicle)
})

// Calculate charging speed
app.post('/api/calculate', async (c) => {
  const { DB } = c.env
  const { vehicleId, chargerPowerKw, soc } = await c.req.json()
  
  const vehicle: any = await DB.prepare(
    'SELECT * FROM vehicles WHERE id = ?'
  ).bind(vehicleId).first()
  
  if (!vehicle) {
    return c.json({ error: 'Vehicle not found' }, 404)
  }
  
  // Basic calculation: kW / (kWh/100km) * 100 = km/h
  const baseChargingSpeed = (chargerPowerKw / vehicle.avg_consumption_kwh_per_100km) * 100
  
  // Apply charging curve if available
  let effectiveChargingSpeed = baseChargingSpeed
  let effectivePower = chargerPowerKw
  
  if (vehicle.charging_curve_data && soc !== undefined) {
    const curve = JSON.parse(vehicle.charging_curve_data).curve
    
    // Find the two closest SOC points
    const lowerPoint = curve.filter((p: any) => p.soc <= soc).pop()
    const upperPoint = curve.find((p: any) => p.soc >= soc)
    
    if (lowerPoint && upperPoint) {
      // Linear interpolation
      const socRange = upperPoint.soc - lowerPoint.soc
      const powerRange = upperPoint.kw - lowerPoint.kw
      const socProgress = (soc - lowerPoint.soc) / socRange
      const interpolatedMaxPower = lowerPoint.kw + (powerRange * socProgress)
      
      // Use the lower of charger power or vehicle's current max acceptance
      effectivePower = Math.min(chargerPowerKw, interpolatedMaxPower, vehicle.max_dc_charging_kw || 999)
      effectiveChargingSpeed = (effectivePower / vehicle.avg_consumption_kwh_per_100km) * 100
    }
  } else {
    // Apply max charging limits
    effectivePower = Math.min(chargerPowerKw, vehicle.max_dc_charging_kw || 999)
    effectiveChargingSpeed = (effectivePower / vehicle.avg_consumption_kwh_per_100km) * 100
  }
  
  // Calculate time to charge and range added
  const timeToFullHour = vehicle.usable_capacity_kwh / effectivePower
  const rangeAddedPerHour = effectiveChargingSpeed
  const rangeAddedPer15Min = effectiveChargingSpeed / 4
  const rangeAddedPer30Min = effectiveChargingSpeed / 2
  
  return c.json({
    vehicle: {
      make: vehicle.make,
      model: vehicle.model,
      variant: vehicle.variant
    },
    input: {
      chargerPowerKw,
      soc: soc || 0
    },
    results: {
      chargingSpeedKmh: Math.round(effectiveChargingSpeed * 10) / 10,
      effectivePowerKw: Math.round(effectivePower * 10) / 10,
      rangeAddedPer15Min: Math.round(rangeAddedPer15Min),
      rangeAddedPer30Min: Math.round(rangeAddedPer30Min),
      rangeAddedPerHour: Math.round(rangeAddedPerHour),
      timeToFullHour: Math.round(timeToFullHour * 10) / 10
    }
  })
})

// Compare vehicles (premium feature)
app.post('/api/compare', async (c) => {
  const { DB } = c.env
  const { vehicleIds, chargerPowerKw } = await c.req.json()
  const tier = c.req.query('tier') || 'free'
  
  if (tier === 'free' && vehicleIds.length > 2) {
    return c.json({ 
      error: 'Premium feature',
      message: 'Free users can compare up to 2 vehicles. Upgrade to premium for unlimited comparisons.'
    }, 403)
  }
  
  const comparisons = []
  
  for (const vehicleId of vehicleIds) {
    const vehicle: any = await DB.prepare(
      'SELECT * FROM vehicles WHERE id = ?'
    ).bind(vehicleId).first()
    
    if (vehicle) {
      const chargingSpeed = (chargerPowerKw / vehicle.avg_consumption_kwh_per_100km) * 100
      const effectivePower = Math.min(chargerPowerKw, vehicle.max_dc_charging_kw || 999)
      const effectiveSpeed = (effectivePower / vehicle.avg_consumption_kwh_per_100km) * 100
      
      comparisons.push({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        chargingSpeedKmh: Math.round(effectiveSpeed * 10) / 10,
        effectivePowerKw: Math.round(effectivePower * 10) / 10,
        batteryCapacity: vehicle.usable_capacity_kwh,
        maxDcCharging: vehicle.max_dc_charging_kw,
        isPremium: vehicle.is_premium
      })
    }
  }
  
  return c.json({ comparisons })
})

// Save calculation to history (premium feature)
app.post('/api/history', async (c) => {
  const { DB } = c.env
  const tier = c.req.query('tier') || 'free'
  
  if (tier === 'free') {
    return c.json({ 
      error: 'Premium feature',
      message: 'Upgrade to premium to save calculation history'
    }, 403)
  }
  
  const { userId, vehicleId, chargerPowerKw, chargingSpeedKmh, calculationData } = await c.req.json()
  
  await DB.prepare(
    'INSERT INTO calculation_history (user_id, vehicle_id, charger_power_kw, charging_speed_kmh, calculation_data) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId, vehicleId, chargerPowerKw, chargingSpeedKmh, JSON.stringify(calculationData)).run()
  
  return c.json({ success: true })
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="nl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EV Charger Pro - Laadsnelheid Calculator</title>
        <meta name="description" content="Bereken hoeveel kilometers per uur uw elektrische voertuig laadt aan elke laadpaal. Premium Tesla-achtige interface met geavanceerde functies.">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          body {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: #ffffff;
            min-height: 100vh;
          }
          
          .glass-card {
            background: rgba(30, 30, 30, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
          }
          
          .glass-card:hover {
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
            transform: translateY(-2px);
          }
          
          .premium-badge {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            font-weight: 600;
            padding: 14px 32px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
          }
          
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(59, 130, 246, 0.6);
          }
          
          .btn-premium {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
            font-weight: 700;
          }
          
          .btn-premium:hover {
            box-shadow: 0 6px 24px rgba(255, 215, 0, 0.6);
          }
          
          input, select {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 14px 16px;
            border-radius: 10px;
            width: 100%;
            transition: all 0.3s ease;
          }
          
          input:focus, select:focus {
            outline: none;
            border-color: #3b82f6;
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          option {
            background: #1a1a1a;
            color: white;
          }
          
          .result-card {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            padding: 24px;
            border-radius: 16px;
            margin: 12px 0;
            animation: slideIn 0.5s ease;
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .metric-value {
            font-size: 3rem;
            font-weight: 800;
            line-height: 1;
            background: linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .charging-curve {
            height: 200px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .locked-feature {
            filter: blur(4px);
            pointer-events: none;
            opacity: 0.5;
          }
          
          .feature-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
          }
          
          @media (max-width: 768px) {
            .feature-comparison {
              grid-template-columns: 1fr;
            }
          }
        </style>
    </head>
    <body>
        <!-- Header -->
        <header class="py-6 px-4 border-b border-white/10">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-charging-station text-blue-400 text-3xl"></i>
                    <h1 class="text-2xl font-bold">EV Charger Pro</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <button id="tierToggle" class="btn-premium">
                        <i class="fas fa-crown mr-2"></i>
                        Upgrade naar Premium
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 py-12">
            <!-- Hero Section -->
            <div class="text-center mb-16">
                <h2 class="text-5xl font-bold mb-4">
                    Bereken Uw <span class="text-blue-400">Laadsnelheid</span>
                </h2>
                <p class="text-xl text-gray-400 max-w-2xl mx-auto">
                    Ontdek hoeveel kilometers per uur uw elektrische voertuig laadt aan elke laadpaal. 
                    Geavanceerde berekeningen met real-world laadcurves.
                </p>
            </div>

            <!-- Calculator Section -->
            <div class="grid lg:grid-cols-2 gap-8 mb-12">
                <!-- Input Section -->
                <div class="glass-card p-8">
                    <h3 class="text-2xl font-bold mb-6 flex items-center">
                        <i class="fas fa-calculator text-blue-400 mr-3"></i>
                        Calculator
                    </h3>
                    
                    <div class="space-y-6">
                        <div>
                            <label class="block text-sm font-semibold mb-2 text-gray-300">
                                Selecteer Uw Voertuig
                            </label>
                            <select id="vehicleSelect" class="text-lg">
                                <option value="">Laden...</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold mb-2 text-gray-300">
                                Laadpaal Vermogen (kW)
                            </label>
                            <input 
                                type="number" 
                                id="chargerPower" 
                                value="50" 
                                min="1" 
                                max="350" 
                                step="0.5"
                                class="text-lg"
                                placeholder="50"
                            />
                            <div class="flex gap-2 mt-3">
                                <button class="px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10" onclick="setChargerPower(7.4)">7.4 kW</button>
                                <button class="px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10" onclick="setChargerPower(11)">11 kW</button>
                                <button class="px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10" onclick="setChargerPower(22)">22 kW</button>
                                <button class="px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10" onclick="setChargerPower(50)">50 kW</button>
                                <button class="px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10" onclick="setChargerPower(150)">150 kW</button>
                            </div>
                        </div>

                        <div id="socSection" class="hidden">
                            <label class="block text-sm font-semibold mb-2 text-gray-300 flex items-center">
                                State of Charge (%)
                                <span class="premium-badge ml-2">Premium</span>
                            </label>
                            <input 
                                type="range" 
                                id="socSlider" 
                                value="20" 
                                min="0" 
                                max="100" 
                                class="w-full"
                            />
                            <div class="flex justify-between text-sm text-gray-400 mt-1">
                                <span>0%</span>
                                <span id="socValue">20%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        <button onclick="calculate()" class="btn-primary w-full text-lg">
                            <i class="fas fa-bolt mr-2"></i>
                            Bereken Laadsnelheid
                        </button>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="glass-card p-8">
                    <h3 class="text-2xl font-bold mb-6 flex items-center">
                        <i class="fas fa-chart-line text-green-400 mr-3"></i>
                        Resultaten
                    </h3>
                    
                    <div id="results" class="space-y-6">
                        <div class="text-center py-12 text-gray-500">
                            <i class="fas fa-arrow-left text-4xl mb-4 opacity-30"></i>
                            <p>Selecteer een voertuig en vermogen om te starten</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Feature Comparison -->
            <div class="glass-card p-8 mb-12">
                <h3 class="text-3xl font-bold mb-8 text-center">
                    Kies Uw Plan
                </h3>
                
                <div class="feature-comparison">
                    <!-- Free Plan -->
                    <div class="glass-card p-6">
                        <div class="text-center mb-4">
                            <i class="fas fa-car text-gray-400 text-3xl mb-3"></i>
                            <h4 class="text-xl font-bold mb-2">Gratis</h4>
                            <p class="text-3xl font-bold">€0<span class="text-sm text-gray-400">/maand</span></p>
                        </div>
                        <ul class="space-y-3 text-sm">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>8 populaire voertuigen</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Basis laadsnelheid berekening</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Vergelijk tot 2 voertuigen</span>
                            </li>
                            <li class="flex items-start opacity-30">
                                <i class="fas fa-times text-gray-400 mr-2 mt-1"></i>
                                <span>Geen laadcurve data</span>
                            </li>
                            <li class="flex items-start opacity-30">
                                <i class="fas fa-times text-gray-400 mr-2 mt-1"></i>
                                <span>Geen geschiedenis</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Premium Plan -->
                    <div class="glass-card p-6 border-2 border-yellow-500">
                        <div class="premium-badge mx-auto mb-4 text-center">Meest Populair</div>
                        <div class="text-center mb-4">
                            <i class="fas fa-bolt text-yellow-400 text-3xl mb-3"></i>
                            <h4 class="text-xl font-bold mb-2">Premium</h4>
                            <p class="text-3xl font-bold">€4.99<span class="text-sm text-gray-400">/maand</span></p>
                        </div>
                        <ul class="space-y-3 text-sm">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Alle 15+ premium voertuigen</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Real-world laadcurve data</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Onbeperkte vergelijkingen</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Opslaan berekeningen</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Export naar CSV</span>
                            </li>
                        </ul>
                        <button class="btn-premium w-full mt-6">
                            <i class="fas fa-crown mr-2"></i>
                            Upgrade Nu
                        </button>
                    </div>

                    <!-- Pro Plan -->
                    <div class="glass-card p-6">
                        <div class="text-center mb-4">
                            <i class="fas fa-crown text-purple-400 text-3xl mb-3"></i>
                            <h4 class="text-xl font-bold mb-2">Pro</h4>
                            <p class="text-3xl font-bold">€9.99<span class="text-sm text-gray-400">/maand</span></p>
                        </div>
                        <ul class="space-y-3 text-sm">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Alles van Premium +</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>API toegang</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Bulk berekeningen</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Prioriteit support</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-2 mt-1"></i>
                                <span>Aangepaste voertuigen toevoegen</span>
                            </li>
                        </ul>
                        <button class="btn-primary w-full mt-6">
                            Upgrade naar Pro
                        </button>
                    </div>
                </div>
            </div>

            <!-- Features Section -->
            <div class="grid md:grid-cols-3 gap-6 mb-12">
                <div class="glass-card p-6 text-center">
                    <i class="fas fa-tachometer-alt text-blue-400 text-4xl mb-4"></i>
                    <h4 class="text-xl font-bold mb-2">Real-time Berekeningen</h4>
                    <p class="text-gray-400">Directe resultaten met nauwkeurige laadcurve data voor realistische schattingen</p>
                </div>
                <div class="glass-card p-6 text-center">
                    <i class="fas fa-database text-green-400 text-4xl mb-4"></i>
                    <h4 class="text-xl font-bold mb-2">Uitgebreide Database</h4>
                    <p class="text-gray-400">20+ elektrische voertuigen van alle grote merken met actuele specificaties</p>
                </div>
                <div class="glass-card p-6 text-center">
                    <i class="fas fa-mobile-alt text-purple-400 text-4xl mb-4"></i>
                    <h4 class="text-xl font-bold mb-2">Mobile-First Design</h4>
                    <p class="text-gray-400">Geoptimaliseerd voor gebruik onderweg bij elke laadpaal</p>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="border-t border-white/10 py-8 text-center text-gray-400">
            <p>&copy; 2024 EV Charger Pro. Gemaakt met <i class="fas fa-heart text-red-500"></i> voor EV-rijders.</p>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
