import type { Request, Response } from "express";
import type { IAction } from "../../IModule.js";
import { Task } from "../../../models/Task.js";
import type { JwtPayload, TaskCreateRequest } from "../../../types/index.js";
import { getRedisClient } from "../../../utils/redis.js";

const redis = getRedisClient();

const createTaskAction: IAction = {
  name: "createTask",
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user as JwtPayload | undefined;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const { title, description, dueDate } = req.body as TaskCreateRequest;
      if (!title) {
        res.status(400).json({ success: false, message: "Title is required" });
        return;
      }

      const newTaskDoc = await Task.create({
        title,
        description,
        dueDate,
        owner: user.userId,
      });

      const newTask = newTaskDoc.toJSON();

      // invalidate cache
      if (redis) await redis.del(`tasks:${user.userId}`);

      res.status(201).json({ success: true, data: newTask });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ success: false, message: "Failed to create task" });
    }
  },
};

export default createTaskAction;
