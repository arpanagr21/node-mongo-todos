import type { Request, Response } from "express";
import { Task } from "../models/Task.js";
import type { JwtPayload, TaskCreateRequest, TaskUpdateRequest, TaskResponse } from "../types/index.js";
import { getRedisClient } from "../utils/redis.js";

export const listTasks = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

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

    const redis = getRedisClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: JSON.parse(cached) });
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
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const { title, description, dueDate } = req.body as TaskCreateRequest;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const newTaskDoc = await Task.create({
      title,
      description,
      dueDate,
      owner: user.userId,
    });

    const newTask = newTaskDoc.toJSON();

    // invalidate cache (delete all keys for this user's task lists)
    const redis = getRedisClient();
    if (redis) {
      try {
        const keys = await redis.keys(`tasks:${user.userId}:*`);
        if (keys.length) await redis.del(...keys);
      } catch (err) {
        console.warn("Redis pattern delete failed:", err);
      }
    }

    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { id } = req.params;
  const updates = req.body as TaskUpdateRequest;

    const task = await Task.findOne({ _id: id, owner: user.userId });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    Object.assign(task, updates);
    const saved = await task.save();
    const updated = saved.toJSON();

  const redis = getRedisClient();
  if (redis) {
    try {
      const keys = await redis.keys(`tasks:${user.userId}:*`);
      if (keys.length) await redis.del(...keys);
    } catch (err) {
      console.warn("Redis pattern delete failed:", err);
    }
  }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, owner: user.userId });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

  const redis = getRedisClient();
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
};
