import express from "express";
import request from "supertest";
import apiAuthRoutes from "../../src/routes/apiAuthRoutes.js";
import { User } from "../../src/models/User.js";
import { hashPassword } from "../../src/utils/auth.js";

const app = express();
app.use(express.json());
app.use("/api/auth", apiAuthRoutes);

describe("Auth API Integration Tests", () => {
  describe("POST /api/auth/signup", () => {
    it("should register a new user and return a token", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "newuser@example.com",
          password: "password123",
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: "User registered successfully",
      });
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toMatchObject({
        email: "newuser@example.com",
      });
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({ password: "password123" })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Email and password are required",
      });
    });

    it("should return 409 if user already exists", async () => {
      // Create user first
      await User.create({
        email: "existing@example.com",
        password: await hashPassword("password123"),
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "existing@example.com",
          password: "password123",
        })
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        message: "User already exists",
      });
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      // Create user first
      await User.create({
        email: "test@example.com",
        password: await hashPassword("password123"),
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Login successful",
      });
      expect(response.body.token).toBeDefined();
    });

    it("should return 401 with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: "Email and password are required",
      });
    });
  });
});
