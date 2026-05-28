import "dotenv/config";
import app from "./app";
import { startActivityMonitor } from "./utils/activity-monitor";

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`[API] http://localhost:${PORT}`);
  console.log(`[Swagger] http://localhost:${PORT}/docs`);
  
  // Start activity monitoring
  startActivityMonitor();
});
