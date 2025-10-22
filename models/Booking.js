import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    checkIn: Date,
    checkOut: Date,
    totalAmount: Number,
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    bookingStatus: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
