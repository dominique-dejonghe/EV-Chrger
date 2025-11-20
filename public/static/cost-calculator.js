// ============================================
// COST CALCULATOR
// ============================================

let costState = {
  selectedVehicle: null,
  chargerPowerKw: 11,
  electricityPrice: 0.30,
  socStart: 20,
  socTarget: 80,
  chargingEfficiency: 0.95
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupCostCalculator()
})

function setupCostCalculator() {
  // Load default values
  document.getElementById('costChargerPower').value = costState.chargerPowerKw
  document.getElementById('costElectricityPrice').value = costState.electricityPrice
  document.getElementById('costSocStart').value = costState.socStart
  document.getElementById('costSocTarget').value = costState.socTarget
  document.getElementById('costEfficiency').value = (costState.chargingEfficiency * 100).toFixed(0)
  
  // Update displays
  document.getElementById('costSocStartValue').textContent = costState.socStart
  document.getElementById('costSocTargetValue').textContent = costState.socTarget
  document.getElementById('costEfficiencyValue').textContent = (costState.chargingEfficiency * 100).toFixed(0)
  
  // Event listeners
  document.getElementById('costChargerPower').addEventListener('input', (e) => {
    costState.chargerPowerKw = parseFloat(e.target.value) || 11
  })
  
  document.getElementById('costElectricityPrice').addEventListener('input', (e) => {
    costState.electricityPrice = parseFloat(e.target.value) || 0.30
  })
  
  document.getElementById('costSocStart').addEventListener('input', (e) => {
    costState.socStart = parseInt(e.target.value)
    document.getElementById('costSocStartValue').textContent = costState.socStart
  })
  
  document.getElementById('costSocTarget').addEventListener('input', (e) => {
    costState.socTarget = parseInt(e.target.value)
    document.getElementById('costSocTargetValue').textContent = costState.socTarget
  })
  
  document.getElementById('costEfficiency').addEventListener('input', (e) => {
    const value = parseInt(e.target.value)
    costState.chargingEfficiency = value / 100
    document.getElementById('costEfficiencyValue').textContent = value
  })
  
  // Vehicle search (reuse from main app)
  setupVehicleSearch('costVehicleSearch', selectVehicleForCost)
  
  // Calculate button
  document.getElementById('calculateCostBtn').addEventListener('click', calculateCost)
}

function selectVehicleForCost(vehicle) {
  costState.selectedVehicle = vehicle
  document.getElementById('costSelectedVehicle').textContent = 
    `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`
  document.getElementById('costSelectedVehicleDisplay').classList.remove('hidden')
}

async function calculateCost() {
  if (!costState.selectedVehicle) {
    showNotification('Please select a vehicle first', 'warning')
    return
  }
  
  const vehicle = costState.selectedVehicle
  const {
    chargerPowerKw,
    electricityPrice,
    socStart,
    socTarget,
    chargingEfficiency
  } = costState
  
  // Validate SOC range
  if (socTarget <= socStart) {
    showNotification('Target SOC must be higher than start SOC', 'warning')
    return
  }
  
  // Calculate energy needed
  const socDelta = (socTarget - socStart) / 100
  const energyNeeded = vehicle.usable_capacity_kwh * socDelta
  
  // Calculate time to charge
  const effectivePower = Math.min(chargerPowerKw, vehicle.max_dc_charging_kw || chargerPowerKw)
  const chargingTimeHours = energyNeeded / (effectivePower * chargingEfficiency)
  const chargingTimeMinutes = Math.round(chargingTimeHours * 60)
  
  // Calculate energy drawn from grid
  const energyDrawn = energyNeeded / chargingEfficiency
  
  // Calculate cost
  const totalCost = energyDrawn * electricityPrice
  
  // Calculate per 100km cost
  const consumption = vehicle.avg_consumption_kwh_per_100km
  const costPer100km = (consumption / chargingEfficiency) * electricityPrice
  
  // Calculate range added
  const rangeAdded = (energyNeeded / consumption) * 100
  
  // Calculate SOC % per hour
  const socPerHour = ((effectivePower * chargingEfficiency) / vehicle.usable_capacity_kwh) * 100
  
  // Display results
  displayCostResults({
    vehicleName: `${vehicle.make} ${vehicle.model}`,
    energyNeeded,
    energyDrawn,
    totalCost,
    chargingTimeMinutes,
    costPer100km,
    rangeAdded,
    socPerHour,
    effectivePower,
    socStart,
    socTarget
  })
}

function displayCostResults(results) {
  document.getElementById('costResultsSection').classList.remove('hidden')
  document.getElementById('costResultsSection').scrollIntoView({ behavior: 'smooth' })
  
  // Main cost
  document.getElementById('totalCost').textContent = `€${results.totalCost.toFixed(2)}`
  
  // Vehicle name
  document.getElementById('costVehicleName').textContent = results.vehicleName
  
  // Details
  document.getElementById('energyNeeded').textContent = `${results.energyNeeded.toFixed(1)} kWh`
  document.getElementById('energyDrawn').textContent = `${results.energyDrawn.toFixed(1)} kWh`
  document.getElementById('costChargingTime').textContent = `${Math.floor(results.chargingTimeMinutes / 60)}h ${results.chargingTimeMinutes % 60}min`
  document.getElementById('costPer100km').textContent = `€${results.costPer100km.toFixed(2)}`
  document.getElementById('rangeAdded').textContent = `${Math.round(results.rangeAdded)} km`
  document.getElementById('socPerHour').textContent = `${results.socPerHour.toFixed(1)}%/h`
  
  // Efficiency loss
  const lossPercentage = ((results.energyDrawn - results.energyNeeded) / results.energyNeeded * 100).toFixed(1)
  document.getElementById('efficiencyLoss').textContent = `${lossPercentage}% verlies`
}

// Simplified vehicle search for cost calculator
async function setupVehicleSearch(inputId, onSelect) {
  const searchInput = document.getElementById(inputId)
  let vehicles = []
  
  // Load vehicles
  try {
    const response = await axios.get('/api/vehicles?tier=premium')
    vehicles = response.data.vehicles
  } catch (error) {
    console.error('Failed to load vehicles:', error)
  }
  
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase()
    if (term.length < 2) return
    
    const filtered = vehicles.filter(v => {
      const searchStr = `${v.make} ${v.model} ${v.variant || ''}`.toLowerCase()
      return searchStr.includes(term)
    }).slice(0, 10)
    
    // Show simple dropdown
    console.log('Filtered vehicles:', filtered)
    // TODO: Implement dropdown UI or reuse from main app
  })
}

// Utility: show notification
function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }
  
  const notification = document.createElement('div')
  notification.className = `fixed top-20 right-4 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg z-50`
  notification.innerHTML = `
    <div class="flex items-center space-x-3">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.opacity = '0'
    notification.style.transition = 'opacity 0.3s'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}
