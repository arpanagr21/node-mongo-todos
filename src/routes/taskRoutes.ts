import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { listTasks, createTask, updateTask, deleteTask } from "../controllers/tasksController.js";

const router = Router();

// All routes here require authentication
router.get("/", verifyToken, listTasks);
router.post("/", verifyToken, createTask);
router.put("/:id", verifyToken, updateTask);
router.delete("/:id", verifyToken, deleteTask);

export default router;
