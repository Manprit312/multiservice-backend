import mongoose from "mongoose";

const homeBannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    buttonText: { type: String },
    buttonLink: { type: String },
    image: { type: String, required: true },
    metrics: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    gradientStart: { type: String, default: "#e0f2ff" }, // light blue
    gradientEnd: { type: String, default: "#ffffff" },
  },
  { timestamps: true }
);

const HomeBanner = mongoose.model("HomeBanner", homeBannerSchema);
export default HomeBanner;
