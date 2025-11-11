import type { Request, Response } from "express";
import type { AuthRequest, AuthResponse } from "../../../types/index.js";
import { User } from "../../../models/User.js";
import { generateToken, comparePasswords } from "../../../utils/auth.js";
import type { IAction } from "../../IModule.js";

const loginAction: IAction = {
  name: "login",
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

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

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
  },
};

export default loginAction;
