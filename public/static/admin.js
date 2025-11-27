// Admin Dashboard JavaScript

// Configure axios to send cookies with all requests
if (typeof axios !== 'undefined') {
  axios.defaults.withCredentials = true
}

// ===== VEHICLE SUGGESTIONS =====
async function loadSuggestions() {
  try {
    const response = await axios.get('/api/admin/suggestions');
    const suggestions = response.data.suggestions || [];
    
    const container = document.getElementById('suggestions-list');
    
    if (suggestions.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p>Geen suggesties gevonden</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = suggestions.map(s => `
      <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-semibold text-lg text-gray-900">${s.vehicle_brand} ${s.vehicle_model}</h3>
            ${s.vehicle_year ? `<p class="text-sm text-gray-600">Jaar: ${s.vehicle_year}</p>` : ''}
            ${s.battery_capacity ? `<p class="text-sm text-gray-600">Batterij: ${s.battery_capacity} kWh</p>` : ''}
          </div>
          <span class="px-3 py-1 bg-${s.status === 'pending' ? 'yellow' : s.status === 'added' ? 'green' : s.status === 'reviewed' ? 'blue' : 'gray'}-100 text-${s.status === 'pending' ? 'yellow' : s.status === 'added' ? 'green' : s.status === 'reviewed' ? 'blue' : 'gray'}-700 text-xs font-semibold rounded-full">
            ${s.status === 'added' ? 'GOEDGEKEURD' : s.status === 'pending' ? 'IN AFWACHTING' : s.status === 'reviewed' ? 'IN BEHANDELING' : 'AFGEWEZEN'}
          </span>
        </div>
        
        ${s.additional_info ? `
          <div class="mb-3 p-3 bg-gray-50 rounded">
            <p class="text-sm text-gray-700">${s.additional_info}</p>
          </div>
        ` : ''}
        
        <div class="flex justify-between items-center text-sm text-gray-500 mb-3">
          <span><i class="fas fa-user mr-1"></i>${s.user_email || 'Anoniem'}</span>
          <span><i class="fas fa-calendar mr-1"></i>${new Date(s.created_at).toLocaleDateString('nl-NL')}</span>
        </div>
        
        ${s.status === 'pending' ? `
          <div class="flex space-x-2">
            <button onclick="approveSuggestion(${s.id})" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <i class="fas fa-check mr-2"></i>Goedkeuren
            </button>
            <button onclick="rejectSuggestion(${s.id})" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <i class="fas fa-times mr-2"></i>Afwijzen
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading suggestions:', error);
    document.getElementById('suggestions-list').innerHTML = `
      <div class="text-center text-red-600 py-8">
        <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
        <p>Fout bij laden van suggesties</p>
      </div>
    `;
  }
}

async function approveSuggestion(id) {
  if (!confirm('Weet je zeker dat je deze suggestie wilt goedkeuren?\n\nHet voertuig wordt toegevoegd aan de database met standaard waardes voor ontbrekende specificaties.')) return;
  
  try {
    const response = await axios.post(`/api/admin/suggestions/${id}/approve`);
    
    let message = 'Suggestie goedgekeurd!';
    if (response.data.note) {
      message += '\n\n' + response.data.note;
    }
    if (response.data.vehicle_id) {
      message += '\n\nVoertuig ID: ' + response.data.vehicle_id;
    }
    
    alert(message);
    loadSuggestions();
    loadVehicles(); // Refresh vehicle list to show new vehicle
  } catch (error) {
    console.error('Error approving suggestion:', error);
    alert('Fout bij goedkeuren: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}

async function rejectSuggestion(id) {
  if (!confirm('Weet je zeker dat je deze suggestie wilt afwijzen?')) return;
  
  try {
    await axios.post(`/api/admin/suggestions/${id}/reject`);
    alert('Suggestie afgewezen');
    loadSuggestions();
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    alert('Fout bij afwijzen: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}

// ===== VEHICLE MANAGEMENT =====
let allVehicles = []; // Store all vehicles for filtering

async function loadVehicles() {
  try {
    const response = await axios.get('/api/vehicles?tier=all');
    allVehicles = response.data.vehicles || [];
    
    renderVehicles(allVehicles);
  } catch (error) {
    console.error('Error loading vehicles:', error);
    document.getElementById('vehicles-list').innerHTML = `
      <div class="text-center text-red-600 py-8">
        <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
        <p>Fout bij laden van voertuigen</p>
      </div>
    `;
  }
}

function renderVehicles(vehicles) {
  const container = document.getElementById('vehicles-list');
  
  if (vehicles.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <i class="fas fa-car text-4xl mb-2"></i>
        <p>Geen voertuigen gevonden</p>
      </div>
    `;
    return;
  }
    
    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voertuig</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batterij</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max DC</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${vehicles.map(v => `
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">${v.make} ${v.model}</div>
                  <div class="text-sm text-gray-500">${v.variant || ''} (${v.year})</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${v.battery_capacity_kwh} kWh
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${v.max_dc_charging_kw} kW
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full ${v.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                    ${v.is_premium ? 'Premium' : 'Free'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onclick="editVehicle(${v.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i> Bewerk
                  </button>
                  <button onclick="deleteVehicle(${v.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i> Verwijder
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
}

function filterVehicles(searchTerm) {
  const filtered = allVehicles.filter(v => {
    const searchLower = searchTerm.toLowerCase();
    return (
      v.make.toLowerCase().includes(searchLower) ||
      v.model.toLowerCase().includes(searchLower) ||
      (v.variant && v.variant.toLowerCase().includes(searchLower)) ||
      v.year.toString().includes(searchLower)
    );
  });
  renderVehicles(filtered);
}

function showAddVehicleModal() {
  alert('Voertuig toevoegen feature komt binnenkort!\n\nVoor nu kun je handmatig SQL queries gebruiken in de D1 database.');
}

async function editVehicle(id) {
  try {
    // Get vehicle details
    const vehicle = allVehicles.find(v => v.id === id);
    if (!vehicle) {
      alert('Voertuig niet gevonden');
      return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'editVehicleModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => {
      if (e.target === modal) closeEditVehicleModal();
    };
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Voertuig Bewerken</h2>
              <p class="text-gray-600">${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}</p>
            </div>
            <button onclick="closeEditVehicleModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>
        
        <form id="editVehicleForm" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <!-- Basic Info -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Merk *</label>
              <input type="text" id="edit_make" value="${vehicle.make}" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input type="text" id="edit_model" value="${vehicle.model}" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Variant</label>
              <input type="text" id="edit_variant" value="${vehicle.variant || ''}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jaar *</label>
              <input type="number" id="edit_year" value="${vehicle.year}" required min="2010" max="2030"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <!-- Battery -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Batterij Capaciteit (kWh) *</label>
              <input type="number" id="edit_battery_capacity" value="${vehicle.battery_capacity_kwh}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bruikbare Capaciteit (kWh) *</label>
              <input type="number" id="edit_usable_capacity" value="${vehicle.usable_capacity_kwh}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <!-- Consumption & Charging -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Verbruik (kWh/100km) *</label>
              <input type="number" id="edit_consumption" value="${vehicle.avg_consumption_kwh_per_100km}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max DC Laden (kW) *</label>
              <input type="number" id="edit_max_dc" value="${vehicle.max_dc_charging_kw}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max AC Laden (kW) *</label>
              <input type="number" id="edit_max_ac" value="${vehicle.max_ac_charging_kw}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <!-- Premium -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tier</label>
              <select id="edit_is_premium" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="0" ${!vehicle.is_premium ? 'selected' : ''}>Free</option>
                <option value="1" ${vehicle.is_premium ? 'selected' : ''}>Premium</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onclick="closeEditVehicleModal()" 
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Annuleren
            </button>
            <button type="submit"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i class="fas fa-save mr-2"></i>Opslaan
            </button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('editVehicleForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveVehicleChanges(id);
    });
    
  } catch (error) {
    console.error('Error opening edit modal:', error);
    alert('Fout bij openen van bewerkingsvenster');
  }
}

function closeEditVehicleModal() {
  const modal = document.getElementById('editVehicleModal');
  if (modal) {
    modal.remove();
  }
}

async function saveVehicleChanges(id) {
  try {
    const data = {
      make: document.getElementById('edit_make').value,
      model: document.getElementById('edit_model').value,
      variant: document.getElementById('edit_variant').value || null,
      year: parseInt(document.getElementById('edit_year').value),
      battery_capacity_kwh: parseFloat(document.getElementById('edit_battery_capacity').value),
      usable_capacity_kwh: parseFloat(document.getElementById('edit_usable_capacity').value),
      avg_consumption_kwh_per_100km: parseFloat(document.getElementById('edit_consumption').value),
      max_dc_charging_kw: parseFloat(document.getElementById('edit_max_dc').value),
      max_ac_charging_kw: parseFloat(document.getElementById('edit_max_ac').value),
      is_premium: parseInt(document.getElementById('edit_is_premium').value)
    };
    
    await axios.put(`/api/admin/vehicles/${id}`, data);
    alert('Voertuig succesvol bijgewerkt!');
    closeEditVehicleModal();
    loadVehicles(); // Refresh list
  } catch (error) {
    console.error('Error saving vehicle:', error);
    alert('Fout bij opslaan: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}

async function deleteVehicle(id) {
  if (!confirm('Weet je zeker dat je dit voertuig wilt verwijderen?')) return;
  
  try {
    await axios.delete(`/api/admin/vehicles/${id}`);
    alert('Voertuig verwijderd!');
    loadVehicles();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    alert('Fout bij verwijderen: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}

// ===== USER MANAGEMENT =====
let allUsers = []; // Store all users for filtering

async function loadUsers() {
  try {
    const response = await axios.get('/api/admin/users');
    allUsers = response.data.users || [];
    
    renderUsers(allUsers);
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('users-list').innerHTML = `
      <div class="text-center text-red-600 py-8">
        <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
        <p>Fout bij laden van users</p>
      </div>
    `;
  }
}

function renderUsers(users) {
  const container = document.getElementById('users-list');
    
    if (users.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-users text-4xl mb-2"></i>
          <p>Geen users gevonden</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gebruiker</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aangemaakt</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${users.map(u => `
              <tr class="hover:bg-gray-50 cursor-pointer" onclick="showUserDetail(${u.id})">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">${u.first_name || ''} ${u.last_name || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${u.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    u.role === 'admin' ? 'bg-red-100 text-red-800' : 
                    u.role === 'premium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'
                  }">
                    ${u.role.toUpperCase()}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${new Date(u.created_at).toLocaleDateString('nl-NL')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onclick="event.stopPropagation()">
                  <button onclick="showUserDetail(${u.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-eye"></i> Details
                  </button>
                  ${u.role !== 'admin' ? `
                    <button onclick="deleteUser(${u.id}, '${u.email}')" class="text-red-600 hover:text-red-900">
                      <i class="fas fa-trash"></i> Verwijder
                    </button>
                  ` : '<span class="text-gray-400">Protected</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
}

function filterUsers(searchTerm) {
  const filtered = allUsers.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.role.toLowerCase().includes(searchLower)
    );
  });
  renderUsers(filtered);
}

async function showUserDetail(userId) {
  try {
    const response = await axios.get(`/api/admin/users/${userId}/detail`);
    const { user, stats, favoriteVehicles, userSuggestions, paymentHistory } = response.data;
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'userDetailModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => {
      if (e.target === modal) closeUserDetailModal();
    };
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">${user.first_name} ${user.last_name}</h2>
              <p class="text-gray-600">${user.email}</p>
            </div>
            <button onclick="closeUserDetailModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Account Info -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Account Informatie</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">User ID:</span>
                <span class="font-medium">${user.id}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Role:</span>
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                  user.role === 'premium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-blue-100 text-blue-800'
                }">
                  ${user.role.toUpperCase()}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Aangemaakt:</span>
                <span class="font-medium">${new Date(user.created_at).toLocaleString('nl-NL')}</span>
              </div>
              ${user.updated_at ? `
                <div class="flex justify-between">
                  <span class="text-gray-600">Laatst bijgewerkt:</span>
                  <span class="font-medium">${new Date(user.updated_at).toLocaleString('nl-NL')}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Usage Statistics -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">
              <i class="fas fa-chart-bar text-blue-600 mr-2"></i>Gebruiksstatistieken
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-blue-900">${stats.totalCalculations}</div>
                <div class="text-sm text-blue-600">Berekeningen</div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-green-900">${stats.totalComparisons}</div>
                <div class="text-sm text-green-600">Vergelijkingen</div>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-yellow-900">${stats.totalFavorites}</div>
                <div class="text-sm text-yellow-600">Favorieten</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-purple-900">${stats.totalSuggestions}</div>
                <div class="text-sm text-purple-600">Suggesties</div>
              </div>
            </div>
            ${stats.lastActivity ? `
              <div class="mt-3 text-sm text-gray-600">
                <i class="fas fa-clock mr-1"></i>
                Laatste activiteit: ${new Date(stats.lastActivity).toLocaleString('nl-NL')}
              </div>
            ` : '<div class="mt-3 text-sm text-gray-500">Geen activiteit</div>'}
          </div>
          
          <!-- Favorite Vehicles -->
          ${favoriteVehicles && favoriteVehicles.length > 0 ? `
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                <i class="fas fa-heart text-red-600 mr-2"></i>Favoriete Voertuigen
              </h3>
              <div class="space-y-2">
                ${favoriteVehicles.map(v => `
                  <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span class="text-sm font-medium">${v.make} ${v.model} ${v.variant || ''}</span>
                    <span class="text-xs text-gray-500">${v.year}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- User Suggestions -->
          ${userSuggestions && userSuggestions.length > 0 ? `
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                <i class="fas fa-lightbulb text-orange-600 mr-2"></i>Ingediende Suggesties
              </h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                ${userSuggestions.map(s => `
                  <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span class="text-sm font-medium">${s.vehicle_brand} ${s.vehicle_model}</span>
                      ${s.vehicle_year ? `<span class="text-xs text-gray-500 ml-1">(${s.vehicle_year})</span>` : ''}
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                      s.status === 'added' ? 'bg-green-100 text-green-800' :
                      s.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      s.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }">
                      ${s.status.toUpperCase()}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- Subscription Info -->
          ${user.role === 'premium' || user.mollie_customer_id ? `
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                <i class="fas fa-crown text-yellow-600 mr-2"></i>Premium Abonnement
              </h3>
              <div class="space-y-2 text-sm">
                ${user.mollie_customer_id ? `
                  <div class="flex justify-between">
                    <span class="text-gray-600">Mollie Customer ID:</span>
                    <span class="font-mono text-xs">${user.mollie_customer_id}</span>
                  </div>
                ` : ''}
                ${user.mollie_subscription_id ? `
                  <div class="flex justify-between">
                    <span class="text-gray-600">Subscription ID:</span>
                    <span class="font-mono text-xs">${user.mollie_subscription_id}</span>
                  </div>
                ` : ''}
                ${user.subscription_status ? `
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                      user.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 
                      'bg-orange-100 text-orange-800'
                    }">
                      ${user.subscription_status === 'active' ? 'Actief' : 'Opgezegd'}
                    </span>
                  </div>
                ` : ''}
                ${user.subscription_end_date ? `
                  <div class="flex justify-between">
                    <span class="text-gray-600">${user.subscription_status === 'canceled' ? 'Verloopt op:' : 'Vernieuwt op:'}</span>
                    <span class="font-medium">${new Date(user.subscription_end_date).toLocaleDateString('nl-NL')}</span>
                  </div>
                ` : ''}
                ${!user.mollie_customer_id && user.role === 'premium' ? `
                  <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p class="text-xs text-yellow-800">
                      <i class="fas fa-exclamation-triangle mr-1"></i>
                      Premium role zonder Mollie subscription (handmatig ingesteld)
                    </p>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Payment History -->
          ${paymentHistory && paymentHistory.length > 0 ? `
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                <i class="fas fa-credit-card text-green-600 mr-2"></i>Betalingsgeschiedenis
              </h3>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                ${paymentHistory.map(p => `
                  <div class="p-3 bg-gray-50 rounded border border-gray-200">
                    <div class="flex justify-between items-start mb-1">
                      <div>
                        <span class="text-sm font-medium">€${p.amount}</span>
                        <span class="text-xs text-gray-500 ml-2">${p.method || 'N/A'}</span>
                      </div>
                      <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                        p.status === 'paid' ? 'bg-green-100 text-green-800' :
                        p.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        p.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }">
                        ${p.status.toUpperCase()}
                      </span>
                    </div>
                    <div class="text-xs text-gray-600">
                      ${p.description || 'Premium Subscription'}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      <i class="fas fa-calendar mr-1"></i>
                      ${new Date(p.createdAt).toLocaleDateString('nl-NL')}
                      ${p.paidAt ? ` - Betaald: ${new Date(p.paidAt).toLocaleDateString('nl-NL')}` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="mt-3 text-xs text-gray-500">
                <i class="fas fa-info-circle mr-1"></i>
                Totaal: ${paymentHistory.length} transacties
              </div>
            </div>
          ` : ''}
          
          <!-- Actions -->
          ${user.role !== 'admin' ? `
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Acties</h3>
              <div class="space-y-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Role Wijzigen</label>
                  <select id="newRoleSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">-- Selecteer nieuwe role --</option>
                    <option value="free" ${user.role === 'free' ? 'selected' : ''}>Free</option>
                    <option value="premium" ${user.role === 'premium' ? 'selected' : ''}>Premium</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                  </select>
                  <button onclick="changeUserRoleFromModal(${user.id})" class="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <i class="fas fa-sync-alt mr-2"></i>Role Bijwerken
                  </button>
                </div>
                
                <button onclick="deleteUserFromModal(${user.id}, '${user.email}')" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <i class="fas fa-trash mr-2"></i>Gebruiker Verwijderen
                </button>
              </div>
            </div>
          ` : `
            <div class="bg-red-50 border border-red-200 rounded p-4">
              <p class="text-sm text-red-800">
                <i class="fas fa-shield-alt mr-2"></i>
                Admin accounts zijn beschermd en kunnen niet worden bewerkt of verwijderd.
              </p>
            </div>
          `}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error loading user detail:', error);
    alert('Fout bij laden van gebruiker details: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}

function closeUserDetailModal() {
  const modal = document.getElementById('userDetailModal');
  if (modal) {
    modal.remove();
  }
}

async function changeUserRoleFromModal(userId) {
  const newRole = document.getElementById('newRoleSelect').value;
  if (!newRole) {
    alert('Selecteer eerst een role');
    return;
  }
  
  if (!confirm(`Weet je zeker dat je de role wilt wijzigen naar ${newRole}?`)) return;
  
  try {
    await axios.post(`/api/admin/users/${userId}/role`, { role: newRole });
    alert('User role gewijzigd!');
    closeUserDetailModal();
    loadUsers();
  } catch (error) {
    console.error('Error changing user role:', error);
    alert('Fout bij wijzigen: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}

async function deleteUser(userId, email) {
  if (!confirm(`Weet je ABSOLUUT ZEKER dat je gebruiker ${email} wilt verwijderen?\n\nDit kan NIET ongedaan worden gemaakt!`)) return;
  
  try {
    await axios.delete(`/api/admin/users/${userId}`);
    alert('Gebruiker verwijderd!');
    loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Fout bij verwijderen: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}

async function deleteUserFromModal(userId, email) {
  if (!confirm(`Weet je ABSOLUUT ZEKER dat je gebruiker ${email} wilt verwijderen?\n\nDit kan NIET ongedaan worden gemaakt!`)) return;
  
  try {
    await axios.delete(`/api/admin/users/${userId}`);
    alert('Gebruiker verwijderd!');
    closeUserDetailModal();
    loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Fout bij verwijderen: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}
