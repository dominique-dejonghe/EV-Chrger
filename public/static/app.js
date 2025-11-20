// ============================================
// STATE MANAGEMENT
// ============================================
let appState = {
  currentTier: 'free',
  vehicles: [],
  filteredVehicles: [],
  selectedVehicle: null,
  chargerPower: 50,
  startSoc: 20,
  endSoc: 80,
  electricityPrice: 0.30,
  lastCalculation: null,
  activeAutocompleteIndex: -1,
  compareVehicles: [], // Array of selected vehicles for comparison (max 4)
  compareFilteredVehicles: []
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
    // ALWAYS load ALL vehicles regardless of tier
    const response = await axios.get('/api/vehicles?tier=all')
    
    if (response.data.success) {
      appState.vehicles = response.data.vehicles
      appState.filteredVehicles = response.data.vehicles
      
      // Update vehicle count
      const freeCount = appState.vehicles.filter(v => !v.is_premium).length
      const premiumCount = appState.vehicles.filter(v => v.is_premium).length
      document.getElementById('vehicleCount').textContent = `${appState.vehicles.length}+`
      
      console.log(`Loaded ${appState.vehicles.length} vehicles (${freeCount} free, ${premiumCount} premium)`)
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
  
  resultsContainer.innerHTML = displayVehicles.map((vehicle, index) => {
    const isPremiumLocked = vehicle.is_premium && appState.currentTier === 'free'
    
    return `
      <div class="autocomplete-item ${vehicle.is_premium ? 'premium' : ''} ${isPremiumLocked ? 'locked' : ''}" 
           data-index="${index}" 
           data-vehicle-id="${vehicle.id}"
           data-is-premium="${vehicle.is_premium}"
           onclick="selectVehicleFromAutocomplete(${vehicle.id})">
        <div class="flex items-center justify-between">
          <div class="flex-1 ${isPremiumLocked ? 'opacity-60' : ''}">
            <div class="font-medium flex items-center gap-2">
              ${vehicle.make} ${vehicle.model}
              ${vehicle.variant ? `<span class="text-gray-400">${vehicle.variant}</span>` : ''}
              ${isPremiumLocked ? '<i class="fas fa-lock text-xs text-yellow-500"></i>' : ''}
            </div>
            <div class="text-xs text-gray-400 mt-1">
              ${vehicle.battery_capacity_kwh} kWh • 
              ${vehicle.avg_consumption_kwh_per_100km} kWh/100km • 
              ${vehicle.max_dc_charging_kw} kW DC
            </div>
            ${isPremiumLocked ? '<div class="text-xs text-yellow-400 mt-1"><i class="fas fa-crown mr-1"></i>Premium Only</div>' : ''}
          </div>
          ${vehicle.is_premium ? '<i class="fas fa-crown text-yellow-400 ml-3"></i>' : ''}
        </div>
      </div>
    `
  }).join('')
  
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
  
  // Check if this is a premium vehicle and user is on free tier
  if (vehicle.is_premium && appState.currentTier === 'free') {
    // Show premium upgrade modal
    showPremiumUpgradeModal(vehicle)
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

// Show premium upgrade modal when trying to select premium vehicle
function showPremiumUpgradeModal(vehicle) {
  // Create modal overlay
  const modal = document.createElement('div')
  modal.id = 'premiumUpgradeModal'
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in'
  
  modal.innerHTML = `
    <div class="glass rounded-3xl max-w-lg w-full p-8 animate-fade-in-up">
      <div class="text-center mb-6">
        <div class="w-20 h-20 mx-auto mb-4 premium-badge rounded-full flex items-center justify-center">
          <i class="fas fa-crown text-4xl text-white"></i>
        </div>
        <h2 class="text-3xl font-bold mb-2">Premium Voertuig</h2>
        <p class="text-gray-400">
          ${vehicle.make} ${vehicle.model} ${vehicle.variant || ''} is alleen beschikbaar voor Premium leden
        </p>
      </div>
      
      <div class="bg-slate-800/50 rounded-xl p-6 mb-6">
        <h3 class="font-semibold mb-4 flex items-center">
          <i class="fas fa-star text-yellow-400 mr-2"></i>
          Upgrade naar Premium voor:
        </h3>
        <ul class="space-y-3">
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
            <span><strong>284+ voertuigen</strong> - Toegang tot alle merken</span>
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
            <span><strong>Charging curves</strong> - Gedetailleerde laadanalyse</span>
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
            <span><strong>Voertuig vergelijking</strong> - Side-by-side analyse</span>
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
            <span><strong>SOC slider</strong> - Nauwkeurige berekeningen</span>
          </li>
          <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
            <span><strong>History & Export</strong> - Bewaar en deel resultaten</span>
          </li>
        </ul>
      </div>
      
      <div class="text-center mb-4">
        <div class="text-4xl font-bold mb-2">
          €4.99<span class="text-lg text-gray-400 font-normal">/maand</span>
        </div>
        <p class="text-sm text-gray-400">30 dagen geld-terug-garantie</p>
      </div>
      
      <div class="flex gap-3">
        <button onclick="closePremiumUpgradeModal()" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors">
          Terug
        </button>
        <button onclick="upgradeToPremium()" class="flex-1 py-3 premium-badge hover:opacity-90 rounded-xl font-semibold transition-opacity">
          <i class="fas fa-crown mr-2"></i>Upgrade Nu
        </button>
      </div>
    </div>
  `
  
  document.body.appendChild(modal)
  document.body.style.overflow = 'hidden'
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target.id === 'premiumUpgradeModal') {
      closePremiumUpgradeModal()
    }
  })
}

function closePremiumUpgradeModal() {
  const modal = document.getElementById('premiumUpgradeModal')
  if (modal) {
    modal.remove()
    document.body.style.overflow = 'auto'
  }
}

function upgradeToPremium() {
  closePremiumUpgradeModal()
  showPricingModal()
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
  
  // Start SOC slider
  const startSocRange = document.getElementById('startSocRange')
  const startSocValue = document.getElementById('startSocValue')
  
  if (startSocRange) {
    startSocRange.addEventListener('input', (e) => {
      let value = parseInt(e.target.value)
      // Ensure start SOC doesn't exceed end SOC
      if (value >= appState.endSoc) {
        value = appState.endSoc - 5
        e.target.value = value
      }
      startSocValue.textContent = value
      appState.startSoc = value
    })
  }
  
  // End SOC slider
  const endSocRange = document.getElementById('endSocRange')
  const endSocValue = document.getElementById('endSocValue')
  
  if (endSocRange) {
    endSocRange.addEventListener('input', (e) => {
      let value = parseInt(e.target.value)
      // Ensure end SOC doesn't go below start SOC
      if (value <= appState.startSoc) {
        value = appState.startSoc + 5
        e.target.value = value
      }
      endSocValue.textContent = value
      appState.endSoc = value
    })
  }
  
  // Electricity price slider
  const priceRange = document.getElementById('electricityPriceRange')
  const priceInput = document.getElementById('electricityPriceInput')
  
  priceRange.addEventListener('input', (e) => {
    priceInput.value = parseFloat(e.target.value).toFixed(2)
    appState.electricityPrice = parseFloat(e.target.value)
  })
  
  priceInput.addEventListener('input', (e) => {
    let value = parseFloat(e.target.value)
    if (value < 0.10) value = 0.10
    if (value > 1.00) value = 1.00
    priceRange.value = value
    appState.electricityPrice = value
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
  
  // Compare functionality
  document.getElementById('compareFromResult').addEventListener('click', showCompareModal)
  document.getElementById('closeCompareModal').addEventListener('click', hideCompareModal)
  document.getElementById('startCompareBtn').addEventListener('click', performComparison)
  document.getElementById('closeComparisonResults').addEventListener('click', hideComparisonResults)
  
  // Compare vehicle search
  const compareSearchInput = document.getElementById('compareVehicleSearch')
  let compareDebounceTimer
  
  compareSearchInput.addEventListener('input', (e) => {
    clearTimeout(compareDebounceTimer)
    compareDebounceTimer = setTimeout(() => {
      filterCompareVehicles(e.target.value)
    }, 300)
  })
  
  compareSearchInput.addEventListener('focus', (e) => {
    if (e.target.value.length >= 2) {
      filterCompareVehicles(e.target.value)
    }
  })
  
  // Close compare autocomplete on outside click
  document.addEventListener('click', (e) => {
    const compareSearchInput = document.getElementById('compareVehicleSearch')
    const compareDropdown = document.getElementById('compareAutocompleteDropdown')
    
    if (!compareSearchInput.contains(e.target) && !compareDropdown.contains(e.target)) {
      hideCompareAutocomplete()
    }
  })
  
  // Close compare modal on outside click
  document.getElementById('compareModal').addEventListener('click', (e) => {
    if (e.target.id === 'compareModal') {
      hideCompareModal()
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
      startSoc: appState.currentTier !== 'free' ? appState.startSoc : 20,
      endSoc: appState.currentTier !== 'free' ? appState.endSoc : 80,
      electricityPrice: appState.electricityPrice
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
  document.getElementById('chargingTime').textContent = calculation.chargingTime
  document.getElementById('rangePerHour').textContent = `${calculation.rangePerHour} km`
  document.getElementById('chargingCost').textContent = calculation.totalCost || 'N/A'
  
  // Cost details
  if (calculation.energyUsed) {
    document.getElementById('energyUsed').textContent = `${calculation.energyUsed} kWh`
    document.getElementById('costPerHour').textContent = calculation.costPerHour || 'N/A'
    document.getElementById('costPer100km').textContent = calculation.costPer100km || 'N/A'
  }
  
  // Check if charger power exceeds vehicle maximum - SHOW RED WARNING
  const isLimited = calculation.chargerPowerKw > appState.selectedVehicle.max_dc_charging_kw
  
  // Create or update the warning message
  const detailsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
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

// ============================================
// COMPARE FUNCTIONALITY
// ============================================
function showCompareModal() {
  const modal = document.getElementById('compareModal')
  modal.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
  
  // Update current settings display
  document.getElementById('compareChargerPower').textContent = `${appState.chargerPower} kW`
  document.getElementById('compareSOCRange').textContent = `${appState.startSoc}-${appState.endSoc}%`
  document.getElementById('compareElectricityPrice').textContent = `€${appState.electricityPrice.toFixed(2)}/kWh`
  
  // Add current vehicle if one is selected
  if (appState.selectedVehicle && appState.compareVehicles.length === 0) {
    addVehicleToCompare(appState.selectedVehicle.id)
  }
  
  updateCompareVehicleCount()
}

function hideCompareModal() {
  const modal = document.getElementById('compareModal')
  modal.classList.add('hidden')
  document.body.style.overflow = 'auto'
}

function filterCompareVehicles(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    appState.compareFilteredVehicles = []
    hideCompareAutocomplete()
    return
  }
  
  const term = searchTerm.toLowerCase()
  
  appState.compareFilteredVehicles = appState.vehicles.filter(vehicle => {
    const searchString = `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''} ${vehicle.year}`.toLowerCase()
    return searchString.includes(term) && !appState.compareVehicles.find(v => v.id === vehicle.id)
  })
  
  displayCompareAutocompleteResults()
}

function displayCompareAutocompleteResults() {
  const dropdown = document.getElementById('compareAutocompleteDropdown')
  const resultsContainer = document.getElementById('compareAutocompleteResults')
  
  if (appState.compareFilteredVehicles.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-4 text-center text-gray-400">
        <i class="fas fa-search mb-2 text-2xl"></i>
        <p>No vehicles found</p>
      </div>
    `
    dropdown.classList.remove('hidden')
    return
  }
  
  const displayVehicles = appState.compareFilteredVehicles.slice(0, 20)
  
  resultsContainer.innerHTML = displayVehicles.map((vehicle) => {
    const isPremiumLocked = vehicle.is_premium && appState.currentTier === 'free'
    
    return `
      <div class="autocomplete-item ${vehicle.is_premium ? 'premium' : ''} ${isPremiumLocked ? 'locked' : ''}" 
           data-vehicle-id="${vehicle.id}"
           onclick="addVehicleToCompareFromSearch(${vehicle.id})">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="font-semibold">
              ${vehicle.make} ${vehicle.model}
              ${vehicle.is_premium ? '<i class="fas fa-crown text-yellow-400 ml-2 text-xs"></i>' : ''}
            </div>
            <div class="text-xs text-gray-400 mt-1">
              ${vehicle.variant || ''} ${vehicle.year ? '(' + vehicle.year + ')' : ''} • 
              ${vehicle.usable_capacity_kwh}kWh • ${vehicle.max_dc_charging_kw}kW max
            </div>
          </div>
          ${isPremiumLocked ? '<i class="fas fa-lock text-yellow-400 ml-3"></i>' : ''}
        </div>
      </div>
    `
  }).join('')
  
  dropdown.classList.remove('hidden')
}

function hideCompareAutocomplete() {
  document.getElementById('compareAutocompleteDropdown').classList.add('hidden')
}

function addVehicleToCompareFromSearch(vehicleId) {
  addVehicleToCompare(vehicleId)
  document.getElementById('compareVehicleSearch').value = ''
  hideCompareAutocomplete()
}

function addVehicleToCompare(vehicleId) {
  const vehicle = appState.vehicles.find(v => v.id === vehicleId)
  if (!vehicle) return
  
  // Check if premium locked
  if (vehicle.is_premium && appState.currentTier === 'free') {
    showPremiumUpgradeModal(vehicle)
    return
  }
  
  // Check if already added
  if (appState.compareVehicles.find(v => v.id === vehicleId)) {
    showNotification('Vehicle already added', 'warning')
    return
  }
  
  // Check max limit
  if (appState.compareVehicles.length >= 4) {
    showNotification('Maximum 4 vehicles can be compared', 'warning')
    return
  }
  
  appState.compareVehicles.push(vehicle)
  updateCompareVehiclesList()
  updateCompareVehicleCount()
  updateCompareButton()
}

function removeVehicleFromCompare(vehicleId) {
  appState.compareVehicles = appState.compareVehicles.filter(v => v.id !== vehicleId)
  updateCompareVehiclesList()
  updateCompareVehicleCount()
  updateCompareButton()
}

function updateCompareVehiclesList() {
  const container = document.getElementById('selectedCompareVehiclesList')
  
  if (appState.compareVehicles.length === 0) {
    container.innerHTML = '<div class="text-sm text-gray-400 text-center py-4">No vehicles selected yet</div>'
    return
  }
  
  container.innerHTML = appState.compareVehicles.map(vehicle => `
    <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
      <div class="flex-1">
        <div class="font-semibold text-sm">
          ${vehicle.make} ${vehicle.model}
          ${vehicle.is_premium ? '<i class="fas fa-crown text-yellow-400 ml-1 text-xs"></i>' : ''}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          ${vehicle.variant || ''} • ${vehicle.usable_capacity_kwh}kWh
        </div>
      </div>
      <button onclick="removeVehicleFromCompare(${vehicle.id})" class="ml-3 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('')
}

function updateCompareVehicleCount() {
  document.getElementById('compareVehicleCount').textContent = `${appState.compareVehicles.length} vehicle${appState.compareVehicles.length !== 1 ? 's' : ''}`
}

function updateCompareButton() {
  const btn = document.getElementById('startCompareBtn')
  if (appState.compareVehicles.length >= 2) {
    btn.disabled = false
  } else {
    btn.disabled = true
  }
}

async function performComparison() {
  if (appState.compareVehicles.length < 2) {
    showNotification('Please select at least 2 vehicles', 'warning')
    return
  }
  
  const btn = document.getElementById('startCompareBtn')
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Comparing...'
  
  try {
    const vehicleIds = appState.compareVehicles.map(v => v.id)
    
    const response = await axios.post('/api/compare', {
      vehicleIds: vehicleIds,
      chargerPowerKw: appState.chargerPower,
      startSoc: appState.startSoc,
      endSoc: appState.endSoc,
      electricityPrice: appState.electricityPrice
    })
    
    if (response.data.success) {
      displayComparisonResults(response.data.comparisons)
      hideCompareModal()
    }
  } catch (error) {
    console.error('Comparison failed:', error)
    showNotification('Comparison failed', 'error')
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-exchange-alt mr-2"></i>Compare Selected Vehicles'
  }
}

function displayComparisonResults(comparisons) {
  const resultsSection = document.getElementById('comparisonResults')
  const table = document.getElementById('comparisonTable')
  
  // Build table HTML
  let tableHTML = `
    <thead>
      <tr class="border-b border-slate-700">
        <th class="text-left p-4 font-semibold">Vehicle</th>
        <th class="text-center p-4 font-semibold">Charging Speed</th>
        <th class="text-center p-4 font-semibold">Charging Time</th>
        <th class="text-center p-4 font-semibold">Range/Hour</th>
        <th class="text-center p-4 font-semibold">Total Cost</th>
        <th class="text-center p-4 font-semibold">Cost/100km</th>
      </tr>
    </thead>
    <tbody>
  `
  
  comparisons.forEach((comp, index) => {
    const isFirst = index === 0
    const rowClass = isFirst ? 'bg-green-500/10 border-2 border-green-500/30' : 'border-b border-slate-700/50'
    
    tableHTML += `
      <tr class="${rowClass}">
        <td class="p-4">
          <div class="font-semibold">
            ${comp.make} ${comp.model}
            ${isFirst ? '<i class="fas fa-trophy text-yellow-400 ml-2"></i>' : ''}
          </div>
          <div class="text-xs text-gray-400 mt-1">
            ${comp.variant || ''} • ${comp.batteryCapacity}kWh
          </div>
        </td>
        <td class="text-center p-4">
          <div class="text-2xl font-bold tesla-gradient bg-clip-text text-transparent">
            ${comp.chargingSpeedKmh}
          </div>
          <div class="text-xs text-gray-400">km/h</div>
        </td>
        <td class="text-center p-4">
          <div class="text-lg font-bold">${comp.chargingTime}</div>
        </td>
        <td class="text-center p-4">
          <div class="text-lg font-bold">${comp.rangePerHour} km</div>
        </td>
        <td class="text-center p-4">
          <div class="text-lg font-bold text-orange-400">${comp.totalCost}</div>
        </td>
        <td class="text-center p-4">
          <div class="text-lg font-bold text-yellow-400">${comp.costPer100km}</div>
        </td>
      </tr>
    `
  })
  
  tableHTML += '</tbody>'
  table.innerHTML = tableHTML
  
  // Show results and hide calculator
  resultsSection.classList.remove('hidden')
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function hideComparisonResults() {
  document.getElementById('comparisonResults').classList.add('hidden')
  // Optionally clear selected compare vehicles
  appState.compareVehicles = []
  updateCompareVehiclesList()
  updateCompareVehicleCount()
  updateCompareButton()
}

// Export for global access
window.selectTier = selectTier
window.selectVehicleFromAutocomplete = selectVehicleFromAutocomplete
window.showPricingModal = showPricingModal
window.closePremiumUpgradeModal = closePremiumUpgradeModal
window.upgradeToPremium = upgradeToPremium
window.addVehicleToCompareFromSearch = addVehicleToCompareFromSearch
window.removeVehicleFromCompare = removeVehicleFromCompare
