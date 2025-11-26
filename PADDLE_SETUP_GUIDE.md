# 🚀 Paddle Integration Setup Guide

## ✅ Current Status

**Pricing Features**: Updated & Deployed ✅  
**Database**: Ready for Paddle (migration 0009 applied) ✅  
**Production URL**: https://9b5deb38.ev-charge-calculator.pages.dev

---

## 📋 STAP 1: Paddle Account Aanmaken

### A. Registratie
1. Ga naar: **https://www.paddle.com/**
2. Klik **"Get Started"** of **"Sign Up"**
3. Kies **"Paddle Billing"** (nieuw platform, NIET Paddle Classic)
4. Vul bedrijfsgegevens in:
   - Company name: [Je bedrijfsnaam]
   - Email: Dominique.dejonghe@iutum.be
   - Tax ID / VAT number (als van toepassing)

### B. Activeer Sandbox Mode
1. Na registratie, ga naar **Settings** → **Developer**
2. Zet **"Sandbox Mode"** AAN (voor testen)
3. Je kunt later naar production mode switchen

---

## 📋 STAP 2: API Keys Verkrijgen

### A. Authentication Keys
1. Ga naar **Developer Tools** → **Authentication**
2. Kopieer de volgende keys:

```
Vendor ID (Seller ID):     __________________ (bijv. 12345)
API Key (Client-side):     __________________ (bijv. live_xxx of test_xxx)
Secret Key (Server-side):  __________________ (begin GEHEIM te houden!)
```

### B. Webhook Secret
1. Ga naar **Developer Tools** → **Notifications**
2. Klik **"Add Webhook Destination"**
3. Vul in:
   - **URL**: `https://ev-charge-calculator.pages.dev/api/paddle/webhook`
   - **Description**: EV Charge Production Webhooks
   - **Events to send**: Selecteer allemaal (of minimaal):
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
     - `subscription.paused`
     - `subscription.resumed`
4. Klik **"Save"**
5. Kopieer de **Webhook Secret Key**: __________________

---

## 📋 STAP 3: Product Aanmaken

### A. Create Product
1. Ga naar **Catalog** → **Products**
2. Klik **"+ Add Product"**
3. Vul in:
   - **Name**: `EV Charge Premium`
   - **Description**: `Toegang tot 137+ elektrische voertuigen en premium features voor je laadberekeningen.`
   - **Tax Category**: `Standard` (Paddle regelt VAT automatisch)
   - **Image**: (optioneel - upload logo of screenshot)
4. Klik **"Create Product"**

### B. Create Price
1. Bij je nieuwe product, klik **"+ Add Price"**
2. Vul in:
   - **Billing Type**: `Recurring`
   - **Billing Period**: `Monthly`
   - **Price**:
     - **Currency**: EUR (€)
     - **Amount**: `4.99`
   - **Trial Period**: (optioneel - bijv. 7 days free trial)
   - **Name**: `Monthly Premium Subscription`
3. Klik **"Create Price"**
4. **BELANGRIJK**: Kopieer de **Price ID**:
   ```
   Price ID: pri___________________ (bijv. pri_01h8xxxxxxxxxxx)
   ```

---

## 📋 STAP 4: Environment Variables Configureren

### A. Lokale Development (.dev.vars)
```bash
cd /home/user/webapp
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` en vul in:
```env
JWT_SECRET=dev-secret-key-change-in-production-12345

# Paddle Configuration (SANDBOX MODE)
PADDLE_VENDOR_ID=12345                              # Je Vendor ID
PADDLE_API_KEY=test_xxx                             # Client-side key (test_ voor sandbox)
PADDLE_SECRET_KEY=sk_test_xxx                       # Server-side secret
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxx                # Webhook secret
PADDLE_PRICE_ID=pri_01h8xxxxxxxxxxx                 # Je Price ID (€4.99/month)
PADDLE_ENVIRONMENT=sandbox                          # 'sandbox' of 'production'
```

### B. Production Secrets (Cloudflare)
```bash
cd /home/user/webapp

# Set Paddle secrets in Cloudflare
echo "12345" | npx wrangler pages secret put PADDLE_VENDOR_ID --project-name=ev-charge-calculator
echo "test_xxx" | npx wrangler pages secret put PADDLE_API_KEY --project-name=ev-charge-calculator
echo "sk_test_xxx" | npx wrangler pages secret put PADDLE_SECRET_KEY --project-name=ev-charge-calculator
echo "pdl_ntfset_xxx" | npx wrangler pages secret put PADDLE_WEBHOOK_SECRET --project-name=ev-charge-calculator
echo "pri_01h8xxx" | npx wrangler pages secret put PADDLE_PRICE_ID --project-name=ev-charge-calculator
echo "sandbox" | npx wrangler pages secret put PADDLE_ENVIRONMENT --project-name=ev-charge-calculator
```

---

## 📋 STAP 5: Test Payment Methods (Sandbox)

Paddle Sandbox Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

PayPal Test Account:
- Email: `buyer@paddle.com`
- Password: `buyerpassword`

---

## 📋 STAP 6: Implementatie Klaar Voor Deploy

**Status**: Database & features ready ✅  
**Waiting For**: Paddle credentials (keys above)

**Als je de keys hebt, geef ze mij en ik build**:
1. Paddle.js checkout integration
2. Webhook handler (`/api/paddle/webhook`)
3. Subscription management UI
4. Role upgrade/downgrade logic
5. Cancel/resume subscription flows

---

## 🔐 Security Checklist

- [ ] API keys opgeslagen in `.dev.vars` (NIET in git!)
- [ ] `.dev.vars` in `.gitignore` (already done ✅)
- [ ] Production secrets in Cloudflare Pages (encrypted)
- [ ] Webhook signature verification enabled
- [ ] Sandbox mode voor testing
- [ ] Test payments werken (€0.00 in sandbox)

---

## 🎯 Huidige Pricing (Live in Production)

### Gratis Tier
- ✅ 39 populaire EV modellen
- ✅ Basis laadcalculator
- ✅ DC & AC laadondersteuning
- ✅ Real-world verbruiksdata

### Premium Tier (€4.99/maand)
- ✅ Alle Free features
- ✅ 137+ EV modellen (alle merken)
- ✅ Toegang tot premium voertuigen
- ✅ Alle merken en varianten
- ✅ Nieuwe voertuigen eerst beschikbaar
- ✅ Priority support

---

## 📞 Support & Vragen

**Paddle Support**: https://developer.paddle.com/  
**Sandbox Dashboard**: https://sandbox-vendors.paddle.com/  
**Production Dashboard**: https://vendors.paddle.com/

---

**Klaar om verder te gaan?**  
Geef me je Paddle credentials en ik implementeer de checkout flow! 🚀
