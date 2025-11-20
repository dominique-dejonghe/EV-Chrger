// EV Charge Calculator - Frontend Application
// State management
const state = {
  userTier: 'free', // free, premium, pro
  vehicles: [],
  selectedVehicle: null,
  chargerPower: 50,
  soc: 50,
  lastCalculation: null
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
  setupEventListeners()
  loadVehicles()
  loadPricingTiers()
})

function initializeApp() {
  // Check for saved user tier
  const savedTier = localStorage.getItem('userTier')
  if (savedTier) {
    state.userTier = savedTier
    updateTierUI()
  }
  
  // Sync range inputs
  syncRangeInputs()
}

function setupEventListeners() {
  // Charger power controls
  const powerRange = document.getElementById('chargerPowerRange')
  const powerInput = document.getElementById('chargerPowerInput')
  
  powerRange.addEventListener('input', (e) => {
    state.chargerPower = parseInt(e.target.value)
    powerInput.value = state.chargerPower
  })
  
  powerInput.addEventListener('input', (e) => {
    state.chargerPower = parseInt(e.target.value) || 50
    powerRange.value = state.chargerPower
  })
  
  // SOC controls
  const socRange = document.getElementById('socRange')
  const socValue = document.getElementById('socValue')
  
  socRange.addEventListener('input', (e) => {
    state.soc = parseInt(e.target.value)
    socValue.textContent = state.soc
  })
  
  // Vehicle selection
  document.getElementById('vehicleSelect').addEventListener('change', (e) => {
    const vehicleId = e.target.value
    state.selectedVehicle = state.vehicles.find(v => v.id == vehicleId)
    
    // Show SOC slider for premium users
    if (state.userTier !== 'free') {
      document.getElementById('socSlider').classList.remove('hidden')
    }
  })
  
  // Calculate button
  document.getElementById('calculateBtn').addEventListener('click', calculateChargingSpeed)
  
  // Upgrade buttons
  document.getElementById('upgradeBtnNav').addEventListener('click', showPricingModal)
  document.getElementById('upgradeBtnCalc').addEventListener('click', showPricingModal)
  document.getElementById('closePricingModal').addEventListener('click', hidePricingModal)
  
  // Close modal on background click
  document.getElementById('pricingModal').addEventListener('click', (e) => {
    if (e.target.id === 'pricingModal') {
      hidePricingModal()
    }
  })
}

function syncRangeInputs() {
  // Initial sync
  const powerRange = document.getElementById('chargerPowerRange')
  const powerInput = document.getElementById('chargerPowerInput')
  powerInput.value = powerRange.value
}

async function loadVehicles() {
  try {
    const response = await axios.get(`/api/vehicles?tier=${state.userTier}`)
    
    if (response.data.success) {
      state.vehicles = response.data.vehicles
      populateVehicleSelect()
      updateVehicleCount(response.data.total)
      
      // Show premium notice if free tier
      if (state.userTier === 'free') {
        showPremiumNotice()
      }
    }
  } catch (error) {
    console.error('Failed to load vehicles:', error)
    showError('Failed to load vehicles. Please refresh the page.')
  }
}

function populateVehicleSelect() {
  const select = document.getElementById('vehicleSelect')
  select.innerHTML = '<option value="">Select your vehicle...</option>'
  
  // Group vehicles by make
  const grouped = state.vehicles.reduce((acc, vehicle) => {
    if (!acc[vehicle.make]) {
      acc[vehicle.make] = []
    }
    acc[vehicle.make].push(vehicle)
    return acc
  }, {})
  
  // Add options grouped by make
  Object.keys(grouped).sort().forEach(make => {
    const optgroup = document.createElement('optgroup')
    optgroup.label = make
    
    grouped[make].forEach(vehicle => {
      const option = document.createElement('option')
      option.value = vehicle.id
      const variantText = vehicle.variant ? ` ${vehicle.variant}` : ''
      option.textContent = `${vehicle.model}${variantText} (${vehicle.year})`
      
      // Add premium badge
      if (vehicle.is_premium) {
        option.textContent += ' 👑'
      }
      
      optgroup.appendChild(option)
    })
    
    select.appendChild(optgroup)
  })
}

function updateVehicleCount(count) {
  document.getElementById('vehicleCount').textContent = `${count}+`
}

function showPremiumNotice() {
  const notice = document.getElementById('premiumVehicleNotice')
  notice.classList.remove('hidden')
  
  notice.querySelector('button').addEventListener('click', showPricingModal)
}

async function calculateChargingSpeed() {
  if (!state.selectedVehicle) {
    showError('Please select a vehicle first')
    return
  }
  
  const btn = document.getElementById('calculateBtn')
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Calculating...'
  
  try {
    const response = await axios.post('/api/calculate', {
      vehicleId: state.selectedVehicle.id,
      chargerPowerKw: state.chargerPower,
      soc: state.userTier !== 'free' ? state.soc : undefined
    })
    
    if (response.data.success) {
      state.lastCalculation = response.data.calculation
      displayResults(response.data.calculation)
    }
  } catch (error) {
    console.error('Calculation failed:', error)
    showError('Calculation failed. Please try again.')
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-calculator mr-2"></i>Calculate Charging Speed'
  }
}

function displayResults(calculation) {
  // Show results section
  const resultsSection = document.getElementById('resultsSection')
  resultsSection.classList.remove('hidden')
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  
  // Update values
  document.getElementById('vehicleName').textContent = 
    `${calculation.vehicleMake} ${calculation.vehicleModel}`
  
  document.getElementById('speedResult').textContent = 
    calculation.chargingSpeedKmh.toLocaleString()
  
  document.getElementById('effectivePower').textContent = 
    `${calculation.effectivePowerKw.toFixed(1)} kW`
  
  document.getElementById('chargingTime').textContent = 
    `${calculation.chargingTime20to80} min`
  
  document.getElementById('rangePerHour').textContent = 
    `${calculation.rangePerHour.toLocaleString()} km`
  
  // Show charging curve for premium users
  if (state.userTier !== 'free' && state.selectedVehicle.charging_curve_data) {
    showChargingCurve(state.selectedVehicle.charging_curve_data, calculation.soc)
  }
}

function showChargingCurve(curveDataJson, currentSoc) {
  const curveSection = document.getElementById('chargingCurve')
  curveSection.classList.remove('hidden')
  
  try {
    const curveData = JSON.parse(curveDataJson)
    const canvas = document.getElementById('curveCanvas')
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw curve
    if (curveData.curve && Array.isArray(curveData.curve)) {
      drawChargingCurveOnCanvas(ctx, canvas, curveData.curve, currentSoc)
    }
  } catch (error) {
    console.error('Failed to draw charging curve:', error)
  }
}

function drawChargingCurveOnCanvas(ctx, canvas, curve, currentSoc) {
  const padding = 40
  const width = canvas.width - padding * 2
  const height = canvas.height - padding * 2
  
  // Find max power for scaling
  const maxPower = Math.max(...curve.map(p => p.kw))
  
  // Draw axes
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, padding + height)
  ctx.lineTo(padding + width, padding + height)
  ctx.stroke()
  
  // Draw curve
  ctx.strokeStyle = '#667eea'
  ctx.lineWidth = 3
  ctx.beginPath()
  
  curve.forEach((point, index) => {
    const x = padding + (point.soc / 100) * width
    const y = padding + height - (point.kw / maxPower) * height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // Draw current SOC indicator
  if (currentSoc !== undefined) {
    const socX = padding + (currentSoc / 100) * width
    
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(socX, padding)
    ctx.lineTo(socX, padding + height)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Label
    ctx.fillStyle = '#f59e0b'
    ctx.font = '12px Inter'
    ctx.fillText(`${currentSoc}%`, socX - 15, padding - 10)
  }
  
  // Labels
  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px Inter'
  ctx.fillText('0%', padding - 10, padding + height + 20)
  ctx.fillText('100%', padding + width - 20, padding + height + 20)
  ctx.fillText(`${maxPower.toFixed(0)} kW`, 5, padding)
  ctx.fillText('0 kW', 5, padding + height)
}

async function loadPricingTiers() {
  try {
    const response = await axios.get('/api/subscription-tiers')
    
    if (response.data.success) {
      populatePricingTiers(response.data.tiers)
    }
  } catch (error) {
    console.error('Failed to load pricing tiers:', error)
  }
}

function populatePricingTiers(tiers) {
  const container = document.getElementById('pricingTiers')
  container.innerHTML = ''
  
  tiers.forEach(tier => {
    const isCurrentTier = tier.id === state.userTier
    const isPopular = tier.popular
    
    const card = document.createElement('div')
    card.className = `relative bg-slate-800/50 rounded-2xl p-8 border-2 transition-all hover:scale-105 ${
      isPopular ? 'border-purple-500' : 'border-slate-700'
    } ${isCurrentTier ? 'ring-4 ring-green-500' : ''}`
    
    card.innerHTML = `
      ${isPopular ? '<div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 premium-badge text-white text-xs font-bold rounded-full">POPULAR</div>' : ''}
      ${isCurrentTier ? '<div class="absolute top-4 right-4 text-green-400"><i class="fas fa-check-circle text-2xl"></i></div>' : ''}
      
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold mb-2">${tier.name}</h3>
        <div class="text-4xl font-bold mb-1">
          ${tier.price === 0 ? 'Free' : `€${tier.price}`}
        </div>
        ${tier.period ? `<div class="text-gray-400 text-sm">per ${tier.period}</div>` : ''}
      </div>
      
      <ul class="space-y-3 mb-8">
        ${tier.features.map(feature => `
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
            <span class="text-sm text-gray-300">${feature}</span>
          </li>
        `).join('')}
      </ul>
      
      <button class="w-full py-3 rounded-xl font-semibold transition-all ${
        isCurrentTier 
          ? 'bg-green-600 text-white cursor-not-allowed' 
          : tier.price === 0
            ? 'bg-slate-700 hover:bg-slate-600 text-white'
            : 'tesla-gradient text-white hover:opacity-90'
      }" ${isCurrentTier ? 'disabled' : ''} data-tier="${tier.id}">
        ${isCurrentTier ? 'Current Plan' : tier.price === 0 ? 'Current Plan' : 'Upgrade Now'}
      </button>
    `
    
    // Add click handler for upgrade buttons
    const button = card.querySelector('button')
    if (!isCurrentTier && tier.price > 0) {
      button.addEventListener('click', () => selectPlan(tier))
    }
    
    container.appendChild(card)
  })
}

function selectPlan(tier) {
  // Simulate upgrade (in production, this would process payment)
  if (confirm(`Upgrade to ${tier.name} for €${tier.price}/${tier.period}?`)) {
    state.userTier = tier.id
    localStorage.setItem('userTier', tier.id)
    updateTierUI()
    hidePricingModal()
    loadVehicles()
    
    // Show success message
    showSuccess(`Successfully upgraded to ${tier.name}!`)
  }
}

function updateTierUI() {
  const tierBadge = document.getElementById('currentTier')
  tierBadge.textContent = state.userTier.charAt(0).toUpperCase() + state.userTier.slice(1)
  
  if (state.userTier === 'premium' || state.userTier === 'pro') {
    tierBadge.className = 'ml-2 px-3 py-1 premium-badge rounded-full text-sm font-medium'
  }
}

function showPricingModal() {
  document.getElementById('pricingModal').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function hidePricingModal() {
  document.getElementById('pricingModal').classList.add('hidden')
  document.body.style.overflow = ''
}

function showError(message) {
  // Simple error notification
  const notification = document.createElement('div')
  notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-fade-in'
  notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 5000)
}

function showSuccess(message) {
  const notification = document.createElement('div')
  notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-fade-in'
  notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 5000)
}
