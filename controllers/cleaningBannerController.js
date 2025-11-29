import CleaningBanner from "../models/cleaningBannerModel.js";
import cloudinary from "../config/cloudinary.js";

// ➕ Add new banner
// ➕ Add or Replace Cleaning Banner
export const addCleaningBanner = async (req, res) => {
  try {
    const { title, subtitle } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // If a banner already exists, delete it before adding a new one
    const existing = await CleaningBanner.findOne();
    if (existing) {
      await CleaningBanner.findByIdAndDelete(existing._id);
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "Ausweb/banners/cleaning" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const newBanner = await CleaningBanner.create({
      title,
      subtitle,
      image: result.secure_url,
    });

    res.status(201).json({ success: true, banner: newBanner });
  } catch (error) {
    console.error("❌ Error adding cleaning banner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// 📋 Get all banners
export const getCleaningBanners = async (req, res) => {
  try {
    const banners = await CleaningBanner.find().sort({ createdAt: -1 });
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔍 Get single banner
export const getCleaningBannerById = async (req, res) => {
  try {
    const banner = await CleaningBanner.findById(req.params.id);
    if (!banner)
      return res.status(404).json({ success: false, message: "Banner not found" });
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Update banner
export const updateCleaningBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, active } = req.body;

    let updatedFields = { title, subtitle, active };

    // If new image uploaded, replace old one
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Ausweb/banners/cleaning" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      updatedFields.image = result.secure_url;
    }

    const updatedBanner = await CleaningBanner.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    res.json({ success: true, banner: updatedBanner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🗑️ Delete banner
export const deleteCleaningBanner = async (req, res) => {
  try {
    await CleaningBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
