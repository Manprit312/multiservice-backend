import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "ServiHub" },
    siteEmail: { type: String, default: "admin@servihub.com" },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    maxFileSize: { type: Number, default: 5 }, // in MB
    allowedFileTypes: { type: String, default: "jpg,jpeg,png,gif,webp,pdf" },
  },
  { timestamps: true }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

