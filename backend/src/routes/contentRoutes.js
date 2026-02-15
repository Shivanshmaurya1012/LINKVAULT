import express from "express";
import upload from "../middlewares/uploadMiddleware.js";

import { uploadText, uploadFile, getContent,deleteContent,getMyContent  } from "../controllers/contentController.js";
import { protect } from "../middlewares/authMiddleware.js";



const router = express.Router();


router.post("/file",protect, (req, res) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File size is too large (Max 5MB allowed)",
        });
      }

      return res.status(400).json({
        message: "File upload error",
      });
    }

    uploadFile(req, res);
  });
});
router.get("/my", protect, getMyContent);

router.get("/:id", getContent);
router.post("/text", protect, uploadText);
router.delete("/:id", protect, deleteContent);

export default router;

