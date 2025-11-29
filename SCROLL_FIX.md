# 🎯 Scroll Fix - Van Clunky naar Smooth

## ❌ Oude Methode (Clunky):
```javascript
// Problem: Two-step process with delay
element.scrollIntoView({ behavior: 'smooth', block: 'center' })
setTimeout(() => {
  window.scrollBy({ top: offset, behavior: 'smooth' })
}, 300)
```

**Issues:**
- ⏱️ 300ms delay → jerky movement
- 🎢 Two separate animations → feels broken
- 🎯 `block: 'center'` ignores offset → fights with scrollBy
- 📱 Mobile inconsistency

## ✅ Nieuwe Methode (Smooth):
```javascript
// Solution: Single direct calculation
const rect = element.getBoundingClientRect()
const scrollTop = window.pageYOffset || document.documentElement.scrollTop
const targetPosition = rect.top + scrollTop + offset

window.scrollTo({
  top: targetPosition,
  behavior: 'smooth'
})
```

**Benefits:**
- ⚡ Instant calculation → no delays
- 🎯 Single smooth animation → feels native
- 📐 Precise positioning → pixel-perfect
- 📱 Consistent across devices

## 📊 Offset Updates:
| Step | Old Offset | New Offset | Reason |
|------|-----------|-----------|---------|
| Vehicle Search | -100px | -200px | More headroom |
| SOC Sliders | -50px | -150px | Better visibility |
| Charger Power | -50px | -150px | Consistent spacing |
| Charging Time | -50px | -150px | Clear view |
| Electricity Price | -50px | -150px | Perfect center |
| Calculate Button | -100px | -200px | Prominent position |

## 🧪 Test Results:
- ✅ Smooth single motion
- ✅ No jerky double-scroll
- ✅ Precise element centering
- ✅ Responsive on mobile
- ✅ Fast & fluid UX
