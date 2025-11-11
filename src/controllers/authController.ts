import type { Request, Response } from "express";
import type { UserCreateRequest, UserLoginRequest, AuthResponse } from "../types/index.js";
import { User } from "../models/User.js";
import { generateToken, hashPassword, comparePasswords } from "../utils/auth.js";

export const register = async (
  req: Request,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    const { email, password, name } = req.body as UserCreateRequest;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(newUser._id.toString(), newUser.email);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id.toString(),
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (
  req: Request,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    const { email, password } = req.body as UserLoginRequest;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
