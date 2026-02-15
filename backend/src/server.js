import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { startCleanupJob } from "./jobs/cleanupJob.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();
connectDB();
startCleanupJob();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LinkVault backend is running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

import contentRoutes from "./routes/contentRoutes.js";

app.use("/api/content", contentRoutes);
app.use("/api/auth", authRoutes);

