# 🇳🇱 Mollie Integration Setup Guide

## ✅ Waarom Mollie?

- **Nederlands**: Dashboard, support, docs in het Nederlands
- **Goedkoop**: €0.29 + 0.9% per transactie
- **iDEAL + Bancontact**: Native support voor NL/BE
- **Simpele API**: Veel eenvoudiger dan Stripe of Paddle
- **10 min setup**: Sneller dan alternatieven

---

## 📋 STAP 1: Mollie Account Aanmaken (5 min)

### A. Registratie
1. Ga naar: **https://www.mollie.com/nl/signup**
2. Kies: **"Ik wil betalingen ontvangen"**
3. Vul in:
   - **Email**: Dominique.dejonghe@iutum.be
   - **Wachtwoord**: [Kies sterk wachtwoord]
   - **Bedrijfsnaam**: [Je bedrijfsnaam]
   - **Land**: België 🇧🇪
   - **Website**: https://ev-charge-calculator.pages.dev
4. **Bevestig email** en log in

### B. Bedrijfsgegevens (Optioneel voor Test Mode)
- Test mode werkt direct zonder verificatie
- Voor Live mode: vul BTW nummer, bank details, ID verificatie in
- Live activatie duurt ~1 werkdag

---

## 📋 STAP 2: API Keys Verkrijgen (2 min)

### A. Haal Test Key Op
1. In Mollie Dashboard: **Developers** → **API keys**
2. Kopieer **Test API key**:
   ```
   Test API Key: test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### B. Live Key (Later, na verificatie)
1. Voltooi bedrijfsverificatie in dashboard
2. Na goedkeuring verschijnt **Live API key**
3. Wissel `test_` → `live_` key in production

---

## 📋 STAP 3: Webhook Configureren (1 min)

### A. Add Webhook URL
1. Ga naar **Developers** → **Webhooks**
2. Klik **"+ Add webhook"**
3. Vul in:
   - **URL**: `https://ev-charge-calculator.pages.dev/api/mollie/webhook`
   - **Description**: EV Charge Production Webhooks
4. Klik **"Save"**

### B. Webhook Events
Mollie stuurt automatisch events voor:
- `payment.paid` → Betaling succesvol
- `payment.failed` → Betaling mislukt
- `payment.canceled` → Betaling geannuleerd
- `subscription.created` → Abonnement gestart
- `subscription.canceled` → Abonnement gestopt

---

## 📋 STAP 4: Environment Variables

### A. Lokale Development (.dev.vars)
```bash
cd /home/user/webapp
nano .dev.vars
```

Voeg toe:
```env
JWT_SECRET=dev-secret-key-change-in-production-12345

# Mollie Configuration (TEST MODE)
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MOLLIE_ENVIRONMENT=test
```

### B. Production (Cloudflare Secrets)
```bash
# Set Mollie test key (later vervangen door live key)
echo "test_xxxxx" | npx wrangler pages secret put MOLLIE_API_KEY --project-name=ev-charge-calculator
echo "test" | npx wrangler pages secret put MOLLIE_ENVIRONMENT --project-name=ev-charge-calculator
```

---

## 📋 STAP 5: Test Betalingen (Sandbox)

### iDEAL Test
1. Kies "iDEAL" als payment method
2. Kies "Test Bank" in Mollie overlay
3. Klik **"Paid"** voor success of **"Cancel"** voor failure

### Bancontact Test
1. Kies "Bancontact" 
2. Test app opent automatisch
3. Approve payment

### Credit Card Test
- **Success**: 5436031030606378
- **Decline**: 5500000000000004
- CVV: Any 3 digits
- Expiry: Any future date

**Kosten in Test Mode**: €0.00 (gratis testen!)

---

## 🎯 Mollie Pricing

### Per Transactie (€4.99 payment)
```
Prijs:              €4.99
Mollie fee:         €0.29 + (€4.99 × 0.009) = €0.33
Netto ontvangst:    €4.66

BTW (21%):          €4.66 × 0.21 = €0.98
Netto na BTW:       €3.68
```

### Subscription (Recurring)
- **Setup fee**: €0.00
- **Per payment**: €0.29 + 0.9%
- **Frequency**: Monthly (€4.99 per maand)
- **Automatic**: Ja, met mandaat (SEPA Direct Debit voor iDEAL/Bancontact)

---

## 🔐 Security Checklist

- [ ] API key in `.dev.vars` (NIET in git!)
- [ ] `.dev.vars` in `.gitignore` ✅ (already done)
- [ ] Test mode tijdens development ✅
- [ ] Webhook signature verification ✅ (Mollie stuurt signatures)
- [ ] HTTPS voor webhook URL ✅ (Cloudflare Pages = HTTPS)

---

## 📊 Mollie vs Competitors

| Feature | Mollie | Stripe | Paddle |
|---------|--------|--------|--------|
| **Setup tijd** | 10 min | 30 min | 30 min |
| **Nederlands** | ✅ Ja | ❌ Nee | ❌ Nee |
| **iDEAL** | ✅ Native | ✅ Via Stripe | ❌ Nee |
| **Bancontact** | ✅ Native | ✅ Ja | ✅ Ja |
| **Fees (€4.99)** | €0.33 | €0.37 | €0.25 + VAT handling |
| **VAT** | Jij regelt | Jij regelt | Paddle regelt |
| **Dashboard** | 🇳🇱 NL | 🇬🇧 EN | 🇬🇧 EN |
| **Support** | 🇳🇱 NL | 🇬🇧 EN | 🇬🇧 EN |

---

## 🚀 Implementatie Flow

### 1. User Klikt "Upgrade Nu"
```
Frontend → /api/mollie/create-payment
         ← Mollie checkout URL
User → Mollie checkout (iDEAL/Bancontact/Card)
```

### 2. User Betaalt
```
Mollie → Webhook: payment.paid
      → Update user role = 'premium'
      → Email confirmation
User ← Redirect naar /account (success)
```

### 3. Subscription Beheer
```
User → /account → "Abonnement beheren"
    → Mollie customer portal
    → Cancel/update payment method
```

---

## 📞 Support

**Mollie Support**: https://help.mollie.com/  
**Email**: info@mollie.com  
**Telefoon**: +31 20 820 20 70  
**Dashboard**: https://www.mollie.com/dashboard  
**API Docs**: https://docs.mollie.com/

---

## ✅ Next Steps

1. **Maak Mollie account** (5 min)
2. **Geef me test API key** → ik bouw integratie (30 min)
3. **Test betalingen** in sandbox (gratis)
4. **Activeer live mode** (na verificatie)
5. **Vervang test key → live key**

**Status**: Wachtend op Mollie test API key 🔑

---

**Let's go! 🚀**
