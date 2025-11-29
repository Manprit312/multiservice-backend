import HomeBanner from "../models/homeBannerModel.js";
import cloudinary from "../config/cloudinary.js";

// ➕ Add Banner
export const addHomeBanner = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Ausweb/banners/home" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const metrics = req.body.metrics ? JSON.parse(req.body.metrics) : [];

    const banner = await HomeBanner.create({
      title: req.body.title,
      subtitle: req.body.subtitle,
      buttonText: req.body.buttonText,
      buttonLink: req.body.buttonLink,
      image: imageUrl,
      metrics,
      gradientStart: req.body.gradientStart || "#e0f2ff",
      gradientEnd: req.body.gradientEnd || "#ffffff",
    });

    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📋 Get All
export const getHomeBanners = async (req, res) => {
  try {
    const banners = await HomeBanner.find().sort({ createdAt: -1 });
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔍 Get by ID
export const getHomeBannerById = async (req, res) => {
  try {
    const banner = await HomeBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Update
export const updateHomeBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = req.body.metrics ? JSON.parse(req.body.metrics) : [];
    let updateData = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      buttonText: req.body.buttonText,
      buttonLink: req.body.buttonLink,
      gradientStart: req.body.gradientStart,
      gradientEnd: req.body.gradientEnd,
      metrics,
    };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Ausweb/banners/home" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      updateData.image = result.secure_url;
    }

    const updated = await HomeBanner.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, banner: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ❌ Delete
export const deleteHomeBanner = async (req, res) => {
  try {
    await HomeBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
