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
          <p>No suggestions found</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = suggestions.map(s => `
      <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-semibold text-lg text-gray-900">${s.vehicle_brand} ${s.vehicle_model}</h3>
            ${s.vehicle_year ? `<p class="text-sm text-gray-600">Year: ${s.vehicle_year}</p>` : ''}
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
              <i class="fas fa-check mr-2"></i>Approve
            </button>
            <button onclick="rejectSuggestion(${s.id})" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <i class="fas fa-times mr-2"></i>Reject
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
        <p>Error loading suggestions</p>
      </div>
    `;
  }
}

async function approveSuggestion(id) {
  if (!confirm('Are you sure you want to approve this suggestion?\n\nThe vehicle will be added to the database with default values for missing specifications.')) return;
  
  try {
    const response = await axios.post(`/api/admin/suggestions/${id}/approve`);
    
    let message = 'Suggestion approved!';
    if (response.data.note) {
      message += '\n\n' + response.data.note;
    }
    if (response.data.vehicle_id) {
      message += '\n\nVehicle ID: ' + response.data.vehicle_id;
    }
    
    alert(message);
    loadSuggestions();
    loadVehicles(); // Refresh vehicle list to show new vehicle
  } catch (error) {
    console.error('Error approving suggestion:', error);
    alert('Error approving: ' + (error.response?.data?.error || 'Unknown error'));
  }
}

async function rejectSuggestion(id) {
  if (!confirm('Are you sure you want to reject this suggestion?')) return;
  
  try {
    await axios.post(`/api/admin/suggestions/${id}/reject`);
    alert('Suggestion rejected');
    loadSuggestions();
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    alert('Error rejecting: ' + (error.response?.data?.error || 'Unknown error'));
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
        <p>Error loading vehicles</p>
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
        <p>No vehicles found</p>
      </div>
    `;
    return;
  }
    
    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batterij</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max DC</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button onclick="deleteVehicle(${v.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i> Delete
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
  alert('Add vehicle feature coming soon!\n\nVoor nu kun je handmatig SQL queries gebruiken in de D1 database.');
}

async function editVehicle(id) {
  try {
    // Get vehicle details
    const vehicle = allVehicles.find(v => v.id === id);
    if (!vehicle) {
      alert('Vehicle not found');
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
              <h2 class="text-2xl font-bold text-gray-900">Edit Vehicle</h2>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Make *</label>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input type="number" id="edit_year" value="${vehicle.year}" required min="2010" max="2030"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <!-- Battery -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Battery Capacity (kWh) *</label>
              <input type="number" id="edit_battery_capacity" value="${vehicle.battery_capacity_kwh}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Usable Capacity (kWh) *</label>
              <input type="number" id="edit_usable_capacity" value="${vehicle.usable_capacity_kwh}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <!-- Consumption & Charging -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Consumption (kWh/100km) *</label>
              <input type="number" id="edit_consumption" value="${vehicle.avg_consumption_kwh_per_100km}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max DC Charging (kW) *</label>
              <input type="number" id="edit_max_dc" value="${vehicle.max_dc_charging_kw}" required step="0.1" min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max AC Charging (kW) *</label>
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
              Cancel
            </button>
            <button type="submit"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i class="fas fa-save mr-2"></i>Save
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
    alert('Error opening edit window');
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
    alert('Vehicle updated successfully!');
    closeEditVehicleModal();
    loadVehicles(); // Refresh list
  } catch (error) {
    console.error('Error saving vehicle:', error);
    alert('Error saving: ' + (error.response?.data?.error || 'Unknown error'));
  }
}

async function deleteVehicle(id) {
  if (!confirm('Are you sure you want to delete this vehicle?')) return;
  
  try {
    await axios.delete(`/api/admin/vehicles/${id}`);
    alert('Vehicle deleted!');
    loadVehicles();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    alert('Error deleting: ' + (error.response?.data?.error || 'Unknown error'));
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
        <p>Error loading users</p>
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
          <p>No users found</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      <i class="fas fa-trash"></i> Delete
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
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
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
                <span class="text-gray-600">Created:</span>
                <span class="font-medium">${new Date(user.created_at).toLocaleString('nl-NL')}</span>
              </div>
              ${user.updated_at ? `
                <div class="flex justify-between">
                  <span class="text-gray-600">Last updated:</span>
                  <span class="font-medium">${new Date(user.updated_at).toLocaleString('nl-NL')}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Usage Statistics -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">
              <i class="fas fa-chart-bar text-blue-600 mr-2"></i>Usage Statistics
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-blue-900">${stats.totalCalculations}</div>
                <div class="text-sm text-blue-600">Calculations</div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-green-900">${stats.totalComparisons}</div>
                <div class="text-sm text-green-600">Comparisons</div>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-yellow-900">${stats.totalFavorites}</div>
                <div class="text-sm text-yellow-600">Favorites</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-purple-900">${stats.totalSuggestions}</div>
                <div class="text-sm text-purple-600">Suggestions</div>
              </div>
            </div>
            ${stats.lastActivity ? `
              <div class="mt-3 text-sm text-gray-600">
                <i class="fas fa-clock mr-1"></i>
                Last activity: ${new Date(stats.lastActivity).toLocaleString('nl-NL')}
              </div>
            ` : '<div class="mt-3 text-sm text-gray-500">No activity</div>'}
          </div>
          
          <!-- Favorite Vehicles -->
          ${favoriteVehicles && favoriteVehicles.length > 0 ? `
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                <i class="fas fa-heart text-red-600 mr-2"></i>Favorite Vehicles
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
                <i class="fas fa-lightbulb text-orange-600 mr-2"></i>Ingediende Suggestions
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
                <i class="fas fa-crown text-yellow-600 mr-2"></i>Premium Subscription
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
                <i class="fas fa-credit-card text-green-600 mr-2"></i>Payment History
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
                      ${p.paidAt ? ` - Paid: ${new Date(p.paidAt).toLocaleDateString('nl-NL')}` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="mt-3 text-xs text-gray-500">
                <i class="fas fa-info-circle mr-1"></i>
                Total: ${paymentHistory.length} transactions
              </div>
            </div>
          ` : ''}
          
          <!-- Actions -->
          ${user.role !== 'admin' ? `
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
              <div class="space-y-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Change Role</label>
                  <select id="newRoleSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">-- Select new role --</option>
                    <option value="free" ${user.role === 'free' ? 'selected' : ''}>Free</option>
                    <option value="premium" ${user.role === 'premium' ? 'selected' : ''}>Premium</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                  </select>
                  <button onclick="changeUserRoleFromModal(${user.id})" class="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <i class="fas fa-sync-alt mr-2"></i>Update Role
                  </button>
                </div>
                
                <button onclick="deleteUserFromModal(${user.id}, '${user.email}')" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <i class="fas fa-trash mr-2"></i>User Deleteen
                </button>
              </div>
            </div>
          ` : `
            <div class="bg-red-50 border border-red-200 rounded p-4">
              <p class="text-sm text-red-800">
                <i class="fas fa-shield-alt mr-2"></i>
                Admin accounts are protected and cannot be edited or deleted.
              </p>
            </div>
          `}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error loading user detail:', error);
    alert('Error loading user details: ' + (error.response?.data?.error || 'Unknown error'));
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
    alert('Please select a role first');
    return;
  }
  
  if (!confirm(`Are you sure you want to change the role to ${newRole}?`)) return;
  
  try {
    await axios.post(`/api/admin/users/${userId}/role`, { role: newRole });
    alert('User role changed!');
    closeUserDetailModal();
    loadUsers();
  } catch (error) {
    console.error('Error changing user role:', error);
    alert('Error changing: ' + (error.response?.data?.error || 'Unknown error'));
  }
}

async function deleteUser(userId, email) {
  if (!confirm(`Are you ABSOLUTELY SURE you want to delete user ${email}   ?\n\nThis CANNOT be undone!`)) return;
  
  try {
    await axios.delete(`/api/admin/users/${userId}`);
    alert('User deleted!');
    loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting: ' + (error.response?.data?.error || 'Unknown error'));
  }
}

async function deleteUserFromModal(userId, email) {
  if (!confirm(`Are you ABSOLUTELY SURE you want to delete user ${email}   ?\n\nThis CANNOT be undone!`)) return;
  
  try {
    await axios.delete(`/api/admin/users/${userId}`);
    alert('User deleted!');
    closeUserDetailModal();
    loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting: ' + (error.response?.data?.error || 'Unknown error'));
  }
}

// ===== ADD USER MODAL =====
function showAddUserModal() {
  const modal = document.createElement('div');
  modal.id = 'addUserModal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.onclick = (e) => {
    if (e.target === modal) closeAddUserModal();
  };
  
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onclick="event.stopPropagation()">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Create New User</h2>
          <p class="text-gray-600 text-sm mt-1">Fill in all fields to add a user</p>
        </div>
        <button onclick="closeAddUserModal()" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      
      <form id="addUserForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" id="newUserEmail" required
            placeholder="user@example.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input type="text" id="newUserFirstName" required
              placeholder="John"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input type="text" id="newUserLastName" required
              placeholder="Doe"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <input type="password" id="newUserPassword" required
            placeholder="Min. 8 karakters"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          <p class="text-xs text-gray-500 mt-1">Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select id="newUserRole" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button type="button" onclick="closeAddUserModal()" 
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <i class="fas fa-user-plus mr-2"></i>Create User
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle form submission
  document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await createNewUser();
  });
}

function closeAddUserModal() {
  const modal = document.getElementById('addUserModal');
  if (modal) {
    modal.remove();
  }
}

async function createNewUser() {
  try {
    const email = document.getElementById('newUserEmail').value;
    const firstName = document.getElementById('newUserFirstName').value;
    const lastName = document.getElementById('newUserLastName').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    
    // Validate password
    if (password.length < 8) {
      alert('Password moet minimaal 8 karakters bevatten');
      return;
    }
    
    const data = {
      email,
      firstName,
      lastName,
      password,
      role
    };
    
    await axios.post('/api/admin/users', data);
    alert(`User created successfully with role: ${role}!`);
    closeAddUserModal();
    loadUsers(); // Refresh user list
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.response?.status === 409) {
      alert('A user with this email address already exists!');
    } else {
      alert('Error creating: ' + (error.response?.data?.error || 'Unknown error'));
    }
  }
}
