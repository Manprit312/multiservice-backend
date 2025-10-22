import express from "express";
import multer from "multer";
import {
  addHotel,
  getHotels,
  deleteHotel,
  getHotelById,
  updateHotel
} from "../controllers/hotelController.js";

const router = express.Router();

// Multer setup for handling image uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.get("/:id", getHotelById); 
// Add hotel
router.post("/add", upload.array("images"), addHotel);

// Get all hotels
router.get("/", getHotels);
router.put("/:id", upload.array("images"), updateHotel); // 👈 ADD THIS

// Delete hotel
router.delete("/:id", deleteHotel);

export default router;
