import Hotel from "../models/Hotel.js";
import cloudinary from "../config/cloudinary.js";

/**
 * @desc Add new hotel
 * @route POST /api/hotels/add
 */
export const addHotel = async (req, res) => {
  try {
    const {
      name,
      location,
      price,
      capacity,
      outsideFoodAllowed,
      description,
      amenities,
    } = req.body;

    // Parse and validate
    const amenitiesArray = amenities
      ? amenities.split(",").map((a) => a.trim()).filter(Boolean)
      : [];
    const capacityNum = capacity ? Number(capacity) : 2;
    const outsideFoodBool =
      outsideFoodAllowed === "true" ||
      outsideFoodAllowed === "on" ||
      outsideFoodAllowed === true;

    // Upload images to Cloudinary
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "multiserv_hotels" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(file.buffer);
        });
        uploadedImages.push(result.secure_url);
      }
    }

    // Create the hotel
    const hotel = await Hotel.create({
      name,
      location,
      price: Number(price),
      capacity: capacityNum,
      outsideFoodAllowed: outsideFoodBool,
      description,
      amenities: amenitiesArray,
      images: uploadedImages,
    });

    res.status(201).json({ success: true, hotel });
  } catch (error) {
    console.error("❌ Error adding hotel:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const existingImages = JSON.parse(req.body.existingImages || "[]");

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "multiserv_hotels" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(file.buffer);
        });
        uploadedImages.push(result.secure_url);
      }
    }

    const updated = await Hotel.findByIdAndUpdate(
      id,
      { ...req.body, images: [...existingImages, ...uploadedImages] },
      { new: true }
    );

    res.json({ success: true, hotel: updated });
  } catch (error) {
    console.error("Error updating hotel:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc Get all hotels
 * @route GET /api/hotels
 */
export const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: hotels.length, hotels });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch hotels" });
  }
};
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });
    res.json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete hotel
 * @route DELETE /api/hotels/:id
 */
export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndDelete(id);
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });

    res.json({ success: true, message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
