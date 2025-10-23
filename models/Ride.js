import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  pickup: String,
  drop: String,
  when: String,
  fare: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Ride", rideSchema);
