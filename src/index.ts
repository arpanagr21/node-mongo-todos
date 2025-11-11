import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import { moduleRegistry } from "./modules/ModuleRegistry.js";
import apiAuthRoutes from "./routes/apiAuthRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { databaseConfig } from "./config/database.js";

async function bootstrap() {
  try {
    await mongoose.connect(databaseConfig.uri);
    console.log("✅ MongoDB connected");

    const app = express();
    app.use(express.json());

  // Register module routes ()
  // moduleRegistry.registerRoutes(app);

  // Mount controller-based (conventional) auth routes under /auth
  app.use("/api/auth", apiAuthRoutes);
  app.use("/api/tasks", taskRoutes);

    // Health check endpoint
    app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "🚀 Server is running",
      });
    });

    const port = parseInt(process.env.PORT || "3000", 10);
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();
