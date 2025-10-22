import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    roomType: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: Number,
    amenities: [String],
    available: { type: Boolean, default: true },
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
