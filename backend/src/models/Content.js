import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "file"],
      required: true,
    },
    text: String,
    fileUrl: String,
    filePath: String,
    originalFileName: String,
    views: {
      type: Number,
      default: 0,
    },
    maxViews: {
      type: Number,
    },
    password: {
      type: String,
    },

    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 10 * 60 * 1000,
      index: { expires: 0 },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  },
  { timestamps: true }
);

export default mongoose.model("Content", ContentSchema);
