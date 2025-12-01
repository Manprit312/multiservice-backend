import express from "express";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Test Cloudinary connection
router.get("/cloudinary-test", async (req, res) => {
  try {
    // Try to get account details (this will verify credentials)
    const result = await cloudinary.api.ping();
    res.json({
      success: true,
      message: "Cloudinary connection successful",
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key ? `${cloudinary.config().api_key.substring(0, 4)}...` : 'missing',
      ping: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cloudinary connection failed",
      error: error.message,
      cloudName: cloudinary.config().cloud_name || 'not set',
      apiKey: cloudinary.config().api_key ? `${cloudinary.config().api_key.substring(0, 4)}...` : 'not set',
      apiSecret: cloudinary.config().api_secret ? 'set' : 'not set',
    });
  }
});

export default router;

