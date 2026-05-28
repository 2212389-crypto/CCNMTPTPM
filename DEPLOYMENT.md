# 🚀 Expense Manager - Deployment Configuration

## 📋 Deployment Status

✅ **Ready to Deploy:**
- Backend API (Node.js + Express + Prisma)
- Frontend Web App (React + TypeScript + Vite)
- Database (PostgreSQL)
- Swagger API Documentation

## 🔗 Development URLs (Local)

### 🌐 Frontend Web App
- **URL:** http://localhost:5173
- **Environment:** `apps/web/.env`
- **Build Command:** `npm run build`
- **Start Command:** `npm run dev`

### 🔧 Backend API
- **URL:** http://localhost:4000
- **API Base:** http://localhost:4000/api
- **Environment:** `apps/api/.env`
- **Build Command:** `npm run build`
- **Start Command:** `npm run dev`

### 📚 Swagger Documentation
- **URL:** http://localhost:4000/docs
- **File:** `apps/api/infra/swagger.ts`
- **Endpoints:** All API routes documented with @swagger comments

### 🗄️ Database
- **Type:** PostgreSQL
- **URL:** postgresql://expense_user:1234@localhost:5432/expense_db
- **Container:** `infra/docker-compose.yml`
- **Admin Tool:** pgAdmin or TablePlus (connect với URL trên)

## 🌐 Production URLs (Sẽ cần cập nhật khi deploy)

### Frontend (Vercel/Netlify/etc.)
```bash
# Cập nhật trong apps/web/.env
VITE_API_URL=https://your-api-domain.com/api
```

### Backend API (Railway/Render/Heroku/etc.)
```bash
# Cập nhật trong apps/api/.env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
JWT_ACCESS_SECRET="production_access_secret"
JWT_REFRESH_SECRET="production_refresh_secret"
PORT=80
CORS_ORIGIN=https://your-frontend-domain.com
UPLOAD_DIR=uploads
```

### Database (Neon/Supabase/Railway/etc.)
- **Production URL:** Sẽ được cung cấp bởi database provider
- **Connection String:** Cập nhật trong `DATABASE_URL`

## 🚀 Deploy Instructions

### 1. Database First (Chọn 1 trong các options)

#### Option A: Neon (Recommended - Free tier)
1. Tạo tài khoản tại https://neon.tech
2. Tạo database mới
3. Copy connection string
4. Cập nhật `DATABASE_URL` trong production env

#### Option B: Supabase (Free tier)
1. Tạo tài khoản tại https://supabase.com
2. Tạo project mới
3. Lấy database connection string
4. Cập nhật `DATABASE_URL` trong production env

#### Option C: Railway (Paid)
1. Tạo tài khoản tại https://railway.app
2. Deploy PostgreSQL service
3. Lấy connection string từ dashboard

### 2. Backend API Deploy (Chọn 1 trong các options)

#### Option A: Railway (Recommended)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login và deploy
railway login
cd apps/api
railway init
railway up
```

#### Option B: Render (Free tier)
1. Connect GitHub repo tại https://render.com
2. Chọn `apps/api` làm root directory
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables

#### Option C: Heroku
```bash
# 1. Install Heroku CLI
# 2. Deploy
cd apps/api
heroku create your-app-name
git subtree push --prefix=apps/api heroku main
```

### 3. Frontend Deploy (Chọn 1 trong các options)

#### Option A: Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd apps/web
vercel --prod
```

#### Option B: Netlify
```bash
# 1. Install Netlify CLI  
npm install -g netlify-cli

# 2. Deploy
cd apps/web
npm run build
netlify deploy --prod --dir=dist
```

## 📝 Checklist Before Deploy

### Backend API
- [ ] Update JWT secrets to production values
- [ ] Set correct CORS_ORIGIN to frontend domain
- [ ] Update DATABASE_URL to production database
- [ ] Test API endpoints locally
- [ ] Run database migrations: `npm run prisma:migrate`

### Frontend Web
- [ ] Update VITE_API_URL to production API domain
- [ ] Test build locally: `npm run build`
- [ ] Check all API integrations work
- [ ] Verify authentication flow

### Database
- [ ] Create production database
- [ ] Run migrations on production
- [ ] Seed initial data if needed
- [ ] Backup strategy in place

## 🔧 Environment Variables Management

### Development
- All configs in `.env` files
- Never commit `.env` files to git
- Use `.env.example` for team sharing

### Production
- Set via hosting platform dashboard
- Use secrets/environment variables features
- Never hardcode in code

## 📊 Monitoring & Logs

### API Monitoring
- Check `/docs` endpoint for API health
- Monitor server logs via hosting platform
- Set up error tracking (Sentry recommended)

### Database Monitoring  
- Use provider's dashboard (Neon/Supabase/etc.)
- Monitor connection counts and queries
- Set up alerts for high usage

### Frontend Monitoring
- Check deployment status on hosting platform
- Monitor bundle size and performance
- Use browser dev tools for debugging

## 🔄 CI/CD (Optional but recommended)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd apps/api && npm install && npm run build
      - name: Deploy to Railway
        # Add deployment steps

  deploy-web:
    runs-on: ubuntu-latest  
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd apps/web && npm install && npm run build
      - name: Deploy to Vercel
        # Add deployment steps
```