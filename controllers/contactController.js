import Contact from "../models/Contact.js";

// POST: Add new contact message
export const createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !email || !message)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const contact = await Contact.create({ firstName, lastName, email, message });
    res.status(201).json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET: Fetch all contact messages (for admin)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
