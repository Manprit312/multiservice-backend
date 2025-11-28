import express from "express";
import {
  bookHotel,
  getBookingById,
  getAllBookings,
  cancelBooking,
} from "../controllers/hotelBookingController.js";

const router = express.Router();

// Create a new booking
router.post("/book", bookHotel);

// Get all bookings (with optional filters)
router.get("/bookings", getAllBookings);

// Get booking by ID
router.get("/bookings/:id", getBookingById);

// Cancel a booking
router.put("/bookings/:id/cancel", cancelBooking);

export default router;

