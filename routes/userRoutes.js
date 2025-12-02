import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from "../controllers/userController.js";
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

// All routes require superadmin access
router.use(superadminOnly);

// Get user statistics
router.get("/stats", getUserStats);

// Get all users
router.get("/", getUsers);

// Get user by ID
router.get("/:id", getUserById);

// Update user
router.put("/:id", updateUser);

// Delete user
router.delete("/:id", deleteUser);

export default router;

