// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Validate Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("⚠️  Cloudinary credentials not fully configured. Image uploads may fail.");
  console.warn("Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Test configuration
if (cloudName && apiKey && apiSecret) {
  console.log("✅ Cloudinary configured:", { cloud_name: cloudName, api_key: apiKey ? `${apiKey.substring(0, 4)}...` : 'missing' });
}

export default cloudinary;
