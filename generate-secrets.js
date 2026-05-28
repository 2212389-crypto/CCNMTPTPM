const crypto = require('crypto');

console.log('🔐 Generating Secure JWT Secrets for Production...\n');

const accessSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');

console.log('📋 Copy these to your Render Environment Variables:');
console.log('='.repeat(60));
console.log('JWT_ACCESS_SECRET=' + accessSecret);
console.log('JWT_REFRESH_SECRET=' + refreshSecret);
console.log('='.repeat(60));
console.log('\n✅ These secrets are cryptographically secure (256-bit)');
console.log('🚨 Keep them secret! Never commit to git or share publicly.');

// Also generate a sample .env.production file
const envContent = `# Production Environment Variables for Render
# Copy these values to Render Dashboard → Environment Variables

# Database (get from Render PostgreSQL service or Neon)
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# JWT Secrets (use the generated ones above)
JWT_ACCESS_SECRET="${accessSecret}"
JWT_REFRESH_SECRET="${refreshSecret}"

# Server Configuration  
NODE_ENV=production
PORT=10000

# CORS (update with your actual frontend URL)
CORS_ORIGIN=https://your-frontend.netlify.app

# File Uploads
UPLOAD_DIR=uploads

# Optional: Logging
LOG_LEVEL=info`;

require('fs').writeFileSync('./apps/api/.env.render', envContent);
console.log('\n📄 Created: apps/api/.env.render (template file)');
console.log('📝 Edit this file with your actual DATABASE_URL and CORS_ORIGIN');