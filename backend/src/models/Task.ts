import { Schema, model, Document, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  owner: Types.ObjectId;
  dueDate?: Date;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  category?: string;
  reminder: boolean;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
    priority: { 
      type: String, 
      enum: ['P1', 'P2', 'P3', 'P4'],
      default: 'P4'
    },
    category: { type: String },
    reminder: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model<ITask>("Task", taskSchema);
