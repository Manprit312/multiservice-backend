import express from "express";
import multer from "multer";
import {
  addHomeBanner,
  getHomeBanners,
  getHomeBannerById,
  updateHomeBanner,
  deleteHomeBanner,
} from "../controllers/homeBannerController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), addHomeBanner);
router.get("/", getHomeBanners);
router.get("/:id", getHomeBannerById);
router.put("/:id", upload.single("image"), updateHomeBanner);
router.delete("/:id", deleteHomeBanner);

export default router;
