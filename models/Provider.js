import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    logo: { type: String },
    images: [{ type: String }],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cleaning" }], // Reference to services
    isActive: { type: Boolean, default: true },
    specialties: [String], // e.g., ["Home Cleaning", "Office Cleaning", "Deep Cleaning"]
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true }, // Reference to user (one-to-one, sparse allows multiple nulls)
  },
  { timestamps: true }
);

const Provider = mongoose.models.Provider || mongoose.model("Provider", providerSchema);
export default Provider;

