import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "";

export default async function connectDB() {
  if (!MONGO_URI) throw new Error("MONGO_URI not set in environment");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
}
