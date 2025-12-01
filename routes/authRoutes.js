import express from "express";
import { register, login, googleAuth } from "../controllers/authController.js";
import { syncFirebaseUser, getUser, updateUser, updateUserRole } from "../controllers/firebaseAuthController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/sync", syncFirebaseUser);
router.get("/user", getUser);
router.put("/user", updateUser); // Update user profile
router.put("/user/role", updateUserRole); // Update user role

export default router;
