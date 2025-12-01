import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Make optional for Google OAuth users
    googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
    image: { type: String }, // Profile image from Google
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    firebaseUid: { type: String, unique: true, sparse: true }, // Firebase user ID
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" }, // Reference to provider
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only hash password if it's modified and exists (not for Google OAuth users)
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
