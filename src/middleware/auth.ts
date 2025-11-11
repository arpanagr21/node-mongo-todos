import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth.js";
import type { JwtPayload } from "../types/index.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }

    const decoded = jwt.verify(token, authConfig.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    const message =
      error instanceof jwt.TokenExpiredError
        ? "Token expired"
        : "Invalid token";

    res.status(401).json({
      success: false,
      message,
    });
  }
};
