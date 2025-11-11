import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authConfig } from "../config/auth.js";
import type { JwtPayload } from "../types/index.js";

export const generateToken = (userId: string, email: string): string => {
  const payload: JwtPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, authConfig.bcryptRounds);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
