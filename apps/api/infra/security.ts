import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Express } from "express";
import { corsOptions } from "../src/config/cors";

export function applySecurity(app: Express) {
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  // Use the proper CORS configuration from cors.ts
  app.use(cors(corsOptions));

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
}
