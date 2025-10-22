import express from "express";
import multer from "multer";
import {
  addCleaning,
  getCleanings,
  getCleaningById,
  updateCleaning,
  deleteCleaning,
} from "../controllers/cleaningController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add", upload.array("images"), addCleaning);
router.get("/", getCleanings);
router.get("/:id", getCleaningById);
router.put("/:id", upload.array("images"), updateCleaning);
router.delete("/:id", deleteCleaning);

export default router;
