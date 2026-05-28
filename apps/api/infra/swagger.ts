import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const posix = (p: string) => p.replace(/\\/g, "/");
const CWD = process.cwd();

// More comprehensive route file scanning
const ROUTES_GLOBS = [
  // Current working directory variants
  posix(path.join(CWD, "src/routes/**/*.ts")),
  posix(path.join(CWD, "src/routes/**/*.js")),
  posix(path.join(CWD, "apps/api/src/routes/**/*.ts")),
  posix(path.join(CWD, "apps/api/src/routes/**/*.js")),
  
  // Relative to current file variants  
  posix(path.join(__dirname, "../src/routes/**/*.ts")),
  posix(path.join(__dirname, "../src/routes/**/*.js")),
  posix(path.join(__dirname, "../../src/routes/**/*.ts")),
  posix(path.join(__dirname, "../../src/routes/**/*.js")),
  
  // Absolute path fallback
  posix(path.resolve(__dirname, "..", "src", "routes", "**", "*.ts")),
  posix(path.resolve(__dirname, "..", "src", "routes", "**", "*.js")),
];

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Expense Manager API", version: "1.0.0", description: "API cho hệ thống quản lý chi tiêu" },
    servers: [
      { url: "http://localhost:4000/api", description: "Development server" },
      { url: "https://expense-manager-api-a74b.onrender.com/api", description: "Production server" }
    ],
    components: {
      securitySchemes: { BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      schemas: {
        LoginReq: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "user@example.com" },
            password: { type: "string", example: "user12345" },
          },
        },
        RegisterReq: {
          type: "object",
          required: ["fullName", "email", "password"],
          properties: {
            fullName: { type: "string", example: "Nguyen Van A" },
            email: { type: "string", example: "new@example.com" },
            password: { type: "string", example: "secret123" },
          },
        },
        BudgetCreate: {
          type: "object",
          required: ["month", "year", "limitAmount"],
          properties: {
            month: { type: "integer", example: 10, minimum: 1, maximum: 12 },
            year: { type: "integer", example: 2025, minimum: 2000 },
            limitAmount: { type: "number", example: 5000000, minimum: 0 },
            categoryId: { type: "string", nullable: true },
          },
        },
        BudgetUpdate: { allOf: [{ $ref: "#/components/schemas/BudgetCreate" }] },
        TxCreate: {
          type: "object",
          required: ["type", "amount", "occurredAt", "accountId"],
          properties: {
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            amount: { type: "number", example: 150000, minimum: 0 },
            occurredAt: { type: "string", format: "date-time" },
            accountId: { type: "string" },
            note: { type: "string" },
            categoryId: { type: "string", nullable: true },
          },
        },
        TxUpdate: { allOf: [{ $ref: "#/components/schemas/TxCreate" }] },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ROUTES_GLOBS,
};

const spec: any = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  try {
    const pathsCount = spec?.paths ? Object.keys(spec.paths).length : 0;
    const routesFound = spec?.paths ? Object.keys(spec.paths) : [];
    
    console.log("[swagger] Environment:", process.env.NODE_ENV || 'development');
    console.log("[swagger] CWD:", CWD);
    console.log("[swagger] __dirname:", __dirname);
    console.log("[swagger] Globs:", ROUTES_GLOBS);
    console.log("[swagger] Routes found:", routesFound);
    console.log("[swagger] Paths count:", pathsCount);

    // Always provide raw spec endpoint
    app.get("/docs-json", (_req, res) => {
      res.json(spec ?? {});
    });

    // Debug endpoint to show what routes were found
    app.get("/docs-debug", (_req, res) => {
      res.json({
        environment: process.env.NODE_ENV || 'development',
        cwd: CWD,
        dirname: __dirname,
        globs: ROUTES_GLOBS,
        pathsCount,
        routesFound,
        hasSpec: !!spec,
        specKeys: spec ? Object.keys(spec) : []
      });
    });

    // Handle /docs route
    if (pathsCount > 0) {
      // We have routes, setup full Swagger UI
      app.use("/docs", swaggerUi.serve);
      app.get("/docs", swaggerUi.setup(spec));
    } else {
      // No routes found, show fallback page with debug info
      app.get("/docs", (_req, res) => {
        res.type('html').send(`
          <html>
            <head>
              <title>API Documentation</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; margin: 2rem; }
                .debug { background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 4px; }
                pre { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>Expense Manager API</h1>
              <p>API Documentation scanner found <strong>${pathsCount} routes</strong></p>
              
              <div class="debug">
                <h3>Debug Information:</h3>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <p><strong>CWD:</strong> ${CWD}</p>
                <p><strong>__dirname:</strong> ${__dirname}</p>
                <p><strong>Routes found:</strong> ${routesFound.join(', ') || 'None'}</p>
              </div>
              
              <h3>Available Endpoints:</h3>
              <ul>
                <li><a href="/api/health">Health Check</a></li>
                <li><a href="/docs-json">Raw OpenAPI Spec</a></li>
                <li><a href="/docs-debug">Debug Information</a></li>
              </ul>
            </body>
          </html>
        `);
      });
    }

    // Handle /docs/ redirect
    app.get("/docs/", (_req, res) => {
      res.redirect(302, '/docs');
    });

  } catch (err) {
    console.error('[swagger] Failed to setup Swagger UI:', err);
    
    // Error fallback endpoints
    app.get("/docs-json", (_req, res) => res.json({ error: "Swagger setup failed" }));
    app.get("/docs-debug", (_req, res) => res.json({ error: err.message, stack: err.stack }));
    app.get("/docs", (_req, res) => {
      res.type('html').send(`
        <html>
          <body style="font-family: system-ui; margin: 2rem;">
            <h1>Expense Manager API</h1>
            <p style="color: red;">Documentation temporarily unavailable due to setup error.</p>
            <p><strong>Error:</strong> ${err.message}</p>
            <p><a href="/api/health">Health Check</a> | <a href="/docs-debug">Debug Info</a></p>
          </body>
        </html>
      `);
    });
  }
}
