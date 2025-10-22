import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import cleaningRoutes from "./routes/cleaningRoutes.js";
import cleaningBannerRoutes from "./routes/cleaningBannerRoutes.js";

dotenv.config();
const app = express();

await connectDB(); // ✅ ensure DB connects before routes

const allowedOrigins = [
  "https://multiservices-alpha.vercel.app",
  "https://multiserve-admin.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/hotels", hotelRoutes);
app.use("/api/cleaning", cleaningRoutes);
app.use("/api/cleaning-banners", cleaningBannerRoutes);

export default app;
