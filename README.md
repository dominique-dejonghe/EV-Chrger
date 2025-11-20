# EV Charger Pro ⚡

Premium elektrische voertuig laadsnelheid calculator met Tesla-geïnspireerde interface en freemium business model.

## 🚀 Live Demo

- **Sandbox URL**: https://3000-i1702d41shyqjbr05tclm-c81df28e.sandbox.novita.ai
- **Status**: ✅ Active

## 📋 Project Overzicht

EV Charger Pro is een geavanceerde web applicatie die EV-rijders helpt om te berekenen hoeveel kilometers per uur hun voertuig laadt aan verschillende laadpalen. De app gebruikt real-world laadcurve data en biedt een premium Tesla-achtige gebruikerservaring.

### ✨ Hoofdfuncties

**Gratis Tier (€0/maand):**
- ✅ Toegang tot 8 populaire EV modellen (Tesla Model 3, VW ID.3, Hyundai Ioniq 5, etc.)
- ✅ Basis laadsnelheid berekeningen (km/uur)
- ✅ Vergelijk tot 2 voertuigen tegelijk
- ✅ Real-time berekeningen
- ✅ Responsive mobile-first design

**Premium Tier (€4.99/maand):**
- ⭐ Alle 20+ premium voertuigen (Tesla Model S/X, Porsche Taycan, Audi e-tron GT, etc.)
- ⭐ Real-world laadcurve data met SOC (State of Charge) slider
- ⭐ Onbeperkte voertuig vergelijkingen
- ⭐ Geschiedenis van berekeningen opslaan
- ⭐ Export naar CSV
- ⭐ Geavanceerde analytics

**Pro Tier (€9.99/maand):**
- 👑 Alles van Premium +
- 👑 API toegang voor integraties
- 👑 Bulk berekeningen
- 👑 Prioriteit support
- 👑 Aangepaste voertuigen toevoegen

## 🎨 Design Features

### Tesla-geïnspireerde UI/UX
- **Dark Mode First**: Moderne donkere interface met gradient backgrounds
- **Glass Morphism**: Frosted glass effecten voor premium uitstraling
- **Smooth Animations**: Subtiele transitions en hover effecten
- **Inter Font**: Clean typografie matching Tesla's design language
- **Premium Badge System**: Visuele indicators voor premium features
- **Responsive Grid Layout**: Optimaal op desktop, tablet en mobile

### Color Palette
- Primary: Blue gradient (#3b82f6 → #2563eb)
- Premium: Gold gradient (#ffd700 → #ffed4e)
- Background: Dark gradient (#0a0a0a → #1a1a1a)
- Glass cards: rgba(30, 30, 30, 0.8) met blur effects

## 🏗️ Technische Architectuur

### Tech Stack
- **Frontend**: HTML5 + TailwindCSS + Vanilla JavaScript
- **Backend**: Hono framework (lightweight web framework)
- **Runtime**: Cloudflare Workers (edge computing)
- **Database**: Cloudflare D1 (SQLite-based distributed database)
- **Deployment**: Cloudflare Pages
- **Dev Server**: Vite + Wrangler
- **Process Manager**: PM2

### Database Schema

**Tables:**
1. **vehicles** - EV voertuig database (20+ voertuigen)
   - make, model, variant, year
   - battery_capacity_kwh, usable_capacity_kwh
   - avg_consumption_kwh_per_100km
   - max_dc_charging_kw, max_ac_charging_kw
   - charging_curve_data (JSON with SOC curve)
   - is_premium (boolean)

2. **users** - User accounts
   - email, name
   - subscription_tier (free/premium/pro)
   - subscription_expires_at

3. **calculation_history** - Saved calculations (premium)
4. **favorites** - User favorite vehicles (premium)
5. **comparisons** - Vehicle comparison sessions (premium)

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm
- PM2 (pre-installed in sandbox)

### Installation & Running

```bash
# Clone repository
cd /home/user/webapp

# Install dependencies (already done)
npm install

# Initialize database
npm run db:migrate:local
npm run db:seed

# Build project
npm run build

# Start development server with PM2
pm2 start ecosystem.config.cjs

# Test
curl http://localhost:3000
curl http://localhost:3000/api/vehicles?tier=free
```

### Available Scripts

```bash
npm run build              # Build for production
npm run dev:sandbox        # Start local dev server
npm run db:migrate:local   # Apply database migrations
npm run db:seed           # Seed database with vehicles
npm run db:reset          # Reset database completely
npm run clean-port        # Kill port 3000
```

## 📊 API Endpoints

### GET /api/vehicles
Haal alle voertuigen op (gefilterd op tier)
```bash
curl http://localhost:3000/api/vehicles?tier=free
```

### GET /api/vehicles/:id
Haal specifiek voertuig op
```bash
curl http://localhost:3000/api/vehicles/1?tier=free
```

### POST /api/calculate
Bereken laadsnelheid
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": 1, "chargerPowerKw": 50, "soc": 20}'
```

Response:
```json
{
  "vehicle": {
    "make": "Tesla",
    "model": "Model 3",
    "variant": "Standard Range Plus"
  },
  "input": {
    "chargerPowerKw": 50,
    "soc": 20
  },
  "results": {
    "chargingSpeedKmh": 344.8,
    "effectivePowerKw": 50,
    "rangeAddedPer15Min": 86,
    "rangeAddedPer30Min": 172,
    "rangeAddedPerHour": 345,
    "timeToFullHour": 1.2
  }
}
```

### POST /api/compare
Vergelijk meerdere voertuigen (max 2 voor free tier)
```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"vehicleIds": [1, 2], "chargerPowerKw": 150}'
```

## 🎯 Business Model - Freemium Strategy

### Conversion Funnel
1. **Awareness**: Gratis toegang tot 8 populaire voertuigen
2. **Engagement**: Real-time calculator met directe resultaten
3. **Desire**: Premium features locked achter paywall (blur effect)
4. **Action**: Upgrade CTA's op strategische momenten

### Monetization Features
- **Feature Gating**: Premium voertuigen, laadcurves, geschiedenis
- **Usage Limits**: Max 2 vergelijkingen voor free users
- **Premium Upsells**: Contextual upgrade prompts
- **Subscription Tiers**: Clear value proposition per tier

### Revenue Streams
- Monthly subscriptions (€4.99 Premium, €9.99 Pro)
- Annual discounts (potential future)
- API access for Pro tier
- White-label licensing (potential future)

## 🚀 Deployment

### Local Development (Current)
✅ Running on PM2 with hot reload
✅ Database: Local D1 SQLite
✅ URL: https://3000-i1702d41shyqjbr05tclm-c81df28e.sandbox.novita.ai

### Production Deployment (Cloudflare Pages)

```bash
# Setup Cloudflare API
# Call setup_cloudflare_api_key first

# Build
npm run build

# Deploy to Cloudflare Pages
npm run deploy:prod

# You'll get:
# - Production: https://evcharger.pages.dev
# - Branch: https://main.evcharger.pages.dev
```

## 📈 Future Enhancements

### Phase 2 Features
- [ ] User authentication (email/social login)
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Mobile app (PWA)
- [ ] Multi-language support (EN, FR, DE)
- [ ] Vehicle request system
- [ ] Community ratings & reviews

### Phase 3 Features
- [ ] Route planning with charging stops
- [ ] Real-time charger availability (API integration)
- [ ] Cost calculator (electricity prices)
- [ ] Carbon footprint calculator
- [ ] Fleet management dashboard

## 🎨 Screenshots

### Calculator Interface
- Modern dark theme with gradient backgrounds
- Real-time calculations
- Quick preset buttons (7.4kW, 11kW, 22kW, 50kW, 150kW)
- SOC slider for premium users

### Pricing Comparison
- Side-by-side feature comparison
- Clear value proposition
- Premium badge highlighting
- One-click upgrade flow

## 📝 Notes

### Calculation Logic
```javascript
// Basic formula
chargingSpeedKmh = (chargerPowerKw / avgConsumptionKwhPer100km) * 100

// With charging curve (premium)
effectivePower = min(chargerPowerKw, vehicleMaxPower, curveMaxPowerAtSOC)
chargingSpeedKmh = (effectivePower / avgConsumptionKwhPer100km) * 100
```

### Charging Curve Data
Real-world data voor accurate schattingen:
- Peak charging window (0-40% SOC)
- Tapering phase (40-80% SOC)
- Trickle charging (80-100% SOC)

## 🤝 Contributing

Bijdragen zijn welkom! Zie de issues voor open taken.

## 📄 License

Proprietary - All rights reserved

## 👤 Author

Developed with ⚡ for EV drivers

---

**Status**: ✅ Development Complete | 🚀 Ready for Production Deployment
**Last Updated**: 2024-11-20
**Version**: 1.0.0
