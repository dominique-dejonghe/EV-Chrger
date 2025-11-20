# EV Charge Calculator ⚡

Een premium Tesla-geïnspireerde EV laadsnelheid calculator met freemium business model.

## 🚀 URLs

- **Development**: https://3000-i1702d41shyqjbr05tclm-c81df28e.sandbox.novita.ai
- **GitHub**: *Te deployen*
- **Production**: *Te deployen naar Cloudflare Pages*

## ✨ Features

### 🆓 FREE Tier
- ✅ **39 populaire EV modellen** - Meest gebruikte elektrische voertuigen
- ✅ **Basis laadsnelheid calculator** - Bereken km/h laadsnelheid
- ✅ **DC & AC laadondersteuning** - Beide laadtypes
- ✅ **Real-world verbruiksdata** - Realistische berekeningen
- ✅ **Responsive Tesla-design** - Premium dark theme UI
- ✅ **Mobiel-vriendelijk** - Werkt op alle devices

### 👑 PREMIUM Tier (€4.99/maand)
- ✅ Alle FREE features
- ✅ **150 EV modellen** - Alle merken en varianten
- ✅ **Laadcurve analyse** - Zie exacte laadsnelheid per SOC%
- ✅ **Voertuigvergelijking** - Vergelijk meerdere EV's tegelijk
- ✅ **Berekeningsgeschiedenis** - Bewaar je calculaties
- ✅ **Export naar PDF** - Download je resultaten

### 💼 PRO Tier (€49.99/jaar)
- ✅ Alle PREMIUM features
- ✅ **Prioriteit voertuigverzoeken** - Vraag nieuwe modellen aan
- ✅ **Geavanceerde analytics** - Diepgaande inzichten
- ✅ **Vlootbeheer** - Beheer meerdere voertuigen
- ✅ **API access** - Integreer in je systemen
- ✅ **White-label optie** - Eigen branding mogelijk

## 🎨 Design

Tesla-geïnspireerde aesthetiek:
- **Dark theme** met gradient accenten
- **Glasmorfisme effecten** voor premium uitstraling
- **Smooth animaties** en transitions
- **Inter font family** voor moderne typografie
- **Responsive grid layouts** voor alle schermformaten

## 📊 Data Architectuur

### Database (Cloudflare D1)

**Tables:**
- `vehicles` - 150 EV modellen met specs (batterij, verbruik, laadsnelheid)
- `users` - Gebruikersaccounts en subscription tiers
- `calculation_history` - Opgeslagen berekeningen (premium feature)
- `favorites` - Favoriete voertuigen per gebruiker
- `comparisons` - Voertuigvergelijkingen (premium feature)

**Vehicle Data:**
- Merk, model, variant, jaar
- Batterijcapaciteit (totaal & bruikbaar)
- Gemiddeld verbruik (kWh/100km)
- Max DC & AC laadvermogen
- Charging curve data (JSON)
- Premium/Free status

### API Endpoints

```
GET  /api/vehicles?tier=free|premium|pro     - Haal voertuigen op
GET  /api/vehicles/:id                       - Specifiek voertuig
POST /api/calculate                          - Bereken laadsnelheid
POST /api/compare                            - Vergelijk voertuigen
GET  /api/subscription-tiers                 - Abonnement info
```

## 🔧 Tech Stack

- **Backend**: Hono (lightweight edge framework)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla JS + TailwindCSS
- **Hosting**: Cloudflare Pages/Workers
- **Build**: Vite
- **Icons**: Font Awesome 6
- **Charts**: Canvas API (charging curves)

## 🚀 Development

### Lokaal Starten

```bash
# Database migrations
npm run db:migrate:local

# Seed database
npm run db:seed

# Build
npm run build

# Start met PM2
pm2 start ecosystem.config.cjs

# Of direct
npm run dev:sandbox
```

### Database Beheer

```bash
# Reset database
npm run db:reset

# SQL console (local)
npm run db:console:local

# SQL console (production)
npm run db:console:prod
```

## 📈 Business Model

### Freemium Strategie

**Free Tier:**
- 39 populaire modellen (Tesla, VW, Hyundai, Kia, Renault, etc.)
- Basis functionaliteit voor hobbyisten
- Advertisement voor premium features

**Premium Tier (€4.99/maand):**
- Alle 150 voertuigen (Porsche, Mercedes, BMW, Lucid, etc.)
- Laadcurve analyse
- Vergelijkingstool
- Target: Serieuze EV eigenaren

**Pro Tier (€49.99/jaar):**
- API access
- Fleet management
- White-label
- Target: Bedrijven, leasemaatschappijen, laadpaaloperators

### Conversie Strategie

1. **Free users zien premium badge** op locked vehicles
2. **"Upgrade" CTA's** op strategic locations
3. **Feature hints** - toon blurred premium features
4. **Social proof** - "Join 10,000+ premium users"
5. **Limited time offers** - eerste maand korting

## 🎯 Roadmap

### ✅ Fase 1: Core MVP (COMPLETED)
- [x] Database setup met 150 voertuigen
- [x] Basis calculator
- [x] Freemium tier systeem
- [x] Tesla-geïnspireerde UI
- [x] Laadcurve visualisatie

### 📋 Fase 2: Enhanced Features (TODO)
- [ ] User authentication (Cloudflare Access)
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Calculation history persistence
- [ ] Vehicle comparison tool (full implementation)
- [ ] PDF export functionaliteit
- [ ] Multi-language support (EN, FR, DE)

### 📋 Fase 3: Advanced Features (TODO)
- [ ] Mobile app (PWA)
- [ ] API voor developers
- [ ] Fleet management dashboard
- [ ] Route planner met laadstops
- [ ] Real-time laadpaal beschikbaarheid
- [ ] White-label reseller platform

## 🌍 Deployment

### Cloudflare Pages

```bash
# Build
npm run build

# Deploy to production
npm run deploy:prod

# Eerst Cloudflare API key setup required
```

### Environment Variables

**Local Development:**
```env
# .dev.vars (niet committen)
STRIPE_SECRET_KEY=sk_test_...
```

**Production:**
```bash
# Cloudflare secrets
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name evcharger
```

## 📱 Screenshots

### Calculator Interface
- Dark theme met glasmorfisme
- Smooth sliders voor kW en SOC
- Real-time berekeningen

### Results Display
- Grote cijfers voor km/h snelheid
- Details: effectief vermogen, laadtijd, bereik/uur
- Laadcurve grafiek (premium)

### Pricing Modal
- Drie tier cards met features
- Popular badge op Premium tier
- Smooth upgrade flow

## 🔐 Security

- **Input validation** op alle API endpoints
- **SQL injection prevention** via prepared statements
- **CORS** configured voor API security
- **Rate limiting** (toe te voegen)
- **API authentication** voor Pro tier

## 📊 Analytics Mogelijkheden

### Metrics to Track:
- Daily/Monthly Active Users
- Free → Premium conversie rate
- Most popular vehicles
- Average charging power used
- Geographic distribution
- Feature usage statistics

## 🤝 Contributing

Voertuig toevoegen:
1. Voeg specs toe aan `seed_full.sql`
2. Zorg voor accurate data (EV Database, manufacturer specs)
3. Test calculation accuracy
4. Submit PR

## 📝 License

Proprietary - Alle rechten voorbehouden

## 📞 Contact

Voor vragen, feature requests, of partnerships:
- Email: dominique@evcharger.app (voorbeeld)
- Website: [Te definiëren]

---

**Built with ⚡ by Dominique Dejonghe**

*Powered by Cloudflare Edge Network for lightning-fast global performance*
