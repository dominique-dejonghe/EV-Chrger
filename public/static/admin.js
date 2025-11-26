// Admin Dashboard JavaScript

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
          <span class="px-3 py-1 bg-${s.status === 'pending' ? 'yellow' : s.status === 'approved' ? 'green' : 'gray'}-100 text-${s.status === 'pending' ? 'yellow' : s.status === 'approved' ? 'green' : 'gray'}-700 text-xs font-semibold rounded-full">
            ${s.status.toUpperCase()}
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
  if (!confirm('Weet je zeker dat je deze suggestie wilt goedkeuren?')) return;
  
  try {
    await axios.post(`/api/admin/suggestions/${id}/approve`);
    alert('Suggestie goedgekeurd!');
    loadSuggestions();
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
async function loadVehicles() {
  try {
    const response = await axios.get('/api/vehicles?tier=all');
    const vehicles = response.data.vehicles || [];
    
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

function showAddVehicleModal() {
  alert('Voertuig toevoegen feature komt binnenkort!\n\nVoor nu kun je handmatig SQL queries gebruiken in de D1 database.');
}

function editVehicle(id) {
  alert('Voertuig bewerken feature komt binnenkort!\n\nVoertuig ID: ' + id);
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
async function loadUsers() {
  try {
    const response = await axios.get('/api/admin/users');
    const users = response.data.users || [];
    
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
              <tr class="hover:bg-gray-50">
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
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  ${u.role !== 'admin' ? `
                    <select onchange="changeUserRole(${u.id}, this.value)" class="text-sm border border-gray-300 rounded px-2 py-1">
                      <option value="">Wijzig role...</option>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="admin">Admin</option>
                    </select>
                  ` : '<span class="text-gray-400">Admin protected</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
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

async function changeUserRole(userId, newRole) {
  if (!newRole) return;
  if (!confirm(`Weet je zeker dat je de role wilt wijzigen naar ${newRole}?`)) return;
  
  try {
    await axios.post(`/api/admin/users/${userId}/role`, { role: newRole });
    alert('User role gewijzigd!');
    loadUsers();
  } catch (error) {
    console.error('Error changing user role:', error);
    alert('Fout bij wijzigen: ' + (error.response?.data?.error || 'Onbekende fout'));
  }
}
