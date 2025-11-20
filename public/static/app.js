// ============================================
// STATE MANAGEMENT
// ============================================
let appState = {
  currentTier: 'free',
  vehicles: [],
  selectedVehicle: null,
  chargerPower: 50,
  soc: 50,
  lastCalculation: null
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
})

async function initializeApp() {
  // Load vehicles
  await loadVehicles()
  
  // Setup event listeners
  setupEventListeners()
  
  // Load subscription tiers
  await loadSubscriptionTiers()
}

// ============================================
// VEHICLE LOADING
// ============================================
async function loadVehicles() {
  try {
    const response = await axios.get(`/api/vehicles?tier=${appState.currentTier}`)
    
    if (response.data.success) {
      appState.vehicles = response.data.vehicles
      populateVehicleSelect()
      
      // Update vehicle count
      document.getElementById('vehicleCount').textContent = `${response.data.total}+`
    }
  } catch (error) {
    console.error('Failed to load vehicles:', error)
    showNotification('Failed to load vehicles', 'error')
  }
}

function populateVehicleSelect() {
  const select = document.getElementById('vehicleSelect')
  
  // Clear existing options
  select.innerHTML = '<option value="">Select your vehicle...</option>'
  
  // Group vehicles by make
  const groupedVehicles = {}
  appState.vehicles.forEach(vehicle => {
    if (!groupedVehicles[vehicle.make]) {
      groupedVehicles[vehicle.make] = []
    }
    groupedVehicles[vehicle.make].push(vehicle)
  })
  
  // Create optgroups
  Object.keys(groupedVehicles).sort().forEach(make => {
    const optgroup = document.createElement('optgroup')
    optgroup.label = make
    
    groupedVehicles[make].forEach(vehicle => {
      const option = document.createElement('option')
      option.value = vehicle.id
      option.textContent = `${vehicle.model} ${vehicle.variant || ''} (${vehicle.year})`
      option.dataset.vehicle = JSON.stringify(vehicle)
      optgroup.appendChild(option)
    })
    
    select.appendChild(optgroup)
  })
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Vehicle selection
  document.getElementById('vehicleSelect').addEventListener('change', (e) => {
    const option = e.target.selectedOptions[0]
    if (option && option.dataset.vehicle) {
      appState.selectedVehicle = JSON.parse(option.dataset.vehicle)
      
      // Show SOC slider for premium users
      if (appState.currentTier !== 'free') {
        document.getElementById('socSlider').classList.remove('hidden')
      }
    }
  })
  
  // Charger power slider
  const powerRange = document.getElementById('chargerPowerRange')
  const powerInput = document.getElementById('chargerPowerInput')
  
  powerRange.addEventListener('input', (e) => {
    powerInput.value = e.target.value
    appState.chargerPower = parseInt(e.target.value)
  })
  
  powerInput.addEventListener('input', (e) => {
    let value = parseInt(e.target.value)
    if (value < 1) value = 1
    if (value > 350) value = 350
    powerRange.value = value
    appState.chargerPower = value
  })
  
  // SOC slider
  const socRange = document.getElementById('socRange')
  const socValue = document.getElementById('socValue')
  
  socRange.addEventListener('input', (e) => {
    socValue.textContent = e.target.value
    appState.soc = parseInt(e.target.value)
  })
  
  // Calculate button
  document.getElementById('calculateBtn').addEventListener('click', calculateChargingSpeed)
  
  // Upgrade buttons
  document.getElementById('upgradeBtnNav').addEventListener('click', showPricingModal)
  document.getElementById('upgradeBtnCalc').addEventListener('click', showPricingModal)
  
  // Pricing modal
  document.getElementById('closePricingModal').addEventListener('click', hidePricingModal)
  
  // Close modal on outside click
  document.getElementById('pricingModal').addEventListener('click', (e) => {
    if (e.target.id === 'pricingModal') {
      hidePricingModal()
    }
  })
}

// ============================================
// CALCULATION
// ============================================
async function calculateChargingSpeed() {
  if (!appState.selectedVehicle) {
    showNotification('Please select a vehicle first', 'warning')
    return
  }
  
  const calculateBtn = document.getElementById('calculateBtn')
  calculateBtn.disabled = true
  calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Calculating...'
  
  try {
    const response = await axios.post('/api/calculate', {
      vehicleId: appState.selectedVehicle.id,
      chargerPowerKw: appState.chargerPower,
      soc: appState.currentTier !== 'free' ? appState.soc : undefined
    })
    
    if (response.data.success) {
      appState.lastCalculation = response.data.calculation
      displayResults(response.data.calculation)
    }
  } catch (error) {
    console.error('Calculation failed:', error)
    showNotification('Calculation failed', 'error')
  } finally {
    calculateBtn.disabled = false
    calculateBtn.innerHTML = '<i class="fas fa-calculator mr-2"></i>Calculate Charging Speed'
  }
}

function displayResults(calculation) {
  const resultsSection = document.getElementById('resultsSection')
  resultsSection.classList.remove('hidden')
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  
  // Vehicle name
  document.getElementById('vehicleName').textContent = 
    `${calculation.vehicleMake} ${calculation.vehicleModel}`
  
  // Main speed result
  document.getElementById('speedResult').textContent = calculation.chargingSpeedKmh
  
  // Details
  document.getElementById('effectivePower').textContent = `${calculation.effectivePowerKw} kW`
  document.getElementById('chargingTime').textContent = `${calculation.chargingTime20to80} min`
  document.getElementById('rangePerHour').textContent = `${calculation.rangePerHour} km`
  
  // Check if charger power exceeds vehicle maximum
  const isLimited = calculation.chargerPowerKw > appState.selectedVehicle.max_dc_charging_kw
  
  // Create or update the warning message
  const detailsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3')
  let warningDiv = document.getElementById('chargingLimitWarning')
  
  if (isLimited) {
    if (!warningDiv) {
      warningDiv = document.createElement('div')
      warningDiv.id = 'chargingLimitWarning'
      warningDiv.className = 'col-span-full mt-4 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl animate-pulse'
      detailsGrid.parentNode.insertBefore(warningDiv, detailsGrid.nextSibling)
    }
    
    warningDiv.innerHTML = `
      <div class="flex items-center text-red-400">
        <i class="fas fa-exclamation-triangle text-2xl mr-3"></i>
        <div>
          <div class="font-bold text-lg">Limited by vehicle maximum charging capacity</div>
          <div class="text-sm mt-1">
            Your charger provides ${calculation.chargerPowerKw} kW, but this vehicle can only accept up to 
            <span class="font-bold">${appState.selectedVehicle.max_dc_charging_kw} kW</span>.
            Effective charging power: <span class="font-bold">${calculation.effectivePowerKw} kW</span>
          </div>
        </div>
      </div>
    `
    warningDiv.classList.remove('hidden')
  } else {
    if (warningDiv) {
      warningDiv.classList.add('hidden')
    }
  }
  
  // Show charging curve for premium users
  if (appState.currentTier !== 'free' && appState.selectedVehicle.charging_curve_data) {
    displayChargingCurve()
  }
}

function displayChargingCurve() {
  const curveSection = document.getElementById('chargingCurve')
  curveSection.classList.remove('hidden')
  
  try {
    const curveData = JSON.parse(appState.selectedVehicle.charging_curve_data)
    const canvas = document.getElementById('curveCanvas')
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw curve
    if (curveData.curve && curveData.curve.length > 0) {
      const curve = curveData.curve
      const maxPower = Math.max(...curve.map(p => p.kw))
      
      // Calculate dimensions
      const padding = 40
      const width = canvas.width - padding * 2
      const height = canvas.height - padding * 2
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      
      // Vertical grid lines (SOC)
      for (let i = 0; i <= 100; i += 20) {
        const x = padding + (i / 100) * width
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, canvas.height - padding)
        ctx.stroke()
      }
      
      // Horizontal grid lines (Power)
      for (let i = 0; i <= maxPower; i += 50) {
        const y = canvas.height - padding - (i / maxPower) * height
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(canvas.width - padding, y)
        ctx.stroke()
      }
      
      // Draw curve
      ctx.strokeStyle = '#667eea'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      curve.forEach((point, index) => {
        const x = padding + (point.soc / 100) * width
        const y = canvas.height - padding - (point.kw / maxPower) * height
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
      
      // Draw points
      ctx.fillStyle = '#667eea'
      curve.forEach(point => {
        const x = padding + (point.soc / 100) * width
        const y = canvas.height - padding - (point.kw / maxPower) * height
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
      
      // Draw current SOC indicator if available
      if (appState.soc !== undefined) {
        const x = padding + (appState.soc / 100) * width
        ctx.strokeStyle = '#f5576c'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, canvas.height - padding)
        ctx.stroke()
        ctx.setLineDash([])
      }
      
      // Draw labels
      ctx.fillStyle = '#9ca3af'
      ctx.font = '12px Inter'
      ctx.textAlign = 'center'
      
      // X-axis labels (SOC)
      ctx.fillText('0%', padding, canvas.height - 10)
      ctx.fillText('50%', padding + width / 2, canvas.height - 10)
      ctx.fillText('100%', canvas.width - padding, canvas.height - 10)
      
      // Y-axis labels (Power)
      ctx.textAlign = 'right'
      ctx.fillText('0 kW', padding - 10, canvas.height - padding)
      ctx.fillText(`${Math.round(maxPower / 2)} kW`, padding - 10, canvas.height - padding - height / 2)
      ctx.fillText(`${maxPower} kW`, padding - 10, padding + 5)
      
      // Title
      ctx.textAlign = 'left'
      ctx.fillStyle = '#ffffff'
      ctx.font = '14px Inter'
      ctx.fillText('Charging Power vs Battery SOC', padding, 20)
    }
  } catch (error) {
    console.error('Failed to draw charging curve:', error)
  }
}

// ============================================
// SUBSCRIPTION TIERS
// ============================================
async function loadSubscriptionTiers() {
  try {
    const response = await axios.get('/api/subscription-tiers')
    
    if (response.data.success) {
      displayPricingTiers(response.data.tiers)
    }
  } catch (error) {
    console.error('Failed to load subscription tiers:', error)
  }
}

function displayPricingTiers(tiers) {
  const container = document.getElementById('pricingTiers')
  container.innerHTML = ''
  
  tiers.forEach(tier => {
    const tierCard = document.createElement('div')
    tierCard.className = `glass rounded-2xl p-6 ${tier.popular ? 'ring-2 ring-purple-500 transform scale-105' : ''} transition-all hover:scale-105`
    
    tierCard.innerHTML = `
      ${tier.popular ? '<div class="text-center mb-4"><span class="px-3 py-1 premium-badge rounded-full text-xs font-bold">MOST POPULAR</span></div>' : ''}
      
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold mb-2">${tier.name}</h3>
        <div class="text-4xl font-bold mb-1">
          ${tier.price === 0 ? 'Free' : `€${tier.price}`}
        </div>
        ${tier.period ? `<div class="text-sm text-gray-400">per ${tier.period}</div>` : ''}
      </div>
      
      <ul class="space-y-3 mb-8">
        ${tier.features.map(feature => `
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
            <span class="text-sm">${feature}</span>
          </li>
        `).join('')}
      </ul>
      
      <button class="w-full py-3 rounded-xl font-semibold transition-all ${
        tier.id === 'free' 
          ? 'bg-slate-700 hover:bg-slate-600' 
          : tier.popular
            ? 'premium-badge hover:opacity-90'
            : 'bg-blue-600 hover:bg-blue-700'
      }" onclick="selectTier('${tier.id}')">
        ${tier.id === 'free' ? 'Current Plan' : 'Upgrade Now'}
      </button>
    `
    
    container.appendChild(tierCard)
  })
}

function selectTier(tierId) {
  if (tierId === 'free') {
    showNotification('You are already on the free plan', 'info')
    return
  }
  
  // In a real app, this would redirect to payment
  showNotification('Payment integration coming soon! This is a demo.', 'info')
  
  // For demo purposes, simulate upgrade
  if (confirm(`Upgrade to ${tierId} plan? (Demo mode)`)) {
    appState.currentTier = tierId
    document.getElementById('currentTier').textContent = tierId.charAt(0).toUpperCase() + tierId.slice(1)
    document.getElementById('currentTier').className = 'ml-2 px-3 py-1 premium-badge rounded-full text-sm font-medium'
    hidePricingModal()
    loadVehicles() // Reload with all vehicles
    showNotification('Successfully upgraded! You now have access to all features.', 'success')
  }
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function showPricingModal() {
  document.getElementById('pricingModal').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function hidePricingModal() {
  document.getElementById('pricingModal').classList.add('hidden')
  document.body.style.overflow = 'auto'
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }
  
  const notification = document.createElement('div')
  notification.className = `fixed top-20 right-4 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-fade-in`
  notification.innerHTML = `
    <div class="flex items-center space-x-3">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.opacity = '0'
    notification.style.transform = 'translateX(100%)'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatNumber(num) {
  return new Intl.NumberFormat('nl-NL').format(num)
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Export for global access
window.selectTier = selectTier
