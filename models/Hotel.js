// models/Hotel.js
import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, default: 2 },
    outsideFoodAllowed: { type: Boolean, default: false },
    description: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 10 }, // Rating out of 10
    reviewCount: { type: Number, default: 0 }, // Number of reviews
    amenities: [String],
    images: [String],
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" }, // Reference to provider
  },
  { timestamps: true }
);

export default mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);
