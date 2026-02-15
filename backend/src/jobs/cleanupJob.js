import cron from "node-cron";
import Content from "../models/Content.js";
import fs from "fs";

export const startCleanupJob = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running cleanup job...");

    const now = new Date();

    const expired = await Content.find({
      expiresAt: { $lte: now },
    });

    for (let item of expired) {
      try {
        if (item.type === "file" && item.filePath) {
          if (fs.existsSync(item.filePath)) {
            fs.unlinkSync(item.filePath);
          }
        }

        await Content.deleteOne({ _id: item._id });

        console.log("Deleted expired:", item.uniqueId);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }
  });
};
