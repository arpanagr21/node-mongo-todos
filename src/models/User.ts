import mongoose, { Schema } from "mongoose";
import type { IUser } from "../types/index.js";

interface UserDocument extends Omit<IUser, "_id"> {
  _id: mongoose.Types.ObjectId;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Don't return password by default
    },
  },
  {
    timestamps: true,
  }
);

// Note: Email index is automatically created by the "unique: true" option above

export const User = mongoose.model<UserDocument>("User", userSchema);
