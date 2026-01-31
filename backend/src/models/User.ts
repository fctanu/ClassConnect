import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  refreshTokens?: string[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    password: { type: String, required: true },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true },
);

export default model<IUser>("User", userSchema);
