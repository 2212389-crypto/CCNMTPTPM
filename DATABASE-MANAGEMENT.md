# 🗄️ Database Management - Các Cách Xem & Quản Lý Database

## 🌐 **1. Prisma Studio** (Web Interface - RECOMMENDED)

### ✅ **Đang Chạy:**
- **URL:** http://localhost:5555  
- **Tính năng:** Xem, thêm, sửa, xóa dữ liệu qua web interface
- **Khởi động:** 
  ```bash
  cd apps/api
  npx prisma studio --schema=./prisma/schema.prisma
  ```

### 🎯 **Tại sao dùng Prisma Studio?**
- ✅ Web interface đẹp và dễ sử dụng
- ✅ Không cần cài phần mềm thêm
- ✅ Hiển thị relationships giữa các bảng
- ✅ Có thể edit data trực tiếp
- ✅ Tự động sync với Prisma schema

---

## 💻 **2. Desktop Database Clients**

### A. **pgAdmin** (Free - Web-based)
```bash
# Cài đặt
# Download từ: https://www.pgadmin.org/download/

# Kết nối
Host: localhost
Port: 5432  
Database: expense_db
Username: expense_user
Password: 1234
```

### B. **DBeaver** (Free - Cross-platform)
```bash
# Download từ: https://dbeaver.io/download/

# Connection String:
postgresql://expense_user:1234@localhost:5432/expense_db
```

### C. **TablePlus** (Paid - macOS/Windows)
```bash
# Download từ: https://tableplus.com/

# Connection:
Host: localhost
Port: 5432
Database: expense_db  
User: expense_user
Password: 1234
```

---

## 🔧 **3. Command Line Tools**

### A. **psql** (PostgreSQL CLI)
```bash
# Kết nối trực tiếp
psql postgresql://expense_user:1234@localhost:5432/expense_db

# Các lệnh cơ bản:
\l          # List databases
\c expense_db   # Connect to database  
\dt         # List tables
\d users    # Describe table structure
SELECT * FROM users;   # Query data
```

### B. **Prisma CLI**
```bash
cd apps/api

# Xem database schema
npx prisma db pull

# Reset database  
npx prisma db reset

# Apply migrations
npx prisma db push
```

---

## 📊 **4. Current Database Schema**

### 📋 **Tables:**
- **users** - Người dùng (id, email, fullName, role, etc.)
- **accounts** - Tài khoản tài chính (id, name, currency, ownerId)  
- **transactions** - Giao dịch (id, amount, type, note, accountId)
- **user_activities** - Log hoạt động người dùng

### 🔗 **Relationships:**
```
users (1) -----> (n) accounts
accounts (1) --> (n) transactions  
users (1) -----> (n) user_activities
```

---

## 🚀 **5. Production Database Management**

### **Neon.tech** (Recommended for production)
- **Dashboard:** https://neon.tech/
- **Features:** Web console, SQL editor, monitoring
- **Free tier:** 10GB storage, 1 billion rows

### **Supabase** 
- **Dashboard:** https://supabase.com/
- **Features:** Built-in table editor, realtime updates  
- **Free tier:** 500MB database, 50MB file storage

### **Railway**
- **Dashboard:** https://railway.app/
- **Features:** Metrics, logs, direct psql access
- **Pricing:** $5/month for PostgreSQL

---

## 🔧 **Quick Actions**

### 🏃 **Start Database UI:**
```bash
# Option 1: Prisma Studio (Web UI)
cd apps/api && npx prisma studio --schema=./prisma/schema.prisma
# Then open: http://localhost:5555

# Option 2: Start Docker + pgAdmin
cd infra && docker-compose up -d
# Install pgAdmin and connect với thông tin ở trên
```

### 📊 **View Current Data:**
```bash
# Check what's in database via API
curl http://localhost:4000/api/health

# View users (need auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/users
```

### 🔄 **Reset & Seed:**
```bash  
cd apps/api
npm run prisma:migrate  # Apply migrations
npm run prisma:seed     # Insert test data
```

---

## ⚠️ **Important Notes**

### 🔒 **Security:**
- Production database không nên expose ports công khai
- Sử dụng SSL/TLS cho production connections
- Không hardcode credentials trong code

### 💾 **Backup:**
```bash
# Local backup
pg_dump postgresql://expense_user:1234@localhost:5432/expense_db > backup.sql

# Restore backup  
psql postgresql://expense_user:1234@localhost:5432/expense_db < backup.sql
```

### 🔍 **Monitoring:**
- Prisma Studio: Real-time data viewing
- Production: Sử dụng provider dashboard
- Logs: Check API server logs cho database queries

---

## 📞 **Quick Help**

| Need | Solution |
|------|----------|
| 👀 **Xem data nhanh** | http://localhost:5555 (Prisma Studio) |
| 🔧 **Sửa data** | Prisma Studio hoặc pgAdmin |
| 📊 **Query phức tạp** | psql CLI hoặc DBeaver |  
| 🚀 **Production** | Provider dashboard (Neon/Supabase) |

**🎯 Recommended: Sử dụng Prisma Studio cho development, provider dashboard cho production!**