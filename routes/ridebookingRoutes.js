import express from "express";
import { bookRide, getRides, getRideById } from "../controllers/bookingController.js";

const router = express.Router();

router.get("/", getRides);
router.get("/:id", getRideById);
router.post("/", bookRide);

export default router;
