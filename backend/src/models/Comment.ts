import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
    content: string;
    post: Types.ObjectId;
    author: Types.ObjectId;
    authorName: string;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        authorName: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

// Index for efficient queries
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

export default model<IComment>("Comment", commentSchema);
