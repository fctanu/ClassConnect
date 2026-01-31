import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  description?: string;
  images: string[];
  likeCount: number;
  owner: Types.ObjectId;
  authorName: string;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (items: string[]) => items.length <= 6,
        message: 'images exceeds max length',
      },
    },
    likeCount: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });
postSchema.index({ owner: 1, createdAt: -1 });
postSchema.index({ likeCount: -1, createdAt: -1 });
postSchema.index({ title: 'text', description: 'text' });

export default model<IPost>("Post", postSchema);
