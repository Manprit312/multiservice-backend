import express from "express";
import multer from "multer";
import {
  addCabService,
  updateCabService,
  deleteCabService,
} from "../controllers/cabServiceController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create cab service
router.post("/add", upload.array("images"), addCabService);

// Update cab service
router.put("/:id", upload.array("images"), updateCabService);

// Delete cab service
router.delete("/:id", deleteCabService);

export default router;

