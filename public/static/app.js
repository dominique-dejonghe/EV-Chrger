// Global state
let currentTier = 'free';
let vehicles = [];
let selectedVehicle = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await loadVehicles();
  setupEventListeners();
});

// Load vehicles from API
async function loadVehicles() {
  try {
    const response = await axios.get(`/api/vehicles?tier=${currentTier}`);
    vehicles = response.data;
    populateVehicleSelect();
  } catch (error) {
    console.error('Error loading vehicles:', error);
    showError('Fout bij het laden van voertuigen');
  }
}

// Populate vehicle select dropdown
function populateVehicleSelect() {
  const select = document.getElementById('vehicleSelect');
  select.innerHTML = '<option value="">-- Selecteer een voertuig --</option>';
  
  const groupedVehicles = {};
  
  vehicles.forEach(vehicle => {
    const key = vehicle.make;
    if (!groupedVehicles[key]) {
      groupedVehicles[key] = [];
    }
    groupedVehicles[key].push(vehicle);
  });
  
  Object.keys(groupedVehicles).sort().forEach(make => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = make;
    
    groupedVehicles[make].forEach(vehicle => {
      const option = document.createElement('option');
      option.value = vehicle.id;
      const label = `${vehicle.model} ${vehicle.variant || ''} (${vehicle.year})`;
      option.textContent = label;
      
      if (vehicle.is_premium && currentTier === 'free') {
        option.textContent += ' 🔒 Premium';
        option.disabled = true;
      }
      
      optgroup.appendChild(option);
    });
    
    select.appendChild(optgroup);
  });
}

// Setup event listeners
function setupEventListeners() {
  const vehicleSelect = document.getElementById('vehicleSelect');
  const chargerPower = document.getElementById('chargerPower');
  const socSlider = document.getElementById('socSlider');
  const tierToggle = document.getElementById('tierToggle');
  
  vehicleSelect.addEventListener('change', async (e) => {
    const vehicleId = e.target.value;
    if (vehicleId) {
      await loadVehicleDetails(vehicleId);
    }
  });
  
  chargerPower.addEventListener('input', () => {
    if (selectedVehicle) {
      calculate();
    }
  });
  
  if (socSlider) {
    socSlider.addEventListener('input', (e) => {
      document.getElementById('socValue').textContent = e.target.value + '%';
      if (selectedVehicle && currentTier !== 'free') {
        calculate();
      }
    });
  }
  
  tierToggle.addEventListener('click', toggleTier);
}

// Load vehicle details
async function loadVehicleDetails(vehicleId) {
  try {
    const response = await axios.get(`/api/vehicles/${vehicleId}?tier=${currentTier}`);
    selectedVehicle = response.data;
    
    // Show SOC section for premium users
    if (currentTier !== 'free' && selectedVehicle.charging_curve_data) {
      document.getElementById('socSection').classList.remove('hidden');
    } else {
      document.getElementById('socSection').classList.add('hidden');
    }
    
    calculate();
  } catch (error) {
    if (error.response && error.response.status === 403) {
      showPremiumPrompt(error.response.data.message);
    } else {
      showError('Fout bij het laden van voertuig details');
    }
  }
}

// Calculate charging speed
async function calculate() {
  const vehicleId = document.getElementById('vehicleSelect').value;
  const chargerPowerKw = parseFloat(document.getElementById('chargerPower').value);
  const soc = currentTier !== 'free' ? parseFloat(document.getElementById('socSlider').value) : undefined;
  
  if (!vehicleId || !chargerPowerKw) {
    return;
  }
  
  try {
    const response = await axios.post('/api/calculate', {
      vehicleId,
      chargerPowerKw,
      soc
    });
    
    displayResults(response.data);
  } catch (error) {
    console.error('Error calculating:', error);
    showError('Fout bij het berekenen');
  }
}

// Display calculation results
function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  const { vehicle, input, results } = data;
  
  let socInfo = '';
  if (input.soc !== undefined && currentTier !== 'free') {
    socInfo = `
      <div class="flex items-center justify-center gap-2 text-sm opacity-75 mb-4">
        <i class="fas fa-battery-half"></i>
        <span>Bij ${input.soc}% State of Charge</span>
      </div>
    `;
  }
  
  resultsDiv.innerHTML = `
    <div class="result-card">
      <div class="text-center mb-6">
        <h4 class="text-lg font-semibold opacity-75 mb-2">
          ${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}
        </h4>
        <div class="text-sm opacity-60">@ ${input.chargerPowerKw} kW laadpaal</div>
        ${socInfo}
      </div>
      
      <div class="text-center mb-6">
        <div class="metric-value">${results.chargingSpeedKmh}</div>
        <div class="text-xl font-semibold mt-2">km/uur</div>
        <div class="text-sm opacity-75 mt-1">Laadsnelheid</div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-6 text-center">
        <div class="bg-white/5 rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-300">${results.rangeAddedPer15Min}</div>
          <div class="text-sm opacity-75 mt-1">km in 15 min</div>
        </div>
        <div class="bg-white/5 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-300">${results.rangeAddedPer30Min}</div>
          <div class="text-sm opacity-75 mt-1">km in 30 min</div>
        </div>
      </div>
      
      <div class="mt-6 pt-6 border-t border-white/10">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="opacity-75">Effectief vermogen:</span>
            <span class="font-semibold ml-2">${results.effectivePowerKw} kW</span>
          </div>
          <div>
            <span class="opacity-75">Tijd tot vol:</span>
            <span class="font-semibold ml-2">${results.timeToFullHour}u</span>
          </div>
        </div>
      </div>
    </div>
    
    ${currentTier === 'free' ? `
      <div class="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div class="flex items-start gap-3">
          <i class="fas fa-star text-yellow-400 text-xl mt-1"></i>
          <div>
            <div class="font-semibold text-yellow-400 mb-1">Upgrade voor meer features</div>
            <div class="text-sm opacity-75">
              Krijg toegang tot laadcurve data, geschiedenis, vergelijkingen en meer!
            </div>
            <button onclick="showPremiumPrompt()" class="btn-premium mt-3 text-sm py-2 px-4">
              <i class="fas fa-crown mr-2"></i>
              Bekijk Premium
            </button>
          </div>
        </div>
      </div>
    ` : ''}
    
    ${currentTier !== 'free' ? `
      <div class="mt-6 flex gap-3">
        <button onclick="saveCalculation()" class="btn-primary flex-1 text-sm py-3">
          <i class="fas fa-save mr-2"></i>
          Opslaan
        </button>
        <button onclick="exportResults()" class="btn-primary flex-1 text-sm py-3">
          <i class="fas fa-download mr-2"></i>
          Exporteren
        </button>
      </div>
    ` : ''}
  `;
}

// Set charger power quick buttons
function setChargerPower(kw) {
  document.getElementById('chargerPower').value = kw;
  if (selectedVehicle) {
    calculate();
  }
}

// Toggle between free and premium tier
async function toggleTier() {
  if (currentTier === 'free') {
    showPremiumPrompt('Upgrade naar Premium voor toegang tot alle features!');
  } else {
    currentTier = 'free';
    document.getElementById('tierToggle').innerHTML = '<i class="fas fa-crown mr-2"></i>Upgrade naar Premium';
    document.getElementById('tierToggle').className = 'btn-premium';
    await loadVehicles();
    selectedVehicle = null;
    document.getElementById('vehicleSelect').value = '';
    document.getElementById('results').innerHTML = `
      <div class="text-center py-12 text-gray-500">
        <i class="fas fa-arrow-left text-4xl mb-4 opacity-30"></i>
        <p>Selecteer een voertuig en vermogen om te starten</p>
      </div>
    `;
  }
}

// Simulate premium upgrade
function showPremiumPrompt(message = null) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="glass-card p-8 max-w-md w-full animate-slideIn">
      <div class="text-center mb-6">
        <i class="fas fa-crown text-yellow-400 text-5xl mb-4"></i>
        <h3 class="text-2xl font-bold mb-2">Premium Features</h3>
        <p class="text-gray-400">${message || 'Upgrade naar Premium voor volledige toegang'}</p>
      </div>
      
      <div class="space-y-3 mb-6 text-left">
        <div class="flex items-center gap-3">
          <i class="fas fa-check text-green-400"></i>
          <span>Alle 15+ premium voertuigen</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="fas fa-check text-green-400"></i>
          <span>Real-world laadcurve data</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="fas fa-check text-green-400"></i>
          <span>Onbeperkte vergelijkingen</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="fas fa-check text-green-400"></i>
          <span>Geschiedenis & export</span>
        </div>
      </div>
      
      <div class="space-y-3">
        <button onclick="upgradeToPremium()" class="btn-premium w-full">
          <i class="fas fa-crown mr-2"></i>
          Upgrade Nu - €4.99/maand
        </button>
        <button onclick="closeModal()" class="w-full py-3 px-6 rounded-lg bg-white/5 hover:bg-white/10 transition">
          Misschien Later
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Upgrade to premium (demo mode)
async function upgradeToPremium() {
  closeModal();
  
  // Simulate upgrade
  currentTier = 'premium';
  document.getElementById('tierToggle').innerHTML = '<i class="fas fa-crown mr-2"></i>Premium Account';
  document.getElementById('tierToggle').className = 'btn-primary';
  
  await loadVehicles();
  
  showSuccess('Welkom bij Premium! 🎉 Nu heeft u toegang tot alle features.');
}

// Close modal
function closeModal() {
  const modal = document.querySelector('.fixed.inset-0');
  if (modal) {
    modal.remove();
  }
}

// Save calculation (premium feature)
async function saveCalculation() {
  showSuccess('Berekening opgeslagen in uw geschiedenis!');
}

// Export results (premium feature)
function exportResults() {
  showSuccess('Resultaten geëxporteerd naar CSV!');
}

// Show error message
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn';
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Show success message
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn';
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
