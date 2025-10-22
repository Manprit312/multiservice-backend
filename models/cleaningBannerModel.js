import mongoose from "mongoose";

const cleaningBannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CleaningBanner = mongoose.model("CleaningBanner", cleaningBannerSchema);
export default CleaningBanner;
