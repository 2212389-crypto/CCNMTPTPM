# 🌐 Netlify Frontend Deployment Guide

## ⚠️ **Important: Netlify chỉ deploy Frontend**

Netlify chỉ có thể deploy phần `apps/web/` (React app). Bạn cần deploy Backend và Database ở nơi khác.

## 🚀 **Step-by-Step Deploy Frontend to Netlify**

### 1. **Chuẩn Bị Backend Trước**

Trước khi deploy frontend, bạn cần có Backend API running ở đâu đó:

#### Option A: Deploy Backend to Railway (Recommended)
```bash
# 1. Tạo tài khoản Railway.app
# 2. Connect GitHub repo
# 3. Deploy from apps/api folder
# 4. Lấy URL: https://your-api.railway.app
```

#### Option B: Deploy Backend to Render
```bash
# 1. Tạo tài khoản Render.com  
# 2. Connect repo, chọn apps/api
# 3. Set build command: npm install && npm run build
# 4. Set start command: npm start
# 5. Lấy URL: https://your-api.onrender.com
```

### 2. **Cập Nhật Frontend Config**

Update file `apps/web/.env.production`:
```bash
# Thay YOUR_BACKEND_URL bằng URL thực từ step 1
VITE_API_URL=https://your-api.railway.app/api
```

### 3. **Deploy Frontend to Netlify**

#### Method A: Netlify CLI (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build and deploy
cd apps/web
npm install
npm run build
netlify deploy --prod --dir=dist
```

#### Method B: GitHub Integration
1. Push code to GitHub
2. Go to https://netlify.com
3. "Add new site" → "Import from Git"
4. Select your repository
5. Configure:
   - **Build command:** `cd apps/web && npm install && npm run build`
   - **Publish directory:** `apps/web/dist`
   - **Base directory:** `apps/web`

#### Method C: Manual Upload
```bash
# Build locally
cd apps/web
npm install  
npm run build

# Drag & drop 'dist' folder to netlify.com
```

### 4. **Environment Variables trong Netlify**

1. Go to Site settings → Environment variables
2. Add:
   ```
   VITE_API_URL = https://your-backend-url/api
   ```

### 5. **Custom Domain** (Optional)
1. Site settings → Domain management  
2. Add custom domain
3. Configure DNS records

## ⚙️ **Netlify Configuration File**

Tạo file `apps/web/netlify.toml`:
```toml
[build]
  base = "apps/web"
  command = "npm install && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Redirect rules for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"  
  status = 200
```

## 🔧 **Troubleshooting**

### Problem: API calls fail
**Solution:** Check VITE_API_URL in environment variables

### Problem: 404 on page refresh  
**Solution:** Add redirect rules in netlify.toml (already included above)

### Problem: Build fails
**Solution:** Make sure build works locally first:
```bash
cd apps/web
npm install
npm run build
```

## 📊 **Complete Architecture After Deploy**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📱 User       │    │  🌐 Netlify     │    │  🔧 Railway     │
│   Browser       │────▶│  Frontend       │────▶│  Backend API    │
│                 │    │  (React App)    │    │  (Node.js)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │  🗄️ Neon.tech   │
                                               │  Database       │  
                                               │  (PostgreSQL)   │
                                               └─────────────────┘
```

## 🌍 **Example URLs After Deploy**

```bash
🌐 Frontend (Netlify):  https://expense-manager.netlify.app
🔧 Backend (Railway):   https://expense-api.railway.app  
📚 Swagger (Railway):   https://expense-api.railway.app/docs
🗄️ Database (Neon):    Managed by Neon dashboard
```

## 💰 **Cost Breakdown**

```
🌐 Netlify Frontend:    FREE (100GB bandwidth/month)
🔧 Railway Backend:     $5/month (512MB RAM)
🗄️ Neon Database:      FREE (10GB storage)
Total:                  $5/month
```

## ✅ **Verification Steps**

After deployment:
1. ✅ Frontend loads: https://your-site.netlify.app
2. ✅ API accessible: https://your-api.railway.app/api/health  
3. ✅ Swagger works: https://your-api.railway.app/docs
4. ✅ Login/register functions work
5. ✅ Data persists in database

## 🚀 **Alternative: All-in-One Solutions**

If you want to deploy everything in one place:

### Vercel (Frontend + API Routes)
- Deploy both frontend and API routes
- Serverless functions for backend
- Built-in database options

### Railway (Full Stack)
- Deploy both frontend and backend
- Integrated PostgreSQL
- Single platform management

### Render (Full Stack)  
- Web service for frontend
- Backend service for API
- Managed PostgreSQL

Would you like me to create detailed guides for any of these alternatives?