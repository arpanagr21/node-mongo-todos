import type { Request, Response } from "express";
import type { AuthRequest, AuthResponse } from "../../../types/index.js";
import { User } from "../../../models/User.js";
import { generateToken, hashPassword } from "../../../utils/auth.js";
import type { IAction } from "../../IModule.js";

const registerAction: IAction = {
  name: "register",
  handler: async (
    req: Request,
    res: Response<AuthResponse>
  ): Promise<void> => {
    try {
      const { email, password } = req.body as AuthRequest;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "User already exists",
        });
        return;
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await User.create({
        email,
        password: hashedPassword,
      });

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
  },
};

export default registerAction;
