// models/Hotel.js
import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, default: 2 },               // <-- new
    outsideFoodAllowed: { type: Boolean, default: false },// <-- new
    description: { type: String },
    rating: { type: Number, default: 0 },
    amenities: [String],
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);
