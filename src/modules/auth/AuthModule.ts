import { Router } from "express";
import type { IModule } from "../IModule.js";
import registerAction from "./actions/register.js";
import loginAction from "./actions/login.js";
import { verifyToken } from "../../middleware/auth.js";

class AuthModule implements IModule {
  name = "Auth";
  prefix = "/auth";
  router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Public routes (no authentication required)
    this.router.post("/signup", (req, res) => registerAction.handler(req, res));
    this.router.post("/login", (req, res) => loginAction.handler(req, res));

    // Protected routes (authentication required)
    // Example: this.router.get("/profile", verifyToken, (req, res) => { ... });
  }
}

export const authModule = new AuthModule();
