# 🎯 Iframe Loading Fix - Calculator Instead of Landing Page

## ❌ Problem:
De iframe toonde de **landing page** in plaats van de **calculator** (`/app`).

**Symptoom:** 
- Demo tooltip probeert te scrollen naar `#vehicleSearch`, `#chargerPowerRange`, etc.
- Deze elementen bestaan NIET op de landing page
- Result: Scrollt naar niets, blijft op landing page

## 🔍 Root Causes:

### 1. **Relative URL probleem**
```html
<!-- OLD: Relative URL -->
<iframe src="/app"></iframe>
```
**Issue:** Browser interpreteert `/app` als relatief t.o.v. huidige pagina `/static/demo`
**Result:** Probeert `/static/app` te laden (bestaat niet) → valt terug naar `/`

### 2. **Iframe load timing**
```javascript
// OLD: Scroll immediately
scrollIframeToElement(selector)  // Iframe nog niet geladen!
```
**Issue:** `postMessage` wordt gestuurd voordat iframe content klaar is
**Result:** Bericht gaat verloren, geen scroll gebeurt

## ✅ Solution:

### Fix 1: **Dynamic iframe URL**
```javascript
// NEW: Use window.location.origin
iframe.src = window.location.origin + '/app'
```
**Benefits:**
- ✅ Works op ALLE deployments (production, preview, localhost)
- ✅ Absoluut pad: `https://xxx.pages.dev/app`
- ✅ Geen relatieve pad-problemen

### Fix 2: **Iframe load check**
```javascript
// NEW: Wait for load
let iframeLoaded = false

iframe.addEventListener('load', () => {
  console.log('Iframe loaded:', iframe.src)
  iframeLoaded = true
})

// In scrollIframeToElement:
if (!iframeLoaded) {
  setTimeout(() => scrollIframeToElement(selector), 500)
  return
}
```
**Benefits:**
- ✅ Wacht tot iframe volledig geladen is
- ✅ Retry logic met 500ms delay
- ✅ Console logging voor debugging

## 🧪 Test URLs:

**Production Demo:**
- 🔗 https://ev-charge-calculator.pages.dev/demo

**Latest Deploy:**
- 🔗 https://845f1c14.ev-charge-calculator.pages.dev/demo

## ✅ Expected Behavior:
1. Demo page laadt
2. Iframe laadt `/app` (calculator) automatisch
3. Console toont: `"Iframe loaded: https://xxx.pages.dev/app"`
4. Klik "Next" → Smooth scroll naar vehicle search
5. Elke step scrollt naar het **juiste veld** in de calculator

## 🚫 No Longer Happening:
- ❌ Landing page in iframe
- ❌ Scroll naar niet-bestaande elementen
- ❌ Clunky double-scroll
- ❌ Relative URL path errors
