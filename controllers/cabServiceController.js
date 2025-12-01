import Ride from "../models/Ride.js";
import Provider from "../models/Provider.js";
import cloudinary from "../config/cloudinary.js";

// Create a cab service (not a booking)
export const addCabService = async (req, res) => {
  try {
    const {
      name,
      description,
      pickup,
      drop,
      fare,
      distance,
      vehicleType,
      provider,
    } = req.body;

    // Upload images to Cloudinary
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { 
                folder: "Ausweb/cabs",
                resource_type: "image",
                allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary image upload error:", error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            stream.end(file.buffer);
          });
          uploadedImages.push(result.secure_url);
          console.log("✅ Image uploaded to Cloudinary:", result.secure_url);
        } catch (uploadError) {
          console.error("❌ Failed to upload image:", uploadError);
          // Continue with other images if one fails
        }
      }
    }

    // Create the cab service
    const cabService = await Ride.create({
      name: name || `${pickup} to ${drop}`,
      description: description || `Cab service from ${pickup} to ${drop}`,
      pickup,
      drop,
      fare: Number(fare),
      distance: distance ? Number(distance) : null,
      vehicleType: vehicleType || "cab",
      images: uploadedImages,
      provider,
      status: "confirmed", // Service is available
    });

    // If provider is specified, add this service to the provider's services
    if (provider) {
      await Provider.findByIdAndUpdate(
        provider,
        { $addToSet: { services: cabService._id } },
        { new: true }
      );
    }

    res.status(201).json({ success: true, ride: cabService });
  } catch (error) {
    console.error("❌ Error adding cab service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cab service
export const updateCabService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      pickup,
      drop,
      fare,
      distance,
      vehicleType,
      existingImages,
    } = req.body;

    // Handle existing images
    let imagesToKeep = [];
    if (existingImages) {
      try {
        imagesToKeep = JSON.parse(existingImages);
      } catch {
        imagesToKeep = Array.isArray(existingImages) ? existingImages : [];
      }
    }

    // Upload new images to Cloudinary
    const newUploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { 
                folder: "Ausweb/cabs",
                resource_type: "image",
                allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary image upload error:", error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            stream.end(file.buffer);
          });
          newUploadedImages.push(result.secure_url);
        } catch (uploadError) {
          console.error("❌ Failed to upload image:", uploadError);
        }
      }
    }

    // Combine existing and new images
    const allImages = [...imagesToKeep, ...newUploadedImages];

    const updatedService = await Ride.findByIdAndUpdate(
      id,
      {
        name,
        description,
        pickup,
        drop,
        fare: fare ? Number(fare) : undefined,
        distance: distance ? Number(distance) : undefined,
        vehicleType,
        images: allImages,
      },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ success: false, message: "Cab service not found" });
    }

    res.json({ success: true, ride: updatedService });
  } catch (error) {
    console.error("❌ Error updating cab service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete cab service
export const deleteCabService = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedService = await Ride.findByIdAndDelete(id);
    
    if (!deletedService) {
      return res.status(404).json({ success: false, message: "Cab service not found" });
    }

    // Remove from provider's services
    if (deletedService.provider) {
      await Provider.findByIdAndUpdate(
        deletedService.provider,
        { $pull: { services: id } }
      );
    }

    res.json({ success: true, message: "Cab service deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting cab service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

