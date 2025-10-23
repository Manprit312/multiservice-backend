import express from "express";
import { createContact, getAllContacts } from "../controllers/contactController.js";

const router = express.Router();

router.post("/", createContact);   // POST /api/contacts
router.get("/", getAllContacts);   // GET /api/contacts (admin)

export default router;
