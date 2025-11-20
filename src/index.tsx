import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// LANDING PAGE
// ============================================
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="nl" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ EV Charge Pro - Premium Laadcalculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; }
      .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
    <!-- Hero Section -->
    <section class="min-h-screen flex flex-col justify-center px-4 py-20">
        <div class="max-w-6xl mx-auto text-center">
            <div class="mb-8">
                <i class="fas fa-bolt text-7xl gradient-text mb-6"></i>
                <h1 class="text-6xl md:text-8xl font-black mb-6">
                    EV Charge <span class="gradient-text">Pro</span>
                </h1>
                <p class="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto">
                    De meest geavanceerde EV laadcalculator.<br>
                    <span class="text-blue-400 font-semibold">284+ voertuigen • Gratis te gebruiken</span>
                </p>
                <div class="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                    <a href="/app" class="px-10 py-5 gradient-bg text-white rounded-xl text-xl font-bold hover:opacity-90 transition-all transform hover:scale-105 shadow-2xl">
                        <i class="fas fa-rocket mr-2"></i>Start Gratis
                    </a>
                </div>
            </div>

            <!-- Features Grid -->
            <div class="grid md:grid-cols-3 gap-6 mb-16">
                <div class="glass rounded-2xl p-8">
                    <i class="fas fa-search text-4xl gradient-text mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Smart Search</h3>
                    <p class="text-gray-400">Type en vind direct je voertuig</p>
                </div>
                <div class="glass rounded-2xl p-8">
                    <i class="fas fa-chart-line text-4xl gradient-text mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Charging Curves</h3>
                    <p class="text-gray-400">Real-world laadcurves per SOC</p>
                </div>
                <div class="glass rounded-2xl p-8">
                    <i class="fas fa-euro-sign text-4xl gradient-text mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Kosten Calculator</h3>
                    <p class="text-gray-400">Bereken exact je laadkosten</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div class="text-center">
                    <div class="text-5xl font-bold gradient-text mb-2">284</div>
                    <div class="text-gray-400 text-sm">EV Modellen<br><span class="text-xs">(73 gratis + 211 premium)</span></div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-bold gradient-text mb-2">39</div>
                    <div class="text-gray-400">Merken</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-bold gradient-text mb-2">100%</div>
                    <div class="text-gray-400">Gratis</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-bold gradient-text mb-2">2s</div>
                    <div class="text-gray-400">Snel</div>
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
  const { vehicleId, chargerPowerKw, soc } = await c.req.json()
  
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
    
    // Parse charging curve if available
    let effectivePower = effectiveChargerPower
    if (vehicle.charging_curve_data && soc !== undefined) {
      try {
        const curveData = JSON.parse(vehicle.charging_curve_data)
        if (curveData.curve && Array.isArray(curveData.curve)) {
          // Find the appropriate power based on SOC
          for (let i = 0; i < curveData.curve.length - 1; i++) {
            const current = curveData.curve[i]
            const next = curveData.curve[i + 1]
            if (soc >= current.soc && soc < next.soc) {
              // Linear interpolation
              const socRange = next.soc - current.soc
              const powerRange = next.kw - current.kw
              const socOffset = soc - current.soc
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
    
    // Calculate time to charge from 20% to 80% (typical fast charging session)
    const batteryCapacity = vehicle.usable_capacity_kwh
    const chargeAmount = batteryCapacity * 0.6 // 60% charge (20% to 80%)
    const chargingTimeHours = chargeAmount / effectivePower
    const chargingTimeMinutes = Math.round(chargingTimeHours * 60)
    
    // Calculate range added per hour
    const rangePerHour = chargingSpeedKmh
    
    const result = {
      success: true,
      calculation: {
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        chargerPowerKw: chargerPowerKw,
        effectivePowerKw: effectivePower,
        chargingSpeedKmh: Math.round(chargingSpeedKmh),
        consumption: consumption,
        batteryCapacity: batteryCapacity,
        chargingTime20to80: chargingTimeMinutes,
        rangePerHour: Math.round(rangePerHour),
        soc: soc
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
  const { vehicleIds, chargerPowerKw } = await c.req.json()
  
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
      
      return {
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        chargingSpeedKmh: Math.round(chargingSpeedKmh),
        effectivePowerKw: effectivePower,
        consumption: consumption,
        batteryCapacity: vehicle.usable_capacity_kwh
      }
    })
    
    // Sort by charging speed descending
    comparisons.sort((a, b) => b.chargingSpeedKmh - a.chargingSpeedKmh)
    
    return c.json({
      success: true,
      comparisons,
      chargerPowerKw
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
<html lang="nl" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EV Charge Calculator - Tesla-style Premium Experience</title>
    <meta name="description" content="Calculate your EV charging speed in km/h. Premium calculator with 110+ electric vehicles, charging curves, and real-world data.">
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
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .tesla-gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .glass {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .premium-badge {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
      
      /* Enhanced Range Slider Styling */
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        width: 100%;
        height: 40px;
        cursor: pointer;
      }
      
      input[type="range"]::-webkit-slider-track {
        background: linear-gradient(to right, 
          #1e293b 0%, 
          #334155 50%, 
          #475569 100%
        );
        height: 10px;
        border-radius: 6px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        cursor: grab;
        margin-top: -9px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5),
                    0 0 0 4px rgba(102, 126, 234, 0.2);
        transition: all 0.2s ease;
      }
      
      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.15);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.7),
                    0 0 0 6px rgba(102, 126, 234, 0.3);
      }
      
      input[type="range"]::-webkit-slider-thumb:active {
        cursor: grabbing;
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.6),
                    0 0 0 8px rgba(102, 126, 234, 0.2);
      }
      
      /* Firefox */
      input[type="range"]::-moz-range-track {
        background: linear-gradient(to right, 
          #1e293b 0%, 
          #334155 50%, 
          #475569 100%
        );
        height: 10px;
        border-radius: 6px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      input[type="range"]::-moz-range-thumb {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        cursor: grab;
        border: none;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5),
                    0 0 0 4px rgba(102, 126, 234, 0.2);
        transition: all 0.2s ease;
      }
      
      input[type="range"]::-moz-range-thumb:hover {
        transform: scale(1.15);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.7),
                    0 0 0 6px rgba(102, 126, 234, 0.3);
      }
      
      input[type="range"]::-moz-range-thumb:active {
        cursor: grabbing;
        transform: scale(1.05);
      }
      
      /* Focus state for accessibility */
      input[type="range"]:focus {
        outline: none;
      }
      
      input[type="range"]:focus::-webkit-slider-thumb {
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.8),
                    0 0 0 6px rgba(102, 126, 234, 0.4);
      }
      
      input[type="range"]:focus::-moz-range-thumb {
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.8),
                    0 0 0 6px rgba(102, 126, 234, 0.4);
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
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 glass">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-bolt text-3xl tesla-gradient bg-clip-text text-transparent"></i>
                    <span class="text-xl font-bold">EV Charge Calculator</span>
                </div>
                <div class="flex items-center space-x-4">
                    <button id="compareBtn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        <i class="fas fa-exchange-alt mr-2"></i>Compare
                    </button>
                    <button id="upgradeBtnNav" class="px-4 py-2 premium-badge text-white rounded-lg hover:opacity-90 transition-opacity">
                        <i class="fas fa-crown mr-2"></i>Upgrade
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="pt-24 pb-12 px-4">
        <div class="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Calculate Your <br>
                <span class="tesla-gradient bg-clip-text text-transparent">EV Charging Speed</span>
            </h1>
            <p class="text-xl text-gray-300 mb-8">
                Discover how fast your electric vehicle charges at any power station
            </p>
            <div class="flex justify-center items-center space-x-6 text-sm text-gray-400">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-400 mr-2"></i>
                    <span id="vehicleCount">110+</span> Vehicles
                </div>
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-400 mr-2"></i>
                    Real-world Data
                </div>
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-400 mr-2"></i>
                    Charging Curves
                </div>
            </div>
        </div>
    </div>

    <!-- Calculator Section -->
    <div class="max-w-4xl mx-auto px-4 pb-12">
        <div class="glass rounded-3xl p-8 md:p-12 animate-slide-up">
            <!-- Subscription Tier Indicator -->
            <div class="mb-8 flex justify-between items-center">
                <div>
                    <span class="text-sm text-gray-400">Current Plan:</span>
                    <span id="currentTier" class="ml-2 px-3 py-1 bg-slate-700 rounded-full text-sm font-medium">Free</span>
                </div>
                <button id="upgradeBtnCalc" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    <i class="fas fa-arrow-up mr-1"></i>Upgrade for more features
                </button>
            </div>

            <!-- Vehicle Selection with Search -->
            <div class="mb-8">
                <label class="block text-sm font-medium mb-3">
                    <i class="fas fa-car mr-2"></i>Search Your Vehicle
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        id="vehicleSearch" 
                        placeholder="Type to search... (e.g., Tesla Model 3, Dacia Spring)" 
                        class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        autocomplete="off"
                    >
                    <i class="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    
                    <!-- Autocomplete Dropdown -->
                    <div id="autocompleteDropdown" class="hidden absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
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

            <!-- Charger Power Input -->
            <div class="mb-8">
                <label class="block text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-charging-station text-blue-400 mr-3 text-xl"></i>
                    <span>Charger Power</span>
                </label>
                <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <div class="flex items-center space-x-4 mb-2">
                        <input type="range" id="chargerPowerRange" min="1" max="350" value="50" class="flex-1">
                        <div class="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-5 py-4 min-w-[140px] shadow-lg">
                            <input type="number" id="chargerPowerInput" value="50" min="1" max="350" 
                                   class="bg-transparent border-none outline-none text-white text-right w-full text-2xl font-bold">
                            <span class="text-white ml-2 text-lg font-semibold">kW</span>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-sm font-medium">
                        <span class="text-gray-400">
                            <i class="fas fa-plug mr-1"></i>Slow (7 kW)
                        </span>
                        <span class="text-blue-400">
                            <i class="fas fa-bolt mr-1"></i>Fast (50 kW)
                        </span>
                        <span class="text-purple-400">
                            <i class="fas fa-rocket mr-1"></i>Ultra (350 kW)
                        </span>
                    </div>
                </div>
            </div>

            <!-- SOC Slider (Premium Feature) -->
            <div id="socSlider" class="mb-8 hidden">
                <label class="block text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-battery-half text-green-400 mr-3 text-xl"></i>
                    <span>Battery State of Charge (SOC)</span>
                    <span class="ml-3 px-3 py-1 text-xs premium-badge rounded-full font-bold">PREMIUM</span>
                </label>
                <div class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <div class="flex items-center space-x-4">
                        <input type="range" id="socRange" min="0" max="100" value="50" class="flex-1">
                        <div class="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl px-5 py-4 min-w-[120px] shadow-lg">
                            <span id="socValue" class="text-white font-bold text-2xl">50</span>
                            <span class="text-white ml-2 text-lg font-semibold">%</span>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-sm font-medium text-gray-400">
                        <span><i class="fas fa-battery-empty mr-1"></i>Empty (0%)</span>
                        <span class="text-green-400"><i class="fas fa-battery-half mr-1"></i>Half (50%)</span>
                        <span><i class="fas fa-battery-full mr-1"></i>Full (100%)</span>
                    </div>
                </div>
            </div>

            <!-- Calculate Button -->
            <button id="calculateBtn" class="w-full tesla-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                <i class="fas fa-calculator mr-2"></i>Calculate Charging Speed
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
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-slate-800/50 rounded-xl p-6 text-center">
                        <i class="fas fa-bolt text-3xl text-yellow-400 mb-3"></i>
                        <div class="text-2xl font-bold" id="effectivePower">-</div>
                        <div class="text-sm text-gray-400 mt-1">Effective Power (kW)</div>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl p-6 text-center">
                        <i class="fas fa-clock text-3xl text-blue-400 mb-3"></i>
                        <div class="text-2xl font-bold" id="chargingTime">-</div>
                        <div class="text-sm text-gray-400 mt-1">Time 20-80% (min)</div>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl p-6 text-center">
                        <i class="fas fa-road text-3xl text-green-400 mb-3"></i>
                        <div class="text-2xl font-bold" id="rangePerHour">-</div>
                        <div class="text-sm text-gray-400 mt-1">Range/Hour (km)</div>
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
                <div class="flex flex-wrap gap-4 justify-center">
                    <button class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors">
                        <i class="fas fa-redo mr-2"></i>New Calculation
                    </button>
                    <button id="compareFromResult" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                        <i class="fas fa-exchange-alt mr-2"></i>Compare Vehicles
                    </button>
                    <button class="px-6 py-3 premium-badge hover:opacity-90 rounded-xl transition-opacity">
                        <i class="fas fa-file-pdf mr-2"></i>Export PDF
                    </button>
                </div>
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
