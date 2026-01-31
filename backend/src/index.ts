import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import { startCleanupJobs } from "./utils/cleanup";

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();

  // Start security cleanup jobs
  startCleanupJobs();

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
