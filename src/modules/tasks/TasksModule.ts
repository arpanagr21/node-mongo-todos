import { Router } from "express";
import type { IModule } from "../IModule.js";
import { verifyToken } from "../../middleware/auth.js";
import listTasksAction from "./actions/listTasks.js";
import createTaskAction from "./actions/createTask.js";
import updateTaskAction from "./actions/updateTask.js";
import deleteTaskAction from "./actions/deleteTask.js";

class TasksModule implements IModule {
  name = "Tasks";
  prefix = "/tasks";
  router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Protected routes (authentication required)
    this.router.get("/", verifyToken, listTasksAction.handler);
    this.router.post("/", verifyToken, createTaskAction.handler);
    this.router.put("/:id", verifyToken, updateTaskAction.handler);
    this.router.delete("/:id", verifyToken, deleteTaskAction.handler);
  }
}

export const tasksModule = new TasksModule();
