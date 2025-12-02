import User from "../models/User.js";

/**
 * @desc Get all users (superadmin only)
 * @route GET /api/users
 */
export const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    
    // Build query
    const query = {};
    if (role && role !== "all") {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password") // Exclude password from response
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("-password")
      .populate("provider", "name email");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update user
 * @route PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive !== "undefined") updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete user
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent deleting yourself
    if (req.user && req.user.id === id) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(id);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get user statistics
 * @route GET /api/users/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalSuperadmins = await User.countDocuments({ role: "superadmin" });
    const totalRegularUsers = await User.countDocuments({ role: "user" });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalSuperadmins,
        totalRegularUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

