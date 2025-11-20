// ============================================
// STATE MANAGEMENT
// ============================================
let appState = {
  currentTier: 'free',
  vehicles: [],
  filteredVehicles: [],
  selectedVehicle: null,
  chargerPower: 50,
  soc: 50,
  lastCalculation: null,
  activeAutocompleteIndex: -1
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
      appState.filteredVehicles = response.data.vehicles
      
      // Update vehicle count
      document.getElementById('vehicleCount').textContent = `${response.data.total}+`
    }
  } catch (error) {
    console.error('Failed to load vehicles:', error)
    showNotification('Failed to load vehicles', 'error')
  }
}

// ============================================
// AUTOCOMPLETE SEARCH
// ============================================
function filterVehicles(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    appState.filteredVehicles = []
    hideAutocomplete()
    return
  }
  
  const term = searchTerm.toLowerCase()
  
  appState.filteredVehicles = appState.vehicles.filter(vehicle => {
    const searchString = `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''} ${vehicle.year}`.toLowerCase()
    return searchString.includes(term)
  })
  
  displayAutocompleteResults()
}

function displayAutocompleteResults() {
  const dropdown = document.getElementById('autocompleteDropdown')
  const resultsContainer = document.getElementById('autocompleteResults')
  
  if (appState.filteredVehicles.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-4 text-center text-gray-400">
        <i class="fas fa-search mb-2 text-2xl"></i>
        <p>No vehicles found</p>
      </div>
    `
    dropdown.classList.remove('hidden')
    return
  }
  
  // Limit results to 50 for performance
  const displayVehicles = appState.filteredVehicles.slice(0, 50)
  
  resultsContainer.innerHTML = displayVehicles.map((vehicle, index) => `
    <div class="autocomplete-item ${vehicle.is_premium ? 'premium' : ''}" 
         data-index="${index}" 
         data-vehicle-id="${vehicle.id}"
         onclick="selectVehicleFromAutocomplete(${vehicle.id})">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">
            ${vehicle.make} ${vehicle.model}
            ${vehicle.variant ? `<span class="text-gray-400">${vehicle.variant}</span>` : ''}
          </div>
          <div class="text-xs text-gray-400 mt-1">
            ${vehicle.battery_capacity_kwh} kWh • 
            ${vehicle.avg_consumption_kwh_per_100km} kWh/100km • 
            ${vehicle.max_dc_charging_kw} kW DC
          </div>
        </div>
        ${vehicle.is_premium ? '<i class="fas fa-crown text-yellow-400"></i>' : ''}
      </div>
    </div>
  `).join('')
  
  dropdown.classList.remove('hidden')
  appState.activeAutocompleteIndex = -1
}

function hideAutocomplete() {
  const dropdown = document.getElementById('autocompleteDropdown')
  dropdown.classList.add('hidden')
  appState.activeAutocompleteIndex = -1
}

function selectVehicleFromAutocomplete(vehicleId) {
  const vehicle = appState.vehicles.find(v => v.id === vehicleId)
  if (!vehicle) return
  
  if (vehicle.is_premium && appState.currentTier === 'free') {
    showNotification('This is a premium vehicle. Please upgrade to access it.', 'warning')
    document.getElementById('premiumVehicleNotice').classList.remove('hidden')
    return
  }
  
  appState.selectedVehicle = vehicle
  
  // Update UI
  document.getElementById('vehicleSearch').value = `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`
  document.getElementById('selectedVehicleName').textContent = 
    `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''} (${vehicle.year})`
  document.getElementById('selectedVehicleSpecs').textContent = 
    `${vehicle.battery_capacity_kwh} kWh • ${vehicle.avg_consumption_kwh_per_100km} kWh/100km • Max DC: ${vehicle.max_dc_charging_kw} kW`
  
  document.getElementById('selectedVehicleDisplay').classList.remove('hidden')
  document.getElementById('premiumVehicleNotice').classList.add('hidden')
  
  // Show SOC slider for premium users
  if (appState.currentTier !== 'free') {
    document.getElementById('socSlider').classList.remove('hidden')
  }
  
  hideAutocomplete()
}

function clearVehicleSelection() {
  appState.selectedVehicle = null
  document.getElementById('vehicleSearch').value = ''
  document.getElementById('selectedVehicleDisplay').classList.add('hidden')
  document.getElementById('socSlider').classList.add('hidden')
  document.getElementById('resultsSection').classList.add('hidden')
}

// Handle keyboard navigation in autocomplete
function handleAutocompleteKeyboard(e) {
  const dropdown = document.getElementById('autocompleteDropdown')
  if (dropdown.classList.contains('hidden')) return
  
  const items = document.querySelectorAll('.autocomplete-item')
  if (items.length === 0) return
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    appState.activeAutocompleteIndex = Math.min(appState.activeAutocompleteIndex + 1, items.length - 1)
    updateActiveAutocompleteItem(items)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    appState.activeAutocompleteIndex = Math.max(appState.activeAutocompleteIndex - 1, 0)
    updateActiveAutocompleteItem(items)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (appState.activeAutocompleteIndex >= 0) {
      const activeItem = items[appState.activeAutocompleteIndex]
      const vehicleId = parseInt(activeItem.dataset.vehicleId)
      selectVehicleFromAutocomplete(vehicleId)
    }
  } else if (e.key === 'Escape') {
    hideAutocomplete()
  }
}

function updateActiveAutocompleteItem(items) {
  items.forEach((item, index) => {
    if (index === appState.activeAutocompleteIndex) {
      item.classList.add('active')
      item.scrollIntoView({ block: 'nearest' })
    } else {
      item.classList.remove('active')
    }
  })
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Vehicle search input
  const searchInput = document.getElementById('vehicleSearch')
  let debounceTimer
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      filterVehicles(e.target.value)
    }, 300)
  })
  
  searchInput.addEventListener('focus', (e) => {
    if (e.target.value.length >= 2) {
      filterVehicles(e.target.value)
    }
  })
  
  searchInput.addEventListener('keydown', handleAutocompleteKeyboard)
  
  // Clear vehicle selection
  document.getElementById('clearVehicleBtn').addEventListener('click', clearVehicleSelection)
  
  // Click outside to close autocomplete
  document.addEventListener('click', (e) => {
    const searchInput = document.getElementById('vehicleSearch')
    const dropdown = document.getElementById('autocompleteDropdown')
    
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      hideAutocomplete()
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
    document.getElementById('vehicleSearch').focus()
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
  
  // Check if charger power exceeds vehicle maximum - SHOW RED WARNING
  const isLimited = calculation.chargerPowerKw > appState.selectedVehicle.max_dc_charging_kw
  
  // Create or update the warning message
  const detailsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3')
  let warningDiv = document.getElementById('chargingLimitWarning')
  
  if (isLimited) {
    if (!warningDiv) {
      warningDiv = document.createElement('div')
      warningDiv.id = 'chargingLimitWarning'
      warningDiv.className = 'col-span-full mt-6'
      detailsGrid.parentNode.insertBefore(warningDiv, detailsGrid.nextSibling)
    }
    
    warningDiv.innerHTML = `
      <div class="p-4 bg-red-500/20 border-2 border-red-500 rounded-xl animate-pulse">
        <div class="flex items-start text-red-400">
          <i class="fas fa-exclamation-triangle text-3xl mr-4 flex-shrink-0 mt-1"></i>
          <div class="flex-1">
            <div class="font-bold text-xl mb-2">⚠️ Limited by vehicle maximum charging capacity</div>
            <div class="text-base leading-relaxed">
              Your charger provides <span class="font-bold text-red-300">${calculation.chargerPowerKw} kW</span>, 
              but this vehicle can only accept up to <span class="font-bold text-red-300">${appState.selectedVehicle.max_dc_charging_kw} kW</span>.
              <br>
              <span class="text-sm mt-2 inline-block">
                ⚡ Effective charging power: <span class="font-bold">${calculation.effectivePowerKw} kW</span>
              </span>
            </div>
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
    notification.style.transition = 'all 0.3s ease-out'
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
window.selectVehicleFromAutocomplete = selectVehicleFromAutocomplete
window.showPricingModal = showPricingModal
