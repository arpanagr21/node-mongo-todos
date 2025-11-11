import type { Request, Response } from "express";
import type { IAction } from "../../IModule.js";
import { Task } from "../../../models/Task.js";
import type { JwtPayload } from "../../../types/index.js";
import { getRedisClient } from "../../../utils/redis.js";

const redis = getRedisClient();

const deleteTaskAction: IAction = {
  name: "deleteTask",
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user as JwtPayload | undefined;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      const task = await Task.findOneAndDelete({ _id: id, owner: user.userId });
      if (!task) {
        res.status(404).json({ success: false, message: "Task not found" });
        return;
      }

      if (redis) {
        try {
          const keys = await redis.keys(`tasks:${user.userId}:*`);
          if (keys.length) await redis.del(...keys);
        } catch (err) {
          console.warn("Redis pattern delete failed:", err);
        }
      }

      res.json({ success: true, message: "Task deleted" });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ success: false, message: "Failed to delete task" });
    }
  },
};

export default deleteTaskAction;
