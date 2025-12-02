import Settings from "../models/Settings.js";

/**
 * @desc Get settings
 * @route GET /api/settings
 */
export const getSettings = async (req, res) => {
  try {
    // Get or create default settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings
      settings = await Settings.create({
        siteName: "ServiHub",
        siteEmail: "admin@servihub.com",
        maintenanceMode: false,
        allowRegistrations: true,
        requireEmailVerification: false,
        maxFileSize: 5,
        allowedFileTypes: "jpg,jpeg,png,gif,webp,pdf",
      });
    }

    res.json({ success: true, settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update settings (superadmin only)
 * @route PUT /api/settings
 */
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings if they don't exist
      settings = await Settings.create(req.body);
    } else {
      // Update existing settings
      settings = await Settings.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, upsert: true }
      );
    }

    res.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

