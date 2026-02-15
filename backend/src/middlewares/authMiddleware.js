import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
    //   console.log("❌ No Authorization header");
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!authHeader.startsWith("Bearer ")) {
    //   console.log("❌ Invalid Authorization format");
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
    //   console.log("❌ Token missing");
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("✅ Token decoded:", decoded);

    req.userId = decoded.userId;

    next();

  } catch (err) {
    // console.log("❌ JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
