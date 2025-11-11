import express from "express";
import request from "supertest";
import taskRoutes from "../../src/routes/taskRoutes.js";
import { User } from "../../src/models/User.js";
import { Task } from "../../src/models/Task.js";
import { generateToken, hashPassword } from "../../src/utils/auth.js";

const app = express();
app.use(express.json());
app.use("/api/tasks", taskRoutes);

describe("Tasks API Integration Tests", () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get auth token
    const user = await User.create({
      email: "test@example.com",
      password: await hashPassword("password123"),
    });
    userId = user._id.toString();
    authToken = generateToken(userId, user.email);
  });

  describe("GET /api/tasks", () => {
    it("should list all tasks for authenticated user", async () => {
      // Create test tasks
      await Task.create({
        title: "Task 1",
        description: "Description 1",
        owner: userId,
      });
      await Task.create({
        title: "Task 2",
        description: "Description 2",
        owner: userId,
      });

      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe("Task 2"); // Newest first
      expect(response.body.data[1].title).toBe("Task 1");
    });

    it("should filter tasks by status", async () => {
      await Task.create({
        title: "Pending Task",
        status: "pending",
        owner: userId,
      });
      await Task.create({
        title: "Completed Task",
        status: "completed",
        owner: userId,
      });

      const response = await request(app)
        .get("/api/tasks?status=pending")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("Pending Task");
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .expect(401);

      expect(response.body.message).toBe("No token provided");
    });

    it("should only return tasks belonging to the authenticated user", async () => {
      // Create another user and their task
      const otherUser = await User.create({
        email: "other@example.com",
        password: await hashPassword("password123"),
      });
      await Task.create({
        title: "Other User Task",
        owner: otherUser._id,
      });

      // Create task for authenticated user
      await Task.create({
        title: "My Task",
        owner: userId,
      });

      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("My Task");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New Task",
          description: "Task description",
          dueDate: "2025-12-31",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: "New Task",
        description: "Task description",
        status: "pending",
      });
    });

    it("should return 400 if title is missing", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ description: "No title" })
        .expect(400);

      expect(response.body.message).toBe("Title is required");
    });

    it("should return 401 without auth token", async () => {
      await request(app)
        .post("/api/tasks")
        .send({ title: "New Task" })
        .expect(401);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task", async () => {
      const task = await Task.create({
        title: "Original Title",
        description: "Original description",
        owner: userId,
      });

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          status: "completed",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Updated Title");
      expect(response.body.data.status).toBe("completed");
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .put("/api/tasks/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated" })
        .expect(404);

      expect(response.body.message).toBe("Task not found");
    });

    it("should not allow updating another user's task", async () => {
      const otherUser = await User.create({
        email: "other@example.com",
        password: await hashPassword("password123"),
      });
      const task = await Task.create({
        title: "Other User Task",
        owner: otherUser._id,
      });

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Hacked" })
        .expect(404);

      expect(response.body.message).toBe("Task not found");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const task = await Task.create({
        title: "Task to delete",
        owner: userId,
      });

      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Task deleted");

      // Verify task is deleted
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .delete("/api/tasks/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe("Task not found");
    });

    it("should not allow deleting another user's task", async () => {
      const otherUser = await User.create({
        email: "other@example.com",
        password: await hashPassword("password123"),
      });
      const task = await Task.create({
        title: "Other User Task",
        owner: otherUser._id,
      });

      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      // Verify task still exists
      const existingTask = await Task.findById(task._id);
      expect(existingTask).not.toBeNull();
    });
  });
});
