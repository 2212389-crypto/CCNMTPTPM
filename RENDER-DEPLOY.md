# 🔧 Deploy Backend API to Render

## ✅ **Render Backend Deployment - Perfect Choice!**

Render là platform tuyệt vời cho deploy Node.js backend với:
- ✅ **Free tier** available (512MB RAM)
- ✅ **Auto-deploy** from GitHub  
- ✅ **Built-in SSL** certificates
- ✅ **Environment variables** management
- ✅ **Database integration** 
- ✅ **Logs & monitoring**

## 🚀 **Step-by-Step Backend Deploy**

### **Step 1: Chuẩn Bị Database**

#### Option A: Render PostgreSQL (Recommended)
```bash
1. Login to https://render.com
2. New → PostgreSQL
3. Name: expense-manager-db
4. Plan: Free ($0/month, 1GB storage)
5. Copy connection string được tạo
```

#### Option B: External Database (Neon/Supabase)
```bash
# Neon.tech (Free tier tốt hơn: 10GB)
1. Tạo account tại https://neon.tech  
2. Create database: expense-db
3. Copy connection string
```

### **Step 2: Chuẩn Bị Code**

Render cần package.json có start script. Kiểm tra:

```json
// apps/api/package.json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/server.js",
    "dev": "tsx watch src/server.ts"
  }
}
```

### **Step 3: Deploy Backend Service**

#### 3.1. Create Web Service
```bash
1. Login https://render.com
2. New → Web Service  
3. Connect GitHub repository
4. Configure:
   - Name: expense-manager-api
   - Root Directory: apps/api
   - Environment: Node
   - Build Command: npm install && npm run build
   - Start Command: npm start
```

#### 3.2. Environment Variables
Add trong Render dashboard:
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_ACCESS_SECRET=your_super_secure_access_secret
JWT_REFRESH_SECRET=your_super_secure_refresh_secret  
CORS_ORIGIN=https://your-frontend-domain.netlify.app
UPLOAD_DIR=uploads
```

### **Step 4: Database Setup**

Sau khi deploy, chạy migrations:
```bash
# Option A: Render Shell (recommended)
1. Go to Render dashboard → your service → Shell
2. Run: npx prisma migrate deploy
3. Run: npx prisma db seed (optional)

# Option B: Local connection
1. Update local .env với production DATABASE_URL
2. Run: npx prisma migrate deploy
3. Restore local .env
```

## 📋 **Render Configuration Files**

### Create `apps/api/render.yaml` (Optional)
```yaml
services:
  - type: web
    name: expense-manager-api
    env: node
    buildCommand: npm install && npm run build  
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT  
        value: 10000
```

### Update `apps/api/package.json`
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/server.js",
    "dev": "tsx watch src/server.ts",
    "render:build": "npm install && npm run build",
    "render:deploy": "npx prisma migrate deploy && npm start"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 🔧 **Build & Environment Setup**

### Production Environment Variables for Render
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secrets (generate new ones for production)
JWT_ACCESS_SECRET=render_production_access_secret_min_32_chars
JWT_REFRESH_SECRET=render_production_refresh_secret_min_32_chars

# Server  
NODE_ENV=production
PORT=10000

# CORS (update with your frontend URL)
CORS_ORIGIN=https://your-frontend.netlify.app

# Uploads
UPLOAD_DIR=uploads

# Optional: Logging
LOG_LEVEL=info
```

### Generate Secure JWT Secrets
```bash
# Run locally to generate secure secrets
node -e "console.log('ACCESS:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('REFRESH:', require('crypto').randomBytes(32).toString('hex'))"
```

## 🌍 **URLs After Deployment**

```bash
🔧 API Base:        https://expense-manager-api.onrender.com/api
📚 Swagger Docs:    https://expense-manager-api.onrender.com/docs  
🩺 Health Check:    https://expense-manager-api.onrender.com/api/health
🗄️ Database:       Managed by Render/Neon dashboard
```

## ⚡ **Deploy Process**

### Auto Deploy (Recommended)
```bash
1. Push code to GitHub
2. Render auto-detects changes  
3. Runs build command
4. Deploys new version
5. Zero-downtime deployment
```

### Manual Deploy  
```bash
1. Render Dashboard → Services → expense-manager-api
2. Click "Manual Deploy" → Deploy latest commit
```

## 🔍 **Monitoring & Debugging**

### Check Deployment Status
```bash
1. Render Dashboard → Services  
2. View build logs
3. Check service status
4. Monitor resource usage
```

### API Health Check
```bash
# Test API after deployment
curl https://expense-manager-api.onrender.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-26T...",
  "uptime": 123.45
}
```

### View Logs
```bash
1. Render Dashboard → Service → Logs
2. Real-time log streaming
3. Filter by log level
4. Download log files
```

## 💰 **Render Pricing**

### Free Tier
```bash
✅ 512MB RAM
✅ Shared CPU  
✅ 100GB bandwidth/month
✅ SSL certificates
✅ Custom domains
❌ Sleeps after 15min inactivity
❌ Cold start delays
```

### Paid Plans ($7/month+)
```bash
✅ Always-on (no sleep)
✅ More RAM & CPU
✅ Priority support
✅ Advanced metrics
```

## 🛠️ **Troubleshooting**

### Build Fails
```bash
# Check package.json scripts
# Ensure all dependencies in package.json
# Verify Node.js version compatibility
```

### Database Connection Issues  
```bash
# Verify DATABASE_URL format
# Check database service status
# Test connection locally first
```

### CORS Errors
```bash
# Update CORS_ORIGIN environment variable
# Include protocol (https://)
# No trailing slash
```

### Cold Starts (Free Tier)
```bash
# Service sleeps after 15min inactivity
# First request takes 30+ seconds
# Consider paid plan for production
```

## 🔄 **CI/CD Integration**

### GitHub Actions for Render
```yaml
# .github/workflows/deploy-render.yml
name: Deploy to Render
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST "https://api.render.com/deploy/srv-xxx" \
               -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
```

## ✅ **Verification Checklist**

After deployment:
- [ ] ✅ Service shows "Live" status in Render dashboard
- [ ] ✅ Health check responds: `curl https://your-api.onrender.com/api/health`
- [ ] ✅ Swagger accessible: `https://your-api.onrender.com/docs`
- [ ] ✅ Database connected (check logs for connection success)
- [ ] ✅ Environment variables set correctly
- [ ] ✅ CORS configured for frontend domain

## 🚀 **Next Steps: Connect Frontend**

After backend is deployed:

1. **Get API URL**: `https://your-api.onrender.com`
2. **Update Frontend**: `apps/web/.env.production`
   ```bash
   VITE_API_URL=https://your-api.onrender.com/api
   ```
3. **Deploy Frontend**: To Netlify with updated API URL
4. **Update CORS**: Add frontend URL to backend CORS_ORIGIN

## 📊 **Complete Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📱 User       │    │  🌐 Netlify     │    │  🔧 Render      │
│   Browser       │────▶│  Frontend       │────▶│  Backend API    │
│                 │    │  (React App)    │    │  (Node.js)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │  🗄️ Database    │
                                               │  Render/Neon    │
                                               │  (PostgreSQL)   │
                                               └─────────────────┘
```

## 💡 **Pro Tips**

1. **Use Render PostgreSQL** for simplicity (same platform)
2. **Set up health checks** for monitoring  
3. **Enable auto-deploy** from GitHub main branch
4. **Monitor logs** during first deployment
5. **Test API endpoints** before connecting frontend
6. **Consider paid plan** for production workloads

---

**🎉 Render là choice tuyệt vời cho backend! Simple, reliable, và cost-effective.**