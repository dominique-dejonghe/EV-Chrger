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
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ EV Charge Pro - Premium Charging Calculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
      .gradient-text { background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .gradient-bg { background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%); }
      .apple-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08); }
      
      /* Tesla Supercharger Background - More Prominent & Visual */
      .hero-with-bg {
        background: 
          linear-gradient(to bottom, rgba(249, 250, 251, 0.85) 0%, rgba(249, 250, 251, 0.90) 50%, rgba(249, 250, 251, 0.95) 100%),
          url('https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=2000&q=90') center/cover;
        background-attachment: fixed;
      }
      
      /* Typewriter Effect Animation - Infinite Loop */
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes blink {
        0%, 100% { border-color: transparent; }
        50% { border-color: #007AFF; }
      }
      
      @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      .typewriter-container {
        display: inline-block;
      }
      
      .typewriter-line {
        overflow: hidden;
        border-right: 3px solid transparent;
        white-space: nowrap;
        margin: 0 auto;
        width: 0;
        opacity: 0;
      }
      
      .typewriter-line.typing {
        border-right: 3px solid #007AFF;
      }
      
      .typewriter-line.line1.animate {
        opacity: 1;
        animation: 
          typewriter 2s steps(25, end) forwards,
          blink 0.75s step-end infinite;
      }
      
      .typewriter-line.line2.animate {
        opacity: 1;
        animation: 
          typewriter 1.8s steps(20, end) forwards,
          blink 0.75s step-end infinite;
      }
      
      .typewriter-line.fade {
        animation: fadeOut 0.5s forwards;
      }
      
      /* EV Brand Logo Carousel - Infinite Scroll Animation */
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      
      .logo-carousel {
        display: flex;
        overflow: hidden;
        user-select: none;
        gap: 4rem;
        mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
      }
      
      .logo-track {
        display: flex;
        gap: 4rem;
        animation: scroll 40s linear infinite;
      }
      
      .logo-track:hover {
        animation-play-state: paused;
      }
      
      .brand-logo {
        height: 48px;
        width: auto;
        filter: grayscale(100%) opacity(50%);
        transition: all 0.3s ease;
        flex-shrink: 0;
      }
      
      .brand-logo:hover {
        filter: grayscale(0%) opacity(100%);
        transform: scale(1.1);
      }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
    <!-- EV Brand Carousel Section - Top Banner -->
    <section class="py-8 bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6">
            <h2 class="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                Supported Brands
            </h2>
            <div class="logo-carousel">
                <div class="logo-track">
                    <!-- First set of logos -->
                    <img src="https://cdn.simpleicons.org/tesla/000000" alt="Tesla" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/volkswagen/001E50" alt="Volkswagen" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/bmw/0066B1" alt="BMW" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/audi/BB0A30" alt="Audi" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/mercedesbenz/242424" alt="Mercedes-Benz" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/hyundai/002C5F" alt="Hyundai" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/kia/05141F" alt="Kia" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/nissan/C3002F" alt="Nissan" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/renault/FFCC00" alt="Renault" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/peugeot/000000" alt="Peugeot" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/ford/00274D" alt="Ford" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/volvo/000000" alt="Volvo" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/porsche/000000" alt="Porsche" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/opel/F7D507" alt="Opel" class="brand-logo" />
                    <!-- Duplicate set for seamless loop -->
                    <img src="https://cdn.simpleicons.org/tesla/000000" alt="Tesla" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/volkswagen/001E50" alt="Volkswagen" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/bmw/0066B1" alt="BMW" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/audi/BB0A30" alt="Audi" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/mercedesbenz/242424" alt="Mercedes-Benz" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/hyundai/002C5F" alt="Hyundai" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/kia/05141F" alt="Kia" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/nissan/C3002F" alt="Nissan" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/renault/FFCC00" alt="Renault" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/peugeot/000000" alt="Peugeot" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/ford/00274D" alt="Ford" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/volvo/000000" alt="Volvo" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/porsche/000000" alt="Porsche" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/opel/F7D507" alt="Opel" class="brand-logo" />
                </div>
            </div>
        </div>
    </section>
    
    <!-- Hero Section - Apple Style with Tesla Supercharger Background -->
    <section class="min-h-screen flex flex-col justify-center px-6 py-20 hero-with-bg">
        <div class="max-w-5xl mx-auto text-center">
            <div class="mb-12">
                <h1 class="text-6xl md:text-7xl font-semibold mb-6 tracking-tight text-gray-900" style="letter-spacing: -0.02em;">
                    <div class="typewriter-container">
                        <div class="typewriter-line line1" id="typewriter1">Calculate charging time.</div>
                    </div>
                    <br>
                    <span class="gradient-text typewriter-line line2" id="typewriter2">Simple and fast.</span>
                </h1>
                <script>
                    // Rotating phrases for typewriter
                    const phrases = [
                        { line1: 'Calculate charging time.', line2: 'Simple and fast.' },
                        { line1: 'Plan your EV journey.', line2: 'Smart and reliable.' },
                        { line1: 'Compare 129 vehicles.', line2: 'Find your perfect match.' },
                        { line1: 'Optimize charging costs.', line2: 'Save time and money.' }
                    ];
                    let currentPhraseIndex = 0;
                    
                    // Infinite Typewriter Loop with rotating text
                    function typewriterLoop() {
                        const line1 = document.getElementById('typewriter1');
                        const line2 = document.getElementById('typewriter2');
                        
                        // Get current phrase
                        const currentPhrase = phrases[currentPhraseIndex];
                        
                        // Update text content
                        line1.textContent = currentPhrase.line1;
                        line2.textContent = currentPhrase.line2;
                        
                        // Reset both lines
                        line1.className = 'typewriter-line line1';
                        line2.className = 'gradient-text typewriter-line line2';
                        line1.style.width = '0';
                        line2.style.width = '0';
                        
                        // Start Line 1 typing
                        setTimeout(() => {
                            line1.classList.add('animate', 'typing');
                        }, 100);
                        
                        // Remove cursor from Line 1, start Line 2
                        setTimeout(() => {
                            line1.classList.remove('typing');
                            line2.classList.add('animate', 'typing');
                        }, 2200);
                        
                        // Remove cursor from Line 2
                        setTimeout(() => {
                            line2.classList.remove('typing');
                        }, 4100);
                        
                        // Fade out both lines
                        setTimeout(() => {
                            line1.classList.add('fade');
                            line2.classList.add('fade');
                        }, 6000);
                        
                        // Move to next phrase and loop again
                        setTimeout(() => {
                            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                            typewriterLoop();
                        }, 6600);
                    }
                    
                    // Start the loop
                    typewriterLoop();
                </script>
                <p class="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
                    The smartest way to calculate your EV charging time and costs.<br>
                    <span class="text-blue-600 font-medium">129 vehicles. Ready to use.</span>
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-20">
                    <a href="/app" class="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
                        Start now
                    </a>
                </div>
            </div>

            <!-- Features Grid -->
            <div class="grid md:grid-cols-2 gap-6 mb-20 max-w-2xl mx-auto">
                <div class="apple-card rounded-3xl p-8 border border-gray-200">
                    <i class="fas fa-search text-4xl text-blue-600 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Smart Search</h3>
                    <p class="text-gray-600 text-sm">Type and find your vehicle instantly</p>
                </div>
                <div class="apple-card rounded-3xl p-8 border border-gray-200">
                    <i class="fas fa-euro-sign text-4xl text-green-600 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Cost Calculator</h3>
                    <p class="text-gray-600 text-sm">Calculate your exact charging costs</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">129</div>
                    <div class="text-gray-500 text-sm">Vehicles</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">39</div>
                    <div class="text-gray-500 text-sm">Brands</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">100%</div>
                    <div class="text-gray-500 text-sm">Free</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">2s</div>
                    <div class="text-gray-500 text-sm">Fast</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer - Pensato Branding -->
    <footer class="mt-12 py-8 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-4">
                <div class="flex items-center justify-center mb-2">
                    <i class="fas fa-brain text-2xl text-blue-600 mr-2"></i>
                    <h3 class="text-2xl font-bold text-gray-900">Pensato</h3>
                </div>
                <p class="text-sm text-gray-600 mb-3">AI-Powered Solutions</p>
                <div class="flex items-center justify-center space-x-2 text-xs text-gray-600">
                    <span>Made in Belgium with</span>
                    <span class="text-lg" style="color: #000000;">🖤</span>
                    <span class="text-lg" style="color: #FFD700;">💛</span>
                    <span class="text-lg" style="color: #EF3340;">❤️</span>
                </div>
            </div>
            <div class="flex justify-center space-x-6 text-xs">
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Privacy</a>
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Terms</a>
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </div>
        </div>
    </footer>
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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EV Charge Calculator - Apple-style Clean Experience</title>
    <meta name="description" content="Calculate your EV charging speed and range. Clean calculator with 129 electric vehicles.">
    
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
        transition: all 0.2s;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .autocomplete-item:last-child {
        border-bottom: none;
      }
      
      .autocomplete-item:hover,
      .autocomplete-item.active {
        background: #f3f4f6;
      }
      
      .autocomplete-item.premium {
        background: rgba(59, 130, 246, 0.05);
      }
      
      .autocomplete-item.premium:hover {
        background: rgba(59, 130, 246, 0.1);
      }
      
      .autocomplete-item.locked {
        cursor: not-allowed;
        position: relative;
      }
      
      .autocomplete-item.locked:hover {
        background: rgba(234, 179, 8, 0.05);
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
                Calculate your charging speed<br>
                <span class="tesla-gradient bg-clip-text text-transparent">in seconds</span>
            </h1>
            <p class="text-lg text-gray-600 mb-8 font-light">
                Choose your vehicle and discover how many km you can charge per hour
            </p>
            <div class="flex justify-center items-center space-x-6 text-sm text-gray-500">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    <span id="vehicleCount">129</span> Vehicles
                </div>
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    Real-time data
                </div>
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    Fast calculations
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
                    <span class="text-sm text-gray-500">Current subscription:</span>
                    <span id="currentTier" class="ml-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700">Free</span>
                </div>
                <button id="upgradeBtnCalc" class="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
                    <i class="fas fa-arrow-up mr-1"></i>Upgrade
                </button>
            </div>

            <!-- Vehicle Selection with Search -->
            <div class="mb-8">
                <label class="block text-sm font-semibold mb-3 text-gray-900">
                    <i class="fas fa-car mr-2 text-blue-600"></i>Choose your vehicle
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        id="vehicleSearch" 
                        placeholder="Search your vehicle (e.g. Tesla Model 3, Dacia Spring)" 
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
                        <button id="clearVehicleBtn" class="text-gray-500 hover:text-gray-700 transition-colors">
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
                    <span>Charging Power</span>
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
                            <i class="fas fa-plug mr-1"></i>Slow (7 kW)
                        </span>
                        <span class="text-blue-600">
                            <i class="fas fa-bolt mr-1"></i>Fast (50 kW)
                        </span>
                        <span class="text-purple-600">
                            <i class="fas fa-rocket mr-1"></i>Ultra (350 kW)
                        </span>
                    </div>
                </div>
            </div>

            <!-- Available Charging Time Input - Apple Style -->
            <div class="mb-6">
                <label class="block text-base font-semibold mb-3 flex items-center text-gray-900">
                    <i class="fas fa-clock text-cyan-600 mr-2"></i>
                    <span>Available charging time</span>
                    <span class="ml-3 text-xs text-gray-400 font-normal">(Optional - for range calculation)</span>
                </label>
                <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div class="flex items-center space-x-4 mb-2">
                        <!-- Slider Container - Apple Style -->
                        <div class="flex-1 px-2 py-6">
                            <input type="range" id="chargingTimeRange" min="5" max="120" step="5" value="30" class="w-full">
                        </div>
                        <div class="flex items-center bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl px-5 py-4 min-w-[140px] shadow-md">
                            <input type="number" id="chargingTimeInput" value="30" min="5" max="120" step="5" 
                                   class="bg-transparent border-none outline-none text-white text-right w-full text-2xl font-bold">
                            <span class="text-white ml-2 text-lg font-semibold">min</span>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-xs font-medium">
                        <span class="text-gray-500">
                            <i class="fas fa-coffee mr-1"></i>Quick (5 min)
                        </span>
                        <span class="text-cyan-600">
                            <i class="fas fa-shopping-cart mr-1"></i>Shopping (30 min)
                        </span>
                        <span class="text-blue-600">
                            <i class="fas fa-utensils mr-1"></i>Lunch (120 min)
                        </span>
                    </div>
                    <div class="mt-3 text-xs text-gray-400 text-center">
                        How much time do you have to charge?
                    </div>
                </div>
            </div>

            <!-- Electricity Price Input - Apple Style -->
            <div class="mb-6">
                <label class="block text-base font-semibold mb-3 flex items-center text-gray-900">
                    <i class="fas fa-euro-sign text-yellow-600 mr-2"></i>
                    <span>Electricity Price</span>
                </label>
                <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
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
                    <div class="mt-4 flex justify-between text-xs font-medium">
                        <span class="text-gray-500">
                            <i class="fas fa-home mr-1"></i>Home (€0.10)
                        </span>
                        <span class="text-yellow-600">
                            <i class="fas fa-plug mr-1"></i>Average (€0.30)
                        </span>
                        <span class="text-orange-600">
                            <i class="fas fa-bolt mr-1"></i>Fast (€0.70)
                        </span>
                    </div>
                    <div class="mt-3 text-xs text-gray-400 text-center">
                        Price per kWh (incl. VAT and costs)
                    </div>
                </div>
            </div>

            <!-- Calculate Button -->
            <button id="calculateBtn" class="w-full tesla-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                <i class="fas fa-calculator mr-2"></i>Calculate Charging Speed & Range
            </button>
        </div>

        <!-- Results Section - Apple Style -->
        <div id="resultsSection" class="hidden mt-8 animate-fade-in">
            <div class="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-semibold mb-2 text-gray-900">Charging Speed</h2>
                    <p class="text-gray-600 text-lg" id="vehicleName">-</p>
                </div>

                <!-- Main Result -->
                <div class="text-center mb-12">
                    <div class="inline-block">
                        <div class="text-7xl md:text-8xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2" id="speedResult">
                            -
                        </div>
                        <div class="text-2xl text-gray-600 font-medium">km/h</div>
                    </div>
                </div>

                <!-- Details Grid - Apple Style Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
                        <i class="fas fa-bolt text-3xl text-yellow-600 mb-3"></i>
                        <div class="text-2xl font-semibold text-gray-900" id="effectivePower">-</div>
                        <div class="text-sm text-gray-600 mt-1">Effective Power (kW)</div>
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
                        <i class="fas fa-clock text-3xl text-blue-600 mb-3"></i>
                        <div class="text-2xl font-semibold text-gray-900" id="chargingTime">-</div>
                        <div class="text-sm text-gray-600 mt-1">Charging Time</div>
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
                        <i class="fas fa-road text-3xl text-green-600 mb-3"></i>
                        <div class="text-2xl font-semibold text-gray-900" id="rangePerHour">-</div>
                        <div class="text-sm text-gray-600 mt-1">Range/hour (km)</div>
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
                        <i class="fas fa-euro-sign text-3xl text-orange-600 mb-3"></i>
                        <div class="text-2xl font-semibold text-gray-900" id="chargingCost">-</div>
                        <div class="text-sm text-gray-600 mt-1">Charging Cost</div>
                    </div>
                </div>
                
                <!-- Estimated Range with Available Time - Apple Style -->
                <div id="rangeEstimate" class="mb-8 p-8 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl shadow-sm">
                    <div class="text-center">
                        <h3 class="text-xl font-semibold mb-4 flex items-center justify-center text-gray-900">
                            <i class="fas fa-route text-cyan-600 mr-2"></i>
                            Estimated range with available time
                        </h3>
                        <div class="text-center mb-4">
                            <div class="inline-block">
                                <div class="text-6xl md:text-7xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2" id="estimatedRange">
                                    -
                                </div>
                                <div class="text-2xl text-gray-600 font-medium">kilometers</div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-600">
                            Based on <span class="text-cyan-700 font-semibold" id="displayChargingTime">-</span> minutes of charging
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-4">
                            <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                <div class="text-sm text-gray-600 mb-1 font-medium">Energy Added</div>
                                <div class="text-xl font-semibold text-cyan-700" id="energyAdded">-</div>
                            </div>
                            <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                <div class="text-sm text-gray-600 mb-1 font-medium">Final SOC</div>
                                <div class="text-xl font-semibold text-green-700" id="finalSOC">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Cost Details - Apple Style -->
                <div id="costDetails" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl shadow-sm">
                    <div class="text-center">
                        <div class="text-sm text-gray-600 mb-1 font-medium">Energy Used</div>
                        <div class="text-xl font-semibold text-gray-900" id="energyUsed">-</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm text-gray-600 mb-1 font-medium">Cost per Hour</div>
                        <div class="text-xl font-semibold text-gray-900" id="costPerHour">-</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm text-gray-600 mb-1 font-medium">Cost per 100km</div>
                        <div class="text-xl font-semibold text-gray-900" id="costPer100km">-</div>
                    </div>
                </div>

                <!-- Action Buttons - Apple Style -->
                <div class="flex justify-center">
                    <button id="compareFromResult" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all transform hover:scale-105 font-semibold text-lg shadow-md hover:shadow-lg">
                        <i class="fas fa-exchange-alt mr-2"></i>Compare Vehicles
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Compare Vehicles Modal - Apple Style -->
    <div id="compareModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in shadow-2xl border border-gray-200">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-3xl font-semibold mb-2 text-gray-900">Compare Vehicles</h2>
                    <p class="text-gray-600">Select vehicles to compare charging performance</p>
                </div>
                <button id="closeCompareModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Current Settings Display - Apple Style -->
            <div class="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Charger:</span>
                        <span class="ml-2 font-semibold text-gray-900" id="compareChargerPower">50 kW</span>
                    </div>
                    <div>
                        <span class="text-gray-600">SOC:</span>
                        <span class="ml-2 font-semibold text-gray-900" id="compareSOCRange">20-80%</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Price:</span>
                        <span class="ml-2 font-semibold text-gray-900" id="compareElectricityPrice">€0.30/kWh</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Selected:</span>
                        <span class="ml-2 font-semibold text-blue-600" id="compareVehicleCount">0 vehicles</span>
                    </div>
                </div>
            </div>

            <!-- Vehicle Search for Comparison - Apple Style -->
            <div class="mb-6">
                <label class="block text-sm font-semibold mb-3 text-gray-900">
                    <i class="fas fa-search mr-2 text-blue-600"></i>Search vehicles to compare (max 4)
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        id="compareVehicleSearch" 
                        placeholder="Type to search..." 
                        class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        autocomplete="off"
                    >
                    <i class="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    
                    <!-- Autocomplete Dropdown for Comparison - Apple Style -->
                    <div id="compareAutocompleteDropdown" class="hidden absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto">
                        <div id="compareAutocompleteResults" class="py-2">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Selected Vehicles for Comparison - Apple Style -->
            <div id="selectedCompareVehicles" class="mb-6">
                <h3 class="text-sm font-semibold mb-3 text-gray-900">Selected vehicles:</h3>
                <div id="selectedCompareVehiclesList" class="space-y-2">
                    <div class="text-sm text-gray-600 text-center py-4 bg-gray-50 rounded-2xl border border-gray-200">No vehicles selected yet</div>
                </div>
            </div>

            <!-- Compare Button - Apple Style -->
            <button id="startCompareBtn" disabled class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-exchange-alt mr-2"></i>Compare selected vehicles
            </button>
        </div>
    </div>

    <!-- Comparison Results Section - Apple Style -->
    <div id="comparisonResults" class="hidden max-w-6xl mx-auto px-4 pb-12 mt-8">
        <div class="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-semibold mb-2 text-gray-900">Vehicle Comparison</h2>
                <p class="text-gray-600">Charging performance side by side</p>
            </div>

            <!-- Comparison Table -->
            <div class="overflow-x-auto">
                <table class="w-full" id="comparisonTable">
                    <!-- Table will be populated by JavaScript -->
                </table>
            </div>

            <!-- Back Button - Apple Style -->
            <div class="mt-8 text-center">
                <button id="closeComparisonResults" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-full transition-colors shadow-sm">
                    <i class="fas fa-arrow-left mr-2"></i>Back to calculator
                </button>
            </div>
        </div>
    </div>

    <!-- Pricing Modal - Apple Style -->
    <div id="pricingModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 animate-fade-in shadow-2xl border border-gray-200">
            <div class="flex justify-between items-start mb-8">
                <div>
                    <h2 class="text-3xl font-semibold mb-2 text-gray-900">Choose your subscription</h2>
                    <p class="text-gray-600">Unlock premium features and get access to all vehicles</p>
                </div>
                <button id="closePricingModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div id="pricingTiers" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Pricing tiers will be loaded here -->
            </div>
        </div>
    </div>

    <!-- Footer - Pensato Branding -->
    <footer class="mt-12 py-8 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-4">
                <div class="flex items-center justify-center mb-2">
                    <i class="fas fa-brain text-2xl text-blue-600 mr-2"></i>
                    <h3 class="text-2xl font-bold text-gray-900">Pensato</h3>
                </div>
                <p class="text-sm text-gray-600 mb-3">AI-Powered Solutions</p>
                <div class="flex items-center justify-center space-x-2 text-xs text-gray-600">
                    <span>Made in Belgium with</span>
                    <span class="text-lg" style="color: #000000;">🖤</span>
                    <span class="text-lg" style="color: #FFD700;">💛</span>
                    <span class="text-lg" style="color: #EF3340;">❤️</span>
                </div>
            </div>
            <div class="flex justify-center space-x-6 text-xs">
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Privacy</a>
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Terms</a>
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
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
