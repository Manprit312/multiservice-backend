import express from "express";
import multer from "multer";
import {
  addProvider,
  getProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
  addServiceToProvider,
  removeServiceFromProvider,
  getProviderAllServices,
} from "../controllers/providerController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Specific routes (must come before parameterized routes)
router.post("/add", upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 10 }]), addProvider);
router.post("/add-service", addServiceToProvider);
router.post("/remove-service", removeServiceFromProvider);

// Get all providers
router.get("/", getProviders);

// Get all services for a provider (must come before /:id)
router.get("/:providerId/services/all", getProviderAllServices);

// Parameterized routes (must come after specific routes)
router.get("/:id", getProviderById);
router.put("/:id", upload.fields([{ name: "logo", maxCount: 1 }, { name: "images", maxCount: 10 }]), updateProvider);
router.delete("/:id", deleteProvider);

export default router;

