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

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/cleaning-banners", cleaningBannerRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/cleaning", cleaningRoutes);
const PORT = process.env.PORT || 5000;
export default app; 
