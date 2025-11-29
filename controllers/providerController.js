import Provider from "../models/Provider.js";
import Cleaning from "../models/cleaningModel.js";
import Hotel from "../models/Hotel.js";
import Ride from "../models/Ride.js";
import cloudinary from "../config/cloudinary.js";

export const addProvider = async (req, res) => {
  try {
    const {
      name,
      description,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      rating,
      specialties,
      isActive,
    } = req.body;

    // Upload logo if provided
    let logoUrl = "";
    if (req.files && req.files.find((f) => f.fieldname === "logo")) {
      const logoFile = req.files.find((f) => f.fieldname === "logo");
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Ausweb/providers" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(logoFile.buffer);
      });
      logoUrl = result.secure_url;
    }

    // Upload images if provided
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.fieldname !== "logo") {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "Ausweb/providers" },
              (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(file.buffer);
          });
          uploadedImages.push(result.secure_url);
        }
      }
    }

    const newProvider = await Provider.create({
      name,
      description,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      rating: rating || 0,
      logo: logoUrl,
      images: uploadedImages,
      specialties: specialties ? (Array.isArray(specialties) ? specialties : JSON.parse(specialties)) : [],
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, provider: newProvider });
  } catch (error) {
    console.error("❌ Error adding provider:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProviders = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const providers = await Provider.find(query)
      .populate("services")
      .populate("user", "name email") // Optionally populate user data
      .sort({ createdAt: -1 });
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate("services")
      .populate("user", "name email");
    
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });

    // Fetch all service types for this provider
    const [cleaningServices, hotels, rides] = await Promise.all([
      Cleaning.find({ provider: provider._id }),
      Hotel.find({ provider: provider._id }),
      Ride.find({ provider: provider._id }),
    ]);

    res.json({ 
      success: true, 
      provider: {
        ...provider.toObject(),
        allServices: {
          cleaning: cleaningServices,
          hotels: hotels,
          rides: rides,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      rating,
      specialties,
      isActive,
    } = req.body;

    const existingImages = JSON.parse(req.body.existingImages || "[]");
    const existingLogo = req.body.existingLogo || "";

    // Upload new logo if provided
    let logoUrl = existingLogo;
    if (req.files && req.files.find((f) => f.fieldname === "logo")) {
      const logoFile = req.files.find((f) => f.fieldname === "logo");
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Ausweb/providers" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(logoFile.buffer);
      });
      logoUrl = result.secure_url;
    }

    // Upload new images
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.fieldname !== "logo") {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "Ausweb/providers" },
              (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(file.buffer);
          });
          uploadedImages.push(result.secure_url);
        }
      }
    }

    const updatedImages = [...existingImages, ...uploadedImages];

    const updateData = {
      name,
      description,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      rating,
      logo: logoUrl,
      images: updatedImages,
      specialties: specialties ? (Array.isArray(specialties) ? specialties : JSON.parse(specialties)) : [],
    };

    if (isActive !== undefined) {
      updateData.isActive = isActive === "true" || isActive === true;
    }

    const updated = await Provider.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated)
      return res.status(404).json({ success: false, message: "Provider not found" });

    res.json({ success: true, provider: updated });
  } catch (error) {
    console.error("❌ Error updating provider:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProvider = async (req, res) => {
  try {
    await Provider.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Provider deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add service to provider
export const addServiceToProvider = async (req, res) => {
  try {
    const { providerId, serviceId } = req.body;
    const provider = await Provider.findByIdAndUpdate(
      providerId,
      { $addToSet: { services: serviceId } },
      { new: true }
    );
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });
    res.json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove service from provider
export const removeServiceFromProvider = async (req, res) => {
  try {
    const { providerId, serviceId } = req.body;
    const provider = await Provider.findByIdAndUpdate(
      providerId,
      { $pull: { services: serviceId } },
      { new: true }
    );
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });
    res.json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all services (cleaning, hotel, ride) for a provider
export const getProviderAllServices = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    if (!providerId) {
      return res.status(400).json({ success: false, message: "Provider ID is required" });
    }

    // Fetch all service types for this provider
    const [cleaningServices, hotels, rides] = await Promise.all([
      Cleaning.find({ provider: providerId }).populate("provider"),
      Hotel.find({ provider: providerId }).populate("provider"),
      Ride.find({ provider: providerId }).populate("provider"),
    ]);

    res.json({ 
      success: true, 
      services: {
        cleaning: cleaningServices,
        hotels: hotels,
        rides: rides,
      },
      counts: {
        cleaning: cleaningServices.length,
        hotels: hotels.length,
        rides: rides.length,
        total: cleaningServices.length + hotels.length + rides.length,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

