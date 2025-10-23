import Cleaning from "../models/cleaningModel.js";
import cloudinary from "../config/cloudinary.js";

export const addCleaning = async (req, res) => {
  try {
    const { name, description, price, category, duration, suppliesIncluded } = req.body;

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "multiserv_cleaning" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(file.buffer);
        });
        uploadedImages.push(result.secure_url);
      }
    }

    const newCleaning = await Cleaning.create({
      name,
      description,
      price,
      category,
      duration,
      suppliesIncluded,
      images: uploadedImages,
    });

    res.status(201).json({ success: true, cleaning: newCleaning });
  } catch (error) {
    console.error("❌ Error adding cleaning service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCleanings = async (req, res) => {
  try {
    const cleanings = await Cleaning.find().sort({ createdAt: -1 });
    res.json({ success: true, cleanings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCleaningById = async (req, res) => {
  try {
    const cleaning = await Cleaning.findById(req.params.id);
    if (!cleaning)
      return res.status(404).json({ success: false, message: "Cleaning service not found" });
    res.json({ success: true, cleaning });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCleaning = async (req, res) => {
  try {
    const { id } = req.params;
    const existingImages = JSON.parse(req.body.existingImages || "[]");

    // 1️⃣ Upload new images to Cloudinary
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "multiserv_cleaning" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        uploadedImages.push(uploadResult.secure_url);
      }
    }

    // 2️⃣ Merge old + new images
    const updatedImages = [...existingImages, ...uploadedImages];

    // 3️⃣ Update service
    const updated = await Cleaning.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        duration: req.body.duration,
        images: updatedImages,
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Service not found" });

    res.json({ success: true, cleaning: updated });
  } catch (error) {
    console.error("❌ Error updating cleaning:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteCleaning = async (req, res) => {
  try {
    await Cleaning.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Cleaning service deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
