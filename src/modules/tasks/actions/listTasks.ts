import type { Request, Response } from "express";
import type { IAction } from "../../IModule.js";
import { Task } from "../../../models/Task.js";
import type { JwtPayload } from "../../../types/index.js";
import { getRedisClient } from "../../../utils/redis.js";

const redis = getRedisClient();

const listTasksAction: IAction = {
  name: "listTasks",
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user as JwtPayload | undefined;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // Build query filters
      const query: any = { owner: user.userId };

      // Filter by status (pending/completed)
      const { status, dueBefore, dueAfter } = req.query;
      if (status && (status === "pending" || status === "completed")) {
        query.status = status;
      }

      // Filter by due date (tasks due before a date)
      if (dueBefore) {
        query.dueDate = { ...query.dueDate, $lte: new Date(dueBefore as string) };
      }

      // Filter by due date (tasks due after a date)
      if (dueAfter) {
        query.dueDate = { ...query.dueDate, $gte: new Date(dueAfter as string) };
      }

      // Create cache key including filters
      const filterKey = `${status || 'all'}_${dueBefore || ''}_${dueAfter || ''}`;
      const cacheKey = `tasks:${user.userId}:${filterKey}`;

      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          res.json({ success: true, data: JSON.parse(cached) });
          return;
        }
      }

      const tasksDocs = await Task.find(query).sort({ createdAt: -1 });
      const tasks = tasksDocs.map((t: any) => t.toJSON());

      if (redis) {
        await redis.set(cacheKey, JSON.stringify(tasks), "EX", 60); // cache for 60s
      }

      res.json({ success: true, data: tasks });
    } catch (error) {
      console.error("List tasks error:", error);
      res.status(500).json({ success: false, message: "Failed to list tasks" });
    }
  },
};

export default listTasksAction;
