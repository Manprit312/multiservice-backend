import User from "../models/User.js";
import Provider from "../models/Provider.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password,
      // Provider info
      providerName,
      phone,
      address,
      city,
      state,
      pincode,
      description,
    } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

    // Create user first
    const user = await User.create({ name, email, password });

    // Automatically create a provider for the user with provided info
    try {
      const provider = await Provider.create({
        name: providerName || name, // Use provider name or fallback to user name
        email: email, // Use user's email
        phone: phone || "",
        address: address || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        description: description || `Service provider account for ${name}`,
        isActive: true,
        user: user._id, // Link provider to user
      });

      // Link user to provider
      user.provider = provider._id;
      await user.save();

      res.json({ 
        success: true,
        message: "User registered and provider created successfully", 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          provider: provider._id,
        },
        provider: {
          _id: provider._id,
          name: provider.name,
          email: provider.email,
        }
      });
    } catch (providerError) {
      // If provider creation fails, still return user but log the error
      console.error("Provider creation error:", providerError);
      // Don't fail the registration, user is created successfully
      res.json({ 
        success: true,
        message: "User registered successfully. Provider creation had an issue.", 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        warning: "Provider creation failed. Please create provider manually."
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, image } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if user exists by email or googleId
    let user = await User.findOne({ 
      $or: [{ email }, { googleId }] 
    });

    if (user) {
      // Update user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.image = image || user.image;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        image,
        password: undefined, // No password for Google OAuth users
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
