import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API
app.use('/api/*', cors())

// Serve static files - Cloudflare Pages automatically serves files from dist/
app.use('/static/*', serveStatic({ root: './' }))

// ============================================
// LANDING PAGE
// ============================================
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="nl" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ EV Charge Pro - Premium Laadcalculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
      .gradient-text { background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .gradient-bg { background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%); }
      .apple-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08); }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
    <!-- Hero Section - Apple Style -->
    <section class="min-h-screen flex flex-col justify-center px-6 py-20">
        <div class="max-w-5xl mx-auto text-center">
            <div class="mb-12">
                <h1 class="text-6xl md:text-7xl font-semibold mb-6 tracking-tight text-gray-900" style="letter-spacing: -0.02em;">
                    Bereken je laadtijd.<br>
                    <span class="gradient-text">Simpel en snel.</span>
                </h1>
                <p class="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
                    De slimste manier om je EV laadtijd en kosten te berekenen.<br>
                    <span class="text-blue-600 font-medium">284+ voertuigen. Direct te gebruiken.</span>
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-20">
                    <a href="/app" class="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
                        Start nu
                    </a>
                </div>
            </div>

            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-6 mb-20">
                <div class="apple-card rounded-3xl p-8 border border-gray-200">
                    <i class="fas fa-search text-4xl text-blue-600 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Smart Search</h3>
                    <p class="text-gray-600 text-sm">Type en vind direct je voertuig</p>
                </div>
                <div class="apple-card rounded-3xl p-8 border border-gray-200">
                    <i class="fas fa-chart-line text-4xl text-purple-600 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Laadcurves</h3>
                    <p class="text-gray-600 text-sm">Real-world data per SOC</p>
                </div>
                <div class="apple-card rounded-3xl p-8 border border-gray-200">
                    <i class="fas fa-euro-sign text-4xl text-green-600 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Kosten Calculator</h3>
                    <p class="text-gray-600 text-sm">Bereken exact je laadkosten</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">284</div>
                    <div class="text-gray-500 text-sm">Voertuigen</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">39</div>
                    <div class="text-gray-500 text-sm">Merken</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">100%</div>
                    <div class="text-gray-500 text-sm">Gratis</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">2s</div>
                    <div class="text-gray-500 text-sm">Snel</div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>
  `)
})

// ============================================
// API ROUTES
// ============================================

// Get all vehicles (always return ALL vehicles, frontend will handle premium restrictions)
app.get('/api/vehicles', async (c) => {
  const { DB } = c.env
  const userTier = c.req.query('tier') || 'all'
  
  try {
    let query = `
      SELECT id, make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh,
             avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw,
             is_premium, charging_curve_data
      FROM vehicles
    `
    
    // Only filter if explicitly requesting free tier
    if (userTier === 'free') {
      query += ' WHERE is_premium = 0'
    }
    // Otherwise return ALL vehicles (tier='all' or tier='premium')
    
    query += ' ORDER BY make, model, variant'
    
    const { results } = await DB.prepare(query).all()
    
    return c.json({
      success: true,
      vehicles: results,
      total: results.length
    })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch vehicles' }, 500)
  }
})

// Get vehicle by ID
app.get('/api/vehicles/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const result = await DB.prepare(`
      SELECT * FROM vehicles WHERE id = ?
    `).bind(id).first()
    
    if (!result) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404)
    }
    
    return c.json({ success: true, vehicle: result })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch vehicle' }, 500)
  }
})

// Calculate charging speed
app.post('/api/calculate', async (c) => {
  const { DB } = c.env
  const { vehicleId, chargerPowerKw, startSoc = 20, endSoc = 80, electricityPrice = 0.30 } = await c.req.json()
  
  try {
    // Get vehicle data
    const vehicle = await DB.prepare(`
      SELECT * FROM vehicles WHERE id = ?
    `).bind(vehicleId).first()
    
    if (!vehicle) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404)
    }
    
    // Calculate charging speed in km/h
    const consumption = vehicle.avg_consumption_kwh_per_100km
    const effectiveChargerPower = Math.min(
      chargerPowerKw,
      vehicle.max_dc_charging_kw || chargerPowerKw
    )
    
    // Use middle SOC for curve calculation if charging curve available
    const middleSoc = (startSoc + endSoc) / 2
    let effectivePower = effectiveChargerPower
    
    if (vehicle.charging_curve_data) {
      try {
        const curveData = JSON.parse(vehicle.charging_curve_data)
        if (curveData.curve && Array.isArray(curveData.curve)) {
          // Find the appropriate power based on middle SOC
          for (let i = 0; i < curveData.curve.length - 1; i++) {
            const current = curveData.curve[i]
            const next = curveData.curve[i + 1]
            if (middleSoc >= current.soc && middleSoc < next.soc) {
              // Linear interpolation
              const socRange = next.soc - current.soc
              const powerRange = next.kw - current.kw
              const socOffset = middleSoc - current.soc
              const interpolatedPower = current.kw + (powerRange * socOffset / socRange)
              effectivePower = Math.min(effectiveChargerPower, interpolatedPower)
              break
            }
          }
        }
      } catch (e) {
        console.error('Error parsing charging curve:', e)
      }
    }
    
    // Calculate km/h: (kW / (kWh/100km)) * 100
    const chargingSpeedKmh = (effectivePower / consumption) * 100
    
    // Calculate time to charge from startSoc to endSoc
    const batteryCapacity = vehicle.usable_capacity_kwh
    const socDelta = (endSoc - startSoc) / 100
    const chargeAmount = batteryCapacity * socDelta
    const chargingTimeHours = chargeAmount / effectivePower
    const chargingTimeMinutes = Math.round(chargingTimeHours * 60)
    
    // Format charging time as "Xh Ym" or "Xm"
    const hours = Math.floor(chargingTimeMinutes / 60)
    const minutes = chargingTimeMinutes % 60
    const chargingTimeFormatted = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m`
    
    // Calculate range added per hour
    const rangePerHour = chargingSpeedKmh
    
    // Cost calculations
    const energyUsed = parseFloat(chargeAmount.toFixed(2))
    const totalCost = (energyUsed * electricityPrice).toFixed(2)
    const costPerHour = (effectivePower * electricityPrice).toFixed(2)
    const costPer100km = (consumption * electricityPrice).toFixed(2)
    
    const result = {
      success: true,
      calculation: {
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        chargerPowerKw: chargerPowerKw,
        effectivePowerKw: parseFloat(effectivePower.toFixed(1)),
        chargingSpeedKmh: Math.round(chargingSpeedKmh),
        consumption: consumption,
        batteryCapacity: batteryCapacity,
        chargingTime: chargingTimeFormatted,
        chargingTimeMinutes: chargingTimeMinutes,
        rangePerHour: Math.round(rangePerHour),
        startSoc: startSoc,
        endSoc: endSoc,
        energyUsed: energyUsed,
        totalCost: `€${totalCost}`,
        costPerHour: `€${costPerHour}/h`,
        costPer100km: `€${costPer100km}`,
        electricityPrice: electricityPrice
      }
    }
    
    return c.json(result)
  } catch (error) {
    console.error('Calculation error:', error)
    return c.json({ success: false, error: 'Calculation failed' }, 500)
  }
})

// Compare multiple vehicles
app.post('/api/compare', async (c) => {
  const { DB } = c.env
  const { vehicleIds, chargerPowerKw, startSoc = 20, endSoc = 80, electricityPrice = 0.30 } = await c.req.json()
  
  if (!Array.isArray(vehicleIds) || vehicleIds.length < 2) {
    return c.json({ success: false, error: 'At least 2 vehicles required for comparison' }, 400)
  }
  
  try {
    const placeholders = vehicleIds.map(() => '?').join(',')
    const query = `SELECT * FROM vehicles WHERE id IN (${placeholders})`
    
    const { results } = await DB.prepare(query).bind(...vehicleIds).all()
    
    const comparisons = results.map((vehicle: any) => {
      const consumption = vehicle.avg_consumption_kwh_per_100km
      const effectivePower = Math.min(
        chargerPowerKw,
        vehicle.max_dc_charging_kw || chargerPowerKw
      )
      const chargingSpeedKmh = (effectivePower / consumption) * 100
      
      // Calculate charging time based on SOC range
      const batteryCapacity = vehicle.usable_capacity_kwh
      const socDelta = (endSoc - startSoc) / 100
      const chargeAmount = batteryCapacity * socDelta
      const chargingTimeHours = chargeAmount / effectivePower
      const chargingTimeMinutes = Math.round(chargingTimeHours * 60)
      
      // Format charging time
      const hours = Math.floor(chargingTimeMinutes / 60)
      const minutes = chargingTimeMinutes % 60
      const chargingTimeFormatted = hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`
      
      // Calculate range added per hour
      const rangePerHour = chargingSpeedKmh
      
      // Cost calculations
      const energyUsed = parseFloat(chargeAmount.toFixed(2))
      const totalCost = (energyUsed * electricityPrice).toFixed(2)
      const costPer100km = (consumption * electricityPrice).toFixed(2)
      
      return {
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        chargingSpeedKmh: Math.round(chargingSpeedKmh),
        effectivePowerKw: parseFloat(effectivePower.toFixed(1)),
        consumption: consumption,
        batteryCapacity: batteryCapacity,
        chargingTime: chargingTimeFormatted,
        chargingTimeMinutes: chargingTimeMinutes,
        rangePerHour: Math.round(rangePerHour),
        energyUsed: energyUsed,
        totalCost: `€${totalCost}`,
        costPer100km: `€${costPer100km}`
      }
    })
    
    // Sort by charging speed descending
    comparisons.sort((a, b) => b.chargingSpeedKmh - a.chargingSpeedKmh)
    
    return c.json({
      success: true,
      comparisons,
      chargerPowerKw,
      startSoc,
      endSoc,
      electricityPrice
    })
  } catch (error) {
    return c.json({ success: false, error: 'Comparison failed' }, 500)
  }
})

// Get subscription tiers info
app.get('/api/subscription-tiers', (c) => {
  return c.json({
    success: true,
    tiers: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          '30+ popular EV models',
          'Basic charging calculator',
          'DC & AC charging support',
          'Real-world consumption data'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 4.99,
        period: 'month',
        features: [
          'All Free features',
          '110+ EV models (all brands)',
          'Charging curve analysis',
          'Vehicle comparison tool',
          'Calculation history',
          'Export to PDF'
        ],
        popular: true
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 49.99,
        period: 'year',
        features: [
          'All Premium features',
          'Priority vehicle requests',
          'Advanced analytics',
          'Fleet management',
          'API access',
          'White-label option'
        ]
      }
    ]
  })
})

// ============================================
// MAIN APP ROUTES
// ============================================
// Main calculator app
app.get('/app', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EV Charge Calculator - Apple-style Clean Experience</title>
    <meta name="description" content="Calculate your EV charging speed and range. Clean calculator with 284+ electric vehicles.">
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#667eea">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="EV Charge">
    <link rel="manifest" href="/manifest.json">
    
    <!-- App Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              tesla: {
                50: '#f5f5f5',
                100: '#e5e5e5',
                200: '#cccccc',
                300: '#b3b3b3',
                400: '#999999',
                500: '#808080',
                600: '#666666',
                700: '#4d4d4d',
                800: '#333333',
                900: '#1a1a1a',
                950: '#0d0d0d'
              }
            },
            fontFamily: {
              sans: ['Inter', 'system-ui', 'sans-serif']
            }
          }
        }
      }
    </script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: #f5f5f7 !important;
      }
      
      .tesla-gradient {
        background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      }
      
      .glass {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08);
      }
      
      .premium-badge {
        background: linear-gradient(135deg, #FF2D55 0%, #FF6B35 100%);
      }
      
      .animate-fade-in {
        animation: fadeIn 0.5s ease-in;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-slide-up {
        animation: slideUp 0.6s ease-out;
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .result-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .result-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      }
      
      .premium-blur {
        filter: blur(4px);
        pointer-events: none;
      }
      
      /* Apple iOS-style Range Sliders - Clean & Minimalist */
      input[type="range"] {
        -webkit-appearance: none !important;
        appearance: none !important;
        background: #E5E7EB !important;
        width: 100%;
        height: 6px !important;
        border-radius: 3px !important;
        cursor: pointer;
        outline: none !important;
      }
      
      input[type="range"]::-webkit-slider-track {
        background: transparent !important;
        height: 6px !important;
        border: none !important;
      }
      
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none !important;
        appearance: none !important;
        width: 28px !important;
        height: 28px !important;
        border-radius: 50% !important;
        background: #FFFFFF !important;
        cursor: grab !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15),
                    0 1px 2px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.15s ease !important;
      }
      
      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
                    0 1px 3px rgba(0, 0, 0, 0.12) !important;
      }
      
      input[type="range"]::-webkit-slider-thumb:active {
        cursor: grabbing !important;
        transform: scale(1.05) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
      }
      
      /* Firefox */
      input[type="range"]::-moz-range-track {
        background: #E5E7EB !important;
        height: 6px !important;
        border-radius: 3px !important;
      }
      
      input[type="range"]::-moz-range-thumb {
        width: 28px !important;
        height: 28px !important;
        border-radius: 50% !important;
        background: #FFFFFF !important;
        cursor: grab !important;
        border: none !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15),
                    0 1px 2px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.15s ease !important;
      }
      
      input[type="range"]::-moz-range-thumb:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
                    0 1px 3px rgba(0, 0, 0, 0.12) !important;
      }
      
      input[type="range"]::-moz-range-thumb:active {
        cursor: grabbing !important;
        transform: scale(1.05) !important;
      }
      
      /* Focus state */
      input[type="range"]:focus {
        outline: none !important;
      }
      
      input[type="range"]:focus::-webkit-slider-thumb {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
                    0 1px 3px rgba(0, 0, 0, 0.12),
                    0 0 0 4px rgba(59, 130, 246, 0.1) !important;
      }
      
      input[type="range"]:focus::-moz-range-thumb {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
                    0 1px 3px rgba(0, 0, 0, 0.12),
                    0 0 0 4px rgba(59, 130, 246, 0.1) !important;
      }
      
      .charging-curve {
        position: relative;
        height: 200px;
        background: rgba(15, 23, 42, 0.5);
        border-radius: 12px;
        padding: 20px;
      }
      
      /* Autocomplete dropdown styles */
      .autocomplete-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .autocomplete-item:last-child {
        border-bottom: none;
      }
      
      .autocomplete-item:hover,
      .autocomplete-item.active {
        background: rgba(100, 116, 139, 0.3);
      }
      
      .autocomplete-item.premium {
        background: rgba(167, 139, 250, 0.1);
      }
      
      .autocomplete-item.premium:hover {
        background: rgba(167, 139, 250, 0.2);
      }
      
      .autocomplete-item.locked {
        cursor: not-allowed;
        position: relative;
      }
      
      .autocomplete-item.locked:hover {
        background: rgba(234, 179, 8, 0.1);
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.3s ease-out forwards;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Custom scrollbar for autocomplete */
      #autocompleteDropdown::-webkit-scrollbar {
        width: 8px;
      }
      
      #autocompleteDropdown::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.5);
        border-radius: 0 12px 12px 0;
      }
      
      #autocompleteDropdown::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 4px;
      }
      
      #autocompleteDropdown::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
    <!-- Navigation - Apple Style -->
    <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-14">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-bolt text-2xl text-blue-600"></i>
                    <span class="text-lg font-semibold text-gray-900">EV Charge</span>
                </div>
                <div class="flex items-center space-x-3">
                    <button id="compareBtn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-colors">
                        <i class="fas fa-exchange-alt mr-2"></i>Compare
                    </button>
                    <button id="upgradeBtnNav" class="px-4 py-2 premium-badge text-white text-sm rounded-full hover:opacity-90 transition-opacity">
                        <i class="fas fa-crown mr-2"></i>Upgrade
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section - Apple Style -->
    <div class="pt-20 pb-8 px-6">
        <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-5xl font-semibold mb-4 text-gray-900" style="letter-spacing: -0.02em;">
                Bereken je laadsnelheid<br>
                <span class="tesla-gradient bg-clip-text text-transparent">in enkele seconden</span>
            </h1>
            <p class="text-lg text-gray-600 mb-8 font-light">
                Kies je voertuig en ontdek hoeveel km je per uur kunt laden
            </p>
            <div class="flex justify-center items-center space-x-6 text-sm text-gray-500">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    <span id="vehicleCount">284</span> Voertuigen
                </div>
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    Real-time data
                </div>
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    Laadcurves
                </div>
            </div>
        </div>
    </div>

    <!-- Calculator Section - Apple Style -->
    <div class="max-w-4xl mx-auto px-6 pb-12">
        <div class="glass rounded-3xl p-6 md:p-10 shadow-xl">
            <!-- Subscription Tier Indicator -->
            <div class="mb-8 flex justify-between items-center">
                <div>
                    <span class="text-sm text-gray-500">Huidig abonnement:</span>
                    <span id="currentTier" class="ml-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700">Gratis</span>
                </div>
                <button id="upgradeBtnCalc" class="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
                    <i class="fas fa-arrow-up mr-1"></i>Upgrade
                </button>
            </div>

            <!-- Vehicle Selection with Search -->
            <div class="mb-8">
                <label class="block text-sm font-semibold mb-3 text-gray-900">
                    <i class="fas fa-car mr-2 text-blue-600"></i>Kies je voertuig
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        id="vehicleSearch" 
                        placeholder="Zoek je voertuig (bijv. Tesla Model 3, Dacia Spring)" 
                        class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-4 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        autocomplete="off"
                    >
                    <i class="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    
                    <!-- Autocomplete Dropdown -->
                    <div id="autocompleteDropdown" class="hidden absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
                        <div id="autocompleteResults" class="py-2">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
                
                <!-- Selected Vehicle Display -->
                <div id="selectedVehicleDisplay" class="hidden mt-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-check-circle text-green-400"></i>
                            <div>
                                <div class="font-semibold" id="selectedVehicleName">-</div>
                                <div class="text-xs text-gray-400" id="selectedVehicleSpecs">-</div>
                            </div>
                        </div>
                        <button id="clearVehicleBtn" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div id="premiumVehicleNotice" class="hidden mt-2 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                    <i class="fas fa-crown text-yellow-400 mr-2"></i>
                    <span class="text-sm">Want access to premium vehicles? <button class="text-blue-400 hover:text-blue-300 font-medium">Upgrade now</button></span>
                </div>
            </div>

            <!-- Charger Power Input - Apple Style -->
            <div class="mb-6">
                <label class="block text-base font-semibold mb-3 flex items-center text-gray-900">
                    <i class="fas fa-charging-station text-blue-600 mr-2"></i>
                    <span>Laadvermogen</span>
                </label>
                <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div class="flex items-center space-x-4 mb-2">
                        <!-- Slider Container - Apple Style -->
                        <div class="flex-1 px-2 py-6">
                            <input type="range" id="chargerPowerRange" min="1" max="350" value="50" class="w-full">
                        </div>
                        <div class="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 py-4 min-w-[140px] shadow-md">
                            <input type="number" id="chargerPowerInput" value="50" min="1" max="350" 
                                   class="bg-transparent border-none outline-none text-white text-right w-full text-2xl font-bold">
                            <span class="text-white ml-2 text-lg font-semibold">kW</span>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-xs font-medium">
                        <span class="text-gray-500">
                            <i class="fas fa-plug mr-1"></i>Langzaam (7 kW)
                        </span>
                        <span class="text-blue-600">
                            <i class="fas fa-bolt mr-1"></i>Snel (50 kW)
                        </span>
                        <span class="text-purple-600">
                            <i class="fas fa-rocket mr-1"></i>Ultra (350 kW)
                        </span>
                    </div>
                </div>
            </div>

            <!-- SOC Range Slider (Premium Feature) -->
            <div id="socSlider" class="mb-8 hidden">
                <label class="block text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-battery-half text-green-400 mr-3 text-xl"></i>
                    <span>State of Charge Range</span>
                    <span class="ml-3 px-3 py-1 text-xs premium-badge rounded-full font-bold">PREMIUM</span>
                </label>
                <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <!-- Start SOC -->
                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm text-gray-400">Start SOC</span>
                            <div class="flex items-center bg-gradient-to-r from-orange-600 to-red-600 rounded-lg px-3 py-2 min-w-[90px] shadow-md">
                                <input type="number" id="startSocInput" value="20" min="0" max="100" 
                                       class="bg-transparent border-none outline-none text-white text-right w-full text-lg font-bold">
                                <span class="text-white ml-1 text-sm font-semibold">%</span>
                            </div>
                        </div>
                        <!-- Slider Container with Dark Background for White Track Visibility -->
                        <div class="px-2 py-6">
                            <input type="range" id="startSocRange" min="0" max="100" value="20" class="w-full">
                        </div>
                    </div>
                    
                    <!-- End SOC -->
                    <div>
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm text-gray-400">Target SOC</span>
                            <div class="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg px-3 py-2 min-w-[90px] shadow-md">
                                <input type="number" id="endSocInput" value="80" min="0" max="100" 
                                       class="bg-transparent border-none outline-none text-white text-right w-full text-lg font-bold">
                                <span class="text-white ml-1 text-sm font-semibold">%</span>
                            </div>
                        </div>
                        <!-- Slider Container with Dark Background for White Track Visibility -->
                        <div class="px-2 py-6">
                            <input type="range" id="endSocRange" min="0" max="100" value="80" class="w-full">
                        </div>
                    </div>
                    
                    <div class="mt-4 flex justify-between text-xs font-medium text-gray-400">
                        <span><i class="fas fa-battery-empty mr-1"></i>0%</span>
                        <span class="text-yellow-400"><i class="fas fa-info-circle mr-1"></i>Optimal: 20-80%</span>
                        <span><i class="fas fa-battery-full mr-1"></i>100%</span>
                    </div>
                </div>
            </div>

            <!-- Electricity Price Input -->
            <div class="mb-8">
                <label class="block text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-euro-sign text-yellow-400 mr-3 text-xl"></i>
                    <span>Electricity Price</span>
                </label>
                <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <div class="flex items-center space-x-4 mb-2">
                        <!-- Slider Container - Apple Style -->
                        <div class="flex-1 px-2 py-6">
                            <input type="range" id="electricityPriceRange" min="0.10" max="1.00" step="0.01" value="0.30" class="w-full">
                        </div>
                        <div class="flex items-center bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl px-5 py-4 min-w-[140px] shadow-lg">
                            <span class="text-white mr-1 text-lg font-semibold">€</span>
                            <input type="number" id="electricityPriceInput" value="0.30" min="0.10" max="1.00" step="0.01" 
                                   class="bg-transparent border-none outline-none text-white text-right w-full text-2xl font-bold">
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-sm font-medium">
                        <span class="text-gray-400">
                            <i class="fas fa-home mr-1"></i>Home (€0.10)
                        </span>
                        <span class="text-yellow-400">
                            <i class="fas fa-plug mr-1"></i>Average (€0.30)
                        </span>
                        <span class="text-orange-400">
                            <i class="fas fa-bolt mr-1"></i>Fast (€0.70)
                        </span>
                    </div>
                    <div class="mt-3 text-xs text-gray-500 text-center">
                        Price per kWh (incl. taxes & fees)
                    </div>
                </div>
            </div>

            <!-- Available Charging Time Input (NEW) -->
            <div class="mb-8">
                <label class="block text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-clock text-cyan-400 mr-3 text-xl"></i>
                    <span>Available Charging Time</span>
                    <span class="ml-3 text-xs text-gray-400">(Optional - for range calculation)</span>
                </label>
                <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <div class="flex items-center space-x-4 mb-2">
                        <!-- Slider Container - Apple Style -->
                        <div class="flex-1 px-2 py-6">
                            <input type="range" id="chargingTimeRange" min="5" max="120" step="5" value="30" class="w-full">
                        </div>
                        <div class="flex items-center bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl px-5 py-4 min-w-[140px] shadow-lg">
                            <input type="number" id="chargingTimeInput" value="30" min="5" max="120" step="5" 
                                   class="bg-transparent border-none outline-none text-white text-right w-full text-2xl font-bold">
                            <span class="text-white ml-2 text-lg font-semibold">min</span>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-sm font-medium">
                        <span class="text-gray-400">
                            <i class="fas fa-coffee mr-1"></i>Quick (5 min)
                        </span>
                        <span class="text-cyan-400">
                            <i class="fas fa-shopping-cart mr-1"></i>Shopping (30 min)
                        </span>
                        <span class="text-blue-400">
                            <i class="fas fa-utensils mr-1"></i>Lunch (120 min)
                        </span>
                    </div>
                    <div class="mt-3 text-xs text-gray-500 text-center">
                        How much time do you have for charging?
                    </div>
                </div>
            </div>

            <!-- Calculate Button -->
            <button id="calculateBtn" class="w-full tesla-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                <i class="fas fa-calculator mr-2"></i>Calculate Charging Speed & Range
            </button>
        </div>

        <!-- Results Section -->
        <div id="resultsSection" class="hidden mt-8 animate-fade-in">
            <div class="glass rounded-3xl p-8 md:p-12 result-card">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold mb-2">Charging Speed</h2>
                    <p class="text-gray-400" id="vehicleName">-</p>
                </div>

                <!-- Main Result -->
                <div class="text-center mb-12">
                    <div class="inline-block">
                        <div class="text-7xl md:text-8xl font-bold tesla-gradient bg-clip-text text-transparent mb-2" id="speedResult">
                            -
                        </div>
                        <div class="text-2xl text-gray-400">km/h</div>
                    </div>
                </div>

                <!-- Details Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-slate-800/50 rounded-xl p-6 text-center">
                        <i class="fas fa-bolt text-3xl text-yellow-400 mb-3"></i>
                        <div class="text-2xl font-bold" id="effectivePower">-</div>
                        <div class="text-sm text-gray-400 mt-1">Effective Power (kW)</div>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl p-6 text-center">
                        <i class="fas fa-clock text-3xl text-blue-400 mb-3"></i>
                        <div class="text-2xl font-bold" id="chargingTime">-</div>
                        <div class="text-sm text-gray-400 mt-1">Charging Time</div>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl p-6 text-center">
                        <i class="fas fa-road text-3xl text-green-400 mb-3"></i>
                        <div class="text-2xl font-bold" id="rangePerHour">-</div>
                        <div class="text-sm text-gray-400 mt-1">Range/Hour (km)</div>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl p-6 text-center">
                        <i class="fas fa-euro-sign text-3xl text-orange-400 mb-3"></i>
                        <div class="text-2xl font-bold" id="chargingCost">-</div>
                        <div class="text-sm text-gray-400 mt-1">Charging Cost</div>
                    </div>
                </div>
                
                <!-- NEW: Estimated Range with Available Time -->
                <div id="rangeEstimate" class="mb-8 p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl">
                    <div class="text-center">
                        <h3 class="text-xl font-semibold mb-4 flex items-center justify-center">
                            <i class="fas fa-route text-cyan-400 mr-2"></i>
                            Estimated Range with Available Time
                        </h3>
                        <div class="text-center mb-4">
                            <div class="inline-block">
                                <div class="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2" id="estimatedRange">
                                    -
                                </div>
                                <div class="text-2xl text-gray-400">kilometers</div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-400">
                            Based on <span class="text-cyan-400 font-semibold" id="displayChargingTime">-</span> minutes of charging
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-4">
                            <div class="bg-slate-800/50 rounded-xl p-4">
                                <div class="text-sm text-gray-400 mb-1">Energy Added</div>
                                <div class="text-xl font-bold text-cyan-400" id="energyAdded">-</div>
                            </div>
                            <div class="bg-slate-800/50 rounded-xl p-4">
                                <div class="text-sm text-gray-400 mb-1">Final SOC</div>
                                <div class="text-xl font-bold text-green-400" id="finalSOC">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Cost Details -->
                <div id="costDetails" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl">
                    <div class="text-center">
                        <div class="text-sm text-gray-400 mb-1">Energy Used</div>
                        <div class="text-xl font-bold" id="energyUsed">-</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm text-gray-400 mb-1">Cost per Hour</div>
                        <div class="text-xl font-bold" id="costPerHour">-</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm text-gray-400 mb-1">Cost per 100km</div>
                        <div class="text-xl font-bold" id="costPer100km">-</div>
                    </div>
                </div>

                <!-- Charging Curve (Premium) -->
                <div id="chargingCurve" class="hidden mb-8">
                    <h3 class="text-lg font-semibold mb-4 flex items-center">
                        <i class="fas fa-chart-line mr-2"></i>
                        Charging Curve Analysis
                        <span class="ml-2 px-2 py-1 text-xs premium-badge rounded-full">PREMIUM</span>
                    </h3>
                    <div class="charging-curve">
                        <canvas id="curveCanvas" width="600" height="160"></canvas>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-center">
                    <button id="compareFromResult" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all transform hover:scale-105 font-semibold text-lg">
                        <i class="fas fa-exchange-alt mr-2"></i>Compare Vehicles
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Compare Vehicles Modal -->
    <div id="compareModal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-3xl font-bold mb-2">Compare Vehicles</h2>
                    <p class="text-gray-400">Select vehicles to compare charging performance</p>
                </div>
                <button id="closeCompareModal" class="text-gray-400 hover:text-white text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Current Settings Display -->
            <div class="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-400">Charger:</span>
                        <span class="ml-2 font-bold" id="compareChargerPower">50 kW</span>
                    </div>
                    <div>
                        <span class="text-gray-400">SOC:</span>
                        <span class="ml-2 font-bold" id="compareSOCRange">20-80%</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Price:</span>
                        <span class="ml-2 font-bold" id="compareElectricityPrice">€0.30/kWh</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Selected:</span>
                        <span class="ml-2 font-bold text-blue-400" id="compareVehicleCount">0 vehicles</span>
                    </div>
                </div>
            </div>

            <!-- Vehicle Search for Comparison -->
            <div class="mb-6">
                <label class="block text-sm font-medium mb-3">
                    <i class="fas fa-search mr-2"></i>Search Vehicles to Compare (max 4)
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        id="compareVehicleSearch" 
                        placeholder="Type to search..." 
                        class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        autocomplete="off"
                    >
                    <i class="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    
                    <!-- Autocomplete Dropdown for Comparison -->
                    <div id="compareAutocompleteDropdown" class="hidden absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        <div id="compareAutocompleteResults" class="py-2">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Selected Vehicles for Comparison -->
            <div id="selectedCompareVehicles" class="mb-6">
                <h3 class="text-sm font-medium mb-3">Selected Vehicles:</h3>
                <div id="selectedCompareVehiclesList" class="space-y-2">
                    <div class="text-sm text-gray-400 text-center py-4">No vehicles selected yet</div>
                </div>
            </div>

            <!-- Compare Button -->
            <button id="startCompareBtn" disabled class="w-full tesla-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-exchange-alt mr-2"></i>Compare Selected Vehicles
            </button>
        </div>
    </div>

    <!-- Comparison Results Section -->
    <div id="comparisonResults" class="hidden max-w-6xl mx-auto px-4 pb-12 mt-8">
        <div class="glass rounded-3xl p-8 md:p-12">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold mb-2">Vehicle Comparison</h2>
                <p class="text-gray-400">Side-by-side charging performance analysis</p>
            </div>

            <!-- Comparison Table -->
            <div class="overflow-x-auto">
                <table class="w-full" id="comparisonTable">
                    <!-- Table will be populated by JavaScript -->
                </table>
            </div>

            <!-- Back Button -->
            <div class="mt-8 text-center">
                <button id="closeComparisonResults" class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Calculator
                </button>
            </div>
        </div>
    </div>

    <!-- Pricing Modal -->
    <div id="pricingModal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 animate-fade-in">
            <div class="flex justify-between items-start mb-8">
                <div>
                    <h2 class="text-3xl font-bold mb-2">Choose Your Plan</h2>
                    <p class="text-gray-400">Unlock premium features and get access to all vehicles</p>
                </div>
                <button id="closePricingModal" class="text-gray-400 hover:text-white text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div id="pricingTiers" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Pricing tiers will be loaded here -->
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="mt-20 py-12 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 text-center text-gray-400">
            <p class="mb-4">© 2024 EV Charge Calculator. Built with ⚡ for EV enthusiasts.</p>
            <div class="flex justify-center space-x-6">
                <a href="#" class="hover:text-white transition-colors">Privacy</a>
                <a href="#" class="hover:text-white transition-colors">Terms</a>
                <a href="#" class="hover:text-white transition-colors">Contact</a>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `)
})

export default app
