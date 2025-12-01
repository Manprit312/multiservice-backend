import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Decode Firebase JWT token (basic verification)
// For production, use Firebase Admin SDK for proper verification
const decodeFirebaseToken = (idToken) => {
  try {
    // Firebase ID tokens are JWTs with 3 parts: header.payload.signature
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Basic validation - check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    // Verify it's a Firebase token (has the right issuer)
    if (payload.iss && !payload.iss.includes('firebase')) {
      return null;
    }

    return {
      uid: payload.user_id || payload.sub,
      email: payload.email,
      displayName: payload.name,
      photoUrl: payload.picture,
      emailVerified: payload.email_verified || false,
    };
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};

// Verify Firebase token using Firebase REST API (fallback)
export const verifyFirebaseToken = async (idToken) => {
  try {
    // First try to decode the token (faster, no API call)
    const decoded = decodeFirebaseToken(idToken);
    if (decoded) {
      return decoded;
    }

    // Fallback to API verification if decode fails
    const apiKey = process.env.FIREBASE_API_KEY || "AIzaSyCdALu2r_nseJls3hjRa2A3_6qE3EXwJGE";
    
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          idToken: idToken 
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Firebase token verification failed:", response.status, errorData);
      return null;
    }

    const data = await response.json();
    
    if (data.users && data.users.length > 0) {
      const user = data.users[0];
      return {
        uid: user.localId || user.uid,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return null;
  }
};

export const syncFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid, name, email, image, googleId } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const firebaseUser = await verifyFirebaseToken(token);

    if (!firebaseUser) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Check if user exists by firebaseUid or email
    let user = await User.findOne({
      $or: [{ firebaseUid: firebaseUser.uid || firebaseUid }, { email: firebaseUser.email || email }],
    });

    if (user) {
      // Update existing user
      user.firebaseUid = firebaseUser.uid || firebaseUid || user.firebaseUid;
      user.name = name || firebaseUser.displayName || user.name;
      user.email = firebaseUser.email || email || user.email;
      user.image = image || firebaseUser.photoUrl || user.image;
      if (googleId) user.googleId = googleId;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: name || firebaseUser.displayName || "User",
        email: firebaseUser.email || email,
        firebaseUid: firebaseUser.uid || firebaseUid,
        image: image || firebaseUser.photoUrl,
        googleId: googleId,
        role: "user", // Default role
        password: undefined, // No password for Firebase users
      });
    }

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("Sync user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const firebaseUser = await verifyFirebaseToken(token);

    if (!firebaseUser) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        provider: user.provider, // Include provider reference
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const firebaseUser = await verifyFirebaseToken(token);

    if (!firebaseUser) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update user fields
    const { name } = req.body;
    if (name) {
      user.name = name;
    }

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role (only superadmin can do this, or user can update their own role to admin if they have a provider)
export const updateUserRole = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const firebaseUser = await verifyFirebaseToken(token);

    if (!firebaseUser) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const requestingUser = await User.findOne({ firebaseUid: firebaseUser.uid });
    if (!requestingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { userId, role } = req.body;

    // Only superadmin can update any user's role
    // Regular users can't update roles
    if (requestingUser.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Only superadmin can update user roles" });
    }

    if (!["user", "admin", "superadmin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: "User to update not found" });
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    res.json({
      success: true,
      message: "User role updated successfully",
      user: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

