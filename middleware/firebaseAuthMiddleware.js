import User from "../models/User.js";
import { verifyFirebaseToken } from "../controllers/firebaseAuthController.js";

// Middleware to verify Firebase token and attach user to request
export const verifyFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const firebaseUser = await verifyFirebaseToken(token);

    if (!firebaseUser) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Find user in database
    const user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Attach user to request
    req.user = {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      role: user.role,
      provider: user.provider,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Middleware to check if user is admin or superadmin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
  }

  next();
};

// Middleware to check if user is superadmin only
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  if (req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "Access denied. Superadmin role required." });
  }

  next();
};

// Middleware to check if user owns the resource (admin) or is superadmin
export const requireOwnershipOrSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  // Superadmin can access everything
  if (req.user.role === "superadmin") {
    return next();
  }

  // Admin can only access their own provider's resources
  if (req.user.role === "admin" && req.user.provider) {
    // The resource should have a provider field that matches req.user.provider
    // This will be checked in the controller
    return next();
  }

  return res.status(403).json({ success: false, message: "Access denied" });
};

