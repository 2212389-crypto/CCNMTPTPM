# 🚀 NETLIFY DEPLOYMENT FIX

## ❌ Vấn đề đã gặp:
- URL `https://expensemanager.id.vn/profile` trả về 404 "Page not found"
- Netlify không biết cách xử lý client-side routing của React Router

## ✅ Giải pháp đã áp dụng:

### 1. Tạo file `_redirects`
```
# File: apps/web/public/_redirects
/api/*  https://expense-manager-api.onrender.com/api/:splat  200
/*    /index.html   200
```

### 2. Tạo file `netlify.toml` 
```toml
# File: apps/web/netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*" 
  to = "https://expense-manager-api.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 📋 Deployment Steps:

### Method 1: Auto Deploy (Recommended)
1. Push code lên GitHub
2. Netlify sẽ tự động build và deploy
3. Kiểm tra tại: https://expensemanager.id.vn

### Method 2: Manual Deploy
```bash
# 1. Build project locally
cd apps/web
npm run build

# 2. Upload dist/ folder to Netlify
# hoặc drag & drop vào Netlify dashboard
```

## 🔧 Cấu hình Netlify Dashboard:

### Build Settings:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `18`

### Environment Variables:
```
VITE_API_BASE_URL=https://expense-manager-api.onrender.com
VITE_APP_NAME=Expense Manager
```

### Domain Settings:
- **Primary domain:** `expensemanager.id.vn`
- **HTTPS:** Enabled (Force HTTPS)
- **SSL Certificate:** Auto-generated

## 🧪 Testing After Deployment:

### ✅ Routes to test:
- https://expensemanager.id.vn/ (Dashboard)
- https://expensemanager.id.vn/profile (Profile page)
- https://expensemanager.id.vn/transactions (Transactions)
- https://expensemanager.id.vn/accounts (Accounts)
- https://expensemanager.id.vn/reports (Reports)
- https://expensemanager.id.vn/login (Login)

### ✅ API calls to test:
- Login functionality
- Data loading on dashboard
- Profile updates

## 🚨 Common Issues & Solutions:

### Issue 1: Still getting 404
**Solution:** Clear browser cache và check build logs

### Issue 2: API calls failing
**Solution:** Verify CORS settings on backend

### Issue 3: Slow initial load
**Solution:** Check bundle size và enable gzip compression

---

**✅ Status:** Fixed - SPA routing now works correctly with Netlify
**📅 Fixed on:** October 28, 2025
**🔗 Live URL:** https://expensemanager.id.vn