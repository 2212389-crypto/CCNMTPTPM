import cors, { CorsOptions } from "cors";

// Default allowed origins for development and production
const defaultOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174", 
  "http://localhost:3000",
  "https://expense-manager-frontend.netlify.app",
  "https://expensemanager.id.vn",
  "http://expensemanager.id.vn"
];

// Get additional origins from environment
const envOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s=>s.trim()).filter(Boolean);
console.log("🔧 [CORS] Environment origins:", envOrigins);

const whitelist = [...defaultOrigins, ...envOrigins];
console.log("🔧 [CORS] Final whitelist:", whitelist);

export const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    console.log("🔍 [CORS] Checking origin:", origin);
    console.log("🔍 [CORS] Whitelist:", whitelist);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("✅ [CORS] Allowing request with no origin");
      return cb(null, true);
    }
    
    // Check if origin is in whitelist
    if (whitelist.includes(origin)) {
      console.log("✅ [CORS] Origin allowed:", origin);
      return cb(null, true);
    }
    
    // Fallback for production - allow if matches pattern
    if (origin.includes('expensemanager.id.vn') || origin.includes('expense-manager-frontend.netlify.app')) {
      console.log("✅ [CORS] Origin allowed by fallback pattern:", origin);
      return cb(null, true);
    }
    
    // Log rejected origins for debugging
    console.log("❌ [CORS] REJECTED origin:", origin);
    console.log("❌ [CORS] Available origins:", whitelist);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true
};
