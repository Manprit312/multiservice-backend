import express from "express";
import multer from "multer";
import {
  addCleaningBanner,
  getCleaningBanners,
  getCleaningBannerById,
  updateCleaningBanner,
  deleteCleaningBanner,
} from "../controllers/cleaningBannerController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add banner
router.post("/add", upload.single("image"), addCleaningBanner);

// Get all banners
router.get("/", getCleaningBanners);

// Get one banner
router.get("/:id", getCleaningBannerById);

// Update banner
router.put("/:id", upload.single("image"), updateCleaningBanner);

// Delete banner
router.delete("/:id", deleteCleaningBanner);

export default router;
