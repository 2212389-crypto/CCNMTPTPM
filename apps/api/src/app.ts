import express from "express";
import morgan from "morgan";
import path from "path";

import { applySecurity } from "../infra/security";
import { setupSwagger } from "../infra/swagger";
import { errorHandler, notFound } from "../infra/errors";
import { testDatabaseConnection } from "./services/database.service";

import apiRouter from "./routes";

const app = express();

// Test database connection at startup
testDatabaseConnection();

applySecurity(app);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Setup Swagger first
setupSwagger(app);

// Root route for basic health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Expense Manager API", 
    status: "running",
    version: "1.0.0",
    docs: "/docs",
    health: "/api/health"
  });
});

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
