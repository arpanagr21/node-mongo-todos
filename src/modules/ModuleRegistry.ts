import type { Express } from "express";
import type { IModule } from "./IModule.js";
import { authModule } from "./auth/AuthModule.js";
import { tasksModule } from "./tasks/TasksModule.js";

class ModuleRegistry {
  private modules: IModule[] = [authModule, tasksModule];
  private apiPrefix = "/api";

  registerRoutes(app: Express): void {
    this.modules.forEach((module) => {
      const fullPath = `${this.apiPrefix}${module.prefix}`;
      app.use(fullPath, module.router);
      console.log(`📍 Route registered: ${fullPath}`);
    });
  }

  getModule(name: string): IModule | undefined {
    return this.modules.find((m) => m.name === name);
  }

  getAllModules(): IModule[] {
    return this.modules;
  }
}

export const moduleRegistry = new ModuleRegistry();
