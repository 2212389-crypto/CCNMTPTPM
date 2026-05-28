import { PrismaClient } from '@prisma/client';

// Tạo Prisma client instance
const prisma = new PrismaClient();

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test query - đếm số users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

// Export prisma instance để sử dụng ở nơi khác
export { prisma };

// Cleanup khi app shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});