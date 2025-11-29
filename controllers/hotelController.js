import Hotel from "../models/Hotel.js";
import Provider from "../models/Provider.js";
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
      provider,
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
            { folder: "Ausweb/hotels" },
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
      provider, // Link to provider
    });

    // If provider is specified, add this hotel to the provider's services
    if (provider) {
      await Provider.findByIdAndUpdate(
        provider,
        { $addToSet: { services: hotel._id } },
        { new: true }
      );
    }

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
            { folder: "Ausweb/hotels" },
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
 * @desc Get all hotels with advanced search and filters (MakeMyTrip-like)
 * @route GET /api/hotels
 */
export const getHotels = async (req, res) => {
  try {
    const { 
      providerId, 
      location, 
      minPrice, 
      maxPrice, 
      capacity, 
      amenities, 
      rating,
      sortBy, // 'price', 'rating', 'name'
      sortOrder // 'asc', 'desc'
    } = req.query;
    
    const query = {};
    
    // Provider filter
    if (providerId) {
      query.provider = providerId;
    }
    
    // Location filter (case-insensitive partial match)
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Capacity filter
    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }
    
    // Amenities filter (hotel must have all specified amenities)
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(",");
      query.amenities = { $all: amenitiesArray.map(a => a.trim()) };
    }
    
    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }
    
    // Build sort object
    let sort = { createdAt: -1 }; // Default sort
    if (sortBy) {
      sort = {};
      if (sortBy === "price") {
        sort.price = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "rating") {
        sort.rating = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "name") {
        sort.name = sortOrder === "asc" ? 1 : -1;
      }
    }
    
    const hotels = await Hotel.find(query).populate("provider").sort(sort);
    res.json({ success: true, count: hotels.length, hotels });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch hotels" });
  }
};
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("provider");
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
    const hotel = await Hotel.findById(id);
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });

    // Remove hotel from provider's services array if it has a provider
    if (hotel.provider) {
      await Provider.findByIdAndUpdate(
        hotel.provider,
        { $pull: { services: hotel._id } }
      );
    }

    await Hotel.findByIdAndDelete(id);
    res.json({ success: true, message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
