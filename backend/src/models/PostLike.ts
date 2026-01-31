import { Schema, model, Document, Types } from "mongoose";

export interface IPostLike extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

const postLikeSchema = new Schema<IPostLike>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

postLikeSchema.index({ post: 1, user: 1 }, { unique: true });

export default model<IPostLike>("PostLike", postLikeSchema);
