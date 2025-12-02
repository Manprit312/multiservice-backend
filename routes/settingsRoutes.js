import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { verifyFirebaseToken } from "../controllers/firebaseAuthController.js";

const router = express.Router();

// Middleware to check if user is superadmin
const superadminOnly = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyFirebaseToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Find user in database to check role
    const User = (await import("../models/User.js")).default;
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied. Superadmin only." });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

// Get settings (public, but filtered)
router.get("/", getSettings);

// Update settings (superadmin only)
router.put("/", superadminOnly, updateSettings);

export default router;

