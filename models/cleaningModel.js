import mongoose from "mongoose";

const cleaningSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ["Home", "Office", "Deep Cleaning", "Laundry", "Car Wash"], required: true },
    duration: { type: String, required: true }, // e.g. "2 hours"
    suppliesIncluded: { type: Boolean, default: false },
    images: [{ type: String }],
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" }, // Reference to provider
  },
  { timestamps: true }
);

const Cleaning = mongoose.model("Cleaning", cleaningSchema);
export default Cleaning;
