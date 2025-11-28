import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, default: 1 },
    nights: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    // Guest information
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
    bookingStatus: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
