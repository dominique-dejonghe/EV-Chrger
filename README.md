# ⚡ EV Charge Calculator - Premium Tesla-Style Experience

Een geavanceerde elektrische voertuig laadcalculator met een premium Tesla-geïnspireerde interface, user authentication, admin dashboard, en **Mollie betalingsintegratie**.

## 🚀 URLs

- **Production**: https://ev-charge-calculator.pages.dev ✨ **LIVE**
- **Development**: https://3000-i1702d41shyqjbr05tclm-c81df28e.sandbox.novita.ai
- **GitHub**: https://github.com/[username]/webapp (configure via setup_github_environment)

## ✨ Hoofdfuncties

### 🔐 Authenticatie & Account Beheer
- ✅ **User registratie** - Maak account met email, naam
- ✅ **JWT authenticatie** - Veilige token-based login
- ✅ **Account instellingen** - Bekijk en beheer je account
- ✅ **Subscription management** - Bekijk abonnementsstatus, opzeggen mogelijk
- ✅ **Role-based access** - Free, Premium, Admin roles

### 💳 Mollie Betalingsintegratie (NIEUW!)
- ✅ **iDEAL betaling** - Nederlandse betaalmethode direct geïntegreerd
- ✅ **Recurring subscriptions** - Automatische maandelijkse betalingen €4.99
- ✅ **Mollie webhooks** - Real-time payment status updates
- ✅ **Subscription management** - Opzeggen mogelijk, toegang blijft tot periode-einde
- ✅ **Test mode** - Volledig geteste integratie met Mollie test bank

### 🔒 Gratis Tier (Free)
- ✅ **39 populaire EV modellen** - Mainstream elektrische voertuigen
- ✅ **Searchable dropdown** - Type om te zoeken, geen eindeloos scrollen meer
- ✅ **Basis laadcalculator** - Bereken laadsnelheid in km/uur
- ✅ **DC & AC ondersteuning** - Beide laadtypen ondersteund
- ✅ **Real-world data** - Echte verbruiksgegevens
- ✅ **Tesla-inspired UI** - Premium donker thema met animaties
- ✅ **Waarschuwingen** - Rode waarschuwing wanneer laadpaal vermogen hoger is dan voertuig capaciteit
- ✅ **Vehicle suggestions** - Vraag nieuwe voertuigen aan

### 🌟 Premium Tier (€4,99/maand via Mollie)
- 🌟 **137+ EV modellen** - Alle merken A-Z met searchable interface
- 🌟 **Alle premium voertuigen** - Toegang tot luxury, performance en extended range EVs
- 🌟 **Advanced search** - Type en filter direct door alle voertuigen
- 🌟 **Geen beperkingen** - Volledige toegang tot de database
- 🌟 **Priority support** - Snellere response op vragen
- 🌟 **Nieuwe voertuigen eerst** - Eerste toegang tot nieuwe toevoegingen

### 🔧 Admin Dashboard (NIEUW!)
- 👑 **Vehicle suggestions management** - Review, approve of reject aanvragen
- 👑 **User management** - Bekijk alle users, verander roles (free/premium/admin)
- 👑 **Vehicle management** - Create, edit, delete voertuigen
- 👑 **Stats dashboard** - Totaal users, premium users, pending suggestions
- 👑 **Admin badge** - Rood admin badge in UI voor herkenning

## 🗄️ Data Architectuur

### Database: Cloudflare D1 (SQLite)
```
users                   - Gebruikersaccounts met role-based access
  ├── id, email, password (bcrypt)
  ├── first_name, last_name
  ├── role (free/premium/admin)
  ├── mollie_customer_id, mollie_subscription_id
  ├── subscription_status (active/canceled)
  └── subscription_end_date

vehicles                - EV voertuigspecificaties (137+ records)
  ├── make, model, variant, year
  ├── battery_capacity_kwh, usable_capacity_kwh
  ├── avg_consumption_kwh_per_100km
  ├── max_dc_charging_kw, max_ac_charging_kw
  ├── charging_curve_data (JSON)
  └── is_premium (boolean)

vehicle_suggestions     - User aanvragen voor nieuwe voertuigen
  ├── user_id, make, model, variant
  ├── status (pending/approved/rejected)
  └── reason, admin_notes
```

### API Endpoints

#### 🌐 Public Routes
```
GET  /                          - Landing page
GET  /app                       - Calculator applicatie
GET  /api/vehicles              - Lijst voertuigen (filtered by tier)
POST /api/calculate             - Bereken laadsnelheid
GET  /api/subscription-tiers    - Haal beschikbare abonnementen op
```

#### 🔐 Authenticated Routes
```
GET  /account                   - Account settings pagina
POST /api/suggestions           - Dien voertuig suggestie in
POST /api/mollie/create-payment - Start Mollie checkout
POST /api/mollie/cancel-subscription - Zeg abonnement op
```

#### 👑 Admin Routes (requires admin role)
```
GET  /admin                                  - Admin dashboard
GET  /api/admin/suggestions                  - Haal alle suggesties op
POST /api/admin/suggestions/:id/approve      - Keur suggestie goed
POST /api/admin/suggestions/:id/reject       - Wijs suggestie af
GET  /api/admin/users                        - Haal alle users op
POST /api/admin/users/:id/role               - Verander user role
DELETE /api/admin/vehicles/:id               - Verwijder voertuig
```

#### 💳 Mollie Webhooks
```
POST /api/mollie/webhook        - Receive payment status updates
```

## 🛠️ Tech Stack

- **Backend**: Hono (Cloudflare Workers Edge Framework)
- **Frontend**: Vanilla JavaScript + Tailwind CSS
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT tokens (httpOnly cookies)
- **Password Hashing**: bcrypt
- **Payment Provider**: Mollie (iDEAL, Bancontact, Credit Cards)
- **Deployment**: Cloudflare Pages + Workers
- **Icons**: Font Awesome 6
- **HTTP Client**: Axios
- **Process Manager**: PM2 (development)

## 🚀 Development

### Lokaal Ontwikkelen

```bash
# Dependencies installeren
npm install

# Environment variables configureren
cp .dev.vars.example .dev.vars
# Pas MOLLIE_API_KEY aan met je test/live key

# Database migreren
npm run db:migrate:local

# Database seeden (optional)
npm run db:seed

# Build project
npm run build

# Start development server met PM2
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# Test de service
curl http://localhost:3000
```

### Database Beheer

```bash
# Migraties toepassen (lokaal)
npm run db:migrate:local

# Migraties toepassen (productie)
npm run db:migrate:prod

# Database query's uitvoeren (lokaal)
npx wrangler d1 execute evcharger-production --local --command="SELECT * FROM users"

# Database query's uitvoeren (productie)
npx wrangler d1 execute evcharger-production --command="SELECT COUNT(*) FROM vehicles"

# Database resetten (alle data verwijderen en opnieuw migreren)
npm run db:reset
```

### Port Management

```bash
# Clean port 3000
npm run clean-port
# Of: fuser -k 3000/tcp 2>/dev/null || true

# Test service
npm test  # curl http://localhost:3000
```

## 💳 Mollie Setup

### Test Mode (Development)

1. **Maak Mollie account**: https://www.mollie.com/dashboard/signup
2. **API Key ophalen**: Dashboard → Developers → API keys → Test mode
3. **Voeg toe aan .dev.vars**:
   ```env
   MOLLIE_API_KEY=test_xJrpqnGhjvxQ3fgdyNcM6c3VvxySrA
   MOLLIE_ENVIRONMENT=test
   ```
4. **Webhook configureren**:
   - URL: `https://your-domain.pages.dev/api/mollie/webhook`
   - Events: Payment Link API
   - Payload: Snapshot

### Production Mode

1. **Verifieer je business**: Mollie dashboard → Settings → Verification
2. **Switch naar Live mode**: Dashboard → Live mode API key
3. **Update Cloudflare secrets**:
   ```bash
   echo "your_live_api_key" | npx wrangler secret put MOLLIE_API_KEY
   ```
4. **Test live payments**: Gebruik echte betaalmethoden

### Test Payments

**Mollie Test Bank Credentials** (voor iDEAL test):
- Bank: Test Bank
- Status selecteren: Paid / Canceled / Failed

Geen echte betaalgegevens nodig in test mode!

## 📦 Deployment

### ✅ Current Deployment Status

**Production URL**: https://ev-charge-calculator.pages.dev  
**Project Name**: ev-charge-calculator  
**Database**: evcharger-production (D1)  
**Status**: 🟢 **ACTIVE**

### Cloudflare Pages Deployment

```bash
# 1. Setup Cloudflare API key
# Call setup_cloudflare_api_key tool first

# 2. Build project
npm run build

# 3. Apply database migrations to production
npm run db:migrate:prod

# 4. Deploy to Cloudflare Pages
npm run deploy:prod

# 5. Configure Mollie API key as secret
echo "your_mollie_api_key" | npx wrangler secret put MOLLIE_API_KEY --project-name ev-charge-calculator
```

### Environment Variables (Production)

**Cloudflare Secrets** (configured via wrangler):
- `JWT_SECRET` - Secret key voor JWT tokens
- `MOLLIE_API_KEY` - Mollie Live API key

**In wrangler.jsonc**:
```jsonc
{
  "name": "ev-charge-calculator",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "evcharger-production",
      "database_id": "97a44002-bd84-47ed-bf4f-afd707d9fd4b"
    }
  ]
}
```

## 🎯 Gebruikershandleiding

### Voor Eindgebruikers

1. **Account aanmaken**:
   - Klik op "Login/Signup" in navigatie
   - Vul email, voornaam, achternaam, wachtwoord in
   - Bevestig registratie

2. **Voertuig zoeken**:
   - Type in het zoekveld om direct te filteren
   - Kies uit 39 gratis voertuigen (137+ met premium)
   - 🔒 Premium voertuigen tonen lock icon

3. **Upgrade naar Premium**:
   - Klik op "Upgrade" button
   - Kies Premium tier (€4.99/maand)
   - Betaal via Mollie (iDEAL, Bancontact, Credit Card)
   - Direct toegang na betaling

4. **Abonnement beheren**:
   - Ga naar Account settings
   - Bekijk abonnementsstatus
   - Opzeggen mogelijk (toegang blijft tot periode-einde)

5. **Voertuig aanvragen**:
   - Mis je een voertuig? Vraag het aan!
   - Admin beoordeelt suggesties
   - Premium users krijgen priority

### Voor Admins

1. **Admin Dashboard**:
   - Toegang via user dropdown → "Admin Dashboard"
   - Overzicht van stats (users, premium, suggestions)

2. **Vehicle Suggestions Beheren**:
   - Tab: "Vehicle Suggestions"
   - Review pending suggesties
   - Approve of Reject met notes

3. **Users Beheren**:
   - Tab: "User Management"
   - Bekijk alle users
   - Change roles: free ↔ premium ↔ admin

4. **Vehicles Beheren**:
   - Tab: "Vehicles Management"
   - Bekijk alle voertuigen
   - Delete vehicles indien nodig

## ✅ Implemented Features

### Phase 1 - Core Features ✅
- [x] Vehicle database (137+ EVs)
- [x] Charging speed calculator
- [x] Tesla-inspired UI
- [x] Responsive design
- [x] SOC-based calculations
- [x] Tier-based access (Free/Premium)

### Phase 2 - Authentication & Auth ✅
- [x] User registration & login (JWT)
- [x] Role-based access control (Free/Premium/Admin)
- [x] Account settings page
- [x] Vehicle suggestion system
- [x] Authentication middleware
- [x] Protected routes

### Phase 3 - Admin & Payments ✅
- [x] Admin dashboard with stats
- [x] Vehicle suggestions management
- [x] User management (change roles)
- [x] Vehicle management (delete)
- [x] **Mollie payment integration**
- [x] **Recurring subscriptions**
- [x] **Subscription management (cancel)**
- [x] **Webhook handlers**

## ⚠️ Nog Te Implementeren

### High Priority
- [ ] **Cron job** - Automatisch downgrade users na subscription expiry
- [ ] **Email notificaties** - Bevestiging na betaling, renewal reminders
- [ ] **Laadcurve visualisatie** - Grafiek van SOC vs kW
- [ ] **Voertuig vergelijking** - Side-by-side comparison tool
- [ ] **PDF export** - Download berekeningen

### Medium Priority
- [ ] **Calculation history** - Opslaan van eerdere berekeningen
- [ ] **Favorieten systeem** - Save favorite vehicles
- [ ] **Meertalige ondersteuning** - NL, EN, FR, DE
- [ ] **Dark/Light mode toggle** - Optie voor licht thema

### Low Priority
- [ ] **API documentatie** - OpenAPI/Swagger docs
- [ ] **Analytics dashboard** - Gebruiksstatistieken
- [ ] **A/B testing** - Verschillende pricing experimenteren

## 📈 Aanbevolen Volgende Stappen

1. **✅ Mollie payments testen** - Test payments met Mollie test bank
2. **Deploy naar productie** - Push naar Cloudflare Pages met live Mollie key
3. **Cron job opzetten** - Downgrade expired subscriptions automatisch
4. **Email notificaties** - SendGrid/Mailgun integreren voor confirmaties
5. **Laadcurve grafieken** - Chart.js gebruiken voor visuele curves
6. **SEO optimalisatie** - Meta tags, sitemap, structured data
7. **Analytics** - Plausible of Google Analytics toevoegen
8. **Marketing** - Landing page verbeteren, social media

## 🔧 Technische Details

### Charging Speed Berekening
```javascript
// Basis formule
chargingSpeedKmh = (effectivePowerKw / consumptionKwhPer100km) * 100

// Met SOC-based charging curve
effectivePower = min(chargerPower, vehicleMaxPower, chargingCurvePowerAtSOC)
```

### Mollie Payment Flow
```
1. User clicks "Upgrade Nu"
2. Frontend: POST /api/mollie/create-payment
3. Backend: Create Mollie customer (if needed)
4. Backend: Create first payment (€4.99)
5. Backend: Return checkout URL
6. Frontend: Redirect to Mollie checkout
7. User: Complete payment
8. Mollie: Send webhook to /api/mollie/webhook
9. Backend: Verify payment, create subscription
10. Backend: Upgrade user to premium role
11. User: Redirected to /account?payment=success
```

### Authentication Flow
```
1. User submits registration form
2. Backend: Hash password with bcrypt (10 rounds)
3. Backend: Insert user into database (role=free)
4. Backend: Generate JWT token (24h expiry)
5. Backend: Set httpOnly cookie
6. Frontend: Store user in window.currentUser
7. Middleware: Verify JWT on protected routes
8. Middleware: Check role for admin routes
```

## 📝 Database Migrations

### Applied Migrations
- `0001_initial_schema.sql` - Users & vehicles tables
- `0002_add_tier_fields.sql` - is_premium field
- `0003_add_auth_fields.sql` - password & timestamps
- `0004_add_suggestions.sql` - vehicle_suggestions table
- `0005_seed_vehicles.sql` - 137 EV records
- `0006_seed_more_vehicles.sql` - Extra vehicles
- `0007_add_admin_role.sql` - Admin role support
- `0008_add_admin_role.sql` - Updated CHECK constraint
- `0010_add_mollie_fields.sql` - Mollie payment fields ✨ **NEW**

## 🤝 Contributing

Momenteel is dit een private project. Voor vragen of suggesties, neem contact op.

## 📄 License

Copyright © 2024 EV Charge Calculator. Alle rechten voorbehouden.

## 🎉 Credits

- **Design inspiratie**: Tesla website
- **Payment provider**: Mollie (Dutch payment gateway)
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter, SF Pro Display)
- **Hosting**: Cloudflare Pages + Workers
- **Database**: Cloudflare D1 (SQLite)

---

**Built with ⚡ by Dominique - Senior Digital Transformation Leader**

🚗💨 *Bereken hoe snel jouw EV laadt - met stijl!*
