# ⚡ EV Charge Calculator - Premium Tesla-Style Experience

Een geavanceerde elektrische voertuig laadcalculator met een premium Tesla-geïnspireerde interface en freemium businessmodel.

## 🚀 URLs

- **Production**: https://ev-charge-calculator.pages.dev ✨ **LIVE**
- **Latest Deployment**: https://efcc6563.ev-charge-calculator.pages.dev
- **Development**: https://3000-i1702d41shyqjbr05tclm-c81df28e.sandbox.novita.ai
- **GitHub**: https://github.com/[username]/webapp (configure via setup_github_environment)

## ✨ Hoofdfuncties

### Gratis Tier (Free)
- ✅ **73+ populaire EV modellen** - Mainstream elektrische voertuigen (incl. Dacia Spring!)
- ✅ **Searchable dropdown** - Type om te zoeken, geen eindeloos scrollen meer
- ✅ **Basis laadcalculator** - Bereken laadsnelheid in km/uur
- ✅ **DC & AC ondersteuning** - Beide laadtypen ondersteund
- ✅ **Real-world data** - Echte verbruiksgegevens
- ✅ **Tesla-inspired UI** - Premium donker thema met animaties
- ✅ **Waarschuwingen** - Rode waarschuwing wanneer laadpaal vermogen hoger is dan voertuig capaciteit

### Premium Tier (€4,99/maand)
- 🌟 **284+ EV modellen** - Alle merken A-Z met searchable interface
- 🌟 **Advanced search** - Type en filter direct door alle voertuigen (incl. MG Cyberster!)
- 🌟 **Laadcurve analyse** - Gedetailleerde laadcurve grafieken per SOC
- 🌟 **Voertuig vergelijking** - Vergelijk meerdere voertuigen tegelijk
- 🌟 **Berekeningsgeschiedenis** - Bewaar je berekeningen
- 🌟 **Export naar PDF** - Download je resultaten
- 🌟 **SOC slider** - Nauwkeurige berekeningen op basis van batterijniveau

### Pro Tier (€49,99/jaar)
- 💎 **Alle Premium features**
- 💎 **Prioriteit voertuig requests** - Vraag nieuwe modellen aan
- 💎 **Geavanceerde analytics** - Diepgaande inzichten
- 💎 **Vlootbeheer** - Beheer meerdere voertuigen
- 💎 **API toegang** - Integreer in je eigen systemen
- 💎 **White-label optie** - Rebrand de applicatie

## 🚗 Voertuigendatabase

### Totaal: 284 voertuigen
- **Gratis**: 73 populaire mainstream EVs (inclusief Dacia Spring)
- **Premium**: 211 luxe, performance en extended range EVs (inclusief MG Cyberster)
- **Merken**: 39 verschillende automerken

### Merken (Alfabetisch)
Audi, BMW, BYD, Cadillac, Chevrolet, Citroën, Cupra, **Dacia**, Fiat, Fisker, Ford, Genesis, GMC, Honda, Hyundai, Jaguar, Kia, Lexus, Lotus, Lucid, Maserati, Mazda, Mercedes-Benz, MG, Nissan, Opel, Peugeot, Polestar, Porsche, Renault, Rivian, Škoda, Smart, Subaru, Tesla, Toyota, Volkswagen, Volvo, XPeng

### 🆕 Recent Toegevoegd
- **Dacia Spring Electric 65** (Free) - Budget-vriendelijke stadsauto
- **MG Cyberster RWD/AWD** (Premium) - Elektrische roadster

### Voertuigspecificaties
Elk voertuig bevat:
- Merk, model, variant en jaar
- Batterijcapaciteit (totaal en bruikbaar in kWh)
- Gemiddeld verbruik (kWh/100km)
- Max DC laadvermogen (kW)
- Max AC laadvermogen (kW)
- Laadcurve data (JSON met SOC vs kW punten)

## 🎨 Design Features

### Tesla-Geïnspireerd
- **Minimalistisch & Clean** - Focus op essentiële informatie
- **Donker thema** - Premium black/slate gradient achtergrond
- **Glasmorfisme** - Transparante cards met blur effecten
- **Vloeiende animaties** - Fade-in, slide-up, hover effects
- **Premium badges** - Gradient badges voor premium features
- **Responsive design** - Perfect op mobile en desktop

### Visuele Waarschuwingen
- **🔴 Rode waarschuwing** - Wanneer laadpaal vermogen > voertuig max capaciteit
- **Animating pulse effect** - Trekt direct aandacht
- **Duidelijke uitleg** - Toont effectief vermogen vs gevraagd vermogen

## 📊 Data Architectuur

### Database: Cloudflare D1 (SQLite)
```
vehicles          - EV voertuigspecificaties (278 records)
users             - Gebruikersaccounts
calculation_history - Berekeningsgeschiedenis per gebruiker
favorites         - Favoriete voertuigen per gebruiker
comparisons       - Vergelijkingssessies
```

### API Endpoints
```
GET  /api/vehicles              - Lijst alle voertuigen (filtered by tier)
GET  /api/vehicles/:id          - Haal specifiek voertuig op
POST /api/calculate             - Bereken laadsnelheid
POST /api/compare               - Vergelijk meerdere voertuigen
GET  /api/subscription-tiers    - Haal beschikbare abonnementen op
```

## 🛠️ Tech Stack

- **Backend**: Hono (Edge Framework)
- **Frontend**: Vanilla JS + Tailwind CSS
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages + Workers
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **HTTP Client**: Axios

## 🚀 Development

### Lokaal Ontwikkelen
```bash
# Dependencies installeren
npm install

# Database migreren
npm run db:migrate:local

# Database seeden
npm run db:seed

# Build project
npm run build

# Start development server
npm run dev:sandbox

# Of met PM2
pm2 start ecosystem.config.cjs
```

### Database Beheer
```bash
# Migraties toepassen (lokaal)
npm run db:migrate:local

# Database seeden
npm run db:seed

# Database resetten (alle data verwijderen en opnieuw seeden)
npm run db:reset

# Database query's uitvoeren
npm run db:console:local
```

### Port Management
```bash
# Clean port 3000
npm run clean-port

# Test service
npm test  # curl http://localhost:3000
```

## 📦 Deployment

### ✅ Current Deployment Status

**Production URL**: https://ev-charge-calculator.pages.dev  
**Project Name**: ev-charge-calculator  
**Database**: evcharger-production (D1)  
**Database ID**: 97a44002-bd84-47ed-bf4f-afd707d9fd4b  
**Region**: ENAM (East North America)  
**Status**: 🟢 **ACTIVE**

**Deployment Stats**:
- ✅ 394 rows written (284+ vehicles seeded)
- ✅ Database migrations applied successfully
- ✅ PWA functionality enabled
- ✅ Service worker registered
- ✅ App icons for all platforms
- ✅ D1 database bindings configured

### Cloudflare Pages Deployment
```bash
# Build en deploy naar productie
npm run deploy:prod

# Of handmatig:
npm run build
npx wrangler pages deploy dist --project-name ev-charge-calculator --commit-dirty=true
```

### Database Migraties (Productie)
```bash
# Create production database (already done)
npx wrangler d1 create evcharger-production

# Apply migrations to production (already done)
npx wrangler d1 migrations apply evcharger-production --remote

# Seed production database (already done)
npx wrangler d1 execute evcharger-production --remote --file=./seed_full.sql
```

### PWA Features (Deployed)
- ✅ **Manifest.json** - App metadata configured
- ✅ **Service Worker** - Offline caching enabled
- ✅ **App Icons** - 12 sizes (16px to 512px)
- ✅ **Install Prompt** - Beautiful UI for app installation
- ✅ **Shortcuts** - Calculator and Compare quick actions
- ✅ **Theme Color** - Purple gradient (#667eea)
- ✅ **Standalone Mode** - Full-screen app experience

## 🎯 Gebruikershandleiding

### Voor Eindgebruikers

1. **Zoek je voertuig** - Type in het zoekveld om direct te filteren (bijv. "Tesla", "Dacia Spring", "BMW i4")
   - Live search met autocomplete
   - Geen eindeloos scrollen door merken meer
   - Keyboard navigation: gebruik pijltjestoetsen en Enter
   - Kies uit 73+ gratis voertuigen (284+ met premium)
2. **Stel laadvermogen in** - Gebruik de slider of voer het vermogen in (1-350 kW)
3. **Bereken** - Klik op "Calculate Charging Speed"
4. **Bekijk resultaten**:
   - Laadsnelheid in km/uur
   - Effectief laadvermogen (rekening houdend met voertuig max)
   - Laadtijd van 20% tot 80%
   - Bereik per uur laden
5. **Let op waarschuwingen** - Rode melding als laadpaal vermogen hoger is dan voertuig max

### Premium Features Gebruiken

1. **Upgrade** - Klik op "Upgrade" button in navigatie
2. **Kies plan** - Free, Premium (€4,99/m) of Pro (€49,99/j)
3. **Geniet van extra's**:
   - Toegang tot alle 278 voertuigen
   - SOC slider voor nauwkeurige berekeningen
   - Laadcurve grafieken
   - Voertuig vergelijkingen
   - PDF export

## ⚠️ Nog Te Implementeren

### High Priority
- [ ] **Payment integratie** - Stripe of Mollie voor betalingen
- [ ] **User authenticatie** - Login/signup systeem
- [ ] **Calculation history** - Opslaan van eerdere berekeningen
- [x] **Vehicle comparison** - ✅ Side-by-side vergelijking interface (COMPLETED)
- [ ] **PDF export** - Genereer PDF rapporten van berekeningen

### Medium Priority
- [ ] **Meertalige ondersteuning** - Nederlands, Engels, Frans, Duits
- [ ] **Vehicle request systeem** - Gebruikers kunnen nieuwe voertuigen aanvragen
- [ ] **Favorieten systeem** - Save favorite vehicles
- [ ] **Dark/Light mode toggle** - Optie voor licht thema
- [x] **PWA features** - ✅ Offline ondersteuning, installeerbaar (DEPLOYED)

### Low Priority
- [ ] **Admin dashboard** - Beheer voertuigen, gebruikers, abonnementen
- [ ] **API documentatie** - OpenAPI/Swagger docs voor Pro tier
- [ ] **Webhooks** - Voor integraties met andere systemen
- [ ] **Analytics dashboard** - Gebruiksstatistieken voor admins
- [ ] **Email notificaties** - Voor nieuwe voertuigen, updates

## 📈 Aanbevolen Volgende Stappen

1. **Payment integratie toevoegen** - Implementeer Stripe/Mollie voor premium subscriptions
2. **User authenticatie opzetten** - Auth0, Clerk of custom JWT systeem
3. **Calculation history implementeren** - Laat gebruikers hun geschiedenis zien
4. **Vehicle comparison bouwen** - Side-by-side vergelijkingstool
5. **PDF export toevoegen** - Genereer professionele rapporten
6. **Deploy naar Cloudflare Pages** - Zet live productie omgeving op
7. **SEO optimalisatie** - Meta tags, sitemap, structured data
8. **Analytics toevoegen** - Google Analytics of Plausible
9. **A/B testing** - Test verschillende pricing en features
10. **Marketing setup** - Landing page, social media, content strategy

## 🔧 Technische Details

### Charging Speed Berekening
```javascript
// Basis formule
chargingSpeedKmh = (effectivePowerKw / consumptionKwhPer100km) * 100

// Met SOC-based charging curve
effectivePower = min(chargerPower, vehicleMaxPower, chargingCurvePowerAtSOC)
```

### Laadcurve Interpolatie
Voor nauwkeurige berekeningen gebruiken we lineaire interpolatie:
```javascript
// Vind twee punten in curve waar SOC tussen ligt
// Interpoleer power value op basis van exacte SOC
interpolatedPower = currentKw + (powerRange * socOffset / socRange)
```

## 📝 Database Schema

### Vehicles Table
```sql
CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INTEGER,
  battery_capacity_kwh REAL,
  usable_capacity_kwh REAL,
  avg_consumption_kwh_per_100km REAL,
  max_dc_charging_kw REAL,
  max_ac_charging_kw REAL,
  charging_curve_data TEXT,  -- JSON
  is_premium BOOLEAN DEFAULT 0
)
```

## 🤝 Contributing

Momenteel is dit een private project. Voor vragen of suggesties, neem contact op.

## 📄 License

Copyright © 2024 EV Charge Calculator. Alle rechten voorbehouden.

## 🎉 Credits

- **Design inspiratie**: Tesla website
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **Hosting**: Cloudflare Pages + Workers
- **Database**: Cloudflare D1

---

**Built with ⚡ by Dominique - Senior Digital Transformation Leader**

🚗💨 *Bereken hoe snel jouw EV laadt - met stijl!*
