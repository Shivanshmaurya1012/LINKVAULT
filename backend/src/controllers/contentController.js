import { v4 as uuidv4 } from "uuid";
import Content from "../models/Content.js";
import bcrypt from "bcryptjs";


const parseExpiry = (expiry) => {
  if (!expiry) {
    // default 10 minutes
    return new Date(Date.now() + 10 * 60 * 1000);
  }

  // expiry comes like "2026-02-05T14:30"
  const match = expiry.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

  if (!match) return null;

  const [, y, m, d, h, min] = match.map(Number);

  return new Date(y, m - 1, d, h, min);
};


export const uploadText = async (req, res) => {
  try {

    console.log("---- uploadText HIT ----");
console.log("User from token:", req.userId);
console.log("Body:", req.body);

    const { text, expiry, maxViews, oneTime, password } = req.body;

    const finalMaxViews = oneTime ? 1 : maxViews || null;



    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const uniqueId = uuidv4();

    const expiresAt = parseExpiry(req.body.expiry);

    if (!expiresAt || isNaN(expiresAt.getTime())) {
      return res.status(400).json({ message: "Invalid expiry date" });
    }

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    console.log("Creating content...");

    const content = await Content.create({
      type: "text",
      text,
      uniqueId,
      expiresAt,
      maxViews: finalMaxViews,
      password: hashedPassword,
      user: req.userId,
    });

    res.status(201).json({
      message: "Text uploaded successfully",
      link: `http://localhost:5000/api/content/${content.uniqueId}`,
      expiresAt,
      name: text.substring(0, 20) + (text.length > 20 ? "..." : ""),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.query;

    const content = await Content.findOne({ uniqueId: id });

    if (!content) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    /* ===== EXPIRY CHECK (SAFE) ===== */
    if (content.expiresAt) {
      const expiresAt = new Date(content.expiresAt);

      if (isNaN(expiresAt.getTime()) || new Date() > expiresAt) {
        return res.status(410).json({
          message: "This link has expired",
        });
      }
    }

    /* ===== PASSWORD CHECK (SAFE) ===== */
    if (content.password) {
      if (!password) {
        return res.status(401).json({ message: "Password required" });
      }

      const isMatch = await bcrypt.compare(password, content.password);
      if (!isMatch) {
        return res.status(403).json({ message: "Incorrect password" });
      }
    }

    /* ===== VIEW LIMIT ===== */
    if (content.maxViews && content.views >= content.maxViews) {
      return res.status(403).json({ message: "View limit exceeded" });
    }

    /* ===== INCREMENT VIEWS ===== */

    content.views += 1;
      await content.save();
    /* ===== RESPOND ===== */
    if (content.type === "text") {

      if (content.maxViews && content.views > content.maxViews) {
        return res.status(403).json({
          message: "View limit exceeded",
        });
      }

      

      return res.json({
        type: "text",
        text: content.text,
        views: content.views,
        maxViews: content.maxViews,
        expiresAt: content.expiresAt,
      });
    }

    /* ===== FILE ===== */
    if (content.type === "file") {

      // Only increment when downloading
      if (req.query.download === "true") {

        if (content.maxViews && content.views > content.maxViews) {
          return res.status(403).json({
            message: "View limit exceeded",
          });
        }

        

        return res.download(content.filePath, content.originalFileName);
      }

      // Just metadata for UI
      return res.json({
        type: "file",
        views: content.views,
        maxViews: content.maxViews,
        expiresAt: content.expiresAt,
      });
    }

    /* ===== FALLBACK ===== */
    return res.status(400).json({
      message: "Unsupported content type",
    });
  } catch (err) {
    console.error("getContent crash:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



// export const getContent = async (req, res) => {
//   console.log("---- getContent HIT ----");

//   try {
//     const { id } = req.params;
//     const { password } = req.query;

//     console.log("ID:", id);
//     console.log("Password provided:", password);

//     const content = await Content.findOne({ uniqueId: id });
//     console.log("Content from DB:", content);

//     if (!content) {
//       console.log("❌ Content not found");
//       return res.status(404).json({ message: "Invalid or expired link" });
//     }

//     /* ===== EXPIRY ===== */
//     console.log("ExpiresAt raw:", content.expiresAt);

//     const expiresAt = content.expiresAt ? new Date(content.expiresAt) : null;
//     console.log("ExpiresAt parsed:", expiresAt);

//     if (!expiresAt || isNaN(expiresAt.getTime())) {
//       console.log("❌ Invalid expiry date");
//       return res.status(410).json({ message: "This link has expired" });
//     }

//     if (new Date() > expiresAt) {
//       console.log("❌ Link expired");
//       return res.status(410).json({ message: "This link has expired" });
//     }

//     /* ===== PASSWORD ===== */
//     if (content.password) {
//       console.log("Password is required");

//       if (!password) {
//         console.log("❌ No password provided");
//         return res.status(401).json({ message: "Password required" });
//       }

//       const match = await bcrypt.compare(password, content.password);
//       console.log("Password match:", match);

//       if (!match) {
//         console.log("❌ Wrong password");
//         return res.status(403).json({ message: "Incorrect password" });
//       }
//     }

//     /* ===== VIEW LIMIT ===== */
//     console.log("Views:", content.views, "Max:", content.maxViews);

//     /* ===== SAVE ===== */
//     content.views += 1;
//     await content.save();
//     console.log("Views incremented");

//     /* ===== RESPONSE ===== */
//     if (content.type === "text") {
//       console.log("Returning TEXT");
//       return res.json({
//         type: "text",
//         text: content.text,
//         expiresAt: content.expiresAt,
//         views: content.views,
//       });
//     }

//     if (content.type === "file") {
//       console.log("Returning FILE");
//       return res.download(content.filePath, content.originalFileName);
//     }

//     console.log("❌ Unknown content type");
//     return res.status(400).json({ message: "Unsupported type" });

//   } catch (err) {
//     console.error("🔥 CRASH LOCATION 🔥");
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const { password, expiry, maxViews, oneTime } = req.body;
    const isOneTime = oneTime === "true";

    const finalMaxViews = isOneTime
      ? 1
      : (maxViews ? Number(maxViews) : null);
    const uniqueId = uuidv4();

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const expiresAt = parseExpiry(req.body.expiry);

    if (!expiresAt || isNaN(expiresAt.getTime())) {
      return res.status(400).json({ message: "Invalid expiry date" });
    }

    await Content.create({
      type: "file",
      filePath: req.file.path,
      originalFileName: req.file.originalname,
      uniqueId,
      password: hashedPassword,   // 🔥 THIS WAS MISSING
      expiresAt,
      maxViews: finalMaxViews,
      user: req.userId,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      link: `http://localhost:5000/api/content/${uniqueId}`,
      expiresAt,
      name: req.file.originalname,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


import fs from "fs";
import path from "path";

export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Delete request received for:", id);

    const content = await Content.findOne({ uniqueId: id,user: req.userId,  });

    if (!content) {
      console.log("Content not found");
      return res.status(404).json({ message: "Content not found" });
    }

    // 🔥 Delete file if exists
    if (content.type === "file" && content.filePath) {
      const absolutePath = path.resolve(content.filePath);

      console.log("Resolved path:", absolutePath);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        console.log("File deleted successfully");
      } else {
        console.log("File not found on disk");
      }
    }

    await Content.deleteOne({ uniqueId: id });

    console.log("Database record deleted");

    return res.status(200).json({
      message: "Content deleted successfully",
    });

  } catch (err) {
    console.error("DELETE CRASH:", err);
    return res.status(500).json({
      message: "Delete failed",
    });
  }
};
export const getMyContent = async (req, res) => {
  try {
    const contents = await Content.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json(contents);

  } catch (err) {
    console.log("GET MY CONTENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



