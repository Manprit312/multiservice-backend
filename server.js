import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import cleaningRoutes from "./routes/cleaningRoutes.js";
import cleaningBannerRoutes from "./routes/cleaningBannerRoutes.js";

dotenv.config();
const app = express();
connectDB();

// ✅ Vercel-safe CORS config
const allowedOrigins = [
  "https://multiservices-alpha.vercel.app",
  "https://multiserve-admin.vercel.app",
  "http://localhost:3000"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(null, false); // don't crash function
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/*", cors(corsOptions)); // ✅ valid path pattern


app.use(express.json());

// ✅ Routes
app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/cleaning-banners", cleaningBannerRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/cleaning", cleaningRoutes);

export default app;
