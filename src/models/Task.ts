import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    dueDate: { type: Date },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexes for performance
taskSchema.index({ owner: 1, createdAt: -1 }); // List tasks by owner, sorted by creation
taskSchema.index({ owner: 1, status: 1 }); // Filter tasks by owner and status
taskSchema.index({ owner: 1, dueDate: 1 }); // Sort/filter by due date per owner

// Clean JSON serialization: convert ObjectId -> string, normalize dates
taskSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc: any, ret: any) {
    if (ret._id) ret._id = ret._id.toString();
    if (ret.owner) ret.owner = ret.owner.toString();
    if (ret.dueDate) ret.dueDate = new Date(ret.dueDate).toISOString();
    else ret.dueDate = null;
    return ret;
  },
});

taskSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform(doc: any, ret: any) {
    if (ret._id) ret._id = ret._id.toString();
    if (ret.owner) ret.owner = ret.owner.toString();
    if (ret.dueDate) ret.dueDate = new Date(ret.dueDate).toISOString();
    else ret.dueDate = null;
    return ret;
  },
});

export const Task = mongoose.model("Task", taskSchema);
