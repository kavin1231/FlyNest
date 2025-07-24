import Contact from "../models/Contact.js";
import { isItAdmin, isItCustomer } from "./userController.js";

// Create a new contact/inquiry – Customer Only
export async function createContact(req, res) {
  if (!isItCustomer(req)) return res.status(403).json({ error: "Only customers can send inquiries" });

  try {
    const contact = new Contact({
      ...req.body,
      userId: req.user.id,
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all inquiries – Admin Only
export async function getAllContacts(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can view contacts" });

  try {
    const contacts = await Contact.find().populate("userId", "name email");
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get a specific inquiry – Admin Only
export async function getContactById(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can view this contact" });

  try {
    const contact = await Contact.findById(req.params.id).populate("userId", "name email");
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete an inquiry – Admin Only
export async function deleteContact(req, res) {
  if (!isItAdmin(req)) return res.status(403).json({ error: "Only admins can delete contacts" });

  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
