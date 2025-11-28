import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import cleaningRoutes from "./routes/cleaningRoutes.js";
import cleaningBannerRoutes from "./routes/cleaningBannerRoutes.js";
import homeBannerRoutes from "./routes/homeBannerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js"
import bookingRoutes from "./routes/ridebookingRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import hotelBookingRoutes from "./routes/hotelBookingRoutes.js";


dotenv.config();
const app = express();
(async () => {
  await connectDB(); // ✅ safely connect to DB before starting routes

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

  app.get("/", (req, res) => res.send("API is running..."));
  app.use("/api/hotels", hotelRoutes);
  app.use("/api/hotels", hotelBookingRoutes); // Hotel booking routes
  app.use("/api/cleaning", cleaningRoutes);
  app.use("/api/cleaning-banners", cleaningBannerRoutes);
  app.use("/api/contacts", contactRoutes);
  app.use("/api/home-banners", homeBannerRoutes);
  app.use("/api/book-ride", bookingRoutes);
  app.use("/api/providers", providerRoutes);

  // ✅ Only start server here if not in Vercel
  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  }
})();

export default app
