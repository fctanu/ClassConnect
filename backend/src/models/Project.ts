import { Schema, model, Document, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  color: string;
  owner: Types.ObjectId;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: '#0ea5e9' },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default model<IProject>("Project", projectSchema);
