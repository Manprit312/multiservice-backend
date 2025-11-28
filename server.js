import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import cleaningRoutes from "./routes/cleaningRoutes.js";
import cleaningBannerRoutes from "./routes/cleaningBannerRoutes.js";
import homeBannerRoutes from "./routes/homeBannerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import bookingRoutes from "./routes/ridebookingRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import hotelBookingRoutes from "./routes/hotelBookingRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// Dynamic CORS origins for Vercel deployment
const allowedOrigins = [
  "https://multiservices-alpha.vercel.app",
  "https://multiserve-admin.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  // Add your Vercel deployment URLs here
  process.env.FRONTEND_URL,
  process.env.ADMIN_DASHBOARD_URL,
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => res.json({ message: "API is running...", status: "ok" }));

// Connect to database (optimized for serverless)
let dbConnected = false;
let dbConnecting = null; // Store the promise instead of boolean

const connectDBOnce = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    dbConnected = true;
    return;
  }
  
  // If connection is in progress, wait for it
  if (dbConnecting) {
    return dbConnecting;
  }
  
  // Start new connection
  dbConnecting = (async () => {
    try {
      await connectDB();
      dbConnected = true;
      return;
    } catch (error) {
      console.error("Database connection error:", error);
      dbConnecting = null; // Reset on error so we can retry
      throw error;
    }
  })();
  
  return dbConnecting;
};

// Middleware to ensure DB connection before routes (BLOCKING - required for bufferCommands: false)
app.use(async (req, res, next) => {
  try {
    // Wait for database connection before proceeding
    await connectDBOnce();
    next();
  } catch (error) {
    // If connection fails, still allow request but log error
    // Individual routes can handle the error
    console.error("Database connection failed in middleware:", error);
    next();
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/hotels", hotelBookingRoutes); // Hotel booking routes
app.use("/api/cleaning", cleaningRoutes);
app.use("/api/cleaning-banners", cleaningBannerRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/home-banners", homeBannerRoutes);
app.use("/api/book-ride", bookingRoutes);
app.use("/api/providers", providerRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      "GET /",
      "GET /api/home-banners",
      "GET /api/providers",
      "GET /api/hotels",
      "GET /api/cleaning",
      "POST /api/auth/register",
      "POST /api/auth/login",
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ✅ Only start server here if not in Vercel
if (!process.env.VERCEL) {
  (async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })();
}

export default app;
