import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  pickup: String,
  drop: String,
  when: String,
  fare: Number,
  distance: Number, // Distance in km
  vehicleType: { type: String, enum: ["bike", "auto", "cab"] }, // Vehicle type
  driverId: String, // Driver identifier
  paymentMethod: { type: String, enum: ["cash", "card", "wallet"] },
  status: { type: String, enum: ["pending", "confirmed", "on_way", "completed", "cancelled"], default: "pending" },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" }, // Reference to provider
  // Additional fields for better frontend display
  name: String, // Service name (e.g., "Airport Transfer")
  description: String, // Service description
  images: [String], // Service images
  rating: Number, // Service rating
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Ride", rideSchema);
