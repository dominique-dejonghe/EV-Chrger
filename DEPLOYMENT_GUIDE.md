# 🚀 Deployment Guide

## ✅ Fixed Issues

### Authentication Cookie Problem
**Problem**: After login, users were immediately redirected back to the landing page.

**Root Cause**: 
- All `fetch()` calls to `/api/auth/*` endpoints were missing `credentials: 'include'`
- This prevented cookies from being sent/received, breaking authentication flow
- JWT_SECRET environment variable was missing

**Fix Applied**:
1. Added `credentials: 'include'` to ALL auth-related fetch calls:
   - `/api/auth/me` (checkAuth function)
   - `/api/auth/login` (login form)
   - `/api/auth/register` (registration form)
   - `/api/auth/logout` (logout functions)

2. Created `.dev.vars` file with JWT_SECRET for local development

3. Git commit: `4f2d3e9` - "FIX: Add credentials: 'include' to all fetch calls for cookie authentication"

## 🔐 JWT_SECRET Configuration

### For Local Development (Already Configured ✅)
The `.dev.vars` file is already configured with JWT_SECRET:
```bash
JWT_SECRET=6kW5ApdDJOuCibwG0cooPgXWG8jDp0I5a9t4LRuAhvM=
```

This file is:
- ✅ In `.gitignore` (never committed to Git)
- ✅ Automatically loaded by `wrangler pages dev`
- ✅ Used by PM2 via ecosystem.config.cjs

### For Production Deployment (REQUIRES MANUAL SETUP)

**Option 1: Hosted Deployment (Genspark Platform)**
If using `gsk hosted deploy`, you need to set the JWT_SECRET as a secret:

```bash
# Set JWT_SECRET as encrypted secret (write-only, never readable back)
JWT_SECRET_VALUE="6kW5ApdDJOuCibwG0cooPgXWG8jDp0I5a9t4LRuAhvM="
gsk hosted secret_put --name JWT_SECRET --value "$JWT_SECRET_VALUE"

# Verify it's set (only lists names, not values)
gsk hosted secret_list

# Then deploy
gsk hosted deploy
```

**Option 2: Cloudflare Pages Dashboard**
1. Go to Cloudflare Dashboard → Workers & Pages → ev-charge-calculator
2. Navigate to Settings → Environment Variables
3. Add production variable:
   - Name: `JWT_SECRET`
   - Value: `6kW5ApdDJOuCibwG0cooPgXWG8jDp0I5a9t4LRuAhvM=`
   - Environment: `Production`
4. Click "Save"

**Option 3: Wrangler CLI (BYOK Deploy)**
If deploying to your own Cloudflare account:

```bash
# Set secret via wrangler
cd /home/user/webapp
npx wrangler pages secret put JWT_SECRET --project-name ev-charge-calculator

# When prompted, paste:
6kW5ApdDJOuCibwG0cooPgXWG8jDp0I5a9t4LRuAhvM=

# Then deploy
npx wrangler pages deploy dist --project-name ev-charge-calculator
```

## 📝 Pre-Deployment Checklist

- [x] Fixed all fetch() calls to include credentials
- [x] Created .dev.vars with JWT_SECRET
- [x] Verified .dev.vars is in .gitignore
- [x] Built project successfully (`npm run build`)
- [x] Tested local authentication flow
- [x] Committed changes to Git
- [ ] Set JWT_SECRET in production environment (see options above)
- [ ] Deploy to production
- [ ] Test login/logout flow on production URL

## 🧪 Testing Authentication Flow

After deployment, test the complete flow:

1. **Visit production URL**: https://dea2b744.ev-charge-calculator.pages.dev/
2. **Click "Inloggen"** → Should show login modal
3. **Enter credentials** and submit
4. **Should redirect to /app** and stay there (not bounce back to /)
5. **User profile** should show in header (name + tier badge)
6. **Click logout** → Should return to landing page

If user gets redirected back to `/` after login:
- ❌ JWT_SECRET is not set in production
- ❌ Cookies are being blocked (check browser settings)
- ❌ CORS issues (check browser console)

## 🔧 Troubleshooting

### "JWT_SECRET not configured" Error
**Solution**: Follow "For Production Deployment" section above to set JWT_SECRET

### Authentication works locally but not in production
**Solution**: 
1. Check that JWT_SECRET is set in production environment
2. Verify production deployment used latest code (commit 4f2d3e9 or later)
3. Check browser console for CORS errors
4. Try hard refresh (Ctrl+Shift+R) to clear cache

### Cookies not being sent
**Solution**:
- Check browser developer tools → Network → Request headers
- Should see `Cookie: auth_token=...` in requests to `/api/auth/*`
- If missing, check that `credentials: 'include'` is in fetch() calls

## 📊 Latest Build Info

- **Last Build**: Successful ✅
- **Build Command**: `npm run build`
- **Output Size**: 233.83 kB (dist/_worker.js)
- **Build Time**: 1.39s
- **Vite Version**: 6.4.1

## 🌐 Production URLs

- **Current Production**: https://dea2b744.ev-charge-calculator.pages.dev/
- **API Endpoints**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout`
- **Calculator App**: `/app`
- **Admin Dashboard**: `/admin`

## ⚡ Quick Deploy Commands

```bash
# Build
cd /home/user/webapp && npm run build

# Deploy to production (after setting JWT_SECRET)
cd /home/user/webapp && npx wrangler pages deploy dist --project-name ev-charge-calculator --branch main

# Check deployment status
curl https://dea2b744.ev-charge-calculator.pages.dev/

# Test authentication endpoint
curl https://dea2b744.ev-charge-calculator.pages.dev/api/auth/me
```
